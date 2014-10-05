// A basic gun that fires regular bullets
//
// Requires these fields to be set:
//  gunDamage - how much damage the gun does
//   gunRange - range of the gun
//   gunSpeed - the delay between shots
//  gunSpread - the spread of the gun
function EnemyWeaponGun() {

    // Initialize the gun cooldown
    if (this.gunCd === undefined) {
        this.gunCd = 0;
    }

    // Fire when in range and off cooldown
    if (this.IsInRange(this.gunRange) && this.gunCd <= 0) {
        var bullet = ProjectileBase(
            GetImage('bullet'),
            this,
            0,
            this.sprite.width / 2, 
            this.cos * BULLET_SPEED, 
            this.sin * BULLET_SPEED, 
            this.angle,
            this.gunDamage, 
            this.gunRange * 1.5, 
            false,
            false
        );
        gameScreen.enemyManager.bullets.push(bullet);
        bullet.Spread(this.gunSpread, gameScreen.enemyManager.bullets);
        this.gunCd = this.gunSpeed;
    }
    
    // Lower cooldown when on cooldown
    else if (this.gunCd > 0) {
        this.gunCd--;
    }
}