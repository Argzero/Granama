function SkillArtillery(player) {
    
    // Skill effects
    player.onMove = function() {
    
        var chargeRate = 0.1 + 0.04 * this.upgrades[CHARGE_ID];
        this.disabled = this.range;
        
        // Activating the ability
        if (this.IsSkillCast() && this.charge > 0 && !this.range) {
            this.range = 75;
            this.bonus = 0;
            this.timer = 0;
        }
        
        // Active skill effects
        else if (this.range) {
            
            // Successive hits
            if (this.timer) {
                if (this.charge <= 1) {
                    this.range = 0;
                    return 0.00001;
                }
                else {
                    this.timer++;
                }
            }
            
            // Range increases over time
            else {
                this.range = Math.min(this.range + 10, 499 + 50 * this.upgrades[RAIL_ID]);
            }
            
            // Firing the artillery
            if (this.input.ability == 1 || this.timer == 30) {
                //sprite, source, x, y, velX, velY, angle, damage, range, radius, knockback, lists
                var used = Math.min(25, this.charge);
                var rocket = RocketProjectile(
                    GetImage('missile'),
                    this,
                    0,
                    this.range, 
                    0, 
                    0, 
                    this.angle, 
                    20 * this.GetDamageMultiplier() * used / 25 * (1 + this.bonus),
                    0,
                    50 + used * 6,
                    0,
                    [gameScreen.enemyManager.enemies, gameScreen.enemyManager.turrets]
                );
                this.bullets.push(rocket);
                this.charge -= used;
                this.bonus += 0.25;
                this.timer = 1;
            }
            
            return 0.00001;
        }
        
        // Charging up
        else if (this.charge < 100) {
            this.charge += chargeRate;
        }
    }
}