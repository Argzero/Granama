function Player(x, y, type, ability, fx, fy, sx, sy) {
    this.x = x;
    this.y = y;
    this.fx = fx;
    this.fy = fy;
    this.sx = sx;
    this.sy = sy;
	this.ability = ability;
	this.abilityCd = -1;
	this.abilityDur = -1;
	this.currentAbilityCd = 0;
	this.currentAbilityDur = 0;
	this.abilityActive = false;
	this.teleporterLocX = -1;
	this.teleporterLocY = -1;
	this.burnoutCd = -1;
    this.angle = 0.0;
    this.bulletCd = 20;
    this.fireCd = 0;
    this.shield = 0;
    this.shieldCd = SHIELD_RATE;
    this.currentShield = 0.0;
    this.flamethrower = 0;
    this.laser = 0;
    this.spread = 0;
    this.waveAngle = 0;
    this.c = 0;
    this.s = 1;
    this.speed = PLAYER_SPEED;
    this.health = PLAYER_HEALTH;
    this.maxHealth = PLAYER_HEALTH;
    this.bullets = new Array();
    this.pluses = new Array();
    this.sprite = GetImage("p" + type + "Body");
    this.laserSprite = GetImage("p" + type + "Laser");
    this.laserSpreadSprite = GetImage("p" + type + "Spread");
    this.shieldSprite = new GetImage("p" + type + "Shield");
    this.flamethrowerSprite = GetImage("p" + type + "Flame");
	
	//Variables that depend on Ability chosen
	if(this.ability == BLINK)
	{
		this.abilityCd = BLINK_CD;
		this.abilityDur = 1;
	}
	else if(this.ability == OVERDRIVE)
	{
		this.abilityCd = OVERDRIVE_CD;
		this.abilityDur = OVERDRIVE_DURATION;
		this.burnoutCd = FIRE_CD;
	}
	else if(this.ability == TELEPORT)
	{
		this.abilityCd = TELEPORT_CD;
		this.abilityDur = TELEPORT_DURATION;
	}
	else if(this.ability == WAVEBURST)
	{
		this.abilityCd = WAVEBURST_CD;
		this.abilityDur = WAVEBURST_DURATION;
	}
	else if(this.ability == BREAKERBLASTER)
	{
		this.abilityCd = BREAKERBLASTER_CD;
		this.abilityDur = BREAKERBLASTER_DURATION;
	}
	else if(this.ability == DECIMATION)
	{
		this.abilityCd = DECIMATION_CD;
		this.abilityDur = DECIMATION_DURATION;
	}
	else if(this.ability == STASIS)
	{
		this.abilityCd = STASIS_CD;
		this.abilityDur = STASIS_DURATION;
	}
	else if(this.ability == REFLECTOR)
	{
		this.abilityCd = REFLECTOR_CD;
		this.abilityDur = REFLECTOR_DURATION;
	}
	else if(this.ability == RECHARGER)
	{
		this.abilityCd = RECHARGER_CD;
		this.abilityDur = 1;
	}
    
    // Deals damage to the player
    // amount - amount of damage to deal
    this.Damage = Damage;
    function Damage(amount, damager) {
        if (this.ability == STASIS && this.abilityActive) {
            amount *= STASIS_REDUCTION;
        }
        else if (damager && this.ability == REFLECTOR && this.abilityActive) {
            var m = Rand(2) * 2 - 1;
            var reflection = new Reflection(this.x, this.y, m * this.s * BULLET_SPEED, m * this.c * BULLET_SPEED, amount, damager);
            this.bullets[this.bullets.length] = reflection;
            return;
        }
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
        
        // Update bullets
        for (var i = 0; i < this.bullets.length; i++) {
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
        
        // Update pluses
        for (var i = 0; i < this.pluses.length; i++) {
            this.pluses[i].Update();
        }
		
		//Player's ability
		if (this.currentAbilityCd > 0 && this.abilityActive == false)
		{
			this.currentAbilityCd --;
		}
		
		//Active Ability
		if (this.abilityActive == true)
		{
			//increase the duration
			this.currentAbilityDur ++;
			
			//once it's equal, reset curDur and deactivate ability
			if(this.currentAbilityDur >= this.abilityDur)
			{
				this.currentAbilityDur = 0;
				this.abilityActive = false;
				this.pluses.splice(0, this.pluses.length);
			}
		}
		
		// Stasis
		if (this.ability == STASIS && this.abilityActive == true) {
		    this.health += this.maxHealth * STASIS_REGEN / this.abilityDur;
		    if (this.health >= this.maxHealth) {
		        this.health = this.maxHealth;
		        this.currentAbilityDur = 0;
				this.abilityActive = false;
		    }
		    if (this.currentAbilityDur % 15 == 0) {
		        if (this.pluses.length == 5) {
		            this.pluses.splice(0, 1);
		        }
		        var angle = Math.random() * 2 * Math.PI;
		        var c = Math.cos(angle);
		        var s = Math.sin(angle);
		        this.pluses[this.pluses.length] = new Plus(this.x, this.y, 2 * c, 2 * s);
		    }
		    return;
		}
    
        // Update the player's angle
        var a = Math.atan((mouseY - this.y) / (this.x - mouseX));
        if (this.x < mouseX) {
            this.angle = -HALF_PI - a;
        }
        else {
            this.angle = HALF_PI - a;
        }
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
		
		//Ability Usage
		if(KeyPressed(KEY_SPACE) && this.currentAbilityCd <= 0 && this.abilityActive == false)
		{
			var abilityUsed = false;
			
			//Blink Ability
			if(this.ability == BLINK)
			{
				var blinkX = 0;
                var blinkY = 0;
                if (KeyPressed(KEY_D)) {
                    blinkX += BLINK_DISTANCE;
                }
                if (KeyPressed(KEY_A)) {
                    blinkX -= BLINK_DISTANCE;
                }
                if (KeyPressed(KEY_W)) {
                    blinkY -= BLINK_DISTANCE;
                }
                if (KeyPressed(KEY_S)) {
                    blinkY += BLINK_DISTANCE;
                }
                if (blinkX != 0 && blinkY != 0) {
                    blinkX *= HALF_RT_2;
                    blinkY *= HALF_RT_2;
                }
                if (blinkX != 0 || blinkY != 0) {
                    this.x += blinkX;
                    this.y += blinkY;
                    abilityUsed = true;
                }
			}
			
			// Recharge ability
			else if (this.ability == RECHARGER) {
                if (this.shield > 0) {
			        abilityUsed = this.currentShield < this.maxHealth * SHIELD_MAX;
			        this.currentShield = this.maxHealth * SHIELD_MAX;
                }
			}
			
			// Teleport ability
			else if(this.ability == TELEPORT)
			{
			    this.teleporterLocX = this.x;
			    this.teleporterLocY = this.y;
			    abilityUsed = true;
			    this.abilityActive = true;
			}
			
			// Other abilities
			else if (this.ability != STASIS || this.health < this.maxHealth) {
				abilityUsed = true;
				this.abilityActive = true;
				this.waveAngle = 0;
			}
			
			if(abilityUsed) {
				this.currentAbilityCd = this.abilityCd;
			}
		}
		else if(((KeyPressed(KEY_SPACE) && this.ability == TELEPORT) && this.abilityActive == true) && this.currentAbilityDur >= 60)
		{
		    this.y = this.teleporterLocY;
		    this.x = this.teleporterLocX;
		    this.currentAbilityDur = 0;
		    this.abilityActive = false;
		}
        
        // Flamethrower
        if (this.flamethrower > 0 && this.fireCd <= 0 && KeyPressed(KEY_LMB)) {
            this.fireCd = FIRE_CD;
            var m = 1;
			if(this.ability == DECIMATION && this.abilityActive == true)
			{
			    m = 2;
			}
			var range = this.flamethrower * FLAME_UP + FIRE_RANGE;
            var fire = new Fire(this.x - 30 * s + 20 * c + c * this.sprite.width / 2, this.y + 30 * c + 20 * s + s * this.sprite.width / 2, c * BULLET_SPEED, s * BULLET_SPEED, this.angle, FIRE_DAMAGE * m, range);
            if (this.abilityActive && this.ability == DECIMATION) {
			    fire.sprite = GetImage('abilityFire');
			}
            this.bullets[this.bullets.length] = fire;
        }
        else if (this.fireCd > 0) {
            this.fireCd--;
        }
		
		// Lasers
        if (this.bulletCd <= 0 && KeyPressed(KEY_LMB)) {
			this.bulletCd = 60 / (LASER_APS + this.laser * LASER_UP);
			var m = 1;
			if(this.abilityActive && this.ability == DECIMATION) {
			    m = 2;
			}
			var laser = NewLaser(this.x + c * (this.sprite.height / 2 + 25), this.y + s * (this.sprite.height / 2 + 25), c * BULLET_SPEED, s * BULLET_SPEED, this.angle, LASER_DAMAGE * m, LASER_RANGE);
			if (this.abilityActive && this.ability == DECIMATION) {
			    laser.sprite = GetImage('abilityLaser');
			}
			this.bullets[this.bullets.length] = laser;
			
			if (this.spread > 0) {                    
				SpreadLaserShots(this, laser, this.bullets);
			}
        }
        else if (this.bulletCd > 0) {
            this.bulletCd--;
        }
        
        // Wave Burst
        if (this.abilityActive && this.ability == WAVEBURST) {
            for (var i = 0; i < 5; i++) {
                c = -Math.sin(this.angle + this.waveAngle);
                s = Math.cos(this.angle + this.waveAngle);
                this.waveAngle += Math.PI / 60;
                var spacing = (this.sprite.height / 2 + 25 + BULLET_SPEED * i / 5);
                var laser = NewLaser(this.x + c * spacing, this.y + s * spacing, c * BULLET_SPEED, s * BULLET_SPEED, this.angle + this.waveAngle, LASER_DAMAGE, LASER_RANGE * 2);
                laser.x += laser.velX * i / 5;
                laser.y += laser.velY * i / 5;
                laser.sprite = GetImage('abilityLaser');
                this.bullets[this.bullets.length] = laser;
            }
        }
        
        // KO Cannon
        if (this.abilityActive && this.ability == BREAKERBLASTER) {
            var laser = NewLaser(this.x + c * (this.sprite.height / 2 + 25), this.y + s * (this.sprite.height / 2 + 25), c * BULLET_SPEED, s * BULLET_SPEED, this.angle, LASER_DAMAGE * 2, LASER_RANGE * 2);
            laser.sprite = GetImage('abilityCannon');
			this.bullets[this.bullets.length] = laser;
        }
        
        // Overdrive
		if ((this.burnoutCd <= 0 && this.ability == "Overdrive") && this.abilityActive == true)
		{
			var oppositeAngle = -this.angle;
			
			var velX = 0;
			var velY = 0;
			if (KeyPressed(KEY_D)) {
				oppositeAngle = HALF_PI;
				velX = -5;
			}
			if (KeyPressed(KEY_A)) {
				oppositeAngle = -HALF_PI;
				velX = 5;
			}
			if (KeyPressed(KEY_W)) {
				oppositeAngle = 0;
				velY = 5;
			}
			if (KeyPressed(KEY_S)) {
				oppositeAngle = Math.Pi;
				velY = -5;
			}
			if (velX != 0 && velY != 0) {
				velX *= HALF_RT_2;
				velY *= HALF_RT_2;
			}
			
			if (velX != 0 || velY != 0) {
                this.burnoutCd = FIRE_CD;
    			var range = 200;
                var fire = new Fire(this.x, this.y, velX, velY, oppositeAngle, FIRE_DAMAGE, range);
                fire.sprite = GetImage('abilityFire');
                this.bullets[this.bullets.length] = fire;
			}
        }
        else if (this.burnoutCd > 0) 
		{
            this.burnoutCd--;
        }
    }
    
    // Draws the player to the canvas
    this.Draw = Draw;
    function Draw(canvas) {
        
        // Draw bullets
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].Draw(canvas);
        }
        
        // Teleport marker
        if (this.abilityActive && this.ability == TELEPORT) {
            var img = GetImage('abilityTeleportNode');
            canvas.drawImage(img, this.teleporterLocX - img.width / 2, this.teleporterLocY - img.height / 2);
        }
        
        canvas.translate(this.x, this.y);
        canvas.rotate(this.angle);
        canvas.translate(-this.sprite.width / 2, -this.sprite.height / 2);
        canvas.drawImage(this.sprite, 0, 0);
        if (this.shield > 0) {
            canvas.drawImage(this.shieldSprite, sx, sy);
        }
        if (this.flamethrower > 0) {
            canvas.drawImage(this.flamethrowerSprite, fx, fy);
        }
        var gun;
        if (this.spread) {
            gun = this.laserSpreadSprite;
        }
        else {
            gun = this.laserSprite;
        }
        canvas.drawImage(gun, this.sprite.width / 2 - gun.width / 2, -5);
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
        
        // Draw pluses
        if (this.abilityActive) {
            for (var i = 0; i < this.pluses.length; i++) {
                this.pluses[i].Draw(canvas);
            }
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