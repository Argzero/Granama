var LASER_BOMB_OFFSET = 150;
var LASER_BOMB_ROTATION = Math.PI / 7;
var LASER_BOMB_SIZE_SCALE = 10;

function SkillLaserBomb(player) {
    player.onMove = function(speed) {
    
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillCd = 600;
			this.skillDuration = 120;
		}
		
		// Fire projectile at end of charging
		if (this.skillDuration == 1) {
				//sprite, source, x, y, velX, velY, angle, damage, range, radius, knockback, lists
			var bomb = RocketProjectile(
				GetImage('pCommandoChargeBall'),
				this,
				0, 
				LASER_BOMB_OFFSET,
				this.cos * 15,
				this.sin * 15,
				this.angle,
				this.GetDamageMultiplier() * (30 + this.drones.length * 5),
				499,
				160 + this.drones.length * 30,
				180 + this.drones.length * 40,
				[gameScreen.enemyManager.enemies, gameScreen.enemyManager.turrets]
			);
			bomb.scale = (LASER_BOMB_SIZE_SCALE * this.drones.length + 40) / bomb.sprite.width;
			bomb.updateNormally = bomb.Update;
			bomb.Update = laserBombProjectileUpdate;
			this.bullets.push(bomb);
		}
		
		// Don't move while charging
		this.charging = this.skillDuration > 0;
		if (this.charging) {
			return speed / 2;
		}
	}
	
	// Draw the charge
	player.onDrawBase = player.onDraw;
    player.onDraw = function() {
		if (this.skillDuration > 1) {
			var size = (120 - this.skillDuration) * (LASER_BOMB_SIZE_SCALE * this.drones.length + 40) / 120;
			var sprite = GetImage('pCommandoChargeBall');
			canvas.translate(this.x + this.cos * LASER_BOMB_OFFSET, this.y + this.sin * LASER_BOMB_OFFSET);
			canvas.rotate(this.skillDuration * LASER_BOMB_ROTATION);
			canvas.drawImage(sprite, -size / 2, -size / 2, size, size);
			ResetTransform(canvas);
		}
		
		this.onDrawBase();
	}
}

// Spings the laser bomb projectile as it flies
function laserBombProjectileUpdate() {
	this.angle += LASER_BOMB_ROTATION;
	this.cos = -Math.sin(this.angle);
	this.sin = Math.cos(this.angle);
	this.updateNormally();
}