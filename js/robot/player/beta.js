// Load in ability scripts
depend('robot/skill/stealth');
depend('robot/skill/piercingArrow');
depend('robot/skill/sweepingBlade');

/**
 * The Knight player which uses a sword and
 * a grappling hook as its main attacks
 *
 * @constructor
 */
extend('PlayerBeta', 'Player');
function PlayerBeta() {
    //         Sprite Name  X  Y  Type          HP   Speed  HP+  Damage+  Shield+  Speed+
    this.super('pBetaBody', 0, 0, Robot.PLAYER, 100, 3,     14,  1,       2,       1.5);

    this.swordSprite = new Sprite('pBetaBlade', -41, 37).child(this, true);
    this.swordCharge = new Sprite('pBetaBladeCharge', 0, 0).child(this.swordSprite, true);
    this.swordSprite.preChildren.push(this.swordCharge);
    
    // Sprites drawn on top of the robot's body
    this.postChildren.push(
        new Sprite('pBetaShield', 41, 35).child(this, true),
        this.swordSprite
    );
    
    // Weapon data
    this.swordData = {
        sprite     : 'pBetaBlade',
        cd         : 0,
        rate       : 60,
        speed      : 0,
        angleOffset: 45,
        pierce     : true,
        target     : Robot.ENEMY,
        dx         : -41,
        dy         : 37,
        //                                  args: [radius, arc,           knockback, lifesteal]
        templates  : [{ name: 'setupSword', args: [100,    Math.PI / 2,   50,        0] }]
    };
    this.shurikenData = {
        sprite        : 'shuriken',
        cd            : 0,
        range         : 500,
        rate          : 60,
        speed         : 10,
        target        : Robot.ENEMY,
        pierce        : true,
        onCollideCheck: projEvents.uniqueCollide,
        onHit         : projEvents.knockbackHit,
        extra         : {
            knockback : 50,
            pierceNum : 0,
        },
        //                                        args: [rotSpeed]
        templates     : [{ name: 'setupSpinning', args: [10] }]
    };
    this.gun = weapon.gun;
    this.sword = false;
    this.charge = 1;
    this.chargeMultiplier = 1;
}
    
/** 
 * Applies weapons for the Knight and updates the sword's orientation
 */
PlayerBeta.prototype.applyUpdate = function() {
    
    // Charging up the sword
    if (!this.sword) {
        this.charge += Math.min(5, this.chargeMultiplier * (0.002 + 0.001 * this.upgrades[CHARGE_SPEED_ID]));
        this.swordCharge.alpha = (this.charge - 1) / 4;
    }
    else this.charge = 1;
    
	// Get the damage multiplier including any damage buffs
    var m = this.get('power');

    // Shurikens
    this.shurikenData.extra.pierceNum = this.upgrades[SHURIKEN_PIERCE_ID] + 1;
    this.shurikenData.damage = m * 20;
    this.gun(this.shurikenData);

    // Sword - only swing when close to enemies
    var closest = gameScreen.getClosest(this.pos, Robot.ENEMY);
    if (closest && closest.pos.distanceSq(this.pos) < 90000) {
        this.swordData.damage = 6 * m * this.charge;
        this.gun(this.swordData);
        
        // Make the charge follow the sword
        if (this.sword && this.sword.preChildren.length === 0) {
            this.sword.preChildren.push(this.swordCharge);
        }
    }
    
    // Hide held sword when swinging
    this.swordSprite.hidden = this.sword;
};