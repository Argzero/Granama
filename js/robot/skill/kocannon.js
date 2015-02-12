function skillKOCannon(player) {
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            this.skillDuration = 120;
            this.skillCd = 600;
        }

        // Active skill effects
        if (this.skillDuration > 0) {
            var laser = new Projectile(
                /* Sprite */ 'abilityCannon',
                /* Offset */ 0, 54,
                /* Source */ this, this,
                /* Speed  */ 10,
                /* Angle  */ 0,
                /* Damage */ 0.4 * this.get('damage'),
                /* Range  */ 999,
                /* Pierce */ true,
                /* Target */ Robot.ENEMY
            );
            gameScreen.bullets.push(laser);
        }
    }
}