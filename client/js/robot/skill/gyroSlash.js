/**
 * Applies the Gyro Slash skill to the player which
 * swings a large sword around while speeding up
 *
 * @param {Player} player - player to set up for
 */
function skillGyroSlash(player) {

    /**
     * Updates the skill each frame, swinging the
     * sword and handling casting when applicable
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            connection.ability(this);
            this.skillDuration = 180;
            this.skillCd = 300;
            this.buff('speed', 2, this.skillDuration);

            if (this.isRemote()) return;
            
            // Spinning sword
            var sword = new Projectile(
                'abilitySword',
                0, 0,
                this, this,
                0, 0,
                this.get('power') * 4,
                9999,
                true,
                Robot.ENEMY
            );
            sword.setupSword(150, Math.PI * 5, 50, this.swordData.templates[0].args[3]);
            gameScreen.bullets.push(sword);
            connection.fireProjectile(sword);
        }
    };
}