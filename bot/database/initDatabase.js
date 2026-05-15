// Database Initialization and Seed Data
const { doc, setDoc, collection, getDocs } = require('firebase/firestore');

/**
 * Initialize database with seed data
 * @param {Firestore} db - Firebase Firestore instance
 */
async function initializeDatabase(db) {
    try {
        console.log('Initializing database with seed data...');
        
        // Check if data already exists
        const racesCol = collection(db, 'races');
        const racesSnap = await getDocs(racesCol);
        
        if (racesSnap.size > 0) {
            console.log('Database already initialized');
            return;
        }

        // Seed races with base stats
        const races = {
            Human: { STR: 10, AGI: 10, VIT: 10, INT: 10, DEX: 10, LUK: 10, baseHP: 40, baseSP: 11 },
            Elf: { STR: 8, AGI: 13, VIT: 8, INT: 12, DEX: 13, LUK: 10, baseHP: 35, baseSP: 14 },
            Orc: { STR: 14, AGI: 8, VIT: 12, INT: 8, DEX: 8, LUK: 8, baseHP: 55, baseSP: 8 },
            Dwarf: { STR: 12, AGI: 9, VIT: 13, INT: 8, DEX: 9, LUK: 10, baseHP: 50, baseSP: 10 },
            Vampire: { STR: 11, AGI: 12, VIT: 9, INT: 12, DEX: 12, LUK: 11, baseHP: 42, baseSP: 13 },
            Dragontamer: { STR: 13, AGI: 11, VIT: 12, INT: 11, DEX: 11, LUK: 11, baseHP: 48, baseSP: 12 },
            Fairy: { STR: 7, AGI: 14, VIT: 7, INT: 13, DEX: 14, LUK: 12, baseHP: 30, baseSP: 15 },
            Griffin: { STR: 12, AGI: 12, VIT: 11, INT: 11, DEX: 12, LUK: 11, baseHP: 45, baseSP: 12 },
            Nymph: { STR: 9, AGI: 12, VIT: 10, INT: 13, DEX: 12, LUK: 12, baseHP: 38, baseSP: 14 },
            Werewolf: { STR: 13, AGI: 12, VIT: 13, INT: 9, DEX: 10, LUK: 10, baseHP: 50, baseSP: 10 },
            Pegasus: { STR: 10, AGI: 14, VIT: 9, INT: 11, DEX: 13, LUK: 11, baseHP: 38, baseSP: 12 },
            Mermaid: { STR: 9, AGI: 11, VIT: 10, INT: 13, DEX: 11, LUK: 13, baseHP: 40, baseSP: 14 },
            Angel: { STR: 10, AGI: 11, VIT: 11, INT: 13, DEX: 12, LUK: 12, baseHP: 42, baseSP: 14 },
            Demon: { STR: 12, AGI: 11, VIT: 12, INT: 12, DEX: 11, LUK: 10, baseHP: 48, baseSP: 12 },
            Bunny: { STR: 8, AGI: 15, VIT: 8, INT: 11, DEX: 14, LUK: 13, baseHP: 32, baseSP: 13 }
        };

        for (const [raceName, stats] of Object.entries(races)) {
            await setDoc(doc(db, 'races', raceName), stats);
        }
        console.log('Races seeded successfully');

        // Seed jobs without stats (jobs are just titles/roles)
        const jobs = {
            Archer: { description: "Pemanah jitu dengan serangan jarak jauh." },
            Warrior: { description: "Petarung jarak dekat dengan pertahanan tinggi." },
            Rogue: { description: "Pembunuh senyap yang mengandalkan kecepatan." },
            Poet: { description: "Seniman yang memberikan buff di area pertempuran." },
            Oracle: { description: "Pendeta suci yang memiliki sihir penyembuh." },
            Witch: { description: "Penyihir dengan mantra elemen penghancur." },
            Hunter: { description: "Pemburu monster dengan jebakan presisi." },
            Alchemist: { description: "Ahli ramuan dan peledak ajaib." },
            Blacksmith: { description: "Pandai besi tangguh, ahli crafting senjata." },
            Jobless: { description: "Petualang tanpa arah kelas yang jelas." }
        };

        for (const [jobName, data] of Object.entries(jobs)) {
            await setDoc(doc(db, 'jobs', jobName), data);
        }
        console.log('Jobs seeded successfully');

        // Seed maps
        const maps = {
            'Kota_Utama': { region: 'Kota Utama', safeZone: true, spawnChance: 0, density: 0, locations: ['Kedai_Petualang', 'Distrik_Warga', 'Adventurer_Guild', 'BlackSmith', 'Alchemist'] },
            'Alam_Mistik': { region: 'Alam Mistik', safeZone: false, spawnChance: 0.42, density: 0.55, locations: ['Hutan_Berbisik', 'Sarang_Peri_Gaib', 'Suaka_Nymph', 'Desa_Liang_Rumput', 'Sungai_Sihir', 'Hutan_Gelap', 'Hutan_Tak_Tersentuh', 'Pohon_Kehidupan'] },
            'Dataran_Keras': { region: 'Dataran Keras', safeZone: false, spawnChance: 0.38, density: 0.45, locations: ['Kedai_Perbatasan', 'Ngarai_Tulang', 'Desa_Tempa_Dwarf', 'Tenda_Kepala_Orc', 'Dataran_Batu_Crystal', 'Goa_Sinar', 'Kota_Tandus'] },
            'Kawasan_Bayangan': { region: 'Kawasan Bayangan', safeZone: false, spawnChance: 0.68, density: 0.85, locations: ['Pasar_Malam_Gelap', 'Gerbang_Kegelapan', 'Castle_Darah_Vampire', 'Kamp_Bulan_Merah', 'Inti_Abyssal', 'Bukit_Batu_Darah', 'Gunung_Naga_Bayangan', 'Goa_Tanpa_Ujung'] },
            'Samudra': { region: 'Samudra', safeZone: false, spawnChance: 0.48, density: 0.6, locations: ['Pesisir_Berbisik', 'Istana_Palung_Laut', 'Pulau_Hutan_Hijau', 'Kawasan_Makam_Pelaut', 'Palung_Gelap_Tanpa_Dasar', 'Pulau_Pembajak', 'Area_Berkabut'] },
            'Puncak_Langit': { region: 'Puncak Langit', safeZone: false, spawnChance: 0.56, density: 0.72, locations: ['Pijakan_Awan', 'Altar_Angin', 'Kuil_Nirwana', 'Kawah_Naga_Purba', 'Tebing_Badai_Griffin', 'Padang_Pegasus', 'Istana_Langit', 'Taman_Bunga_Nirwana', 'Kota_Atas_Langit'] }
        };

        for (const [mapId, mapData] of Object.entries(maps)) {
            await setDoc(doc(db, 'maps', mapId), mapData);
        }
        console.log('Maps seeded successfully');

        console.log('Database initialization completed!');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

/**
 * Seed monsters to database
 * @param {Firestore} db - Firebase Firestore instance
 */
async function seedMonsters(db) {
    try {
        const monstersData = require('./monstersData');
        
        // Check if monsters already exist
        const monstersCol = collection(db, 'monsters');
        const monstersSnap = await getDocs(monstersCol);
        
        if (monstersSnap.size > 0) {
            console.log('Monsters already seeded');
            return;
        }

        let count = 0;
        for (const [monsterId, monsterData] of Object.entries(monstersData)) {
            await setDoc(doc(db, 'monsters', monsterId), monsterData);
            count++;
        }
        
        console.log(`Seeded ${count} monsters`);
    } catch (error) {
        console.error('Error seeding monsters:', error);
        throw error;
    }
}

module.exports = {
    initializeDatabase,
    seedMonsters
};
