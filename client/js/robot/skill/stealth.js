/**
 * Ability that causes the robot to stealth and gain
 * increased speed and damage
 *
 * @param {Player} player - player to set up for
 */
function skillStealth(player) {
    
    /**
     * Handles updating the ability, applying stealth along
     * with other related buffs
     */
    player.onUpdate = function() {
        
        // Activating the ability
        if (this.isSkillCast()) {
            connection.ability(this);
            this.skillDuration = 240 + 30 * this.upgrades[STEALTH_DURATION_ID];
            this.skillCd = 480;
            this.buff('power', 1.5, this.skillDuration, true);
        }
		
        // Update buffs
		this.stealth = this.skillDuration > 0 && !this.sword;
        this.speed = this.baseSpeed;
        this.chargeMultiplier = 1;
        if (this.skillDuration > 0) {
            this.speed = this.baseSpeed * 1.5;
            this.chargeMultiplier = 2;
        }
    };
}