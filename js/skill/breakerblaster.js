function SkillBreakerblaster(player) {
    player.onMove = function() {
    
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillDuration = BREAKERBLASTER_DURATION;
            this.skillCd = BREAKERBLASTER_CD;
        }
        
        // Active skill effects
        if (this.skillDuration > 0) {
            sprite, source, x, y, velX, velY, angle, damage, range, pierce, offScreen
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