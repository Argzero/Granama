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
        /* Pattern Min */ 1200,
        /* Pattern Max */ 2000,
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
    this.movement = movement.orbit;
    this.pattern = 2;
    this.patternTimer = this.patternMax;

    // Damage scaling
    var damageScale = Boss.sum();

    // Weapon pattern 0 - rockets and fire
    this.setRange(0, 200);
    var i;
	this.setMovement(0, movement.basic);
    for (i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite     : 'bossFlame',
            damage     : 0.02 * damageScale,
            range      : 200,
            rate       : 3,
            angleOffset: -30 + 60 * i,
            dx         : -180 + 360 * i,
            dy         : 40,
            target     : Robot.PLAYER,
            pierce     : true,
            onUpdate   : projEvents.fireUpdate
        });
    }
    for (i = 0; i < 3; i++) {
        this.addWeapon(weapon.gun, {
            sprite: 'rocket',
            damage: 6 * damageScale,
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

    // Weapon pattern 1 - burrowing and grabbing
    this.setRange(1, 150);
	this.setMovement(1, movement.burrow);
    this.clawData = {
        sprite: 'bossFireClawRight',
        range : 360,
        rate  : 180,
        speed : 15,
        damage: damageScale * 10,
        angle : 0,
        dx    : -200,
        dy    : 70,
        pierce: true,
        angleOffset: -20,
        target: Robot.PLAYER,
        //                                   args: [stun, self]
        templates : [{ name: 'setupGrapple', args: [0,    false] }]
    };
    this.addWeapon(weapon.gun, this.clawData, 1);
	this.shockwaveDamage = damageScale;
    this.shockwaveRange = 200;
    this.shockwaveKnockback = 0;
    this.attackTime = 180;
    this.restSpeed = this.speed / 2;
    this.restTime = 15;
    this.burrowOffset = 500;

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
    
    // Grapple effects
    
    // Lower pattern duration of other patterns
    if (this.pattern != 1) {
        this.patternTimer -= 2;
    }
    
    // Hide the claw when grappling
    this.rightClaw.hidden = this.grapple;
    
    // Change cooldowns/attack times based on if someone is grabbed
    // Cooldowns is to prevent grabbing while being knocked back and
    // ensures that the scorpion will try to grab from the beginning of
    // each unburrow.
    if (this.burrowing || this.pattern != 1) {
        if (this.grabbed) {
            this.clawData.cd = 999;
            this.attackTime = 60;
        }
        else {
            this.clawData.cd = 5;
            this.attackTime = 180;
        }
    }
    
    // Change the sprite when returning
    if (this.grapple && this.grapple.returning) {
        this.grapple.sprite = images.get('bossFireClawRightClosed');
    }
    
    // Drag the target along with the claw underground
    if (this.grapple && this.grapple.target) {
        this.grabbed = this.grapple.target;
        this.grapple.target.pos = this.grapple.pos.clone();
    }
    if (this.grabbed && !this.grapple) {
        this.attacking = 0;
        this.grabbed.hidden = this.hidden;
        this.grabbed.pos = this.rightClaw.pos.clone().rotate(this.rotation.x, this.rotation.y).addv(this.pos);
    }
   
    // Unburrow and throw the target after a delay
    if (this.grabbed && this.hidden) {
        this.unburrowing = false;
        this.tOffset.rotate(COS_1, SIN_1);
        this.burrowTimer = this.burrowTimer || 180;
        this.burrowTimer--;
        if (this.burrowTimer <= 0) {
            this.unburrowing = 1;
            this.burrowTimer = false;
            this.grabbed.hidden = false;
            this.grabbed.knockback(this.forward().multiply(700, 700));
            this.grabbed.damage(this.clawData.damage, this);
            this.grabbed = false;
            this.patternTimer = Math.max(0, this.patternTimer) + 60;
        }
    }
    
    // Update the tail
    this.tail.update();
    this.dir = this.rotation.clone().rotate(0, 1);
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
};

/**
 * Release a grabbed player when the scorpion dies underground
 */
Brute.prototype.onDeath = function() {
    if (this.grabbed) {
        this.grabbed.hidden = false;
    }
};
