/**
 * Boss that uses a minigun, mines, and rockets to fight
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 */
extend('BrawlerBoss', 'Boss');
function BrawlerBoss(x, y) {
    this.super(
        /* Sprite      */ 'bossPunch', 
        /* Position    */ x, y, 
        /* Type        */ Robot.BOSS, 
        /* Health      */ 300 * Enemy.pow(1.4) * players.length,
        /* Speed       */ 3 + 0.2 * gameScreen.bossCount,
        /* Move Range  */ 300,
        /* Experience  */ Enemy.BOSS_EXP,
        /* Stat Rank   */ Enemy.BOSS_ENEMY,
        /* Pattern Min */ 300,
        /* Pattern Max */ 400
    );
    
    this.pierceDamage = 0.2;
    
    // Specific values
    this.leftFist = true;
    this.rightFist = true;
    this.leftFistImg = new Sprite('fistLeft', 100, 0).child(this, true);
    this.rightFistImg = new Sprite('fistRight', -100, 0).child(this, true);
    this.postChildren.push(this.leftFistImg, this.rightFistImg)

    // Movement pattern
    this.movement = movement.basic;

    var damageScale = Boss.sum();

    // Weapon pattern 0 - fists and rail gun
    this.addWeapon(weapon.gun, {
        sprite: 'fistLeft',
        rate  : 300,
        speed : 10,
        range : 400,
        damage: damageScale,
        pierce: true,
        dx    : 100,
        target: Robot.PLAYER,
        //
        templates: [{ name: 'setupFist', args: [60, 'left'] }]
    });
    this.addWeapon(weapon.rail, {
        sprite   : 'bossLaser',
        damage   : 0.15 * damageScale,
        rate     : 150,
        range    : 500,
        discharge: 0.1,
        duration : 60,
        pierce   : true,
        target   : Robot.PLAYER
    });

    // Weapon pattern 1 - shockwaves
    for (var i = 0; i < 5; i++) {
        var offset = 3 * Math.PI * i / 8;
        this.addWeapon(weapon.shockwave, {
            rate     : 120,
            damage   : 2 * damageScale,
            start    : offset,
            end      : 2 * Math.PI / 8 + offset,
            radius   : 75,
            range    : 750,
            knockback: 50,
            speed    : this.speed,
            target   : Robot.PLAYER
        }, 1);
    }

    // Weapon pattern 2 - Spawning paladins
    this.addWeapon(weapon.spawn, {
        enemies: PUNCH_SPAWNS,
        max    : 1,
        rate   : 120,
        delay  : 300,
        dx     : 0,
        dy     : 0,
        range  : 9999
    }, 2);
}

/**
 * Updates the visibility of the fists and alternates
 * the weapon data side
 */
BrawlerBoss.prototype.onUpdate = function() {
    console.log(this.pattern);
    this.leftFistImg.hidden = !this.leftFist;
    this.rightFistImg.hidden = !this.rightFist;
};