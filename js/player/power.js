function PlayerPowerType() {
    var p = BasePlayer(
        GetImage('pPowerBody'),
        [ // Drop Chance | Drop type | Max | Backup Drop
            6,           LASER,        50,   5,
            6,           SPREAD_SHOT,  50,   5,
            6,           FLAMETHROWER, 50,   5,
            6,           SHIELD,       50,   6,
            6,           SPEED,        50,   6,
            10,          DAMAGE,       -1,   5,
            10,          HEALTH,       -1,   6,
            10,          HEAL,         -1,   7
        ]
    );
    
    // Weapon cooldowns
    p.fireCd = 0;
    p.laserCd = 0;
    
    // Sprites
    p.drawObjects.push({ 
        sprite: GetImage('pPowerLaser'), 
        xOffset: -10, 
        yOffset: -30,
        condition: function() { return this.upgrades[SPREAD_ID] == 0; }.bind(p)
    });
    p.drawObjects.push({ 
        sprite: GetImage('pPowerSpread'), 
        xOffset: -20.5,
        yOffset: -30,
        condition: function() { return this.upgrades[SPREAD_ID] > 0; }.bind(p)
    });
    p.drawObjects.push({
        sprite: GetImage('pPowerShield'),
        xOffset: -11,
        yOffset: -20,
        condition: function() { return this.upgrades[SHIELD_ID] > 0; }.bind(p)
    });
    p.drawObjects.push({
        sprite: GetImage('pPowerFlame'),
        xOffset: -40,
        yOffset: -20,
        condition: function() { return this.upgrades[FLAME_ID] > 0; }.bind(p)
    });
    
    // Updates the player
    p.Update = function() {
        this.UpdateBase();
        
        // Get damage multiplier
        var m = this.GetDamageMultiplier();
        var m2 = 1;
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
                FIRE_DAMAGE * m * m2, 
                range
            );
            if (m2 > 1) {
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
                LASER_DAMAGE * m * m2, 
                LASER_RANGE
            );
			if (m2 > 1) {
			    laser.sprite = GetImage('abilityLaser');
			}
			this.bullets[this.bullets.length] = laser;
			
			if (this.upgrades[SPREAD_ID] > 0) {                    
				SpreadLaserShots(this, laser, this.bullets, this.upgrades[SPREAD_ID] / 2);
			}
        }
        else if (this.laserCd > 0) {
            this.laserCd--;
        }
    };
    
    return p;
}