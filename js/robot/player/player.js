/**
 * Base constructor for player types
 *
 * @param {string} name          - name of the robot's body sprite
 * @param {Number} x             - starting X-coordinate
 * @param {Number} y             - starting Y-coordinate
 * @param {Number} health        - starting health
 * @param {Number} speed         - starting speed
 * @param {Number} [healthScale] - multiplier for health gain
 * @param {Number} [damageScale] - multiplier for damage gain
 * @param {Number} [shieldScale] - multiplier for shield recharge rate
 * @param {Number} [speedScale]  - multiplier for speed bonuses
 */
function Player(name, x, y, health, speed, healthScale, damageScale, shieldScale, speedScale) {
	this.super(name, x, y, health, speed);
	  
	////////////
	// Events //
	////////////
	
	this.onDraw = undefined;
	this.onPreDraw = undefined;
	this.onFire = undefined;
	
	/**
	 * Called when the player levels up
	 */
	this.onLevel = undefined;
	
	/**
	 * Called when the player is about to move
	 *
	 * @param {Number} speed - speed of the player
	 * 
	 * @returns {Number} speed - modified speed of the player
	 */
	this.onMove = undefined;

	////////////
	// Fields //
	////////////
	
	skillCd       = 0;
	skillDuration = 0;
	exp           = 0;
	totalExp      = 0;
	level         = 1;
	points        = 0;
	sprite        = sprite;
	shieldCd      = SHIELD_RATE;
	healthScale   = healthScale || 1;
	damageScale   = damageScale || 0.1;
	shieldScale   = shieldScale || 1;
	speedScale    = speedScale || 1;
	upgrades      = [0, 0, 0, 0, 0];
	damage        = 1;
	mPower        = 1;
	mSpeed        = 1;
	mHealth       = 1;
	rescue        = 1;
	deaths        = 0;
	rescues       = 0;
	enemiesKilled = 0;
	damageAlpha   = 0;
	levelFrame    = -1;
	input         = undefined;
}

/**
 * Gives the player experience and checks for leveling up
 *
 * @param {Number} amount - amount of experience to give
 */ 
Player.prototype.giveExp = function(amount) {

	this.exp += amount;
	this.totalExp += amount;

	// Level up as many times as needed
	while (this.exp >= this.level * 200) {
	
		// Point rewards
		if (this.level <= 25) {
			this.points += 2;
		}

		// Apply the level
		this.exp -= this.level * 200;
		this.level++;
		
		// Stat increases
		this.maxHealth += this.healthScale * this.level;
		this.health += this.healthScale * this.level;
		this.damage += this.damageScale * this.level;
		this.levelFrame = 0;

		// Level up event
		if (this.onLevel) {
			this.onLevel();
		}
	}
};

// Updates the player
Player.prototype.updateBase = function() {
	this.updatePause();

	// Shield regeneration
	this.shieldCd -= this.get('shieldBuff');
	if (this.shieldCd <= 0) {
		this.shieldCd += 60 / (this.shieldScale * (this.upgrades[SHIELD_ID] + 1) * 1 / 10);
		this.shield += this.maxHealth * SHIELD_GAIN;
		if (this.shield > this.maxHealth * SHIELD_MAX) {
			this.shield = this.maxHealth * SHIELD_MAX;
		}
	}
	
	// Player's ability
	if (this.skillDuration > 0) {
		this.skillDuration--;
	}
	else if (this.skillCd > 0 && this.skillDuration == 0) {
		this.skillCd--;
	}

	// Updates when not stunned
	if (!this.isStunned()) {

		// Get speed
		var speed = this.get('speed') + this.speedScale * this.upgrades[SPEED_ID] * 0.2;
		
		// Move event
		if (this.onMove) {
			var result = this.onMove(speed);
			if (result !== undefined) {
				speed = result;
			}
			if (!speed) {
				return true;
			}
		}

		// Movement
		this.setRotation(this.input.direction.x, this.input.direction.y);
		this.move(speed * this.input.movement.x, speed * this.input.movement.y);
	}
};

// Updates the player while dead
Player.prototype.updateDead = function() {

	// Update bullets of the player
	this.updateBullets();

	// See if a player is in range to rescue the player
	var inRange = false;
	for (var i = 0; i < playerManager.players.length; i++) {
		var p = playerManager.players[i].robot;
		if (p.health <= 0) continue;
		if (this.distanceSq(p) < 10000) {
			inRange = true;
		}
	}

	// Apply rescue effects
	if (inRange) {
		this.rescue -= 1 / 300;
		if (this.rescue <= 0) {
			this.health = this.maxHealth * 0.5;
			this.rescue = 1;

			for (var i = 0; i < playerManager.players.length; i++) {
				var p = playerManager.players[i].robot;
				if (p.health <= 0) continue;
				if (this.distanceSq(p) < 10000) {
					p.rescues++;
				}
			}
		}
	}
	else if (this.rescue < 1) {
		this.rescue = Math.min(1, this.rescue + 1 / 300);
	}

	this.updatePause();
};

Player.prototype.updatePause = function() {

	// Input update
	this.input.setPlayer(this);

	// Pause when controls are invalid
	if (this.input.invalid && !gameScreen.paused) {
		gameScreen.Pause(this);
	}

	// Pausing
	else if (!this.input.invalid && this.input.pause == 1) {
		gameScreen.Pause(this);
	}
};

// Draws the player and its bullets
Player.prototype.draw = function(canvas) {

	// Draw level up effect
	if (this.levelFrame >= 0) {
		var circleFrame = this.levelFrame % 15;
		canvas.globalAlpha = 1 - 0.06 * circleFrame;
		canvas.fillStyle = '#6ff';
		canvas.beginPath();
		canvas.arc(this.x, this.y, circleFrame * 5, 0, Math.PI * 2);
		canvas.fill();

		var img = GetImage('LevelUpWords');
		canvas.translate(this.x, this.y);
		angle = 0;
		if (this.levelFrame < 30) angle = Math.PI * ((30 - this.levelFrame) / 30);
		canvas.rotate(angle);
		canvas.globalAlpha = 1;
		if (this.levelFrame > 150) canvas.globalAlpha = 1 - (this.levelFrame - 150) / 60;
		canvas.drawImage(img, -img.width / 2, -120);
		canvas.globalAlpha = 1;
		ResetTransform(canvas);

		this.levelFrame++;
		if (this.levelFrame >= 210) {
			this.levelFrame = -1;
		}
	}

	// Semi-transparent when dead
	if (this.health <= 0) {
		canvas.globalAlpha = 0.5;
	}

	// Draw event
	else if (this.onPreDraw) {
		this.onPreDraw();
	}

	// Transform the canvas to match the player orientation
	canvas.translate(this.x, this.y);

	// Damage effect
	if (this.damageAlpha > 0) {
		canvas.globalAlpha = this.damageAlpha;
		canvas.drawImage(GetImage('damage'), -75, -75, 150, 150);
		canvas.globalAlpha = 1;
		this.damageAlpha -= DAMAGE_ALPHA_DECAY;
	}

	canvas.transform(this.sin, -this.cos, this.cos, this.sin, 0, 0);

	// Draw various parts of the player
	this.drawParts();

	// Restore the transform
	ResetTransform(canvas);

	// Draw event
	if (this.onDraw) {
		this.onDraw();
	}

	// Reset alpha in case dead
	canvas.globalAlpha = 1;

	// Draw bullets
	var i;
	for (i = 0; i < this.bullets.length; i++) {
		this.bullets[i].Draw(canvas);
	}

	// Draw HUD if alive
	if (this.health > 0) {

		// Health bar
		canvas.lineWidth = 3;
		var healthPercent = this.health / this.maxHealth;
		var shieldPercent = this.shield / (this.maxHealth * SHIELD_MAX);
		canvas.beginPath();
		canvas.arc(this.x, this.y, 75, ((1 - healthPercent) * Math.PI * 8 / 10) - Math.PI * 9 / 10, -Math.PI / 10, false);
		if (healthPercent > 0.66) canvas.strokeStyle = '#0f0';
		else if (healthPercent > 0.33) canvas.strokeStyle = '#ff0';
		else canvas.strokeStyle = '#f00';
		canvas.stroke();
		canvas.beginPath();
		canvas.arc(this.x, this.y, 75, Math.PI / 10, Math.PI / 10 + shieldPercent * Math.PI * 8 / 10);
		canvas.strokeStyle = '#00f';
		canvas.stroke();
		canvas.drawImage(GetImage('healthBarSymbol'), this.x + 50, this.y - 20);

		// Draw skill icon
		if (this.ability) {
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
		}
	}

	// Otherwise draw rescue circle
	else {
		canvas.strokeStyle = 'white';
		canvas.lineWidth = 3;
		canvas.beginPath();
		canvas.arc(this.x, this.y, 100, 0, Math.PI * 2 * this.rescue);
		canvas.stroke();
	}

	ResetTransform(canvas);
};

// Checks whether or not a skill is being cast
Player.prototype.isSkillCast = function() {
	if (this.skillCd > 0 || this.skillDuration > 0) return false;
	return this.input.ability == 1;
};

// Function for telling weapons when they can fire
Player.prototype.isInRange = function() {
	return this.input.shoot;
};
