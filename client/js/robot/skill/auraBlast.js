/**
 * Sets up the Aura Blast skill for the player which
 * released a shockwave that deals AOE damage
 *
 * @param {Player} player - player to set up for
 */
function skillAuraBlast(player) {

    /**
     * Updates the skill each frame, handling casting
     * and releasing the shockwave
     */
    player.onUpdate = function() {
    
        // Casting the skill
        if (this.isSkillCast()) {
            connection.ability(this);
            this.skillCd = 480;
            this.staticActive = !this.staticActive;
            
            if (this.isRemote()) return;
            
            var color1, color2;
            var thickness;
            var damage;
            
            //since the aura immediately changes, we want to 'blast away' the old one
            if(!player.staticActive)
            {
                color1 = '#0ff';
                color2 = '#06c';
                damage = this.get('power') * (2 + 0.2 * player.upgrades[STATIC_AURA_ID]);
            }
            else
            {
                color1 = '#f0f';
                color2 = '#c06';
                damage = this.get('power') * (2 + 0.2 * player.upgrades[POWER_AURA_ID]);
            }
            
            // Release the shockwave
            // Use two parts for math reasons
            for (var i = 0; i < 2; i++) 
            {
                var shockwave = new Shockwave(
                    this,
                    color1,
                    color2,
                    this.pos.x,
                    this.pos.y,
                    10,
                    Math.PI * i,
                    Math.PI * (i + 1),
                    30,
                    this.getAuraRadius() * 0.5,
                    damage,
                    700,
                    0,
                    Robot.ENEMY
                );
                
                gameScreen.bullets.push(shockwave);
            }
        }
    };
}