// Skills Database Seed Data
const skills = {
    // Archer Skills
    'Arrow_Shower': {
        name: 'Arrow Shower',
        description: 'Melepaskan hujan anak panah ke musuh dalam area.',
        type: 'physical', // physical, magic, support
        damage: 150,
        element: 'none',
        castTime: 0,
        cooldown: 3000,
        range: 11,
        area: true,
        areaRadius: 3,
        requiredLevel: 1,
        skillPoints: 1
    },
    'Double_Strafe': {
        name: 'Double Strafe',
        description: 'Serangan ganda dengan busur ke satu target.',
        type: 'physical',
        damage: 200,
        element: 'none',
        castTime: 500,
        cooldown: 2000,
        range: 9,
        area: false,
        requiredLevel: 5,
        skillPoints: 2
    },
    'Arrow_Storm': {
        name: 'Arrow Storm',
        description: 'Menciptakan badai panah yang merusak semua musuh dalam area.',
        type: 'physical',
        damage: 300,
        element: 'none',
        castTime: 1500,
        cooldown: 5000,
        range: 13,
        area: true,
        areaRadius: 5,
        requiredLevel: 20,
        skillPoints: 5
    },

    // Warrior Skills
    'Bash': {
        name: 'Bash',
        description: 'Serangan dasar dengan senjata untuk menghancurkan pertahanan musuh.',
        type: 'physical',
        damage: 175,
        element: 'none',
        castTime: 0,
        cooldown: 1500,
        range: 1,
        area: false,
        requiredLevel: 1,
        skillPoints: 1
    },
    'Sword_Mastery': {
        name: 'Sword Mastery',
        description: 'Meningkatkan keahlian menggunakan pedang. (Buff Skill)',
        type: 'support',
        damage: 0,
        atkBonus: 20,
        element: 'none',
        castTime: 500,
        cooldown: 3000,
        duration: 60000,
        range: 1,
        area: false,
        requiredLevel: 10,
        skillPoints: 3
    },
    'Charge_Attack': {
        name: 'Charge Attack',
        description: 'Menyerang dengan biaya MP yang tinggi untuk damage besar.',
        type: 'physical',
        damage: 350,
        element: 'none',
        castTime: 0,
        mpCost: 30,
        cooldown: 4000,
        range: 1,
        area: false,
        requiredLevel: 15,
        skillPoints: 4
    },

    // Rogue Skills
    'Backstab': {
        name: 'Backstab',
        description: 'Serangan terselubung dengan peningkatan damage.',
        type: 'physical',
        damage: 220,
        element: 'none',
        castTime: 0,
        cooldown: 2500,
        range: 1,
        area: false,
        requiredLevel: 1,
        skillPoints: 2
    },
    'Smoke_Screen': {
        name: 'Smoke Screen',
        description: 'Membuat layar asap untuk meningkatkan Flee.',
        type: 'support',
        damage: 0,
        fleeBonus: 30,
        element: 'none',
        castTime: 500,
        cooldown: 4000,
        duration: 30000,
        range: 1,
        area: false,
        requiredLevel: 10,
        skillPoints: 3
    },

    // Poet Skills
    'Lyrical_Harmony': {
        name: 'Lyrical Harmony',
        description: 'Bernyanyi untuk membuff semua sekutu dalam area.',
        type: 'support',
        damage: 0,
        atkBonus: 15,
        defBonus: 10,
        element: 'none',
        castTime: 1000,
        mpCost: 25,
        cooldown: 5000,
        duration: 45000,
        range: 10,
        area: true,
        areaRadius: 5,
        requiredLevel: 1,
        skillPoints: 2
    },
    'Sonic_Attack': {
        name: 'Sonic Attack',
        description: 'Menyerang dengan gelombang suara magis.',
        type: 'magic',
        damage: 120,
        matk: 150,
        element: 'wind',
        castTime: 1000,
        mpCost: 20,
        cooldown: 3000,
        range: 9,
        area: true,
        areaRadius: 2,
        requiredLevel: 10,
        skillPoints: 3
    },

    // Oracle Skills
    'Holy_Light': {
        name: 'Holy Light',
        description: 'Memancarkan cahaya suci untuk menyerang dan mengobati.',
        type: 'magic',
        damage: 150,
        matk: 180,
        element: 'holy',
        castTime: 1000,
        mpCost: 30,
        cooldown: 3500,
        range: 9,
        area: true,
        areaRadius: 3,
        requiredLevel: 1,
        skillPoints: 2
    },
    'Divine_Protection': {
        name: 'Divine Protection',
        description: 'Menciptakan perisai magis untuk melindungi sekutu.',
        type: 'support',
        damage: 0,
        defBonus: 50,
        element: 'holy',
        castTime: 1500,
        mpCost: 40,
        cooldown: 6000,
        duration: 60000,
        range: 10,
        area: true,
        areaRadius: 4,
        requiredLevel: 15,
        skillPoints: 4
    },

    // Witch Skills
    'Fireball': {
        name: 'Fireball',
        description: 'Melemparkan bola api ke musuh.',
        type: 'magic',
        damage: 180,
        matk: 200,
        element: 'fire',
        castTime: 1200,
        mpCost: 35,
        cooldown: 3000,
        range: 9,
        area: true,
        areaRadius: 2,
        requiredLevel: 1,
        skillPoints: 2
    },
    'Ice_Storm': {
        name: 'Ice Storm',
        description: 'Menciptakan badai es yang membekukan musuh.',
        type: 'magic',
        damage: 200,
        matk: 220,
        element: 'water',
        castTime: 1500,
        mpCost: 50,
        cooldown: 5000,
        range: 10,
        area: true,
        areaRadius: 4,
        requiredLevel: 15,
        skillPoints: 4
    },

    // Hunter Skills
    'Trap_Installation': {
        name: 'Trap Installation',
        description: 'Memasang jebakan untuk menangkap musuh.',
        type: 'support',
        damage: 0,
        element: 'none',
        castTime: 1000,
        cooldown: 4000,
        range: 5,
        area: false,
        requiredLevel: 10,
        skillPoints: 3
    },
    'Beast_Companion': {
        name: 'Beast Companion',
        description: 'Memanggil hewan peliharaan untuk membantu pertarungan.',
        type: 'support',
        damage: 0,
        atkBonus: 25,
        element: 'none',
        castTime: 2000,
        mpCost: 40,
        cooldown: 6000,
        duration: 120000,
        range: 1,
        area: false,
        requiredLevel: 20,
        skillPoints: 5
    },

    // Alchemist Skills
    'Potion_Brewing': {
        name: 'Potion Brewing',
        description: 'Membuat ramuan obat untuk penyembuhan.',
        type: 'support',
        damage: 0,
        element: 'none',
        castTime: 2000,
        cooldown: 5000,
        range: 1,
        area: false,
        requiredLevel: 1,
        skillPoints: 2
    },
    'Acid_Bomb': {
        name: 'Acid Bomb',
        description: 'Melemparkan bom asam yang merusak musuh dan armor.',
        type: 'magic',
        damage: 150,
        matk: 170,
        element: 'poison',
        castTime: 1000,
        mpCost: 30,
        cooldown: 3500,
        range: 8,
        area: true,
        areaRadius: 2,
        requiredLevel: 12,
        skillPoints: 3
    },

    // Blacksmith Skills
    'Weapon_Forging': {
        name: 'Weapon Forging',
        description: 'Membangun senjata baru dari bahan mentah.',
        type: 'support',
        damage: 0,
        element: 'none',
        castTime: 3000,
        cooldown: 10000,
        range: 1,
        area: false,
        requiredLevel: 5,
        skillPoints: 3
    },
    'Hammer_Strike': {
        name: 'Hammer Strike',
        description: 'Pukulan kuat dengan palu untuk damage besar.',
        type: 'physical',
        damage: 280,
        element: 'none',
        castTime: 0,
        mpCost: 25,
        cooldown: 3000,
        range: 1,
        area: false,
        requiredLevel: 10,
        skillPoints: 3
    }
};

module.exports = skills;
