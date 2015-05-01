/** 
 * Sets up the Sweeping Blade skill that swings a large
 * sword that applies massive knockback
 * 
 * @param {Player} player - the player to set the skill up for
 */
function skillSweepingBlade(player) {

    /**
     * Updates the skill each frame, swinging the sword
     * when the skill is cast
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            connection.ability(this);
            this.skillDuration = 36;
            this.skillCd = 300;
            this.buff('speed', 2, 36);
            
            if (this.isRemote()) return;

            // Spawn the sword projectile
            var sword = new Projectile(
                'abilitySword',
                0, 0,
                this, this,
                0, 
                0,
                this.get('power') * 6,
                9999,
                true,
                Robot.ENEMY
            );
            sword.setupSword(150, Math.PI, 600, this.swordData.templates[0].args[3]);
            gameScreen.bullets.push(sword);
            connection.fireProjectile(sword);
        }
    };
}