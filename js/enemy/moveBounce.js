// Moves the enemy towards the player to their preferred range
function EnemyMoveBounce() {

	// Movement
	var speed = this.speed;
    if (this.speedMDuration) {
        speed *= this.speedM;
    }
	this.x += this.direction.x * speed;
    this.y += this.direction.y * speed;
	
	// Looking direction
	var player = playerManager.getClosest(this.x, this.y);
	var a = Math.atan((player.y - this.y) / (this.x - player.x));
	if (this.x < player.x) {
		this.angle = -HALF_PI - a;
	}
	else {
		this.angle = HALF_PI - a;
	}
	
	// Bounds
	if (this.x - this.sprite.width / 2 <= 0) {
		this.direction.x = Math.abs(this.direction.x);
	}
	if (this.x + this.sprite.width / 2 >= GAME_WIDTH) {
		this.direction.x = -Math.abs(this.direction.x);
	}
	if (this.y - this.sprite.height / 2 < 0) {
		this.direction.y = Math.abs(this.direction.y);
	}
	if (this.y + this.sprite.height / 2 > GAME_HEIGHT) {
		this.direction.y = -Math.abs(this.direction.y);
	}
	
	// Collision
	for (var i = 0; i < playerManager.players.length; i++) {
		var player = playerManager.players[i].robot;
		if (player.health > 0 && BulletCollides(this, player)) {
			this.direction = Vector(this.x - player.x, this.y - player.y);
			this.direction.SetLength(1);
			player.Damage(this.damage, this);
			
			var knockback = Vector(-this.direction.x, -this.direction.y);
			knockback.x *= this.distance;
			knockback.y *= this.distance;
			player.Knockback(knockback.x, knockback.y);
		}
	}
}