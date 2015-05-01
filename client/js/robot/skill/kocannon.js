/**
 * Sets up the KO Cannon ability that fires a
 * powerful laser beam forward
 *
 * @param {Player} player - player to set up for
 */
function skillKOCannon(player) {

    /**
     * Updates the skill each frame, handling casting
     * and firing the laser
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            connection.ability(this);
            this.skillDuration = 120;
            this.skillCd = 600;
        }

        // Active skill effects
        if (this.skillDuration > 0 && !this.isRemote()) {
            for (var i = 0; i < 2; i++) {
                var laser = new Projectile(
                    /* Sprite */ 'abilityCannon',
                    /* Offset */ 0, 54 + 10 * i,
                    /* Source */ this, this,
                    /* Speed  */ 20,
                    /* Angle  */ 0,
                    /* Damage */ 0.4 * this.get('power'),
                    /* Range  */ 999,
                    /* Pierce */ true,
                    /* Target */ Robot.ENEMY
                );
                gameScreen.bullets.push(laser);
                connection.fireProjectile(laser);
            }
        }
    };
}