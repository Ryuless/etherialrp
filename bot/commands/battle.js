const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { doc, getDoc, updateDoc } = require('firebase/firestore');
const { Battle } = require('../utils/battleSystem');

// Temporary battle storage (in production, use a proper database)
const activeBattles = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Memulai pertarungan dengan pemain lain.')
        .addUserOption(option =>
            option.setName('opponent')
                .setDescription('Pemain yang ingin Anda lawan')
                .setRequired(true)),
    async execute(interaction, db) {
        const opponentUser = interaction.options.getUser('opponent');
        const attackerId = interaction.user.id;
        const defenderId = opponentUser.id;

        // Check if battle already exists
        const battleId = `${attackerId}_vs_${defenderId}`;
        if (activeBattles.has(battleId)) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Battle Sudah Berlangsung')
                .setDescription('Pertarungan dengan pemain ini sedang berlangsung!');
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            // Get both characters
            const attackerRef = doc(db, 'characters', attackerId);
            const defenderRef = doc(db, 'characters', defenderId);

            const attackerSnap = await getDoc(attackerRef);
            const defenderSnap = await getDoc(defenderRef);

            if (!attackerSnap.exists() || !defenderSnap.exists()) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❌ Error')
                    .setDescription('Salah satu atau kedua pemain tidak memiliki karakter!');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Create battle copies (so we don't modify original data)
            const attacker = { ...attackerSnap.data() };
            const defender = { ...defenderSnap.data() };

            // Initialize battle
            const battle = new Battle(attacker, defender);
            activeBattles.set(battleId, {
                battle: battle,
                attackerId: attackerId,
                defenderId: defenderId,
                currentTurn: 'attacker',
                messageId: null
            });

            // Create initial battle embed
            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('⚔️ PERTARUNGAN DIMULAI!')
                .setDescription(`${attacker.name} (${attacker.job}) vs ${defender.name} (${defender.job})`)
                .addFields(
                    {
                        name: `${attacker.name} (HP: ${attacker.currentHP}/${attacker.maxHP})`,
                        value: `Level ${attacker.level}`,
                        inline: true
                    },
                    {
                        name: `${defender.name} (HP: ${defender.currentHP}/${defender.maxHP})`,
                        value: `Level ${defender.level}`,
                        inline: true
                    }
                )
                .addFields({
                    name: `🎯 Giliran: ${attacker.name}`,
                    value: 'Pilih aksi Anda'
                });

            // Create action buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`attack_${battleId}`)
                        .setLabel('Serang (Normal Attack)')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`skill_${battleId}`)
                        .setLabel('Gunakan Skill')
                        .setStyle(ButtonStyle.Success)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`defend_${battleId}`)
                        .setLabel('Pertahanan')
                        .setStyle(ButtonStyle.Secondary)
                );

            const message = await interaction.reply({ embeds: [embed], components: [row] });
            activeBattles.get(battleId).messageId = message.id;

        } catch (error) {
            console.error('Battle error:', error);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Error')
                .setDescription('Terjadi kesalahan saat memulai pertarungan');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
