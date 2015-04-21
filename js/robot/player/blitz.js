// Load in ability scripts
depend('robot/skill/blink');
depend('robot/skill/criticalBlast');
depend('robot/skill/overdrive');

/** 
 * The blitz player that uses a shotgun and a static gun
 * as its main attacks
 *
 * @constructor
 */
extend('PlayerBlitz', 'Player');
function PlayerBlitz() {
    //         Sprite Name   X  Y  Type          HP   Speed  HP+  Damage+  Shield+  Speed+
    this.super('pBlitzBody', 0, 0, Robot.PLAYER, 100, 3,     10,  1,       1,       2);

    // Sprites drawn on top of the robot's body
    this.postChildren.push(
        new Sprite('pBlitzGun', 0, 5).child(this, true),
        new Sprite('pBlitzShield', 25, 15).child(this, true),
        new Sprite('pBlitzShotgun', -25, 12).child(this, true)
    );

    // Weapon data
    this.shotgunData = {
        sprite   : 'shell',
        cd       : 0,
        range    : 449,
        discharge: 0,
        initial  : true,
        angle    : 30,
        speed    : 15,
        dx       : -30,
        dy       : 35,
        target   : Robot.ENEMY
    };
    this.slowData = {
        sprite    : 'slowMissile',
        cd        : 0,
        range     : 499,
        multiplier: 0.5,
        dx        : 0,
        dy        : 54,
        speed     : 15,
        target    : Robot.ENEMY,
        buffs     : [{ name: 'speed', multiplier: 0.5, duration: 300 }],
        //                                     args: [multiplier]
        templates : [{ name: 'setupSlowBonus', args: [1.5] }]
    };
    this.rail = weapon.rail;
    this.gun = weapon.gun;
    
    // Multiplier for ability cooldowns
    this.cdm = 1;
    
    // Multiplier for attack rate
    this.rm = 1;
}

/**
 * Updates the player each frame while not stunned or dead
 */
PlayerBlitz.prototype.applyUpdate = function() {

    // Cooldown reduction
    this.cdm = 1 - 0.05 * this.upgrades[COOLDOWN_ID];

	// Get the damage multiplier including any damage buffs
    var m = this.get('power');

    // Shotgun
    var num = 15 + 5 * this.upgrades[SHOTGUN_ID];
    var bullets = Math.ceil(num / 5);
    this.shotgunData.damage = 2 * m;
    this.shotgunData.duration = Math.floor(num / bullets);
    this.shotgunData.bullets = bullets;
    this.shotgunData.rate = 60 * this.rm;
    this.rail(this.shotgunData);

    // Slow gun
    this.slowData.damage = 5 * m;
    this.slowData.rate = 40 * this.rm;
    this.slowData.buffs[0].duration = 300 + this.upgrades[SLOW_ID] * 50;
    this.gun(this.slowData);
};