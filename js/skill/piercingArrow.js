function SkillPiercingArrow(player) {
    player.onMove = function() {
    
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillCd = 600;
            var arrow = SlowProjectile(
                GetImage('abilityArrow'),
                this,
                0,
                40,
                this.cos * 15,
                this.sin * 15,
                this.angle,
                this.GetDamageMultiplier() * 10,
                1249,
                true,
                true,
                0.5,
                300
            );
            this.bullets.push(arrow);
        }
    }
}