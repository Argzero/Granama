// A basic gun that fires regular bullets
//
// Required data values:
//  spriteName - name without direction of the sprite
//       range - how far away it can hit from
//        rate - the delay between slashes
//         arc - how far the sword arcs
//      radius - radius of the swing
//      damage - how much damage the slash does
//   knockback - how far the slash knocks things back
//       angle - initial angle of the sword
//
// Optional data values:
//  dx - horizontal offset for start/end position
//  dy - vertical offset for start/end position
function EnemyWeaponDoubleSword(data) {

    // Initialize data
    if (data.dx === undefined) {
        data.dx = 0;
    }
    if (data.dy === undefined ) {
        data.dy = 0;
    }

    // Fire when in range and off cooldown
    if (this.IsInRange(data.range) && data.cd <= 0) {
        var side = this.right ? 'Right' : 'Left';
        var m = this.right ? 1 : -1;
        this.right = !this.right;
        var sword = SwordProjectile(
            GetImage(data.spriteName + side),
            this,
            data.dx * m,
            data.dy,
            data.radius,
            data.angle,
            data.damage, 
            data.arc * m,
            data.knockback,
            0
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