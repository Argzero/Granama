function SpinnerBall() {

	GAME_WIDTH = 1748;
	GAME_HEIGHT = 813;

    this.scrollX = 0;
    this.scrollY = 0;
	
    this.paused = undefined;
    this.music;
    this.ui = new UIManager(this);
    this.playerMinX = 0;
    this.playerMinY = 0;
    this.playerMaxX = 9999;
    this.playerMaxY = 9999;
	this.particles = [];
	this.arena = GetImage("sbArena");
	
	this.spinner = LightBouncerEnemy(GAME_WIDTH / 2, GAME_HEIGHT / 2);
	this.spinner.ApplyMove = EnemyMoveSpinner;
	this.spinner.damage = 0;
	this.spinner.speed = 8;
	this.spinner.direction.x = 0;
	this.spinner.direction.y = 1;
    
    // Update function
    this.Update = function() {

        this.UpdateMusic();

        var doc = document.documentElement, body = document.body;
        pageScrollX = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
        pageScrollY = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
        
        // Update when not paused
        playerManager.update(this.paused);
        if (!this.paused) {
		
			// Update enemies
            this.spinner.Update();
        
			this.UpdateBullets();
		
			// Update the scroll position
            this.ApplyScrolling();
        }
		
		// Check for scoring
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
		canvas.fillStyle = '#444';
		canvas.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        // Apply scroll offsets
        canvas.translate(-this.scrollX, -this.scrollY);
		canvas.drawImage(this.arena, 0, 0);
        
        // Players
        for (var i = 0; i < playerManager.players.length; i++) {    
            var player = playerManager.players[i].robot;
            player.Draw(canvas);
        }
        
		this.spinner.Draw(canvas);
		
        // Particles
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].draw();
            if (this.particles[i].expired) {
                this.particles.splice(i, 1);
                i--;
            }
        }
        
        canvas.translate(this.scrollX, this.scrollY);
        
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
        
		// Draw the upgrade screen if applicable
		if (this.paused == true) {
			this.ui.DrawUpgradeUI();
		}
        
        // Draw the cursor
        if (playerManager.keyboardActive) {
            canvas.setTransform(1, 0, 0, 1, 0, 0);
            canvas.drawImage(cursor, mx - element.offsetLeft + pageScrollX - cursor.width / 2, my - element.offsetTop + pageScrollY - cursor.height / 2);
        }
    }

    // Updates bullets, checking for collisions
    this.UpdateBullets = UpdateBullets;
    function UpdateBullets() {

        // Update bullets for each player
        for (var p = 0; p < playerManager.players.length; p++) {
        
            var player = playerManager.players[p].robot;
        
            // Check for collisions between the player's bullets and enemies
            for (var i = 0; i < player.bullets.length; i++) {
            
                // Regular enemy collision
                for (var j = 0; player.bullets[i] && j < this.enemyManager.enemies.length; j++) {
                
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
    }
	
	// Clamps players inside the bounds of the arena
	this.Clamp = function(player) {
		
		var minY = Math.max(20, this.playerMinY) + player.sprite.height / 2;
		var maxY = Math.min(GAME_HEIGHT - 20, this.playerMaxY) - player.sprite.height / 2;
		player.y = clamp(player.y, minY, maxY);
		
		var minX = Math.max(210, this.playerMinX) + player.sprite.width / 2;
		var maxX = Math.min(GAME_WIDTH - 210, this.playerMaxX) - player.sprite.width / 2;
		player.x = clamp(player.x, minX, maxX);
		
		var br = 135 + player.sprite.width / 2;
		var bx = 210;
		var by = GAME_HEIGHT / 2;
		
		var dx = player.x - bx;
		var dy = player.y - by;
		if (dx * dx + dy * dy < br * br)
		{
			var l = Math.sqrt(dx * dx + dy * dy);
			player.x = bx + dx * br / l;
			player.y = by + dy * br / l;
		}
		
		bx = GAME_WIDTH - bx;
		var dx = player.x - bx;
		var dy = player.y - by;
		if (dx * dx + dy * dy < br * br)
		{
			var l = Math.sqrt(dx * dx + dy * dy);
			player.x = bx + dx * br / l;
			player.y = by + dy * br / l;
		}
	};

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
        return;
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