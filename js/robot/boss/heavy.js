/**
 * A boss in the game that takes reduced effects from slows, stuns, and debuffs while not caring
 * about orientation for being "in range"
 *
 * @param {string} name         - name of the enemy sprite image
 * @param {number} x            - initial horizontal position
 * @param {number} y            - initial vertical position
 * @param {number} type         - Robot type ID of the enemy (should be Robot.BOSS)
 * @param {number} health       - max health
 * @param {number} speed        - movement speed
 * @param {number} range        - attack range
 * @param {number} exp          - experience yield
 * @param {string} rank         - difficulty rank
 * @param {number} [patternMin] - minimum time between switching attack patterns
 * @param {number} [patternMax] - maximum time between switching attack patterns
 *
 * @constructor
 */

/**
 * Boss that uses a minigun, mines, and rockets to fight
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 */
extend('HeavyBoss', 'Boss');
function HeavyBoss(x, y) {
    this.super(
        /* Sprite      */ 'bossHeavy', 
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
    
    this.pierceDamage = 0.1;
    
    // Covers
    this.coverRight = new Sprite('bossHeavyCoverRight', -58, -41).child(this, true);
    this.coverLeft = new Sprite('bossHeavyCoverLeft', 58, -41).child(this, true);
    this.coverOffset = 0;
    this.postChildren.push(this.coverRight, this.coverLeft);

    var damageScale = Boss.sum();

    // Attack pattern 0 - Orbiting mines/spawning
    this.setRange(0, 450);
    this.setMovement(0, movement.orbit);
    this.addWeapon(weapon.mine, {
        type    : 'boss',
        damage  : 8 * damageScale,
        rate    : 30,
        range   : 9999,
        duration: 2700,
        dx      : 0,
        dy      : -105,
        target  : Robot.PLAYER
    });
    this.addWeapon(weapon.spawn, {
        enemies: gameScreen.bossCount < 4 ? HEAVY_EASY_SPAWNS : HEAVY_SPAWNS,
        max    : gameScreen.bossCount < 4 ? 20 : 10,
        rate   : 60,
        delay  : 60,
        dx     : 0,
        dy     : 0
    });

    // Attack pattern 1 - Minigun/Rockets
    this.setRange(1, 400);
    this.setMovement(1, movement.basic);
    for (var i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite: 'bullet',
            damage: 0.5 * damageScale,
            range : 450,
            rate  : 10,
            dx    : -130 + 260 * i,
            dy    : 130,
            angle : 20,
            delay : 5 * i,
            target: Robot.PLAYER
        }, 1);
    }
    for (var i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite   : 'rocket',
            damage   : 4 * damageScale,
            range    : 450,
            rate     : 120,
            dx       : -60 + 120 * i,
            dy       : -35,
            delay    : 60 * i,
            speed    : 15,
            target   : Robot.PLAYER,
            //                                 args: [type,    radius, knockback
            templates: [{ name: 'setupRocket', args: ['Enemy', 100,    150] }]
        }, 1);
    }

    // Attack pattern 2 - Homing rockets
    this.setRange(2, 600);
    this.setMovement(2, movement.basic);
    for (var i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite   : 'rocket',
            damage   : 4 * damageScale,
            range    : 650,
            rate     : 60,
            dx       : -60 + 120 * i,
            dy       : -35,
            delay    : 30 * i,
            speed    : 8,
            target   : Robot.PLAYER,
            templates: [
                //                     args: [type,    radius, knockback]
                { name: 'setupRocket', args: ['Enemy', 100,    150] },
                //                     args: [target,       rotSpeed]
                { name: 'setupHoming', args: [Robot.PLAYER, 0.02] }
            ]
        }, 2);
    }
}

/**
 * Updates the Heavy boss, shifting its covers to the side
 * depending on its attack pattern.
 */
HeavyBoss.prototype.onUpdate = function() {
    if (this.pattern != 0 && this.coverOffset < 45) {
        this.coverOffset++;
        this.coverRight.move(-1, 0);
        this.coverLeft.move(1, 0);
    }
    else if (this.pattern == 0 && this.coverOffset > 0) {
        this.coverOffset--;
        this.coverRight.move(-1, 0);
        this.coverLeft.move(1, 0);
    }
};