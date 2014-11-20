// Moves the enemy towards the player to their preferred range
function EnemyMoveDragon() {

    // Turn towards the player or the center if too close to an edge
    var target;
    var padding = 400;
    if (this.x < padding || this.x > GAME_WIDTH - padding || this.y < padding || this.y > GAME_HEIGHT - padding) {
        target = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
    }
    else {
        var player = playerManager.getClosest(this.x, this.y);
        if (DistanceSq(this.x, this.y, player.x, player.y) > (this.turnRange || 160000)) {
            target = player;
        }
    }
    
    // Update the angle/cos/sin values if necessary
    if (target) {
		this.angle = AngleTowards(target, this, this.speed / 300.0);
        
        // Update the trig values
        this.cos = -Math.sin(this.angle);
        this.sin = Math.cos(this.angle);
    }
    
    // Move forward
    this.x += this.cos * this.speed;
    this.y += this.sin * this.speed;
}