// A basic gun that fires regular bullets
//
// Required data values:
//      rate - the delay between slashes
//       arc - how far the sword arcs
//    damage - how much damage the slash does
// knockback - how far the slash knocks things back
//
// Optional data values:
//   speed - speed of the sword
function EnemyWeaponSword(data) {

    // Fire when in range and off cooldown
    if (this.IsInRange(150) && data.cd <= 0) {
        var sword = SwordProjectile(
            this,
            data.damage, 
            data.arc,
            data.speed || BULLET_SPEED,
            data.knockback
        );
        data.list.push(sword);
        this.sword = false;
        data.cd = data.rate;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0) {
        data.cd--;
    }
}