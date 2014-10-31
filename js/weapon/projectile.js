// Base object for projectiles
function ProjectileBase(sprite, source, x, y, velX, velY, angle, damage, range, pierce, offScreen) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var tx = source.x - sin * y + cos * x;
    var ty = source.y + cos * y + sin * x;
    return {
    
        // Fields
        sprite: sprite,
        source: source,
        x: tx,
        y: ty,
        ox: tx,
        oy: ty,
        pierce: pierce,
        velX: velX,
        velY: velY,
        angle: angle,
        cos: cos,
        sin: sin,
        range: range,
        damage: damage,
        scale: 1,
        offScreen: true,
        expired: false,
        
        // Components to be set by specific projectiles
        ApplyUpdate: undefined,
        
        // Functions
        Update: projectileFunctions.Update,
        Draw: projectileFunctions.Draw,
        Collides: projectileFunctions.Collides,
        Spread: projectileFunctions.Spread,
		Hit: projectileFunctions.Hit
    };
}

// Fire projectile
function FireProjectile(sprite, source, x, y, velX, velY, angle, damage, range) {
    var projectile = ProjectileBase(sprite, source, x, y, velX, velY, angle, damage, range, true, false);
    projectile.ApplyUpdate = projectileFunctions.ScaleFire;
    projectile.ApplyUpdate();
    return projectile;
}

// Reflection ability projectile
function ReflectionProjectile(sprite, source, x, y, velX, velY, damage, target) {
    var projectile = ProjectileBase(sprite, source, x, y, velX, velY, 0, damage, 9999, false, true);
	projectile.rotSpeed = Rand(10) / 100 + 0.04;
    projectile.target = target;
    projectile.ApplyUpdate = projectileFunctions.UpdateHoming;
	projectile.Collides = projectileFunctions.CollidesHoming;
    return projectile;
}

// Rocket projectile with knockback and AOE damage
function RocketProjectile(sprite, source, x, y, velX, velY, angle, damage, range, radius, knockback, type, lists) {
	var projectile = ProjectileBase(sprite, source, x, y, velX, velY, angle, damage, 9999, false, false);
	projectile.Hit = projectileFunctions.RocketHit;
    projectile.updateBase = projectile.Update;
    projectile.Update = projectileFunctions.updateRocket;
    projectile.actualRange = range;
	projectile.radius = radius;
	projectile.lists = lists;
	projectile.type = type;
	projectile.knockback = knockback;
	return projectile;
}

// Rocket projectile with knockback, AOE damage, and homing properties
function HomingRocketProjectile(sprite, source, target, x, y, velX, velY, angle, damage, range, radius, knockback, type, lists) {
    var projectile = ProjectileBase(sprite, source, x, y, velX, velY, angle, damage, 9999, false, true);
	projectile.Hit = projectileFunctions.RocketHit;
    projectile.ApplyUpdate = projectileFunctions.updateHomingRocket;
    projectile.actualRange = range;
	projectile.radius = radius;
	projectile.lists = lists;
    projectile.target = target;
    projectile.speed = Math.sqrt(velX * velX + velY * velY);
    projectile.rotSpeed = 0.02;
    projectile.lifespan = range / (Math.abs(velX) + Math.abs(velY) * HALF_RT_2);
	projectile.type = type;
	projectile.knockback = knockback;
    return projectile;
}

// Slowing projectile
function SlowProjectile(sprite, source, x, y, velX, velY, angle, damage, range, pierce, offScreen, multiplier, duration) {
    var projectile = ProjectileBase(sprite, source, x, y, velX, velY, angle, damage, range, pierce, offScreen); 
    projectile.Hit = projectileFunctions.SlowHit;
    projectile.multiplier = multiplier;
    projectile.duration = duration;
    return projectile;
}

// Sword projectile
function SwordProjectile(sprite, source, x, y, r, angle, damage, arc, knockback, lifesteal) {
    var projectile = ProjectileBase(sprite, source, source.x + x, source.y + y, 0, 0, source.angle, damage, 9999, true, true);
    projectile.Update = projectileFunctions.updateSword;
    projectile.Hit = projectileFunctions.hitSword;
    projectile.stop = projectileFunctions.stopSword;
	projectile.arc = arc;
    projectile.knockback = knockback;
    projectile.initial = Vector(x, y);
    projectile.start = Vector(-r * Math.sin(arc / 2), r * Math.cos(arc / 2));
    projectile.step = 0;
    projectile.state = 0;
    projectile.initialAngle = angle;
    projectile.lifesteal = lifesteal;
	return projectile;
}

// Boss fist projectile
function FistProjectile(source, x, y, velX, velY, angle, damage, range, delay, side) {
    var projectile = ProjectileBase(GetImage('fist' + side), source, x, y, velX, velY, angle, damage, 99999, true, true);
    projectile.ApplyUpdate = projectileFunctions.UpdateFist;
    projectile.stop = projectileFunctions.stopFist;
	projectile.speed = Distance(0, 0, velX, velY);
    projectile.delay = delay;
    projectile.fistRange = range;
    projectile.side = side.toLowerCase();
    projectile.tx = x;
	projectile.returning = false;
    projectile.actualDamage = damage;
	
    return projectile;
}

// A grapple hook projectile for knights
function GrappleProjectile(sprite, source, damage, range, stun, self) {
    var projectile = ProjectileBase(sprite, source, 0, 0, source.cos * 20, source.sin * 20, source.angle, damage, range, true, true);
    projectile.Update = projectileFunctions.updateGrapple;
    projectile.Hit = projectileFunctions.hitGrapple;
    projectile.stop = projectileFunctions.stopGrapple;
	projectile.speed = Math.sqrt(DistanceSq(0, 0, projectile.velX, projectile.velY));
    projectile.stun = stun;
	projectile.self = self;
    return projectile;
}

// Functions for bullets
var projectileFunctions = {

    // Updates the bullet's position
    Update: function() {
    
        // Move according to its velocity
        this.x += this.velX;
        this.y += this.velY;
        
        // Mark as expired when outside its range
        var dx = this.x - this.ox;
        var dy = this.y - this.oy;
        if (dx * dx + dy * dy >= this.range * this.range) {
            this.expired = true;
        }
        
        // Mark as expired when off screen
        if (!this.offScreen && !WithinScreen(this)) {
            this.expired = true;
        }
        
        // Apply special updates if applicable
        if (this.ApplyUpdate) {
            this.ApplyUpdate();
        }
    },
    
    // Draws the bullet
    Draw: function() {
        canvas.translate(this.x, this.y);
        canvas.transform(this.cos, this.sin, -this.sin, this.cos, 0, 0);
        if (this.scale != 1) {
            canvas.drawImage(this.sprite, -this.sprite.width * this.scale / 2, -this.sprite.height * this.scale / 2, this.sprite.width * this.scale, this.sprite.height * this.scale);
        }
        else {
            canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        }
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
    },
    
    // Collision detection for bullets
    Collides: function(target) {
        return Sq(this.sprite.width * this.scale / 2 + target.sprite.width / 2) > Sq(this.x - target.x) + Sq(this.y - target.y);
    },
	
	// Collision detection for homing bullets
	CollidesHoming: function(target) {
		return this.target == target && Sq(this.sprite.width * this.scale / 2 + target.sprite.width / 2) > Sq(this.x - target.x) + Sq(this.y - target.y);
	},
    
    // Spreads more projectiles from this one, putting the new ones into the array
    Spread: function(amount, array) {
    
        // Get angle data
        var angle, sin, cos;
        if (amount > 29) {
            angle = Math.PI / 180;
            sin = SIN_1;
            cos = COS_1;
        }
        else if (amount > 17) {
            angle = Math.PI / 60;
            sin = SIN_3;
            cos = COS_3;
        }
        else if (amount > 8) {
            angle = Math.PI / 36;
            sin = SIN_5;
            cos = COS_5;
        }
        else if (amount > 5) {
            angle = Math.PI / 18;
            sin = SIN_10;
            cos = COS_10;
        }
        else {
            angle = Math.PI / 12;
            sin = SIN_15;
            cos = COS_15;
        }
    
        // Spread the bullet
        var vel = [this.velX, this.velY, this.velX, this.velY];
        for (var i = 0; i < amount; i++) {
            for (var j = 0; j < 2; j++) {
                var k = j * 2 - 1;
                var proj = Clone(this);
                proj.velX = vel[j * 2] * cos - vel[j * 2 + 1] * sin * k;
                proj.velY = vel[j * 2] * sin * k + vel[j * 2 + 1] * cos;
                proj.angle += angle * k * (i + 1);
                proj.cos = Math.cos(proj.angle);
                proj.sin = Math.sin(proj.angle);
                vel[j * 2] = proj.velX;
                vel[j * 2 + 1] = proj.velY;
                array.push(proj);
            }
        }
    },
	
	// Hits the target robot, damaging it
	Hit: function(target) {
        var damage = this.damage;
        if (this.pierce && target.pierceDamage) damage *= target.pierceDamage;
		target.Damage(damage, this.source);
        
        // Player damage dealt progress
        if (this.source.creditDamage) {
            this.source.creditDamage(this.damage);
        }
	},
    
    // Deals extra damage if slowed
    hitCritical: function(target) {
        if (target.speedMDuration > 0) {
            this.damage *= 1.5;
        }
        this.hitBase(target);
    },
	
	// Exp hitting something
	HitExp: function(target) {
		target.GiveExp(this.exp);
		this.expired = true;
	},
    
    // Scales fire projectiles on update
    ScaleFire: function() {
        this.scale = 0.1 + 0.9 * DistanceSq(this.x, this.y, this.ox, this.oy) / Sq(this.range * 3 / 4);
    },
    
    // Reflection ability projectiles' homing behavior
    UpdateHoming: function() {
    
        // Remove the bullet if the target is dead
        if (this.target.health <= 0) {
            this.expired = true;
            return;
        }
        
        // Turn towards the target
        var dx = this.target.x - this.x;
        var dy = this.target.y - this.y;
        var dot = this.velY * dx + -this.velX * dy;
        var angle;
        if (dot > 0) {
            angle = -this.rotSpeed;
        }
        else {
            angle = this.rotSpeed;
        }
		this.rotSpeed += 0.0001;
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var tx = this.velX * c - this.velY * s;
        var ty = this.velX * s + this.velY * c;
        this.velX = tx;
        this.velY = ty;
    },
    
    // Fist projectile behavior
    UpdateFist: function() {
    
        // Change the velocity when returning
        if (this.returning) {
        
            // If actually returning, move back towards the boss
            if (this.delay <= 0) {
                
                // If the boss is dead on the way back, remove the fist
                if (this.source.health <= 0) {
                    this.expired = true;
                    return;
                }
            
                // Otherwise move towards the boss
                this.damage = this.actualDamage;
                dx = this.source.x - this.x + this.tx * this.source.sin;
                dy = this.source.y - this.y - this.tx * this.source.cos;
                m = this.speed / Math.sqrt(Sq(dx) + Sq(dy));
                this.velX = dx * m;
                this.velY = dy * m;
            }
            
            // Otherwise just sit still and wait
            else {
                this.delay--;
                this.velX = 0;
                this.velY = 0;
            }
        }
        
        // Move the fist
        this.x += this.velX;
        this.y += this.velY;
        
        // When returning, reattach to the boss if close by
        if (this.returning) {
            if (DistanceSq(this.x, this.y, this.source.x, this.source.y) < 22500) {
                this.expired = true;
                this.source[this.side + 'Fist'] = true;
            }
        }
        
        // Mark as returning when reaching the fist's range
        else if (DistanceSq(this.x + this.velX, this.y + this.velY, this.ox, this.oy) >= Sq(this.fistRange)) {
            this.returning = true;
            this.damage = 0;
        }
    },
	
	// Stops a fist projectile
	stopFist: function() {
		this.expired = true;
		this.source[this.side + 'Fist'] = true;
	},
    
    // Updates a sword projectile
    updateSword: function() {
        
        // Leaving robot
        if (this.state == 0) {
            var target = this.arc / 2 + this.initialAngle;
            this.angle = this.source.angle + target * ++this.step / 10;
            this.cos = Math.cos(this.angle);
            this.sin = Math.sin(this.angle);
            
            var offset = Vector(this.initial.x + (this.start.x - this.initial.x) * this.step / 10, this.initial.y + (this.start.y - this.initial.y) * this.step / 10);
            offset.Rotate(this.source.sin, -this.source.cos);
            this.x = this.source.x + offset.x;
            this.y = this.source.y + offset.y;
            if (this.step == 10) {
                this.step = 0;
                this.state = 1;
            }
        }
        
        // Swinging
        else if (this.state == 1) {
            var target = this.arc / 2 + this.initialAngle;
            var m = this.arc > 0 ? 1 : -1;
            this.angle = this.source.angle + target - m * Math.PI * ++this.step / 36;
            this.cos = Math.cos(this.angle);
            this.sin = Math.sin(this.angle);
            this.start.Rotate(COS_5, -m * SIN_5);
            var offset = Vector(this.start.x, this.start.y);
            offset.Rotate(this.source.sin, - this.source.cos);
            this.x = this.source.x + offset.x;
            this.y = this.source.y + offset.y;
            if (this.step >= Math.abs(this.arc * 36 / Math.PI)) {
                this.step = 0;
                this.state = 2;
            }
        }
        
        // Returning back to robot
        else if (this.state == 2) {
            this.angle = this.source.angle + (this.initialAngle - this.arc / 2) * (10 - ++this.step) / 10;
            this.cos = Math.cos(this.angle);
            this.sin = Math.sin(this.angle);
            
            var offset = Vector(this.start.x + (this.initial.x - this.start.x) * this.step / 10, this.start.y + (this.initial.y - this.start.y) * this.step / 10);
            offset.Rotate(this.source.sin, -this.source.cos);
            this.x = this.source.x + offset.x;
            this.y = this.source.y + offset.y;
            if (this.step == 10) {
                this.source.sword = true;
                this.expired = true;
            }
        }
    },
    
    // Hit application for a sword
    hitSword: function(target) {
    
        // Damage
        target.Damage(this.damage, this.source);
        
        // Player damage dealt progress
        if (this.source.creditDamage) {
            this.source.creditDamage(this.damage);
        }
        
        // Lifesteal
        if (this.source.health > 0) {
            this.source.health += this.damage * this.lifesteal;
            if (this.source.health > this.source.maxHealth) {
                this.source.health = this.source.maxHealth;
            }
        }
    
        // Knockback
		if (target.Knockback) {
			var k = Vector(target.x - this.source.x, target.y - this.source.y);
			k.SetLength(this.knockback);
			target.Knockback(k.x, k.y);
		}
    },
	
	// Stops a sword projectile
	stopSword: function() {
		this.source.sword = true;
        this.expired = true;
	},
	
    // Updates a rocket projectile
    updateRocket: function() {
        this.updateBase();
        
        var dx = this.x - this.ox;
        var dy = this.y - this.oy;
        if (dx * dx + dy * dy >= this.actualRange * this.actualRange) {
            this.Hit();
            this.expired = true;
        }
    },
    
    // Updates a homing rocket projectile
    updateHomingRocket: function() {
        if (!this.updateHoming) this.updateHoming = projectileFunctions.UpdateHoming;
        this.updateHoming();
        
        this.cos = this.velY / this.speed;
        this.sin = -this.velX / this.speed;
        
        // Blow up automatically after a duration
        this.lifespan--;
        if (this.lifespan <= 0) {
            this.Hit();
            this.expired = true;
        }
    },
    
	// Hits a target as a rocket, knocking back and damaging nearby units
	RocketHit: function(target) {
		for (var l = 0; l < this.lists.length; l++) {
			var list = this.lists[l];
			for (var i = 0; i < list.length; i++) {
				var target = list[i];
				if (DistanceSq(target.x, target.y, this.x, this.y) < Sq(this.radius)) {
					if (target.Knockback) {
						var dir = Vector(target.x - this.x, target.y - this.y);
						dir.SetLength(this.knockback);
						target.Knockback(dir.x, dir.y);
					}
					target.Damage(this.damage, this.source);
                    
                    // Player damage dealt progress
                    if (this.source.creditDamage) {
                        this.source.creditDamage(this.damage);
                    }
				}
			}
		}
        var ex = new RocketExplosion(this.type, this.x, this.y, this.radius);
        gameScreen.particles.push(ex);
	},
    
    // Hits a target and slows it
    SlowHit: function(target) {
        target.Damage(this.damage, this.source);
        
        // Player damage dealt progress
        if (this.source.creditDamage) {
            this.source.creditDamage(this.damage);
        }
        
        // Slow the target
        if (target.Slow) {
            target.Slow(this.multiplier, this.duration);
        }
    },
    
    // Updates a grabble hook projectile
    updateGrapple: function() {
    
		// Pull in the user if applicable
		if (this.self && this.target && !this.tooClose) {
			var dir = Vector(this.x - this.source.x, this.y - this.source.y);
			var lengthSq = dir.LengthSq();
			
			// Drag user to the grapple
			if (this.target && lengthSq >= 10000) {
				dir.SetLength(this.speed);
				this.source.x += dir.x;
				this.source.y += dir.y;
				if (this.target.stun) {
					this.target.stun(this.stun);
				}
			}
			
			else this.tooClose = true;
		}
	
        // Returning to the source
        else if (this.returning) {
            var dir = Vector(this.source.x - this.x, this.source.y - this.y);
            
            // Reached the source
            var lengthSq = dir.LengthSq();
            if (lengthSq <= 400) {
                this.expired = true;
                this.source.grapple = undefined;
            }
            
            // Still moving
            else {
                dir.SetLength(this.speed);
                this.x += dir.x;
                this.y += dir.y;
                
                // Drag target with the grapple
                if (this.target && lengthSq >= 10000) {
                    this.target.x += dir.x;
                    this.target.y += dir.y;
					if (this.target.stun) {
						this.target.stun(this.stun);
					}
                }
            }
        }
    
        // Move normally if not attached to something
        else {
            // Move according to its velocity
            this.x += this.velX;
            this.y += this.velY;
            
            // Mark as expired when outside its range
            var dx = this.x - this.ox;
            var dy = this.y - this.oy;
            if (dx * dx + dy * dy >= this.range * this.range) {
                this.returning = true;
            }
        }
    },
    
    // Applies hit effects for a grapple hook
    hitGrapple: function(target) {
        if (this.target) return;
    
		// Damage the target if applicable
		if (target.Damage) {
			target.Damage(this.damage, this.source);
        }
		
        // Player damage dealt progress
        if (this.source.creditDamage) {
            this.source.creditDamage(this.damage);
        }
    
        // Can't grapple bosses
        if (this.self || (target.isBoss && target.isBoss()) || (!target.health && target.health != 0)) {
            this.returning = true;
			this.target = target;
			this.self = true;
        }
        
        // Grapple other enemies
        else {
            if (target.stun) {
				target.stun(this.stun);
			}
            this.target = target;
            this.returning = true;
        }
    },
	
	// Stops a grapple projectile
	stopGrapple: function(cause) {
		this.Hit(cause);
	}
};