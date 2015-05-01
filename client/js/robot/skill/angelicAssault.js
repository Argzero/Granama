/**
 * Sets up the Angelic Assault skill for a player which gives
 * them bonus damage, speed, and faster revive rate
 *
 * @param {Player} player - player to set up for
 */ 
function skillAngelicAssault(player) {

    /**
     * Updates the skill each frame, handling casting
     * and applying buffs
     */
    player.onUpdate = function() {
    
        // Cast the skill
        if (this.isSkillCast()) {
            connection.ability(this);
            this.skillDuration = 300;
            this.skillCd = 240;
            this.staticActive = !this.staticActive;
            this.buff('power', 2, this.skillDuration);
        }
        
        // Base value buffs
        if (this.skillDuration > 0) {
            this.speed = this.baseSpeed * 1.5;
            this.revSpeed = this.revBase * 2.5;
            this.prismData.sprite = 'abilityPrismBeam';
        }
        
        // Reset when not active
        else {
            this.speed = this.baseSpeed;
            this.revSpeed = this.revBase;
            this.prismData.sprite = 'prismBeam';
        }
        
        this.leftWing.hidden = this.rightWing.hidden = this.skillDuration <= 0;
    };
}