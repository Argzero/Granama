// Moves the enemy towards the player to their preferred range
function EnemyMoveDragonCenter() {

    // Turn towards the player or the center if too close to an edge
    var target = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
    
    // Update the angle/cos/sin values if necessary
    var a = Math.atan((target.y - this.y) / (this.x - target.x));
    if (this.x < target.x) {
        a = -HALF_PI - a;
    }
    else {
        a = HALF_PI - a;
    }
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    var dot = this.sin * dx + -this.cos * dy;
    if (dot > 0) {
        while (a > this.angle) {
            a -= 2 * Math.PI;
        }
        this.angle -= this.speed / 300.0;
        if (this.angle < a) {
            this.angle = a;
        }
    }
    else {
        while (a < this.angle) {
            a += 2 * Math.PI;
        }
        this.angle += this.speed / 300.0;
        if (this.angle > a) {
            this.angle = a;
        }
    }
    
    // Update the trig values
    this.cos = -Math.sin(this.angle);
    this.sin = Math.cos(this.angle);
        
    // Move forward
    this.x += this.cos * this.speed;
    this.y += this.sin * this.speed;
}