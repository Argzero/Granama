depend('lib/math');
depend('lib/2d/vector');

extend('Projectile', 'Sprite');
function Projectile(name, x, y, shooter, gun, speed, angle, damage, range, pierce, target) {
	this.super(name, x, y);
	
	this.shooter = shooter;
	this.rotation = gun.rotation.clone().rotateAngle(angle);
	this.vel = this.rotation.clone().multiply(speed);
	this.damage = damage;
	this.range = range;
	this.pierce = pierce;
	this.target = target;
	this.expired = false;
	
	this.pos.rotatev(gun.rotation);
	this.pos.addv(gun.pos);
	this.origin = this.pos.clone();
}

Projectile.prototype.update = function() {
	
	// Movement
	this.movev(this.vel);
	
	// Range limit
	if (this.origin.distanceSq(this.pos) >= this.range * this.range) {
		this.expired = true;
	}
	
	// Special updates
	if (this.onUpdate) {
		this.onUpdate();
	}
};