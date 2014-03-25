function Player(x, y, type, ability, fx, fy, sx, sy) {
    this.x = x;
    this.y = y;
    this.fx = fx;
    this.fy = fy;
    this.sx = sx;
    this.sy = sy;
	this.ability = "Blink";//ability;
	this.abilityCd = -1;
	this.abilityDur = -1;
	this.currentAbilityCd = -1;
	this.currentAbilityDur = 0;
	this.abilityActive = false;
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
    this.speed = PLAYER_SPEED;
    this.health = PLAYER_HEALTH;
    this.maxHealth = PLAYER_HEALTH;
    this.bullets = new Array();
    this.sprite = GetImage("p" + type + "Body");
    this.laserSprite = GetImage("p" + type + "Laser");
    this.laserSpreadSprite = GetImage("p" + type + "Spread");
    this.shieldSprite = new GetImage("p" + type + "Shield");
    this.flamethrowerSprite = GetImage("p" + type + "Flame");
	
	//Variables that depend on Ability chosen
	if(this.ability == "Blink")
	{
		this.abilityCd = BLINK_CD;
		this.abilityDur = 1;
		this.currentAbilityCd = BLINK_CD;
	}
	else if(this.ability == "Overdrive")
	{
		this.abilityCd = OVERDRIVE_CD;
		this.abilityDur = OVERDRIVE_DURATION;
		this.currentAbilityCd = OVERDRIVE_CD;
		this.burnoutCd = FIRE_CD;
	}
	else if(this.ability == "Teleport")
	{
		this.abilityCd = TELEPORT_CD;
		this.abilityDur = 1;
		this.currentAbilityCd = TELEPORT_CD;
	}
	else if(this.ability == "WaveBurst")
	{
		this.abilityCd = WAVEBURST_CD;
		this.abilityDur = WAVEBURST_DURATION;
		his.currentAbilityCd = WAVEBURST_CD;
	}
	else if(this.ability == "BreakerBlast")
	{
		this.abilityCd = BREAKERBLAST_CD;
		this.abilityDur = BREAKERBLAST_DURATION;
		his.currentAbilityCd = BREAKERBLAST_CD;
	}
	else if(this.ability == "Decimation")
	{
		this.abilityCd = DECIMATION_CD;
		this.abilityDur = DECIMATION_DURATION;
		his.currentAbilityCd = DECIMATION_CD;
	}
	else if(this.ability == "Stasis")
	{
		this.abilityCd = STASIS_CD;
		this.abilityDur = STASIS_DURATION;
		his.currentAbilityCd = STASIS_CD;
	}
	else if(this.ability == "Reflector")
	{
		this.abilityCd = REFLECTOR_CD;
		this.abilityDur = REFLECTOR_DURATION;
		his.currentAbilityCd = REFLECTOR_CD;
	}
	else if(this.ability == "Recharger")
	{
		this.abilityCd = RECHARGER_CD;
		this.abilityDur = RECHARGER_DURATION;
		his.currentAbilityCd = RECHARGER_CD;
	}
	else
	{
		
	}
	
	
    
    // Deals damage to the player
    // amount - amount of damage to deal
    this.Damage = Damage;
    function Damage(amount) {
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
			}
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
        
        // Movement
        var hor = KeyPressed(KEY_D) != KeyPressed(KEY_A);
        var vert = KeyPressed(KEY_W) != KeyPressed(KEY_S);
        var speed = this.speed;
        if (KeyPressed(KEY_W)) {
            this.y -= speed * (hor ? HALF_RT_2 : 1);
			if(this.ability == "Overdrive" && this.abilityActive == true)
			{
				this.y -= speed * (hor ? HALF_RT_2 : 1);
			}
        }
        if (KeyPressed(KEY_S)) {
            this.y += speed * (hor ? HALF_RT_2 : 1);
			if(this.ability == "Overdrive" && this.abilityActive == true)
			{
				this.y += speed * (hor ? HALF_RT_2 : 1);
			}
        }
        if (KeyPressed(KEY_A)) {
            this.x -= speed * (vert ? HALF_RT_2 : 1);
			if(this.ability == "Overdrive" && this.abilityActive == true)
			{
				this.x -= speed * (vert ? HALF_RT_2 : 1);
			}
        }
        if (KeyPressed(KEY_D)) {
            this.x += speed * (vert ? HALF_RT_2 : 1);
			if(this.ability == "Overdrive" && this.abilityActive == true)
			{
				this.x += speed * (vert ? HALF_RT_2 : 1);
			}
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
			if(this.ability == "Blink")
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
			
			if(this.ability == "Overdrive")
			{
				abilityUsed = true;
				this.abilityActive = true;
			}
			
			if(abilityUsed)
			{
				this.currentAbilityCd = this.abilityCd;
			}
		}
		
		//TEST FOR COOLDOWN
		if(this.currentAbilityCd <= 0)
		{
			this.spread = 10;
		}
		else
		{
			this.spread = 0;
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
        
        // Flamethrower
        if (this.flamethrower > 0) {
            if (this.fireCd <= 0 && KeyPressed(KEY_LMB)) {
                this.fireCd = FIRE_CD;
				var range = this.flamethrower * FLAME_UP + FIRE_RANGE;
                var fire = new Fire(this.x - 30 * s + 20 * c + c * this.sprite.width / 2, this.y + 30 * c + 20 * s + s * this.sprite.width / 2, c * BULLET_SPEED, s * BULLET_SPEED, this.angle, FIRE_DAMAGE, range);
                this.bullets[this.bullets.length] = fire;
            }
            else if (this.fireCd > 0) {
                this.fireCd--;
            }
        }
		
		
		if ((this.burnoutCd <= 0 && this.ability == "Overdrive") && this.abilityActive == true)
		{
			var oppositeAngle = -this.angle;
			
			if ((KeyPressed(KEY_W) && !KeyPressed(KEY_A)) && !KeyPressed(KEY_D))
			{
				oppositeAngle = 0;
			}
			else if ((KeyPressed(KEY_D) && !KeyPressed(KEY_W)) && !KeyPressed(KEY_S))
			{
				oppositeAngle = HALF_PI;
			}
			else if ((KeyPressed(KEY_S) && !KeyPressed(KEY_D)) && !KeyPressed(KEY_A))
			{
				oppositeAngle = -HALF_PI;
			}
			else if ((KeyPressed(KEY_A) && !KeyPressed(KEY_S)) && !KeyPressed(KEY_W))
			{
				oppositeAngle = Math.Pi;	
			}
			else if (KeyPressed(KEY_W) && KeyPressed(KEY_D))
			{
				oppositeAngle = THREEQUARTERS_PI;	
			}
			else if (KeyPressed(KEY_D) && KeyPressed(KEY_S))
			{
				oppositeAngle = QUARTER_PI;	
			}
			else if (KeyPressed(KEY_S) && KeyPressed(KEY_A))
			{
				oppositeAngle = -QUARTER_PI;		
			}
			else if (KeyPressed(KEY_A) && KeyPressed(KEY_W))
			{
				oppositeAngle = -THREEQUARTERS_PI;	
			}
			
            this.burnoutCd = FIRE_CD;
			var range = 200;
            var fire = new Fire(this.x, this.y, 1, 1, oppositeAngle, FIRE_DAMAGE, range);
            this.bullets[this.bullets.length] = fire;
        }
        else if (this.burnoutCd > 0) 
		{
            this.burnoutCd--;
        }
		
		
		// Lasers
        if (this.bulletCd <= 0 && KeyPressed(KEY_LMB)) {
			this.bulletCd = 60 / (LASER_APS + this.laser * LASER_UP);
			var laser = NewLaser(this.x + c * (this.sprite.height / 2 + 25), this.y + s * (this.sprite.height / 2 + 25), c * BULLET_SPEED, s * BULLET_SPEED, this.angle, LASER_DAMAGE, LASER_RANGE);
			this.bullets[this.bullets.length] = laser;
			
			if (this.spread > 0) {                    
				SpreadLaserShots(this, laser, this.bullets);
			}
        }
        else if (this.bulletCd > 0) {
            this.bulletCd--;
        }
    }
    
    // Draws the player to the canvas
    this.Draw = Draw;
    function Draw(canvas) {
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
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - screen.scrollX, -screen.scrollY);
        
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].Draw(canvas);
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