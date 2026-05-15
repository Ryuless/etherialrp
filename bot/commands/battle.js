const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doc, getDoc, updateDoc } = require('firebase/firestore');
const { buildMonsterCombatant, buildPlayerCombatant, resolveAttack, applyBattleReward } = require('../utils/encounterSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Memulai pertarungan dengan monster yang sedang Anda temui.'),
    async execute(interaction, db) {
        try {
            const userId = interaction.user.id;
            const charRef = doc(db, 'characters', userId);
            const charSnap = await getDoc(charRef);

            if (!charSnap.exists()) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❌ Error')
                    .setDescription('Anda belum memiliki karakter!');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const character = charSnap.data();
            const encounter = character.activeEncounter;

            if (!encounter || !encounter.monster) {
                const embed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setTitle('⚠️ Tidak Ada Monster')
                    .setDescription('Anda belum bertemu monster. Gunakan `/explore` di area liar untuk memicu encounter terlebih dahulu.');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const player = buildPlayerCombatant(character);
            const monster = buildMonsterCombatant(encounter.monster);
            const battleLogs = [];
            let turnCount = 1;

            while (player.currentHP > 0 && monster.currentHP > 0 && turnCount <= 12) {
                const playerTurn = resolveAttack(player, monster);
                battleLogs.push(`**Giliran ${turnCount}**: ${playerTurn.log}`);

                if (playerTurn.hit) {
                    monster.currentHP = Math.max(0, monster.currentHP - playerTurn.damage);
                }

                if (monster.currentHP <= 0) {
                    break;
                }

                const monsterTurn = resolveAttack(monster, player);
                battleLogs.push(`**Giliran ${turnCount}**: ${monsterTurn.log}`);

                if (monsterTurn.hit) {
                    player.currentHP = Math.max(0, player.currentHP - monsterTurn.damage);
                }

                turnCount += 1;
            }

            const playerWon = monster.currentHP <= 0 && player.currentHP > 0;
            const updatedCharacter = {
                ...character,
                currentHP: player.currentHP
            };

            if (playerWon) {
                const rewardedCharacter = applyBattleReward(updatedCharacter, encounter.monster);
                rewardedCharacter.currentHP = Math.min(rewardedCharacter.currentHP, rewardedCharacter.maxHP);
                await updateDoc(charRef, {
                    currentHP: rewardedCharacter.currentHP,
                    currentMP: rewardedCharacter.currentMP ?? character.currentMP,
                    experience: rewardedCharacter.experience,
                    gold: rewardedCharacter.gold,
                    level: rewardedCharacter.level,
                    nextLevelExp: rewardedCharacter.nextLevelExp,
                    statPoints: rewardedCharacter.statPoints,
                    maxHP: rewardedCharacter.maxHP,
                    maxMP: rewardedCharacter.maxMP,
                    activeEncounter: null
                });
            } else {
                await updateDoc(charRef, {
                    currentHP: updatedCharacter.currentHP,
                    activeEncounter: null
                });
            }

            const embed = new EmbedBuilder()
                .setColor(playerWon ? 'Green' : 'Red')
                .setTitle(playerWon ? '⚔️ Monster Dikalahkan!' : '💀 Pertarungan Berakhir')
                .setDescription(
                    playerWon
                        ? `Anda berhasil mengalahkan ${monster.name}.`
                        : `Anda kalah melawan ${monster.name}.`
                )
                .addFields(
                    {
                        name: `${player.name} (HP: ${player.currentHP}/${player.maxHP})`,
                        value: `Level ${player.level}`,
                        inline: true
                    },
                    {
                        name: `${monster.name} (HP: ${monster.currentHP}/${monster.maxHP})`,
                        value: `Level ${monster.level}`,
                        inline: true
                    }
                )
                .addFields({
                    name: 'Hasil Pertempuran',
                    value: battleLogs.slice(-6).join('\n') || 'Tidak ada log pertarungan.'
                });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Monster battle error:', error);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Error')
                .setDescription('Terjadi kesalahan saat memulai pertarungan monster');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
