const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { doc, getDoc } = require('firebase/firestore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skills')
        .setDescription('Menampilkan skill yang tersedia untuk karakter Anda.'),
    async execute(interaction, db) {
        const userId = interaction.user.id;
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

        // Get all skills from database
        const skillsRef = doc(db, 'skills', 'list');
        let allSkills = {};

        // Try to get skills for the character's job
        const jobSkillIds = character.skills || [];

        if (jobSkillIds.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('⚔️ Skill Anda')
                .setDescription('Anda belum memiliki skill. Mulai petualangan untuk mendapatkan skill baru!');
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Create skills list embed
        const embed = new EmbedBuilder()
            .setColor('Purple')
            .setTitle(`⚔️ Skill ${character.name}`)
            .setDescription(`Job: ${character.job} | Level: ${character.level}`);

        let skillList = '';
        
        for (const skillId of jobSkillIds) {
            const skillRef = doc(db, 'skills', skillId);
            const skillSnap = await getDoc(skillRef);
            
            if (skillSnap.exists()) {
                const skill = skillSnap.data();
                skillList += 
                    `**${skill.name}**\n` +
                    `└─ ${skill.description}\n` +
                    `└─ Tipe: ${skill.type} | Cooldown: ${skill.cooldown / 1000}s\n\n`;
            }
        }

        embed.addFields({
            name: 'Skill Tersedia',
            value: skillList || 'Tidak ada skill'
        });

        embed.setFooter({ text: 'Gunakan /useSkill untuk menggunakan skill dalam pertarungan' });

        await interaction.reply({ embeds: [embed] });
    },
};
