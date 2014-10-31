function SkillMissileBarrage(player) {
    player.onMove = function() {
    
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillCd = 480;
            
            // Fire rockets from each drone
            var damage = this.GetDamageMultiplier() * 20;
            for (var i = 0; i < this.drones.length; i++) {
                var rocket = RocketProjectile(
                    GetImage('abilityMissile'),
                    this.drones[i],
                    0,
                    0,
                    this.drones[i].cos * 15,
                    this.drones[i].sin * 15,
                    this.drones[i].angle,
                    damage,
                    449,
                    200,
                    300,
					this.name,
                    [gameScreen.enemyManager.enemies, gameScreen.enemyManager.turrets]
                );
                rocket.source = this;
                this.bullets.push(rocket);
            }
        }
    };
}