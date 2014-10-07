// A rail gun weapon for an enemy that fires a stream of lasers after charging up
//
// Required data values:
//      range - range of the rail gun
//     damage - damage of the rail gun
//   duration - how long the railgun fires before overheating
//       rate - how long it takes the rail gun to charge up
//  discharge - how quickly the rail gun discharges when not able to fire
//
// Optional data values:
//      angle - max angle of deviation from a straight shot
//     sprite - sprite of the bullets
//    bullets - bullets per round
//    initial - whether or not to start firing right away when in range
//      speed - speed of the bullets
//     pierce - whether or not the bullets pierce
//  offScreen - whether or not the bullet can exist off screen
//         dx - horizontal offset
//         dy - vertical offset
function EnemyWeaponRail(data) {

    // Initialize values
    if (data.dx === undefined) {
        data.dx = 0;
    }
    if (data.dy === undefined) {
        data.dy = 0;
    }

    // Charge up when in range
    if (this.IsInRange(data.range) || data.cd < 0) {
        data.cd--;
        
        // Fire when charged up
        if (data.cd < 0) {
            for (var i = 0; i < (data.bullets || 1); i++) {
                var vel = Vector(this.cos * (data.speed || BULLET_SPEED), this.sin * (data.speed || BULLET_SPEED));
                if (data.angle) {
                    vel.Rotate((Rand(2 * data.angle + 1) - data.angle) * Math.PI / 180);
                }
                var laser = ProjectileBase(
                    data.sprite || GetImage('bossLaser'),
                    this,
                    data.dx,
                    data.dy, 
                    vel.x, 
                    vel.y, 
                    this.angle, 
                    data.damage, 
                    data.range * 1.5, 
                    data.pierce, 
                    data.offScreen
                );
                data.list.push(laser);
            }
            
            // "Overheating" resets the charge countdown
            if (data.cd < -data.duration) {
                data.cd = data.rate;
            }
        }
    }
    
    // Discharge when unable to attack
    else if (data.cd <= data.rate) {
        if (data.initial) {
            if (data.cd > 0) {
                data.cd--;
            }
        }
        else {
            data.cd += data.discharge;
        }
    }
}