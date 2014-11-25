var enemyManager = {

    // Active states
    ACTIVE_NONE: 0,
    ACTIVE_BOSS: 1,

    // Enemy limit settings
    MAX_ENEMIES: 30,
    MAX_PLAYER_SCALE: 0.15,

    // General spawn settings
    SPAWN_RATE: 180,
    SPAWN_SCALE: 0.3,
    SPAWN_PLAYER_SCALE: 0.3,

    // Boss spawn settings
    BOSS_SPAWN_BASE: 50,
    BOSS_SPAWN_SCALE: 25,
    BOSS_PLAYER_SCALE: 0.4,

    // Boss rush settings
    MAX_BOSS_INTERVAL: 40,
    BOSS_SPAWN_INTERVAL: 180,

    // Enemy spawn data
    SPAWN_DATA: [
        90, 0, LightRangedEnemy,
        45, 1, HeavyRangedEnemy,
        60, 0, LightArtilleryEnemy,
        30, 1, HeavyArtilleryEnemy,
        15, 1, LightMeleeEnemy,
        10, 2, HeavyMeleeEnemy,
        30, 0, LightBomberEnemy,
        15, 1, HeavyBomberEnemy,
        20, 1, LightOrbiterEnemy,
        10, 1, HeavyOrbiterEnemy,
        15, 2, LightBouncerEnemy,
        10, 2, HeavyBouncerEnemy,
        15, 5, LightMedicEnemy,
        10, 5, HeavyMedicEnemy,
        30, 4, LightGrabberEnemy,
        20, 4, HeavyGrabberEnemy,
        1,  3, TurretEnemy,
        1,  3, RailerEnemy,
        1,  3, PaladinEnemy,
        1,  3, HunterEnemy,
        1,  4, SolarEnemy,
        1,  5, SnatcherEnemy,
        2,  6, TurretEnemy,
        2,  6, RailerEnemy,
        2,  6, PaladinEnemy,
        2,  6, HunterEnemy,
        2,  6, SolarEnemy,
        2,  6, SnatcherEnemy
    ],

    // Boss spawn list
    BOSS_SPAWNS: [
        HeavyBoss,
        FireBoss,
        PunchBoss,
        QueenBoss,
        TankBoss
    ],

    // Special bosses
    BOSS_SPECIALS: [
        6, 6, DragonBoss
    ],

    // Boss data
    bossStatus: 0,
    bossScore: 0,
    bossId: 0,
    bossIncrement: 0,
    bossCount: 0,
    timer: 0,
	
	// Experience multipliers for different numbers of players
    expM: [
	/* 1 Player  */ 1, 
	/* 2 Players */ 5 / 3, 
	/* 3 Players */ 9 / 4, 
	/* 4 Players */ 8 / 3, 
	/* 5 Players */ 35 / 12
	],

    // Experience orb data - must go highest to lowest
    expData: [
        {value: 25, sprite: 'exp25'},
        {value: 10, sprite: 'exp10'},
        {value: 5, sprite: 'exp5'},
        {value: 3, sprite: 'exp3'},
        {value: 1, sprite: 'exp1'}
    ],

    // Spawn data
    spawnCd: 180,

    // Game objects
    enemies: [],
    mines: [],
    turrets: [],
    bullets: [],

	/**
	 * Sets up the enemy manager for a new game
	 */
	setup: function() {
		this.bossScore = Math.floor(this.BOSS_SPAWN_BASE * (1 - this.BOSS_PLAYER_SCALE + this.BOSS_PLAYER_SCALE * playerManager.players.length));
		this.bossIncrement = this.bossScore;
        this.bossStatus = 0;
        this.bossCount = 0;
        this.bossId = 0;
        this.timer = 0;
        this.enemies = [];
        this.mines = [];
        this.turrets = [];
        this.bullets = [];
        this.shuffle();
	},

    /**
     * Shuffles the boss spawn order
     */
    shuffle: function() {
        var temp = [];
        while (this.BOSS_SPAWNS.length > 0) {
            var n = rand(this.BOSS_SPAWNS.length);
            temp.push(this.BOSS_SPAWNS[n]);
            this.BOSS_SPAWNS.splice(n, 1);
        }
        this.BOSS_SPAWNS = temp;
    },
	
	/**
	 * Draws all enemies and their projectiles to the screen
	 *
	 * @param {Camera} camera - the camera to draw to
	 */
    draw: function(camera) {
	
        // Mines
		camera.drawList(this.mines);
		camera.drawList(this.turrets);
		camera.drawList(this.enemies);
		camera.drawList(this.bullets);
		
        // Enemy indicators if applicable
        if (game.score >= this.bossScore - 10) {
            var pointer = images.get('enemyPointer');
            var halfX = camera.canvas.width / 2;
            var halfY = camera.canvas.height / 2;
            var mid = camera.pos.clone();
            camera.moveTo(halfX, halfY);
            for (var i = 0; i < this.enemies.length; i++) {
                var e = this.enemies[i];
                if (!camera.isVisible(e)) {
                    var d = e.pos.subtractv(mid);
                    var xs = Math.abs(halfX / d.x);
                    var ys = Math.abs(halfY / d.y);
                    var s = xs < ys ? xs : ys;
                    d.x *= s;
                    d.y *= s;
                    canvas.move(d.x, d.y);
                    var rot = d.clone().rotate(0, -1).normalize();
                    canvas.ctx.transform(rot.x, rot.y, -rot.y, rot.x, 0, 0);
                    canvas.ctx.drawImage(pointer, -pointer.width / 2, -pointer.height);
                }
            }
            camera.moveTo(mid.x, mid.y);
        }
    },

    /**
     * Updates the list of enemies
     */
    updateEnemies: function() {

        this.checkDeaths();

        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update();
        }
    },

    /**
     * Updates the bullets of enemies
     */
    updateBullets: function() {

        // Check for collisions between the enemies' bullets and the player
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update();

            // bullets expired by themselves
            if (this.bullets[i].expired) {
                this.bullets.splice(i, 1);
                i--;
            }
        }
    },

    /**
     * Gets the closest enemy to a point
     *
     * @param {Vector} pos - point to get the closest enemy to
     *
     * @returns {Enemy} the closest enemy or undefined if there are no enemies
     */
    getNearest: function(pos) {
        var dSq;
        var enemy;
        for (var i = 0; i < this.enemies.length; i++) {
            var e = this.enemies[i];
            var d = e.pos.distanceSq(pos);
            if (!dSq || d < dSq) {
                dSq = d;
                enemy = e;
            }
        }
        return enemy;
    },

    /**
     * Checks for dead enemies and gives score/experience
     */
    checkDeaths: function() {

        // Enemy deaths
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].health <= 0) {

                // Credit the killer
                if (this.enemies[i].killer) {
                    var p = this.enemies[i].killer;
                    p.enemiesKilled++;
                    p.profile.addStat(p.name, STAT.TOTAL_KILLS, 1);
                    p.profile.setBest(p.name, STAT.MOST_KILLS, p.enemiesKilled);

                    if (this.enemies[i].rank) {
                        p.profile.addStat(p.name, this.enemies[i].rank, 1);
                    }
                }

                // Spawn experience
                if (this.enemies[i].exp > 0) {
                    var num = Math.round(this.enemies[i].exp * this.expM[playerManager.players.length - 1]);
                    for (var e = 0; e < this.expData.length; e++) {
                        var data = this.expData[e];
                        var allDead = false;
                        while (!allDead && data.value * playerManager.players.length <= num) {
                            allDead = true;
                            for (var player = 0; player < playerManager.players.length; player++) {
                                var robot = playerManager.players[player % playerManager.players.length].robot;
                                if (robot.health <= 0) continue;
                                allDead = false;
                                num -= data.value;
                                var direction = new Vector(0, 10);
                                direction.Rotate(rand(360) * Math.PI / 180);
                                var exp = new ExpOrb(
                                    data.sprite,
                                    this.enemies[i],
                                    0,
                                    0,
                                    direction.x,
                                    direction.y,
                                    1,
                                    robot,
                                    data.value
                                );
                                this.bullets.push(exp);
                            }
                        }
                    }
                }

                // Create an explosion
                game.particles.push(new Explosion(this.enemies[i].pos, this.enemies[i].sprite.width / 150));

                // Boss effects
                if (this.enemies[i].isBoss()) {

                    // Remove all enemies with explosions
                    for (var j = 0; j < this.enemies.length; j++) {
                        if (i == j) continue;
                        screen.particles.push(new Explosion(this.enemies[j].x, this.enemies[j].y, this.enemies[j].sprite.width / 150));
                    }
                    this.enemies.splice(0, this.enemies.length);

                    // Scale the score the next boss spawns at
                    this.bossIncrement += this.BOSS_SPAWN_SCALE;
                    this.bossScore += this.bossIncrement;

                    // Reset the timer for upgrade transitions
                    this.timer = 0;

                    screen.score++;
                }

                // Normal enemy effects
                else {

                    // Increment the score if not fighting a boss
                    if (this.bossStatus == this.ACTIVE_NONE) {
                        screen.score++;
                    }

                    // Remove the enemy
                    this.enemies.splice(i, 1);
                    i--;
                }
            }
        }
    },

    /**
     * Checks for normal spawns in arcade mode
     */
    checkSpawns: function() {

        // Transition to upgrade screen
        if (this.bossStatus == this.ACTIVE_BOSS) {
            if (this.enemies.length === 0) {
                this.timer++;
                if (this.timer >= 600) {
                    uiManager.setupUpgradeUI();
                    this.bossStatus = this.ACTIVE_NONE;
                }
            }
            return;
        }

        // Boss spawning
        if (this.bossStatus == this.ACTIVE_NONE && game.score == this.bossScore) {
            this.bossStatus = this.ACTIVE_BOSS;
            this.bossCount++;
            this.spawnBoss(this.bossCount);
        }

        // Don't spawn enemies if there are too many or one has just spawned
        if (this.bossStatus == this.ACTIVE_NONE
            && this.spawnCd <= 0
            && this.enemies.length < this.MAX_ENEMIES * (1 - this.MAX_PLAYER_SCALE + this.MAX_PLAYER_SCALE * playerManager.players.length)
            && this.enemies.length + game.score < this.bossScore) {

            // Get a spawn point off of the gameScreen
            var pos;
            do {
                pos = new Vector(rand(100, game.width - 100), rand(100, game.height - 100));
            }
            while (game.camera.isVisible(pos, 200));

            this.spawnEnemy(this.SPAWN_DATA, pos);

            // Apply the cooldown
            this.spawnCd = (this.SPAWN_RATE - this.SPAWN_SCALE * screen.score) / (1 - this.SPAWN_PLAYER_SCALE + this.SPAWN_PLAYER_SCALE * playerManager.players.length);
        }
        else if (this.spawnCd > 0) {
            this.spawnCd--;
        }
    },

    /**
     * Spawns an enemy using given spawn data
     *
     * @param {Array}  data - the spawn data to use
     * @param {Vector} pos  - the position to spawn at
     *
     * @returns {Enemy} the spawned enemy
     */
    spawnEnemy: function(data, pos) {

        // Sum the weights
        var spawnWeight = 0;
        var i;
        for (i = 0; i < data.length; i += 3) {
            if (data[i + 1] <= this.bossCount) {
                spawnWeight += data[i];
            }
        }

        // Get a random type
        var r = rand(spawnWeight);
        var total = 0;
        var enemy;
        for (i = 0; i < data.length; i += 3) {
            if (data[i + 1] <= this.bossCount) {
                total += data[i];
            }
            if (total > r) {
                enemy = data[i + 2](pos.x, pos.y);
                break;
            }
        }

        // Make sure an enemy was obtained
        if (!enemy) {
            return;
        }

        // Spawn the enemy
        this.enemies.unshift(enemy);
        return enemy;
    },

    /**
     * Checks for boss spawns in boss rush mode
     */
    checkBosses: function() {
        this.bossScore = 'RUSH';
        if (this.spawnCd <= 0 && this.enemies.length < Math.floor(1 + screen.score / this.MAX_BOSS_INTERVAL)) {
            this.bossStatus = this.ACTIVE_BOSS;
            this.spawnCd = this.BOSS_SPAWN_INTERVAL;
            this.spawnBoss(game.score + 1);
            this.bossCount += 0.4;
        }
        else if (this.spawnCd > 0) this.spawnCd--;
    },

    /**
     * Spawns a boss
     *
     * @param {number} bossNum - the nnumber of the boss (first = 1, second = 2, etc.)
     */
    spawnBoss: function(bossNum) {

        // Get the position
        if (game.camera.pos.x < game.width / 2) {
            x = game.width - 500;
        }
        else {
            x = 500;
        }
        if (game.camera.pos.y < game.height / 2) {
            y = game.height - 500;
        }
        else {
            y = 500;
        }

        // Check for special bosses
        for (var i = 0; i < this.BOSS_SPECIALS.length; i += 3) {
            if (bossNum >= this.BOSS_SPECIALS[i] && (bossNum - this.BOSS_SPECIALS[i]) % this.BOSS_SPECIALS[i + 1] == 0) {
                this.enemies.push(this.BOSS_SPECIALS[i + 2])(x, y);
                return;
            }
        }

        // Spawn the boss
        this.enemies.push(this.BOSS_SPAWNS[this.bossId++](x, y));
        if (this.bossId >= this.BOSS_SPAWNS.length) {
            this.bossId = 0;
            this.shuffle();
        }
    }
};