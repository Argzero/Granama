/**
 * Sets up the Rocket Stance skill which gives a boost
 * to range while turning punches into exploding fists.
 *
 * @param {Player} player - player to set up for
 */ 
function skillRocketStance(player) {
    
    // Data for the rocket punches
    player.rocketData = {
        sprite     : 'pMeteorFist',
        cd         : 0,
        range      : 250,
        rate       : 0,
        speed      : 20,
        dx         : player.leftArm.pos.x,
        dy         : player.leftArm.pos.y + 20,
        angleOffset: 0,
        target     : Robot.ENEMY,
        onHit      : projEvents.rocketHit,
        onBlocked  : projEvents.rocketExpire,
        onExpire   : projEvents.rocketExpire,
        extra      : {
            type      : 'Meteor',
            knockback : 25,
            radius    : 150 
        }
    };
    
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
        
        // Switching sides for the rocket
        if (this.rocketData.cd > this.prevRocketCd) {
            this.rocketData.dx = -this.rocketData.dx;
        }
        this.prevRocketCd = this.rocketData.cd;
        
        // Offset modification
        this.leftArm.fistOffset = this.rightArm.fistOffset = this.skillDuration > 0 ? 35 : 31;
        this.leftArm.sideOffset = this.rightArm.sideOffset = this.skillDuration > 0 ? 19 : 11;
        
        // Weapon modification
        this.activeData = this.skillDuration > 0 ? this.rocketData : this.punchData;
        this.rocketData.rate = this.punchData.rate;
        this.rocketData.damage = this.punchData.damage;
    };
}