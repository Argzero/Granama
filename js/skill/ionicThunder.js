function SkillIonicThunder(player) {
    
    // Skill effects
    player.onMove = function() {
    
        // Activating the ability
        if (this.IsSkillCast() && this.charge > 0 && this.skillDuration <= 0) {
            this.skillDuration = this.charge * 2;
        }
        
        // Active skill effects
        if (this.skillDuration > 0) {
            var elapsed = this.charge * 2 - this.skillDuration;
            var laser = ProjectileBase(
                GetImage('abilityCannon'),
                this,
                0,
                this.getTurretY(), 
                this.cos * 10, 
                this.sin * 10, 
                this.angle, 
                elapsed * this.GetDamageMultiplier() / 200, 
                999,
                true,
                true
            );
            laser.scale = 0.01 * elapsed
            this.x -= this.cos * elapsed / 50;
            this.y -= this.sin * elapsed / 50;
            this.clamp();
			this.bullets.push(laser);
            if (this.skillDuration <= 1) {
                this.charge = 0;
            }
            return 0;
        }
        else if (this.charge < 100) {
            this.charge += 0.1;
        }
    }
}