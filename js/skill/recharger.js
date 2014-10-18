function SkillRecharger(player) {
    
    // Activating the ability
    player.onMove = function() {
        if (this.IsSkillCast()) {
            var maxShield = this.maxHealth * SHIELD_MAX;
            if (this.shield < maxShield) {
                this.shield = maxShield;
                this.skillCd = 900;
            }
        }
    }
}