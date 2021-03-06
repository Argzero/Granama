/**
 * A light artillery enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightArtillery', 'Enemy');
function LightArtillery(x, y) {
    this.super(
        /* sprite name */ 'enemyLightArtillery',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 10 * Enemy.pow(0.9),
        /* speed       */ 2 + 0.1 * gameScreen.bossCount,
        /* range       */ 400,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY
    );

    // Weapon data
    this.addWeapon(weapon.gun, {
        sprite: 'bullet',
        damage: Enemy.sum(),
        rate  : 45,
        range : 400,
        spread: rand((gameScreen.bossCount + 1) / 3),
        dx    : 0,
        dy    : 38,
        target: Robot.PLAYER
    });

    // Movement
    this.movement = movement.basic;
}

/**
 * A heavy artillery enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyArtillery', 'Enemy');
function HeavyArtillery(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavyArtillery',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 30 * Enemy.pow(0.9),
        /* speed       */ 1.5 + 0.1 * gameScreen.bossCount,
        /* range       */ 425,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY
    );

    // Weapon data
    this.addWeapon(weapon.gun, {
        sprite: 'bullet',
        damage: 2 * Enemy.sum(),
        rate  : 35,
        range : 425,
        spread: rand((gameScreen.bossCount + 1) / 3),
        dx    : 0,
        dy    : 53,
        target: Robot.PLAYER
    });

    // Movement
    this.movement = movement.basic;
}

/**
 * An artillery miniboss that fires a powerful laser railgun instead of bullets
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('Railer', 'Enemy');
function Railer(x, y) {
    this.super(
        /* sprite name */ 'enemyRailer',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 80 * Enemy.pow(1.1),
        /* speed       */ 2 + 0.2 * gameScreen.bossCount,
        /* range       */ 550,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0
    );

    // Rail weapon
    this.addWeapon(weapon.rail, {
        sprite   : 'bossLaser',
        damage   : 0.2 * Enemy.sum(),
        rate     : 60,
        range    : 600,
        discharge: 0.1,
        duration : 120,
        pierce   : true,
        dy       : 68,
        dx       : 0,
        target   : Robot.PLAYER
    });

    // Movement pattern
    this.movement = movement.basic;

    // Knockback reduction
    this.knockbackFactor = 0.4;
}
