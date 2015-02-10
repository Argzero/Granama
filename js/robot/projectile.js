depend('lib/math');
depend('lib/2d/vector');

/**
 * The base code for the bullets in the game
 *
 * @param {string}    name    - name of the sprite image
 * @param {Number}    x       - horizontal offset from the gun when no rotation
 * @param {Number}    y       - vertical offset from the gun when no rotation
 * @param {Robot}     shooter - the robot shooting the projectile
 * @param {Transform} gun     - the gun the robot is firing from (used for position and direction)
 * @param {Number}    speed   - speed of the bullet in pixels per frame
 * @param {Number}    angle   - offset angle from the gun's rotation
 * @param {Number}    damage  - amount of damage the bullet deals on impact
 * @param {Number}    range   - expiring range of the bullet
 * @param {boolean}   pierce  - whether or not the bullet pierces through robots
 * @param {Number}    target  - ID of the robot group this bullet hits (see Robot)
 */
extend('Projectile', 'Sprite');
function Projectile(name, x, y, shooter, gun, speed, angle, damage, range, pierce, target) {
	this.super(name, x, y);
	
	this.shooter = shooter;
	this.rotation = gun.rotation.clone().rotateAngle(angle);
	this.vel = this.rotation.clone().multiply(speed);
	this.speed = speed;
	this.damage = damage;
	this.range = range;
	this.pierce = pierce;
	this.group = target;
	this.expired = false;
	
	this.pos.rotatev(gun.rotation);
	this.pos.addv(gun.pos);
	this.origin = this.pos.clone();
	
	/**
	 * Event for updating the bullet after checking velocity and range bounds
	 */
	this.onUpdate = undefined;
	
	/**
	 * Event for checking collisions with potential targets
	 *
	 * @param {Robot} target - the target being checked against
	 *
	 * @returns {boolean} true if can collide with the target, false otherwise
	 */
	this.onCollideCheck = undefined;
	
	/**
	 * Event for hitting a target
	 *
	 * @param {Robot}  target - the target to hit
	 * @param {Number} damage - the damage dealt to the target
	 */
	this.onHit = undefined;
	
	/**
	 * Event for when the projectile is blocked by a shield
	 */
	this.onBlocked = undefined;
}

/**
 * Basic update functionality for bullets
 */
Projectile.prototype.update = function() {
	
	// Movement
	this.movev(this.vel);
	
	// Range limit
	if (this.origin.distanceSq(this.pos) >= this.range * this.range) {
		this.expired = true;
	}
	
	// Special updates
	if (this.onUpdate) {
		this.onUpdate();
	}
};

/**
 * Blocks the projectile, making it expire
 */
Projectile.prototype.block = function() {
	this.expired = true;
	if (this.onBlocked) this.onBlocked();
};

/**
 * Checks whether or not the projectile collides with the target
 *
 * @param {Robot} target - the target to check for collision against
 *
 * @returns {boolean} true if collides with the target, false otherwise
 */
Projectile.prototype.collides = function(target) {
	var valid = target.type & this.group;
	if (this.onCollideCheck) valid = valid && this.onCollideCheck(target);
	return valid && this.pos.distanceSq(target.pos) < sq(this.width + target.width) / 4;
};

/**
 * Applies hit effects to the target including dealing damage
 *
 * @param {Robot} target - the target to apply hit effects to
 */
Projectile.prototype.hit = function(target) {
	var damage = this.damage;
	if (this.pierce) damage *= target.pierce;
	this.damage(target, damage);
	if (this.onHit) this.onHit(target, damage);
};

/**
 * Damages a target for the given amount of damage
 *
 * @param {Robot}  target - the target to damage
 * @param {Number} damage - the amount of damage
 */
Projectile.prototype.damage = function(target, damage) {
	if (damage > 0) {
		target.damage(damage, this.shooter);
		this.shooter.damageDealt += damage;
	}
};

/**
 * Clones the projectile including its events
 */
Projectile.prototype.clone = function() {
	var projectile = new Projectile(this.src, 0, 0, this.shooter, this.shooter, this.speed, 0, this.damage, this.range, this.pierce, this.target);
	projectile.pos = this.pos.clone();
	projectile.rotation = this.rotation.clone();
	projectile.vel = this.vel.clone();
	projectile.origin = this.origin.clone();
	
	projectile.onUpdate = this.onUpdate;
	projectile.onCollideCheck = this.onCollideCheck;
	projectile.onHit = this.onHit;
	
	return projectile;
};

// Event implementations used by various projectiles
var projEvents = {
	
	/**
	 * Deals extra damage to the target if they are slowed
	 *
	 * @param {Robot}  target - the target being hit
	 * @param {Number} damage - damage being dealt
	 */
	slowedBonusHit: function(target, damage) {
		this.damage(target, damage * 0.5);
	},
	
	/**
	 * Gives the target experience on collision
	 *
	 * @param {Robot}  target - the target being hit
	 * @param {Number} damage - damage being dealt
	 */
	expHit: function(target, damage) {
		target.giveExp(this.exp);
	},
	
	/**
	 * Updates fire, scaling it up over time
	 */
	fireUpdate: function() {
		this.size.x = this.size.y = 0.1 + 0.9 * this.pos.distanceSq(this.origin) / sq(this.range * 0.75);
	},
	
	/**
	 * Updates angle's prism beam, scaling it up over time
	 */ 
	prismUpdate: function() {
		this.size.x = this.size.y = 1 + 0.6 * this.pos.distanceSq(this.origin) / sq(this.range * 0.75);
	},
	
	/**
	 * Limits homing projectiles to only hitting their designated target
	 *
	 * @param {Robot} target - the target being checked against
	 *
	 * @returns {boolean} true if matches the designated target, false otherwise
	 */
	homingCollide: function(target) {
		return target == this.target;
	},
	
	/**
	 * Updates homing bullets, turning their velocity towards their target
	 */
	homingUpdate: function() {
		this.expired = this.expired || this.target.dead;
		
		var cross = this.pos.clone().subtractv(this.target.pos).cross(this.vel);
		var angle = cross > 0 ? -this.rotSpeed : this.rotSpeed;
		this.rotSpeed += 0.0001;
		this.vel.rotateAngle(angle);
	},
	
	/**
	 * Updates boss fist projectiles, first moving outward and then 
	 * returning back after reaching the range and pausing
	 */
	fistUpdate: function() {
		this.expired = this.returning && this.delay <= 0 && this.target.dead;
		
		// Updates after the fist reached it's range limit
		if (this.returning) {
		
			// Wait before returning
			if (this.delay > 0) {
				this.delay--;
				this.vel.x = this.vel.y = 0;
			}
			
			// Return after waiting
			else {
				this.damage = this.actualDamage;
				this.vel = this.shooter.pos.clone().subtractv(this.pos);
				this.vel.setMagnitude(this.speed);
				
				if (this.pos.distanceSq(this.shooter.pos) < 22500) {
					this.block();
				}
			}
		}
		
		// Move straight out to the range limit before returning
		else if (this.pos.distanceSq(this.shooter.pos) >= sq(this.range)) {
			this.returning = true;
			this.actualDamage = this.damage;
			this.damage = 0;
		}
	},
	
	/**
	 * Restores the fist to the boss when blocked
	 */
	fistBlocked: function() {
		this.shooter[this.side + 'Fist'] = true;
	},
	
	/**
	 * Rotates the projectile each update
	 */ 
	spinningUpdate: function() {
		this.rotateAngle(this.rotSpeed);
	},
	
	/**
	 * Updates a sword, swinging across an arc
	 */
	swordUpdate: function() {
		
	},
};
