/**
 * Sets up the Repulse skill for the player which
 * released a shockwave that pushes away enemies
 *
 * @param {Player} player - player to set up for
 */
function skillRepulse(player) {

    /**
     * Updates the skill each frame, handling casting
     * and releasing the shockwave
     */
    player.onUpdate = function() {
    
        // Casting the skill
        if (this.isSkillCast()) {
            this.skillCd = 480;
            this.staticActive = !this.staticActive;
            
            var color1, color2;
            var thickness;
            var damage;
            
            //since the aura immediately changes, we want to 'blast away' the old one
            if(!player.staticActive)
            {
                color1 = '#0ff';
                color2 = '#06c';
                damage = this.get('power') * (0.2 + 0.08 * player.upgrades[STATIC_AURA_ID]);
            }
            else
            {
                color1 = '#f0f';
                color2 = '#c06';
                damage = this.get('power') * (0.2 + 0.08 * player.upgrades[POWER_AURA_ID]);
            }
            
            // Release the shockwave
            var shockwave = new Shockwave(
                this,
                color1,
                color2,
                this.pos.x,
                this.pos.y,
                10,
                Math.PI / 4,
                Math.PI * 3 / 4,
                30,
                this.getAuraRadius() * 0.5,
                damage,
                700,
                50,
                Robot.ENEMY
            );
            gameScreen.bullets.push(shockwave);
        }
    };
}