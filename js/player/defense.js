function PlayerDefenseType() {
    var p = BasePlayer(
        GetImage('pDefenseBody'),
		30
    );
	
	// Sprites
    p.drawObjects.push({ 
        sprite: GetImage('pDefenseMissile'), 
        xOffset: -20, 
        yOffset: -21
    });
    p.drawObjects.push({
        sprite: GetImage('pDefenseShield'),
        xOffset: -18,
        yOffset: -9
        //condition: function() { return this.upgrades[SHIELD_ID] > 0; }.bind(p)
    });
    p.drawObjects.push({
        sprite: GetImage('pDefenseGun'),
        xOffset: -42,
        yOffset: -17
    });
	
	// Weapon data
	p.rocketData = { 
        cd: 0, 
        range: 349, 
        rate: 50, 
        sprite: GetImage('missile'), 
        speed: 15, 
        dx: 0, 
        dy: 0, 
        list: p.bullets 
    };
	p.minigunData = { 
        cd: 0, 
        range: 499, 
        angle: 20, 
        dx: -30, 
        dy: 45, 
        sprite: GetImage('minigunBullet'), 
        list: p.bullets 
    };
	p.FireRocket = EnemyWeaponRocket;
    p.FireMinigun = EnemyWeaponGun;
	
	// Updates the player
    p.Update = function() {
        if (this.UpdateBase()) {
            return;
        }
		
		// Damage multiplier
		var m = this.GetDamageMultiplier();
		
		// Minigun
        this.minigunData.damage = 3 * m;
        this.minigunData.rate = 6 - this.upgrades[MINIGUN_ID] / 2;
        this.FireMinigun(this.minigunData);
		
		// Rockets
		if (!this.rocketData.lists) {
			this.rocketData.lists = [gameScreen.enemyManager.enemies, gameScreen.enemyManager.turrets];
		}
		this.rocketData.damage = 12 * m;
		this.rocketData.knockback = 30 + 25 * this.upgrades[KNOCKBACK_ID];
		this.rocketData.radius = 100 + 25 * this.upgrades[EXPLOSION_ID];
		this.FireRocket(this.rocketData);
	}
	
    return p;
}