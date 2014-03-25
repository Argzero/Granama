function GameScreen(player, damageScale, healthScale, speedScale) {

    this.scrollX = 0;
    this.scrollY = 0;
    this.score = 0;
    this.healCount = 0,
    this.bossCount = 0,
    this.dmgScale = damageScale;
    this.hpScale = healthScale;
    this.spdScale = speedScale;
    
    this.damageOverlay = GetImage("damage");
    this.healthTop = GetImage("healthTop");
    this.healthBottom = GetImage("healthBottom");
    this.healthRed = GetImage("healthr");
    this.healthGreen = GetImage("healthg");
    this.healthYellow = GetImage("healthy");
    this.healthBlue = GetImage("healthb");
    this.imgLaser = GetImage("iconLaser");
    this.imgFire = GetImage("iconFlamethrower");
    this.imgShield = GetImage("iconShield");
    this.imgSpread = GetImage("iconSpread");
    this.imgDamage = GetImage("iconDamage");
    this.imgSpeed = GetImage("iconSpeed");
    this.imgHealth = GetImage("iconHealth");
    this.imgHeal = GetImage("iconHeal");
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
    
    this.damageAlpha,
    this.bossActive = false,
    this.paused = false,
    this.dragonActive = false,
    this.bossScore = BOSS_SPAWN_BASE,
    this.bossIncrement = BOSS_SPAWN_BASE,
    this.healthMultiplier = 1.0,
    this.minibossMultiplier = 1.0,
    this.bossHealthMultiplier = 1.0,
    this.damageMultiplier = 1.0,
    this.bossDmgMultiplier = 1.0,
    this.playerDamage = 1.0,
    this.spawnCd = SPAWN_RATE,
    this.bullets = new Array();
    this.mines = new Array();
    this.turrets = new Array();
    this.enemies = new Array();
    this.drops = new Array();
    this.music;
    this.player = player;
    
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
                screen = new TitleScreen();
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
        
        this.DrawHealthBar();
        this.DrawSideBar();
        
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
            
            // Remove bullets when they are off the screen
            else if (!this.bullets[i].actualDamage && (DistanceSq(this.bullets[i].ox, this.bullets[i].oy, this.bullets[i].x, this.bullets[i].y) > Sq(this.bullets[i].range) || !WithinScreen(this.bullets[i]))) {
                this.bullets.splice(i, 1);
                i--;
            }
            
            
            // See if the bullet hit the player
            else if (this.player.health > 0 && BulletCollides(this.bullets[i], this.player) && this.bullets[i].damage > 0) {
                this.player.Damage(this.bullets[i].damage);
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
                    }
                    
                    // See if the enemy is dead
                    if (this.enemies[j].health <= 0) {
                    
                        // Drop an item if applicable
                        var rand = Rand(100);
                        var total = 0;
                        for (var k = 0; k < DROP_COUNT; k++) {
                            total += DROPS[k * DROP_VALUE_COUNT + DROP_CHANCE];
                            if (total > rand) {
                                this.drops[this.drops.length] = new Drop(this.enemies[j].x, this.enemies[j].y, DROPS[k * DROP_VALUE_COUNT + DROP_TYPE]);
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
                                        this.drops[this.drops.length] = new Drop(this.enemies[j].x + xOffset, this.enemies[j].y + yOffset, DROPS[o * DROP_VALUE_COUNT + DROP_TYPE]);
                                        break;
                                    }
                                }
                            }
                            
                            this.bossIncrement += BOSS_SPAWN_SCALE;
                            this.bossScore += this.bossIncrement;
                            
                            // Power up enemies when a boss is defeated
                            this.damageMultiplier = ((this.bossCount + 1) / 2) * (this.bossCount + 2);
                            this.bossDmgMultiplier = this.damageMultiplier * (1 + this.score / 1000);
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
                            
                            this.explosions[this.explosions.length] = new Explosion(this.enemies[j].x, this.enemies[j].y, this.enemies[j].sprite.width / 150);
                        }
                        
                        else {
                            this.explosions[this.explosions.length] = new Explosion(this.enemies[j].x, this.enemies[j].y, this.enemies[j].sprite.width / 150);
                        }
                    
                        // Remove the enemy
                        this.enemies.splice(j, 1);
                        
                        // Apply death effects
                        this.score++;
                    }
                    break;
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
                    if (this.player.spread * 2 < MAX_DROPS) {
                        this.player.spread += 0.5;
                    }
                    if (this.player.spread * 2 >= MAX_DROPS) {
                        DROPS[DROP_DAMAGE * DROP_VALUE_COUNT + DROP_CHANCE] += DROPS[DROP_SPREAD * DROP_VALUE_COUNT + DROP_CHANCE];
                        DROPS[DROP_SPREAD * DROP_VALUE_COUNT + DROP_CHANCE] = 0;
                    }
                }
                else if (this.drops[i].type == LASER) {
                    if (this.player.laser < MAX_DROPS) {
                        this.player.laser++;
                    }
                    if (this.player.laser >= MAX_DROPS) {
                        DROPS[DROP_DAMAGE * DROP_VALUE_COUNT + DROP_CHANCE] += DROPS[DROP_LASER * DROP_VALUE_COUNT + DROP_CHANCE];
                        DROPS[DROP_LASER * DROP_VALUE_COUNT + DROP_CHANCE] = 0;
                    }
                }
                else if (this.drops[i].type == FLAMETHROWER) {
                    if (this.player.flamethrower < MAX_DROPS) {
                        this.player.flamethrower++;
                    }
                    if (this.player.flamethrower >= MAX_DROPS) {
                        DROPS[DROP_DAMAGE * DROP_VALUE_COUNT + DROP_CHANCE] += DROPS[DROP_FLAMETHROWER * DROP_VALUE_COUNT + DROP_CHANCE];
                        DROPS[DROP_FLAMETHROWER * DROP_VALUE_COUNT + DROP_CHANCE] = 0;
                    }
                }
                else if (this.drops[i].type == SHIELD) {
                    if (this.player.shield < MAX_DROPS) {
                        this.player.shield++;
                    }
                    if (this.player.shield >= MAX_DROPS) {
                        DROPS[DROP_HEALTH * DROP_VALUE_COUNT + DROP_CHANCE] += DROPS[DROP_SHIELD * DROP_VALUE_COUNT + DROP_CHANCE];
                        DROPS[DROP_SHIELD * DROP_VALUE_COUNT + DROP_CHANCE] = 0;
                    }
                }
                else if (this.drops[i].type == HEALTH) {
                    this.player.maxHealth += HEALTH_UP * this.hpScale;
                    this.player.health += HEALTH_UP * this.hpScale;
                }
                else if (this.drops[i].type == HEAL) {
                    this.player.health += HEAL_PERCENT * this.player.maxHealth / 100;
                    if (this.player.health > this.player.maxHealth) {
                        this.player.health = this.player.maxHealth;
                    }
                    this.healCount++;
                }
                else if (this.drops[i].type == DAMAGE) {
                    this.playerDamage += DAMAGE_UP * this.dmgScale;
                }
                else if (this.drops[i].type == SPEED) {
                    if (this.player.speed < PLAYER_SPEED + SPEED_UP * MAX_DROPS * this.spdScale) {
                        this.player.speed += SPEED_UP * this.spdScale;
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

    // Draws the health bar
    this.DrawHealthBar = DrawHealthBar;
    function DrawHealthBar() {

        // Move to the sidebar location
        canvas.translate(WINDOW_WIDTH + SIDEBAR_WIDTH, 0);
        
        // Background
        canvas.fillStyle = "#000000";
        canvas.fillRect(0, 0, UI_WIDTH, WINDOW_HEIGHT);
        
        // Top and bottom images
        canvas.drawImage(this.healthTop, 0, 0);
        canvas.drawImage(this.healthBottom, 0, element.height - this.healthBottom.height);
       
        // Get measurements
        var space = element.height - this.healthTop.height - this.healthBottom.height;
        var blocks = Math.floor(space / (this.healthBlue.height + 4));
        if (blocks < 1) {
            blocks = 1;
        }
        var margin = Math.floor((space - blocks * this.healthBlue.height) / (blocks + 1));
        var extra = Math.floor((space - blocks * this.healthBlue.height - margin * (blocks + 1)) / 2);
        var percent = 100 * this.player.health / this.player.maxHealth;
        var shield = 100 * this.player.currentShield / (this.player.maxHealth * SHIELD_MAX);
        
        // Draw each health box individually
        for (var i = 0; i < blocks; i++) {
            var y = this.healthTop.height + extra + margin + (this.healthBlue.height + margin) * i;
            if (shield * blocks > 100 * (blocks - 1 - i)) {
                canvas.drawImage(this.healthBlue, 0, y);
            }
            else if (percent > 99 - i * 33 / blocks) {
                canvas.drawImage(this.healthGreen, 0, y);
            }
            else if (percent > 66 - i * 33 / blocks) {
                canvas.drawImage(this.healthYellow, 0, y);
            }
            else if (percent > 33 - i * 33 / blocks && percent > 0) {
                canvas.drawImage(this.healthRed, 0, y);
            }
        }
        
        canvas.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Draws the sidebar with the upgrades
    this.DrawSideBar = DrawSideBar;
    function DrawSideBar() {

        // Background
        canvas.fillStyle = "#000000";
        canvas.fillRect(0, 0, SIDEBAR_WIDTH, WINDOW_HEIGHT);

        // Score
        //canvas.drawImage(scoreTitle, 20, 0);
        canvas.font = "50px Flipbash";
        canvas.fillStyle = "#FFFFFF";
        canvas.fillText("Kills", SIDEBAR_WIDTH / 2 - StringWidth("Kills", canvas.font) / 2, 50);
        canvas.fillRect(5, 55, SIDEBAR_WIDTH - 10, 2);
        canvas.fillStyle = "#00FF00"
        canvas.fillText(this.score, (SIDEBAR_WIDTH - StringWidth(this.score, canvas.font)) / 2, 100);
        
        // Boss countdown
        canvas.fillStyle = "#FFFFFF";
        canvas.fillText("Boss", SIDEBAR_WIDTH / 2 - StringWidth("Boss", canvas.font) / 2, 160);
        canvas.fillRect(5, 165, SIDEBAR_WIDTH - 10, 2);
        canvas.fillStyle = "#00FF00"
        canvas.fillText(this.bossScore, (SIDEBAR_WIDTH - StringWidth(this.bossScore, canvas.font)) / 2, 210);
        
        canvas.font = "30px Flipbash";
        
        var space = element.height - 220;
        var margin = Math.floor((space - 4 * 120) / 5);
        var extra = Math.floor((space - 480 - margin * 5) / 2) + 220;
        var interval = 120 + margin;
        
        // Laser upgrades
        var lasers = this.player.laser;
        if (lasers >= MAX_DROPS) {
            lasers = "Max";
        }
        canvas.drawImage(this.imgLaser, 10, margin + extra);
        canvas.fillText(lasers, 50 - StringWidth(lasers, canvas.font) / 2, margin + extra + 110);
        
        // Spread upgrades
        var spread = Math.round(2 * this.player.spread);
        if (spread >= MAX_DROPS) {
            spread = "Max";
        }
        canvas.drawImage(this.imgSpread, 110, margin + extra);
        canvas.fillText(spread, 150 - StringWidth(spread, canvas.font) / 2, margin + extra + 110);
        
        // Flamethrower upgrades
        var flamethrower = this.player.flamethrower;
        if (flamethrower >= MAX_DROPS) {
            flamethrower = "Max";
        }
        canvas.drawImage(this.imgFire, 10, margin + extra + interval);
        canvas.fillText(flamethrower, 50 - StringWidth(flamethrower, canvas.font) / 2, margin + extra + interval + 110);
        
        // Shield upgrade
        var shield = this.player.shield;
        if (shield >= MAX_DROPS) {
            shield = "Max";
        }
        canvas.drawImage(this.imgShield, 110, margin + extra + interval);
        canvas.fillText(shield, 150 - StringWidth(shield, canvas.font) / 2, margin + extra + interval + 110);
        
        // Damage upgrade
        var damage = Math.round((this.playerDamage - 1) / DAMAGE_UP);
        canvas.drawImage(this.imgDamage, 10, margin + extra + 2 * interval);
        canvas.fillText(damage, 50 - StringWidth(damage, canvas.font) / 2, margin + extra + 2 * interval + 110);
        
        // Speed upgrade
        var speed = Math.round((this.player.speed - PLAYER_SPEED) / (SPEED_UP * this.spdScale));
        if (speed >= MAX_DROPS) {
            speed = "Max";
        }
        canvas.drawImage(this.imgSpeed, 110, margin + extra + 2 * interval);
        canvas.fillText(speed, 150 - StringWidth(speed, canvas.font) / 2, margin + extra + 2 * interval + 110);
        
        // Health upgrade
        var health = Math.round((this.player.maxHealth - PLAYER_HEALTH) / HEALTH_UP);
        canvas.drawImage(this.imgHealth, 10, margin + extra + 3 * interval);
        canvas.fillText(health, 50 - StringWidth(health, canvas.font) / 2, margin + extra + 3 * interval + 110);
        
        // Heal
        canvas.drawImage(this.imgHeal, 110, margin + extra + 3 * interval);
        canvas.fillText(this.healCount, 150 - StringWidth(this.healCount, canvas.font) / 2, margin + extra + 3 * interval + 110);
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
            
            // Get a spawn point off of the screen
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