function GameScreen(player, damageScale, healthScale, speedScale) {

    this.scrollX = 0;
    this.scrollY = 0;
    this.score = 0;
    this.healCount = 0;
    this.bossCount = 0;
    this.dmgScale = damageScale;
    this.hpScale = healthScale;
    this.spdScale = speedScale;
    
    this.damageOverlay = GetImage("damage");
    this.pauseOverlay = GetImage("pause");
    this.explosions = new Array();
    this.explosion = new Array(
        GetImage("EX1"), 
        GetImage("EX2"),
        GetImage("EX3"),
        GetImage("EX4"),
        GetImage("EX5"),
        GetImage("EX6"),
        GetImage("EX7"),
        GetImage("EX8"),
        GetImage("EX9"),
        GetImage("EX10")
    );
    
    this.damageAlpha;
    this.paused = false;
    this.bossActive = false;
    this.dragonActive = false;
    this.bossScore = BOSS_SPAWN_BASE;
    this.bossIncrement = BOSS_SPAWN_BASE;
    this.healthMultiplier = 1.0;
    this.minibossMultiplier = 1.0;
    this.bossHealthMultiplier = 1.0;
    this.damageMultiplier = 1.0;
    this.bossDmgMultiplier = 1.0;
    this.bossSpeedBonus = 0.0;
    this.spawnCd = SPAWN_RATE;
    this.mines = new Array();
    this.turrets = new Array();
    this.enemies = new Array();
    this.bullets = new Array();
    this.playerDamage = 1.0;
    this.drops = new Array();
    this.music;
    this.player = player;
    this.ui = new UIManager(this);
    
    // Update function
    this.Update = Update;
    function Update() {

        this.UpdateMusic();

        // Pausing the game
        if (KeyPressed(KEY_ESC) && !escDown) {
            escDown = true;
            if (player.health <= 0) {
                for (var i = 0; i < DEFAULT_DROPS.length; i++) {
                    DROPS[i * 2] = DEFAULT_DROPS[i];
                }
                gameScreen = new TitleScreen();
            }
            else {
                this.paused = !this.paused;
            }
        }
        else if (!KeyPressed(KEY_ESC)) {
            escDown = false;
        }
        if (this.paused) {
            return;
        }

        var doc = document.documentElement, body = document.body;
        pageScrollX = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
        pageScrollY = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
        
        // Players and enemies don't need to update if the game is over
        if (this.player.health > 0) {
            this.player.Update();
            for (var i = 0; i < this.enemies.length; i++) {
                this.enemies[i].Update();
            }
        }
        else if (this.player.bullets.length++) {
            this.player.bullets.splice(0, this.player.bullets.length);
        }
        
        this.UpdateBullets();
        this.CollectDrops();
        
        this.ApplyScrolling();
        this.SpawnEnemies();
    }

    // Update function
    this.Draw = Draw;
    function Draw() {

        // Prevent IE bugs
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH, 0);

        // Draw the background
        if (tile && tile.width) {
            for (var i = 0; i < WINDOW_WIDTH / tile.width + 1; i++) {
                var x = i * tile.width - this.scrollX % tile.width;
                for (var j = 0; j < WINDOW_HEIGHT / tile.height + 1; j++) {
                    canvas.drawImage(tile, x, j * tile.height - this.scrollY % tile.height);
                }
            }
        }
        
        // Apply scroll offsets
        canvas.translate(-this.scrollX, -this.scrollY);
        
        // Drops
        for (var i = 0; i < this.drops.length; i++) {
            this.drops[i].Draw(canvas);
        }
        
        // Mines
        for (var i = 0; i < this.mines.length; i++) {
            this.mines[i].Draw(canvas);
        }
        
        // Turrets
        for (var i = 0; i < this.turrets.length; i++) {
            this.turrets[i].Draw(canvas);
        }
        
        // Enemies
        if (!this.dragonActive) {
            for (var i = 0; i < this.enemies.length; i++) {
                this.enemies[i].Draw(canvas);
            }
        }
        
        // Player
        if (this.player.health > 0) {
            this.player.Draw(canvas);
        }
        
        // Dragon
        if (this.dragonActive) {
            this.enemies[0].Draw(canvas);
        }
        
        // Enemy bullets
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].Draw(canvas);
        }
        
        // Explosions
        for (var i = 0; i < this.explosions.length; i++) {
            this.explosions[i].Draw(canvas);
            if (this.explosions[i].frame >= 10) {
                this.explosions.splice(i, 1);
                i--;
            }
        }
        
        canvas.translate(this.scrollX, this.scrollY);
        
        // Damage effect
        if (this.damageAlpha > 0) {
            canvas.save();
            canvas.globalAlpha = this.damageAlpha;
            canvas.drawImage(this.damageOverlay, 0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
            canvas.restore();
            this.damageAlpha -= DAMAGE_ALPHA_DECAY;
        }
        
        canvas.setTransform(1, 0, 0, 1, 0, 0);
        
        // Pause overlay
        if (this.paused) {
            canvas.drawImage(this.pauseOverlay, SIDEBAR_WIDTH, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        }
        
        this.ui.DrawStatBar();
        this.ui.DrawHealthBar();
        this.ui.DrawSkillInfo();
        
        // Draw the cursor
        canvas.drawImage(cursor, mx - element.offsetLeft + pageScrollX - cursor.width / 2, my - element.offsetTop + pageScrollY - cursor.height / 2);
    }

    // Updates bullets, checking for collisions
    this.UpdateBullets = UpdateBullets;
    function UpdateBullets() {

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
            
            // Remove bullets when they are off the gameScreen
            else if (!this.bullets[i].actualDamage && (DistanceSq(this.bullets[i].ox, this.bullets[i].oy, this.bullets[i].x, this.bullets[i].y) > Sq(this.bullets[i].range) || !WithinScreen(this.bullets[i]))) {
                this.bullets.splice(i, 1);
                i--;
            }
            
            // See if the bullet hit the player
            else if (this.player.health > 0 && BulletCollides(this.bullets[i], this.player) && this.bullets[i].damage > 0) {
                if (this.bullets[i].enemy) {
                    this.player.Damage(this.bullets[i].damage, this.bullets[i].enemy);
                }
                else {
                    this.player.Damage(this.bullets[i].damage);
                }
                if (!this.bullets[i].pierce) {
                    this.bullets.splice(i, 1);
                    i--;
                }
                this.damageAlpha = DAMAGE_ALPHA;
            }
        }
        
        // Update mines
        for (var i = 0; i < this.mines.length; i++) {
            this.mines[i].Update();
            if (this.mines[i].exploded) {
                this.mines.splice(i, 1);
                i--;
            }
            else if (BulletCollides(this.mines[i], this.player) && this.player.health > 0) {
                this.mines[i].Explode();
                this.mines.splice(i, 1);
                i--;
            }
        }
        
        // Done if the player is dead
        if (this.player.health <= 0) {
            return;
        }
        
        // Check for collisions between the player's bullets and enemies
        for (var i = 0; i < this.player.bullets.length; i++) {
        
            // Colliding with turrets
            for (var j = 0; j < this.turrets.length; j++) {
                if (BulletCollides(this.player.bullets[i], this.turrets[j])) {
                    this.turrets[j].health -= this.player.bullets[i].damage * this.playerDamage;
                    
                    // If the bullet is not a piercing bullet, remove it
                    if (!this.player.bullets[i].pierce) {
                        this.player.bullets.splice(i, 1);
                        i--;
                    }
                    
                    // See if the turret is destroyed
                    if (this.turrets[j].health <= 0) {
                        this.explosions[this.explosions.length] = new Explosion(this.turrets[j].x, this.turrets[j].y, 0.25);
                        this.turrets.splice(j, 1);
                    }
                }
            }
            
            // Regular enemy collision
            for (var j = 0; j < this.enemies.length; j++) {
            
                // See if the bullet hit the enemy
                if (BulletCollides(this.player.bullets[i], this.enemies[j])) {
                    this.enemies[j].health -= this.player.bullets[i].damage * this.playerDamage;
                    
                    // If the bullet is not a piercing bullet, remove it
                    if (!this.player.bullets[i].pierce) {
                        this.player.bullets.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        }
        
        // Check if enemies died
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].health <= 0) {
            
                // Drop an item if applicable
                var rand = Rand(100);
                var total = 0;
                for (var k = 0; k < DROP_COUNT; k++) {
                    total += DROPS[k * DROP_VALUE_COUNT + DROP_CHANCE];
                    if (total > rand) {
                        this.drops[this.drops.length] = new Drop(this.enemies[i].x, this.enemies[i].y, DROPS[k * DROP_VALUE_COUNT + DROP_TYPE]);
                        break;
                    }
                }
                
                this.dragonActive = false;
                
                // Bosses apply extra effects
                if (this.bossActive) {
                
                    // Extra drops from bosses
                    for (var n = 0; n < BOSS_DROPS; n++) {
                        var xOffset = RotateX(40, 0, n * 360 / BOSS_DROPS);
                        var yOffset = RotateY(40, 0, n * 360 / BOSS_DROPS);
                        rand = Rand(100);
                        total = 0;
                        for (var o = 0; o < DROP_COUNT; o++) {
                            total += DROPS[o * DROP_VALUE_COUNT + DROP_CHANCE];
                            if (total > rand) {
                                this.drops[this.drops.length] = new Drop(this.enemies[i].x + xOffset, this.enemies[i].y + yOffset, DROPS[o * DROP_VALUE_COUNT + DROP_TYPE]);
                                break;
                            }
                        }
                    }
                    
                    this.bossIncrement += BOSS_SPAWN_SCALE;
                    this.bossScore += this.bossIncrement;
                    
                    // Power up enemies when a boss is defeated
                    this.damageMultiplier = ((this.bossCount + 1) / 2) * (this.bossCount + 2);
                    this.bossDmgMultiplier = this.damageMultiplier * (1 + this.score / 1000);
                    this.bossSpeedBonus = BOSS_SPEED_SCALE * (this.bossCount > 5 ? 5 : this.bossCount);
                    if (this.bossCount > 4) {
                        this.healthMultiplier = Math.pow(2, 2 + 0.5 * this.bossCount);
                        this.minibossMultiplier = Math.pow(2, 3 + 0.75 * this.bossCount);
                        this.bossHealthMultiplier = Math.pow(2, 4 + this.bossCount);
                    }
                    else {
                        this.healthMultiplier = Math.pow(2, this.bossCount);
                        this.minibossMultiplier = Math.pow(2, this.bossCount * 1.5);
                        this.bossHealthMultiplier = Math.pow(2, this.bossCount * 2 + (this.bossCount > 3 ? 2 : 1));
                        
                    }
                    
                    this.explosions[this.explosions.length] = new Explosion(this.enemies[i].x, this.enemies[i].y, this.enemies[i].sprite.width / 150);
                }
                
                else {
                    this.explosions[this.explosions.length] = new Explosion(this.enemies[i].x, this.enemies[i].y, this.enemies[i].sprite.width / 150);
                }
            
                // Remove the enemy
                this.enemies.splice(i, 1);
                i--;
                
                // Apply death effects
                this.score++;
                if (player.ApplyKill) {
                    player.ApplyKill();
                }
            }
        }
    }

    // Collects the drops on the ground
    this.CollectDrops = CollectDrops;
    function CollectDrops() {
        for (var i = 0; i < this.drops.length; i++) {
            if (BulletCollides(this.drops[i], this.player)) {
                if (this.drops[i].type == SPREAD_SHOT) {
                    if (this.player.upgrades[SPREAD_ID] * 2 < MAX_DROPS) {
                        this.player.upgrades[SPREAD_ID] += 0.5;
                    }
                    if (this.player.upgrades[SPREAD_ID] * 2 >= MAX_DROPS) {
                        DROPS[DROP_DAMAGE * DROP_VALUE_COUNT + DROP_CHANCE] += DROPS[DROP_SPREAD * DROP_VALUE_COUNT + DROP_CHANCE];
                        DROPS[DROP_SPREAD * DROP_VALUE_COUNT + DROP_CHANCE] = 0;
                    }
                }
                else if (this.drops[i].type == LASER) {
                    if (this.player.upgrades[LASER_ID] < MAX_DROPS) {
                        this.player.upgrades[LASER_ID]++;
                    }
                    if (this.player.upgrades[LASER_ID] >= MAX_DROPS) {
                        DROPS[DROP_DAMAGE * DROP_VALUE_COUNT + DROP_CHANCE] += DROPS[DROP_LASER * DROP_VALUE_COUNT + DROP_CHANCE];
                        DROPS[DROP_LASER * DROP_VALUE_COUNT + DROP_CHANCE] = 0;
                    }
                }
                else if (this.drops[i].type == FLAMETHROWER) {
                    if (this.player.upgrades[FLAME_ID] < MAX_DROPS) {
                        this.player.upgrades[FLAME_ID]++;
                    }
                    if (this.player.upgrades[FLAME_ID] >= MAX_DROPS) {
                        DROPS[DROP_DAMAGE * DROP_VALUE_COUNT + DROP_CHANCE] += DROPS[DROP_FLAMETHROWER * DROP_VALUE_COUNT + DROP_CHANCE];
                        DROPS[DROP_FLAMETHROWER * DROP_VALUE_COUNT + DROP_CHANCE] = 0;
                    }
                }
                else if (this.drops[i].type == SHIELD) {
                    if (this.player.upgrades[SHIELD_ID] < MAX_DROPS) {
                        this.player.upgrades[SHIELD_ID]++;
                    }
                    if (this.player.upgrades[SHIELD_ID] >= MAX_DROPS) {
                        DROPS[DROP_HEALTH * DROP_VALUE_COUNT + DROP_CHANCE] += DROPS[DROP_SHIELD * DROP_VALUE_COUNT + DROP_CHANCE];
                        DROPS[DROP_SHIELD * DROP_VALUE_COUNT + DROP_CHANCE] = 0;
                    }
                }
                else if (this.drops[i].type == HEALTH) {
                    this.player.maxHealth += HEALTH_UP * this.hpScale;
                    this.player.health += HEALTH_UP * this.hpScale;
                    this.player.upgrades[HEALTH_ID]++;
                }
                else if (this.drops[i].type == HEAL) {
                    this.player.health += HEAL_PERCENT * this.player.maxHealth / 100;
                    if (this.player.health > this.player.maxHealth) {
                        this.player.health = this.player.maxHealth;
                        this.player.upgrades[HEAL_ID]++;
                    }
                    this.healCount++;
                }
                else if (this.drops[i].type == DAMAGE) {
                    this.playerDamage += DAMAGE_UP * this.dmgScale;
                    this.player.upgrades[DAMAGE_ID]++;
                }
                else if (this.drops[i].type == SPEED) {
                    if (this.player.speed < PLAYER_SPEED + SPEED_UP * MAX_DROPS * this.spdScale) {
                        this.player.speed += SPEED_UP * this.spdScale;
                        this.player.upgrades[SPEED_ID]++;
                    }
                    if (this.player.speed >= PLAYER_SPEED + SPEED_UP * MAX_DROPS * this.spdScale) {
                        DROPS[DROP_HEALTH * DROP_VALUE_COUNT + DROP_CHANCE] += DROPS[DROP_SPEED * DROP_VALUE_COUNT + DROP_CHANCE];
                        DROPS[DROP_SPEED * DROP_VALUE_COUNT + DROP_CHANCE] = 0;
                    }
                }
                
                this.drops.splice(i, 1);
                i--;
            }
        }
    }
    
    // Applies scrolling to the game
    this.ApplyScrolling = ApplyScrolling;
    function ApplyScrolling() {

        // Get the scroll position according to the player's position
        this.scrollX = this.player.x - WINDOW_WIDTH / 2;
        this.scrollY = this.player.y - WINDOW_HEIGHT / 2;
        
        // Limit the scroll amount to stay within the arena
        if (this.scrollX < 0) {
            this.scrollX = 0;
        }
        if (this.scrollY < 0) {
            this.scrollY = 0;
        }
        if (this.scrollX > GAME_WIDTH - WINDOW_WIDTH) {
            this.scrollX = GAME_WIDTH - WINDOW_WIDTH;
        }
        if (this.scrollY > GAME_HEIGHT - WINDOW_HEIGHT) {
            this.scrollY = GAME_HEIGHT - WINDOW_HEIGHT;
        }
        
        // Apply the scroll amount to the mouse coordinates
        mouseX = mx + this.scrollX - SIDEBAR_WIDTH - element.offsetLeft + pageScrollX;
        mouseY = my + this.scrollY - element.offsetTop + pageScrollY;
    }

    // Spawns enemies when applicable
    this.SpawnEnemies = SpawnEnemies
    function SpawnEnemies() {
        var x, y;

        // Boss was defeated
        if (this.bossActive && this.enemies.length == 0) {
            this.bossActive = false;
        }
        
        // Boss spawning
        else if (!this.bossActive && this.score == this.bossScore) {
            this.bossActive = true;
            
            // Spawn boss
            if (this.player.x < GAME_WIDTH / 2) {
                x = GAME_WIDTH - 500;
            }
            else {
                x = 500;
            }
            if (this.player.y < GAME_HEIGHT / 2) {
                y = GAME_HEIGHT - 500;
            }
            else {
                y = 500;
            }
            
            var adjustedCount = this.bossCount - Math.floor(this.bossCount / (2 * BOSS_COUNT + 1));
            var bossId = this.bossCount % (2 * BOSS_COUNT + 1) == (2 * BOSS_COUNT) ? BOSS_DRAGON : adjustedCount % BOSS_COUNT;
            this.bossCount++;
            if (bossId == BOSS_HEAVY) {
                this.enemies[this.enemies.length] = new HeavyBoss(x, y);
            }
            else if (bossId == BOSS_FIRE) {
                this.enemies[this.enemies.length] = new FireBoss(x, y);
            }
            else if (bossId == BOSS_PUNCH) {
                this.enemies[this.enemies.length] = new PunchBoss(x, y);
            }
            else if (bossId == BOSS_DRAGON) {
                this.enemies[this.enemies.length] = new DragonBoss(x, y);
                this.dragonActive = true;
            }
        }

        // Don't spawn enemies if there are too many or one has just spawned
        if (!this.bossActive && this.spawnCd <= 0 && this.enemies.length < MAX_ENEMIES && this.enemies.length + this.score < this.bossScore) {
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
            
            // Testing boss stuff
            //this.enemies[this.enemies.length] = new PunchBoss(x, y);
            //this.enemies[this.enemies.length] = new FireBoss(x, y);
            //this.enemies[this.enemies.length] = new DragonBoss(x, y);
            //this.dragonActive = true;
            
            // Spawn the enemy
            this.enemies[this.enemies.length] = new Enemy(x, y,
                    ENEMY_DATA[type + ENEMY_TYPE], 
                    ENEMY_DATA[type + ENEMY_RANGE], 
                    ENEMY_DATA[type + ENEMY_ATTACK_RATE], 
                    ENEMY_DATA[type + ENEMY_HEALTH] * (type >= MINIBOSS_START ? this.minibossMultiplier : this.healthMultiplier),
                    ENEMY_DATA[type + ENEMY_DAMAGE] * this.damageMultiplier,
                    Rand(this.bossCount + 1),
                    ENEMY_DATA[type + ENEMY_ATTACK],
                    ENEMY_DATA[type + ENEMY_SPEED] + ENEMY_DATA[type + ENEMY_SPEED_SCALE] * (this.bossCount > 5 ? 5 : this.bossCount));
            
            // Apply the cooldown
            this.spawnCd = SPAWN_RATE - SPAWN_SCALE * this.score;
        }
        else if (this.spawnCd > 0) {
            this.spawnCd--;
        }
    }

    // Updates the music depending on the state of the game
    this.UpdateMusic = UpdateMusic;
    function UpdateMusic() {

        // Player must be alive for the music to play
        if (this.player.health > 0) {
        
            // Initially load the music if it isn't already
            if (!this.music) {
                this.music = new Audio("sound/granamaTheme.mp3");
                this.music.addEventListener('ended', function() {
                    this.currentTime = 0;
                    this.play();
                }, false);
                this.music.volume = 0;
                this.music.play();
            }
            
            // Gradually get louder after loading
            else if (this.music.volume < 1) {
                var newVolume = this.music.volume + 0.005;
                if (newVolume > 1) {
                    newVolume = 1;
                }
                this.music.volume = newVolume;
            }
        }
        
        // Fade out and then stop when the player dies
        else if (this.music) {
            var newVolume = this.music.volume - 0.01;
            if (newVolume <= 0) {
                this.music.pause();
                this.music = false;
            }
            else {
                this.music.volume = newVolume;
            }
        }
    }
}