function SkillBlink(player) {
	player.onMove = function() {
        if (this.IsSkillCast()) {
			this.x += 300 * this.input.movement.x;
			this.y += 300 * this.input.movement.y;
			this.skillCd = 360 * this.cdm;
        }
	};
}