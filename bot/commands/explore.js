const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doc, getDoc, collection, getDocs, updateDoc } = require('firebase/firestore');
const { getEncounterConfig, pickEncounterMonster } = require('../utils/encounterSystem');

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
            const encounterConfig = getEncounterConfig(regionId, mapData, randomLocation);

            // Get all monsters from database
            const monstersCollection = collection(db, 'monsters');
            const monstersSnap = await getDocs(monstersCollection);
            const allMonsters = [];
            monstersSnap.forEach(doc => {
                allMonsters.push({ id: doc.id, ...doc.data() });
            });

            if (allMonsters.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setTitle('⚠️ Tidak Ada Musuh')
                    .setDescription('Tidak ada musuh di area ini saat ini.');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const canSpawnMonster = !encounterConfig.safeZone && Math.random() < encounterConfig.spawnChance;
            const encounter = canSpawnMonster
                ? pickEncounterMonster(allMonsters, regionId, mapData, randomLocation)
                : null;

            const activeEncounter = encounter ? {
                monsterId: encounter.id || null,
                monster: encounter,
                mapId: regionId,
                mapName: mapData.region,
                locationId: randomLocation,
                locationName: randomLocation.replace(/_/g, ' '),
                createdAt: new Date(),
                spawnChance: encounterConfig.spawnChance
            } : null;

            await updateDoc(charRef, {
                lastExploration: {
                    mapId: regionId,
                    mapName: mapData.region,
                    locationId: randomLocation,
                    locationName: randomLocation.replace(/_/g, ' '),
                    exploredAt: new Date()
                },
                ...(activeEncounter ? { activeEncounter } : {})
            });

            if (!encounter) {
                const embed = new EmbedBuilder()
                    .setColor(encounterConfig.safeZone ? 'Green' : 'Blue')
                    .setTitle(encounterConfig.safeZone ? '🏘️ Zona Aman' : '🌿 Perjalanan Tenang')
                    .setDescription(
                        encounterConfig.safeZone
                            ? `Anda berada di ${randomLocation.replace(/_/g, ' ')}. Area ini adalah safe zone, jadi monster tidak akan muncul.`
                            : `Saat menjelajahi ${randomLocation.replace(/_/g, ' ')}, tidak ada monster yang muncul. Coba jelajahi lagi atau pindah ke area yang lebih berbahaya.`
                    )
                    .addFields({
                        name: 'Peluang Spawn',
                        value: `${Math.round(encounterConfig.spawnChance * 100)}%`
                    });

                return await interaction.reply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('🎲 Perjumpaan di Lokasi!')
                .setDescription(`Saat menjelajahi ${randomLocation.replace(/_/g, ' ')}, Anda menemukan monster!`)
                .addFields(
                    {
                        name: `🧟 ${encounter.name}`,
                        value: `Level: ${encounter.level}\nHP: ${encounter.hp}\nATK: ${encounter.atk}\nElement: ${encounter.element}\nSpawn Chance: ${Math.round(encounterConfig.spawnChance * 100)}%`,
                        inline: true
                    },
                    {
                        name: `⚔️ ${character.name}`,
                        value: `Level: ${character.level}\nHP: ${character.currentHP}/${character.maxHP}\nATK: ${character.subStats.ATK}`,
                        inline: true
                    }
                )
                .setFooter({ text: 'Gunakan /battle untuk melawan monster ini' });

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
