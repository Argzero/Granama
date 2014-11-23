// Moves the enemy towards the player to their preferred range
function EnemyMoveOrbit() {

    // Move normally if not in the preferred range
    var player = playerManager.getClosest(this.x, this.y);
    var ds = DistanceSq(this.x, this.y, player.x, player.y);
    var tooFar = ds > Sq(this.range + 100);
    var tooClose = ds < Sq(this.range - 100);

    // Turn towards the player
    var dx = player.x - this.x;
    var dy = player.y - this.y;
    var d1 = this.sin * dx + -this.cos * dy;
    var d2 = this.cos * dx + this.sin * dy;

    // Turn in the correct direction
    var turnSpeed = this.speed / 100.0;
    if (tooFar && d1 > 0) {
        this.angle -= turnSpeed;
    }
    else if (tooFar) {
        this.angle += turnSpeed;
    }
    else if (tooClose && d1 > 0) {
        this.angle += turnSpeed;
    }
    else if (tooClose) {
        this.angle -= turnSpeed;
    }
    else if (d1 * d2 > 0) {
        this.angle += turnSpeed;
    }
    else {
        this.angle -= turnSpeed;
    }

    // Update the angle values
    this.cos = -Math.sin(this.angle);
    this.sin = Math.cos(this.angle);

    // Move forward
    var speed = this.speed;
    if (this.speedMDuration) {
        speed *= this.speedM;
    }
    if (tooClose && d2 > 0) {
        this.x -= this.cos * speed;
        this.y -= this.sin * speed;
    }
    else {
        this.x += this.cos * speed;
        this.y += this.sin * speed;
    }
}