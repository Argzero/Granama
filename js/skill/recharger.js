function SkillRecharger(player) {
    
    // Activating the ability
    player.onMove = function() {
        if (this.IsSkillCast() && this.upgrades[SHIELD_ID] > 0) {
            var maxShield = this.maxHealth * SHIELD_MAX;
            if (this.shield < maxShield) {
                this.shield = maxShield;
                this.skillCd = RECHARGER_CD;
            }
        }
    }
}