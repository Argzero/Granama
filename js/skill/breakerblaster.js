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
                this.cos * BULLET_SPEED, 
                this.sin * BULLET_SPEED, 
                this.angle, 
                LASER_DAMAGE * 2, 
                LASER_RANGE * 2,
                true,
                true
            );
			this.bullets.push(laser);
        }
    }
}