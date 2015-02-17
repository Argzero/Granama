function skillReflector(player) {

    // Activating the ability
    player.onUpdate = function() {
        if (this.isSkillCast()) {
            this.skillDuration = 300;
            this.skillCd = 600;
        }
    }

    // Damage immunity and reflection while active
    player.onDamaged = function(amount, damager) {
        if (this.skillDuration > 0) {
            var reflection = new Projectile(
                "abilityReflect",
                0, 0,
                this, this,
                10, 
                rand(360) * Math.PI / 180,
                amount * 2,
                999999,
                false,
                damager.type
            );
            reflection.setupHoming(damager, rand(10) / 100 + 0.04);
            gameScreen.bullets.push(reflection);
            return 0;
        }
    }
}