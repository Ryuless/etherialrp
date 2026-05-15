// Stat Calculation Utilities

/**
 * Calculate sub-stats based on main stats
 * @param {Object} mainStats - Main stats object {STR, AGI, VIT, INT, DEX, LUK}
 * @returns {Object} Sub-stats object
 */
function calculateSubStats(mainStats) {
    const subStats = {
        ATK: 0,
        MATK: 0,
        DEF: 0,
        MDEF: 0,
        HIT: 0,
        CRITICAL: 0,
        FLEE: 0,
        ASPD: 0
    };

    const { STR, AGI, VIT, INT, DEX, LUK } = mainStats;

    // ATK calculation (from STR and DEX for ranged)
    subStats.ATK += STR + DEX;

    // MATK calculation (from INT)
    subStats.MATK = Math.floor(INT * 1.5);

    // DEF calculation (from VIT)
    subStats.DEF = Math.floor(VIT / 2);

    // MDEF calculation (from INT and AGI)
    subStats.MDEF = Math.floor(INT / 2) + Math.floor(AGI / 5);

    // HIT calculation (from DEX)
    subStats.HIT = DEX + Math.floor(LUK / 3);

    // CRITICAL calculation (from LUK)
    subStats.CRITICAL = Math.floor(LUK * 0.3) + 1;

    // FLEE calculation (from AGI)
    subStats.FLEE = AGI + Math.floor(LUK / 5);

    // ASPD calculation (from AGI)
    subStats.ASPD = Math.floor(AGI / 2);

    return subStats;
}

/**
 * Calculate max HP based on VIT
 * @param {number} baseHP - Base HP from job
 * @param {number} VIT - Vitality stat
 * @returns {number} Max HP
 */
function calculateMaxHP(baseHP, VIT) {
    const bonusHP = Math.floor(baseHP * (VIT * 0.01));
    return baseHP + bonusHP;
}

/**
 * Calculate max MP based on INT
 * @param {number} baseMP - Base MP from job
 * @param {number} INT - Intelligence stat
 * @returns {number} Max MP
 */
function calculateMaxMP(baseMP, INT) {
    const bonusMP = Math.floor(baseMP * (INT * 0.01));
    return baseMP + bonusMP;
}

/**
 * Calculate stat points from level
 * @param {number} level - Character level
 * @returns {number} Stat points per level
 */
function calculateStatPointsPerLevel(level) {
    return 5 + Math.floor(level / 10); // Base 5 + 1 per 10 levels
}

/**
 * Calculate weight limit based on STR
 * @param {number} baseWeight - Base weight from job
 * @param {number} STR - Strength stat
 * @returns {number} Weight limit
 */
function calculateWeightLimit(baseWeight, STR) {
    return baseWeight + (STR * 30);
}

/**
 * Calculate Variable Cast Time reduction
 * @param {number} baseCastTime - Base cast time in milliseconds
 * @param {number} DEX - Dexterity stat
 * @param {number} INT - Intelligence stat
 * @returns {number} Reduced cast time
 */
function calculateVariableCastTime(baseCastTime, DEX, INT) {
    // DEX reduces VCT, INT reduces it but half the effect of DEX
    const dexReduction = DEX * 2; // Each point of DEX reduces by 2ms
    const intReduction = Math.floor(INT * 1); // Each point of INT reduces by 1ms
    const totalReduction = dexReduction + intReduction;
    const finalCastTime = Math.max(0, baseCastTime - totalReduction);
    return finalCastTime;
}

/**
 * Calculate damage with critical strike
 * @param {number} baseDamage - Base damage
 * @param {number} CRITICAL - Critical stat
 * @returns {number} Damage with potential critical
 */
function calculateDamage(baseDamage, CRITICAL, isCriticalHit = false) {
    if (isCriticalHit) {
        return Math.floor(baseDamage * 1.5); // 1.5x damage on critical
    }
    return baseDamage;
}

/**
 * Calculate armor defense reduction
 * @param {number} incomingDamage - Incoming damage
 * @param {number} DEF - Defense stat
 * @returns {number} Reduced damage
 */
function calculateDefenseReduction(incomingDamage, DEF) {
    // After renewal, defense doesn't reduce damage percentage, but subtracts flat damage
    const percentReduction = Math.min(40, DEF / 10); // Max 40% reduction
    const flatReduction = DEF;
    const damageAfterPercent = Math.floor(incomingDamage * (1 - percentReduction / 100));
    const finalDamage = Math.max(1, damageAfterPercent - flatReduction);
    return finalDamage;
}

/**
 * Calculate hit/miss for an attack
 * @param {number} HIT - Hit stat of attacker
 * @param {number} FLEE - Flee stat of defender
 * @returns {boolean} Whether the attack hits
 */
function calculateHitMiss(HIT, FLEE) {
    const hitChance = Math.min(100, Math.max(0, 50 + (HIT - FLEE)));
    return Math.random() * 100 < hitChance;
}

module.exports = {
    calculateSubStats,
    calculateMaxHP,
    calculateMaxMP,
    calculateWeightLimit,
    calculateVariableCastTime,
    calculateDamage,
    calculateDefenseReduction,
    calculateHitMiss,
    calculateStatPointsPerLevel
};
