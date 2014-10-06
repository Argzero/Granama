// A basic gun that fires regular bullets
//
// Required data values:
//    rate - the delay between launches
//   speed - how fast the fists move
//   range - how far the fist can be launched from
//  damage - how much damage the fist does
function EnemyWeaponFist(data) {

    // Initialize data
    if (data.side === undefined) {
        data.side = Rand(2) == 0;
    }

    // Fire when in range and off cooldown
    if (this.IsInRange(data.range) && data.cd <= 0) {
        var tx = (data.side ? -1 : 1) * (5 + this.sprite.width / 2 + this.rightFistImg.width / 2);
        var side = data.side ? 'right' : 'left';
        var fist = FistProjectile(
            this,
            tx,
            0, 
            this.cos * data.speed, 
            this.sin * data.speed, 
            this.angle,
            data.damage, 
            data.range * 1.5, 
            120,
            side
        );
        gameScreen.enemyManager.bullets.push(fist);
        this[side + 'Fist'] = false;
        data.cd = data.rate;
        data.side = !data.side;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0) {
        data.cd--;
    }
}