function BossPlayer(x, y) {
    this.x = x;
    this.y = y;
    this.fx = -23;
    this.fy = -6;
    this.sx = 13;
    this.sy = 7;
    this.angle = 0.0;
    this.bulletCd = 20;
    this.fireCd = 0;
    this.shield = 1;
    this.shieldCd = SHIELD_RATE;
    this.currentShield = 0.0;
    this.flamethrower = 1;
    this.laser = 0;
    this.spread = 0;
    this.c = 0;
    this.s = 1;
    this.speed = PLAYER_SPEED;
    this.health = PLAYER_HEALTH * 2;
    this.maxHealth = PLAYER_HEALTH * 2;
    this.bullets = new Array();
    this.sprite = GetImage("pTraitorBody");
    this.laserSprite = GetImage("pTraitorLaser");
    this.laserSpreadSprite = GetImage("pTraitorSpread");
    this.shieldSprite = new GetImage("pTraitorShield");
    this.flamethrowerSprite = GetImage("pTraitorFlame");
    this.leftArm = GetImage('droneArmLeft');
    this.rightArm = GetImage('droneArmRight');
    
    this.droneCounter = 0;
    this.drones = [];
    this.droneTarget = 1;
    this.droneTargetScale = 1;
	
    // Deals damage to the player
    // amount - amount of damage to deal
    this.Damage = Damage;
    function Damage(amount, damager) {
        if (this.currentShield > amount) {
            this.currentShield -= amount;
        }
        else if (this.currentShield > 0) {
            amount -= this.currentShield;
            this.currentShield = 0;
            this.health -= amount;
        }
        else {
            this.health -= amount;
        }
    }
    
    // Updates the player
    this.Update = Update;
    function Update() {
    
        // Player's shield
        if (this.shield > 0) {
            this.shieldCd--;
            if (this.shieldCd <= 0) {
                this.shieldCd += SHIELD_RATE - this.shield * SHIELD_SCALE;
                this.currentShield += this.maxHealth * SHIELD_GAIN;
                if (this.currentShield > this.maxHealth * SHIELD_MAX) {
                    this.currentShield = this.maxHealth * SHIELD_MAX;
                }
            }
        }
        
        // Drone effects
        if (this.drones.length >= 6) {
            HealMehcanics();
            HealMehcanics();
            ShieldMechanics();
        }
        
        // Update bullets
        var i;
        for (i = 0; i < this.bullets.length; i++) {
            if (!this.bullets[i]) {
                this.bullets.splice(i, 1);
                i--;
            }
            this.bullets[i].Update();
            if (DistanceSq(this.bullets[i].ox, this.bullets[i].oy, this.bullets[i].x, this.bullets[i].y) > Sq(this.bullets[i].range) || !WithinScreen(this.bullets[i])) {
                this.bullets.splice(i, 1);
                i--;
            }
        }
    
        // Update the player's angle
        this.angle = GetAngle(this.x, this.y, mouseX, mouseY);
        var c = -Math.sin(this.angle);
        var s = Math.cos(this.angle);
        this.c = c;
        this.s = s;
        
        // Movement
        var hor = KeyPressed(KEY_D) != KeyPressed(KEY_A);
        var vert = KeyPressed(KEY_W) != KeyPressed(KEY_S);
        var speed = this.speed;
        var m = (this.ability == OVERDRIVE && this.abilityActive == true) ? 2 : 1;
        if (KeyPressed(KEY_W)) {
            this.y -= speed * (hor ? HALF_RT_2 : 1) * m;
        }
        if (KeyPressed(KEY_S)) {
            this.y += speed * (hor ? HALF_RT_2 : 1) * m;
        }
        if (KeyPressed(KEY_A)) {
            this.x -= speed * (vert ? HALF_RT_2 : 1) * m;
        }
        if (KeyPressed(KEY_D)) {
            this.x += speed * (vert ? HALF_RT_2 : 1) * m;
        }
		
        if (this.XMin() < 0) {
            this.x += -this.XMin();
        }
        if (this.XMax() > GAME_WIDTH) {
            this.x -= this.XMax() - GAME_WIDTH;
        }
        if (this.YMin() < 0) {
            this.y += -this.YMin();
        }
        if (this.YMax() > GAME_HEIGHT) {
            this.y -= this.YMax() - GAME_HEIGHT;
        }
        
        // Flamethrower
        if (this.flamethrower > 0 && this.fireCd <= 0 && KeyPressed(KEY_LMB)) {
            this.fireCd = FIRE_CD;
            var m = 1;
			var range = this.flamethrower * FLAME_UP + FIRE_RANGE;
            var fire = new Fire(this.x - 30 * s + 20 * c + c * this.sprite.width / 2, this.y + 30 * c + 20 * s + s * this.sprite.width / 2, c * BULLET_SPEED, s * BULLET_SPEED, this.angle, FIRE_DAMAGE * m, range);
            this.bullets[this.bullets.length] = fire;
        }
        else if (this.fireCd > 0) {
            this.fireCd--;
        }
		
		// Lasers
        if (this.bulletCd <= 0 && KeyPressed(KEY_LMB)) {
			this.bulletCd = 60 / (LASER_APS + this.laser * LASER_UP);
			var m = 1;
			var laser = NewLaser(this.x + c * (this.sprite.height / 2 + 25), this.y + s * (this.sprite.height / 2 + 25), c * BULLET_SPEED, s * BULLET_SPEED, this.angle, LASER_DAMAGE * m, LASER_RANGE);
			this.bullets[this.bullets.length] = laser;
			
			if (this.spread > 0) {                    
				SpreadLaserShots(this, laser, this.bullets);
			}
			
			if (this.drones.length >= 6) {
			    this.FireDroneLaser(1);
			    this.FireDroneLaser(-1);
			}
        }
        else if (this.bulletCd > 0) {
            this.bulletCd--;
        }
        
        // Update Drones
        if (this.drones.length < 6) {
            for (i = 0; i < this.drones.length; i++) {
                this.drones[i].Update();
            }
        }
    }
    
    // Fires lasers from a drone arm
    this.FireDroneLaser = function(side) {
        var m = 2;
        var laser = NewLaser(
            this.x + side * this.s * 65 + this.c * (this.sprite.height / 2 + 25), 
            this.y - side * this.c * 65 + this.s * (this.sprite.height / 2 + 25), 
            this.c * BULLET_SPEED, 
            this.s * BULLET_SPEED, 
            this.angle, 
            LASER_DAMAGE * m, 
            LASER_RANGE
        );
        laser.sprite = GetImage('abilityLaser');
        this.bullets[this.bullets.length] = laser;
        if (this.spread >= 2) {
            var temp = this.spread;
            this.spread = (this.spread - 1.5) / 2;
            SpreadLaserShots(this, laser, this.bullets);
            this.spread = temp;
        }
    }
    
    // Draws the player to the canvas
    this.Draw = Draw;
    function Draw(canvas) {
        
        // Draw bullets
        var i;
        for (i = 0; i < this.bullets.length; i++) {
            this.bullets[i].Draw(canvas);
        }
        
        canvas.translate(this.x, this.y);
        
        // Draw drones
        if (this.drones.length < 6) {
            for (i = 0; i < this.drones.length; i++) {
                this.drones[i].Draw(canvas);
            }
        }
        
        canvas.rotate(this.angle);
        canvas.translate(-this.sprite.width / 2, -this.sprite.height / 2);
        canvas.drawImage(this.sprite, 0, 0);
        if (this.shield > 0) {
            canvas.drawImage(this.shieldSprite, this.sx, this.sy);
        }
        if (this.flamethrower > 0) {
            canvas.drawImage(this.flamethrowerSprite, this.fx, this.fy);
        }
        var gun;
        if (this.spread) {
            gun = this.laserSpreadSprite;
        }
        else {
            gun = this.laserSprite;
        }
        canvas.drawImage(gun, this.sprite.width / 2 - gun.width / 2, -34 - (this.spread ? 9 : 0));
        
        // Draw arms
        if (this.drones.length >= 6) {
            canvas.drawImage(this.rightArm, this.sprite.width / 2 - 26 - this.rightArm.width, -25);
            canvas.drawImage(this.leftArm, this.sprite.width / 2 + 26, -25);
        }
        
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
    } 
    
    this.ApplyKill = function() {
        if (this.drones.length == 6) return;
        this.droneCounter++;
        if (this.droneCounter == this.droneTarget) {
            this.droneCounter = 0;
            this.droneTarget += this.droneTargetScale;
            var droneAngle = 2 * Math.PI / (this.drones.length + 1);
            if (this.drones.length > 0) {
                var minAngle = this.drones[0].angle;
                var minIndex = 0;
                var i;
                for (i = 1; i < this.drones.length; i++) {
                    if (this.drones[i].angle < this.minAngle) {
                        this.minAngle = this.drones[i].angle;
                        minIndex = i;
                    }
                }
                for (i = 0; i < this.drones.length; i++) {
                    this.drones[(i + minIndex) % this.drones.length].SetAngle(droneAngle * (i + 1));
                }
            }
            this.drones.splice(minIndex, 0, new Drone(DRONE_NAMES[this.drones.length % 3], 0, DRONE_MECHANICS[this.drones.length % 3]));
        }
    }
    
    this.XMin = XMin;
    function XMin() {
        return this.x - this.sprite.width / 2;
    }
    
    this.XMax = XMax;
    function XMax() {
        return this.x + this.sprite.width / 2;
    }
    
    this.YMin = YMin;
    function YMin() {
        return this.y - this.sprite.height / 2;
    }
    
    this.YMax = YMax;
    function YMax() {
        return this.y + this.sprite.height / 2;
    }
}