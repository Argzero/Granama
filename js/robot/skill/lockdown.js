/** 
 * Sets up the Lockdown ability that immobilizes the player
 * while giving them damage reduction and a stronger basic attack
 */
function skillLockdown(player) {

    /**
     * Updates the skill each frame, applying stat changes
     * and firing the lasers when applicable.
     */
    player.onUpdate = function() {

        var chargeRate = 2 + 0.3 * this.upgrades[CHARGE_ID];

        // Activating the ability
        if (this.isSkillCast()) {
            this.skillCooldown = Math.round(100 / chargeRate);
            this.locked = !this.locked;
            this.speed = 0.00001;
            this.defense = 1 - 1.8 / (players.length + 1);
        }
        
        // Restore speed when not locked
        if (!this.locked && this.charge <= 0) {
            this.speed = this.baseSpeed;
            this.defense = 1;
        }

        // Active skill effects
        if (this.locked) {

            // Charging
            if (this.charge < 100) {
                this.charge += chargeRate;
            }

            // Laser firing
            if ((this.charge > 0 && this.input.button(SHOOT) == 1) || (this.isInRange() && this.charge >= 100)) {
                var laser = new Projectile(
                    'abilityLaser',
                    0, 0,
                    this, this,
                    20,
                    0,
                    40 * this.get('power') * this.charge / 100,
                    299 + 50 * this.upgrades[RAIL_ID] + 2 * this.charge,
                    true,
                    Robot.ENEMY
                );
                gameScreen.bullets.push(laser);
                this.charge = -20;
                this.skillCooldown = Math.round(100 / chargeRate);
            }
        }

        // Unlocking
        else if (this.charge > 0) {
            this.charge -= 2 * chargeRate;
        }
    }
}