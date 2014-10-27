function EnemyManager(screen) {

    // Boss data
    this.bossStatus = ACTIVE_NONE;
    this.bossScore = Math.floor(BOSS_SPAWN_BASE * (0.6 + 0.4 * playerManager.players.length));
    this.bossIncrement = Math.floor(BOSS_SPAWN_BASE * (0.6 + 0.4 * playerManager.players.length));
    this.bossCount = 0;
	this.timer = 0;
    this.expM = [1, 4/3, 3/2, 5/3];
    
    // Experience data
    this.expData = [
        { value: 25, sprite: GetImage('exp25') },
        { value: 5, sprite: GetImage('exp5') },
        { value: 1, sprite: GetImage('exp1') }
    ];
    
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
		
		// Enemy indicators if applicable
		if (screen.score >= this.bossScore - 10) {
			var pointer = GetImage('enemyPointer');
			var halfX = WINDOW_WIDTH / 2;
			var halfY = WINDOW_HEIGHT / 2;
			var midX = screen.scrollX + halfX;
			var midY = screen.scrollY + halfY;
			for (var i = 0; i < this.enemies.length; i++) {
				var e = this.enemies[i];
				if (OffScreen(e.x, e.y, e.sprite.width / 2)) {
					var d = Vector(e.x - midX, e.y - midY);
					var xs = Math.abs(halfX / d.x);
					var ys = Math.abs(halfY / d.y);
					var s = xs < ys ? xs : ys;
					d.x *= s;
					d.y *= s;
                    canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH, 0);
                    canvas.translate(halfX + d.x, halfY + d.y);
                    var a = AngleTo(d, { x: 0, y: 0 });
                    canvas.rotate(a);
					canvas.drawImage(pointer, -pointer.width / 2, -pointer.height);
				}
			}
			ResetTransform(canvas);
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
                    if (player.health > 0 && i < this.bullets.length && this.bullets[i].Collides(player)) {
						if (this.bullets[i].damage > 0) {
							this.bullets[i].Hit(player);
						}
						if (!this.bullets[i].pierce) {
							this.bullets.splice(i, 1);
							i--;
							break;
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
				
				// Spawn experience
                if (this.enemies[i].exp >= 300 || this.bossStatus == ACTIVE_NONE) { 
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
								var direction = Vector(0, BULLET_SPEED);
								direction.Rotate(Rand(360) * Math.PI / 180);
								var exp = ReflectionProjectile(
									data.sprite,
									this.enemies[i],
									0,
									0, 
									direction.x, 
									direction.y, 
									1, 
									robot
								);
								exp.exp = data.value;
								exp.Hit = projectileFunctions.HitExp;
								this.bullets.push(exp);
							}
                        }
                    }
                }
                
                // Create an explosion
                screen.explosions.push(new Explosion(this.enemies[i].x, this.enemies[i].y, this.enemies[i].sprite.width / 150));
				
                // Boss effects
                if (this.enemies[i].exp >= 300) {
                
                    // More drops for bosses
					//screen.dropManager.Drop(this.enemies[i].x, this.enemies[i].y, BOSS_DROPS);
                
                    // Remove all enemies with explosions
                    for (var j = 0; j < this.enemies.length; j++) {
                        if (i == j) continue;
                        screen.explosions.push(new Explosion(this.enemies[j].x, this.enemies[j].y, this.enemies[j].sprite.width / 150));
                    }
                    this.enemies.splice(0, this.enemies.length);
                
                    // Scale the score the next boss spawns at
                    this.bossIncrement += BOSS_SPAWN_SCALE;
                    this.bossScore += this.bossIncrement;        
                    
					// Reset the timer for upgrade transitions
					this.timer = 0;
					
                    screen.score++;
                }
				
				// Normal enemy effects
				else {
                    
                    // Increment the score if not fighting a boss
                    if (this.bossStatus == ACTIVE_NONE) {
                        screen.score++;
                        
                        // Drop one item
                        //screen.dropManager.Drop(this.enemies[i].x, this.enemies[i].y, 1);
                    }
					
					// Remove the enemy
                    this.enemies.splice(i, 1);
                    i--;
				}
            }
        }
    };
    
    // Checks for whether or not an enemy should spawn
    this.CheckSpawns = function() {
		
		// Transition to upgrade screen
		if (this.bossStatus == ACTIVE_BOSS) {
			if (this.enemies.length == 0) {	
				this.timer++;
				if (this.timer >= 600) {	
					screen.ui.SetupUpgradeUI();
					this.bossStatus = ACTIVE_NONE;
				}
			}
			return;
		}
		
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
            
            // Get a spawn point off of the gameScreen
            var x, y;
            do {
                x = Rand(GAME_WIDTH - 200 + 100);
                y = Rand(GAME_HEIGHT - 200 + 100);
            }
            while (!OffScreen(x, y, 100));
            
            this.SpawnEnemy(SPAWN_DATA, x, y);
            
            // Apply the cooldown
            this.spawnCd = (SPAWN_RATE - SPAWN_SCALE * screen.score) / (0.6 + playerManager.players.length * 0.4);
        }
        else if (this.spawnCd > 0) {
            this.spawnCd--;
        }
    };
    
    // Spawns an enemy using the given spawn data
    this.SpawnEnemy = function(data, x, y) {
    
        // Get a random type
        var spawnWeight = 0;
        for (var i = 0; i < data.length; i += 3) {
            if (data[i + 1] <= this.bossCount) {
                spawnWeight += data[i];
            }
        }
        var r = Rand(spawnWeight);
        var total = 0;
        var enemy;
        for (var i = 0; i < data.length; i += 3) {
            if (data[i + 1] <= this.bossCount) {
                total += data[i];
            }
            if (total > r) {
                enemy = data[i + 2](x, y);
                break;
            }
        }
        if (!enemy) {
            return;
        }
        
        // Spawn the enemy
        this.enemies.unshift(enemy);
    };
    
    // Checks for boss spawns in Boss Rush mode
    this.CheckBosses = function() {
        var x, y;
        
        this.bossScore = 'RUSH';
        if (this.spawnCd <= 0 && this.enemies.length < Math.floor(1 + screen.score / MAX_BOSS_INTERVAL)) {
            this.bossStatus = ACTIVE_BOSS;
            this.spawnCd = BOSS_SPAWN_INTERVAL;
            this.SpawnBoss(screen.score);
            this.bossCount += 0.3;
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