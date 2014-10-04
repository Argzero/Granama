function SkillBreakerblaster(player) {
    player.onMove = function() {
    
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillDuration = BREAKERBLASTER_DURATION;
            this.skillCd = BREAKERBLASTER_CD;
        }
        
        // Active skill effects
        if (this.skillDuration > 0) {
            var laser = NewLaser(this.x + this.cos * (this.sprite.height / 2 + 25), this.y + this.sin * (this.sprite.height / 2 + 25), this.cos * BULLET_SPEED, this.sin * BULLET_SPEED, this.angle, LASER_DAMAGE * 2, LASER_RANGE * 2);
            laser.sprite = GetImage('abilityCannon');
			this.bullets[this.bullets.length] = laser;
        }
    }
}