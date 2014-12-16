// Moves the enemy towards the player to their preferred range
function EnemyMoveRotate() {

	this.angle += this.rotateSpeed || Math.PI / 360;
	this.cos = -Math.sin(this.angle);
    this.sin = Math.cos(this.angle);
}