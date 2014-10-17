function SkillGyroSlash(player) {
    player.onMove = function(speed) {
    
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillDuration = 360;
            this.skillCd = 900;
            
            // Spinning sword
            var sword = SwordProjectile(
                GetImage('abilitySword'),
                this,
                0,
                0,
                150,
                0,
                this.GetDamageMultiplier() * 4,
                Math.PI * 10,
                50,
                0.1 + this.upgrades[LIFESTEAL_ID] * 0.015
            );
            this.bullets.push(sword);
        }
        
        // Effects while active
        if (this.skillDuration > 0) {
        
            // Double the speed
            return speed * 2;
        }
    };
}