function BasePlayer(sprite, drops) {
	return {
	
		// Events
		onDamaged: undefined,
		onUpdate: undefined,
		onDraw: undefined,
        onFire: undefined,
	
		// Fields
		x: GAME_WIDTH / 2,
		y: GAME_HEIGHT / 2,
		drops: drops,
        skillCd: 0,
        skillDuration: 0,
		angle: 0,
		shield: 0,
		shieldCd: SHIELD_RATE,
		cos: 0,
		sin: 1,
		sprite: sprite,
		speed: PLAYER_SPEED,
		health: PLAYER_HEALTH,
		maxHealth: PLAYER_HEALTH,
		bullets: [],
        drawObjects: [{ sprite: sprite, xOffset: -sprite.width / 2, yOffset: -sprite.height / 2 }],
		upgrades: [0, 0, 0, 0, 0, 0, 0, 0],
        mPower: 1,
        mSpeed: 1,
        mHealth: 1,
        
		// Damages the player using an optional damage source
		Damage: function(amount, damager) {
			
			// Damage event
			if (this.onDamaged) {
				amount = this.onDamaged(amount, damager);
			}
			
			// Deduct shield damage
			if (this.shield > 0) {
				if (this.shield > amount) {
					this.shield -= amount;
					amount = 0;
				}
				else {
					amount -= this.shield;
					this.shield = 0;
				}
			}
			
			// Health damage
			if (amount) {
				this.health -= amount;
			}
		},
        
        // Updates the player's max health
        UpdateHealth: function() {
            var maxBonus = PLAYER_HEALTH + this.upgrades[HEALTH_ID] * HEALTH_UP - this.maxHealth;
            this.maxHealth += maxBonus;
            this.health += maxBonus;
        },
        
        // Retrieves the damage multiplier for the player
        GetDamageMultiplier: function() {
            return 1 + this.upgrades[DAMAGE_ID] * DAMAGE_UP;
        },
		
		// Updates the player
		UpdateBase: function() {
        
            this.UpdateHealth();
        
			// Shield regeneration
			if (this.upgrades[SHIELD_ID] > 0) {
				this.shieldCd--;
				if (this.shieldCd <= 0) {
					this.shieldCd += SHIELD_RATE - this.upgrades[SHIELD_ID] * SHIELD_SCALE;
					this.shield += this.maxHealth * SHIELD_GAIN;
					if (this.shield > this.maxHealth * SHIELD_MAX) {
						this.shield = this.maxHealth * SHIELD_MAX;
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
				if (this.bullets[i].expired) {
					this.bullets.splice(i, 1);
					i--;
				}
			}
			
			// Update event
			var speed = this.speed;
			if (this.onMove) {
				var result = this.onMove(speed);
				if (result !== undefined) {
                    speed = result;
                }
                if (!speed) {
                    return;
                }
			}
			
			//Player's ability
            if (this.skillDuration > 0) {
                this.skillDuration--;
            }
			else if (this.skillCd > 0 && this.skillDuration == 0)
			{
				this.skillCd--;
			}
			
			// Update the player's angle
			var a = Math.atan((mouseY - this.y) / (this.x - mouseX));
			if (this.x < mouseX) {
				this.angle = -HALF_PI - a;
			}
			else {
				this.angle = HALF_PI - a;
			}
			this.cos = -Math.sin(this.angle);
			this.sin = Math.cos(this.angle);
			
			// Movement
			var hor = KeyPressed(KEY_D) != KeyPressed(KEY_A);
			var vert = KeyPressed(KEY_W) != KeyPressed(KEY_S);
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
			
			// Bounding
			if (XMin(this) < 0) {
				this.x += -XMin(this);
			}
			if (XMax(this) > GAME_WIDTH) {
				this.x -= XMax(this) - GAME_WIDTH;
			}
			if (YMin(this) < 0) {
				this.y += -YMin(this);
			}
			if (YMax(this) > GAME_HEIGHT) {
				this.y -= YMax(this) - GAME_HEIGHT;
			}
		},
		
		// Draws the player and its bullets
		Draw: function(canvas) {
        
            // Transform the canvas to match the player orientation
            canvas.translate(this.x, this.y);
            canvas.transform(this.sin, -this.cos, this.cos, this.sin, 0, 0);
        
            // Draw various parts of the player
            var i;
            for (i = 0; i < this.drawObjects.length; i++) {
                var obj = this.drawObjects[i];
                if (!obj.condition || obj.condition()) {
                    canvas.drawImage(obj.sprite, obj.xOffset, obj.yOffset);
                }
            }
		
            // Restore the transform
            ResetTransform(canvas);
        
			// Draw bullets
			for (i = 0; i < this.bullets.length; i++) {
				this.bullets[i].Draw(canvas);
			}
			
			// Draw event
			if (this.onDraw) {
				this.onDraw();
			}
		},
        
        // Checks whether or not a skill is being cast
        IsSkillCast: function() {
            return KeyPressed(KEY_SPACE) && this.skillCd <= 0 && this.skillDuration == 0;
        },
        
        // Function for telling weapons when they can fire
        IsInRange: function() {
            return KeyPressed(KEY_LMB);
        }
	}
}