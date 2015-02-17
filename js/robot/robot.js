depend('draw/sprite');
depend('lib/math');
depend('lib/2d/vector');
depend('robot/weapons');

// Individual types
Robot.PLAYER = 1;
Robot.MOB = 2;
Robot.BOSS = 4;
Robot.TURRET = 8;
Robot.MINE = 16;

// Groups
Robot.ENEMY = 14; // All basic enemy types (turrets, mobs, and bosses)
Robot.MOBILE = 6; // Enemies other than turrets
// You can combine more types by using the bitwise or (e.g. Robot.ENEMY | Robot.MINE)

/**
 * Base class for damageable robots
 *
 * @param {string} name   - sprite image name
 * @param {number} x      - initial horizontal position
 * @param {number} y      - initial vertical position
 * @param {number} type   - type ID of the robot (see above for values)
 * @param {number} health - max health
 * @param {number} speed  - base speed
 *
 * @constructor
 */
extend('Robot', 'Sprite');
function Robot(name, x, y, type, health, speed) {
    this.super(name, x, y);

	this.type = type;
    this.maxHealth = health;
    this.health = health;
    this.maxShield = 0;
    this.shield = 0;
    this.speed = speed;
	
	this.damageTaken = 0;
	this.damageDealt = 0;
	this.damageAbsorbed = 0;
	this.deaths = 0;

	this.pierceDamage = 1;
    this.defense = 1;
    this.power = 1;
    this.knockbackFactor = 1;
    this.knockbackSpeed = 10;
    this.dead = false;
    this.expired = false;

    this.knockbackDir = new Vector(0, 0);
    this.buffs = {};
	
	////////////
	// Events //
	////////////
	
	/**
	 * Called after knockback and buffs are updated each update
	 */
	this.onUpdate = undefined;
	
	/**
	 * Called before robots are drawn to the screen
	 */
	this.onPreDraw = undefined;
	
	/**
	 * Called after robots are drawn to the screen
	 */
	this.onPostDraw = undefined;
	
	/**
	 * Called when the robot takes damage
	 *
	 * @param {Number} amount - amount of damage taken
	 * @param {Robot}  source - source of the damage
	 *
	 * @returns {Number} modified damage amount or undefined if no changes
	 */
	this.onDamaged = undefined;
	
	/**
	 * Called when the robot is healed by any source
	 *
	 * @param {Number} amount - healing amount
	 *
	 * @returns {Number} modified healing amount or undefined if no changes
	 */
	this.onHealed = undefined;
}

/**
 * Damages the robot, launching an event before applying damage
 *
 * @param {number} amount - the amount of damage to deal
 * @param {Robot}  source - the source of the damage
 */
Robot.prototype.damage = function(amount, source) {
	
	// Ignore damage when dead
	if (this.dead || amount <= 0) return;

	// Defense application
    amount *= this.get('defense');

    // Event for taking damage
    if (this.onDamaged) {
		var result = this.onDamaged(amount, source);
        if (result !== undefined) {
            amount = result;
        }
	}
	
	// Credit source of damage with the dealt damage
	source.damageDealt += amount;

    // Shield absorbs all the damage
    if (this.shield > amount) {
        this.shield -= amount;
		this.damageAbsorbed += amount;
    }

    // Taking health damage
    else {
        amount -= this.shield;
		this.damageAbsorbed += this.shield;
		this.shield = 0;
		this.damageTaken += amount;
        this.health -= amount;
		this.dead = this.health <= 0;
		if (this.dead) {
            this.deaths++;
            
        }
    }
};

/**
 * Heals the robot
 *
 * @param {number} amount - the amount to heal the robot by
 */
Robot.prototype.heal = function(amount) {

    // Event for healing
    if (this.onHealed) {
		var result = this.onHealed(amount);
		if (result !== undefined) {
			amount = result;
		}
	}

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
    return (this[name] || 1) * m;
};

/**
 * Applies a buff to the robot, modifying a stat
 *
 * @param {string} name       - the name of the stat
 * @param {number} multiplier - the multiplier for the stat
 * @param {number} duration   - the duration of the buff in frames
 */
Robot.prototype.buff = function(name, multiplier, duration) {
    this.buffs[name] = {multiplier: multiplier, duration: duration};
};

/**
 * Checks whether or not the robot is stunned
 *
 * @returns {boolean} true if stunned, false otherwise
 */
Robot.prototype.isStunned = function() {
    return this.buffs['stun'] !== undefined || this.knockbackDir.lengthSq() > 0;
};

/**
 * Stuns the robot temporarily
 *
 * @param duration duration of the stun
 */
Robot.prototype.stun = function(duration) {
    this.buffs['stun'] = {duration: duration};
};

/**
 * Knocks back the robot according to the vector
 *
 * @param {Vector} knockback - the relative offset to push
 */
Robot.prototype.knockback = function(knockback) {
    this.knockbackDir = knockback.multiply(this.knockbackFactor, this.knockbackFactor);
};

/**
 * The base update function for robots
 */
Robot.prototype.updateRobot = function() {

    // Update buffs, removing them when expired
    for (var buff in this.buffs) {
        if (--this.buffs[buff].duration <= 0) {
            delete this.buffs[buff];
        }
    }

    // Apply knockback
    if (this.knockbackDir.lengthSq() > 0) {
        var l = this.knockbackDir.length();
        if (l < this.knockbackSpeed) l = this.knockbackSpeed;
        var dx = this.knockbackDir.x * this.knockbackSpeed / l;
        var dy = this.knockbackDir.y * this.knockbackSpeed / l;
        this.knockbackDir.add(-dx, -dy);
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
        var greenWidth = this.width * this.health / this.maxHealth;
        ui.ctx.fillStyle = "#00FF00";
        ui.ctx.fillRect(-this.width / 2, -10, greenWidth, 5);
        ui.ctx.fillStyle = "#FF0000";
        ui.ctx.fillRect(greenWidth - this.width / 2, -10, this.width - greenWidth, 5);
    }
};

/**
 * Clamps the position of the robot inside the arena
 *
 * @param bounds bounds of the arena
 */
Robot.prototype.clamp = function() {
    this.pos.x = clamp(this.pos.x, this.width / 2, GAME_WIDTH - this.width / 2);
    this.pos.y = clamp(this.pos.y, this.width / 2, GAME_HEIGHT - this.width / 2);
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
