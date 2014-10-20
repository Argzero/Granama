// A melee attack for enemies
//
// Requires these fields to be set:
//  damage - how much damage the attack does
//   range - range of the attack
//    rate - the delay between attacks
//
// Optional data values:
//    slow - slow multiplier on hit
// duration - duration of the slow
function EnemyWeaponMelee(data) {

    // Fire when in range and off cooldown
    if (this.IsInRange(data.range) && data.cd <= 0) {
		var player = playerManager.getClosest(this.x, this.y);
        player.Damage(data.damage, this);
		if (data.slow && data.duration) {
			player.Slow(data.slow, data.duration);
		}
        data.cd = data.rate;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0) {
        data.cd--;
    }
}