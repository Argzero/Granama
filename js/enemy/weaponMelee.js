// A basic gun that fires regular bullets
//
// Requires these fields to be set:
//  meleeDamage - how much damage the attack does
//   meleeRange - range of the attack
//   meleeSpeed - the delay between attacks
function EnemyWeaponMelee() {

    // Initialize the melee cooldown
    if (this.meleeCd === undefined) {
        this.meleeCd = 0;
    }

    // Fire when in range and off cooldown
    if (this.IsInRange(this.meleeRange) && this.meleeCd <= 0) {
        gameScreen.player.Damage(this.meleeDamage, this);
        this.meleeCd = this.meleeSpeed;
    }
    
    // Lower cooldown when on cooldown
    else if (this.meleeCd > 0) {
        this.meleeCd--;
    }
}