const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createAdminAccount } = require('../utils/adminManager');

// Temporary storage for admin creation (in production, use Discord modals)
const adminSetupData = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin-setup')
        .setDescription('[OWNER ONLY] Setup admin account untuk dashboard.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Username untuk admin account')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(20))
        .addStringOption(option =>
            option.setName('password')
                .setDescription('Password untuk admin account (secure)')
                .setRequired(true)
                .setMinLength(8))
        .addStringOption(option =>
            option.setName('email')
                .setDescription('Email untuk admin account')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('role')
                .setDescription('Role admin')
                .setRequired(false)
                .addChoices(
                    { name: 'Super Admin', value: 'super_admin' },
                    { name: 'Admin', value: 'admin' },
                    { name: 'Moderator', value: 'moderator' }
                )),
    async execute(interaction, db) {
        // Check if user is bot owner (hardcoded for security)
        const OWNER_ID = '1116692281773260842'; // Your Discord ID
        
        if (interaction.user.id !== OWNER_ID) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Unauthorized')
                .setDescription('Hanya bot owner yang dapat membuat admin account');
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const username = interaction.options.getString('username');
        const password = interaction.options.getString('password');
        const email = interaction.options.getString('email');
        const role = interaction.options.getString('role') || 'admin';

        try {
            const result = await createAdminAccount(db, username, password, email, role);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ Admin Account Dibuat')
                .addFields(
                    { name: 'Username', value: username, inline: true },
                    { name: 'Email', value: email, inline: true },
                    { name: 'Role', value: role.replace('_', ' ').toUpperCase(), inline: true },
                    { name: 'Dashboard Link', value: 'Akan ditampilkan setelah bot ready', inline: false }
                )
                .setFooter({ text: 'Simpan informasi ini di tempat aman' });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error creating admin:', error);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Error')
                .setDescription(`Gagal membuat admin account: ${error.message}`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
