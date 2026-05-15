const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doc, getDoc, collection, getDocs } = require('firebase/firestore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription('Menjelajahi lokasi dan mencari musuh.')
        .addStringOption(option =>
            option.setName('region')
                .setDescription('Region yang ingin dijelajahi')
                .setRequired(true)
                .addChoices(
                    { name: 'Kota Utama', value: 'Kota_Utama' },
                    { name: 'Alam Mistik', value: 'Alam_Mistik' },
                    { name: 'Dataran Keras', value: 'Dataran_Keras' },
                    { name: 'Kawasan Bayangan', value: 'Kawasan_Bayangan' },
                    { name: 'Samudra', value: 'Samudra' },
                    { name: 'Puncak Langit', value: 'Puncak_Langit' }
                )),
    async execute(interaction, db) {
        const userId = interaction.user.id;
        const regionId = interaction.options.getString('region');

        try {
            // Get character data
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

            // Get region data from database
            const mapRef = doc(db, 'maps', regionId);
            const mapSnap = await getDoc(mapRef);

            if (!mapSnap.exists()) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❌ Region Tidak Ditemukan')
                    .setDescription('Region tidak ditemukan di database.');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const mapData = mapSnap.data();
            const locations = mapData.locations || [];

            if (locations.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setTitle('⚠️ Region Kosong')
                    .setDescription('Region ini tidak memiliki lokasi yang dapat dijelajahi.');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Pick random location from the region
            const randomLocation = locations[Math.floor(Math.random() * locations.length)];

            // Get all monsters from database
            const monstersCollection = collection(db, 'monsters');
            const monstersSnap = await getDocs(monstersCollection);
            const allMonsters = [];
            monstersSnap.forEach(doc => {
                allMonsters.push(doc.data());
            });

            if (allMonsters.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setTitle('⚠️ Tidak Ada Musuh')
                    .setDescription('Tidak ada musuh di area ini saat ini.');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Pick random monster
            const encounter = allMonsters[Math.floor(Math.random() * allMonsters.length)];

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('🎲 Perjumpaan di Lokasi!')
                .setDescription(`Saat menjelajahi ${randomLocation.replace(/_/g, ' ')}, Anda menemukan...`)
                .addFields(
                    {
                        name: `🧟 ${encounter.name}`,
                        value: `Level: ${encounter.level}\nHP: ${encounter.hp}\nATK: ${encounter.atk}\nElement: ${encounter.element}`,
                        inline: true
                    },
                    {
                        name: `⚔️ ${character.name}`,
                        value: `Level: ${character.level}\nHP: ${character.currentHP}/${character.maxHP}\nATK: ${character.subStats.ATK}`,
                        inline: true
                    }
                )
                .setFooter({ text: 'Gunakan /battle untuk melawan musuh ini' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Explore error:', error);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Error')
                .setDescription('Terjadi kesalahan saat menjelajahi lokasi');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
