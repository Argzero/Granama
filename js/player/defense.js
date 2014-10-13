function PlayerDefenseType() {
    var p = BasePlayer(
        GetImage('pDefenseBody'),
        [ // Drop Chance | Drop type | Max | Backup Drop
            6,             MINIGUN,    50,   5,
            6,             EXPLOSION,  50,   5,
            6,             KNOCKBACK,  50,   5,
            6,             SHIELD,     50,   6,
            6,             SPEED,      50,   6,
            10,            DAMAGE,     -1,   5,
            30,            HEALTH,     -1,   6,
            10,            HEAL,       -1,   7
        ]
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
        yOffset: -9,
        condition: function() { return this.upgrades[SHIELD_ID] > 0; }.bind(p)
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
        this.minigunData.rate = 6 - this.upgrades[MINIGUN_ID] * 0.1;
        this.FireMinigun(this.minigunData);
		
		// Rockets
		if (!this.rocketData.lists) {
			this.rocketData.lists = [gameScreen.enemyManager.enemies, gameScreen.enemyManager.turrets];
		}
		this.rocketData.damage = 12 * m;
		this.rocketData.knockback = 30 + 5 * this.upgrades[KNOCKBACK_ID];
		this.rocketData.radius = 100 + 5 * this.upgrades[EXPLOSION_ID];
		this.FireRocket(this.rocketData);
	}
	
    return p;
}