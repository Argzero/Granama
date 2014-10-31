// A basic gun that fires regular bullets
//
// Required data values:
//     damage - how much damage the gun does
//      range - range of the gun
//       rate - the delay between shots
//  knockback - amount of knockback of the rocket
//     radius - radius of the explosion
//
// Optional data values:
//  sprite - the sprite used by the gun (default 'bullet')
//   delay - the delay before firing when in range (optional)
//   speed - speed of the bullets
//      dx - horizontal offset for the bullet spawn location
//      dy - vertical offset for the bullet spawn location
//    type - type of explosion from the rocket
function EnemyWeaponHomingRocket(data) {

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
		//sprite, source x, y, velX, velY, angle, damage, range, radius, knockback, lists
        var m = data.dx < 0 ? 1 : -1;
        var rocket = HomingRocketProjectile(
            data.sprite,
            this,
            playerManager.getClosest(this.x, this.y),
            data.dx,
            data.dy, 
            HALF_RT_2 * (data.speed || BULLET_SPEED) * (this.cos - m * this.sin), 
            HALF_RT_2 * (data.speed || BULLET_SPEED) * (this.sin + m * this.cos), 
            this.angle,
            data.damage, 
            data.range * 1.5, 
			data.radius,
            data.knockback,
			data.type || 'Enemy',
            [playerManager.getRobots()]        
        );
        data.list.push(rocket);
        data.cd = data.rate;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0) {
        data.cd--;
    }
}