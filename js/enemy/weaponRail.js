// A rail gun weapon for an enemy that fires a stream of lasers after charging up
//
// Requires these fields to be set:
//      railRange - range of the rail gun
//     railDamage - damage of the rail gun
//   railDuration - how long the railgun fires before overheating
//      railSpeed - how long it takes the rail gun to charge up
//  railDischarge - how quickly the rail gun discharges when not able to fire
function EnemyWeaponRail() {

    // Initialize rail cooldown
    if (this.railCd === undefined) {
        this.railCd = 0;
    }

    // Charge up when in range
    if (this.IsInRange(this.railRange) || this.railCd < 0) {
        this.railCd--;
        
        // Fire when charged up
        if (this.railCd < 0) {
            var laser = new Projectile(
                this.x + this.cos * this.sprite.height / 2, 
                this.y + this.sin * this.sprite.height / 2, 
                this.cos * BULLET_SPEED, 
                this.sin * BULLET_SPEED, 
                this.angle, 
                this.railDamage, 
                this.railRange * 1.5, 
                true, 
                "bossLaser"
            );
            gameScreen.enemyManager.bullets[gameScreen.bullets.length] = laser;
            
            // "Overheating" resets the charge countdown
            if (this.railCd < -this.railDuration) {
                this.railCd = this.railSpeed;
            }
        }
    }
    
    // Discharge when unable to attack
    else if (this.railCd <= this.railSpeed) {
        this.railCd += this.railDischarge;
    }
}