// A basic gun that fires regular bullets
//
// Required data values:
//  damage - how much damage the gun does
//   range - range of the gun
//    rate - the delay between shots
//
// Optional data values:
//  sprite - the sprite used by the gun (default 'bullet')
//   speed - speed of the fire
//      dx - horizontal offset for the bullet spawn location
//      dy - vertical offset for the bullet spawn location
function EnemyWeaponFire(data) {

    // Initialize data
    if (data.sprite === undefined) {
        data.sprite = GetImage('bossFlame');
    }
    if (data.dx === undefined) {
        data.dx = 0;
    }
    if (data.dy === undefined) {
        data.dy = 0;
    }

    // Fire when in range and off cooldown
    if (this.IsInRange(data.range) && data.cd <= 0) {
        var fire = FireProjectile(
            data.sprite,
            this,
            data.dx,
            data.dy, 
            this.cos * (data.speed || BULLET_SPEED), 
            this.sin * (data.speed || BULLET_SPEED), 
            this.angle,
            data.damage, 
            data.range * 1.5
        );
        data.list.push(fire);
        data.cd = data.rate;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0) {
        data.cd--;
    }
}