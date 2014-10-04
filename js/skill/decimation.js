function SkillDecimation(player) {

    // Activate the ability on move
    player.onMove = function() {
        if (this.IsSkillCast()) {
            this.skillDuration = DECIMATION_DURATION;
            this.skillCd = DECIMATION_CD;
        }
    }
    
    // Damage multiplier when active
    player.onFire = function() {
        if (this.skillDuration > 0) {
            return 2;
        }
    }
}