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
                var reflection = ReflectionProjectile(
                    this,
                    0,
                    0, 
                    m * this.sin * BULLET_SPEED, 
                    m * this.cos * BULLET_SPEED, 
                    amount, 
                    damager
                );
                this.bullets.push(reflection);
            }
            return 0;
        }
    }
}