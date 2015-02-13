depend('draw/camera');
depend('screen/gameUI');
depend('robot/pad');

/**
 * Represents the arcade mode game screen
 *
 * @constructor
 */
function GameScreen() {

    this.score = 0;
    this.bossScore = 0;
    this.bossId = 0;
    this.gameOver = false;

    this.damageOverlay = GetImage("damage");

    this.damageAlpha;
    this.paused = undefined;
    this.music;
    this.playerMinX = 0;
    this.playerMinY = 0;
    this.playerMaxX = 9999;
    this.playerMaxY = 9999;
	this.scrollX = 0;
	this.scrollY = 0;
    this.pads = [
		new HealingPad(GAME_WIDTH / 3, GAME_HEIGHT / 3),
        new HealingPad(GAME_WIDTH * 2 / 3, GAME_HEIGHT / 3),
        new HealingPad(GAME_WIDTH / 3, GAME_HEIGHT * 2 / 3),
        new HealingPad(GAME_WIDTH * 2 / 3, GAME_HEIGHT * 2 / 3)
	];
    this.particles = [];
	this.bullets = [];
	this.robots = players.slice(0);
	
	GAME_WIDTH = 3000;
	GAME_HEIGHT = 3000;
	WINDOW_WIDTH = camera.canvas.width - SIDEBAR_WIDTH;
	WINDOW_HEIGHT = camera.canvas.height;
}

/**
 * Updates the screen, updating all robots, turretes, bullets, etc.
 */
GameScreen.prototype.update = function() {

	var doc = document.documentElement, body = document.body;
	pageScrollX = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
	pageScrollY = (doc && doc.scrollTop || body && body.scrollTop || 0);

	// Update when not paused
	if (!this.paused) {
	
		// Update robots
		for (var i = 0; i < this.robots.length; i++)
		{
			this.robots[i].update();
		}
	
		// Update bullets
		for (var i = 0; i < this.bullets.length; i++) {
			this.bullets[i].update();
            for (var j = 0; j < this.robots.length; j++) {
                var r = this.robots[j];
                if (this.bullets[j].isHitting(r)) {
                    this.bullets[j].hit(r);
                }
            }
			if (this.bullets[i].expired) {
				this.bullets.splice(i, 1);
				i--;
			}
		}
	
		// Update healing pads
		for (var i = 0; i < this.pads.length; i++) {
			this.pads[i].update();
		}

		// Update the scroll position
		this.applyScrolling();
	}

	// Check for losing
	for (var i = 0; i < players.length; i++) {
		if (players[i].health > 0) return;
	}
	if (!this.gameOver) {
		this.gameOver = true;

		for (var i = 0; i < players.length; i++) {
			var p = players[i];
			p.profile.setBest(p.name, STAT.BEST_SCORE, this.score);
			p.profile.addList(p.name, STAT.LAST_10, 10, this.score);
		}
	}
};

GameScreen.prototype.pause = function(player) {
	if (this.paused) {
		if (this.paused == player) {
			this.paused = undefined;
		}
	}
	else {
		this.paused = player;
	}
};

GameScreen.prototype.draw = function() {

	camera.moveTo(SIDEBAR_WIDTH + this.scrollX, this.scrollY);
	ui.drawBackground();

	// Apply scroll offsets
	controls.setOffset(this.scrollX + SIDEBAR_WIDTH, this.scrollY);

	// Draw healing pads
	for (var i = 0; i < this.pads.length; i++) {
		this.pads[i].draw(camera);
	}

	// Pre-draw
	for (var i = 0; i < this.robots.length; i++) {
		var r = this.robots[i];
		if (r.onPreDraw) {
			r.onPreDraw(camera);
		}
	}
	
	// Draw sprites
	for (var i = 0; i < this.robots.length; i++) {
		this.robots[i].draw(camera);
	}
	
	// Post-draw
	for (var i = 0; i < this.robots.length; i++) {
		var r = this.robots[i];
		if (r.onPostDraw) {
			r.onPostDraw(camera);
		}
	}

	// Bullets
	for (var i = 0; i < this.bullets.length; i++) {
		this.bullets[i].draw(camera);
	}
	
	// Particles
	for (var i = 0; i < this.particles.length; i++) {
		this.particles[i].draw();
		if (this.particles[i].expired) {
			this.particles.splice(i, 1);
			i--;
		}
	}

	// Reset scrolling for UI elements
	camera.moveTo(0, 0);

	// Pause overlay
	if (this.paused && this.paused !== true) {
		ui.drawPauseOverlay(this.paused);
	}

	ui.drawStatBar();

	// Draw the upgrade screen if applicable
	if (this.paused == true) {
		this.ui.drawUpgradeUI();
	}
    
	ui.drawCursor();
};

GameScreen.prototype.applyScrolling = function() {

	// Get the average player position
	var minX = 9999;
	var minY = 9999;
	var maxX = 0;
	var maxY = 0;
	for (var i = 0; i < players.length; i++) {
		var r = players[i];
		if (r.health <= 0) continue;
		if (r.pos.x < minX) minX = r.pos.x;
		if (r.pos.x > maxX) maxX = r.pos.x;
		if (r.pos.y < minY) minY = r.pos.y;
		if (r.pos.y > maxY) maxY = r.pos.y;
	}
	if (minX != 9999) {
		var avgX = (maxX + minX) / 2;
		var avgY = (maxY + minY) / 2;

		// Scroll bounds
		this.scrollX = -clamp(avgX - WINDOW_WIDTH / 2, 0, GAME_WIDTH - WINDOW_WIDTH);
		this.scrollY = -clamp(avgY - WINDOW_HEIGHT / 2, 0, GAME_HEIGHT - WINDOW_HEIGHT);

		// player bounds
		this.playerMinX = Math.max(0, Math.min(avgX - WINDOW_WIDTH / 2, this.scrollX) + 100);
		this.playerMinY = Math.max(0, Math.min(avgY - WINDOW_HEIGHT / 2, this.scrollY) + 100);
		this.playerMaxX = Math.min(GAME_WIDTH, Math.max(avgX + WINDOW_WIDTH / 2, this.scrollX + WINDOW_WIDTH) - 100);
		this.playerMaxY = Math.min(GAME_HEIGHT, Math.max(avgY + WINDOW_HEIGHT / 2, this.scrollY + WINDOW_HEIGHT) - 100);
	}
};

GameScreen.prototype.updateMusic = function() {

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
};