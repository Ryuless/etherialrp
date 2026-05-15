const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { doc, setDoc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');
const { calculateSubStats, calculateMaxHP, calculateMaxMP, calculateWeightLimit, calculateStatPointsPerLevel } = require('../utils/statsCalculator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Mendaftarkan karakter untuk roleplay.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Nama karakter Anda.')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(20))
        .addStringOption(option =>
            option.setName('race')
                .setDescription('Ras karakter Anda.')
                .setRequired(true)
                .addChoices(
                    { name: 'Human', value: 'Human' },
                    { name: 'Elf', value: 'Elf' },
                    { name: 'Orc', value: 'Orc' },
                    { name: 'Dwarf', value: 'Dwarf' },
                    { name: 'Vampire', value: 'Vampire' },
                    { name: 'Dragontamer', value: 'Dragontamer' },
                    { name: 'Fairy', value: 'Fairy' },
                    { name: 'Griffin', value: 'Griffin' },
                    { name: 'Nymph', value: 'Nymph' },
                    { name: 'Werewolf', value: 'Werewolf' },
                    { name: 'Pegasus', value: 'Pegasus' },
                    { name: 'Mermaid', value: 'Mermaid' },
                    { name: 'Angel', value: 'Angel' },
                    { name: 'Demon', value: 'Demon' },
                    { name: 'Bunny', value: 'Bunny' }
                ))
        .addStringOption(option =>
            option.setName('job')
                .setDescription('Pekerjaan karakter Anda.')
                .setRequired(true)
                .addChoices(
                    { name: 'Archer', value: 'Archer' },
                    { name: 'Warrior', value: 'Warrior' },
                    { name: 'Rogue', value: 'Rogue' },
                    { name: 'Poet', value: 'Poet' },
                    { name: 'Oracle', value: 'Oracle' },
                    { name: 'Witch', value: 'Witch' },
                    { name: 'Hunter', value: 'Hunter' },
                    { name: 'Alchemist', value: 'Alchemist' },
                    { name: 'Blacksmith', value: 'Blacksmith' },
                    { name: 'Jobless', value: 'Jobless' }
                )),
    async execute(interaction, db) {
        const name = interaction.options.getString('name');
        const race = interaction.options.getString('race');
        const job = interaction.options.getString('job');
        const userId = interaction.user.id;

        try {
            // Check if character already exists
            const existingChar = await getDoc(doc(db, 'characters', userId));
            if (existingChar.exists()) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('❌ Karakter Sudah Ada')
                    .setDescription('Anda sudah memiliki satu karakter. Satu akun hanya dapat memiliki satu karakter.');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Get race stats
            const raceDoc = await getDoc(doc(db, 'races', race));
            const raceStats = raceDoc.data();

            // Ensure selected job title exists in database (job has no stats)
            const jobDoc = await getDoc(doc(db, 'jobs', job));
            if (!jobDoc.exists()) {
                return interaction.reply({
                    content: 'Job yang dipilih tidak tersedia di database.',
                    ephemeral: true
                });
            }

            // Primary stats rely purely on Race
            const mainStats = {
                STR: raceStats.STR,
                AGI: raceStats.AGI,
                VIT: raceStats.VIT,
                INT: raceStats.INT,
                DEX: raceStats.DEX,
                LUK: raceStats.LUK
            };

            // Calculate substats
            const subStats = calculateSubStats(mainStats);

            // Calculate HP and MP purely based on race baseHP and baseSP respectively
            const maxHP = calculateMaxHP(raceStats.baseHP || 50, mainStats.VIT);
            const maxMP = calculateMaxMP(raceStats.baseSP || 20, mainStats.INT);
            const weightLimit = calculateWeightLimit(100, mainStats.STR);
            const statPoints = calculateStatPointsPerLevel(1);

            // Get starter kit (for items and gold only, skills removed)
            const kitDoc = await getDoc(doc(db, 'starterKits', job));
            const kit = kitDoc.data();

            // Query tier-0 skills (skills with requiredLevel <= 1)
            const skillsSnap = await getDocs(
                query(collection(db, 'skills'), where('requiredLevel', '<=', 1))
            );
            
            // Get random tier-0 skills (2-3 random skills)
            const tier0Skills = skillsSnap.docs.map(d => d.id);
            const numSkills = Math.min(3, Math.max(2, tier0Skills.length));
            const randomSkills = [];
            
            if (tier0Skills.length > 0) {
                // Fisher-Yates shuffle and pick
                const shuffled = [...tier0Skills].sort(() => Math.random() - 0.5);
                randomSkills.push(...shuffled.slice(0, numSkills));
            }

            // Create character document
            const characterData = {
                userId: userId,
                name: name,
                race: race,
                job: job,
                level: 1,
                experience: 0,
                nextLevelExp: 1000,
                mainStats: mainStats,
                subStats: subStats,
                currentHP: maxHP,
                maxHP: maxHP,
                currentMP: maxMP,
                maxMP: maxMP,
                statPoints: statPoints,
                currentWeight: 0,
                weightLimit: weightLimit,
                gold: kit.startingGold,
                skills: randomSkills,
                inventory: kit.items || [],
                equipment: {},
                createdAt: new Date(),
                lastActive: new Date()
            };

            await setDoc(doc(db, 'characters', userId), characterData);

            // Create embed for success message
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ Karakter Berhasil Dibuat!')
                .addFields(
                    { name: 'Nama', value: name, inline: true },
                    { name: 'Ras', value: race, inline: true },
                    { name: 'Pekerjaan', value: job, inline: true },
                    { name: 'Stats Awal', value: `STR: ${mainStats.STR} | AGI: ${mainStats.AGI} | VIT: ${mainStats.VIT}\nINT: ${mainStats.INT} | DEX: ${mainStats.DEX} | LUK: ${mainStats.LUK}` },
                    { name: 'HP / MP', value: `${maxHP} / ${maxMP}`, inline: true },
                    { name: 'Emas', value: kit.startingGold.toString(), inline: true },
                    { name: 'Skill Auto-Roll (Tier 0)', value: randomSkills.length > 0 ? randomSkills.join(', ') : 'Tidak ada skill tier 0', inline: false }
                )
                .setFooter({ text: 'Gunakan /profile untuk melihat detail karakter Anda' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error adding character: ", error);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Error')
                .setDescription('Terjadi kesalahan saat membuat karakter. Silakan coba lagi.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
