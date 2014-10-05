// Moves the enemy towards the player to their preferred range
function EnemyMoveBasic() {

    // Turn towards the player
    var dx = gameScreen.player.x - this.x;
    var dy = gameScreen.player.y - this.y;
    var dot = this.sin * dx + -this.cos * dy;
    if (dot > 0) {
        this.angle -= this.speed / 100.0;
    }
    else {
        this.angle += this.speed / 100.0;
    }
    
    // Update the angle values
    this.cos = -Math.sin(this.angle);
    this.sin = Math.cos(this.angle);
    
    // Get the direction to move
    var m = 1;
    if (this.cos * dx + this.sin * dy < 0) {
        m = -1;
    }
    
    // Move the enemy to their preferred range
    var dSq = Sq(this.x - gameScreen.player.x) + Sq(this.y - gameScreen.player.y);
    if (dSq - Sq(this.range + this.speed) > 0) {
        this.x += m * this.cos * this.speed;
        this.y += m * this.sin * this.speed;
    }
    else if (dSq - Sq(this.range - this.speed) < 0) {
        this.x -= m * this.cos * this.speed;
        this.y -= m * this.sin * this.speed;
    }
}