function SkillStasis(player) {
    
    // Skill effects
    player.onMove = function() {
    
        // Activating the ability
        if (this.IsSkillCast() && this.health < this.maxHealth) {
            this.pluses = [];
            this.skillDuration = STASIS_DURATION;
            this.skillCd = STASIS_CD;
        }
        
        // Active skill effects
        if (this.skillDuration > 0) {
            this.health += this.maxHealth * STASIS_REGEN / STASIS_DURATION;
            if (this.health >= this.maxHealth) {
                this.health = this.maxHealth;
                this.skillDuration = 0;
            }
            else if (this.skillDuration % 15 == 0) {
                if (this.pluses.length == 5) {
                    this.pluses.splice(0, 1);
                }
                var angle = Math.random() * 2 * Math.PI;
		        var c = Math.cos(angle);
		        var s = Math.sin(angle);
		        this.pluses[this.pluses.length] = new Plus(this.x, this.y, 2 * c, 2 * s);
            }
            
            return 0;
        }
    }
    
    // Damage reduction while active
    player.onDamaged = function(amount, damager) {
        if (this.skillDuration > 0) {
            return amount * STASIS_REDUCTION;
        }
    }
    
    // Draw the pluses
    player.onDraw = function() {
        if (this.skillDuration > 0) {
            for (var i = 0; i < this.pluses.length; i++) {
                this.pluses[i].Draw(canvas);
            }
        }
    }
}