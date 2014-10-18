// Moves the enemy towards the player to their preferred range
function EnemyMoveMedic() {

    // Turn towards the nearest damaged enemy, ignoring faster units and
    // prioritizing non-healers
	var target, dSq;
	for (var i = 0; i < gameScreen.enemyManager.enemies.length; i++) {
		var e = gameScreen.enemyManager.enemies[i];
		if (e == this || e.health >= e.maxHealth || e.speed > this.speed) continue;
		var temp = DistanceSq(e.x, e.y, this.x, this.y);
		if (!dSq || ((!e.heal || target.heal) && temp < dSq)) {
            dSq = temp;
            target = e;
		}
	}
    
    // Run from nearest player if no enemies can be healed
	if (!target) {
        if (!this.backup || DistanceSq(this.x, this.y, this.backup.x, this.backup.y) < Sq(this.range + 100)) {
            this.backup = { x: Rand(GAME_WIDTH), y: Rand(GAME_HEIGHT) };
        }
        target = this.backup;
    }
    
    // Heal the enemy if close enough
    else if (dSq <= Sq(this.range + 10)) {
        target.health += this.heal;
        if (target.health > target.maxHealth) {
            target.health = target.maxHealth;
        }
    }
    
    this.angle = AngleTowards(target, this, this.speed / 50.0);
    
    // Update the angle values
    this.cos = -Math.sin(this.angle);
    this.sin = Math.cos(this.angle);
    
    // Get the direction to move
    var m = 1;
    if (this.cos * (target.x - this.x) + this.sin * (target.y - this.y) < 0) {
        m = -1;
    }
    
    // Move the enemy to their preferred range
    var speed = this.speed;
    if (this.speedMDuration) {
        speed *= this.speedM;
    }
    var dSq = Sq(this.x - target.x) + Sq(this.y - target.y);
    if (dSq - Sq(this.range + speed) > 0) {
        this.x += m * this.cos * speed;
        this.y += m * this.sin * speed;
    }
    else if (dSq - Sq(this.range - speed) < 0) {
        this.x -= m * this.cos * speed / 3;
        this.y -= m * this.sin * speed / 3;
    }
}