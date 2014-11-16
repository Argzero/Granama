// Moves the enemy towards the player to their preferred range
function EnemyMoveCharge() {

	// When charging, keep moving forward
	if (this.charging) {
		this.charging--;
		this.x += this.cos * this.speed * 2;
        this.y += this.sin * this.speed * 2;
		
		// Stop charging when reaching the edge of the map
		if (this.x < this.sprite.width / 2 
				|| this.x > GAME_WIDTH - this.sprite.width / 2
				|| this.y < this.sprite.height / 2
				|| this.y > GAME_HEIGHT - this.sprite.height / 2) {
			this.charging = 0;
		}
	
		// Collision
		for (var i = 0; i < playerManager.players.length; i++) {
			var player = playerManager.players[i].robot;
			if (player.health > 0 && BulletCollides(this, player)) {
                var direction = Vector(player.x - this.x, player.y - this.y);
                var dot = this.sin * direction.x - this.cos * direction.y;
				if (dot > 0) {
                    player.Knockback(this.sin * this.distance, -this.cos * this.distance);
                }
                else {
                    player.Knockback(-this.sin * this.distance, this.cos * this.distance);
                }
				player.Damage(this.damage, this);
			}
		}
	}
	
	// Normal movement otherwise
	else {
	
		// Turn towards the player
		var player = playerManager.getClosest(this.x, this.y);
		this.angle = AngleTowards(player, this, this.speed / this.turnDivider);
		var exactAngle = AngleTo(player, this);
		
		// Update the angle values
		this.cos = -Math.sin(this.angle);
		this.sin = Math.cos(this.angle);
		
		// Get the direction to move
		var m = 1;
		if (this.cos * (player.x - this.x) + this.sin * (player.y - this.y) < 0) {
			m = -1;
		}
		
		// Move the enemy to their preferred range
		var speed = this.speed;
		if (this.speedMDuration) {
			speed *= this.speedM;
		}
		var dSq = Sq(this.x - player.x) + Sq(this.y - player.y);
		if (dSq - Sq(this.range + speed) > 0) {
			this.x += m * this.cos * speed;
			this.y += m * this.sin * speed;
		}
		
		// Start charging when close enough and looking in their general direction
		else {
			var da = Math.abs(this.angle - exactAngle);
			if (da < Math.PI / 36  || da > 71 * Math.PI / 36) {
				this.charging = this.chargeDuration;
			}
		}
	}
}