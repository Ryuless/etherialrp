const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doc, getDoc } = require('firebase/firestore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Menampilkan profil karakter Anda.'),
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

        // Create main profile embed
        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`⚔️ ${character.name}`)
            .addFields(
                { name: 'Ras', value: character.race, inline: true },
                { name: 'Pekerjaan', value: character.job, inline: true },
                { name: 'Level', value: character.level.toString(), inline: true },
                { name: 'Pengalaman', value: `${character.experience} / ${character.nextLevelExp}`, inline: true },
                { name: 'HP', value: `${character.currentHP} / ${character.maxHP}`, inline: true },
                { name: 'MP', value: `${character.currentMP} / ${character.maxMP}`, inline: true },
                { name: 'Stat Points', value: character.statPoints.toString(), inline: true }
            )
            .addFields(
                { name: '📊 Main Stats', value: 
                    `STR: ${character.mainStats.STR} | AGI: ${character.mainStats.AGI} | VIT: ${character.mainStats.VIT}\n` +
                    `INT: ${character.mainStats.INT} | DEX: ${character.mainStats.DEX} | LUK: ${character.mainStats.LUK}` }
            )
            .addFields(
                { name: '🎯 Sub Stats', value:
                    `ATK: ${character.subStats.ATK} | MATK: ${character.subStats.MATK}\n` +
                    `DEF: ${character.subStats.DEF} | MDEF: ${character.subStats.MDEF}\n` +
                    `HIT: ${character.subStats.HIT} | CRITICAL: ${character.subStats.CRITICAL}\n` +
                    `FLEE: ${character.subStats.FLEE} | ASPD: ${character.subStats.ASPD}` }
            )
            .addFields(
                { name: '💰 Gold', value: character.gold.toString(), inline: true },
                { name: '⚖️ Weight', value: `${character.currentWeight}/${character.weightLimit}`, inline: true }
            )
            .setFooter({ text: 'Gunakan /stats untuk detail lengkap atau /inventory untuk melihat inventaris' });

        await interaction.reply({ embeds: [embed] });
    },
};
