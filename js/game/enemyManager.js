function EnemyManager(screen) {

    // Boss data
    this.bossStatus = ACTIVE_NONE;
    this.bossScore = BOSS_SPAWN_BASE;
    this.bossIncrement = BOSS_SPAWN_BASE;
    this.bossCount = 0;
    
    // Spawn counter
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
    }
    
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
            }
            
            // Remove bullets when they are not visible
            else if (!this.bullets[i].actualDamage && (DistanceSq(this.bullets[i].ox, this.bullets[i].oy, this.bullets[i].x, this.bullets[i].y) > Sq(this.bullets[i].range) || !WithinScreen(this.bullets[i]))) {
                this.bullets.splice(i, 1);
                i--;
            }
            
            // See if the bullet hit the player
            else if (this.player.health > 0 && BulletCollides(this.bullets[i], screen.player) && this.bullets[i].damage > 0) {
                if (this.bullets[i].enemy) {
                    screen.player.Damage(this.bullets[i].damage, this.bullets[i].enemy);
                }
                else {
                    screen.player.Damage(this.bullets[i].damage);
                }
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
                screen.explosions[this.explosions.length] = new Explosion(this.enemies[i].x, this.enemies[i].y, this.enemies[i].sprite.width / 150);
            
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
        else if (this.bossStatus == ACTIVE_NONE && screen.score == this.bossScore) {
            this.bossStatus = ACTIVE_BOSS;
            
            // Get the position
            if (screen.player.x < GAME_WIDTH / 2) {
                x = GAME_WIDTH - 500;
            }
            else {
                x = 500;
            }
            if (this.screen.y < GAME_HEIGHT / 2) {
                y = GAME_HEIGHT - 500;
            }
            else {
                y = 500;
            }
            
            // Spawn the boss
            var bossId = this.bossCount % BOSS_COUNT;
            this.bossCount++;
            if (bossId == BOSS_HEAVY) {
                this.enemies.push(new HeavyBoss(x, y));
            }
            else if (bossId == BOSS_FIRE) {
                this.enemies.push(new FireBoss(x, y));
            }
            else if (bossId == BOSS_PUNCH) {
                this.enemies.push(new PunchBoss(x, y));
            }
            else if (bossId == BOSS_DRAGON) {
                this.enemies.push(new DragonBoss(x, y));
                this.bossStatus = ACTIVE_DRAGON;
            }
        }

        // Don't spawn enemies if there are too many or one has just spawned
        if (this.bossStatus == ACTIVE_NONE && this.spawnCd <= 0 && this.enemies.length < MAX_ENEMIES && this.enemies.length + screen.score < this.bossScore) {
            var dir = Math.random();
            
            // Get a random type
            var r = Rand(300);
            if (this.bossCount >= 3) {
                r = Rand(303);
            }
            var total = 0;
            var type = -1;
            for (var i = 0; i < ENEMY_DATA.length / ENEMY_VALUE_COUNT; i++) {
                total += ENEMY_DATA[i * ENEMY_VALUE_COUNT + ENEMY_CHANCE];
                if (total > r) {
                    type = i * ENEMY_VALUE_COUNT;
                    break;
                }
            }
            if (type == -1) {
                return;
            }
            
            // Get a spawn point off of the gameScreen
            x = Rand(GAME_WIDTH - 200 + 100);
            y = Rand(GAME_HEIGHT - 200 + 100);
            while (!OffScreen(x, y, 100)) {
                x = Rand(GAME_WIDTH - 200 + 100);
                y = Rand(GAME_HEIGHT - 200 + 100);
            }
            
            // Spawn the enemy
            this.enemies.push(new Enemy(x, y,
                    ENEMY_DATA[type + ENEMY_TYPE], 
                    ENEMY_DATA[type + ENEMY_RANGE], 
                    ENEMY_DATA[type + ENEMY_ATTACK_RATE], 
                    ENEMY_DATA[type + ENEMY_HEALTH] * (type >= MINIBOSS_START ? this.minibossMultiplier : this.healthMultiplier),
                    ENEMY_DATA[type + ENEMY_DAMAGE],
                    Rand(this.bossCount + 1),
                    ENEMY_DATA[type + ENEMY_ATTACK],
                    ENEMY_DATA[type + ENEMY_SPEED] + ENEMY_DATA[type + ENEMY_SPEED_SCALE] * (this.bossCount > 5 ? 5 : this.bossCount)
            ));
            
            // Apply the cooldown
            this.spawnCd = SPAWN_RATE - SPAWN_SCALE * screen.score;
        }
        else if (this.spawnCd > 0) {
            this.spawnCd--;
        }
    };
}