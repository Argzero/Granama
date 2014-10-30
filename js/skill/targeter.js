// Fires a missile that marks a target, 
// making it take more damage and makes drones focus it
function SkillTargeter(player) {
    player.onMove = function() {
    
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillCd = 600;
            
            // Fire rockets from each drone
			var missile = ProjectileBase(
				GetImage('targeterMissile'),
				this,
				0,
				0, 
				this.cos * 10, 
				this.sin * 10, 
				this.angle, 
				5 * this.GetDamageMultiplier(), 
				999,
				false,
				true
			);
			missile.hitBase = missile.Hit;
			missile.Hit = targeterProjectileHit;
			this.bullets.push(missile);
        }
		
		// Increases drone range while active
		if (this.skillduration > 0) {
			this.droneRangeM = 1.5;
		}
		else {
			this.droneRangeM = 1;
		}
		
		// Expired particle means to stop the skill effects
		if (this.skillDuration > 0 && this.particle.expired) {
			this.skillDuration = 0;
		}
    };
}

TARGET_LIFESPAN = 600;
TARGET_INFECT_RADIUS = 400;

// The actions to take when the targeter projectile hits something
function targeterProjectileHit(target) {
	this.source.skillDuration = TARGET_LIFESPAN;
	this.source.particle = TargeterParticle(target);
	target.hitNormally = target.Hit;
	target.Hit = targeterHit;
	gameScreen.particles.push(this.source.particle);
	this.hitBase(target);
}

// Damage increase effect for the Targeter ability
function targeterHit(amount, source) {
	amount *= 1.25;
	this.hitNormally(amount, source);
}

// The target particle for the Targeter ability
function TargeterParticle(target) {
	return {
		
		sprite: GetImage('pCommandoTarget'),
		target: target,
		lifespan: TARGET_LIFESPAN,
		
		// Handles updating/drawing the target particle
		draw: function() {
		
			// Switching targets when the current dies
			if (this.target.health <= 0) {
				var newTarget = gameScreen.enemyManager.getNearest(this.target.x, this.target.y);
				if (newTarget && DistanceSq(newTarget.x, newTarget.y, this.target.x, this.target.y) < Sq(TARGET_INFECT_RADIUS)) {
					this.target = newTarget;
				}
				else {
					this.expired = true;
					return;
				}
			}
		
			// Drawing the target
			var w = 0.9 * this.target.sprite.width;
			var h = 0.9 * this.target.sprite.height;
			var s = Math.min(w, h);
			canvas.drawImage(this.sprite, this.target.x -s / 2, this.target.y -s / 2, s, s);
			
			// Expiring after an amount of time
			this.lifespan--;
			if (this.lifespan <= 0) {
				this.expired = true;
				this.target.Hit = this.target.hitNormally;
			}
		}
	};
}