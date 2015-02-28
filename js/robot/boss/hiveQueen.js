/**
 * The Hive Queen boss that uses lasers, stingers, and 
 * bee minions to fight the player
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 *
 * @constructor
 */
extend('HiveQueenBoss', 'Boss');
function HiveQueenBoss(x, y) {
    this.super(
        /* Sprite      */ 'bossQueen', 
        /* Position    */ x, y, 
        /* Type        */ Robot.BOSS, 
        /* Health      */ 300 * Enemy.pow(1.4) * players.length,
        /* Speed       */ 3 + 0.3 * gameScreen.bossCount,
        /* Move Range  */ 600,
        /* Experience  */ Enemy.BOSS_EXP,
        /* Stat Rank   */ Enemy.BOSS_ENEMY,
        /* Pattern Min */ 600,
        /* Pattern Max */ 600
    );
    
    this.pierceDamage = 0.2;
    
    // Starting movement of the queen
    this.movement = movement.basic;
    
    var damageScale = Boss.sum();

    // Stats for collision
    this.power = 3 * damageScale;
    this.distance = 400;
    this.chargeDuration = 180;
    this.patternTimer = this.patternMax;

    // Attack Pattern 0 - Charging around spawning bees
    this.setMovement(0, movement.charge);
    this.addWeapon(weapon.spawn, {
        enemies: QUEEN_SPAWNS,
        max    : 15,
        rate   : 45,
        delay  : 45,
        dx     : 0,
        dy     : 0,
        range  : 9999
    }, 0);

    // Attack pattern 1 - Backwards shooting
    this.setMovement(1, movement.backwards);
    for (var i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite: 'stinger',
            damage: damageScale * 3,
            range : 750,
            rate  : 45,
            spread: 2,
            dx    : -50 + 100 * i,
            dy    : -155,
            speed : -12
        }, 1);
    }

    // Attack pattern 2 - X Laser
    this.setMovement(2, movement.basic);
    for (var i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite     : 'bossLaser',
            damage     : damageScale * 0.2,
            pierce     : true,
            range      : 750,
            rate       : 1,
            dx         : -85 + 170 * i,
            dy         : 90,
            angleOffset: -10 + 20 * i
        }, 2);
    }

    // Set up abdomen/wings
    this.preChildren.push(new Sprite('bossQueenAbdomen', 0, -100).child(this, true));
    this.preChildren.push(new BeeWing('bossQueenWingLeft', 15, -30).child(this, true));
    this.preChildren.push(new BeeWing('bossQueenWingRight', -15, -30).child(this, true));
}

/**
 * A rotating wing used by bee enemies
 *
 * @param {string} name - sprite image name
 * @param {number} dx   - horizontal offset of the wing
 * @param {number} dy   - vertical offset of the wing
 *
 * @constructor
 */
extend('BeeWing', 'Sprite');
function BeeWing(name, dx, dy) {
    this.super(name, dx, dy); 
    this.pivot.x = -this.width / 2;
    this.pivot.y = this.height / 2;
    this.frame = 4;
    
    this.trig = new Vector(Math.cos(Math.PI / 20), Math.sin(Math.PI / 20));
    if (dx < 0) {
        this.trig.y = -this.trig.y;
        this.pivot.x = -this.pivot.x;
    }
}

/**
 * Rotates the wing each frame before being drawn
 */
BeeWing.prototype.onPreDraw = function() {
    if (!gameScreen.paused) {
        if (this.frame >= 0) this.rotation.rotate(this.trig.x, this.trig.y);
        else this.rotation.rotate(this.trig.x, -this.trig.y);
        this.frame++;
        if (this.frame >= 10) this.frame -= 20;
    }
};

/**
 * Hive Drone minion that chases down players
 *
 * @param {number} x - horizontal initial position
 * @param {number} y - vertical initial position
 *
 * @constructor
 */
extend('HiveDrone', 'Enemy');
function HiveDrone(x, y) {
    this.super(
        /* sprite name */ 'enemyHiveDrone',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 25 * Enemy.pow(0.9),
        /* speed       */ 4.5 + 0.4 * gameScreen.bossCount,
        /* range       */ 50,
        /* exp         */ 0,
        /* rank        */ Enemy.LIGHT_ENEMY
    );

    // Movement pattern
    this.movement = movement.basic;

    // Melee weapon
    this.addWeapon(weapon.melee, {
        damage: Enemy.sum(),
        rate  : 30,
        range : 50,
        target: Robot.PLAYER
    });

    // Set up abdomen/wings
    this.preChildren.push(new Sprite('enemyHiveDroneAbdomen', 0, -25).child(this, true));
    this.preChildren.push(new BeeWing('enemyHiveDroneWingLeft', 1, -5).child(this, true));
    this.preChildren.push(new BeeWing('enemyHiveDroneWingRight', -1, -5).child(this, true));
}

/**
 * Hive Queen minion that heals the queen
 *
 * @param {number} x - horizontal initial position
 * @param {number} y - vertical initial position
 *
 * @constructor
 */
 extend('HiveDefender', 'Enemy');
function HiveDefender(x, y) {
    this.super(
        /* sprite name */ 'enemyHiveDefender',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 35 * Enemy.pow(0.9),
        /* speed       */ 5 + 0.5 * gameScreen.bossCount,
        /* range       */ 200,
        /* exp         */ 0,
        /* rank        */ Enemy.LIGHT_ENEMY
    );

    // Movement pattern
    this.heal = this.health / 300;
    this.movement = movement.medic;
    
    // Set up abdomen/wings
    this.preChildren.push(new Sprite('enemyHiveDefenderAbdomen', 0, -22).child(this, true));
    this.preChildren.push(new BeeWing('enemyHiveDefenderWingLeft', 1, -5).child(this, true));
    this.preChildren.push(new BeeWing('enemyHiveDefenderWingRight', -1, -5).child(this, true));
}
