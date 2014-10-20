// A grapple hook that pulls in enemies
//
// Required data values:
//      rate - the delay between slashes
//     range - range of the grapple hook
//    damage - how much damage the slash does
//      stun - how long to stun the enemy for
//
// Optional data values:
//    sprite - sprite of the grapple hook
//      self - whether or not the user gets pulled in
function EnemyWeaponGrapple(data) {

    // Fire when in range and off cooldown
    if (this.IsInRange(data.range) && data.cd <= 0) {
        var grapple = GrappleProjectile(    
			data.sprite || GetImage('grappleHook'),
            this,
            data.damage, 
            data.range,
            data.stun,
			data.self
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