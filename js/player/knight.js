function PlayerKnightType() {
    var p = BasePlayer(
        GetImage('pKnightBody'),
        [ // Drop Chance | Drop type | Max | Backup Drop
            6,             COOLDOWN,   50,   5,
            6,             SHOTGUN,    50,   5,
            6,             SLOW,       50,   5,
            6,             SHIELD,     50,   6,
            15,            SPEED,      100,  6,
            10,            DAMAGE,     -1,   5,
            10,            HEALTH,     -1,   6,
            10,            HEAL,       -1,   7
        ]
    );
    
    // Sprites
    p.drawObjects.push({ 
        sprite: GetImage('pKnightQuiver'), 
        xOffset: -13, 
        yOffset: -46
    });
    p.drawObjects.push({
        sprite: GetImage('pKnightShield'),
        xOffset: -5,
        yOffset: -14,
        condition: function() { return this.upgrades[SHIELD_ID] > 0; }.bind(p)
    });
    p.drawObjects.push({
        sprite: GetImage('pKnightArm'),
        xOffset: -49,
        yOffset: -17
    });
    p.drawObjects.push({
        sprite: GetImage('sword'),
        xOffset: -35,
        yOffset: 21,
        condition: function() { return true; }
    });
    
    p.shotgunData = { cd: 0, sprite: GetImage('shell'), range: LASER_RANGE, discharge: 0, initial: true, angle: 30, speed: 15, dx: -30, dy: 45, list: p.bullets };
    p.slowData = { cd: 0, sprite: GetImage('slowMissile'), range: LASER_RANGE, multiplier: 0.5, dx: 0, dy: 54, speed: 15, list: p.bullets };
    p.FireShotgun = EnemyWeaponRail;
    p.FireSlow = EnemyWeaponSlow;
    
    // Update function
    p.Update = function() {
        this.UpdateBase();
        
        // Cooldown reduction
        this.cdm = 1 - 0.01 * this.upgrades[COOLDOWN_ID];
        
        // Damage multiplier
		var m = this.GetDamageMultiplier();
        
        // Shotgun
        var num = 15 + this.upgrades[SHOTGUN_ID];
        var bullets = Math.ceil(num / 5);
        this.shotgunData.damage = m;
        this.shotgunData.duration = Math.floor(num / bullets);
        this.shotgunData.bullets = bullets;
        this.shotgunData.rate = 60 * this.rm;
        this.FireShotgun(this.shotgunData);
        
        // Slow gun
        this.slowData.damage = 2 * m;
        this.slowData.duration = 300 + this.upgrades[SLOW_ID] * 10;
        this.slowData.rate = 40 * this.rm;
        this.FireSlow(this.slowData);
    }
    
    return p;
}