/**
 * Sets up the Reflector skill which reflects damage back
 * to enemies with a multiplier as homing projectiles.
 *
 * @param {Player} player - player to set up for
 */
function skillReflector(player) {

	/**
	 * Handles activating the ability
	 */
    player.onUpdate = function() {
        if (this.isSkillCast()) {
            this.skillDuration = 300;
            this.skillCd = 600;
        }
    };

    /**
	 * Provide damage immunity and damage reflection
	 * while the skill is active
	 */
    player.onDamaged = function(amount, damager) {
        if (this.skillDuration > 0) {
            var reflection = new Projectile(
                "abilityReflect",
                0, 0,
                this, this,
                10, 
                rand(360) * Math.PI / 180,
                amount * 2,
                999999,
                false,
                damager.type
            );
            reflection.setupHoming(damager, rand(10) / 100 + 0.04);
            gameScreen.bullets.push(reflection);
            return 0;
        }
    };
}