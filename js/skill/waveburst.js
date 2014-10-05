function SkillWaveburst(player) {
    player.onMove = function() {
    
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillDuration = WAVEBURST_DURATION;
            this.skillCd = WAVEBURST_CD;
            this.waveAngle = 0;
        }
        
        // Active ability effects
        if (this.skillDuration > 0) {
            for (var i = 0; i < 5; i++) {
                var cos = -Math.sin(this.angle + this.waveAngle);
                var sin = Math.cos(this.angle + this.waveAngle);
                this.waveAngle += Math.PI / 60;
                var laser = ProjectileBase(
                    GetImage('abilityLaser'),
                    this,
                    0,
                    54 + BULLET_SPEED * i / 5, 
                    cos * BULLET_SPEED, 
                    sin * BULLET_SPEED, 
                    this.angle + this.waveAngle, 
                    LASER_DAMAGE, 
                    LASER_RANGE * 2,
                    true,
                    true
                );
                /*
                laser.x += laser.velX * i / 5;
                laser.y += laser.velY * i / 5;
                */
                this.bullets.push(laser);
            }
        }
    }
}