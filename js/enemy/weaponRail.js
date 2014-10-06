// A rail gun weapon for an enemy that fires a stream of lasers after charging up
//
// Requires these fields to be set:
//      range - range of the rail gun
//     damage - damage of the rail gun
//   duration - how long the railgun fires before overheating
//       rate - how long it takes the rail gun to charge up
//  discharge - how quickly the rail gun discharges when not able to fire
function EnemyWeaponRail(data) {

    // Charge up when in range
    if (this.IsInRange(data.range) || data.cd < 0) {
        data.cd--;
        
        // Fire when charged up
        if (data.cd < 0) {
            var laser = ProjectileBase(
                GetImage('bossLaser'),
                this,
                0,
                this.sprite.height / 2, 
                this.cos * BULLET_SPEED, 
                this.sin * BULLET_SPEED, 
                this.angle, 
                data.damage, 
                data.range * 1.5, 
                true, 
                true
            );
            gameScreen.enemyManager.bullets.push(laser);
            
            // "Overheating" resets the charge countdown
            if (data.cd < -data.duration) {
                data.cd = data.rate;
            }
        }
    }
    
    // Discharge when unable to attack
    else if (data.cd <= data.rate) {
        data.cd += data.discharge;
    }
}