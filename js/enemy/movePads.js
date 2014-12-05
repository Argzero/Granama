// Moves the enemy towards the player to their preferred range
function EnemyMoveHydraPads() {

	// Get the target pad
	var pad = GetRandomPad(this.x, this.y);
	this.padX = this.padX || pad.x;
	this.padY = this.padY || pad.y;
	var dx = this.x - this.padX;
	var dy = this.y - this.padY;
	if (dx * dx + dy * dy < Sq(this.speed * 2)) {
		
		var occupied = false;
		for (var i = 0; i < gameScreen.enemyManager.turrets.length; i++) {
			var t = gameScreen.enemyManager.turrets[i];
			occupied = occupied || (t.x == this.padX && t.y == this.padY);
		}
		if (!occupied) {
			var turret = new Turret(
				this.padX,
				this.padY,
				this.damageScale,
				125 * ScalePower(gameScreen.enemyManager.bossCount, 1.2) * playerManager.players.length
			);
			turret.sprite = GetImage('padTurretTop');
			turret.base = GetImage('padTurretBase');
			turret.gunData.dy = 50;
			turret.collides = true;
			gameScreen.enemyManager.turrets.push(turret);
		}
	
		this.padX = pad.x;
		this.padY = pad.y;
	}

    // Turn towards the player or the center if too close to an edge
    var target = { x: this.padX, y: this.padY };
    
    // Update the angle/cos/sin values if necessary
    this.angle = AngleTowards(target, this, this.speed / 300.0);
    
    // Update the trig values
    this.cos = -Math.sin(this.angle);
    this.sin = Math.cos(this.angle);
        
    // Move forward
    this.x += this.cos * this.speed;
    this.y += this.sin * this.speed;
}

function GetRandomPad(ex, ey) {
	var x, y;
	do {
		x = (Rand(2) + 1) * GAME_WIDTH / 3;
		y = (Rand(2) + 1) * GAME_HEIGHT / 3;
	}
	while ((ex - x) * (ex - x) + (ey - y) * (ey - y) < Sq(GAME_WIDTH / 8));
	return { x: x, y: y };
}