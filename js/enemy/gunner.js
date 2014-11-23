depend('enemy/enemy');

/**
 * A basic ranged enemy that fires spread shot bullets
 *
 * @param {string} name         - name of the enemy sprite image
 * @param {number} x            - initial horizontal position
 * @param {number} y            - initial vertical position
 * @param {number} health       - max health
 * @param {number} speed        - movement speed
 * @param {number} range        - attack range
 * @param {number} exp          - experience yield
 * @param {string} rank         - difficulty rank
 * @param {number} [patternMin] - minimum time between switching attack patterns
 * @param {number} [patternMax] - maximum time between switching attack patterns
 * @param {number} rate         - attack rate
 * @param {number} spread       - attack spread
 * @param {number} dx           - bullet horizontal offset
 * @param {number} dy           - bullet vertical offset
 * @param {string} bullet       - bullet sprite image name
 *
 * @constructor
 */
extend('Gunner', 'Enemy');
function Gunner(name, x, y, health, speed, range, exp, rank, patternMin, patternMax, rate, spread, dx, dy, bullet) {
    this.super(name, x, y, health, speed, range, exp, rank, patternMin, patternMax);
    this.movement = movement.basic;
    this.addWeapon(weapon.gun, {
        sprite: bullet,
        damage: Enemy.sum(),
        rate  : rate,
        range : range,
        spread: spread,
        dx    : dx,
        dy    : dy
    });
}

/**
 * A light gunner enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightGunner', 'Gunner');
function LightGunner(x, y) {
    this.super(
        /* sprite name */ 'enemyLightRanged',
        /* x position  */ x,
        /* y position  */ y,
        /* health      */ 20 * Enemy.pow(0.9),
        /* speed       */ 2.5 + 0.2 * enemyManager.bossCount,
        /* range       */ 200,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* attack rate */ 20,
        /* spread      */ rand(enemyManager.bossCount / 2 + 0.4),
        /* dx          */ 23,
        /* dy          */ 30,
        /* bullet      */ 'bullet'
    );
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
        /* rank        */ Enemy.HEAVY_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* attack rate */ 15,
        /* spread      */ rand(enemyManager.bossCount / 2 + 0.4),
        /* dx          */ 0,
        /* dy          */ 35,
        /* bullet      */ 'bullet'
    );
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
        /* rank        */ Enemy.MINIBOSS_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* attack rate */ 60,
        /* spread      */ Math.min((enemyManager.bossCount - 3) / 4, 2),
        /* dx          */ 0,
        /* dy          */ 45,
        /* bullet      */ 'hammer'
    );

    this.knockbackFactor = 0.4;
}
