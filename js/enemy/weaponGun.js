// A basic gun that fires regular bullets
//
// Requires these fields to be set:
//  gunDamage - how much damage the gun does
//   gunRange - range of the gun
//   gunSpeed - the delay between shots
function EnemyWeaponGun() {

    // Initialize the gun cooldown
    if (this.gunCd === undefined) {
        this.gunCd = 0;
    }

    // Fire when in range and off cooldown
    if (this.IsInRange(this.gunRange) && this.gunCd <= 0) {
        FireBullet(this, this.gunDamage);
        this.gunCd = this.gunSpeed;
    }
    
    // Lower cooldown when on cooldown
    else if (this.gunCd > 0) {
        this.gunCd--;
    }
}