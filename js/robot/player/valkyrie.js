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
    this.shell1 = new Sprite('pValkyrieShell', 0, 0).child(this, true);
    this.shell2 = new Sprite('pValkyrieShell', 0, 0).child(this, true);
    this.rod1 = new Sprite('pValkyrieRod', 0, -14).child(this, true);
    this.rod2 = new Sprite('pValkyrieRod', 0, -8).child(this, true);
    this.wing = new Sprite('pValkyrieWing', 0, -28).child(this, true);
    this.leftRail = new Sprite('pValkyrieRailLeft', 0, -19).child(this, true);
    this.rightRail = new Sprite('pValkyrieRailRight', 0, -19).child(this, true);
    this.turret = new Sprite('pValkyrieTurret', 0, -18).child(this, true);
    this.scope = new Sprite('pValkyrieScope', 0, 0).child(this, true);
    
    // Sprites drawn on top of the robot's body
	this.postChildren.push(
        new Sprite('pValkyrieShield', 30, 0).child(this, true),
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
    this.gunData = {
        sprite: 'laser',
        cd    : 0,
        range : 499,
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
        weapon.gun.bind(this)(this.gunData);
        this.gunData.dx += 10;
        weapon.gun.bind(this)(this.gunData);
        this.gunData.dx -= 10;
    }
};

/*
    // Draw back shell
    var y = Math.max(-56, -36 - 4 * this.charge / 5);
    canvas.drawImage(GetImage('pValkyrieShell'), -12, y);

    // Draw connection rods
    canvas.drawImage(GetImage('pValkyrieRod'), -3, -6);
    canvas.drawImage(GetImage('pValkyrieRod'), -3, this.charge / 2);

    // Draw the wing
    canvas.drawImage(GetImage('pValkyrieWing'), -33, -23);

    // Draw the rails
    if (this.charge >= 50) {
        var x = Math.min(this.charge * 4 / 5, 60);
        canvas.drawImage(GetImage('pValkyrieRailLeft'), 28 - x, 2);
        canvas.drawImage(GetImage('pValkyrieRailRight'), x - 50, 2);
    }
    else {
        y = -22;
        if (this.charge >= 25) y = Math.min(y + this.charge - 25, 2);
        canvas.drawImage(GetImage('pValkyrieRailLeft'), -12, y);
        canvas.drawImage(GetImage('pValkyrieRailRight'), -10, y);
    }

    // Draw the turret
    y = 15;
    if (this.charge >= 25) y = Math.min(y + this.charge - 25, 40);
    if (this.charge >= 75) y += this.charge - 75;
    canvas.drawImage(GetImage('pValkyrieTurret'), -10, y);

    // Draw the scope
    if (this.locked) {
        canvas.drawImage(GetImage('pValkyrieScope'), -3, y + 34);
    }

    // Draw the front shell
    y = -14;
    if (this.charge >= 25) y = Math.min(y + this.charge - 25, 10);
    canvas.drawImage(GetImage('pValkyrieShell'), -12, y);
*/
// Draw range indicator
/*
if (this.range) {
    canvas.drawImage(GetImage('pValkyrieTarget'), -50, this.range - 50);
}
*/