function SkillBlitz(player) {
    
    // Activating the ability
    player.onMove = function() {
        if (this.IsSkillCast()) {
            this.skillDuration = 300;
            this.skillCd = 900;
            this.rm = 0.75;
        }
        if (this.skillDuration <= 0) {
            this.rm = 1;
        }
    }
}