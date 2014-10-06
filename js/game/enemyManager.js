function EnemyManager(screen) {

    // Boss data
    this.bossStatus = ACTIVE_NONE;
    this.bossScore = BOSS_SPAWN_BASE;
    this.bossIncrement = BOSS_SPAWN_BASE;
    this.bossCount = 0;
    
    // Spawn data
    this.spawnCd = SPAWN_RATE;
    this.spawnWeight = 0;
    for (var i = 0; i < SPAWN_DATA.length; i += 2) {
        this.spawnWeight += SPAWN_DATA[i];
    }
    
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
            else if (screen.player.health > 0 && BulletCollides(this.bullets[i], screen.player) && this.bullets[i].damage > 0) {
                this.bullets[i].Hit(screen.player);
                if (!this.bullets[i].pierce) {
                    this.bullets.splice(i, 1);
                    i--;
                }
                screen.damageAlpha = DAMAGE_ALPHA;
            }
        }
        
        // Update mines
        for (var i = 0; i < this.mines.length; i++) {
            this.mines[i].Update();
            if (this.mines[i].exploded) {
                this.mines.splice(i, 1);
                i--;
            }
            else if (BulletCollides(this.mines[i], screen.player) && screen.player.health > 0) {
                this.mines[i].Explode();
                this.mines.splice(i, 1);
                i--;
            }
        }
    };
    
    // Checks for enemy deaths
    this.CheckDeaths = function() {
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].health <= 0) {
            
                // Drop an item if applicable
                screen.dropManager.Drop(this.enemies[i].x, this.enemies[i].y);
                
                // Bosses apply extra effects
                if (this.bossStatus != ACTIVE_NONE) {
                
                    // Clear boss status
                    this.bossStatus = ACTIVE_NONE;
                
                    // Extra drops from bosses
                    for (var n = 0; n < BOSS_DROPS; n++) {
                        var xOffset = RotateX(40, 0, n * 360 / BOSS_DROPS);
                        var yOffset = RotateY(40, 0, n * 360 / BOSS_DROPS);
                        screen.dropManager.Drop(this.enemies[i].x + xOffset, this.enemies[i].y + yOffset);
                    }
                    
                    // Scale the score the next boss spawns at
                    this.bossIncrement += BOSS_SPAWN_SCALE;
                    this.bossScore += this.bossIncrement;        
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
            
            // Get the position
            if (screen.player.x < GAME_WIDTH / 2) {
                x = GAME_WIDTH - 500;
            }
            else {
                x = 500;
            }
            if (screen.player.y < GAME_HEIGHT / 2) {
                y = GAME_HEIGHT - 500;
            }
            else {
                y = 500;
            }
            
            // Spawn the boss
            this.enemies.push(BOSS_SPAWNS[this.bossCount % BOSS_SPAWNS.length](x, y));
            this.bossCount++;
        }

        // Don't spawn enemies if there are too many or one has just spawned
        if (this.bossStatus == ACTIVE_NONE && this.spawnCd <= 0 && this.enemies.length < MAX_ENEMIES && this.enemies.length + screen.score < this.bossScore) {
            var dir = Math.random();
            
            // Get a spawn point off of the gameScreen
            x = Rand(GAME_WIDTH - 200 + 100);
            y = Rand(GAME_HEIGHT - 200 + 100);
            while (!OffScreen(x, y, 100)) {
                x = Rand(GAME_WIDTH - 200 + 100);
                y = Rand(GAME_HEIGHT - 200 + 100);
            }
            
            // Get a random type
            var r = Rand(this.spawnWeight - 3);
            if (this.bossCount >= 3) {
                r = Rand(this.spawnWeight);
            }
            var total = 0;
            var enemy;
            for (var i = 0; i < SPAWN_DATA.length; i += 2) {
                total += SPAWN_DATA[i];
                if (total > r) {
                    enemy = SPAWN_DATA[i + 1](x, y);
                    break;
                }
            }
            if (!enemy) {
                return;
            }
            
            // Spawn the enemy
            this.enemies.push(enemy);
            
            // Apply the cooldown
            this.spawnCd = SPAWN_RATE - SPAWN_SCALE * screen.score;
        }
        else if (this.spawnCd > 0) {
            this.spawnCd--;
        }
    };
}