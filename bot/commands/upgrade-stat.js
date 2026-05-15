const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doc, getDoc, updateDoc } = require('firebase/firestore');
const { calculateSubStats, calculateMaxHP, calculateMaxMP } = require('../utils/statsCalculator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upgrade-stat')
        .setDescription('Tingkatkan salah satu stat utama Anda.')
        .addStringOption(option =>
            option.setName('stat')
                .setDescription('Stat yang ingin ditingkatkan')
                .setRequired(true)
                .addChoices(
                    { name: 'STR (Kekuatan)', value: 'STR' },
                    { name: 'AGI (Kelincahan)', value: 'AGI' },
                    { name: 'VIT (Vitalitas)', value: 'VIT' },
                    { name: 'INT (Intelijen)', value: 'INT' },
                    { name: 'DEX (Ketangkasan)', value: 'DEX' },
                    { name: 'LUK (Keberuntungan)', value: 'LUK' }
                ))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Jumlah poin (default: 1)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)),
    async execute(interaction, db) {
        const userId = interaction.user.id;
        const stat = interaction.options.getString('stat');
        const amount = interaction.options.getInteger('amount') || 1;

        try {
            // Get character
            const charRef = doc(db, 'characters', userId);
            const charSnap = await getDoc(charRef);

            if (!charSnap.exists()) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❌ Karakter Tidak Ditemukan')
                    .setDescription('Anda belum memiliki karakter. Silakan daftar dengan `/register`');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const character = charSnap.data();

            // Check if enough stat points
            if (character.statPoints < amount) {
                const embed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setTitle('⚠️ Stat Points Tidak Cukup')
                    .setDescription(`Anda memiliki ${character.statPoints} Stat Points, tetapi memerlukan ${amount}`)
                    .addFields(
                        { name: 'Stat Points Saat Ini', value: character.statPoints.toString(), inline: true }
                    );
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Update main stats
            const newMainStats = { ...character.mainStats };
            newMainStats[stat] += amount;

            // Calculate new sub-stats
            const newSubStats = calculateSubStats(newMainStats);

            // Recalculate HP and MP if VIT or INT changed
            let newMaxHP = character.maxHP;
            let newMaxMP = character.maxMP;

            if (stat === 'VIT') {
                newMaxHP = calculateMaxHP(character.maxHP + (50 * amount), newMainStats.VIT);
                // Don't change current HP if it's higher than new max
                const newCurrentHP = Math.min(character.currentHP, newMaxHP);
                
                character.maxHP = newMaxHP;
                character.currentHP = newCurrentHP;
            }

            if (stat === 'INT') {
                newMaxMP = calculateMaxMP(character.maxMP + (10 * amount), newMainStats.INT);
                // Don't change current MP if it's higher than new max
                const newCurrentMP = Math.min(character.currentMP, newMaxMP);
                
                character.maxMP = newMaxMP;
                character.currentMP = newCurrentMP;
            }

            // Update database
            await updateDoc(charRef, {
                mainStats: newMainStats,
                subStats: newSubStats,
                statPoints: character.statPoints - amount,
                maxHP: character.maxHP,
                currentHP: character.currentHP,
                maxMP: character.maxMP,
                currentMP: character.currentMP,
                weightLimit: 100 + (newMainStats.STR * 30)
            });

            // Create success embed
            const statNames = {
                STR: 'Kekuatan',
                AGI: 'Kelincahan',
                VIT: 'Vitalitas',
                INT: 'Intelijen',
                DEX: 'Ketangkasan',
                LUK: 'Keberuntungan'
            };

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ Stat Berhasil Ditingkatkan!')
                .addFields(
                    { name: 'Stat yang Ditingkatkan', value: `${statNames[stat]} (${stat})`, inline: true },
                    { name: 'Peningkatan', value: `+${amount}`, inline: true },
                    { name: 'Nilai Baru', value: newMainStats[stat].toString(), inline: true }
                );

            // Show stat changes
            if (stat === 'VIT') {
                embed.addFields(
                    { name: 'HP Max', value: `${character.maxHP} → ${newMaxHP}`, inline: true }
                );
            }

            if (stat === 'INT') {
                embed.addFields(
                    { name: 'MP Max', value: `${character.maxMP} → ${newMaxMP}`, inline: true }
                );
            }

            // Show remaining stat points
            embed.addFields(
                { name: 'Stat Points Tersisa', value: `${character.statPoints - amount} / ${character.statPoints}`, inline: true }
            );

            // Show affected sub-stats
            const affectedStats = getAffectedSubStats(stat);
            if (affectedStats.length > 0) {
                const subStatChanges = affectedStats.map(subStat => {
                    const oldValue = character.subStats[subStat];
                    const newValue = newSubStats[subStat];
                    return `${subStat}: ${oldValue} → ${newValue}`;
                }).join('\n');

                embed.addFields(
                    { name: '📊 Sub-Stats Terpengaruh', value: subStatChanges }
                );
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error upgrading stat: ", error);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Error')
                .setDescription('Terjadi kesalahan saat meningkatkan stat. Silakan coba lagi.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};

/**
 * Get sub-stats affected by a main stat
 * @param {string} stat - Main stat (STR, AGI, etc)
 * @returns {array} Array of affected sub-stats
 */
function getAffectedSubStats(stat) {
    const statMap = {
        STR: ['ATK'],
        AGI: ['FLEE', 'ASPD'],
        VIT: ['DEF'],
        INT: ['MATK', 'MDEF'],
        DEX: ['HIT', 'MDEF'],
        LUK: ['CRITICAL', 'FLEE', 'HIT']
    };
    return statMap[stat] || [];
}
