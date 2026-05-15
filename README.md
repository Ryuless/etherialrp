# 🎮 Etherial RP - Fantasy RPG Discord Bot

> Sistem RPG berbasis Discord dengan battle system turn-based, skill kompleks, dan penyimpanan data di Firebase.

## 📦 Teknologi

- **Discord.js v14.26.4** - Framework untuk Discord bot
- **Firebase Realtime Database** - Cloud storage untuk semua game data
- **Node.js** - Runtime environment
- **React + Vite** - Frontend untuk admin dashboard (optional)

## ✨ Features

### 🎭 Karakter
- 15 ras dengan base stats unik
- 10 job/class dengan skill bonuses
- Level system dengan experience
- Main stats (STR, AGI, VIT, INT, DEX, LUK)
- Sub stats auto-calculated (ATK, MATK, DEF, MDEF, HIT, CRITICAL, FLEE, ASPD)

### ⚔️ Battle System
- Turn-based PvP combat
- Hit/Miss calculations (HIT vs FLEE)
- Critical hit mechanics (1.5x damage multiplier)
- Skill-based dan auto-attack
- Defense damage reduction (max 40% + flat)

### 🗺️ Exploration
- 6 regions dengan 45+ locations
- Random enemy encounters
- Experience dan loot system

### 💼 Inventory
- Item system dengan rarity (common, uncommon, rare, epic, legendary)
- Equipment slots (weapon, armor, accessories)
- Weight limit system
- Item stacking

### 🪄 Skills
- 20+ unique skills per job
- Skill cooldowns
- AOE dan single-target skills
- Elemental damage types
- Skill level progression

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Install dependencies
npm install

# Create .env file
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN
DISCORD_CLIENT_ID=YOUR_CLIENT_ID
DISCORD_GUILD_ID=YOUR_GUILD_ID

# Firebase credentials
FIREBASE_API_KEY=YOUR_API_KEY
FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
FIREBASE_APP_ID=YOUR_APP_ID
```

### 2. Seed Database (First Time Only)

```bash
node bot/seed.js
```

This will populate Firebase with:
- 15 races dengan stats
- 10 jobs dengan bonuses
- 6 maps dengan locations
- 20+ skills
- 24 items
- Starter kits untuk setiap job

### 3. Deploy Commands

```bash
node bot/deploy-commands.js
```

### 4. Run Bot

```bash
node bot/index.js
```

## 📋 Commands

### `/register name:<name> race:<race> job:<job>`
Membuat karakter baru dengan race dan job pilihan.

**Contoh:**
```
/register name:Aragorn race:Human job:Warrior
```

### `/profile`
Menampilkan profile karakter dengan stats lengkap.

### `/stats`
Detail breakdown semua stats dengan formula penghitungan.

### `/skills`
List semua skills yang sudah dipelajari beserta cooldown.

### `/inventory`
Tampilkan inventory, equipment, dan weight usage.

### `/battle opponent:<@user>`
Mulai PvP battle dengan opponent lain.

### `/explore region:<region>`
Menjelajahi lokasi dan encounter dengan musuh random.

## 📊 Database Structure

Semua data tersimpan di Firebase dengan struktur:

```
/races              → 15 race documents
/jobs               → 10 job documents  
/maps               → 6 region documents dengan locations
/skills             → 20+ skill documents
/items              → 24 item documents
/starterKits        → Starter equipment per job
/characters         → Player character data (dibuat per user)
```

Untuk detail lengkap struktur, lihat [DATABASE_STRUCTURE.md](DATABASE_STRUCTURE.md)

## 🎯 Stats System

### Main Stats (6)
- **STR** (Strength) → +1 ATK per point
- **AGI** (Agility) → +1 FLEE per point
- **VIT** (Vitality) → +1% MaxHP per point
- **INT** (Intelligence) → +1.5 MATK per point
- **DEX** (Dexterity) → +1 HIT per point
- **LUK** (Luck) → +0.3% CRITICAL per point

### Sub Stats (8)
- **ATK** (Physical Attack) - calculated from STR + weapon bonus
- **MATK** (Magical Attack) - calculated from INT
- **DEF** (Physical Defense) - calculated from VIT + armor bonus
- **MDEF** (Magical Defense) - calculated from VIT
- **HIT** (Accuracy) - calculated from DEX
- **CRITICAL** - calculated from LUK
- **FLEE** (Evasion) - calculated from AGI
- **ASPD** (Attack Speed) - calculated from AGI

## ⚙️ Configuration

Semua game data dapat dikonfigurasi melalui Firebase atau file data modules:

- **Races**: [bot/database/initDatabase.js](bot/database/initDatabase.js)
- **Jobs**: [bot/database/initDatabase.js](bot/database/initDatabase.js)
- **Skills**: [bot/database/skillsData.js](bot/database/skillsData.js)
- **Items**: [bot/database/skillsData.js](bot/database/skillsData.js)
- **Maps**: [bot/database/initDatabase.js](bot/database/initDatabase.js)
- **Starter Kits**: [bot/database/starterKitsData.js](bot/database/starterKitsData.js)

## 📁 Project Structure

```
etherialrp/
├── bot/
│   ├── commands/              # Slash commands
│   ├── events/                # Discord events
│   ├── utils/                 # Utility functions
│   ├── database/              # Database initialization & data
│   ├── index.js               # Main bot entry point
│   ├── deploy-commands.js     # Command registration
│   └── seed.js                # Database seeding script
├── dashboard/                 # React admin dashboard (WIP)
├── .env                       # Environment variables
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🔧 Development

### Adding New Skills

1. Edit [bot/database/skillsData.js](bot/database/skillsData.js)
2. Seed database: `node bot/seed.js`

### Adding New Items

1. Edit [bot/database/skillsData.js](bot/database/skillsData.js)
2. Seed database: `node bot/seed.js`

### Modifying Races/Jobs

1. Edit [bot/database/initDatabase.js](bot/database/initDatabase.js)
2. Delete collection di Firebase
3. Seed database: `node bot/seed.js`

## 🛠️ Troubleshooting

### Bot tidak bisa login
- Check `.env` file has valid `DISCORD_BOT_TOKEN`
- Verify bot has minimum permissions in Discord server

### Commands tidak muncul
- Run `node bot/deploy-commands.js` again
- Check `DISCORD_CLIENT_ID` dan `DISCORD_GUILD_ID` di .env

### Database connection error
- Verify Firebase credentials di .env
- Check Firebase project rules allow read/write
- Verify node_modules sudah di-install: `npm install`

### Character data tidak tersimpan
- Check database `/characters` collection di Firebase Console
- Verify user sudah register dengan `/register`

## 📚 Documentation

- [Setup Guide](SETUP.md) - Detailed setup instructions
- [Quick Start](QUICKSTART.md) - 3-step quick start
- [Database Structure](DATABASE_STRUCTURE.md) - Firebase collections schema
- [Migration Complete](MIGRATION_COMPLETE.md) - Migration from JSON to Firebase

## 🎓 Learning Resources

- [Discord.js Documentation](https://discord.js.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [RPG Game Design](https://www.gamedeveloper.com/)

## 📝 License

This project is created as a fantasy RPG Discord bot for educational purposes.

## 🤝 Support

Untuk bantuan, check dokumentasi atau kontribusi ke repository.

---

**Made with ❤️ for fantasy RPG enthusiasts**

Last Updated: 2026-05-11
Version: 1.0.0 (Full Firebase Migration Complete)
