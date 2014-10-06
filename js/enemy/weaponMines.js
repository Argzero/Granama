// Drops mines behind the enemy as they move which blow up on contact or
// after a short duration, damaging the player if they're nearby
//
// Required data values:
//      type - type of the mine
//     range - range to start laying mines from
//    damage - damage dealt by the mines
//      rate - delay between placing mines
//
// Optional data values: 
//  duration - how long the mines last for
function EnemyWeaponMines(data) {

    // See if it's in range while ignoring the direction being faced
    var ds = DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y);
    var inRange = ds <= Sq(data.range);
        
    // Drop mines
    if (inRange && data.cd <= 0) {
        var mine = new Mine(this.x, this.y, data.damage, data.type);
        gameScreen.enemyManager.mines.push(mine);
        if (data.duration) {
            mine.lifespan = data.duration;
        }
        data.cd = data.rate;
    }
    else if (data.cd > 0) {
        data.cd--;
    }
}