// A basic gun that fires regular bullets
//
// Required data values:
//      rate - the delay between slashes
//       arc - how far the sword arcs
//    damage - how much damage the slash does
// knockback - how far the slash knocks things back
// lifesteal - the percentage of damage returned as life
//     angle - initial angle of the sword
function EnemyWeaponSword(data) {

    // Fire when in range and off cooldown
    if (this.IsInRange(150) && data.cd <= 0) {
        this.sword = false;
        var sword = SwordProjectile(
            GetImage('sword'),
            this,
            -16,
            40,
            100,
            data.angle,
            data.damage, 
            data.arc,
            data.knockback,
            data.lifesteal
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