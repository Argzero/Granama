// Moves the enemy towards the player to their preferred range
function EnemyMoveMedic() {

    // Turn towards the nearest damaged enemy
	var target, dSq;
	for (var i = 0; i < gameScreen.enemyManager.enemies.length; i++) {
		var e = gameScreen.enemyManager.enemies[i];
		if (e.health >= e.maxHealth) continue;
		var temp = DistanceSq(e.x, e.y, this.x, this.y);
		if (!dSq || temp < dSq) {
			dSq = temp;
			target = e;
		}
	}
	//if (!target) target = { x: this.x + this.cos, y: this.y };
    this.angle = AngleTowards(target, this, this.speed / 50.0);
    
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
    else if (dSq - Sq(this.range - speed) < 0) {
        this.x -= m * this.cos * speed / 3;
        this.y -= m * this.sin * speed / 3;
    }
}