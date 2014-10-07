function SkillBlitz(player) {
    
    // Activating the ability
    player.onMove = function() {
        if (this.IsSkillCast()) {
            this.skillDuration = 10;
            this.skillCd = 40;
            this.rm = 0.75;
        }
    }
}