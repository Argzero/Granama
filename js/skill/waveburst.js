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
                var spacing = (this.sprite.height / 2 + 25 + BULLET_SPEED * i / 5);
                var laser = NewLaser(this.x + cos * spacing, this.y + sin * spacing, cos * BULLET_SPEED, sin * BULLET_SPEED, this.angle + this.waveAngle, LASER_DAMAGE, LASER_RANGE * 2);
                laser.x += laser.velX * i / 5;
                laser.y += laser.velY * i / 5;
                laser.sprite = GetImage('abilityLaser');
                this.bullets[this.bullets.length] = laser;
            }
        }
    }
}