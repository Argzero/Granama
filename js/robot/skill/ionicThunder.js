function skillIonicThunder(player) {

    // Skill effects
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast() && this.charge > 0 && this.skillDuration <= 0) {
            this.skillDuration = this.charge * 2 - 1;
            this.nextWave = 60;
            this.nextWaveIncrement = 50;
            this.buff('defense', 0.1, this.skillDuration);
            this.buff('speed', 0, this.skillDuration);
        }

        // Active skill effects
        if (this.skillDuration > 0) {
        
            // Main beam
            var elapsed = this.charge * 2 - this.skillDuration;
            var laser = new Projectile(
                'abilityCannon',
                0, 0,
                this, this,
                10,
                0,
                elapsed * this.get('power') * 0.01,
                399 + 50 * this.upgrades[RAIL_ID] + elapsed / 2,
                true,
                Robot.ENEMY
            );
            laser.size.x = laser.size.y = 0.01 * elapsed;
            this.bullets.push(laser);

            // Shockwave
            /*
            if (elapsed >= this.nextWave) {
                this.nextWave += this.nextWaveIncrement;
                this.nextWaveIncrement -= 10;
                for (var i = 0; i < 2; i++) {
                    var shockwave = Shockwave(
                        this,
                        '#0ff',
                        '#0bb',
                        this.x,
                        this.y,
                        10,
                        Math.PI * i,
                        Math.PI * (i + 1),
                        30,
                        20,
                        this.GetDamageMultiplier(),
                        100 + elapsed * 2,
                        0
                    );
                    this.bullets.push(shockwave);
                }
            }
            */

            var push = this.forward().multiply(-elapsed / 50, -elapsed / 50);
            this.move(push.x, push.y);
            this.clamp();
            if (this.skillDuration <= 1) {
                this.charge = 0;
            }
        }
        
        // Charge over time while not using ability
        else if (this.charge < 100) {
            this.charge += 0.05 + 0.02 * this.upgrades[CHARGE_ID];
        }
    }
}