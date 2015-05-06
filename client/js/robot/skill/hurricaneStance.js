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
            connection.ability(this);
            this.skillDuration = 360;
            this.skillCd = 480;
            
            var ups = this.upgrades[METEOR_ABILITY_ID];
            if (ups) {
                this.buff('power', 1 + ups * 0.1, this.skillDuration, true);
            }
        }
        
        // Base value buffs
        this.rm = this.skillDuration > 0 ? 0.75 - 0.025 * this.upgrades[METEOR_ABILITY_ID] : 1;
        this.speed = this.baseSpeed * (this.skillDuration > 0 ? 1.5 : 1);
    };
}