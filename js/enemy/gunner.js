/**
 * A light gunner enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightGunner', 'Enemy');
function LightGunner(x, y) {
    this.super(
        /* sprite name */ 'enemyLightRanged',
        /* x position  */ x,
        /* y position  */ y,
        /* health      */ 20 * Enemy.pow(0.9),
        /* speed       */ 2.5 + 0.2 * enemyManager.bossCount,
        /* range       */ 200,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY
    );

    // Weapon data
    this.addWeapon(weapon.gun, {
        sprite: 'bullet',
        damage: Enemy.sum(),
        rate  : 20,
        range : 200,
        spread: rand(enemyManager.bossCount / 2 + 0.4),
        dx    : 23,
        dy    : 30
    });

    // Movement
    this.movement = movement.basic;
}

/**
 * A heavy gunner enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyGunner', 'Gunner');
function HeavyGunner(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavyRanged',
        /* x position  */ x,
        /* y position  */ y,
        /* health      */ 30 * Enemy.pow(0.9),
        /* speed       */ 2 + 0.2 * enemyManager.bossCount,
        /* range       */ 250,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY
    );

    // Weapon data
    this.addWeapon(weapon.gun, {
        sprite: 'bullet',
        damage: Enemy.sum(),
        rate  : 15,
        range : 250,
        spread: rand(enemyManager.bossCount / 2 + 0.4),
        dx    : 0,
        dy    : 35
    });

    // Movement
    this.movement = movement.basic;
}

/**
 * A gunner miniboss that fires hammers instead of bullets
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('PaladinEnemy', 'Gunner');
function Paladin(x, y) {
    this.super(
        /* sprite name */ 'enemyPaladin',
        /* x position  */ x,
        /* y position  */ y,
        /* health      */ 100 * Enemy.pow(1.1),
        /* speed       */ 3 + 0.25 * enemyManager.bossCount,
        /* range       */ 300,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY
    );

    // Weapon data
    this.addWeapon(weapon.gun, {
        sprite: 'hammer',
        damage: 4 * Enemy.sum(),
        rate  : 60,
        range : 300,
        spread: Math.min((enemyManager.bossCount - 3) / 4, 2),
        dx    : 0,
        dy    : 45
    });

    // Movement
    this.movement = movement.basic;

    // Knockback reduction
    this.knockbackFactor = 0.4;
}
