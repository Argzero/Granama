// Load in ability scripts
depend('robot/skill/hurricaneStance');
depend('robot/skill/rocketStance');
depend('robot/skill/waveStance');

/**
 * The Knight player which uses a sword and
 * a grappling hook as its main attacks
 *
 * @constructor
 */
extend('PlayerMeteor', 'Player');
function PlayerMeteor() {
    //         Sprite Name    X  Y  Type          HP   Speed  HP+  Damage+  Shield+  Speed+
    this.super('pMeteorBody', 0, 0, Robot.PLAYER, 100, 4,     25,  1.5,     2,       1);

    // Meteor's arms
    this.leftArm = new MeteorArm(true).child(this, true);
    this.rightArm = new MeteorArm(false).child(this, true);
    
    // Sprites drawn on top of the robot's body
    this.postChildren.push(
        this.leftArm, this.rightArm
    );
    
    // Weapon data
    this.punchData = {
        sprite     : 'pMeteorFist',
        cd         : 0,
        range      : 100,
        rate       : 60,
        speed      : 20,
        dx         : this.leftArm.pos.x,
        dy         : this.leftArm.pos.y + 20,
        angleOffset: 15,
        target     : Robot.ENEMY,
        onUpdate   : projEvents.grappleUpdate,
        onHit      : projEvents.punchHit,
        onBlocked  : projEvents.grappleExpire,
        onExpire   : projEvents.grappleExpire,
        extra      : {
            knockback : 25,
            stun      : 20 
        }
    };
    this.activeData = this.punchData;
    this.gun = weapon.gun;
    this.left = false;
    this.right = false;
    this.grapple = false;
    
    // Attack rate multiplier (lower = faster attack)
    this.rm = 1;
    
    // Stun multiplier (higher = longer stun)
    this.sm = 1;
}
   
/** 
 * Applies weapons for the Knight and updates the sword's orientation
 */
PlayerMeteor.prototype.applyUpdate = function() {
    
    // Update each arm
    this.leftArm.update();
    this.rightArm.update();
    
    // Damage multiplier
    var m = this.get('power');

    // Punches
    this.punchData.damage = m * 10;
    this.punchData.rate = this.rm * 208 / (this.upgrades[PUNCH_SPEED_ID] + 3);
    this.punchData.extra.stun = this.sm * (20 + this.upgrades[PUNCH_STUN_ID] * 4);
    
    // Use the currently active weapon (may not be punches such as during rocket stance)
    this.gun(this.activeData);
    
    // Switch sides when firing the fist
    if (this.grapple && this.grapple != this.lastGrapple) {
        this.lastGrapple = this.grapple;
        if (this.punchData.dx > 0) this.left = this.grapple;
        else this.right = this.grapple;
        this.punchData.dx = -this.punchData.dx;
        this.punchData.angleOffset = -this.punchData.angleOffset;
    }
    
    // Update visibility of fists
    if (this.left && this.left.expired) this.left = false;
    if (this.right && this.right.expired) this.right = false;
    this.leftArm.fist.hidden = this.left;
    this.rightArm.fist.hidden = this.right;
};

/**
 * Represents one arm for the Meteor player
 *
 * @param {boolean} left - whether or not this is the left arm
 */
extend('MeteorArm', 'Sprite');
function MeteorArm(left) {
    var m = (left ? 1 : -1);
    var s = (left ? 'Left' : 'Right');
    this.super('pMeteorArm' + s, 40 * m, 20);
    
    // Basic stance starts rotated
    this.rotate(COS_15, m * SIN_15);
    this.rotations = 15;
    
    // Target offsets for components - will interpolate to these
    this.barOffset = 13;
    this.sideOffset = 11;
    this.fistOffset = 31;
    this.m = m;
    
    // Pieces that make up the arm
    this.side = new Sprite('pMeteorSidebar' + s, this.sideOffset * m, 3).child(this, true);
    this.bar  = new Sprite('pMeteorBar',  0, this.barOffset).child(this, true);
    this.fist = new Sprite('pMeteorFist', 0, this.fistOffset).child(this, true);
    this.fins = new Sprite('pMeteorFins', 0, 23).child(this, true);
    this.fins.hidden = true;
    
    // All are drawn under the arm except the top bar
    this.preChildren.push(this.side, this.fist, this.fins);
    this.postChildren.push(this.bar);
}

/**
 * Updates the positioning of the pieces of the arm over time
 */
MeteorArm.prototype.update = function() {
    
    // Orientation
    if (this.parent.straighten) {
        if (this.parent.skillDuration > 0 && this.rotations > 0) {
            this.rotate(COS_1, -this.m * SIN_1);
            this.rotations--;
        }
        else if (this.parent.skillDuration <= 0 && this.rotations < 15) 
        {
            this.rotate(COS_1, this.m * SIN_1);
            this.rotations++;
        }
    }
    
    // Update fist offset
    if (this.fist.pos.y >= this.fistOffset + 1) this.fist.pos.y--;
    if (this.fist.pos.y <= this.fistOffset - 1) this.fist.pos.y++;
    
    // Update top bar offset
    if (this.bar.pos.y >= this.barOffset + 1) this.bar.pos.y--;
    if (this.bar.pos.y <= this.barOffset - 1) this.bar.pos.y++;
    
    // Update side bar offset
    if (this.side.pos.x * this.m >= this.sideOffset + 1) this.side.pos.x -= this.m;
    if (this.side.pos.x * this.m <= this.sideOffset - 1) this.side.pos.x += this.m;
};