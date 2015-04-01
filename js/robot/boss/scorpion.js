/**
 * The Scorpion boss that uses rockets, claws, and fire
 * to fight the players.
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 *
 * @constructor
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
        /* Pattern Min */ 600,
        /* Pattern Max */ 800,
        /* Title       */ 'Scorpion'
    );
    
    this.pierceDamage = 0.2;
    
    // Claw data
    this.leftClaw = new Sprite('bossFireClawLeft', 200, 70).child(this, true);
    this.rightClaw = new Sprite('bossFireClawRight', -200, 70).child(this, true);
    this.postChildren.push(this.leftClaw, this.rightClaw);
    this.sword = false;
    this.changing = false;
    this.right = true;
    this.clawRotCount = 0;
    
    // Tail
    this.dir = new Vector(0, 1);
	this.shoulders = new TailSegment(
        /* Parent     */ this,
        /* Sprite     */ 'bossFireShoulders',
        /* Offset     */ 50,
        /* Constraint */ 30 * Math.PI / 180
    );
    this.tail = new RopeTail(
        /* Robot      */ this.shoulders,
        /* Segment    */ 'bossFireSegment',
        /* End        */ 'bossFireEnd',
        /* Length     */ 4,
        /* Offset     */ 80,
        /* Base       */ 40,
        /* End Offset */ 100,
        /* Constraint */ 30,
        /* Front      */ true
    );
    
    // Movement pattern
    this.movement = movement.basic;

    // Damage scaling
    var damageScale = Boss.sum();

    // Weapon pattern 0 - rockets and fire
    this.setRange(0, 200);
    var i;
	this.setMovement(0, movement.basic);
    for (i = 0; i < 2; i++) {
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
    for (i = 0; i < 3; i++) {
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
	this.setMovement(1, movement.basic);
    this.addWeapon(weapon.gun, {
        sprite: 'bossFireClawRight',
        range : 175,
        rate  : 60,
        damage: damageScale,
        angle : 0,
        dx    : -100,
        dy    : 70,
        pierce: true,
        target: Robot.PLAYER,
        //                                 args: [radius, arc,             knockback, lifesteal]
        templates : [{ name: 'setupSword', args: [175,    Math.PI * 3 / 4, 100,       0] }]
    }, 1);
	this.shockwaveDamage = damageScale;
    this.shockwaveRange = 200;
    this.shockwaveKnockback = 0;
    this.attackTime = 60;
    this.restSpeed = this.speed / 2;
    this.restTime = 15;

    // Weapon pattern 2 - Spawning burrowers
	this.setRange(2, 400);
	this.setMovement(2, movement.orbit);
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
ScorpionBoss.prototype.onPreDraw = function() {
    
    // Update the tail
    this.tail.update();
    this.dir = this.rotation.clone().rotate(0, 1)
    this.shoulders.update();
    camera.ctx.translate(-this.pos.x, -this.pos.y);
    this.shoulders.draw(camera);
    camera.ctx.translate(this.pos.x, this.pos.y);
    
    // Rotate for fire attack
    if (this.pattern === 0 && this.clawRotCount < 30) {
        this.leftClaw.rotation.rotate(COS_1, SIN_1);
        this.rightClaw.rotation.rotate(COS_1, -SIN_1);
        this.clawRotCount++;
    }
    else if (this.pattern !== 0 && this.clawRotCount > 0) {
        this.leftClaw.rotation.rotate(COS_1, -SIN_1);
        this.rightClaw.rotation.rotate(COS_1, SIN_1);
        this.clawRotCount--;
    }
    
    // Set visibility
    this.rightClaw.hidden = this.sword;
};
