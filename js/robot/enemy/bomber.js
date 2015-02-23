/**
 * An enemy that drops either mines or turrets while orbiting the players
 *
 * @param {string}        name         - name of the enemy sprite image
 * @param {number}        x            - initial horizontal position
 * @param {number}        y            - initial vertical position
 * @param {number}        type         - Robot type ID of the enemy (should be Robot.MOB)
 * @param {number}        health       - max health
 * @param {number}        speed        - movement speed
 * @param {number}        range        - attack range
 * @param {number}        exp          - experience yield
 * @param {string}        rank         - difficulty rank
 * @param {number}        [patternMin] - minimum time between switching attack patterns
 * @param {number}        [patternMax] - maximum time between switching attack patterns
 * @param {function}      weapon       - the weapon type to use (mines or turrets)
 * @param {number}        damage       - damage dealt by mines or turrets
 * @param {number}        rate         - how fast to lay down the mines or turrets
 * @param {number|string} other        - the type of mine or the health of a turret
 *
 * @constructor
 */
extend('Bomber', 'Enemy');
function Bomber(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax, weapon, damage, rate, other) {
    this.super(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax);
    this.movement = movement.orbit;
    this.addWeapon(weapon, {
        damage: damage * Enemy.sum(),
        rate  : rate,
        range : range + 100,
        type  : other,
        health: other,
        target: Robot.PLAYER
    });
    this.turnDivider = 100;
}

/**
 * Checks to see if the bomber is in range while ignoring orientation
 *
 * @param {number} range - weapon range
 *
 * @returns {boolean} true if in range, false otherwise
 */
Bomber.prototype.isInRange = function(range) {
    var player = getClosestPlayer(this.pos);
    return player.health > 0 && this.pos.distanceSq(player.pos) < sq(range + this.speed);
};

/**
 * A light bomber enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightBomber', 'Bomber');
function LightBomber(x, y) {
    this.super(
        /* sprite name */ 'enemyLightBomber',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 15 * Enemy.pow(0.9),
        /* speed       */ 2.5 + 0.25 * gameScreen.bossCount,
        /* range       */ 400,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* weapon      */ weapon.mine,
        /* damage      */ 3,
        /* rate        */ 90,
        /* type        */ 'LightBomber'
    );
}

/**
 * A heavy bomber enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyBomber', 'Bomber');
function HeavyBomber(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavyBomber',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 20 * Enemy.pow(0.9),
        /* speed       */ 2.5 + 0.25 * gameScreen.bossCount,
        /* range       */ 500,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* weapon      */ weapon.mine,
        /* damage      */ 5,
        /* rate        */ 90,
        /* type        */ 'HeavyBomber'
    );
}

/**
 * A bomber miniboss that places turrets instead of mines
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('Turreter', 'Bomber');
function Turreter(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavyBomber',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 120 * Enemy.pow(1.1),
        /* speed       */ 2.5 + 0.2 * gameScreen.bossCount,
        /* range       */ 550,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* weapon      */ weapon.turret,
        /* damage      */ 1,
        /* rate        */ 600,
        /* turret hp   */ 50 * Enemy.pow(0.8)
    );

    this.knockbackFactor = 0.4;
}