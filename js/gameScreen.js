function GameScreen(player, damageScale, healthScale, speedScale) {

    this.scrollX = 0;
    this.scrollY = 0;
    this.score = 0;
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
    this.music;
    this.player = player;
    this.dropManager = new DropManager(this);
    this.enemyManager = new EnemyManager(this);
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
            this.enemyManager.UpdateEnemies();
        }
        else if (this.player.bullets.length++) {
            this.player.bullets.splice(0, this.player.bullets.length);
        }
        
        this.UpdateBullets();
        this.dropManager.Update();
        
        this.ApplyScrolling();
        this.enemyManager.CheckSpawns();
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
        
        this.dropManager.Draw();
        
        // Player
        if (this.player.health > 0) {
            this.player.Draw(canvas);
        }
        
        this.enemyManager.Draw();
        
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

        this.enemyManager.UpdateBullets();
        
        // Done if the player is dead
        if (this.player.health <= 0) {
            return;
        }
        
        // Check for collisions between the player's bullets and enemies
        for (var i = 0; i < this.player.bullets.length; i++) {
        
            // Colliding with turrets
            for (var j = 0; j < this.enemyManager.turrets.length; j++) {
				var turret = this.enemyManager.turrets[j];
                if (BulletCollides(this.player.bullets[i], turret)) {
                    this.player.bullets[i].Hit(turret);
                    
                    // If the bullet is not a piercing bullet, remove it
                    if (!this.player.bullets[i].pierce) {
                        this.player.bullets.splice(i, 1);
                        i--;
						break;
                    }
                    
                    // See if the turret is destroyed
                    if (turret <= 0) {
                        this.explosions[this.explosions.length] = new Explosion(turret.x, turret.y, 0.25);
                        this.enemyManager.turrets.splice(j, 1);
						j--;
                    }
                }
            }
            
            // Regular enemy collision
            for (var j = 0; j < this.enemyManager.enemies.length; j++) {
            
                // See if the bullet hit the enemy
                if (BulletCollides(this.player.bullets[i], this.enemyManager.enemies[j])) {
                    this.player.bullets[i].Hit(this.enemyManager.enemies[j]);
                    
                    // If the bullet is not a piercing bullet, remove it
                    if (!this.player.bullets[i].pierce) {
                        this.player.bullets.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        }
        
        this.enemyManager.CheckDeaths();
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