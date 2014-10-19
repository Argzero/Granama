// A grapple hook that pulls in enemies
//
// Required data values:
//      rate - the delay between slashes
//     range - range of the grapple hook
//    damage - how much damage the slash does
//      stun - how long to stun the enemy for
function EnemyWeaponGrapple(data) {

    // Fire when in range and off cooldown
    if (this.IsInRange(data.range) && data.cd <= 0) {
        var grapple = GrappleProjectile(    
            this,
            data.damage, 
            data.range,
            data.stun
        );
        this.grapple = grapple;
        data.list.push(grapple);
        data.cd = data.rate;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0 && !this.grapple) {
        data.cd--;
    }
}