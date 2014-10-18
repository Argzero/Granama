// A shockwave that damages and knocks things back, alternating sides each time
//
// Required data values:
//      rate - the delay between shockwaves
//    damage - how much damage the slash does
//     start - starting angle of the shockwave
//       end - ending angle of the shockwave
//    radius - starting radius of the shockwave
//     range - range of the attack
//
// Optional data values:
//        dx - horizontal offset of the shockwave's origin
//        dy - vertical offset of the shockwave's origin
//     speed - speed at which the shockwave travels at
//    color1 - primary color of the shockwave
//    color2 - secondary color of the shockwave
// knockback - how far the shockwave knocks things back
// thickness - how thick the wave is
function EnemyWeaponShockwave(data) {

    // Initialize data
    if (data.dx === undefined) data.dx = 0;
    if (data.dy === undefined) data.dy = 0;

    // Fire when in range and off cooldown
    if (this.IsInRange(data.range) && data.cd <= 0) {
        
        //source, color, x, y, speed, min, max, radius, thickness, damage, range, knockback
        var shockwave = Shockwave(
            this,
            data.color1 || '#ff9933',
			data.color2 || '#f70',
            this.x + data.dx,
            this.y + data.dy,
            data.speed || 5,
            data.start + this.angle,
            data.end + this.angle,
            data.radius,
            data.thickness || 20, 
            data.damage,
            data.range,
            data.knockback
        );
        data.list.push(shockwave);
        var temp = Math.PI - data.end;
        data.end = Math.PI - data.start;
        data.start = temp;
        data.cd = data.rate;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0) {
        data.cd--;
    }
}