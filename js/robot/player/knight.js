// Load in ability scripts
depend('robot/skill/gyroSlash');
depend('robot/skill/piercingArrow');
depend('robot/skill/sweepingBlade');

/**
 * The Knight player which uses a sword and
 * a grappling hook as its main attacks
 *
 * @constructor
 */
extend('PlayerKnight', 'Player');
function PlayerKnight() {
    //         Sprite Name    X  Y  Type          HP   Speed  HP+  Damage+  Shield+  Speed+
    this.super('pKnightBody', 0, 0, Robot.PLAYER, 100, 3,     25,  1,       3,       1);

    this.swordSprite = new Sprite('sword', -16, 40).child(this, true);
    this.grappleFull = new Sprite('pKnightGrappleFull', 0, -5).child(this, true);
    this.grappleEmpty = new Sprite('pKnightGrappleEmpty', 0, -10).child(this, false);
    
    // Sprites drawn on top of the robot's body
    this.postChildren.push(
        new Sprite('pKnightShield', 26, 15).child(this, true),
        new Sprite('pKnightArm', -32, 10).child(this, true),
        this.grappleFull,
        this.grappleEmpty,
        this.swordSprite
    );
    
    // Weapon data
    this.swordData = {
        sprite     : 'sword',
        cd         : 0,
        rate       : 60,
        speed      : 0,
        angleOffset: 45,
        pierce     : true,
        target     : Robot.ENEMY,
        dx         : -16,
        dy         : 40,
        //                                args: [radius, arc, knockback, lifesteal]
        templates  : [{ name: 'setupSword', args: [100,    0,   50,        0] }]
    };
    this.grappleData = {
        sprite   : 'grappleHook',
        cd       : 0,
        range    : 750,
        rate     : 180,
        speed    : 20,
        target   : Robot.MOBILE,
        //                                  args: [stun, self]
        templates: [{ name: 'setupGrapple', args: [0,    false] }]
    };
    this.gun = weapon.gun;
    this.sword = false;
}
    
/** 
 * Applies weapons for the Knight and updates the sword's orientation
 */
PlayerKnight.prototype.applyUpdate = function() {
    
    // Damage multiplier
    var m = this.get('power');

    // Grapple
    this.grappleData.damage = m;
    this.grappleData.templates[0].args[0] = 30 + this.upgrades[ARROW_ID] * 10;
    this.gun(this.grappleData);

    // Sword
    this.swordData.damage = 8 * m;
    this.swordData.templates[0].args[1] = Math.PI / 3 + this.upgrades[SLASH_ID] * Math.PI / 18;
    this.swordData.templates[0].args[3] = 0.1 + this.upgrades[LIFESTEAL_ID] * 0.04;
    this.gun(this.swordData);
    
    // Hide held sword when swinging
    this.swordSprite.hidden = this.sword;
    
    // Orient grapple gun and set visibility depending on the grapple state
    this.grappleFull.hidden = this.grapple;
    this.grappleEmpty.hidden = !this.grapple;
    if (this.grapple) {
        this.grappleEmpty.lookAt(this.grapple.pos.clone().subtractv(this.pos));
    }
};