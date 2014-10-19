function SkillLockdown(player) {
    
    // Skill effects
    player.onMove = function() {
    
        var chargeRate = 1 + 0.2 * this.upgrades[CHARGE_ID];
        this.disabled = this.locked || this.charge > 0;
        
        console.log("Locked: " + this.locked + ", Charge: " + this.charge);
        
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillCooldown = Math.round(100 / chargeRate);
            this.locked = !this.locked;
        }
        
        // Active skill effects
        if (this.locked) {
            
            // Charging
            if (this.charge < 100) {
                this.charge += chargeRate;
            }
            
            // Laser firing
            if (this.IsInRange() && this.charge >= 100) {
                var laser = ProjectileBase(
                    GetImage('abilityLaser'),
                    this,
                    0,
                    this.getTurretY(), 
                    this.cos * 10, 
                    this.sin * 10, 
                    this.angle, 
                    10 * this.GetDamageMultiplier(), 
                    599 + 50 * this.upgrades[RAIL_ID],
                    true,
                    true
                );
                this.bullets.push(laser);
                this.charge = 0;
                this.skillCooldown = Math.round(100 / chargeRate);
            }
            
            return 0.00001;
        }
        
        // Unlocking
        else if (this.charge > 0) {
            this.charge -= 2 * chargeRate;
            return 0.00001;
        }
    }
}