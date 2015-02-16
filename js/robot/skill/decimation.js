/**
 * Sets up the decimation skill for the slayer
 */
function skillDecimation(player) {

    /**
     * Activates the skill and applies a damage
     * buff when applicable
     */
    player.onUpdate = function() {
        if (this.isSkillCast()) {
            this.skillDuration = 420;
            this.skillCd = 300;
        }
        if (this.skillDuration > 0) {
            this.buff('power', 2, 2);
        }
    }
}