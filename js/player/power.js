function PlayerPowerType() {
    var p = BasePlayer();
    
    // Weapon cooldowns
    p.fireCd = 0;
    p.laserCd = 0;
    
    // Sprites
    p.sprite = GetImage('pPowerBody');
    p.laserSprite = GetImage('pPowerLaser');
    p.spreadSprite = GetImage('pPowerSpread');
    p.shieldSprite = GetImage('pPowerShield');
    p.flamethrowerSprite = GetImage('pPowerFlame');
    
    // Updates the player
    p.Update = function() {
        this.UpdateBase();
        
        // Get damage multiplier
        var m = 1;
        if (this.onFire) {
            var temp = this.onFire();
            if (temp !== undefined) {
                m = temp;
            }
            if (!m) {
                return;
            }
        }
        
        // Flamethrower
        var fireUps = this.upgrades[FLAME_ID];
        if (fireUps > 0 && this.fireCd <= 0 && KeyPressed(KEY_LMB)) {
            this.fireCd = FIRE_CD;
			var range = fireUps * FLAME_UP + FIRE_RANGE;
            var fire = new Fire(
                this.x - 30 * this.sin + 20 * this.cos + this.cos * this.sprite.width / 2, 
                this.y + 30 * this.cos + 20 * this.sin + this.sin * this.sprite.width / 2, 
                this.cos * BULLET_SPEED, 
                this.sin * BULLET_SPEED, 
                this.angle, 
                FIRE_DAMAGE * m, 
                range
            );
            if (m > 1) {
			    fire.sprite = GetImage('abilityFire');
			}
            this.bullets[this.bullets.length] = fire;
        }
        else if (this.fireCd > 0) {
            this.fireCd--;
        }
        
        // Lasers
        if (this.laserCd <= 0 && KeyPressed(KEY_LMB)) {
			this.laserCd = 60 / (LASER_APS + this.upgrades[LASER_ID] * LASER_UP);
			var laser = NewLaser(
                this.x + this.cos * (this.sprite.height / 2 + 25), 
                this.y + this.sin * (this.sprite.height / 2 + 25), 
                this.cos * BULLET_SPEED, 
                this.sin * BULLET_SPEED, 
                this.angle, 
                LASER_DAMAGE * m, 
                LASER_RANGE
            );
			if (m > 1) {
			    laser.sprite = GetImage('abilityLaser');
			}
			this.bullets[this.bullets.length] = laser;
			
			if (this.upgrades[SPREAD_ID] > 0) {                    
				SpreadLaserShots(this, laser, this.bullets, this.upgrades[SPREAD_ID]);
			}
        }
        else if (this.laserCd > 0) {
            this.laserCd--;
        }
    };
    
    // Draws the player to the canvas
    p.Draw = function(canvas) {
    
        // Transform the canvas to match the player orientation
        canvas.translate(this.x, this.y);
        canvas.transform(this.sin, -this.cos, this.cos, this.sin, 0, 0);
        canvas.translate(-this.sprite.width / 2, -this.sprite.height / 2);
        
        // Draw the sprite
        canvas.drawImage(this.sprite, 0, 0);
        
        // Draw the shield
        if (this.upgrades[SHIELD_ID] > 0) {
            canvas.drawImage(this.shieldSprite, 14, 9);
        }
        
        // Draw the flamethrower
        if (this.upgrades[FLAME_ID] > 0) {
            canvas.drawImage(this.flamethrowerSprite, -15, 9);
        }
        
        // Draw the laser gun
        var gun;
        if (this.spread) {
            gun = this.spreadSprite;
        }
        else {
            gun = this.laserSprite;
        }
        canvas.drawImage(gun, this.sprite.width / 2 - gun.width / 2, -5);
        
        // Restore the transform
        ResetTransform(canvas);
    
        // Draw bullets and skills
        this.DrawBase(canvas);
    };
    
    return p;
}