/**
 * Sets up the Hurricane Stance skill which gives a boost
 * to movement speed and attack speed for a duration.
 *
 * @param {Player} player - player to set up for
 */ 
function skillHurricaneStance(player) {

    /**
     * Updates the skill each frame, handling casting
     * and applying buffs
     */
    player.onUpdate = function() {
    
        // Cast the skill
        if (this.isSkillCast()) {
            this.skillDuration = 360;
            this.skillCd = 480;
        }
        
        // Base value buffs
        this.rm = this.skillDuration > 0 ? 0.5 : 1;
        this.speed = this.baseSpeed * (this.skillDuration > 0 ? 1.5 : 1);
    };
}