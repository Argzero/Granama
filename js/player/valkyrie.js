// Load in ability scripts
depend('robot/skill/artillery');
depend('robot/skill/ionicThunder');
depend('robot/skill/lockdown');

/**
 * A valkyrie player that uses a twin shot laser and a
 * rail cannon as its main weapons
 */
function PlayerValkyrieType() {
    //         Sprite Name      X  Y  Type          HP   Speed  HP+  Damage+  Shield+  Speed+
	this.super('pValkyrieBody', 0, 0, Robot.PLAYER, 100, 3,     14,  2,       1,       1.5);

    // Moving sprites
    this.shell1 = new Sprite('pValkyrieShell', 0, 0).child(this, true);
    this.shell2 = new Sprite('pValkyrieShell', 0, 0).child(this, true);
    this.rod1 = new Sprite('pValkyrieRod', 0, 0).child(this, true);
    this.rod2 = new Sprite('pValkyrieRod', 0, 0).child(this, true);
    this.wing = new Sprite('pValkyrieWing', 0, 0).child(this, true);
    this.leftRail = new Sprite('pValkyrieRailLeft', 0, 0).child(this, true);
    this.rightRail = new Sprite('pValkyrieRailRight', 0, 0).child(this, true);
    this.turret = new Sprite('pValkyrieTurret', 0, 0).child(this, true);
    this.scope = new Sprite('pValkyrieScope', 0, 0).child(this, true);
    
    // Sprites drawn on top of the robot's body
	this.postChildren.push(
        new Sprite('pValkyrieShield', 30, 0).child(this, true),
        new Sprite('pValkyrieGun', -30, 0).child(this, true),
        this.shell1,
        this.shell2,
        this.rod1,
        this.rod2,
        this.wing,
        this.leftRail,
        this.rightRail,
        this.turret,
        this.scope
    );
    
    // Twin shot data
    this.gunData = {
        sprite: 'laser',
        cd    : 0,
        range : 499,
        list  : p.bullets,
        dx    : -35,
        dy    : 40,
        pierce: true,
        target: Robot.ENEMY
    };
    this.charge = 0;
    this.disabled = false;
}

/** 
 * Applies weapons and updates child sprite locations each frame
 */ 
PlayerValkyrie.prototype.applyUpdate = function() {

    // Damage multiplier
    var m = this.get('power');

    // Double shot
    if (!this.disabled) {
        this.gunData.damage = m;
        this.gunData.rate = 120 / (5 + this.upgrades[DUAL_ID] * 2.5);
        this.Shoot(this.gunData);
        this.gunData.dx += 10;
        this.Shoot(this.gunData);
        this.gunData.dx -= 10;
    }
};