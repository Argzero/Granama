// Moves the enemy towards the player to their preferred range
function EnemyMoveBasic() {

    // Turn towards the player
    var player = playerManager.getClosest(this.x, this.y);
    this.angle = AngleTowards(player, this, this.speed / this.turnDivider, this.backwards);
    
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