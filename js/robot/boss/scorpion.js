/**
 * Boss that uses a minigun, mines, and rockets to fight
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 */
extend('ScorpionBoss', 'Boss');
function ScorpionBoss(x, y) {
    this.super(
        /* Sprite      */ 'bossFire', 
        /* Position    */ x, y, 
        /* Type        */ Robot.BOSS, 
        /* Health      */ 250 * Enemy.pow(1.4) * players.length,
        /* Speed       */ 3 + 0.2 * gameScreen.bossCount,
        /* Move Range  */ 200,
        /* Experience  */ Enemy.BOSS_EXP,
        /* Stat Rank   */ Enemy.BOSS_ENEMY,
        /* Pattern Min */ 300,
        /* Pattern Max */ 400
    );
    
    this.pierceDamage = 0.2;
    
    // Claw data
    this.leftClaw = new Sprite('bossFireClawLeft', 90, 40).child(this, true);
    this.rightClaw = new Sprite('bossFireClawRight', -90, 40).child(this, true);
    this.postChildren.push(this.leftClaw);
    this.postChildren.push(this.rightClaw);
    this.sword = false;
    this.changing = false;
    this.right = true;
    this.clawRotCount = 0;
    
    // Tail
    this.tail = new RopeTail(this, 'bossFireSegment', 'bossFireEnd', 4, 60, 90, 25, 30);
    
    // Movement pattern
    this.movement = movement.basic;

    // Damage scaling
    var damageScale = Boss.sum();

    // Weapon pattern 0 - rockets and fire
    this.setRange(0, 200);
    for (var i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite  : 'bossFlame',
            damage  : 0.02 * damageScale,
            range   : 200,
            rate    : 3,
            angle   : -30 + 60 * i,
            dx      : -120 + 240 * i,
            dy      : 15,
            target  : Robot.PLAYER,
            onUpdate: projEvents.fireUpdate
        });
    }
    for (var i = 0; i < 3; i++) {
        this.addWeapon(weapon.gun, {
            sprite: 'rocket',
            damage: 4 * damageScale,
            range : 500,
            rate  : 180,
            dx    : 12 - 12 * i,
            dy    : -23,
            delay : 20 * i,
            target: Robot.PLAYER,
            //                                 args: [type,    radius, knockback]
            templates: [{ name: 'setupRocket', args: ['Enemy', 100,    150] }]
        });
    }

    // Weapon pattern 1 - claw melee
    this.setRange(1, 150);
    this.addWeapon(weapon.gun, {
        sprite: 'bossFireClawRight',
        range : 175,
        rate  : 60,
        damage: damageScale,
        angle : 0,
        dx    : -90,
        dy    : 0,
        pierce: true,
        target: Robot.PLAYER,
        //                                 args: [radius, arc,             knockback, lifesteal]
        templates : [{ name: 'setupSword', args: [175,    Math.PI * 3 / 4, 100,       0] }]
    }, 1);

    // Weapon pattern 2 - Spawning grabbers
    this.addWeapon(weapon.spawn, {
        enemies: FIRE_SPAWNS,
        max    : 3,
        rate   : 60,
        delay  : 60,
        dx     : 0,
        dy     : 0,
        range  : 9999
    }, 2);
}

/**
 * Updates the visibility and the orientation
 * of the scorpion's claws each frame.
 */
ScorpionBoss.prototype.onUpdate = function() {
    
    // Update the tail
    this.tail.update();
    
    // Rotate for fire attack
    if (this.pattern == 0 && this.clawRotCount < 30) {
        this.leftClaw.rotation.rotate(COS_1, SIN_1);
        this.rightClaw.rotation.rotate(COS_1, -SIN_1);
        this.clawRotCount++;
    }
    else if (this.pattern != 0 && this.clawRotCount > 0) {
        this.leftClaw.rotation.rotate(COS_1, -SIN_1);
        this.rightClaw.rotation.rotate(COS_1, SIN_1);
        this.clawRotCount--;
    }
    
    // Set visibility
    this.rightClaw.hidden = this.sword;
};
