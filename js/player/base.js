function BasePlayer(sprite, drops, gamepadIndex) {
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
        cdm: 1,
        rm: 1,
		input: undefined,
        
		// Damages the player using an optional damage source
		Damage: function(amount, damager) {
			
			// Damage event
			if (this.onDamaged) {
				var result = this.onDamaged(amount, damager);
				if (result !== undefined) {
					amount = result;
				}
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
        
			this.UpdatePause();
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
            
            //Player's ability
            if (this.skillDuration > 0) {
                this.skillDuration--;
            }
			else if (this.skillCd > 0 && this.skillDuration == 0)
			{
				this.skillCd--;
			}
			
			// Update event
			var speed = this.speed + this.upgrades[SPEED_ID] * SPEED_UP;
			if (this.onMove) {
				var result = this.onMove(speed);
				if (result !== undefined) {
                    speed = result;
                }
                if (!speed) {
                    return true;
                }
			}
			
			// Update the player's angle
			this.cos = this.input.direction.x;
			this.sin = this.input.direction.y;
            this.angle = Math.acos(this.sin);
            if (this.cos > 0) this.angle = -this.angle;
			
			// Movement
            this.x += speed * this.input.movement.x;
            this.y += speed * this.input.movement.y;
			
			// Bounding
			this.x = clamp(this.x, gameScreen.playerMinX + this.sprite.width / 2, gameScreen.playerMaxX - this.sprite.width / 2);
            this.y = clamp(this.y, gameScreen.playerMinY + this.sprite.height / 2, gameScreen.playerMaxY - this.sprite.height / 2);
		},
		
		UpdatePause: function() {
		
            // Input update
            this.input.setPlayer(this);
            this.input.update();
		
			// Pausing
            if (this.input.pause) {
                this.input.locked = true;
                gameScreen.Pause(this);
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
            
            // Draw health bar
            canvas.lineWidth = 3;
            var healthPercent = this.health / this.maxHealth;
            var shieldPercent = this.shield / (this.maxHealth * SHIELD_MAX);
            canvas.beginPath();
            canvas.arc(this.x, this.y, 75, Math.PI * 2, (2 - healthPercent * 9 / 10) * Math.PI, true);
            if (healthPercent > 0.66) canvas.strokeStyle = '#0f0';
            else if (healthPercent > 0.33) canvas.strokeStyle = '#ff0';
            else canvas.strokeStyle = '#f00';
            canvas.stroke();
            canvas.beginPath();
            canvas.arc(this.x, this.y, 75, 0, shieldPercent * Math.PI * 9 / 10);
            canvas.strokeStyle = '#f0f';
            canvas.stroke();
            
            // Draw skill icon
            if (this.skillCd > 0) {
                canvas.globalAlpha = 0.5;
            }
            canvas.drawImage(GetImage('ability' + this.ability), this.x - 95, this.y - 20, 40, 40);
            canvas.globalAlpha = 1;
            
            // Skill cooldown/duration
            var num;
            if (this.skillDuration > 0) {
                num = this.skillDuration / 60;
                canvas.fillStyle = '#0f0';
            }
            else {
                num = this.skillCd / 60;
                canvas.fillStyle = '#fff';
            }
            if (num > 0) {
                canvas.font = '24px Flipbash';
                if (num < 10) {
                    num = num.toFixed(1);
                }
                else num = num.toFixed(0);
                canvas.fillText(num, this.x - 75 - StringWidth(num) / 2, this.y + 10);
            }
            
            ResetTransform(canvas);
		},
        
        // Checks whether or not a skill is being cast
        IsSkillCast: function() {
			if (this.skillCd > 0 || this.skillDuration > 0) return false;
			return this.input.ability;
        },
        
        // Function for telling weapons when they can fire
        IsInRange: function() {
			return this.input.shoot;
        }
	}
}