/**
 * Sets up the Missile Barrage skill for a player that
 * fires a rocket from each of the player's drones.
 *
 * @param {Player} player to set the skill up for
 */
function skillMissileBarrage(player) {

    /**
     * Handles casting the skill
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            this.skillCd = 480;

            // Fire rockets from each drone
            var damage = this.get('power') * 30;
            for (var i = 0; i < this.drones.length; i++) {
                var rocket = new Projectile(
                    /* Sprite */ 'abilityMissile',
                    /* Offset */ 0, 0,
                    /* Source */ this, this.drones[i],
                    /* Speed  */ 15,
                    /* Angle  */ 0,
                    /* Damage */ damage,
                    /* Range  */ 449, 
                    /* Pierce */ false,
                    /* Target */ Robot.ENEMY
                );
                rocket.setupRocket(
                    /* Type      */ 'Commando',
                    /* Radius    */ 200,
                    /* Knockback */ 300
                );
                gameScreen.bullets.push(rocket);
                connection.fireProjectile(rocket);
            }
        }
    };
}