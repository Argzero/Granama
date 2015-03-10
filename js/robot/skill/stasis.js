/** 
 * Sets up the Stasis skill that freezes the player in place while they
 * regenerate health quickly over time
 */
function skillStasis(player) {

    /**
     * Handles casting the skill and generating particles while active
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast() && this.health < this.maxHealth) {
            this.skillDuration = 180;
            this.skillCd = 900;
        }

        // Active skill effects
        if (this.skillDuration > 0) {
            this.health += this.maxHealth * 0.5 / 180;
            if (this.health >= this.maxHealth) {
                this.health = this.maxHealth;
                this.skillDuration = 0;
            }
            else if (this.skillDuration % 15 === 0) {
                var angle = Math.random() * 2 * Math.PI;
                var c = Math.cos(angle);
                var s = Math.sin(angle);
                gameScreen.particles.push(new Plus(this.pos.x, this.pos.y, 2 * c, 2 * s, 75));
            }

            return 0;
        }
    };

    /**
     * Reduces damage dealt to the player while the skill is active
     *
     * @param {number} amount  - the amount of damage taken
     * @param {Robot}  damager - the robot that damaged the player
     *
     * @returns {number} the modified amount of damage
     */
    player.onDamaged = function(amount, damager) {
        if (this.skillDuration > 0) {
            return amount * 0.1;
        }
    };
}