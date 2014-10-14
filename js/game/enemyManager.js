function EnemyManager(screen) {

    // Boss data
    this.bossStatus = ACTIVE_NONE;
    this.bossScore = Math.floor(BOSS_SPAWN_BASE * (0.6 + 0.4 * playerManager.players.length));
    this.bossIncrement = Math.floor(BOSS_SPAWN_BASE * (0.6 + 0.4 * playerManager.players.length));
    this.bossCount = 0;
    
    // Spawn data
    this.spawnCd = SPAWN_RATE;
    
    // Game objects
    this.enemies = new Array();
    this.mines = new Array();
    this.turrets = new Array();
    this.bullets = new Array();
    
    // Draws enemies to the screen
    this.Draw = function() {
        // Mines
        for (var i = 0; i < this.mines.length; i++) {
            this.mines[i].Draw(canvas);
        }
        
        // Turrets
        for (var i = 0; i < this.turrets.length; i++) {
            this.turrets[i].Draw(canvas);
        }
        
        // Enemies
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].Draw(canvas);
        }
        
        // Enemy bullets
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].Draw(canvas);
        }
    };
    
    // Updates the enemies in the game
    this.UpdateEnemies = function() {
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].Update();
        }
    };
    
    // Updates the bullets for enemies
    this.UpdateBullets = function() {
    
        // Update turrets
        for (var i = 0; i < this.turrets.length; i++) {
            this.turrets[i].Update();
        }

        // Check for collisions between the enemies' bullets and the player
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].Update();
            
            // bullets expired by themselves
            if (this.bullets[i].expired) {
                this.bullets.splice(i, 1);
                i--;
            }
            
            // See if the bullet hit the player
            else {
                for (var p = 0; p < playerManager.players.length; p++) {
                    var player = playerManager.players[p].robot;
                    if (player.health > 0 && BulletCollides(this.bullets[i], player) && this.bullets[i].damage > 0) {
                        this.bullets[i].Hit(player);
                        if (!this.bullets[i].pierce) {
                            this.bullets.splice(i, 1);
                            i--;
                        }
                    }
                }
            }
        }
        
        // Update mines
        for (var i = 0; i < this.mines.length; i++) {
            this.mines[i].Update();
            if (this.mines[i].exploded) {
                this.mines.splice(i, 1);
                i--;
            }
            else {
                for (var p = 0; p < playerManager.players.length; p++) {
                    var player = playerManager.players[p].robot;
                    if (BulletCollides(this.mines[i], player) && player.health > 0) {
                        this.mines[i].Explode();
                        this.mines.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    };
    
    // Checks for enemy deaths
    this.CheckDeaths = function() {
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].health <= 0) {
            
                // Credit the killer
                if (this.enemies[i].killer) {
                    this.enemies[i].killer.enemiesKilled++;
                }
				
                // Bosses apply extra effects
                if (this.bossStatus != ACTIVE_NONE) {
                
                    // Clear boss status
                    this.bossStatus = ACTIVE_NONE;
                
                    // Drops for bosses
					screen.dropManager.Drop(this.enemies[i].x, this.enemies[i].y, BOSS_DROPS);
                    
                    // Scale the score the next boss spawns at
                    this.bossIncrement += BOSS_SPAWN_SCALE;
                    this.bossScore += this.bossIncrement;        
                }
				
				// Drops for normal enemies
				else {
					screen.dropManager.Drop(this.enemies[i].x, this.enemies[i].y, 1);
				}
                
                // Create an explosion
                screen.explosions.push(new Explosion(this.enemies[i].x, this.enemies[i].y, this.enemies[i].sprite.width / 150));
            
                // Remove the enemy
                this.enemies.splice(i, 1);
                i--;
                
                // Increment the score
                screen.score++;
            }
        }
    };
    
    // Checks for whether or not an enemy should spawn
    this.CheckSpawns = function() {
        var x, y;
        
        // Boss spawning
        if (this.bossStatus == ACTIVE_NONE && screen.score == this.bossScore) {
            this.bossStatus = ACTIVE_BOSS;
            this.SpawnBoss(this.bossCount);
            this.bossCount++;
        }

        // Don't spawn enemies if there are too many or one has just spawned
        if (this.bossStatus == ACTIVE_NONE 
                && this.spawnCd <= 0 
                && this.enemies.length < MAX_ENEMIES * (0.7 + 0.3 * playerManager.players.length) 
                && this.enemies.length + screen.score < this.bossScore) {
            var dir = Math.random();
            
            // Get a spawn point off of the gameScreen
            var x, y;
            do {
                x = Rand(GAME_WIDTH - 200 + 100);
                y = Rand(GAME_HEIGHT - 200 + 100);
            }
            while (!OffScreen(x, y, 100));
            
            // Get a random type
            var spawnWeight = 0;
            for (var i = 0; i < SPAWN_DATA.length; i += 3) {
                if (SPAWN_DATA[i + 1] <= this.bossCount) {
                    spawnWeight += SPAWN_DATA[i];
                }
            }
            var r = Rand(spawnWeight);
            var total = 0;
            var enemy;
            for (var i = 0; i < SPAWN_DATA.length; i += 3) {
                if (SPAWN_DATA[i + 1] <= this.bossCount) {
                    total += SPAWN_DATA[i];
                }
                if (total > r) {
                    enemy = SPAWN_DATA[i + 2](x, y);
                    break;
                }
            }
            if (!enemy) {
                return;
            }
            
            // Spawn the enemy
            this.enemies.push(enemy);
            
            // Apply the cooldown
            this.spawnCd = (SPAWN_RATE - SPAWN_SCALE * screen.score) / (0.6 + playerManager.players.length * 0.4);
        }
        else if (this.spawnCd > 0) {
            this.spawnCd--;
        }
    };
    
    // Checks for boss spawns in Boss Rush mode
    this.CheckBosses = function() {
        var x, y;
        
        this.bossScore = 'RUSH';
        if (this.spawnCd <= 0 && this.enemies.length < Math.floor(1 + screen.score / MAX_BOSS_INTERVAL)) {
            this.bossStatus = ACTIVE_BOSS;
            this.spawnCd = BOSS_SPAWN_INTERVAL;
            this.SpawnBoss(screen.score);
            this.bossCount += 0.1;
        }
        else if (this.spawnCd > 0) this.spawnCd--;
    };
    
    // Spawns a boss
    this.SpawnBoss = function(id) {
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
        this.enemies.push(BOSS_SPAWNS[id % BOSS_SPAWNS.length](x, y));
    };
}