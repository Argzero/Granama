function SkillDecimation(player) {

    // Activate the ability on move
    player.onMove = function() {
        if (this.IsSkillCast()) {
            this.skillDuration = 420;
            this.skillCd = 300;
        }
    }

    // Damage multiplier when active
    player.onFire = function() {
        if (this.skillDuration > 0) {
            return 2;
        }
    }
}