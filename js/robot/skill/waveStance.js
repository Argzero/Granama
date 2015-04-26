/**
 * Sets up the Wave Stance skill which causes shockwaves
 * to emit with each punch along with a boost to stun
 * duration and knockback.
 *
 * @param {Player} player - player to set up for
 */ 
function skillWaveStance(player) {
    
    // Flag to tell arms to straighten out when ability is active
    player.straighten = true;

    /**
     * Updates the skill each frame, handling casting
     * and applying buffs
     */
    player.onUpdate = function() {
    
        // Cast the skill
        if (this.isSkillCast()) {
            this.skillDuration = 360;
            this.skillCd = 480;
        }
        
        // Offset modification
        this.leftArm.sideOffset = this.rightArm.sideOffset = this.skillDuration > 0 ? 15 : 11;
        this.leftArm.fins.hidden = this.rightArm.fins.hidden = this.skillDuration <= 0;
        
        // Punch buffs
        if (this.skillDuration > 0) {
            
            // Shockwaves
            if (this.punchData.cd > this.prevPunchCd) {
                var ups = this.upgrades[METEOR_ABILITY_ID];
                for (var i = 0; i < 2; i++) {
                    var shockwave = new Shockwave(
                        /* Shooter   */ this,
                        /* Color 1   */ '#0aa',
                        /* Color 2   */ '#055',
                        /* Position  */ this.pos.x, this.pos.y,
                        /* Speed     */ 10,
                        /* Start     */ Math.PI * i,
                        /* End       */ Math.PI * (i + 1),
                        /* Radius    */ 30,
                        /* Thickness */ 25,
                        /* Damage    */ this.get('power') * (1 + ups * 0.1),
                        /* Range     */ 150 + 10 * ups,
                        /* Knockback */ 0,
                        /* Target    */ Robot.ENEMY
                    );
                    gameScreen.bullets.push(shockwave);
                }
            }
            this.prevPunchCd = this.punchData.cd;
            
            // Stun and knockback bonuses
            this.punchData.extra.knockback = 300;
            this.sm = 2;
        }
        
        // Revert when not active
        else {
            this.prevPunchCd = 999;
            this.punchData.extra.knockback = 25;
            this.sm = 1;
        }
    };
}