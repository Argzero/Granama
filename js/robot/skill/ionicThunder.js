/**
 * Sets up the Ionic Thunder skill for the player which
 * fires a laser and shockwaves while the player is immobilized
 * and pushed backwards
 */
function skillIonicThunder(player) {

    /**
     * Updates the skill each frame, applying stat changes, firing
     * the laser, and applying shockwaves when applicable.
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast() && this.charge > 0 && this.skillDuration <= 0) {
            this.skillDuration = this.charge * 2 - 1;
            this.nextWave = 60;
            this.nextWaveIncrement = 50;
            this.defense = 1 - 1.8 / (players.length + 1);
            this.speed = 0;
        }
        
        // Charge over time while not using ability
        if (this.skillDuration <= 0 && this.charge < 100) {
            this.charge += 1 + 0.05 + 0.02 * this.upgrades[CHARGE_ID];
        }
        
        // Active skill effects
        if (this.skillDuration > 0) {
        
            // Main beam
            var elapsed = this.charge * 2 - this.skillDuration;
            var laser = new Projectile(
                /* Sprite  */ 'abilityCannon',
                /* Offset  */ 0, 0,
                /* Shooter */this, this,
                /* Speed   */ 10,
                /* Angle   */ 0,
                /* Damage  */ elapsed * this.get('power') * 0.01,
                /* Range   */ 399 + 50 * this.upgrades[RAIL_ID] + elapsed / 2,
                /* Pierce  */ true,
                /* Target  */ Robot.ENEMY
            );
            laser.size.x = laser.size.y = 0.01 * elapsed;
            gameScreen.bullets.push(laser);

            // Shockwave
            if (elapsed >= this.nextWave) {
                this.nextWave += this.nextWaveIncrement;
                this.nextWaveIncrement -= 10;
                for (var i = 0; i < 2; i++) {
                    var shockwave = new Shockwave(
                        /* Shooter   */ this,
                        /* Color 1   */ '#0ff',
                        /* Color 2   */ '#0bb',
                        /* Position  */ this.pos.x, this.pos.y,
                        /* Speed     */ 10,
                        /* Start     */ Math.PI * i,
                        /* End       */ Math.PI * (i + 1),
                        /* Radius    */ 30,
                        /* Thickness */ 20,
                        /* Damage    */ this.get('power'),
                        /* Range     */ 100 + elapsed * 2,
                        /* Knockback */ 0,
                        /* Target    */ Robot.ENEMY
                    );
                    gameScreen.bullets.push(shockwave);
                }
            }

            var push = this.forward().multiply(-elapsed / 50, -elapsed / 50);
            this.move(push.x, push.y);
            this.clamp();
            if (this.skillDuration <= 1) {
                this.charge = 0;
            }
        }
        
        // Restore stats when not active
        else {
            this.speed = this.baseSpeed;
            this.defense = 1;
        }
    };
}