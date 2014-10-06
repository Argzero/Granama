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
            10,            HEALTH,     -1,   6,
            10,            HEAL,       -1,   7
        ]
    );
	
	// Sprites
    p.drawObjects.push({ 
        sprite: GetImage('pDefenseLaser'), 
        xOffset: -10, 
        yOffset: -21
    });
    p.drawObjects.push({
        sprite: GetImage('pDefenseShield'),
        xOffset: -18,
        yOffset: -9,
        condition: function() { return this.upgrades[SHIELD_ID] > 0; }.bind(p)
    });
    p.drawObjects.push({
        sprite: GetImage('pDefenseFlame'),
        xOffset: -42,
        yOffset: -17,
        condition: function() { return this.upgrades[MINIGUN_ID] > 0; }.bind(p)
    });
	
	// Weapon data
	p.rocketData = { cd: 0, range: LASER_RANGE, rate: 60, sprite: GetImage('rocket'), speed: 15, dx: 0, dy: 54, list: p.bullets };
	p.minigunData = { cd: 0, range: LASER_RANGE, angle: 20, dx: -30, dy: 45, sprite: GetImage('bullet'), list: p.bullets };
	p.FireRocket = EnemyWeaponRocket;
    p.FireMinigun = EnemyWeaponGun;
	
	// Updates the player
    p.Update = function() {
        this.UpdateBase();
		
		// Damage multiplier
		var m = this.GetDamageMultiplier();
		
		// Minigun
		if (this.upgrades[MINIGUN_ID] > 0) {
			this.minigunData.damage = 2 * m;
			this.minigunData.rate = 6 - this.upgrades[MINIGUN_ID] * 0.1;
			this.FireMinigun(this.minigunData);
		}
		
		// Rockets
		if (!this.rocketData.lists) {
			this.rocketData.lists = [gameScreen.enemyManager.enemies, gameScreen.enemyManager.turrets];
		}
		this.rocketData.damage = 8 * m;
		this.rocketData.knockback = 30 + 5 * this.upgrades[KNOCKBACK_ID];
		this.rocketData.radius = 100 + 10 * this.upgrades[EXPLOSION_ID];
		this.FireRocket(this.rocketData);
	}
	
    return p;
}