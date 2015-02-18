/** 
 * Sets up the blink skill that teleports the player a short distance
 *
 * @param {Player} player - player to set up the skill for
 */
function skillBlink(player) {
	
	/**
	 * Applies casting the skill by checking each frame
	 */
    player.onUpdate = function() {
        if (this.isSkillCast()) {
			var dir = this.input.direction(MOVE, this);
            if (dir.lengthSq() == 0) return;
			this.move(300 * dir.x, 300 * dir.y);
            this.skillCd = 360 * this.cdm;
        }
    };
}