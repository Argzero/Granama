// Drops mines behind the enemy as they move which blow up on contact or
// after a short duration, damaging the player if they're nearby
//
// Required data values:
//   range - range to start laying turrets from
//  damage - damage dealt by the turrets
//    rate - the delay between placing turrets
//  health - health of the turrets placed
function EnemyWeaponTurrets(data) {

    // See if it's in range while ignoring the direction being faced
    var player = playerManager.getClosest(this.x, this.y);
    var ds = DistanceSq(this.x, this.y, player.x, player.y);
    var inRange = ds <= Sq(data.range);

    // Drop mines
    if (inRange && data.cd <= 0) {
        gameScreen.enemyManager.turrets.push(new Turret(this.x, this.y, data.damage, data.health));
        data.cd = data.rate;
    }
    else if (data.cd > 0) {
        data.cd--;
    }
}