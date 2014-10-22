function PlayerKnightType() {
    var p = BasePlayer(
        GetImage('pKnightBody'),
		20,
		0.1,
		3
    );
    
    // Sprites
    p.drawObjects.push({ 
        sprite: GetImage('pKnightGrappleFull'), 
        xOffset: -20, 
        yOffset: -46,
        condition: function() { return !this.grapple; }.bind(p)
    });
    /*
    p.drawObjects.push({
        sprite: GetImage('pKnightQuiver'),
        xOffset: -13,
        yOffset: -46
    });
    */
    p.drawObjects.push({
        sprite: GetImage('pKnightShield'),
        xOffset: -5,
        yOffset: -14
        //condition: function() { return this.upgrades[SHIELD_ID] > 0; }.bind(p)
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
    
    /*
    p.arrowData = { 
        cd: 0, 
        sprite: GetImage('arrow'), 
        range: 499, 
        discharge: 0, 
        initial: true, 
        speed: 10,
        dx: 0, 
        dy: 30,
        rate: 50,
        list: p.bullets 
    };
    */
    p.swordData = { 
        cd: 0, 
        knockback: 50,
        rate: 60,
        angle: Math.PI / 4,
        list: p.bullets
    };
    p.grappleData = {
        cd: 0,
        range: 750,
        rate: 120,
        list: p.bullets
    };
    p.grappleImg = GetImage('pKnightGrappleEmpty');
    //p.FireArrow = EnemyWeaponRail;
    p.Slash = EnemyWeaponSword;
    p.Grapple = EnemyWeaponGrapple;
    p.sword = true;
    
    // Update function
    p.Update = function() {
        this.UpdateBase();
        
        // Damage multiplier
		var m = this.GetDamageMultiplier();
        
        // Arrows
        /*
        var num = 5 + 1.5 * this.upgrades[ARROW_ID];
        this.arrowData.xOffset = num * 1.5;
        this.arrowData.damage = 4 * m;
        this.arrowData.duration = num;
        this.FireArrow(this.arrowData);
        */
        
        // Grapple
        this.grappleData.damage = m;
        this.grappleData.stun = 30 + this.upgrades[ARROW_ID] * 10;
        this.Grapple(this.grappleData);
        
        // Sword
        this.swordData.damage = 5 * m;
        this.swordData.arc = Math.PI / 3 + this.upgrades[SLASH_ID] * Math.PI / 18;
        this.swordData.lifesteal = 0.1 + this.upgrades[LIFESTEAL_ID] * 0.04;
        this.Slash(this.swordData);
    };
    
    // Draws the grapple gun when empty pointed towards the grapple hook
    p.onDraw = function() {
        if (this.grapple) {
            canvas.translate(this.x - 18 * this.cos, this.y - 18 * this.sin);
            var angle = AngleTo(this.grapple, this);
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            canvas.transform(c, s, -s, c, 0, 0);
            canvas.drawImage(this.grappleImg, -13, -26);
            ResetTransform(canvas);
        }
    };
    
    return p;
}