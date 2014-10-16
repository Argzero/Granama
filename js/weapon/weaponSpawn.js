// A basic gun that fires regular bullets
//
// Required data values:
//  enemies - list of enemies that can be spawned
//      max - max amount of enemies that can be spawned
//     rate - how often an enemy is spawned
//
// Optional data values:
//   delay - the delay before spawning
//      dx - horizontal offset for the enemy spawn location
//      dy - vertical offset for the enemy spawn location
function EnemyWeaponSpawn(data) {

    // Don't spawn more if already reached the max
    if (gameScreen.enemyManager.enemies.length > data.max) {
        this.SwitchPattern();
        return;
    }

    // Initialize data
    if (data.delayTimer === undefined) {
        data.delayTimer = 0;
    }
    if (data.dx === undefined) {
        data.dx = 0;
    }
    if (data.dy === undefined) {
        data.dy = 0;
    }

    // Spawn the enemy when off cooldown
    if (data.cd <= 0) {
        if (data.delay && data.delayTimer < data.delay) {
            data.delayTimer++;
            return;
        }
        
        // Spawn the enemy
        var offset = Vector(data.dx, data.dy);
        offset.Rotate(this.sin, -this.cos);
        gameScreen.enemyManager.SpawnEnemy(data.enemies, this.x + offset.x, this.y + offset.y); 
        
        data.cd = data.rate;
    }
    
    // Lower cooldown when on cooldown
    else if (data.cd > 0) {
        data.cd--;
    }
}