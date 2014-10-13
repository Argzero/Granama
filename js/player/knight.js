function PlayerKnightType() {
    var p = BasePlayer(
        GetImage('pKnightBody'),
        [ // Drop Chance | Drop type | Max | Backup Drop
            6,             ARROW,      50,   5,
            6,             SLASH_ARC,  50,   5,
            6,             LIFESTEAL,  50,   5,
            15,            SHIELD,     100,  6,
            6,             SPEED,      50,  6,
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
        condition: function() { return this.sword; }.bind(p)
    });
    
    p.arrowData = { 
        cd: 0, 
        sprite: GetImage('arrow'), 
        range: LASER_RANGE, 
        discharge: 0, 
        initial: true, 
        speed: 10,
        dx: 0, 
        dy: 30,
        rate: 50,
        list: p.bullets 
    };
    p.swordData = { 
        cd: 0, 
        knockback: 100,
        rate: 60,
        list: p.bullets 
    };
    p.FireArrow = EnemyWeaponRail;
    p.Slash = EnemyWeaponSword;
    p.sword = true;
    
    // Update function
    p.Update = function() {
        this.UpdateBase();
        
        // Damage multiplier
		var m = this.GetDamageMultiplier();
        
        // Arrows
        var num = 5 + this.upgrades[ARROW_ID] / 3;
        this.arrowData.xOffset = num * 1.5;
        this.arrowData.damage = 3 * m;
        this.arrowData.duration = num;
        this.FireArrow(this.arrowData);
        
        // Sword
        this.swordData.damage = 2 * m;
        this.swordData.arc = Math.PI / 3 + this.upgrades[SLASH_ID] * Math.PI / 90;
        this.swordData.lifesteal = 0.1 + this.upgrades[LIFESTEAL_ID] * 0.003;
        this.Slash(this.swordData);
    }
    
    return p;
}