function PlayerPowerType() {
    var p = BasePlayer(
        GetImage('pPowerBody'),
		6,
		0.25
    );
    
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
        yOffset: -20
        //condition: function() { return this.upgrades[SHIELD_ID] > 0; }.bind(p)
    });
    p.drawObjects.push({
        sprite: GetImage('pPowerFlame'),
        xOffset: -40,
        yOffset: -20
    });
	
	// Weapon data
	p.fireData = { 
        cd: 0, 
        list: p.bullets, 
        dx: -30, 
        dy: 45, 
        rate: FIRE_CD 
    };
    p.laserData = { 
        cd: 0, 
        range: 499, 
        list: p.bullets, 
        dx: 0, 
        dy: 54, 
        pierce: true 
    };
	p.ShootFire = EnemyWeaponFire;
    p.FireLasers = EnemyWeaponGun;
    
    // Updates the player
    p.Update = function() {
        this.UpdateBase();
        
        // Get damage multiplier
        var m = this.GetDamageMultiplier();
        var m2 = 1;
        if (this.onFire) {
            var temp = this.onFire();
            if (temp !== undefined) {
                m2 = temp;
            }
            if (!m2) {
                return;
            }
        }
        
        // Flamethrower
		var fireUps = this.upgrades[FLAME_ID];
        this.fireData.sprite = m2 > 1 ? GetImage('abilityFire') : GetImage('fire');
        this.fireData.damage = FIRE_DAMAGE * m * m2;
        this.fireData.range = fireUps * 20 + 100;
        this.ShootFire(this.fireData);
        
        // Lasers
        this.laserData.sprite = m2 > 1 ? GetImage('abilityLaser') : GetImage('laser');
        this.laserData.damage = 0.4 * m * m2;
        this.laserData.rate = 60 / (5 + this.upgrades[LASER_ID] * 2.5);
        this.laserData.spread = this.upgrades[SPREAD_ID] / 2;
        this.FireLasers(this.laserData);
    };
    
    return p;
}