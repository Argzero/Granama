/**
 * Represents the arcade mode game screen
 *
 * @constructor
 */
function GameScreen() {

    // Boss data
    var multiplier = (0.6 + 0.4 * players.length);
    this.bossStatus = ACTIVE_NONE;
    this.bossScore = Math.floor(50 * multiplier);
    this.bossIncrement = this.bossScore;
    this.bossScale = Math.floor(5 * multiplier) * 5;
    this.bossCount = 0;
	this.bossId = 0;
	this.superBossId = 0;
    this.boss = undefined;

    // Various data
    this.score = 0;
    this.spawnCd = 0;
    this.enemyCount = 0;
    this.timer = 0;
    this.gameOver = false;
    this.paused = undefined;
    this.maxEnemies = 30 * (0.85 + 0.15 * players.length);
    
    // Scroll data
    this.playerMinX = 0;
    this.playerMinY = 0;
    this.playerMaxX = 9999;
    this.playerMaxY = 9999;
    this.scrollX = 0;
    this.scrollY = 0;
    
    // Healing pads
    this.pads = [
        new HealingPad(GAME_WIDTH / 3, GAME_HEIGHT / 3),
        new HealingPad(GAME_WIDTH * 2 / 3, GAME_HEIGHT / 3),
        new HealingPad(GAME_WIDTH / 3, GAME_HEIGHT * 2 / 3),
        new HealingPad(GAME_WIDTH * 2 / 3, GAME_HEIGHT * 2 / 3)
    ];
    
    // Game objects
    this.particles = [];
    this.bullets = [];
    this.robots = players.slice(0);
    
    // Set the game dimensions
    GAME_WIDTH = 3000;
    GAME_HEIGHT = 3000;
}

/**
 * Updates the screen, updating all robots, turretes, bullets, etc.
 */
GameScreen.prototype.update = function() {

    // Update when not paused
    if (!this.paused) {
    
        // Update robots
        for (var i = 0; i < this.robots.length; i++)
        {
            this.robots[i].update();
            if (this.robots[i].expired) {
                if (this.robots[i].type == Robot.MOB) {
                    this.enemyCount--;
                }
                this.robots.splice(i, 1);
                i--;
            }
        }
    
        // Update bullets
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update();
            for (var j = 0; j < this.robots.length; j++) {
                var r = this.robots[j];
                if (this.bullets[i].isHitting(r)) {
                    this.bullets[i].hit(r);
                }
            }
            if (this.bullets[i].expired) {
                this.bullets.splice(i, 1);
                i--;
            }
        }
    
        // Update healing pads
        for (var i = 0; i < this.pads.length; i++) {
            this.pads[i].update();
        }
        
        // Particles
        for (var i = 0; i < this.particles.length; i++) {
            if (this.particles[i].update) {
                this.particles[i].update();
            }
        }

        // Update the scroll position
        this.applyScrolling();
        
        // Spawn enemies when not paused
        this.checkSpawns();
    }
    
    // Update paused players
    else {
        for (var i = 0; i < players.length; i++) {
            players[i].updatePause();
        }
    }
    
    // Check for losing
    for (var i = 0; i < players.length; i++) {
        if (players[i].health > 0) return;
    }
    if (!this.gameOver) {
        this.gameOver = true;

        for (var i = 0; i < players.length; i++) {
            var p = players[i];
            p.profile.setBest(p.name, STAT.BEST_SCORE, this.score);
            p.profile.addList(p.name, STAT.LAST_10, 10, this.score);
        }
    }
};

/**
 * Pauses the game for the given player
 *
 * @param {Player} player to pause the game for
 */
GameScreen.prototype.pause = function(player) {
    if (this.paused) {
        if (this.paused == player) {
            this.paused = undefined;
        }
    }
    else {
        this.paused = player;
    }
};

/**
 * Draws the game to the canvas
 */
GameScreen.prototype.draw = function() {

    camera.moveTo(SIDEBAR_WIDTH + this.scrollX, this.scrollY);
    ui.drawBackground();

    // Apply scroll offsets
    controls.setOffset(this.scrollX + SIDEBAR_WIDTH, this.scrollY);

    // Draw healing pads
    for (var i = 0; i < this.pads.length; i++) {
        this.pads[i].draw(camera);
    }

    // Aura draw
    for (var i = 0; i < players.length; i++) {
        var r = players[i];
        if (r.onAuraDraw) {
            r.onAuraDraw(camera);
        }
    }
    
    // Draw sprites
    for (var i = 0; i < this.robots.length; i++) {
        this.robots[i].draw(camera);
    }

    // Bullets
    for (var i = 0; i < this.bullets.length; i++) {
        this.bullets[i].draw(camera);
    }
    
    // Buffs
    //ui.drawBuffs();
    
    // Particles
    for (var i = 0; i < this.particles.length; i++) {
        this.particles[i].draw(camera);
        if (this.particles[i].expired) {
            this.particles.splice(i, 1);
            i--;
        }
    }
    
    ui.drawEnemyHealth();
    ui.drawPlayerHUDs();
    
    // Enemy indicators
    if (this.score >= this.bossScore - 10) {
        ui.drawEnemyIndicators();
    }

    // Reset scrolling for UI elements
    camera.moveTo(0, 0);

    // Pause overlay
    if (this.paused && this.paused !== true) {
        ui.drawPauseOverlay(this.paused);
    }

    ui.drawStatBar();

    // Draw the upgrade screen if applicable
    if (this.paused == true) {
        ui.drawUpgradeUI();
    }
    
    ui.drawCursor();
};

/**
 * Updates the scrolling offsets of the game
 */
GameScreen.prototype.applyScrolling = function() {

    // Get the average player position
    var minX = 9999;
    var minY = 9999;
    var maxX = 0;
    var maxY = 0;
    for (var i = 0; i < players.length; i++) {
        var r = players[i];
        if (r.health <= 0) continue;
        if (r.pos.x < minX) minX = r.pos.x;
        if (r.pos.x > maxX) maxX = r.pos.x;
        if (r.pos.y < minY) minY = r.pos.y;
        if (r.pos.y > maxY) maxY = r.pos.y;
    }
    if (minX != 9999) {
        var avgX = (maxX + minX) / 2;
        var avgY = (maxY + minY) / 2;

        // Scroll bounds
        this.scrollX = -clamp(avgX - WINDOW_WIDTH / 2, 0, GAME_WIDTH - WINDOW_WIDTH);
        this.scrollY = -clamp(avgY - WINDOW_HEIGHT / 2, 0, GAME_HEIGHT - WINDOW_HEIGHT);

        // player bounds
        this.playerMinX = Math.max(0, Math.min(avgX - WINDOW_WIDTH / 2, this.scrollX) + 100);
        this.playerMinY = Math.max(0, Math.min(avgY - WINDOW_HEIGHT / 2, this.scrollY) + 100);
        this.playerMaxX = Math.min(GAME_WIDTH, Math.max(avgX + WINDOW_WIDTH / 2, this.scrollX + WINDOW_WIDTH) - 100);
        this.playerMaxY = Math.min(GAME_HEIGHT, Math.max(avgY + WINDOW_HEIGHT / 2, this.scrollY + WINDOW_HEIGHT) - 100);
    }
};

GameScreen.prototype.startNextRound = function() {
    this.paused = false;
    this.bossScore += this.bossIncrement;
    this.bossIncrement += this.bossScale;
};

/**
 * Checks whether or not a new enemy should spawn
 */
GameScreen.prototype.checkSpawns = function() {

    // Transition to upgrade screen
    if (this.bossStatus == ACTIVE_BOSS) {
        if (this.boss.dead) {
            this.timer++;
            if (this.timer == 1) {
                for (var i = 0; i < this.robots.length; i++) {
                    var r = this.robots[i];
                    if (r.type && !(r.type & Robot.PLAYER)) {
                        r.dead = true;
                        r.expired = true;
                    }
                }
            }
            if (this.timer >= 600) {
                ui.setupUpgradeUI();
                this.bossStatus = ACTIVE_NONE;
            }
        }
        return;
    }

    var x, y;

    // Boss spawning
    if (this.bossStatus == ACTIVE_NONE && this.score == this.bossScore) {
        this.bossStatus = ACTIVE_BOSS;
        this.spawnBoss();
        this.bossCount++;
    }

    // Don't spawn enemies if there are too many or one has just spawned
    if (this.bossStatus == ACTIVE_NONE
        && this.spawnCd <= 0
        && this.enemyCount < this.maxEnemies
        && this.enemyCount + this.score < this.bossScore) {

        // Get a spawn point off of the gameScreen
        var pos = new Vector(0, 0);
        var visible;
        do {
            pos.x = rand(GAME_WIDTH - 200 + 100);
            pos.y = rand(GAME_HEIGHT - 200 + 100);
            visible = getClosestPlayer(pos).pos.distanceSq(pos) < sq(WINDOW_WIDTH / 2);
        }
        while (visible);

        // Spawn the enemy at the position
        this.spawnEnemy(SPAWN_DATA, pos.x, pos.y);

        // Apply the cooldown
        this.spawnCd = (SPAWN_RATE - SPAWN_SCALE * this.score) / (0.7 + players.length * 0.3);
    }
    
    // Deduct the timer if applicable
    else if (this.spawnCd > 0) {
        this.spawnCd--;
    }
};

/**
 * Spawns an enemy using the given spawn data at the location
 *
 * @param {Object} spawn data to use
 * @param {Number} horizontal coordainte to spawn at
 * @param {Number} vertical coordinate to spawn at
 */
GameScreen.prototype.spawnEnemy = function(data, x, y) {

    // Sum the weights
    var spawnWeight = 0;
    for (var i = 0; i < data.length; i += 3) {
        if (data[i + 1] <= this.bossCount) {
            spawnWeight += data[i];
        }
    }
    
    // Choose a random one and spawn it
    var r = rand(spawnWeight);
    var total = 0;
    var enemy;
    for (var i = 0; i < data.length; i += 3) {
        if (data[i + 1] <= this.bossCount) {
            total += data[i];
        }
        if (total > r) {
            enemy = new data[i + 2](x, y);
            break;
        }
    }
    
    // This shouldn't happen, but just in case
    // a list is empty, prevent an error happening
    if (!enemy) {
        return;
    }

    // Spawn the enemy
    this.robots.unshift(enemy);
    this.enemyCount++;
    
    return enemy;
};

/**
 * Spawns a new boss
 */
GameScreen.prototype.spawnBoss = function() {

    // Get the position
    if (gameScreen.scrollX + WINDOW_WIDTH / 2 < GAME_WIDTH / 2) {
        x = GAME_WIDTH - 500;
    }
    else {
        x = 500;
    }
    if (gameScreen.scrollY + WINDOW_HEIGHT / 2 < GAME_HEIGHT / 2) {
        y = GAME_HEIGHT - 500;
    }
    else {
        y = 500;
    }

    // Spawn the boss
	if (this.bossId < 5) {
		this.boss = new BOSS_SPAWNS[this.bossId % BOSS_SPAWNS.length](x, y);
		this.bossId++;
	}
	else {
		if (this.superBossId == 0) {
			this.boss = new DragonBoss(x, y);
		}
		else {
			this.boss = new HydraBoss(x, y);
		}
		this.superBossId++;
		this.shuffleBosses();
	}
    
    this.robots.push(this.boss);
};

/** 
 * Shuffles the order of boss spawns around
 */
GameScreen.prototype.shuffleBosses = function() {
	var list = [];
	while (BOSS_SPAWNS.length > 0)
	{
		var id = rand(BOSS_SPAWNS.length);
		list.push(BOSS_SPAWNS[id]);
		BOSS_SPAWNS.splice(id, 1);
	}
	BOSS_SPAWNS = list;
	this.bossId = 0;
};

/**
 * Gets the robot closest to the given position falling
 * under the given type
 *
 * @param {Vector} pos  - the position to get the nearest robot to
 * @param {Number} type - the robot group ID to look for
 *
 * @returns {Robot} the closest robot to the point
 */
GameScreen.prototype.getClosest = function(pos, type) {
    var closest;
    var dSq;
    for (var i = 0; i < this.robots.length; i++) {
        var r = this.robots[i];
        if ((r.type & type) && !r.dead) {
            var d = r.pos.distanceSq(pos);
            if (!dSq || d < dSq) {
                dSq = d;
                closest = r;
            }
        }
    }
    return closest;
}