var weapon = weapon || {};

// A basic gun that fires regular bullets
//
// Required data values:
//  damage - how much damage the gun does
//   range - range of the gun
//    rate - the delay between shots
//
// Optional data values:
//      spread - the spread of the gun
//      sprite - the sprite used by the gun (default 'bullet')
//       delay - the delay before firing when in range (optional)
//      pierce - whether or not to fire piercing bullets
//       speed - speed of the bullets
//   offScreen - whether or not the bullet can go off screen
//          dx - horizontal offset for the bullet spawn location
//          dy - vertical offset for the bullet spawn location
//       angle - max angle of deviation from a straight shot
// angleOffset - angle offset of the projectile
function EnemyWeaponGun(data) {

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
        var bonusAngle = 0;
        if (data.angle) {
            var a = (Rand(2 * data.angle + 1) - data.angle) * Math.PI / 180;
            vel.Rotate(a);
            bonusAngle += a;
        }
        if (data.angleOffset) {
            var a = data.angleOffset * Math.PI / 180;
            vel.Rotate(a);
            bonusAngle += a;
        }
        var bullet = ProjectileBase(
            data.sprite || GetImage('bullet'),
            this,
            data.dx,
            data.dy,
            vel.x,
            vel.y,
            this.angle + bonusAngle,
            data.damage,
            data.range * 1.5,
            data.pierce,
            data.offScreen
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

    else data.delayTimer = 0;
}