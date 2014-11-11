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
//   interval - how long between shots
//      angle - max angle of deviation from a straight shot
//     sprite - sprite of the bullets
//    bullets - bullets per round
//    initial - whether or not to start firing right away when in range
//      speed - speed of the bullets
//     pierce - whether or not the bullets pierce
//  offScreen - whether or not the bullet can exist off screen
//         dx - horizontal offset
//         dy - vertical offset
//    xOffset - max horizontal deviation for spreading bullets
function EnemyWeaponRail(data) {

    // Initialize values
    if (!data.subWeapon) {
        data.subWeapon = EnemyWeaponGun;
    }

    // Charge up when in range
    if (this.IsInRange(data.range) || data.cd < 0) {
        data.cd--;
        
        // Fire when charged up
        if (data.cd < 0) {
            if (data.intervalTimer > 1) {
                data.intervalTimer--;
                return;
            }
            this.subWeapon = data.subWeapon;
            var tempCd = data.cd;
            for (var i = 0; i < (data.bullets || 1); i++) {
                this.subWeapon(data);
                data.cd = tempCd;
            }
            data.intervalTimer = data.interval;
            
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
/*
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
            if (data.intervalTimer > 1) {
                data.intervalTimer--;
                return;
            }
            for (var i = 0; i < (data.bullets || 1); i++) {
                var vel = Vector(this.cos * (data.speed || BULLET_SPEED), this.sin * (data.speed || BULLET_SPEED));
                if (data.angle) {
                    vel.Rotate((Rand(2 * data.angle + 1) - data.angle) * Math.PI / 180);
                }
                var xOffset = 0;
                if (data.xOffset) {
                    xOffset = Rand(data.xOffset * 2 + 1) - data.xOffset;
                }
                var laser = ProjectileBase(
                    data.sprite || GetImage('bossLaser'),
                    this,
                    data.dx + xOffset,
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
                data.intervalTimer = data.interval;
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
*/