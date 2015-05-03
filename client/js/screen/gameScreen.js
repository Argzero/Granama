/**
 * Represents the arcade mode game screen
 *
 * @constructor
 */
function GameScreen() {

    // Boss data
    var multiplier = (0.6 + 0.4 * players.length);
    this.bossStatus = ACTIVE_NONE;
    this.bossScore = Math.floor(10 * multiplier) * 5;
    this.bossIncrement = this.bossScore;
    this.bossScale = 25;
    this.bossCount = 0;
    this.bossTimer = 0;
	this.bossId = 0;
	this.superBossId = 0;
    this.boss = undefined;
    
    // Various data
    this.score = 0;
    this.spawnCd = 0;
    this.enemyCount = 0;
    this.spawnId = 1;
    this.timer = 0;
    this.gameOver = false;
    this.paused = undefined;
    this.maxEnemies = 30 * (0.85 + 0.15 * players.length);
    this.isPlaying = true;
    this.julian = false;
    this.eUpdateInterval = 60;
    this.eUpdateTimer = this.eUpdateInterval;
    this.cursor = false;
    
    // Set the game dimensions
    GAME_WIDTH = 3000;
    GAME_HEIGHT = 3000;
    
    // Scroll data
    this.playerMinX = 0;
    this.playerMinY = 0;
    this.playerMaxX = 9999;
    this.playerMaxY = 9999;
    this.scrollX = (WINDOW_WIDTH - GAME_WIDTH) * 0.5;
    this.scrollY = (WINDOW_HEIGHT - GAME_HEIGHT) * 0.5;
    this.targetX = 0;
    this.targetY = 0;
    
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
    this.exp = [];
    this.robots = players.slice(0);
    
    this.shuffleBosses();
    
    // Check to see if any player is using the cursor as part of their input
    for (var i = 0; i < players.length; i++) {
        if (players[i].input instanceof KeyboardInput) {
            this.cursor = true;
        }
    }
}

/**
 * Updates the screen, updating all robots, turretes, bullets, etc.
 */
GameScreen.prototype.update = function() {

    // Update when not paused
    var i, j, r;
    if (!this.paused) {
    
        // Update robots
        for (i = 0; i < this.robots.length; i++)
        {
            // During boss preview, only dragon/hydra can move
            if (this.bossTimer > 0 && this.robots[i].title != 'Dragon' && this.robots[i].title != 'Hydra' && this.robots[i].title != 'Royal Hydra') {
                continue;
            }
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
        for (i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update();
            if (connection.isHost)
            {
                for (j = 0; j < this.robots.length; j++) {
                    r = this.robots[j];
                    if (this.bullets[i].isHitting(r)) {
                        this.bullets[i].hit(r);
                    }
                }
            }
            if (this.bullets[i].expired) {
                this.bullets.splice(i, 1);
                i--;
            }
        }
        
        // Update exp
        for (i = 0; i < this.exp.length; i++) {
            this.exp[i].update();
            for (j = 0; j < players.length; j++) {
                r = players[j];
                if (this.exp[i].isHitting(r)) {
                    this.exp[i].hit(r);
                }
            }
            if (this.exp[i].expired) {
                this.exp.splice(i, 1);
                i--;
            }
        }
    
        // Update healing pads
        if (connection.isHost)
        {
            for (i = 0; i < this.pads.length; i++) {
                this.pads[i].update();
            }
        }
        
        // Particles
        for (i = 0; i < this.particles.length; i++) {
            if (this.particles[i].update) {
                this.particles[i].update();
            }
        }

        // Update the scroll position
        this.applyScrolling();
        
        // Spawn enemies when not paused
        if (connection.isHost) this.checkSpawns();
        this.checkUpgradeTransition();
    }
    
    // Update paused players
    else {
        for (i = 0; i < players.length; i++) {
            players[i].updatePause();
        }
    }
    
    // End the game
    if (this.gameOver) {
        this.gameOver--;
        if (this.gameOver <= 0) {
            gameScreen = new EndScreen();
            connection.inRoom = false;
            return;
        }
    }
    
    // Host actions post-update
    if (connection.isHost) {
        
        // Update enemy data
        this.eUpdateTimer--;
        if (this.eUpdateTimer <= 0) {
            var data = {};
            var shouldSend = false;
            for (i = 0; i < this.robots.length; i++) {
                r = this.robots[i];
                if (r.type != Robot.PLAYER) {
                    data[r.id] = { pos: r.pos, rot: r.rotation };
                    shouldSend = true;
                }
            }
            if (shouldSend) {
                connection.updateRobots(data);
            }
            this.eUpdateTimer = this.eUpdateInterval;
        }
        
        // Check for losing
        for (i = 0; i < players.length; i++) {
            if (players[i].health > 0) return;
        }
        if (!this.gameOver) {
            this.gameOver = 300;
            connection.gameOver();
    
            for (i = 0; i < players.length && connection.isHost; i++) {
                var p = players[i];
                p.submitStats();
            }
        }
    }
};

/**
 * Pauses the game when the game loses focus
 */
GameScreen.prototype.onBlur = function() {
    if (!this.paused) this.pause(players[connection.gameIndex]);
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
            connection.setPaused(-1);
        }
    }
    else {
        this.paused = player;
        connection.setPaused(player.playerIndex);
    }
};

/**
 * Draws the game to the canvas
 */
GameScreen.prototype.draw = function() {

    camera.moveTo(SIDEBAR_WIDTH + this.scrollX, this.scrollY);
    camera.ctx.globalAlpha = 1;
    ui.drawBackground();

    // Apply scroll offsets
    controls.setOffset(this.scrollX + SIDEBAR_WIDTH, this.scrollY);

    // Draw healing pads
    var i;
    for (i = 0; i < this.pads.length; i++) {
        this.pads[i].draw(camera);
    }

    // Aura draw
    for (i = 0; i < players.length; i++) {
        var r = players[i];
        if (r.onAuraDraw) {
            r.onAuraDraw(camera);
        }
    }
    
    // Draw sprites
    for (i = 0; i < this.robots.length; i++) {
        this.robots[i].draw(camera);
    }

    // Bullets
    for (i = 0; i < this.bullets.length; i++) {
        this.bullets[i].draw(camera);
    }
    
    // Exp
    for (i = 0; i < this.exp.length; i++) {
        this.exp[i].draw(camera);
    }
    
    // Buffs
    ui.drawBuffs();
    
    // Particles
    for (i = 0; i < this.particles.length; i++) {
        this.particles[i].draw(camera);
        if (this.particles[i].expired) {
            this.particles.splice(i, 1);
            i--;
        }
    }
    
    // Reset scrolling for UI elements
    camera.moveTo(0, 0);
    
    ui.drawEnemyHealth();
    ui.drawPlayerHUDs();
    
    // Enemy indicators
    if (this.score >= this.bossScore - 10) {
        ui.drawEnemyIndicators();
    }
    
    // Boss titles
    this.bossTimer = Math.max(0, this.bossTimer - 1);
    if (this.bossTimer < 180 && this.bossTimer > 0)
    {
        ui.drawBossTitle();
    }
    
    // Pause overlay
    if (this.paused && this.paused !== true) {
        ui.drawPauseOverlay(this.paused);
    }
    
    // Yeah...
    //if (this.julian) ui.julian();

    ui.drawStatBar();

    // Draw the upgrade screen if applicable
    if (this.paused === true) {
        ui.drawUpgradeUI();
    }
    
    // Draw the cursor if applicable
    if (this.cursor) {
        ui.drawCursor();
    }
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

    // When focused on players, take the midpoint of the min/max bounds
    if (this.bossTimer === 0) {
        for (var i = 0; i < players.length; i++) {
            var r = players[i];
            if (r.health <= 0) continue;
            if (r.pos.x < minX) minX = r.pos.x;
            if (r.pos.x > maxX) maxX = r.pos.x;
            if (r.pos.y < minY) minY = r.pos.y;
            if (r.pos.y > maxY) maxY = r.pos.y;
        }
    }
    
    // When focused on a boss, just take its position
    else {
        minX = maxX = this.boss.pos.x;
        minY = maxY = this.boss.pos.y;
    }
    
    if (minX != 9999) {
        var avgX = (maxX + minX) / 2;
        var avgY = (maxY + minY) / 2;

        // Set target position
        this.targetX = WINDOW_WIDTH / 2 - avgX;
        this.targetY = WINDOW_HEIGHT / 2 - avgY;

        // Clamp if not doing a boss preview
        if (this.bossTimer === 0) {
            this.targetX = clamp(this.targetX, WINDOW_WIDTH - GAME_WIDTH, 0);
            this.targetY = clamp(this.targetY, WINDOW_HEIGHT - GAME_HEIGHT, 0);
        }
        
        // Smooth scroll to the target
        if (!this.paused) {
            var dx = this.targetX - this.scrollX;
            var dy = this.targetY - this.scrollY;
            var dSq = dx * dx + dy * dy;
            if (dSq > 0) {
                dSq = Math.sqrt(dSq);
                dSq = Math.min(dSq, 25) / dSq;
                dx *= dSq;
                dy *= dSq;
                
                this.scrollX += dx;
                this.scrollY += dy;
            }
        }
        
        // Update player bounds when not doing a boss preview
        if (this.bossTimer === 0) {
            this.playerMinX = Math.max(0, Math.min(avgX - WINDOW_WIDTH / 2, this.scrollX) + 100);
            this.playerMinY = Math.max(0, Math.min(avgY - WINDOW_HEIGHT / 2, this.scrollY) + 100);
            this.playerMaxX = Math.min(GAME_WIDTH, Math.max(avgX + WINDOW_WIDTH / 2, this.scrollX + WINDOW_WIDTH) - 100);
            this.playerMaxY = Math.min(GAME_HEIGHT, Math.max(avgY + WINDOW_HEIGHT / 2, this.scrollY + WINDOW_HEIGHT) - 100);
        }
    }
};

/**
 * Starts the next round of the game
 */
GameScreen.prototype.startNextRound = function() {
    this.paused = false;
    this.bossIncrement += this.bossScale;
    this.bossScore += this.bossIncrement;
    this.spawnCd = 300;
    if (connection.isHost) connection.doneUpgrades();
};

/**
 * Checks for when the game should transition to the upgrade screen
 */
GameScreen.prototype.checkUpgradeTransition = function() {
    
    // Must have just killed the boss
    if (this.bossStatus == ACTIVE_BOSS) {
        if (this.boss.dead) {
            this.timer++;
            
            // Kill off all non-player robots just before opening the menu
            if (this.timer == 1) {
                for (var i = 0; i < this.robots.length; i++) {
                    var r = this.robots[i];
                    if (r.type && !(r.type & Robot.PLAYER)) {
                        r.dead = true;
                        r.expired = true;
                    }
                }
            }
            
            // Run the countdown
            if (this.timer >= 600) {
                ui.setupUpgradeUI();
                this.bossStatus = ACTIVE_NONE;
                this.timer = 0;
            }
        }
        return;
    }
};

/**
 * Checks whether or not a new enemy should spawn
 */
GameScreen.prototype.checkSpawns = function() {

    // Boss spawning
    if (this.bossStatus == ACTIVE_NONE && this.score == this.bossScore) {
        this.bossStatus = ACTIVE_BOSS;
        this.spawnBoss();
        this.bossCount++;
    }

    // Don't spawn enemies if there are too many or one has just spawned
    if (this.bossStatus == ACTIVE_NONE && this.spawnCd <= 0 && this.enemyCount < this.maxEnemies && this.enemyCount + this.score < this.bossScore) {

        // Get a spawn point off of the gameScreen
        var pos = new Vector(0, 0);
        var visible;
        do {
            pos.x = rand(GAME_WIDTH - 200 + 100);
            pos.y = rand(GAME_HEIGHT - 200 + 100);
            visible = pos.x > -this.scrollX - 100 && pos.x < -this.scrollX + 100 + WINDOW_WIDTH && pos.y > -this.scrollY - 100 && pos.y < -this.scrollY + 100 + WINDOW_HEIGHT;
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
    var i;
    for (i = 0; i < data.length; i += 3) {
        if (data[i + 1] <= this.bossCount) {
            spawnWeight += data[i];
        }
    }
    
    // Choose a random one and spawn it
    var r = rand(spawnWeight);
    var total = 0;
    var enemy;
    for (i = 0; i < data.length; i += 3) {
        if (data[i + 1] <= this.bossCount) {
            total += data[i];
        }
        if (total > r) {
            enemy = new data[i + 2](x, y);
            enemy.construct = data[i + 2].name;
            break;
        }
    }
    
    // This shouldn't happen, but just in case
    // a list is empty, prevent an error happening
    if (!enemy) {
        return;
    }

    // Spawn the enemy
    enemy.id = this.spawnId;
    if (this.bossStatus == ACTIVE_BOSS) {
        enemy.points = 0;
        enemy.exp = 0;
    }
    this.robots.unshift(enemy);
    this.enemyCount++;
    
    // Tell others to spawn the enemy
    connection.spawn(data[i + 2].name, enemy.pos, this.spawnId++, this.bossStatus == ACTIVE_BOSS, enemy.extra);
    
    return enemy;
};

/**
 * Spawns a new boss
 */
GameScreen.prototype.spawnBoss = function() {

    // Get the position
    if (-gameScreen.scrollX + WINDOW_WIDTH / 2 < GAME_WIDTH / 2) {
        x = GAME_WIDTH - 500;
    }
    else {
        x = 500;
    }
    if (-gameScreen.scrollY + WINDOW_HEIGHT / 2 < GAME_HEIGHT / 2) {
        y = GAME_HEIGHT - 500;
    }
    else {
        y = 500;
    }

    // Spawn the boss
    var construct;
	if (this.bossId < 5) {
		construct = BOSS_SPAWNS[this.bossId % BOSS_SPAWNS.length];
        this.boss = new construct(x, y);
        this.boss.construct = construct.name;
        
		this.bossId++;
	}
	else {
		if (this.superBossId === 0) {
            construct = DragonBoss;
			this.boss = new DragonBoss(x, y);
            this.boss.construct = DragonBoss.name;
		}
		else {
            construct = HydraBoss;
			this.boss = new HydraBoss(x, y);
            this.boss.construct = HydraBoss.name;
		}
		this.superBossId++;
		this.shuffleBosses();
	}
    
    this.boss.id = this.spawnId;
    this.robots.push(this.boss);
    this.bossTimer = 300;
    
    // Tell others to spawn the enemy
    connection.spawn(construct.name, this.boss.pos, this.spawnId++, true, this.boss.extra);
};

/**
 * Spawns experience for players
 *
 * @param {Robot}  robot that dropped the exp
 * @param {number} amount of exp to spawn
 */
GameScreen.prototype.spawnExp = function(robot, exp) {
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (player.dead || player.isRemote()) continue;
        var num = Math.round(exp * Enemy.EXP_M[players.length - 1] / players.length);
        for (var e = 0; e < Enemy.EXP_DATA.length; e++) {
            var data = Enemy.EXP_DATA[e];
            while (num > data.value) {
                num -= data.value;
                var orb = new Projectile(
                    data.sprite,
                    0, 0,
                    robot, robot,
                    10,
                    rand(360) * Math.PI / 180,
                    0,
                    999999,
                    false,
                    Robot.PLAYER
                );
                Projectile.ID--;
                orb.setupHoming(player, rand(10) / 100 + 0.04);
                orb.onHit = projEvents.expHit;
                orb.exp = data.value;
                this.exp.push(orb);
            }
        }
    }
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
        if ((r.type & type) && !r.dead && !r.stealth) {
            var d = r.pos.distanceSq(pos);
            if (!dSq || d < dSq) {
                dSq = d;
                closest = r;
            }
        }
    }
    return closest;
};

/**
 * Retrieves a robot by their spawn ID
 *
 * @param {number} id - the robot's spawn ID
 *
 * @returns {Robot} the robot with the given ID or undefined if no robot has that ID
 */
GameScreen.prototype.getRobotById = function(id) {
    if (id <= 0) {
        return players[-id];
    }
    
    var r = this.robots;
    for (var i = 0; i < r.length; i++) {
        if (r[i].id == id) {
            return r[i];
        }
    }
};

/**
 * Retrieves a bullet by its spawn ID
 *
 * @param {number} id         - the bullet's spawn ID
 * @param {number} [clientID] - the ID of the client who spawned the bullet 
 *
 * @returns {Robot} the bullet with the given ID or undefined if no bullet has that ID
 */
GameScreen.prototype.getBulletById = function(id, clientID) {
    if (clientID === undefined) clientID = connection.gameIndex;
    
    var b = this.bullets;
    for (var i = 0; i < b.length; i++) {
        if (b[i].id == id && b[i].clientID == clientID) {
            return b[i];
        }
    }
};