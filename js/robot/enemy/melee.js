/**
 * A robot that charges at players, knocking them out of the way upon collision
 *
 * @param {string} name         - name of the enemy sprite image
 * @param {number} x            - initial horizontal position
 * @param {number} y            - initial vertical position
 * @param {number} type         - Robot type ID of the enemy (should be Robot.MOB)
 * @param {number} health       - max health
 * @param {number} speed        - movement speed
 * @param {number} range        - attack range
 * @param {number} exp          - experience yield
 * @param {string} rank         - difficulty rank
 * @param {number} [patternMin] - minimum time between switching attack patterns
 * @param {number} [patternMax] - maximum time between switching attack patterns
 * @param {number} damage       - damage to do on collision
 * @param {number} distance     - distance to knockback targets
 * @param {number} duration     - duration of the charge
 *
 * @constructor
 */
extend('Melee', 'Enemy');
function Melee(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax, damage, distance, duration) {
    this.super(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax);

    this.scale = 1;
    this.power = damage * Enemy.sum();
    this.distance = distance;
    this.chargeDuration = duration;
    this.movement = movement.charge;
}

/**
 * A light melee enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightMelee', 'Melee');
function LightMelee(x, y) {
    this.super(
        /* sprite name */ 'enemyLightMelee',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 50 * Enemy.pow(0.9),
        /* speed       */ 3 + 0.3 * gameScreen.bossCount,
        /* range       */ 400,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* damage      */ 1,
        /* distance    */ 200,
        /* duration    */ 180
    );
}

/**
 * A heavy melee enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyMelee', 'Melee');
function HeavyMelee(x, y) {
    this.super(
        /* sprite name */ 'enemyLightMelee',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 75 * Enemy.pow(0.9),
        /* speed       */ 2.5 + 0.3 * gameScreen.bossCount,
        /* range       */ 400,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* damage      */ 2,
        /* distance    */ 250,
        /* duration    */ 180
    );
}