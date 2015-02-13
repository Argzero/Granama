// Load in ability scripts
depend('robot/skill/decimation');
depend('robot/skill/kocannon');
depend('robot/skill/waveburst');

// Set weapons in the depend function because the weapons class
// needs to be loaded before we can access them
depend('robot/weapons', function() {
    PlayerSlayer.prototype.shootLasers = weapon.gun;
    PlayerSlayer.prototype.shootFire = weapon.gun;
});

/**
 * The Slayer player which uses lasers and a flamethrower
 * as its main attacks.
 */
extend('PlayerSlayer', 'Player');
function PlayerSlayer() {
	//         Sprite Name   X  Y  Type          HP   Speed  HP+  Damage+  Speed+  Shield+
	this.super('pPowerBody', 0, 0, Robot.PLAYER, 100, 3,     6,   0.25,    1,      1);
	
	// Sprites drawn on top of the robot's body
	this.postChildren.push(
		new Sprite('pPowerShield', 28, 14).child(this, true),
		new Sprite('pPowerFlame', -28, 15).child(this, true),
		new Sprite('pPowerSpread', -0.5, -3).child(this, true)
	);

    // Weapon data
    this.fireData = {
		sprite  : 'fire',
        cd      : 0,
        dx      : -30,
        dy      : 45,
        rate    : 2,
        pierce  : true,
		target  : Robot.ENEMY,
		onUpdate: projEvents.fireUpdate
    };
    this.laserData = {
		sprite: 'laser',
        cd    : 0,
        range : 499,
        dx    : 0,
        dy    : 54,
        pierce: true,
		target: Robot.ENEMY
    };
}

/**
 * Updates the player each frame while not stunned or dead
 */
PlayerSlayer.prototype.applyUpdate = function() {
	
	var m = this.get('damage');

	// Flamethrower
	var fireUps = this.upgrades[FLAME_ID];
	this.fireData.damage = 0.1 * m;
	this.fireData.range = fireUps * 20 + 100;
	this.shootFire(this.fireData);

	// Lasers
	this.laserData.damage = 0.4 * m;
	this.laserData.rate = 60 / (5 + this.upgrades[LASER_ID] * 2.5);
	this.laserData.spread = this.upgrades[SPREAD_ID] / 2;
	this.shootLasers(this.laserData);
};