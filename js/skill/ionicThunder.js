function SkillIonicThunder(player) {

    // Skill effects
    player.onMove = function() {

        // Activating the ability
        if (this.IsSkillCast() && this.charge > 0 && this.skillDuration <= 0) {
            this.skillDuration = this.charge * 2;
            this.nextWave = 60;
            this.nextWaveIncrement = 50;
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
                elapsed * this.GetDamageMultiplier() / 100,
                399 + 50 * this.upgrades[RAIL_ID] + elapsed / 2,
                true,
                true
            );
            laser.scale = 0.01 * elapsed;
            this.bullets.push(laser);

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
            /*var shockwave = Shockwave(
             this,
             data.color1 || '#ff9933',
             data.color2 || '#f70',
             this.x + data.dx,
             this.y + data.dy,
             data.speed || 5,
             data.start + this.angle,
             data.end + this.angle,
             data.radius,
             data.thickness || 20,
             data.damage,
             data.range,
             data.knockback
             );*/

            this.x -= this.cos * elapsed / 50;
            this.y -= this.sin * elapsed / 50;
            this.clamp();
            if (this.skillDuration <= 1) {
                this.charge = 0;
            }
            return 0;
        }
        else if (this.charge < 100) {
            this.charge += 0.05 + 0.02 * this.upgrades[CHARGE_ID];
        }
    }
}