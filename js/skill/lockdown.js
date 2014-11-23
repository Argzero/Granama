function SkillLockdown(player) {

    // Skill effects
    player.onMove = function() {

        var chargeRate = 2 + 0.3 * this.upgrades[CHARGE_ID];
        this.disabled = this.locked || this.charge > 0;

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
            if ((this.charge > 0 && this.input.shoot == 1) || (this.IsInRange() && this.charge >= 100)) {
                var laser = ProjectileBase(
                    GetImage('abilityLaser'),
                    this,
                    0,
                    this.getTurretY(),
                    this.cos * 20,
                    this.sin * 20,
                    this.angle,
                    40 * this.GetDamageMultiplier() * this.charge / 100,
                    299 + 50 * this.upgrades[RAIL_ID] + 2 * this.charge,
                    true,
                    true
                );
                this.bullets.push(laser);
                this.charge = -20;
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