const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doc, getDoc } = require('firebase/firestore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Menampilkan detail lengkap statistik karakter Anda.'),
    async execute(interaction, db) {
        const userId = interaction.user.id;
        const docRef = doc(db, 'characters', userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Karakter Tidak Ditemukan')
                .setDescription('Anda belum memiliki karakter. Silakan daftar dengan `/register`');
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const character = docSnap.data();
        const stats = character.mainStats;
        const subStats = character.subStats;

        // Create detailed stats embed
        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle(`📊 Statistik Lengkap - ${character.name}`)
            .addFields(
                {
                    name: '🗡️ STAT UTAMA',
                    value: 
                        `**STR (Strength)**: ${stats.STR}\n` +
                        `└─ Serangan melee +${stats.STR}, Limit berat +${stats.STR * 30}\n\n` +
                        `**AGI (Agility)**: ${stats.AGI}\n` +
                        `└─ Flee +${stats.AGI}, Defense +${Math.floor(stats.AGI / 5)}\n\n` +
                        `**VIT (Vitality)**: ${stats.VIT}\n` +
                        `└─ Max HP +${Math.floor(character.maxHP * (stats.VIT * 0.01))}%, Defense +${Math.floor(stats.VIT / 2)}\n\n` +
                        `**INT (Intelligence)**: ${stats.INT}\n` +
                        `└─ Magic ATK +${Math.floor(stats.INT * 1.5)}, Max SP +${Math.floor(character.maxSP * (stats.INT * 0.01))}%\n\n` +
                        `**DEX (Dexterity)**: ${stats.DEX}\n` +
                        `└─ Serangan range +${stats.DEX}, Hit +${stats.DEX}\n\n` +
                        `**LUK (Luck)**: ${stats.LUK}\n` +
                        `└─ Critical +${(stats.LUK * 0.3).toFixed(1)}%, Semua hit +${Math.floor(stats.LUK / 3)}`
                }
            )
            .addFields(
                {
                    name: '⚡ SUB STAT',
                    value:
                        `**ATK**: ${subStats.ATK}\n` +
                        `**MATK**: ${subStats.MATK}\n` +
                        `**DEF**: ${subStats.DEF}\n` +
                        `**MDEF**: ${subStats.MDEF}\n` +
                        `**HIT**: ${subStats.HIT}\n` +
                        `**CRITICAL**: ${subStats.CRITICAL}\n` +
                        `**FLEE**: ${subStats.FLEE}\n` +
                        `**ASPD**: ${subStats.ASPD}`
                }
            )
            .addFields(
                {
                    name: '❤️ KONDISI',
                    value:
                        `**HP**: ${character.currentHP} / ${character.maxHP}\n` +
                        `**SP**: ${character.currentSP} / ${character.maxSP}\n` +
                        `**Berat**: ${character.currentWeight} / ${character.weightLimit} (${Math.floor((character.currentWeight / character.weightLimit) * 100)}%)`
                }
            )
            .setFooter({ text: 'Gunakan /skills untuk melihat skill yang tersedia' });

        await interaction.reply({ embeds: [embed] });
    },
};
