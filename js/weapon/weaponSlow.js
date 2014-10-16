// A gun that fires slowing bullets
//
// Required data values:
//      damage - how much damage the gun does
//       range - range of the gun
//        rate - the delay between shots
//  multiplier - the speed multiplier for the slow
//    duration - the duration of the slow
//
// Optional data values:
//     spread - the spread of the gun
//     sprite - the sprite used by the gun (default 'bullet')
//      delay - the delay before firing when in range (optional)
//     pierce - whether or not to fire piercing bullets
//      speed - speed of the bullets
//  offScreen - whether or not the bullet can go off screen
//         dx - horizontal offset for the bullet spawn location
//         dy - vertical offset for the bullet spawn location
//      angle - max angle of deviation from a straight shot
function EnemyWeaponSlow(data) {

    // Initialize data
    if (data.delayTimer === undefined) {
        data.delayTimer = 0;
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
        if (data.angle) {
            vel.Rotate((Rand(2 * data.angle + 1) - data.angle) * Math.PI / 180);
        }
        var bullet = SlowProjectile(
            data.sprite || GetImage('bullet'),
            this,
            data.dx,
            data.dy, 
            vel.x, 
            vel.y, 
            this.angle,
            data.damage, 
            data.range * 1.5, 
            data.pierce,
            data.offScreen,
            data.multiplier,
            data.duration
        );
        data.list.push(bullet);
        if (data.spread) {
            bullet.Spread(data.spread, data.list);
        }
        data.cd = data.rate;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0) {
        data.cd--;
    }
}