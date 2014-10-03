var MAX_BOSS_INTERVAL = 40;
var BOSS_SPAWN_INTERVAL = 180;

function BossRush(player) {

    this.scrollX = 0;
    this.scrollY = 0;
    this.score = 0;
    this.healCount = 0;
    this.dmgScale = 1;
    this.hpScale = 1;
    this.spdScale = 1;
    
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
    this.droneImgs = [
        GetImage('droneAssaulter'),
        GetImage('droneHealer'),
        GetImage('droneShielder')
    ];
    
    this.damageAlpha;
    this.bossActive = false;
    this.paused = false;
    this.dragonActive = false;
    this.bossHealthMultiplier = 1.0;
    this.bossDmgMultiplier = 1.0;
    this.bossSpeedBonus = 0;
    this.bossCount = 0;
    this.playerDamage = 1.0;
    this.spawnCd = SPAWN_RATE;
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
        var i;
        if (tile && tile.width) {
            for (i = 0; i < WINDOW_WIDTH / tile.width + 1; i++) {
                var x = i * tile.width - this.scrollX % tile.width;
                for (var j = 0; j < WINDOW_HEIGHT / tile.height + 1; j++) {
                    canvas.drawImage(tile, x, j * tile.height - this.scrollY % tile.height);
                }
            }
        }
        
        // Apply scroll offsets
        canvas.translate(-this.scrollX, -this.scrollY);
        
        // Drops
        for (i = 0; i < this.drops.length; i++) {
            this.drops[i].Draw(canvas);
        }
        
        // Mines
        for (i = 0; i < this.mines.length; i++) {
            this.mines[i].Draw(canvas);
        }
        
        // Turrets
        for (i = 0; i < this.turrets.length; i++) {
            this.turrets[i].Draw(canvas);
        }
        
        // Player
        if (this.player.health > 0) {
            this.player.Draw(canvas);
        }
        
        // Enemies
        for (i = 0; i < this.enemies.length; i++) {
            this.enemies[i].Draw(canvas);
        }
        
        // Enemy bullets
        for (i = 0; i < this.bullets.length; i++) {
            this.bullets[i].Draw(canvas);
        }
        
        // Explosions
        for (i = 0; i < this.explosions.length; i++) {
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
                
                // Power up enemies when a boss is defeated
                this.bossCount++;
                this.bossDmgMultiplier = ((this.score / 8 + 1) / 2) * (this.score / 8 + 2);
                this.bossSpeedBonus = this.bossSpeedBonus = BOSS_SPEED_SCALE * (this.bossCount > 40 ? 5 : this.bossCount / 8);
                if (this.bossCount > 32) {
                    this.bossHealthMultiplier = Math.pow(2, 4 + this.score / 8);
                }
                else {
                    this.bossHealthMultiplier = Math.pow(2, this.score / 4 + (this.score > 24 ? 2 : 1));
                }
                
                this.explosions[this.explosions.length] = new Explosion(this.enemies[i].x, this.enemies[i].y, this.enemies[i].sprite.width / 150);
            
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
        
        // Drone countdown
        canvas.fillStyle = '#FFFFFF';
        canvas.font = '30px Flipbash';
        if (player.drones.length < 6) {
            var droneImg = this.droneImgs[player.drones.length % 3];
            canvas.drawImage(droneImg, (UI_WIDTH - droneImg.width) / 2, 55 - droneImg.height / 2);
            var left = player.droneTarget - player.droneCounter;
            canvas.fillText(left, (UI_WIDTH - StringWidth(left, canvas.font)) / 2, 65);
        }
        else canvas.fillText("MAX", (UI_WIDTH - StringWidth("MAX", canvas.font)) / 2, 65);
        
        // Top and bottom images
        canvas.drawImage(this.healthTop, 0, 110);
        canvas.drawImage(this.healthBottom, 0, element.height - this.healthBottom.height);
       
        // Get measurements
        var space = element.height - this.healthTop.height - this.healthBottom.height - 110;
        var blocks = Math.floor(space / (this.healthBlue.height + 4));
        if (blocks < 1) {
            blocks = 1;
        }
        var margin = Math.floor((space - blocks * this.healthBlue.height) / (blocks + 1));
        var extra = Math.floor((space - blocks * this.healthBlue.height - margin * (blocks + 1)) / 2) + 110;
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
        
        canvas.font = "30px Flipbash";
        
        var space = element.height - 110;
        var margin = Math.floor((space - 4 * 120) / 5);
        var extra = Math.floor((space - 480 - margin * 5) / 2) + 110;
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
        
        if (this.spawnCd <= 0 && this.enemies.length < Math.floor(1 + this.score / MAX_BOSS_INTERVAL)) {
            this.spawnCd = BOSS_SPAWN_INTERVAL;

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
            
            var bossId = (this.score + this.enemies.length) % 4;
            if (bossId == BOSS_HEAVY) {
                this.enemies[this.enemies.length] = new HeavyBoss(x, y);
            }
            else if (bossId == BOSS_FIRE) {
                this.enemies[this.enemies.length] = new FireBoss(x, y);
            }
            else if (bossId == BOSS_PUNCH) {
                this.enemies[this.enemies.length] = new PunchBoss(x, y);
            }
            else if (bossId == BOSS_RUSH_DRAGON) {
                this.enemies[this.enemies.length] = new DragonBoss(x, y);
            }
        }
        else if (this.spawnCd > 0) this.spawnCd--;
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