depend('draw/sprite');
depend('lib/math');
depend('lib/2d/vector');

/**
 * Available events for robot objects:
 *
 * onPreDraw - before the sprite and its children are drawn
 * onDraw    - after the sprite and its children is drawn
 * onUpdate  - when the robot updates and isn't stunned
 * onDamaged - when the robot takes damage
 * onHealed  - when the robot is healed
 */

/**
 * Base class for damageable robots
 *
 * @param {string} name   - sprite image name
 * @param {number} x      - initial horizontal position
 * @param {number} y      - initial vertical position
 * @param {number} health - max health
 * @param {number} speed  - base speed
 *
 * @constructor
 */
extend('Robot', 'Sprite');
function Robot(name, x, y, health, speed) {
    this.super(name, x, y);

    this.maxHealth = health;
    this.health = health;
    this.maxShield = 0;
    this.shield = 0;
    this.speed = speed;

    this.defense = 1;
    this.damage = 1;
    this.knockbackSpeed = 10;
    this.dead = false;

    this.knockback = new Vector(0, 0);
    this.buffs = {};
}

/**
 * Damages the robot, launching an event before applying damage
 *
 * @param {number} amount - the amount of damage to deal
 * @param {Robot}  source - the source of the damage
 */
Robot.prototype.damage = function(amount, source) {

    // Event for taking damage
    if (this.onDamaged) this.onDamaged(amount, source);

    // Defense application
    amount *= this.get('defense');

    // Shield absorbs all the damage
    if (this.shield > amount) {
        this.shield -= amount;
    }

    // Taking health damage
    else {
        amount -= this.shield;
        this.shield = 0;
        this.health -= amount;
        this.dead = this.health <= 0;
    }
};

/**
 * Heals the robot
 *
 * @param {number} amount - the amount to heal the robot by
 */
Robot.prototype.heal = function(amount) {

    // Event for healing
    if (this.onHealed) this.onHealed(amount);

    // Apply healing
    this.health = Math.min(this.health + amount, this.maxHealth);
};

/**
 * Gets the forward vector of the robot for shooting or moving forward
 *
 * @returns {Vector} the robot's forward vector
 */
Robot.prototype.forward = function() {
    return this.rotation.clone().rotate(0, 1);
};

/**
 * Gets a stat of the robot while checking for applied buffs
 *
 * @param {string} name - name of the buff
 *
 * @returns {number} the value of the stat
 */
Robot.prototype.get = function(name) {
    var m = 1;
    if (this.buffs[name]) m = this.buffs[name].multiplier;
    return this[name] * m;
};

/**
 * Applies a buff to the robot, modifying a stat
 *
 * @param {string} name       - the name of the stat
 * @param {number} multiplier - the multiplier for the stat
 * @param {number} duration   - the duration of the buff in frames
 */
Robot.prototype.buff = function(name, multiplier, duration) {
    this.buffs[name] = { multiplier: multiplier, duration: duration };
};

/**
 * Checks whether or not the robot is stunned
 *
 * @returns {boolean} true if stunned, false otherwise
 */
Robot.prototype.isStunned = function() {
    return this.buffs['stun'] !== undefined || this.knockback.lengthSq() > 0;
};

/**
 * Stuns the robot temporarily
 *
 * @param duration duration of the stun
 */
Robot.prototype.stun = function(duration) {
    this.buffs['stun'] = { duration: duration };
};

/**
 * Knocks back the robot according to the vector
 *
 * @param {Vector} knockback - the relative offset to push
 */
Robot.prototype.knockback = function(knockback) {
    this.knockback = knockback;
};

/**
 * The base update function for robots
 */
Robot.prototype.updateBase = function() {

    // Update buffs, removing them when expired
    for (var buff in this.buffs) {
        if (--buf.duration <= 0) {
            delete this.buffs[buff];
        }
    }

    // Apply knockback
    if (this.knockback.lengthSq() > 0) {
        var l = this.knockback.length();
        if (l < this.knockbackSpeed) l = this.knockbackSpeed;
        var dx = this.knockback.x * this.knockbackSpeed / l;
        var dy = this.knockback.y * this.knockbackSpeed / l;
        this.knockback.add(-dx, -dy);
        this.move(dx, dy);
    }

    // Update event
    if (this.onUpdate) this.onUpdate();
};

/**
 * Draws the health bar for the robot
 */
Robot.prototype.drawHealthBar = function(camera) {
    if (this.health < this.maxHealth) {
        var greenWidth = this.sprite.width * this.health / this.maxHealth;
        camera.ctx.fillStyle = "#00FF00";
        camera.ctx.fillRect(-this.sprite.width / 2, -10, greenWidth, 5);
        camera.ctx.fillStyle = "#FF0000";
        camera.ctx.fillRect(greenWidth - this.sprite.width / 2, -10, this.sprite.width - greenWidth, 5);
    }
};

/**
 * Clamps the position of the robot inside the arena
 *
 * @param bounds bounds of the arena
 */
Robot.prototype.clamp = function(bounds) {
    this.pos.x = clamp(this.pos.x, bounds.x, bounds.x + bounds.width);
    this.pos.y = clamp(this.pos.y, bounds.y, bounds.y + bounds.height);
};

/**
 * Checks whether or not the robot is in range to fire weapons (should be overridden)
 *
 * @param {number} range - range of the weapon
 *
 * @returns {boolean} true if in range, false otherwise
 */
Robot.prototype.isInRange = function(range) {
    return true;
};

// Functions
/*
isBoss: enemyFunctions.isBoss,
stun: enemyFunctions.stun,
AddWeapon: enemyFunctions.AddWeapon,
SetRange: enemyFunctions.SetRange,
SetMovement: enemyFunctions.SetMovement,
Knockback: enemyFunctions.Knockback,
SwitchPattern: enemyFunctions.SwitchPattern,
Update: enemyFunctions.Update,
clamp: enemyFunctions.clamp,
Draw: enemyFunctions.Draw,
IsInRange: enemyFunctions.IsInRange,
Damage: enemyFunctions.Damage,
Slow: enemyFunctions.Slow
*/