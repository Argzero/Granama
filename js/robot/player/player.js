depend('robot/robot');

/**
 * Base constructor for player types
 *
 * @param {string} name          - name of the robot's body sprite
 * @param {Number} x             - starting X-coordinate
 * @param {Number} y             - starting Y-coordinate
 * @param {number} type          - type ID of the robot (should be Robot.PLAYER)
 * @param {Number} health        - starting health
 * @param {Number} speed         - starting speed
 * @param {Number} [healthScale] - multiplier for health gain
 * @param {Number} [damageScale] - multiplier for damage gain
 * @param {Number} [shieldScale] - multiplier for shield recharge rate
 * @param {Number} [speedScale]  - multiplier for speed bonuses
 */
extend('Player', 'Robot');
function Player(name, x, y, type, health, speed, healthScale, damageScale, shieldScale, speedScale) {
	this.super(name, x, y, type, health, speed);
	  
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
	
	////////////
	// Fields //
	////////////
	
	this.skillCd       = 0;
	this.skillDuration = 0;
	this.exp           = 0;
	this.totalExp      = 0;
	this.level         = 1;
	this.points        = 0;
    this.maxShield     = health * SHIELD_MAX;
    this.shield        = this.maxShield;
	this.shieldCd      = SHIELD_RATE;
	this.healthScale   = healthScale || 10;
	this.damageScale   = damageScale || 0.1;
	this.shieldScale   = shieldScale || 1;
	this.speedScale    = speedScale || 1;
	this.upgrades      = [0, 0, 0, 0, 0];
	this.power         = 1;
	this.mPower        = 1;
	this.mSpeed        = 1;
	this.mHealth       = 1;
	this.rescue        = 1;
	this.deaths        = 0;
	this.rescues       = 0;
	this.enemiesKilled = 0;
	this.damageAlpha   = 0;
	this.levelFrame    = -1;
	this.input         = undefined;
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
}

/**
 * Updates the player with shared functionality
 * between players each frame. This should be called
 * in the implemented players "update" method.
 */
Player.prototype.update = function() {
    if (this.dead) {
        this.updateDead();
        this.alpha = 0.5;
        return;
    }
    
    this.alpha = 1;
    
	this.updateRobot();
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
        if (speed < 0.001) return;

		// Movement
		var moveDir = this.input.direction(MOVE, this);
		var lookDir = this.input.direction(LOOK, this);
		if (lookDir.lengthSq() > 0)
		{
			lookDir.rotate(0, -1);
			this.setRotation(lookDir.x, lookDir.y);
		}
		this.move(speed * moveDir.x, speed * moveDir.y);
        
        // Robot specific updates
        if (this.applyUpdate) {
            this.applyUpdate();
        }
	}
};

/**
 * Applies updates to the player while dead
 */
Player.prototype.updateDead = function() {

	// See if a player is in range to rescue the player
	var inRange = false;
	for (var i = 0; i < players.length; i++) {
		var p = players[i];
		if (p.dead) continue;
		if (this.pos.distanceSq(p.pos) < 10000) {
			inRange = true;
		}
	}

	// Apply rescue effects
	if (inRange) {
		this.rescue -= 1 / 300;
		if (this.rescue <= 0) {
			this.health = this.maxHealth * 0.5;
			this.rescue = 1;

			for (var i = 0; i < players.length; i++) {
				var p = players[i];
				if (p.dead) continue;
				if (this.pos.distanceSq(p.pos) < 10000) {
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

/**
 * Applies updates to the player that 
 */
Player.prototype.updatePause = function() {

    this.input.update();

	// Pause when controls are invalid
	if (this.input.invalid && !gameScreen.paused) {
		gameScreen.pause(this);
	}

	// Pausing
	else if (!this.input.invalid && this.input.pause == 1) {
		gameScreen.pause(this);
	}
};

// Checks whether or not a skill is being cast
Player.prototype.isSkillCast = function() {
	if (this.skillCd > 0 || this.skillDuration > 0) return false;
	return this.input.ability == 1;
};

// Function for telling weapons when they can fire
Player.prototype.isInRange = function() {
	return this.input.button(SHOOT);
};
