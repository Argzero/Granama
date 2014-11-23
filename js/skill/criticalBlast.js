function SkillCriticalBlast(player) {
    player.onMove = function() {

        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillDuration = 5;
            this.skillCd = 1200 * this.cdm;
        }

        // Active ability effects
        if (this.skillDuration > 0) {
            for (var i = 0; i < 15; i++) {
                var bonus = (Rand(30) - 15) * Math.PI / 180;
                var cos = -Math.sin(this.angle + bonus);
                var sin = Math.cos(this.angle + bonus);
                var shell = ProjectileBase(
                    GetImage('abilityShell'),
                    this,
                    -30,
                    45,
                    cos * 15,
                    sin * 15,
                    this.angle + bonus,
                    3 * this.GetDamageMultiplier(),
                    449,
                    false,
                    true
                );
                shell.hitBase = shell.Hit;
                shell.Hit = projectileFunctions.hitCritical;
                this.bullets.push(shell);
            }
        }
    }
}