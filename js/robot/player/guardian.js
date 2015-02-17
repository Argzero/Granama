// Load in ability scripts
depend('robot/skill/perfectShield');
depend('robot/skill/reflector');
depend('robot/skill/stasis');

/**
 * The Guardian player which uses rockets and
 * a machine gun as its main attacks
 */
extend('PlayerGuardian', 'Player');
function PlayerGuardian() {
	//         Sprite Name   X  Y  Type          HP   Speed  HP+  Damage+  Speed+  Shield+
	this.super('pDefenseBody', 0, 0, Robot.PLAYER, 100, 3,     30,  1,       1,      1);
	
	// Sprites drawn on top of the player
	this.postChildren.push(
		new Sprite('pDefenseMissile', 0, -10).child(this, true),
		new Sprite('pDefenseShield', 25, 19).child(this, true),
		new Sprite('pDefenseGun', -30, 8).child(this, true)
	);

    // Weapon data
    this.rocketData = {
        sprite: 'missile',
		cd       : 0,
        range    : 349,
        rate     : 50,
        speed    : 15,
        dx       : 0,
        dy       : 0,
        target   : Robot.ENEMY,
		templates: [{ name: 'setupRocket', args: ['Guardian', 0, 0] }]
    };
    this.minigunData = {
		sprite: 'minigunBullet',
        cd    : 0,
        range : 499,
        angle : 20,
        dx    : -30,
        dy    : 45,
        target: Robot.ENEMY
    };
}

/**
 * Updates the player each frame while not stunned or dead
 */
PlayerGuardian.prototype.applyUpdate = function() {

	// Damage multiplier
	var m = this.get('power');

	// Minigun
	this.minigunData.damage = 3 * m;
	this.minigunData.rate = 6 - this.upgrades[MINIGUN_ID] / 2;
	weapon.gun.bind(this)(this.minigunData);

	// Rockets
	this.rocketData.type = this.name;
	this.rocketData.damage = 12 * m;
	this.rocketData.templates[0].args[1] = 100 + 25 * this.upgrades[EXPLOSION_ID];
	this.rocketData.templates[0].args[2] = 30 + 25 * this.upgrades[KNOCKBACK_ID];
	weapon.gun.bind(this)(this.rocketData);
};