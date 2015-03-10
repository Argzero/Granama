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
 *
 * @constructor
 */
extend('Projectile', 'Sprite');
function Projectile(name, x, y, shooter, gun, speed, angle, damage, range, pierce, target) {
    this.super(name, x, y);
    
    this.shooter = shooter;
    this.gun = gun;
    this.angle = angle;
    this.rotation = gun.getWorldRotation().rotateAngle(angle);
    this.vel = this.rotation.clone().multiply(speed, speed).rotate(0, 1);
    this.speed = speed;
    this.damage = damage;
    this.range = range;
    this.pierce = pierce;
    this.group = target;
    this.expired = false;
    
    // Array of buffs to apply. Add in the format { name, multiplier, duration }
    this.buffs = [];
    
    this.offset = this.pos.clone();
    this.pos.rotatev(gun.getWorldRotation());
    this.pos.addv(gun.getWorldPos());
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
    
    /**
     * Event for when the bullet reaches its max distance
     */
    this.onExpire = undefined;
}

/**
 * Basic update functionality for bullets
 */
Projectile.prototype.update = function() {
    
    // Movement
    this.move(this.vel.x, this.vel.y);
    
    // Range limit
    if (this.origin.distanceSq(this.pos) >= this.range * this.range) {
        this.expired = true;
        if (this.onExpire) this.onExpire();
    }
    
    // Special updates
    if (this.onUpdate) {
        this.onUpdate();
    }
};

/**
 * Applies embedded buffs to the target
 */
Projectile.prototype.applyBuffs = function(target) {
    var buff;
    for (var i = 0; i < this.buffs.length; i++) {
        buff = this.buffs[i];
        target.buff(buff.name, buff.multiplier, buff.duration);
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
Projectile.prototype.isHitting = function(target) {
    var valid = !target.dead && (target.type & this.group) && (target != this.shooter) && this.collides(target);
    if (this.onCollideCheck) valid = valid && this.onCollideCheck(target);
    return valid;
};

/**
 * Applies hit effects to the target including dealing damage
 *
 * @param {Robot} target - the target to apply hit effects to
 */
Projectile.prototype.hit = function(target) {
    var damage = this.damage;
    if (this.pierce) damage *= target.pierceDamage;
    if (damage < 0) target.heal(-damage, this.shooter);
    else target.damage(damage, this.shooter);
    this.applyBuffs(target);
    this.expired = this.expired || !this.pierce;
    if (this.onHit) this.onHit(target, damage);
};

/**
 * Clones the projectile including its events
 */
Projectile.prototype.clone = function() {
    var projectile = new Projectile(this.src, 0, 0, this.shooter, this.shooter, this.speed, 0, this.damage, this.range, this.pierce, this.target);
    projectile.pos = this.pos.clone();
    projectile.rotation = this.rotation.clone();
    projectile.vel = this.vel.clone();
    projectile.origin = this.origin;
    projectile.buffs = this.buffs;
    
    projectile.onUpdate = this.onUpdate;
    projectile.onCollideCheck = this.onCollideCheck;
    projectile.onHit = this.onHit;
    projectile.onBlocked = this.onBlocked;
    projectile.onExpire = this.onExpire;
    
    return projectile;
};

/**
 * Spreads the bullet, duplicating it and rotating them
 * To provide a cone of evenly distributed bullets. Each
 * "amount" provided creates 2 more bullets, one on each
 * side of the original.
 *
 * @param {number} amount - the number of times to spread
 */
Projectile.prototype.spread = function(amount) {

    // Get angle data
    var angle, sin, cos;
    if (amount > 29) {
        sin = SIN_1;
        cos = COS_1;
    }
    else if (amount > 17) {
        sin = SIN_3;
        cos = COS_3;
    }
    else if (amount > 8) {
        sin = SIN_5;
        cos = COS_5;
    }
    else if (amount > 5) {
        sin = SIN_10;
        cos = COS_10;
    }
    else {
        sin = SIN_15;
        cos = COS_15;
    }

    // Spread the bullet
    for (var i = 1; i <= amount; i++) {
        for (var j = -1; j < 2; j += 2) {
            var proj = this.clone();
            for (var k = 0; k < i; k++) {
                proj.vel.rotate(cos, j * sin);
                proj.rotate(cos, j * sin);
            }
            gameScreen.bullets.push(proj);
        }
    }
};

// ------------------------------- Templates --------------------------------- //

/**
 * Sets up a boss fist projectile
 *
 * @param {number} delay - the delay in frames before the fist starts returning
 * @param {string} side  - the key of the side the fist is being fired from
 */
Projectile.prototype.setupFist = function(delay, side) {
    this.onUpdate = projEvents.fistUpdate;
    this.onBlocked = projEvents.fistBlocked;
    this.onExpire = projEvents.fistExpired;
    
    this.delay = delay;
    this.side = side.toLowerCase();
};

/** 
 * Sets up a grapple projectile
 *
 * @param {number}  stun - the stun duration in frames
 * @param {boolean} self - whether or not the grapple pulls in the shooter
 */
Projectile.prototype.setupGrapple = function(stun, self) {
    this.onUpdate = projEvents.grappleUpdate;
    this.onHit = projEvents.grappleHit;
    this.onBlocked = projEvents.grappleBlocked;
    this.onExpire = projEvents.grappleExpire;
    this.onCollideCheck = projEvents.grappleCollide;
    
    this.stun = stun;
    this.self = self;
};

/** 
 * Sets up a homing projectile
 *
 * @param {Robot|number}  target   - the target to home towards or the type of robot to seek the nearest of
 * @param {number}        rotSpeed - how fast to turn towards the target initially
 */
Projectile.prototype.setupHoming = function(target, rotSpeed) {
    this.onCollideCheck = projEvents.homingCollide;
    this.onUpdate = projEvents.homingUpdate;
    
    // Get nearest of the given type if a specific robot is not specified
    if (isNaN(target)) this.target = target;
    else this.target = gameScreen.getClosest(this.pos, target);
    
    this.rotSpeed = rotSpeed;
    this.lifespan = this.range / this.speed;
    this.range = 999999;
    return this;
};

/**
 * Sets up a rocket projectile
 *
 * @param {string} type      - the sprite type of the explosion
 * @param {number} radius    - the radius of the explosion
 * @param {number} knockback - the amount of knockback to apply
 */
Projectile.prototype.setupRocket = function(type, radius, knockback) {    
    this.onHit = projEvents.rocketHit;
    this.onExpire = projEvents.rocketExpire;
    this.onBlocked = projEvents.rocketBlocked;
    
    this.type = type;
    this.radius = radius;
    this.knockback = knockback;
    return this;
};

/** 
 * Sets up a projectile that does bonus damage to slowed targets
 *
 * @param {number} multiplier - the damage multiplier to apply
 */
Projectile.prototype.setupSlowBonus = function(multiplier) {
    this.onHit = projEvents.slowedBonusHit;
    
    this.slowMultiplier = multiplier;
    return this;
};

/**
 * Sets up a spinning projectile
 *
 * @param {number} rotSpeed - how fast the projectile rotates in radians
 */
Projectile.prototype.setupSpinning = function(rotSpeed) {
    this.onUpdate = projEvents.spinningUpdate;
    
    this.rotSpeed = rotSpeed;
    return this;
};

/**
 * Sets up a sword projectile
 *
 * @param {number} radius    - the radius of the swing arc
 * @param {number} arc       - the angle of the swing arc in radians
 * @param {number} knockback - the amount of knockback the sword applies
 * @param {number} lifesteal - the multiplier for the amount of health stolen
 */
Projectile.prototype.setupSword = function(radius, arc, knockback, lifesteal) {
    this.onUpdate = projEvents.swordUpdate;
    this.onHit = projEvents.swordHit;
    this.onBlocked = projEvents.swordBlocked;
    
    this.tempRotation = new Vector(1, 0);
    this.initial = this.offset.clone();
    this.start = new Vector(-radius * Math.sin(arc / 2), radius * Math.cos(arc / 2));
    this.knockback = knockback;
    this.lifesteal = lifesteal;
    this.arc = arc;
    this.range = 999999;
};

// ------------------------------- Individual Events --------------------------------- //

// Event implementations used by various projectiles
var projEvents = {
    
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
     * Updates boss fist projectiles, first moving outward and then 
     * returning back after reaching the range and pausing
     */
    fistUpdate: function() {
        this.expired = this.expired || (this.returning && this.delay <= 0 && this.shooter.dead);
        this.shooter[this.side + 'Fist'] = this.expired;
        
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
                    this.expired = true;
                    this.shooter[this.side + 'Fist'] = true;
                }
            }
        }
    },
    
    /**
     * Restores the fist to the boss when blocked
     */
    fistBlocked: function() {
        this.onExpire();
        this.delay = 0;
        this.damage = this.actualDamage;
    },
    
    /**
     * Cancels a fist expiring, causing it to retreat instead
     */ 
    fistExpired: function() {
        this.expired = false;
        this.returning = true;
        this.damage = 0;
    },
    
    /**
     * Updates a grappling hook, moving it back to the owner after
     * expiring and dragging along any targets it has
     */
    grappleUpdate: function() {
        this.shooter.grapple = this;
        if (this.returning) {
            this.vel = this.shooter.pos.clone().subtractv(this.pos).setMagnitude(this.speed);
            if (this.target && this.target.pos.distanceSq(this.shooter.pos) >= 10000) {
                this.target.stun(this.stun || 2);
                if (this.self) {
                    this.shooter.move(-this.vel.x, -this.vel.y);
                    this.shooter.stun(2);
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                else {
                    this.target.moveTo(this.pos.x + this.offset.x, this.pos.y + this.offset.y);
                }
            }
            if (this.pos.distanceSq(this.shooter.pos) <= 400) {
                this.expired = true;
                this.shooter.grapple = false;
            }
        }
    },
    
    /**
     * Grabs a target upon hitting it instead of expiring
     *
     * @param {Robot}  target - the target that was hit
     * @param {Number} damage - the amount of damage dealt
     */
    grappleHit: function(target, damage) {
        if (target.attachedGrapple) 
        {
            target.attachedGrapple.target = undefined;
        }
        target.attachedGrapple = this;
        this.expired = false;
        this.returning = true;
        this.target = target;
        this.offset = target.pos.clone().subtractv(this.pos);
    },
    
    /**
     * Prevents a grappling hook from hitting other targets
     * after it already grabbed onto another robot
     *
     * @param {Robot} target - the target being checked for collision
     */
    grappleCollide: function(target) {
        return !this.target;
    },
    
    /**
     * Instead of expiring, grappling hooks return to the shooter
     */
    grappleExpire: function() {
        this.expired = false;
        this.returning = true;
    },
    
    /**
     * When blocked, returns to the user rather than disappearing
     */
    grappleBlocked: function() {
        this.expired = false;
        this.returning = true;
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
        this.lifespan--;
        this.expired = this.expired || this.target.dead || this.lifespan <= 0;
        
        var cross = this.pos.clone().subtractv(this.target.pos).cross(this.vel);
        var angle = cross < 0 ? -this.rotSpeed : this.rotSpeed;
        this.rotSpeed += 0.0001;
        this.vel.rotateAngle(angle);
        this.rotation.rotateAngle(angle);
    },
    
    /**
     * Applies knockback on hit
     *
     * @param {Robot} target - the target to apply knockback to
     */
    knockbackHit: function(target) {
        if (this.knockback) {
            target.knockback(this.vel.clone().setMagnitude(this.knockback));
        }
    },

    /**
     * Checks whether or not the target is an ally, modifies
     * the damage accordingly, and returns whether or not the
     * target could get hit (allies would not get hit if full health).
     *
     * @param {Robot} target - target to check collision against
     */
    mixedCollide: function(target) {
        if (target.type & this.shooter.type) {
            if (target.health >= target.maxHealth) return false;
            this.damage = -Math.abs(this.damage);
        }
        else this.damage = Math.abs(this.damage);
        return true;
    },
    
    /**
     * Blows up the rocket when expired or blocked
     *
     * @param {Robot} [ignore] - robot to ignore if any
     */
    rocketExpire: function(ignore) {
        for (var i = 0; i < gameScreen.robots.length; i++) {
            var r = gameScreen.robots[i];
            if ((r.type & this.group) && this.pos.distanceSq(r.pos) < this.radius * this.radius) {
                if (r != ignore) {
                    r.damage(this.damage, this.shooter);
                    this.applyBuffs(r);
                }
                if (this.knockback) {
                    var dir = r.pos.clone().subtractv(this.pos).setMagnitude(this.knockback);
                    r.knockback(dir);
                }
            }
        }
        gameScreen.particles.push(new RocketExplosion(this.type, this.pos, this.radius));
    },
    
    /**
     * Rockets blow up when blocked
     */
    rocketBlocked: function() {
        this.onExpire();
    },
    
    /**
     * Blows up the rocket when it hits something
     *
     * @param {Robot}  target - the target that was hit
     * @param {Number} damage - the amount of damage dealt
     */
    rocketHit: function(target, damage) {
        this.onExpire(target);
    },
    
    /**
     * Deals extra damage to the target if they are slowed
     *
     * @param {Robot}  target - the target being hit
     * @param {Number} damage - damage being dealt
     */
    slowedBonusHit: function(target, damage) {
        if (target.get('speed') < target.speed) {
            target.damage(damage * (this.slowMultiplier - 1), this.shooter);
        }
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
        this.shooter.sword = this;
        
        // Move out from the robot first
        if (!this.state) {
            this.tempRotation.rotateAngle(this.arc / 20 + this.angle / 10);
            this.offset.add((this.start.x - this.initial.x) / 10, (this.start.y - this.initial.y) / 10);
            
            if (!this.step) this.step = 0;
            this.step++;
            if (this.step >= 10) {
                this.step = Math.ceil(this.arc * 36 / Math.PI);
                var angle = this.arc / this.step;
                this.rotCos = Math.cos(angle);
                this.rotSin = -Math.sin(angle);
                this.state = 1;
            }
        }
        
        // Swinging
        else if (this.state == 1) {
            this.offset.rotate(this.rotCos, this.rotSin);
            this.tempRotation.rotate(this.rotCos, this.rotSin);
            
            this.step--;
            if (this.step <= 0) {
                this.step = 10;
                this.state = 2;
                this.start = this.offset.clone();
            }
        }
        
        // Returning back to the robot
        else if (this.state == 2) {
            this.tempRotation.rotateAngle(-this.arc / 20 - this.angle / 10);
            this.offset.add((this.initial.x - this.start.x) / 10, (this.initial.y - this.start.y) / 10);
            
            this.step--;
            if (this.step <= 0) {
                this.shooter.sword = false;
                this.expired = true;
                this.step = 0;
            }
        }
        
        this.moveTo(this.gun.pos.x + this.offset.x, this.gun.pos.y + this.offset.y);
        this.setRotation(this.tempRotation.x, this.tempRotation.y);
        this.rotateAbout(this.gun.rotation.x, this.gun.rotation.y, this.gun.pos); 
    },
    
    /**
     * Applies sword hitting effects such as applying knockback and lifesteal
     *
     * @param {Robot}  target - the target being hit by the sword
     * @param {Number} damage - the amount of damage being dealt
     */
    swordHit: function(target, damage) {
        
        // Lifesteal
        if (!this.shooter.dead && this.lifesteal) {
            this.shooter.heal(this.damage * this.lifesteal);
        }
        
        // Knockback
        if (this.knockback) {
            var dir = target.pos.clone().subtractv(this.shooter.pos).setMagnitude(this.knockback);
            target.knockback(dir);
        }
    },
    
    /**
     * Restores the sword to the shooter when blocked
     */
    swordBlocked: function() {
        this.expired = false;
    },
    
    /**
     * Prevents a bullet from hitting the same target more than once
     *
     * @param {Robot} target - target to check for collision against
     */
    uniqueCollide: function(target) {
        this.hitList = this.hitList || [];
        var canHit = this.hitList.indexOf(target) == -1;
        if (canHit) {
            this.pierceNum--;
            this.hitList.push(target);
        }
        this.expired = this.pierceNum <= 0;
        return canHit;
    }
};
