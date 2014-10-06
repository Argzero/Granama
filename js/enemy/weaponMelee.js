// A basic gun that fires regular bullets
//
// Requires these fields to be set:
//  damage - how much damage the attack does
//   range - range of the attack
//    rate - the delay between attacks
function EnemyWeaponMelee(data) {

    // Fire when in range and off cooldown
    if (this.IsInRange(data.range) && data.cd <= 0) {
        gameScreen.player.Damage(data.damage, this);
        data.cd = data.rate;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0) {
        data.cd--;
    }
}