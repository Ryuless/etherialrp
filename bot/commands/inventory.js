const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doc, getDoc } = require('firebase/firestore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Menampilkan inventaris karakter Anda.'),
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
        const inventory = character.inventory || [];
        const equipment = character.equipment || {};

        // Create inventory embed
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`🎒 Inventaris - ${character.name}`)
            .addFields(
                {
                    name: '💰 Emas',
                    value: character.gold.toString(),
                    inline: true
                },
                {
                    name: '⚖️ Berat',
                    value: `${character.currentWeight}/${character.weightLimit}`,
                    inline: true
                }
            );

        // Group items by type
        const weapons = inventory.filter(item => item.type === 'weapon');
        const armor = inventory.filter(item => item.type === 'armor');
        const shields = inventory.filter(item => item.type === 'shield');
        const consumables = inventory.filter(item => item.type === 'consumable');

        // Equipment section
        if (Object.keys(equipment).length > 0) {
            let equipmentList = '';
            for (const [slot, item] of Object.entries(equipment)) {
                equipmentList += `**${slot}**: ${item.name}\n`;
            }
            embed.addFields({
                name: '⚙️ Perlengkapan',
                value: equipmentList || 'Tidak ada'
            });
        }

        // Weapons
        if (weapons.length > 0) {
            let weaponList = '';
            for (const item of weapons) {
                weaponList += `**${item.name}** (Qty: ${item.quantity})\n`;
            }
            embed.addFields({
                name: '🗡️ Senjata',
                value: weaponList || 'Tidak ada'
            });
        }

        // Armor
        if (armor.length > 0) {
            let armorList = '';
            for (const item of armor) {
                armorList += `**${item.name}** (Qty: ${item.quantity})\n`;
            }
            embed.addFields({
                name: '🛡️ Armor',
                value: armorList || 'Tidak ada'
            });
        }

        // Consumables
        if (consumables.length > 0) {
            let consumableList = '';
            for (const item of consumables) {
                consumableList += `**${item.name}** (Qty: ${item.quantity})\n`;
            }
            embed.addFields({
                name: '🧪 Consumable',
                value: consumableList || 'Tidak ada'
            });
        }

        if (inventory.length === 0) {
            embed.addFields({
                name: 'Items',
                value: 'Inventaris kosong'
            });
        }

        embed.setFooter({ text: 'Gunakan /equip <item> untuk memakai item atau /drop <item> untuk membuang' });

        await interaction.reply({ embeds: [embed] });
    },
};
