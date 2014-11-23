function SkillBreakerblaster(player) {
    player.onMove = function() {

        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillDuration = 120;
            this.skillCd = 600;
        }

        // Active skill effects
        if (this.skillDuration > 0) {
            var laser = ProjectileBase(
                GetImage('abilityCannon'),
                this,
                0,
                54,
                this.cos * 10,
                this.sin * 10,
                this.angle,
                0.4 * this.GetDamageMultiplier(),
                999,
                true,
                true
            );
            this.bullets.push(laser);
        }
    }
}