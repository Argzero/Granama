/**
 * Sets up the Angelic Assault skill for a player which gives
 * them bonus damage, speed, and faster revive rate
 *
 * @param {Player} player - player to set up for
 */ 
function SkillAngelicAssault(player) {

    /**
     * Updates the skill each frame, handling casting
     * and applying buffs
     */
    player.onUpdate = function() {
    
        // Cast the skill
        if (this.isSkillCast()) {
            this.skillDuration = 300;
            this.skillCd = 240;
            this.staticActive = !this.staticActive;
            this.buff('power', 2, this.skillDuration);
        }
        
        // Base value buffs
        this.speed = this.speedBase * (this.skillDuration > 0 ? 1.5 : 1);
        this.revSpeed = this.revBase * (this.skillDuration > 0 ? 2.5 : 1);
    }
}