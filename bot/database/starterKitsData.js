// Starter Kit Data
const starterKits = {
    Archer: {
        job: 'Archer',
        items: [
            { itemId: 'wooden_bow', name: 'Wooden Bow', quantity: 1, type: 'weapon' },
            { itemId: 'leather_armor', name: 'Leather Armor', quantity: 1, type: 'armor' },
            { itemId: 'arrow', name: 'Arrow', quantity: 50, type: 'consumable' },
            { itemId: 'hp_potion', name: 'HP Potion', quantity: 5, type: 'consumable' },
            { itemId: 'sp_potion', name: 'SP Potion', quantity: 3, type: 'consumable' }
        ],
        startingGold: 500
    },
    Warrior: {
        job: 'Warrior',
        items: [
            { itemId: 'iron_sword', name: 'Iron Sword', quantity: 1, type: 'weapon' },
            { itemId: 'iron_shield', name: 'Iron Shield', quantity: 1, type: 'shield' },
            { itemId: 'plate_armor', name: 'Plate Armor', quantity: 1, type: 'armor' },
            { itemId: 'hp_potion', name: 'HP Potion', quantity: 8, type: 'consumable' },
            { itemId: 'sp_potion', name: 'SP Potion', quantity: 2, type: 'consumable' }
        ],
        startingGold: 600
    },
    Rogue: {
        job: 'Rogue',
        items: [
            { itemId: 'short_dagger', name: 'Short Dagger', quantity: 2, type: 'weapon' },
            { itemId: 'leather_armor', name: 'Leather Armor', quantity: 1, type: 'armor' },
            { itemId: 'hp_potion', name: 'HP Potion', quantity: 5, type: 'consumable' },
            { itemId: 'sp_potion', name: 'SP Potion', quantity: 3, type: 'consumable' },
            { itemId: 'smoke_bomb', name: 'Smoke Bomb', quantity: 4, type: 'consumable' }
        ],
        startingGold: 550
    },
    Poet: {
        job: 'Poet',
        items: [
            { itemId: 'wooden_staff', name: 'Wooden Staff', quantity: 1, type: 'weapon' },
            { itemId: 'cloth_robe', name: 'Cloth Robe', quantity: 1, type: 'armor' },
            { itemId: 'hp_potion', name: 'HP Potion', quantity: 5, type: 'consumable' },
            { itemId: 'sp_potion', name: 'SP Potion', quantity: 5, type: 'consumable' }
        ],
        startingGold: 450
    },
    Oracle: {
        job: 'Oracle',
        items: [
            { itemId: 'holy_staff', name: 'Holy Staff', quantity: 1, type: 'weapon' },
            { itemId: 'holy_robe', name: 'Holy Robe', quantity: 1, type: 'armor' },
            { itemId: 'hp_potion', name: 'HP Potion', quantity: 6, type: 'consumable' },
            { itemId: 'sp_potion', name: 'SP Potion', quantity: 6, type: 'consumable' }
        ],
        startingGold: 500
    },
    Witch: {
        job: 'Witch',
        items: [
            { itemId: 'fire_staff', name: 'Fire Staff', quantity: 1, type: 'weapon' },
            { itemId: 'magic_robe', name: 'Magic Robe', quantity: 1, type: 'armor' },
            { itemId: 'hp_potion', name: 'HP Potion', quantity: 4, type: 'consumable' },
            { itemId: 'sp_potion', name: 'SP Potion', quantity: 8, type: 'consumable' }
        ],
        startingGold: 450
    },
    Hunter: {
        job: 'Hunter',
        items: [
            { itemId: 'hunting_bow', name: 'Hunting Bow', quantity: 1, type: 'weapon' },
            { itemId: 'hunter_armor', name: 'Hunter Armor', quantity: 1, type: 'armor' },
            { itemId: 'arrow', name: 'Arrow', quantity: 60, type: 'consumable' },
            { itemId: 'hp_potion', name: 'HP Potion', quantity: 6, type: 'consumable' },
            { itemId: 'sp_potion', name: 'SP Potion', quantity: 3, type: 'consumable' }
        ],
        startingGold: 550
    },
    Alchemist: {
        job: 'Alchemist',
        items: [
            { itemId: 'alchemist_staff', name: 'Alchemist Staff', quantity: 1, type: 'weapon' },
            { itemId: 'alchemist_robe', name: 'Alchemist Robe', quantity: 1, type: 'armor' },
            { itemId: 'hp_potion', name: 'HP Potion', quantity: 5, type: 'consumable' },
            { itemId: 'sp_potion', name: 'SP Potion', quantity: 7, type: 'consumable' }
        ],
        startingGold: 500
    },
    Blacksmith: {
        job: 'Blacksmith',
        items: [
            { itemId: 'hammer', name: 'Hammer', quantity: 1, type: 'weapon' },
            { itemId: 'smithing_apron', name: 'Smithing Apron', quantity: 1, type: 'armor' },
            { itemId: 'hp_potion', name: 'HP Potion', quantity: 6, type: 'consumable' },
            { itemId: 'sp_potion', name: 'SP Potion', quantity: 3, type: 'consumable' }
        ],
        startingGold: 600
    },
    Jobless: {
        job: 'Jobless',
        items: [
            { itemId: 'wooden_sword', name: 'Wooden Sword', quantity: 1, type: 'weapon' },
            { itemId: 'cloth_armor', name: 'Cloth Armor', quantity: 1, type: 'armor' },
            { itemId: 'hp_potion', name: 'HP Potion', quantity: 5, type: 'consumable' },
            { itemId: 'sp_potion', name: 'SP Potion', quantity: 3, type: 'consumable' }
        ],
        startingGold: 300
    }
};

module.exports = starterKits;
