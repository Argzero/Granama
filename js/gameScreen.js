function GameScreen(bossRush) {

    this.scrollX = 0;
    this.scrollY = 0;
    this.score = 0;
    this.gameOver = false;
    
    this.damageOverlay = GetImage("damage");
    this.explosions = new Array();
    
    this.damageAlpha;
    this.paused = undefined;
    this.music;
    this.dropManager = new DropManager(this);
    this.enemyManager = new EnemyManager(this);
    this.ui = new UIManager(this);
    this.playerMinX = 0;
    this.playerMinY = 0;
    this.playerMaxX = 9999;
    this.playerMaxY = 9999;
    this.pads = [
        HealingPad(GAME_WIDTH / 3, GAME_HEIGHT / 3), 
        HealingPad(GAME_WIDTH * 2 / 3, GAME_HEIGHT / 3), 
        HealingPad(GAME_WIDTH / 3, GAME_HEIGHT * 2 / 3), 
        HealingPad(GAME_WIDTH * 2 / 3, GAME_HEIGHT * 2 / 3)
    ];
    
    // Update function
    this.Update = function() {

        this.UpdateMusic();

        var doc = document.documentElement, body = document.body;
        pageScrollX = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
        pageScrollY = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
        
        // Update when not paused
        playerManager.update(this.paused);
        if (!this.paused) {
            this.enemyManager.UpdateEnemies();
        
			if (bossRush) {
                this.enemyManager.CheckBosses();
            }
            else {
                this.enemyManager.CheckSpawns();
            }
            
            // Update healing pads
            for (var i = 0; i < this.pads.length; i++) {
                this.pads[i].update();
            }
		
            this.UpdateBullets();
            this.dropManager.Update();
            
            this.ApplyScrolling();
        }
        
        // Check for losing
        for (var i = 0; i < playerManager.players.length; i++) {
            if (playerManager.players[i].robot.health > 0) return;
        }
        this.gameOver = true;
    };
	
	// Pauses the game
	this.Pause = function(player) {
		if (this.paused) {
			if (this.paused == player) {	
				this.paused = undefined;
			}
		}
		else {
			this.paused = player;
		}
	};

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
        
        for (var i = 0; i < this.pads.length; i++) {
            this.pads[i].draw();
        }
        
        // Players
        for (var i = 0; i < playerManager.players.length; i++) {    
            var player = playerManager.players[i].robot;
            player.Draw(canvas);
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
        if (this.paused && this.paused !== true) {
            //canvas.drawImage(this.pauseOverlay, SIDEBAR_WIDTH, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
            canvas.globalAlpha = 0.65;
            canvas.fillStyle = 'black';
            canvas.fillRect(SIDEBAR_WIDTH, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
            canvas.globalAlpha = 1;
            canvas.fillStyle = 'white';
            canvas.font = '48px Flipbash';
            canvas.textAlign = 'center';
            canvas.fillText('Paused By', WINDOW_WIDTH / 2 + SIDEBAR_WIDTH, WINDOW_HEIGHT / 2 - 50);
            canvas.fillStyle = this.paused.color;
            canvas.fillText(this.paused.name, WINDOW_WIDTH / 2 + SIDEBAR_WIDTH, WINDOW_HEIGHT / 2 + 20);
        }
        
        this.ui.DrawStatBar();
        
        if (bossRush) {
            this.ui.DrawDroneInfo();
        }
		
		// Draw the upgrade screen if applicable
		if (this.paused == true) {
			this.ui.DrawUpgradeUI();
		}
        
        // Draw the cursor
        canvas.setTransform(1, 0, 0, 1, 0, 0);
        canvas.drawImage(cursor, mx - element.offsetLeft + pageScrollX - cursor.width / 2, my - element.offsetTop + pageScrollY - cursor.height / 2);
    }

    // Updates bullets, checking for collisions
    this.UpdateBullets = UpdateBullets;
    function UpdateBullets() {

        this.enemyManager.UpdateBullets();
        
        // Update bullets for each player
        for (var p = 0; p < playerManager.players.length; p++) {
        
            var player = playerManager.players[p].robot;
        
            // Check for collisions between the player's bullets and enemies
            for (var i = 0; i < player.bullets.length; i++) {
            
                // Colliding with turrets
                for (var j = 0; j < this.enemyManager.turrets.length; j++) {
                    var turret = this.enemyManager.turrets[j];
                    if (player.bullets[i].Collides(turret)) {
                        player.bullets[i].Hit(turret);
                        
                        // See if the turret is destroyed
                        if (turret.health <= 0) {
                            this.explosions[this.explosions.length] = new Explosion(turret.x, turret.y, 0.25);
                            this.enemyManager.turrets.splice(j, 1);
                            j--;
                        }
                        
                        // If the bullet is not a piercing bullet, remove it
                        if (!player.bullets[i].pierce) {
                            player.bullets.splice(i, 1);
                            i--;
                            break;
                        }
                    }
                }
                
                // Regular enemy collision
                for (var j = 0; j < this.enemyManager.enemies.length; j++) {
                
                    // See if the bullet hit the enemy
                    if (player.bullets[i].Collides(this.enemyManager.enemies[j])) {
                        
                        player.bullets[i].Hit(this.enemyManager.enemies[j]);
                        
                        // If the bullet is not a piercing bullet, remove it
                        if (!player.bullets[i].pierce) {
                            player.bullets.splice(i, 1);
                            i--;
                            break;
                        }
                    }
                }
            }
        }
            
        this.enemyManager.CheckDeaths();
    }

    // Applies scrolling to the game
    this.ApplyScrolling = ApplyScrolling;
    function ApplyScrolling() {

        // Get the average player position
        var minX = 9999;
        var minY = 9999;
        var maxX = 0;
        var maxY = 0;
        for (var i = 0; i < playerManager.players.length; i++) {    
            var r = playerManager.players[i].robot;
            if (r.health <= 0) continue;
            if (r.x < minX) minX = r.x;
            if (r.x > maxX) maxX = r.x;
            if (r.y < minY) minY = r.y;
            if (r.y > maxY) maxY = r.y;
        }
        if (minX != 9999) {
            var avgX = (maxX + minX) / 2;
            var avgY = (maxY + minY) / 2;
            
            // Scroll bounds
            this.scrollX = clamp(avgX - WINDOW_WIDTH / 2, 0, GAME_WIDTH - WINDOW_WIDTH);
            this.scrollY = clamp(avgY - WINDOW_HEIGHT / 2, 0, GAME_HEIGHT - WINDOW_HEIGHT);
            
            // player bounds
            this.playerMinX = Math.max(0, Math.min(avgX - WINDOW_WIDTH / 2, this.scrollX) + 100);
            this.playerMinY = Math.max(0, Math.min(avgY - WINDOW_HEIGHT / 2, this.scrollY) + 100);
            this.playerMaxX = Math.min(GAME_WIDTH, Math.max(avgX + WINDOW_WIDTH / 2, this.scrollX + WINDOW_WIDTH) - 100);
            this.playerMaxY = Math.min(GAME_HEIGHT, Math.max(avgY + WINDOW_HEIGHT / 2, this.scrollY + WINDOW_HEIGHT) - 100);
        }
        
        // Apply the scroll amount to the mouse coordinates
        mouseX = mx + this.scrollX - SIDEBAR_WIDTH - element.offsetLeft + pageScrollX;
        mouseY = my + this.scrollY - element.offsetTop + pageScrollY;
    }

    // Updates the music depending on the state of the game
    this.UpdateMusic = UpdateMusic;
    function UpdateMusic() {

        // Player must be alive for the music to play
        if (!this.gameOver) {
        
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
            var newVolume = this.music.volume - 0.002;
            if (newVolume <= 0) {
                this.music.pause();
                this.music = false;
                
                // Move to the end screen
                endScreen.setup(this);
                gameScreen = endScreen;
            }
            else {
                this.music.volume = newVolume;
            }
        }
    }
}