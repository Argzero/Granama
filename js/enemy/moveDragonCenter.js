// Moves the enemy towards the player to their preferred range
function EnemyMoveDragonCenter() {

    // Turn towards the player or the center if too close to an edge
    var target = {x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2};

    // Update the angle/cos/sin values if necessary
    this.angle = AngleTowards(target, this, this.speed / 300.0);

    // Update the trig values
    this.cos = -Math.sin(this.angle);
    this.sin = Math.cos(this.angle);

    // Move forward
    this.x += this.cos * this.speed;
    this.y += this.sin * this.speed;
}