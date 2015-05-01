/**
 * Sets up the Critical Blast skill for the player which
 * fires a powerful shotgun blast
 *
 * @param {Player} player - player to set up for
 */
function skillCriticalBlast(player) {
    
    /**
     * Applies casting and firing the bullets each frame
     * when applicable
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            connection.ability(this);
            this.skillDuration = 5;
            this.skillCd = 1200 * this.cdm;
        }

        // Active ability effects
        if (this.skillDuration > 0 && !this.isRemote()) {
            for (var i = 0; i < 15; i++) {
                var bonus = (rand(30) - 15) * Math.PI / 180;
                var shell = new Projectile(
                    'abilityShell',
                    -30, 45,
                    this, this,
                    15,
                    bonus,
                    3 * this.get('power'),
                    449,
                    false,
                    Robot.ENEMY
                );
                shell.setupSlowBonus(1.5);
                gameScreen.bullets.push(shell);
                connection.fireProjectile(shell);
            }
        }
    };
}