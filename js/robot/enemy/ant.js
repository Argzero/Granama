/**
 * A robot that charges at players, knocking them out of the way upon collision
 *
 * @param {string} name          - name of the enemy sprite image
 * @param {number} x             - initial horizontal position
 * @param {number} y             - initial vertical position
 * @param {number} type          - Robot type ID of the enemy (should be Robot.MOB)
 * @param {number} health        - max health
 * @param {number} speed         - movement speed
 * @param {number} range         - attack range
 * @param {number} exp           - experience yield
 * @param {string} rank          - difficulty rank
 * @param {number} patternMin    - minimum time between switching attack patterns
 * @param {number} patternMax    - maximum time between switching attack patterns
 * @param {number} waveDamage    - damage dealt by the shockwave
 * @param {number} waveRange     - range of the shockwave
 * @param {number} waveKnockback - amount of knockback the shockwave applies
 * @param {number} attackTime    - how long to remain unburrowed and attacking
 * @param {number} restSpeed     - how fast to run away while resting
 * @param {number} restTime      - how long to remain resting
 *
 * @constructor
 */
extend('Ant', 'Enemy');
function Ant(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax, waveDamage, waveRange, waveKnockback, attackTime, restSpeed, restTime) {
    this.super(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax);

    this.movement = movement.burrow;
    this.shockwaveDamage = waveDamage;
    this.shockwaveRange = waveRange;
    this.shockwaveKnockback = waveKnockback;
    this.attackTime = attackTime;
    this.restSpeed = restSpeed;
    this.restTime = restTime;
}

/**
 * Checks to see if the bomber is in range while ignoring orientation
 *
 * @param {number} range - weapon range
 *
 * @returns {boolean} true if in range, false otherwise
 */
Ant.prototype.isInRange = function(range) {
    var player = getClosestPlayer(this.pos);
    return this.attacking > 0 && player && player.health > 0 && this.pos.distanceSq(player.pos) < sq(range + this.speed);
};

/**
 * Updates the tail each frame
 */
Ant.prototype.onPreDraw = function() {
    this.tail.update();
};

/**
 * A light ant enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightAnt', 'Ant');
function LightAnt(x, y) {
    this.super(
        /* sprite name */ 'enemyLightAnt',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 50 * Enemy.pow(0.9),
        /* speed       */ 5 + 0.1 * gameScreen.bossCount,
        /* range       */ 150,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY,
        /* Pattern Min */ 0,
        /* Pattern Max */ 0,
        /* Wave Damage */ Enemy.sum() * 0.25,
        /* Wave Range  */ 200,
        /* Knockback   */ 0,
        /* Attack Time */ 60,
        /* Rest Speed  */ 2,
        /* Rest Time   */ 300
    );
    
    // Claw sprites
    this.postChildren.push(
        new Sprite('enemyLightAntClaws', 0, 10).child(this, true)
    );
    
    // The enemy's tail
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'enemyLightAntMid',
        /* End        */ 'enemyLightAntTail',
        /* Length     */ 2,
        /* Offset     */ 20,
        /* Base       */ -5,
        /* End Offset */ 0,
        /* Constraint */ 30,
        /* Front      */ true
    );
    
    // Weapon
    this.addWeapon(weapon.rail, {
        damage   : Enemy.sum() * 0.25,
        rate     : 65,
        range    : 250,
        discharge: 0,
        initial  : true,
        angle    : 30,
        speed    : 15,
        dx       : 0,
        dy       : 35,
        duration : 5,
        bullets  : 3,
        target   : Robot.PLAYER
    });
}

/**
 * A heavy ant enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyAnt', 'Ant');
function HeavyAnt(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavyAnt',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 80 * Enemy.pow(0.9),
        /* speed       */ 5.5 + 0.1 * gameScreen.bossCount,
        /* range       */ 200,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY,
        /* Pattern Min */ 0,
        /* Pattern Max */ 0,
        /* Wave Damage */ Enemy.sum() * 0.5,
        /* Wave Range  */ 250,
        /* Knockback   */ 0,
        /* Attack Time */ 60,
        /* Rest Speed  */ 2,
        /* Rest Time   */ 300
    );
    
    // Claw sprites
    this.postChildren.push(
        new Sprite('enemyHeavyAntClaws', 0, 10).child(this, true)
    );
    
    // The enemy's tail
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'enemyHeavyAntMid',
        /* End        */ 'enemyHeavyAntTail',
        /* Length     */ 2,
        /* Offset     */ 30,
        /* Base       */ -10,
        /* End Offset */ 0,
        /* Constraint */ 30,
        /* Front      */ true
    );
    
    // Weapon
    this.addWeapon(weapon.rail, {
        damage   : Enemy.sum() * 0.5,
        rate     : 65,
        range    : 250,
        discharge: 0,
        initial  : true,
        angle    : 30,
        speed    : 15,
        dx       : 0,
        dy       : 35,
        duration : 5,
        bullets  : 3,
        target   : Robot.PLAYER
    });
}

/**
 * A heavy ant enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('Goliath', 'Ant');
function Goliath(x, y) {
    this.super(
        /* sprite name */ 'enemyGoliath',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 375 * Enemy.pow(1.1),
        /* speed       */ 5.5 + 0.1 * gameScreen.bossCount,
        /* range       */ 150,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY,
        /* Pattern Min */ 0,
        /* Pattern Max */ 0,
        /* Wave Damage */ Enemy.sum(),
        /* Wave Range  */ 200,
        /* Knockback   */ 25,
        /* Attack Time */ 60,
        /* Rest Speed  */ 2.5,
        /* Rest Time   */ 180
    );
    
    // Claw sprites
    this.postChildren.push(
        new Sprite('enemyGoliathClaws', 0, 10).child(this, true)
    );
    
    // The enemy's tail
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'enemyGoliathSegment',
        /* End        */ 'enemyGoliathEnd',
        /* Length     */ 3,
        /* Offset     */ 35,
        /* Base       */ 15,
        /* End Offset */ 0,
        /* Constraint */ 30,
        /* Front      */ true
    );
    
    // Weapon
    this.addWeapon(weapon.gun, {
        sprite   : 'bossFlame',
        damage   : Enemy.sum() * 0.1,
        rate     : 3,
        range    : 200,
        speed    : 10,
        dx       : 0,
        dy       : 35,
        pierce   : true,
        onUpdate : projEvents.fireUpdate,
        target   : Robot.PLAYER
    });
}
