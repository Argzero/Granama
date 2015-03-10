/**
 * A light rocket enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightRocketer', 'Enemy');
function LightRocketer(x, y) {
    this.super(
        /* sprite name */ 'enemyLightRocket',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 30 * Enemy.pow(0.9),
        /* speed       */ 2 + 0.2 * gameScreen.bossCount,
        /* range       */ 300,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY
    );

    // Weapon data
    this.addWeapon(weapon.gun, {
        sprite: 'rocket',
        damage: Enemy.sum() * 4,
        rate  : 60,
        range : 325,
        dx    : 0,
        dy    : 30,
        target: Robot.PLAYER,
        //                                 args: [type,    radius, knockback
        templates: [{ name: 'setupRocket', args: ['Enemy', 100,    150] }]
    });

    // Movement
    this.movement = movement.basic;
}

/**
 * A heavy rocket enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyRocketer', 'Enemy');
function HeavyRocketer(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavyRocket',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 45 * Enemy.pow(0.9),
        /* speed       */ 2 + 0.2 * gameScreen.bossCount,
        /* range       */ 400,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY
    );

    // Weapon data
    this.addWeapon(weapon.gun, {
        sprite: 'rocket',
        damage: Enemy.sum() * 7,
        rate  : 70,
        range : 425,
        dx    : 0,
        dy    : 30,
        target: Robot.PLAYER,
        //                                 args: [type,    radius, knockback
        templates: [{ name: 'setupRocket', args: ['Enemy', 200,    150] }]
    });

    // Movement
    this.movement = movement.basic;
}

/**
 * A rocket miniboss that drops artillery down on players
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
// extend('enemyHarrier', 'Enemy');
// function Paladin(x, y) {
    // this.super(
        // /* sprite name */ 'enemyPaladin',
        // /* x position  */ x,
        // /* y position  */ y,
        // /* enemy type  */ Robot.MOB,
        // /* health      */ 100 * Enemy.pow(1.1),
        // /* speed       */ 3 + 0.25 * gameScreen.bossCount,
        // /* range       */ 300,
        // /* exp         */ Enemy.MINIBOSS_EXP,
        // /* rank        */ Enemy.MINIBOSS_ENEMY
    // );

    // // Weapon data
    // this.addWeapon(weapon.gun, {
        // sprite: 'hammer',
        // damage: 4 * Enemy.sum(),
        // rate  : 60,
        // range : 300,
        // spread: Math.min((gameScreen.bossCount - 3) / 4, 2),
        // dx    : 0,
        // dy    : 45,
        // target: Robot.PLAYER
    // });

    // // Movement
    // this.movement = movement.basic;

    // // Knockback reduction
    // this.knockbackFactor = 0.4;
// }
