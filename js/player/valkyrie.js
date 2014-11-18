function PlayerValkyrieType() {
    var p = BasePlayer(
        GetImage('pValkyrieBody'),
		14,
		0.2,
        1,
        2
    );
    
    // Sprites
    p.drawObjects.push({
        sprite: GetImage('pValkyrieShield'),
        xOffset: 3,
        yOffset: -28
    });
    p.drawObjects.push({
        sprite: GetImage('pValkyrieGun'),
        xOffset: -42,
        yOffset: -28
    });
    
    // Twin shot data
    p.gunData1 = { 
        sprite: GetImage('laser'),
        cd: 0, 
        range: 499, 
        list: p.bullets, 
        dx: -35, 
        dy: 40, 
        pierce: true 
    };
    p.gunData2 = { 
        sprite: GetImage('laser'),
        cd: 0, 
        range: 499, 
        list: p.bullets, 
        dx: -25, 
        dy: 40, 
        pierce: true 
    };
    p.Shoot = EnemyWeaponGun;
    p.charge = 0;
    
    // Retrieves the Y offset for ability bullets
    p.getTurretY = function() {
        if (this.charge < 50) return 49;
        else if (this.charge < 100) return 73;
        else return 94;
    }
	
	// Damage reduction while locked
    p.onDamaged = function(amount, damager) {
        if (this.locked || this.skillDuration > 0) {
            return amount * 0.5;
        }
    }
    
    // Update function
    p.Update = function() {
        this.UpdateBase();
        
        // Damage multiplier
		var m = this.GetDamageMultiplier();
        
        // Double shot
        if (!this.disabled) {
            this.gunData1.damage = this.gunData2.damage = m;
            this.gunData1.rate = this.gunData2.rate = 120 / (5 + this.upgrades[DUAL_ID] * 2.5);
            this.Shoot(this.gunData1);
            this.Shoot(this.gunData2);
        }
    };
    
    // Draws the grapple gun when empty pointed towards the grapple hook
    p.onDraw = function() {
        canvas.translate(this.x, this.y);
        canvas.transform(this.sin, -this.cos, this.cos, this.sin, 0, 0);
        
        // Draw back shell
        var y = Math.max(-56, -36 - 4 * this.charge / 5);
        canvas.drawImage(GetImage('pValkyrieShell'), -12, y);
        
        // Draw connection rods
        canvas.drawImage(GetImage('pValkyrieRod'), -3, -6);
        canvas.drawImage(GetImage('pValkyrieRod'), -3, this.charge / 2);
        
        // Draw the wing
        canvas.drawImage(GetImage('pValkyrieWing'), -33, -23);
        
        // Draw the rails
        if (this.charge >= 50) {
            var x = Math.min(this.charge * 4 / 5, 60);
            canvas.drawImage(GetImage('pValkyrieRailLeft'), 28 - x, 2);
            canvas.drawImage(GetImage('pValkyrieRailRight'), x - 50, 2);
        }
        else {
            y = -22;
            if (this.charge >= 25) y = Math.min(y + this.charge - 25, 2);
            canvas.drawImage(GetImage('pValkyrieRailLeft'), -12, y);
            canvas.drawImage(GetImage('pValkyrieRailRight'), -10, y);
        }
        
        // Draw the turret
        y = 15;
        if (this.charge >= 25) y = Math.min(y + this.charge - 25, 40);
        if (this.charge >= 75) y += this.charge - 75;
        canvas.drawImage(GetImage('pValkyrieTurret'), -10, y);
        
        // Draw the scope
        if (this.locked) {
            canvas.drawImage(GetImage('pValkyrieScope'), -3, y + 34);
        }
        
        // Draw the front shell
        y = -14;
        if (this.charge >= 25) y = Math.min(y + this.charge - 25, 10);
        canvas.drawImage(GetImage('pValkyrieShell'), -12, y);
        
        // Draw range indicator
        if (this.range) {
            canvas.drawImage(GetImage('pValkyrieTarget'), -50, this.range - 50);
        }
        
        ResetTransform(canvas);
    };
    
    return p;
}