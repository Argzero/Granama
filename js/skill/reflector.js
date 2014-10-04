function SkillReflector(player) {
    
    // Activating the ability
    player.onMove = function() {
        if (this.IsSkillCast()) {
            this.skillDuration = STASIS_DURATION;
            this.skillCd = STASIS_CD;
        }
    }
    
    // Damage immunity and reflection while active
    player.onDamaged = function(amount, damager) {
        if (this.skillDuration > 0) {
            if (damager) {
                var m = Rand(2) * 2 - 1;
                var reflection = new Reflection(this.x, this.y, m * this.sin * BULLET_SPEED, m * this.cos * BULLET_SPEED, amount, damager);
                this.bullets[this.bullets.length] = reflection;
            }
            return 0;
        }
    }
}