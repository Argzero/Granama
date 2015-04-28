/**
 * Sets up the Waveburst skill which unleashes a wave of
 * bullets in a circular spiral pattern around the player.
 *
 * @param {Player} player - player to set up for
 */
function skillWaveburst(player) {
    
    /**
     * Updates ability effects each frame while not dead
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            this.skillDuration = 120;
            this.skillCd = 600;
            this.waveAngle = 0;
        }

        // Active ability effects
        if (this.skillDuration > 0) {
            for (var i = 0; i < 5; i++) {
                this.waveAngle += Math.PI / 60;
                var laser = new Projectile(
                    /* Sprite */ 'abilityLaser',
                    /* Offset */ 0, 54 + BULLET_SPEED * i / 5,
                    /* Source */ this, this,
                    /* Speed  */ 10,
                    /* Angle  */ this.waveAngle,
                    /* Damage */ 0.5 * this.get('power'),
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