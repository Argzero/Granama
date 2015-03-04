depend('robot/ropeTail');

/**
 * An enemy that orbits players while shooting bullets sideways
 *
 * @param {string}   name         - name of the enemy sprite image
 * @param {number}   x            - initial horizontal position
 * @param {number}   y            - initial vertical position
 * @param {number}   type         - Robot type ID of the enemy (should be Robot.MOB)
 * @param {number}   health       - max health
 * @param {number}   speed        - movement speed
 * @param {number}   range        - attack range
 * @param {number}   exp          - experience yield
 * @param {string}   rank         - difficulty rank
 * @param {number}   [patternMin] - minimum time between switching attack patterns
 * @param {number}   [patternMax] - maximum time between switching attack patterns
 * @param {number}   damage       - damage dealt by mines or turrets
 * @param {number}   rate         - how fast to lay down the mines or turrets
 *
 * @constructor
 */
extend('Orbiter', 'Enemy');
function Orbiter(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax, damage, rate) {
    this.super(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax);
    this.movement = movement.orbit;
    this.addWeapon(weapon.gun, {
        damage      : damage * Enemy.sum(),
        rate        : rate,
        range       : range + 100,
        angleOffset : 90,
        target      : Robot.PLAYER
    });
    this.addWeapon(weapon.gun, {
        damage      : damage * Enemy.sum(),
        rate        : rate,
        range       : range + 100,
        angleOffset : -90,
        target      : Robot.PLAYER
    });
}

/**
 * Checks to see if the bomber is in range while ignoring orientation
 *
 * @param {number} range - weapon range
 *
 * @returns {boolean} true if in range, false otherwise
 */
Orbiter.prototype.isInRange = function(range) {
    var player = getClosestPlayer(this.pos);
    return player.health > 0 && this.pos.distanceSq(player.pos) < sq(range + this.speed);
};

/**
 * Updates the tail each frame
 */
Orbiter.prototype.onPreDraw = function() {
    this.tail.update();
};

/**
 * A light orbiter enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightOrbiter', 'Orbiter');
function LightOrbiter(x, y) {
    this.super(
        /* sprite name */ 'enemyLightOrbiter',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 60 * Enemy.pow(0.9),
        /* speed       */ 4 + 0.5 * gameScreen.bossCount,
        /* range       */ 300,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* damage      */ 1,
        /* rate        */ 45
    );

    // The enemy's tail
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'enemyLightOrbiterTail',
        /* End        */ 'enemyLightOrbiterTail',
        /* Length     */ 3,
        /* Offset     */ 28,
        /* Base       */ 12,
        /* End Offset */ 0,
        /* Constraint */ 30
    );
}

/**
 * A heavy orbiter enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyOrbiter', 'Orbiter');
function HeavyOrbiter(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavyOrbiter',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 80 * Enemy.pow(0.9),
        /* speed       */ 3.75 + 0.45 * gameScreen.bossCount,
        /* range       */ 300,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* damage      */ 2,
        /* rate        */ 60
    );

    // The enemy's tail
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'enemyHeavyOrbiterTail',
        /* End        */ 'enemyHeavyOrbiterTail',
        /* Length     */ 3,
        /* Offset     */ 30,
        /* Base       */ 5,
        /* End Offset */ 0,
        /* Constraint */ 30
    );
}

/**
 * An orbiter miniboss that switches to melee attacks when low on health
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('Hunter', 'Orbiter');
function Hunter(x, y) {
    this.super(
        /* sprite name */ 'enemyHunter',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 300 * Enemy.pow(1.1),
        /* speed       */ 3.5 + 0.4 * gameScreen.bossCount,
        /* range       */ 350,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* damage      */ 3,
        /* rate        */ 45
    );

    // The enemy's tail
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'enemyHunterSegment',
        /* End        */ 'enemyHunterEnd',
        /* Length     */ 4,
        /* Offset     */ 40,
        /* Base       */ 6,
        /* End Offset */ 0,
        /* Constraint */ 30
    );
}

/**
 * Switches to melee form when low on health
 */
Hunter.prototype.onUpdate = function() {
    if (this.health < this.maxHealth * 0.5 && this.movement != movement.basic) {
        this.movement = movement.basic;
        this.range = 50;
        this.addWeapon(weapon.melee, {
            damage: 4 * Enemy.sum(),
            rate  : 40,
            range : 50,
            target: Robot.PLAYER
        });
    }
};