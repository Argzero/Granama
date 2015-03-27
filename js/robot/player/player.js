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
 *
 * @constructor
 */
extend('Player', 'Robot');
function Player(name, x, y, type, health, speed, healthScale, damageScale, shieldScale, speedScale) {
    this.super(name, x, y, type, health, speed);
    
    /**
     * Event called when the player levels up
     */
    this.onLevel = this.onLevel || undefined;
    
    this.pos.x = this.targetPos.x = GAME_WIDTH / 2;
    this.pos.y = this.targetPos.y = GAME_HEIGHT / 2;
    
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
    this.damageScale   = (damageScale || 1) / 10; 
    this.shieldScale   = shieldScale || 1;
    this.speedScale    = (speedScale || 1) / 15;
    this.upgrades      = [0, 0, 0, 0, 0];
    this.revBase       = 1 / 300;
    this.revSpeed      = this.revBase;
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
    this.lastHelath    = 0;
    this.killTypes     = {};
    this.input         = undefined;
    var submitted      = false;
}

/**
 * Gives the player experience and checks for leveling up
 *
 * @param {Number} amount - amount of experience to give
 */ 
Player.prototype.giveExp = function(amount) {

    if (!(this.input instanceof NetworkInput)) {
        connection.giveExp(this.playerIndex, amount);
    }

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
        this.power += this.damageScale * this.level;
        this.levelFrame = 0;

        // Level up event
        if (this.onLevel) {
            this.onLevel();
        }
    }
};

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
    
    // Damage detection
    var now = this.health + this.shield;
    if (now < this.lastHealth) {
        this.damageAlpha = 0.3;
    }
    else {
        this.damageAlpha = Math.max(0, this.damageAlpha - 0.02);
    }
    this.lastHealth = now;
    
    this.alpha = 1;
    
    this.updatePause();
    this.updateRobot();
    
    // Shield regeneration
    if (!(this.input instanceof NetworkInput)) {
        this.shieldCd -= this.get('shieldBuff');
        if (this.shieldCd <= 0) {
            this.shieldCd += 60 / (this.shieldScale * (this.upgrades[SHIELD_ID] + 1) * 1 / 10);
            this.shield += this.maxHealth * SHIELD_GAIN;
            if (this.shield > this.maxHealth * SHIELD_MAX) {
                this.shield = this.maxHealth * SHIELD_MAX;
            }
        }
    }
    
    // Player's ability
    if (this.skillDuration > 0) {
        this.skillDuration--;
    }
    else if (this.skillCd > 0 && this.skillDuration === 0) {
        this.skillCd--;
    }

    // Updates when not stunned
    if (!this.isStunned()) {

        // Get speed
        var speed = this.get('speed') * (1 + this.speedScale * this.upgrades[SPEED_ID]);
        if (speed > 0.000001) {
            
            // Move to the target position
            if (this.input instanceof NetworkInput) {
                this.pos = this.targetPos;
            }

            // Movement
            var moveDir = this.input.direction(MOVE, this);
            var lookDir = this.input.direction(LOOK, this);
            if (lookDir.lengthSq() > 0)
            {
                lookDir.rotate(0, -1);
                this.setRotation(lookDir.x, lookDir.y);
            }
            this.move(speed * moveDir.x, speed * moveDir.y);
            
            // Send movement update
            if (!(this.input instanceof NetworkInput)) {
                connection.updatePlayer(this.playerIndex);
            }
        }
        
        // Robot specific updates
        if (this.applyUpdate) {
            this.applyUpdate();
        }
    }
    
    // Clamping to the game region
    if (!this.ignoreClamp) {
        this.pos.x = Math.max(Math.min(this.pos.x, GAME_WIDTH - this.width / 2), this.width / 2);
        this.pos.y = Math.max(Math.min(this.pos.y, GAME_HEIGHT - this.height / 2), this.height / 2);
    }
};

/**
 * Applies updates to the player while dead
 */
Player.prototype.updateDead = function() {

    this.damageAlpha = Math.max(0, this.damageAlpha - 0.02);

    var i, p;
    var inRange = false;

    // See if a player is in range to rescue the player
    if (connection.isHost) {
        for (i = 0; i < players.length; i++) {
            p = players[i];
            if (p.dead) continue;
            if (this.pos.distanceSq(p.pos) < 10000) {
                inRange = true;
            }
        }
    }

    // Apply rescue effects
    if (inRange) {
        this.rescue -= this.revSpeed;
        if (this.rescue <= 0) {
            this.health = this.maxHealth * 0.5;
            this.dead = false;
            this.rescue = 1;
   
            for (i = 0; i < players.length; i++) {
                p = players[i];
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
    else if (!this.input.invalid && this.input.button(PAUSE) == 1) {
        gameScreen.pause(this);
    }
};

/**
 * Checks the player's input to see if they are using their skill
 */
Player.prototype.isSkillCast = function() {
    if (this.skillCd > 0 || this.skillDuration > 0) return false;
    return this.input.button(SKILL) == 1;
};

/**
 * Checks the player's input to see if they are shooting their main weapons
 */
Player.prototype.isInRange = function() {
    return this.input.button(SHOOT);
};

/**
 * Credits the robot with a kill
 *
 * @param {Robot} victim - the killed robot
 */
Player.prototype.giveKill = function(victim) {
    this.kills++;
    if (!this.killTypes[victim.type]) this.killTypes[victim.type] = 0;
    this.killTypes[victim.type]++;
};

/**
 * Submits the profile stats for the player
 */
Player.prototype.submitStats = function() {
    if (this.submitted) return false;
    this.submitted = true;
    
    this.profile.addStat(this.name, STAT.TOTAL_KILLS, this.kills);
    this.profile.addStat(this.name, STAT.TOTAL_DEATHS, this.deaths);
    this.profile.addStat(this.name, STAT.TOTAL_RESCUES, this.rescues);
    this.profile.addStat(this.name, STAT.TOTAL_DEALT, this.damageDealt);
    this.profile.addStat(this.name, STAT.TOTAL_TAKEN, this.damageTaken);
    this.profile.addStat(this.name, STAT.TOTAL_ABSORBED, this.damageAbsorbed);
    this.profile.addStat(this.name, STAT.TOTAL_EXP, this.totalExp);
    this.profile.addStat(this.name, STAT.LIGHT, this.killTypes[Robot.LIGHT_ENEMY]);
    this.profile.addStat(this.name, STAT.HEAVY, this.killTypes[Robot.HEAVY_ENEMY]);
    this.profile.addStat(this.name, STAT.MINIBOSS, this.killTypes[Robot.MINIBOSS_ENEMY]);
    this.profile.addStat(this.name, STAT.BOSS, this.killTypes[Robot.BOSS_ENEMY]);
    this.profile.addStat(this.name, STAT.DRAGON, this.killTypes[Robot.DRAGON_ENEMY]);
    this.profile.addStat(this.name, STAT.HYDRA, this.killTypes[Robot.HYDRA_ENEMY]);
    this.profile.addStat(this.name, STAT.GAMES, 1);
    
    this.profile.setBest(this.name, STAT.MOST_KILLS, this.kills);
    this.profile.setBest(this.name, STAT.MOST_DEATHS, this.deaths);
    this.profile.setBest(this.name, STAT.MOST_RESCUES, this.rescues);
    this.profile.setBest(this.name, STAT.MOST_DEALT, this.damageDealt);
    this.profile.setBest(this.name, STAT.MOST_TAKEN, this.damageTaken);
    this.profile.setBest(this.name, STAT.MOST_ABSORBED, this.damageAbsorbed);
    this.profile.setBest(this.name, STAT.BEST_SCORE, gameScreen.score);
    this.profile.setBest(this.name, STAT.HIGHEST_LEVEL, this.level);
    
    this.profile.addList(this.name, STAT.LAST_10, 10, gameScreen.score);
};
