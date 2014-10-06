// Drops mines behind the enemy as they move which blow up on contact or
// after a short duration, damaging the player if they're nearby
//
// Requires these fields to be set:
//    mineType - type of the mine
//   mineRange - range to start laying mines from
//  mineDamage - damage dealt by the mines
//   mineSpeed - delay between placing mines
function EnemyWeaponMines() {

    // Initialize mine cooldown
    if (this.mineCd === undefined) {
        this.mineCd = 0;
    }

    // See if it's in range while ignoring the direction being faced
    var ds = DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y);
    var inRange = ds <= Sq(this.mineRange);
        
    // Drop mines
    if (inRange && this.mineCd <= 0) {
        gameScreen.enemyManager.mines.push(new Mine(this.x, this.y, this.mineDamage, this.mineType));
        this.mineCd = this.mineSpeed;
    }
    else if (this.mineCd > 0) {
        this.mineCd--;
    }
}