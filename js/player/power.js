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
            var fire = FireProjectile(
                m2 > 1 ? GetImage('abilityFire') : GetImage('fire'),
                this,
                30, 
                45, 
                this.cos * BULLET_SPEED, 
                this.sin * BULLET_SPEED, 
                this.angle, 
                FIRE_DAMAGE * m * m2, 
                range,
                true,
                false
            );
            this.bullets[this.bullets.length] = fire;
        }
        else if (this.fireCd > 0) {
            this.fireCd--;
        }
        
        // Lasers
        if (this.laserCd <= 0 && KeyPressed(KEY_LMB)) {
			this.laserCd = 60 / (LASER_APS + this.upgrades[LASER_ID] * LASER_UP);
			var laser = ProjectileBase(
                m2 > 1 ? GetImage('abilityLaser') : GetImage('laser'),
                this,
                0, 
                54, 
                this.cos * BULLET_SPEED, 
                this.sin * BULLET_SPEED, 
                this.angle, 
                LASER_DAMAGE * m * m2, 
                LASER_RANGE,
                true,
                false
            );
			this.bullets.push(laser);
			
            // Spread shot
			if (this.upgrades[SPREAD_ID] > 0) {                    
                laser.Spread(this.upgrades[SPREAD_ID] / 2, this.bullets);
			}
        }
        else if (this.laserCd > 0) {
            this.laserCd--;
        }
    };
    
    return p;
}