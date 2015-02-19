// Load in ability scripts
depend('robot/skill/artillery');
depend('robot/skill/ionicThunder');
depend('robot/skill/lockdown');

/**
 * A valkyrie player that uses a twin shot laser and a
 * rail cannon as its main weapons
 */
extend('PlayerValkyrie', 'Player');
function PlayerValkyrie() {
    //         Sprite Name      X  Y  Type          HP   Speed  HP+  Damage+  Shield+  Speed+
	this.super('pValkyrieBody', 0, 0, Robot.PLAYER, 100, 3,     14,  2,       1,       1.5);

    // Moving sprites
    this.shell1 = new Sprite('pValkyrieShell', 0, -20).child(this, true);
    this.shell2 = new Sprite('pValkyrieShell', 0, 5).child(this, true);
    this.rod1 = new Sprite('pValkyrieRod', 0, 5).child(this, true);
    this.rod2 = new Sprite('pValkyrieRod', 0, 10).child(this, true);
    this.wing = new Sprite('pValkyrieWing', 0, -8).child(this, true);
    this.leftRail = new Sprite('pValkyrieRailLeft', 0, 0).child(this, true);
    this.rightRail = new Sprite('pValkyrieRailRight', 0, 0).child(this, true);
    this.turret = new Sprite('pValkyrieTurret', 0, 32).child(this, true);
    this.scope = new Sprite('pValkyrieScope', 0, 93).child(this, true);
    
    // Sprites drawn on top of the robot's body
	this.postChildren.push(
        new Sprite('pValkyrieShield', 37, 0).child(this, true),
        new Sprite('pValkyrieGun', -30, 0).child(this, true),
        this.shell1,
        this.rod1,
        this.rod2,
        this.wing,
        this.leftRail,
        this.rightRail,
        this.turret,
        this.scope,
        this.shell2
    );
    
    // Twin shot data
    this.gunData1 = {
        sprite: 'laser',
        cd    : 0,
        range : 499,
        dx    : -35,
        dy    : 40,
        pierce: true,
        target: Robot.ENEMY
    };
	this.gunData2 = {
        sprite: 'laser',
        cd    : 0,
        range : 499,
        dx    : -25,
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
        this.gunData1.damage = this.gunData2.damage = m;
        this.gunData1.rate = this.gunData2.rate = 120 / (5 + this.upgrades[DUAL_ID] * 2.5);
        weapon.gun.bind(this)(this.gunData1);
        weapon.gun.bind(this)(this.gunData2);
    }
	
	// Update sprite positions
	this.shell1.pos.y = Math.max(-38, -18 - 4 * this.charge / 5);
	this.rod2.pos.y = 10 + this.charge / 2;
	this.leftRail.pos.y = this.rightRail.pos.y = Math.min(24, Math.max(0, this.charge - 25));
	this.leftRail.pos.x = -(this.rightRail.pos.x = Math.min(20, Math.max(0, (this.charge - 50) * 4 / 5)));
	this.turret.pos.y = this.leftRail.pos.y + 32 + Math.max(0, this.charge - 75);
	this.scope.pos.y = this.turret.pos.y + 61;
	this.shell2.pos.y = this.leftRail.pos.y + 5;
	this.scope.hidden = this.speed != 0;
};
