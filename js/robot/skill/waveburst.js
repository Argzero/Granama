function skillWaveburst(player) {
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            this.skillDuration = 120;
            this.skillCd = 600;
            this.waveAngle = 0;
        }

        // Active ability effects
        if (this.skillDuration > 0) {
            for (var i = 0; i < 5; i++) {
                this.waveAngle += Math.PI / 60;
                var laser = new Projectile(
                    /* Sprite */ 'abilityLaser',
                    /* Offset */ 0, 54 + BULLET_SPEED * i / 5,
                    /* Source */ this, this,
                    /* Speed  */ 10,
                    /* Angle  */ this.waveAngle,
                    /* Damage */ 0.5 * this.get('damage'),
                    /* Range  */ 999,
                    /* Pierce */ true,
                    /* Target */ Robot.ENEMY
                );
                this.bullets.push(laser);
            }
        }
    }
}