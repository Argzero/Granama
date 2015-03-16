/**
 * A light medic enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightMedic', 'Enemy');
function LightMedic(x, y) {
    this.super(
        /* sprite name */ 'enemyLightMedic',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 50 * Enemy.pow(0.9),
        /* speed       */ 4 + 0.3 * gameScreen.bossCount,
        /* range       */ 50,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY
    );

    // Movement pattern
    this.movement = movement.medic;

    // Heal amount
    this.healAmount = this.health / 500;
}

/**
 * A heavy medic enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyMedic', 'Enemy');
function HeavyMedic(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavyMedic',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 80 * Enemy.pow(0.9),
        /* speed       */ 4 + 0.3 * gameScreen.bossCount,
        /* range       */ 50,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY
    );

    // Movement pattern
    this.movement = movement.medic;

    // Heal amount
    this.healAmount = this.health / 500;
}