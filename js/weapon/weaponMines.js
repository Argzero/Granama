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
//        dx - horizontal offset
//        dy - vertical offset
function EnemyWeaponMines(data) {

    // Initialize data
    if (data.dx === undefined) data.dx = 0;
    if (data.dy === undefined) data.dy = 0;

    // See if it's in range while ignoring the direction being faced
    var player = playerManager.getClosest(this.x, this.y);
    var ds = DistanceSq(this.x, this.y, player.x, player.y);
    var inRange = ds <= Sq(data.range);
        
    // Drop mines
    if (inRange && data.cd <= 0) {
        var offset = Vector(data.dx, data.dy);
        offset.Rotate(this.sin, -this.cos);
        var mine = new Mine(this.x + offset.x, this.y + offset.y, data.damage, data.type);
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