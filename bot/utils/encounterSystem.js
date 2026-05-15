const { calculateDamage, calculateDefenseReduction, calculateHitMiss, calculateStatPointsPerLevel } = require('./statsCalculator');

const SAFE_ZONE_KEYWORDS = ['kota', 'desa', 'kedai', 'guild', 'pasar', 'blacksmith', 'alchemist'];
const WILD_KEYWORDS = ['hutan', 'goa', 'ngarai', 'kawah', 'palung', 'tebing', 'gunung', 'bukit', 'laut', 'pulau', 'sungai', 'berkabut', 'abyss', 'kegelapan'];

const MAP_ENCOUNTER_CONFIG = {
	Kota_Utama: { safeZone: true, spawnChance: 0, monsterLevelMin: 1, monsterLevelMax: 1, density: 0 },
	Alam_Mistik: { safeZone: false, spawnChance: 0.42, monsterLevelMin: 1, monsterLevelMax: 12, density: 0.55 },
	Dataran_Keras: { safeZone: false, spawnChance: 0.38, monsterLevelMin: 3, monsterLevelMax: 18, density: 0.45 },
	Kawasan_Bayangan: { safeZone: false, spawnChance: 0.68, monsterLevelMin: 8, monsterLevelMax: 30, density: 0.85 },
	Samudra: { safeZone: false, spawnChance: 0.48, monsterLevelMin: 2, monsterLevelMax: 22, density: 0.6 },
	Puncak_Langit: { safeZone: false, spawnChance: 0.56, monsterLevelMin: 10, monsterLevelMax: 30, density: 0.72 }
};

function normalizeText(value) {
	return String(value || '').toLowerCase();
}

function isSafeZoneLocation(mapId, mapData, locationId) {
	if (mapData?.safeZone === true) {
		return true;
	}

	const locationText = normalizeText(locationId);
	const regionText = normalizeText(mapId || mapData?.region);

	if (mapId === 'Kota_Utama') {
		return true;
	}

	return SAFE_ZONE_KEYWORDS.some(keyword => locationText.includes(keyword) || regionText.includes(keyword));
}

function getEncounterConfig(mapId, mapData, locationId) {
	const baseConfig = MAP_ENCOUNTER_CONFIG[mapId] || {
		safeZone: false,
		spawnChance: typeof mapData?.spawnChance === 'number' ? mapData.spawnChance : 0.35,
		monsterLevelMin: 1,
		monsterLevelMax: 30,
		density: typeof mapData?.density === 'number' ? mapData.density : 0.4
	};

	if (isSafeZoneLocation(mapId, mapData, locationId)) {
		return {
			...baseConfig,
			safeZone: true,
			spawnChance: 0
		};
	}

	const locationText = normalizeText(locationId);
	const densityBonus = WILD_KEYWORDS.reduce((bonus, keyword) => (
		locationText.includes(keyword) ? bonus + 0.08 : bonus
	), 0);

	const spawnChance = Math.min(0.9, baseConfig.spawnChance + densityBonus + (baseConfig.density || 0) * 0.1);

	return {
		...baseConfig,
		safeZone: false,
		spawnChance
	};
}

function getSpawnChance(mapId, mapData, locationId) {
	return getEncounterConfig(mapId, mapData, locationId).spawnChance;
}

function pickEncounterMonster(monsters, mapId, mapData, locationId) {
	if (!Array.isArray(monsters) || monsters.length === 0) {
		return null;
	}

	const config = getEncounterConfig(mapId, mapData, locationId);
	const candidates = monsters.filter(monster => {
		const level = Number(monster.level || 1);
		return level >= config.monsterLevelMin && level <= config.monsterLevelMax;
	});

	const pool = candidates.length > 0 ? candidates : monsters;
	return pool[Math.floor(Math.random() * pool.length)] || null;
}

function buildMonsterCombatant(monster) {
	const maxHP = Number(monster.maxHP || monster.hp || 1);

	return {
		name: monster.name,
		level: Number(monster.level || 1),
		currentHP: Number(monster.hp || maxHP),
		maxHP,
		subStats: {
			ATK: Number(monster.atk || 1),
			MATK: Number(monster.matk || 0),
			DEF: Number(monster.def || 0),
			MDEF: Number(monster.mdef || 0),
			HIT: Number(monster.hit || 50),
			CRITICAL: Number(monster.critical || 0),
			FLEE: Number(monster.flee || 0),
			ASPD: Number(monster.aspd || 0)
		}
	};
}

function buildPlayerCombatant(character) {
	return {
		name: character.name,
		level: Number(character.level || 1),
		currentHP: Number(character.currentHP || character.maxHP || 1),
		maxHP: Number(character.maxHP || 1),
		subStats: character.subStats || {
			ATK: 1,
			MATK: 0,
			DEF: 0,
			MDEF: 0,
			HIT: 1,
			CRITICAL: 0,
			FLEE: 0,
			ASPD: 0
		}
	};
}

function resolveAttack(attacker, defender) {
	if (!calculateHitMiss(attacker.subStats.HIT, defender.subStats.FLEE)) {
		return {
			hit: false,
			damage: 0,
			log: `${attacker.name} menyerang tapi MISS!`
		};
	}

	let damage = attacker.subStats.ATK;
	const isCritical = Math.random() * 100 < attacker.subStats.CRITICAL;

	if (isCritical) {
		damage = calculateDamage(damage, attacker.subStats.CRITICAL, true);
	}

	const finalDamage = calculateDefenseReduction(damage, defender.subStats.DEF);

	return {
		hit: true,
		damage: Math.max(1, finalDamage),
		critical: isCritical,
		log: `${attacker.name} menyerang ${defender.name}! Damage: ${Math.max(1, finalDamage)}`
	};
}

function applyBattleReward(character, monster) {
	const rewardExp = Number(monster.exp || 0);
	const rewardGold = Number(monster.gold || 0);
	const updatedCharacter = {
		...character,
		experience: Number(character.experience || 0) + rewardExp,
		gold: Number(character.gold || 0) + rewardGold
	};

	while (updatedCharacter.experience >= updatedCharacter.nextLevelExp) {
		updatedCharacter.experience -= updatedCharacter.nextLevelExp;
		updatedCharacter.level = Number(updatedCharacter.level || 1) + 1;
		updatedCharacter.nextLevelExp = Math.floor(updatedCharacter.nextLevelExp * 1.25);
		updatedCharacter.statPoints = Number(updatedCharacter.statPoints || 0) + calculateStatPointsPerLevel(updatedCharacter.level);
		updatedCharacter.maxHP = Number(updatedCharacter.maxHP || 1) + 10;
		updatedCharacter.maxMP = Number(updatedCharacter.maxMP || 1) + 5;
		updatedCharacter.currentHP = updatedCharacter.maxHP;
		updatedCharacter.currentMP = updatedCharacter.maxMP;
	}

	return updatedCharacter;
}

module.exports = {
	isSafeZoneLocation,
	getEncounterConfig,
	getSpawnChance,
	pickEncounterMonster,
	buildMonsterCombatant,
	buildPlayerCombatant,
	resolveAttack,
	applyBattleReward
};