// A basic gun that fires regular bullets
//
// Required data values:
//     damage - how much damage the gun does
//      range - range of the gun
//       rate - the delay between shots
//  knockback - amount of knockback of the rocket
//     radius - radius of the explosion
//      lists - lists containing the targets to AOE onto
//
// Optional data values:
//  sprite - the sprite used by the gun (default 'bullet')
//   delay - the delay before firing when in range (optional)
//   speed - speed of the bullets
//      dx - horizontal offset for the bullet spawn location
//      dy - vertical offset for the bullet spawn location
//    type - type of explosion
//   angle - max angle of deviation from a straight shot
function EnemyWeaponRocket(data) {

    // Initialize data
    if (data.delayTimer === undefined) {
        data.delayTimer = 0;
    }
    if (data.sprite === undefined) {
        data.sprite = GetImage('rocket');
    }
    if (data.dx === undefined) {
        data.dx = 0;
    }
    if (data.dy === undefined) {
        data.dy = 0;
    }

    // Fire when in range and off cooldown
    if (this.IsInRange(data.range) && data.cd <= 0) {
        if (data.delay && data.delayTimer < data.delay) {
            data.delayTimer++;
            return;
        }
        var vel = Vector(this.cos * (data.speed || BULLET_SPEED), this.sin * (data.speed || BULLET_SPEED));
        var bonusAngle = 0;
		if (data.angle) {
			var a = (Rand(2 * data.angle + 1) - data.angle) * Math.PI / 180;
            vel.Rotate(a);
			bonusAngle += a;
        }
		//sprite, source x, y, velX, velY, angle, damage, range, radius, knockback, lists
        var rocket = RocketProjectile(
            data.sprite,
            this,
            data.dx,
            data.dy, 
            vel.x, 
            vel.y, 
            this.angle + bonusAngle,
            data.damage, 
            data.range * 1.5, 
			data.radius,
            data.knockback,
			data.type || 'Enemy',
            data.lists
        );
        data.list.push(rocket);
        data.cd = data.rate;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0) {
        data.cd--;
    }
}