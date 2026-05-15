// Script to seed all data to Firebase
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection } = require('firebase/firestore');
const skills = require('./database/skillsData');
const starterKits = require('./database/starterKitsData');
const { initializeDatabase, seedMonsters } = require('./database/initDatabase');

// Firebase config
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

async function seedDatabase(providedDb) {
    try {
        console.log('Starting database seeding...');

        const db = providedDb || getFirestore(initializeApp(firebaseConfig));

        // Initialize base data (races, jobs, maps)
        await initializeDatabase(db);

        // (notifications seeding removed)

        // Seed skills
        console.log('Seeding skills...');
        for (const [skillId, skillData] of Object.entries(skills)) {
            await setDoc(doc(db, 'skills', skillId), skillData);
        }
        console.log(`Seeded ${Object.keys(skills).length} skills`);

        // Seed starter kits
        console.log('Seeding starter kits...');
        for (const [jobName, kitData] of Object.entries(starterKits)) {
            await setDoc(doc(db, 'starterKits', jobName), kitData);
        }
        console.log(`Seeded ${Object.keys(starterKits).length} starter kits`);

        // Seed items
        console.log('Seeding items...');
        const items = {
            'wooden_bow': { name: 'Wooden Bow', type: 'weapon', atk: 15, rarity: 'common' },
            'iron_sword': { name: 'Iron Sword', type: 'weapon', atk: 25, rarity: 'common' },
            'short_dagger': { name: 'Short Dagger', type: 'weapon', atk: 20, rarity: 'common' },
            'wooden_staff': { name: 'Wooden Staff', type: 'weapon', matk: 20, rarity: 'common' },
            'holy_staff': { name: 'Holy Staff', type: 'weapon', matk: 30, rarity: 'uncommon' },
            'fire_staff': { name: 'Fire Staff', type: 'weapon', matk: 35, rarity: 'uncommon' },
            'hunting_bow': { name: 'Hunting Bow', type: 'weapon', atk: 28, rarity: 'uncommon' },
            'alchemist_staff': { name: 'Alchemist Staff', type: 'weapon', matk: 25, rarity: 'uncommon' },
            'hammer': { name: 'Hammer', type: 'weapon', atk: 30, rarity: 'uncommon' },
            'iron_shield': { name: 'Iron Shield', type: 'shield', def: 20, rarity: 'common' },
            'leather_armor': { name: 'Leather Armor', type: 'armor', def: 10, rarity: 'common' },
            'plate_armor': { name: 'Plate Armor', type: 'armor', def: 25, rarity: 'common' },
            'cloth_robe': { name: 'Cloth Robe', type: 'armor', mdef: 15, rarity: 'common' },
            'holy_robe': { name: 'Holy Robe', type: 'armor', mdef: 25, def: 8, rarity: 'uncommon' },
            'magic_robe': { name: 'Magic Robe', type: 'armor', mdef: 30, rarity: 'uncommon' },
            'hunter_armor': { name: 'Hunter Armor', type: 'armor', def: 15, agi_bonus: 5, rarity: 'uncommon' },
            'alchemist_robe': { name: 'Alchemist Robe', type: 'armor', mdef: 20, rarity: 'uncommon' },
            'smithing_apron': { name: 'Smithing Apron', type: 'armor', def: 12, rarity: 'uncommon' },
            'cloth_armor': { name: 'Cloth Armor', type: 'armor', def: 5, rarity: 'common' },
            'wooden_sword': { name: 'Wooden Sword', type: 'weapon', atk: 10, rarity: 'common' },
            'arrow': { name: 'Arrow', type: 'consumable', stackable: true },
            'hp_potion': { name: 'HP Potion', type: 'consumable', stackable: true, healAmount: 50 },
            'sp_potion': { name: 'SP Potion', type: 'consumable', stackable: true, restoreSP: 30 },
            'smoke_bomb': { name: 'Smoke Bomb', type: 'consumable', stackable: true }
        };

        for (const [itemId, itemData] of Object.entries(items)) {
            await setDoc(doc(db, 'items', itemId), itemData);
        }
        console.log(`Seeded ${Object.keys(items).length} items`);

        // Seed monsters
        await seedMonsters(db);

        console.log('✅ Database seeding completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

if (require.main === module) {
    seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = {
    seedDatabase
};
