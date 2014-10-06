// Drops mines behind the enemy as they move which blow up on contact or
// after a short duration, damaging the player if they're nearby
//
// Requires these fields to be set:
//   turretRange - range to start laying turrets from
//  turretDamage - damage dealt by the turrets
//   turretSpeed - the delay between placing turrets
//  turretHealth - health of the turrets placed
function EnemyWeaponTurrets() {

    // Initialize mine cooldown
    if (this.turretCd === undefined) {
        this.turretCd = 0;
    }

    // See if it's in range while ignoring the direction being faced
    var ds = DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y);
    var inRange = ds <= Sq(this.turretRange);
        
    // Drop mines
    if (inRange && this.turretCd <= 0) {
        gameScreen.enemyManager.turrets.push(new Turret(this.x, this.y, this.turretDamage, this.turretHealth));
        this.cd = this.attackCd;
    }
    else if (this.turretCd > 0) {
        this.turretCd--;
    }
}