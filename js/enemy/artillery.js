depend('enemy/enemy');
depend('enemy/gunner');

/**
 * A light artillery enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightArtillery', 'Gunner');
function LightArtillery(x, y) {
    this.super(
        /* sprite name */ 'enemyLightArtillery',
        /* x position  */ x,
        /* y position  */ y,
        /* health      */ 10 * Enemy.pow(0.9),
        /* speed       */ 2 + 0.1 * enemyManager.bossCount,
        /* range       */ 400,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* attack rate */ 45,
        /* spread      */ rand((enemyManager.bossScore + 1) / 3),
        /* dx          */ 0,
        /* dy          */ 38,
        /* bullet      */ 'bullet'
    );
}

/**
 * A heavy artillery enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyArtillery', 'Gunner');
function HeavyArtillery(x, y) {
    this.super(
        /* sprite name */ 'enemyLightArtillery',
        /* x position  */ x,
        /* y position  */ y,
        /* health      */ 30 * Enemy.pow(0.9),
        /* speed       */ 1.5 + 0.1 * enemyManager.bossCount,
        /* range       */ 425,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* attack rate */ 35,
        /* spread      */ rand((enemyManager.bossScore + 1) / 3),
        /* dx          */ 0,
        /* dy          */ 53,
        /* bullet      */ 'bullet'
    );
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
        /* health      */ 80 * Enemy.pow(1.1),
        /* speed       */ 2 + 0.2 * enemyManager.bossCount,
        /* range       */ 550,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0
    );

    this.knockbackFactor = 0.4;

    // Movement pattern
    this.movement = movement.basic;

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
        dx       : 0
    });
}
