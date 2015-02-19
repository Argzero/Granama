/**
 * Sets up the Artillery skill which extends a crosshair
 * and then drops down explosives on the target location,
 * growing in power each successive hit.
 */ 
function skillArtillery(player) {

    player.reticle = new Sprite('pValkyrieTarget', 0, 0).child(this, true);
    player.postChildren.push(player.reticle);
    player.reticle.hidden = true;

    /**
     * Updates the skill each frame, controlling the crosshair
     * and creating explosions when applicable
     */
    player.onUpdate = function() {

        var chargeRate = 0.1 + 0.04 * this.upgrades[CHARGE_ID];
        this.reticle.hidden = !this.range;

        // Activating the ability
        if (this.isSkillCast() && this.charge > 0 && !this.range) {
            this.range = 75;
            this.bonus = 0;
            this.timer = 0;
            this.speed = 0;
            this.defense = 1 - 1.8 / (players.length + 1);
        }

        // Active skill effects
        else if (this.range) {

            // Successive hits
            if (this.timer) {
                if (this.charge <= 1) {
                    this.range = 0;
                    this.speed = this.baseSpeed;
                    this.defense = 1;
                }
                else {
                    this.timer++;
                }
            }

            // Range increases over time
            else {
                this.range = Math.min(this.range + 10, 499 + 50 * this.upgrades[RAIL_ID]);
				
				// Move the reticle over the target location
				this.reticle.moveTo(0, this.range);
            }
            
            // Firing the artillery
            if (this.input.button(SKILL) == 1 || this.timer == 30) {
                var used = Math.min(25, this.charge);
                var rocket = new Projectile(
                    'missile',
                    0, this.range,
                    this, this,
                    0,
                    0,
                    25 * this.get('power') * (used / 25) * (1 + this.bonus),
                    0,
                    true,
                    Robot.ENEMY
                );
                rocket.setupRocket('Valkyrie', 150 + used * 10, 1);
                    
                gameScreen.bullets.push(rocket);
                this.charge -= used;
                this.bonus += 0.5;
                this.timer = 1;
            }
        }

        // Charging up
        else if (this.charge < 100) {
            this.charge += chargeRate;
        }
    }
}