var LASER_BOMB_OFFSET = 150;
var LASER_BOMB_ROTATION = Math.PI / 7;
var LASER_BOMB_SIZE_SCALE = 10;

/**
 * Sets up the Laser Bomb skill for a player which charges up
 * a laser orb and fires it out, blowing up like a rocket for
 * a lot of damage that scales with the number of drones.
 *
 * @param {Player} player - player to set up for
 */
function skillLaserBomb(player) {

    player.chargeBall = new Sprite('pCommandoChargeBall', 0, LASER_BOMB_OFFSET).child(this, true);
    player.postChildren.push(player.chargeBall);
    player.chargeBall.hidden = true;

    /**
     * Updates the ability each frame, handling 
     * casting and firing the missile at the end
     * of the charge time.
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            this.skillCd = 600;
            this.skillDuration = 120;
        }

        // Fire projectile at end of charging
        if (this.skillDuration == 1) {
            var bomb = new Projectile(
                /* Sprite */ 'pCommandoChargeBall',
                /* Offset */ 0, LASER_BOMB_OFFSET,
                /* Source */ this, this,
                /* Speed  */ 15,
                /* Angle  */ 0,
                /* Damage */ this.get('power') * (40 + this.drones.length * 8),
                /* Range  */ 499, 
                /* Pierce */ false,
                /* Target */ Robot.ENEMY
            );
            bomb.setupRocket(
                /* Type      */ 'Commando',
                /* Radius    */ 160 + this.drones.length * 30,
                /* Knockback */ 180 + this.drones.length * 40
            );
            bomb.setupSpinning(LASER_BOMB_ROTATION);
            var size = (LASER_BOMB_SIZE_SCALE * this.drones.length + 40) / bomb.sprite.width;
            bomb.scale(size, size);
            gameScreen.bullets.push(bomb);
            connection.fireProjectile(bomb);
        }
        
        // Charge ball orientation
        else if (this.skillDuration > 0) {
            var angle = -this.skillDuration * LASER_BOMB_ROTATION;
            this.chargeBall.setRotation(Math.cos(angle), Math.sin(angle));
        }
        
        // Apply statuses depending on the skill state
        this.charging = this.skillDuration > 0;
        this.speed = (this.charging ? 0.5 : 1) * this.baseSpeed;
        this.chargeBall.hidden = this.skillDuration <= 1;
    };
}
