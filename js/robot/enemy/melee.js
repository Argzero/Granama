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
    this.ignoreClamp = true;
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

/**
 * A melee miniboss that carries players with him while 
 * charging until they kill it
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('Brute', 'Melee');
function Brute(x, y) {
    this.super(
        /* sprite name */ 'enemyBrute',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 250 * Enemy.pow(1.1),
        /* speed       */ 2.5 + 0.3 * gameScreen.bossCount,
        /* range       */ 400,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* damage      */ 1,
        /* distance    */ 250,
        /* duration    */ 180
    );
    this.movement = this.ram;
    this.pierceDamage = 0.4;
}

// Brutes can't be stunned or knocked back
Brute.prototype.stun = function() { };
Brute.prototype.knockback = function() { };

/**
 * Unique movement that pins players against a wall
 */
Brute.prototype.ram = function() {
    this.charge = movement.charge;
    if (!this.player) {
        this.charge();
        var target = movement.getTargetPlayer(this);
        if (target.health > 0 && this.collides(target) && !target.bullied) {
            target.damage(this.power * 10, this);
            this.player = target;
            this.player.bullied = true;
        }
    }
    if (this.player && this.player.dead) {
        this.player.bullied = false;
        this.player = false;
    }
    else if (this.player) {
        
        this.charging = 5;
        this.ignoreClamp = false;
        var r = (this.width + this.player.width) * 0.5;
        var forward = this.forward();
        this.pos.add(forward.x * this.speed * 2, forward.y * this.speed * 2);
        forward.multiply(r, r);
        this.player.pos.x = this.pos.x + forward.x;
        this.player.pos.y = this.pos.y + forward.y;
        this.player.clamp();
        if (this.player.pos.distanceSq(this.pos) < r * r - 1 && !this.wallDamage) {
            this.wallDamage = true;
            this.player.damage(this.power * 2, this);
        }
        this.pos.x = this.player.pos.x - forward.x;
        this.pos.y = this.player.pos.y - forward.y;
        if (this.player.grapple) {
            this.player.grapple.expired = true;
        }
    }
};

Brute.prototype.onDeath = function() {
    if (this.player) {
        this.player.bullied = false;
    }
};