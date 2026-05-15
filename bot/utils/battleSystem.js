// Battle System Utilities
const { calculateDamage, calculateHitMiss, calculateDefenseReduction } = require('./statsCalculator');

class Battle {
    constructor(attacker, defender, skill = null) {
        this.attacker = attacker;
        this.defender = defender;
        this.skill = skill;
        this.logs = [];
        this.turn = 1;
    }

    calculateSkillDamage() {
        if (!this.skill) return this.calculateAutoAttack();

        if (!calculateHitMiss(this.attacker.subStats.HIT, this.defender.subStats.FLEE)) {
            this.logs.push(`${this.attacker.name} menyerang tapi MISS!`);
            return 0;
        }

        let damage = this.skill.damage || 0;

        // Add physical damage scaling
        if (this.skill.type === 'physical') {
            damage += this.attacker.subStats.ATK;
        }

        // Add magic damage scaling
        if (this.skill.type === 'magic') {
            damage = Math.floor((damage * this.attacker.subStats.MATK) / 100);
        }

        // Critical hit calculation
        const criticalChance = this.attacker.subStats.CRITICAL;
        const isCritical = Math.random() * 100 < criticalChance;

        if (isCritical) {
            damage = calculateDamage(damage, criticalChance, true);
            this.logs.push(`⚡ SERANGAN KRITIS! Damage +50%`);
        }

        // Defense reduction
        const finalDamage = calculateDefenseReduction(damage, this.defender.subStats.DEF);

        this.logs.push(`${this.attacker.name} menggunakan ${this.skill.name}! Damage: ${finalDamage}`);
        return Math.max(1, finalDamage);
    }

    calculateAutoAttack() {
        if (!calculateHitMiss(this.attacker.subStats.HIT, this.defender.subStats.FLEE)) {
            this.logs.push(`${this.attacker.name} menyerang tapi MISS!`);
            return 0;
        }

        let damage = this.attacker.subStats.ATK;

        // Critical hit
        const criticalChance = this.attacker.subStats.CRITICAL;
        const isCritical = Math.random() * 100 < criticalChance;

        if (isCritical) {
            damage = calculateDamage(damage, criticalChance, true);
            this.logs.push(`⚡ SERANGAN KRITIS! Damage +50%`);
        }

        // Defense reduction
        const finalDamage = calculateDefenseReduction(damage, this.defender.subStats.DEF);

        this.logs.push(`${this.attacker.name} menyerang ${this.defender.name}! Damage: ${finalDamage}`);
        return Math.max(1, finalDamage);
    }

    calculateHitChance() {
        return this.attacker.subStats.HIT;
    }

    applyDamage(damage) {
        this.defender.currentHP = Math.max(0, this.defender.currentHP - damage);
    }

    isDefeated() {
        return this.defender.currentHP <= 0;
    }

    getBattleLog() {
        return this.logs;
    }
}

module.exports = { Battle };
