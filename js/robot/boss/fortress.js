/**
 * Boss that uses a minigun, mines, and rockets to fight
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 *
 * @constructor
 */
extend('FortressBoss', 'Boss');
function FortressBoss(x, y) {
    this.super(
        /* Sprite      */ 'bossTank', 
        /* Position    */ x, y, 
        /* Type        */ Robot.BOSS, 
        /* Health      */ 600 * Enemy.pow(1.4) * players.length,
        /* Speed       */ 1 + 0.1 * gameScreen.bossCount,
        /* Move Range  */ 450,
        /* Experience  */ Enemy.BOSS_EXP,
        /* Stat Rank   */ Enemy.BOSS_ENEMY,
        /* Pattern Min */ 300,
        /* Pattern Max */ 400,
        /* Title       */ 'Fortress'
    );
    
    this.pierceDamage = 0.1;
    
    this.movement = movement.basic;
    this.turnDivider = 100;
    
    // Arms
    this.armLeft = new Sprite('bossTankArmLeft', -120, 70).child(this, true);
    this.armRight = new Sprite('bossTankArmRight', 120, 70).child(this, true);
    this.overlay = new Sprite('bossTankShield', 0, 235).child(this, true);
    this.postChildren.push(this.armLeft, this.armRight, this.overlay);
    this.armLeft.pivot.x = -(this.armRight.pivot.x = -68);
    this.armLeft.pivot.y = this.armRight.pivot.y = -112;
    this.overlay.hidden = true;
    
    // Add hooks
    this.chainFlat = new Sprite('chainFlat', 0, 0);
    this.chainUp = new Sprite('chainUp', 0, 0);
    this.hook = new Sprite('bossTankGrapple', 0, 0);
    this.hooksActive = 0;
    this.hooks = [
        new FortressHook(this, new Vector(-132, -70), new Vector(-1, 0)),
        new FortressHook(this, new Vector(-132, 0), new Vector(-1, 0)),
        new FortressHook(this, new Vector(-132, 70), new Vector(-1, 0)),
        new FortressHook(this, new Vector(132, -70), new Vector(1, 0)),
        new FortressHook(this, new Vector(132, 0), new Vector(1, 0)),
        new FortressHook(this, new Vector(132, 70), new Vector(1, 0))
    ];
    var i;
    for (i = 0; i < this.hooks.length; i++) {
        this.postChildren.push(this.hooks[i]);
    }
    
    // The cover
    this.postChildren.push(new Sprite('bossTankCover', 0, 0).child(this, true));

    // Lastly, the cannon
    this.cannon = new FortressCannon(this).child(this, false);
    this.postChildren.push(this.cannon);
    
    var damageScale = Boss.sum();
    
    // Hook data
    this.hookCd = 300;
    this.hookRate = 300;
    this.hookDur = 600;
    this.hookDmg = damageScale / 20;
    this.cannonTarget = undefined;
    
    // Arm data
    this.armRotCount = 0;
    this.armRot = new Vector(COS_3, SIN_3);
    
    // Attack Pattern 0 - Rocket barrage
    for (i = 0; i < 2; i++) {
        this.addWeapon(weapon.rail, {

            sprite     : 'rocket',
            damage     : 4 * damageScale,
            dx         : -210 + 420 * i,
            dy         : 260,
            speed      : 10,
            angle      : 20,
            angleOffset: -35 + i * 70,
            railDelay  : i * 80,
            rate       : 120,
            range      : 500,
            discharge  : 0.1,
            duration   : 40,
            interval   : 10,
            target     : Robot.PLAYER,
            //                                 args: [type,    radius, knockback]
            templates: [{ name: 'setupRocket', args: ['Enemy', 150,    200] }]
        }, 0);
    }

    // Attack pattern 1, Shield
    // This is just a place holder weapon
    // since the shield is handled separately
    this.addWeapon(weapon.rail, {
        discharge: 1,
        duration : 0,
        interval : 10,
        rate     : 10,
        range    : 0,
        damage   : 0
    }, 1);
}

/**
 * Applies update to each component
 */
FortressBoss.prototype.onUpdate = function() {
    if (gameScreen.paused) return;
    
    // Change how fast this rotates based on attack pattern
    this.turnDivider = this.pattern == 1 ? 500 : 250;
    
    // Launch hooks
    if (this.hooksActive < 6 && --this.hookCd <= 0) {
        this.hookCd = 150;
        var num;
        var temp = 0;
        do {
            num = rand(this.hooks.length);
        }
        while (this.hooks[num].active && ++temp < 100);
        this.hooks[num].launch();
        this.hooksActive++;
        this.hookCd = this.hookRate;
    }
    
    // Update each hook
    var i;
    for (i = 0; i < this.hooks.length; i++) {
        this.hooks[i].update();
    }
    
    // Update the cannon
    this.cannon.update();
    
    // Rotate arms
    if (this.pattern == 1) {
        if (this.armRotCount > -6) {
            this.armLeft.rotate(this.armRot.x, -this.armRot.y);
            this.armRight.rotate(this.armRot.x, this.armRot.y);
            this.armRotCount--;
        }
    }
    else if (this.armRotCount < 15) {
        this.armLeft.rotate(this.armRot.x, this.armRot.y);
        this.armRight.rotate(this.armRot.x, -this.armRot.y);
        this.armRotCount++;
    }
    
    // Shield overlay and application
    this.overlay.hidden = this.armRotCount != -6;
    if (!this.overlay.hidden) {
        
        // Just some math, move along
        var pm = new Vector(0, 235);
        pm.rotate(this.rotation.x, this.rotation.y);
        var po = new Vector(300, 0);
        po.rotate(this.rotation.x, this.rotation.y);
        var p1 = pm.clone();
        var p2 = pm.clone();
        p1.add(this.pos.x + po.x, this.pos.y + po.y);
        p2.add(this.pos.x - po.x, this.pos.y - po.y);
        
        // Block bullets
        for (i = 0; i < gameScreen.bullets.length; i++) {
            var b = gameScreen.bullets[i];
            if ((b.group & Robot.MOBILE) === 0) continue;
            
            if (b.pos.segmentDistanceSq(p1, p2) < 2500) {
                b.block();
            }
        }
    }
};

/**
 * Represents a large, independently rotating cannon used
 * by the fortress boss
 *
 * @param {Fortress} boss - the Fortress boss owning the cannon
 *
 * @constructor
 */
extend('FortressCannon', 'Sprite');
function FortressCannon(boss) {
    this.super('bossTankCannon', 0, 0);
    
    this.boss = boss;
    this.rail = weapon.rail;
    
    // Weapon data
    this.cannonData = {
        sprite   : 'bossCannon',
        damage   : 0.5 * Boss.sum(),
        rate     : 150,
        range    : 750,
        discharge: 0.1,
        duration : 120,
        dy       : 230,
        cd       : 0,
        pierce   : true,
        target   : Robot.PLAYER
    };
}

FortressCannon.LOOK_ROT = new Vector(Math.cos(0.08), Math.sin(0.08));

/**
 * Applies the cannon turning and firing its laser
 */ 
FortressCannon.prototype.update = function() {
    var target = this.boss.cannonTarget || getClosestPlayer(this.boss.pos);
    this.lookTowards(target.pos.clone().subtractv(this.boss.pos), FortressCannon.LOOK_ROT);
    
    this.rail(this.cannonData);
};

/**
 * Checks whether or not the cannon is in range to fire the beam.
 * If a player is on a chain, the cannon can always fire.
 *
 * @param {number} range - range of the weapon
 */
FortressCannon.prototype.isInRange = function(range) {
    return this.boss.cannonTarget || getClosestPlayer(this.boss.pos).pos.distanceSq(this.boss.pos) < sq(range);
};

/**
 * Represents a single hook used by the Fortress Boss
 * 
 * @param {Fortress} boss - the Fortress boss owning the hook
 * @param {Vector}   root - the offset of the hook's resting position
 * @param {Vector}   rot  - the rotation of the hook's resting position 
 *
 * @constructor
 */ 
function FortressHook(boss, root, rot) {
    this.boss = boss;
    this.root = root;
    this.rot = rot;
    this.rotation = rot.clone();
    this.pos = root.clone().addv(boss.pos);
    this.worldPos = new Vector(0, 0);
    this.rvel = new Vector(0, 0);
    this.keepRotate = false;
}

FortressHook.RESTORE_ROT = new Vector(Math.cos(Math.PI / 60), Math.sin(Math.PI / 60));

/**
 * Updates the hook, controlling its movement and applying
 * damage and slows to players running over the chains
 */
FortressHook.prototype.update = function() {
    if (!gameScreen.paused && this.active) {

        // Movement outwards
        if (this.vel.x || this.vel.y) {
            this.rotation = this.arot.clone();
            this.pos.addv(this.vel);
            if (this.pos.distanceSq(this.boss.pos) > 490000) {
                this.vel.x = 0;
                this.vel.y = 0;
            }
        }

        // Lifespan counter
        else if (this.dur > 0) {
            this.dur--;
        }

        // Retreating
        else {
            this.rotation.rotateTowards(this.rot, FortressHook.RESTORE_ROT);
            
			this.rvel.x = this.boss.pos.x - this.pos.x;
			this.rvel.y = this.boss.pos.y - this.pos.y;
            this.rvel.setMagnitude(18);
            this.pos.addv(this.rvel);

            if (this.pos.distanceSq(this.boss.pos) < 2500) {
                this.active = false;
                this.rotation = this.rot.clone();
                this.boss.hooksActive--;
            }
        }

        // Collision
        this.cannonTarget = undefined;
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            if (player.dead) continue;
            var r = player.width / 2 + this.boss.chainFlat.height / 2;
            if (player.pos.segmentDistanceSq(this.boss.pos, this.pos) < r * r) {
                player.buff('speed', 0.2, 60);
                player.damage(this.boss.hookDmg, this.boss);
                this.boss.cannonTarget = player;
            }
        }
    }
    if (!this.active) {
        this.pos = this.root.clone().rotate(this.boss.rotation.x, this.boss.rotation.y).addv(this.boss.pos);
        this.rotation = this.rot.clone().rotate(this.boss.rotation.x, this.boss.rotation.y);
    }
};

/**
 * Draws the hook including any chain segments that
 * are visible when fired
 */ 
FortressHook.prototype.draw = function() {

    // Draw the hook
    this.boss.hook.moveTo(this.pos.x - this.boss.pos.x, this.pos.y - this.boss.pos.y);
    this.boss.hook.setRotation(this.rotation.x, this.rotation.y);
    this.boss.hook.draw(camera);
    
    // Chain drawing
    if (this.active) {
        
        var temp = this.pos.clone().addv(new Vector(-45, 0).rotate(this.rotation.x, this.rotation.y));
        var dir = this.boss.pos.clone().subtractv(temp).normalize();
		var rot = dir.clone().multiply(-1, -1);
        dir.multiply(30, 30);
		

        var difX = this.boss.pos.x - temp.x;
        var difY = this.boss.pos.y - temp.y;
        while (difX * (this.boss.pos.x - temp.x) > 0 && difY * (this.boss.pos.y - temp.y) > 0) {
            
            this.boss.chainUp.moveTo(temp.x - this.boss.pos.x, temp.y - this.boss.pos.y);
            this.boss.chainUp.setRotation(rot.x, rot.y);
            this.boss.chainUp.draw(camera);
            
            temp.addv(dir);
            
            this.boss.chainFlat.moveTo(temp.x - this.boss.pos.x, temp.y - this.boss.pos.y);
            this.boss.chainFlat.setRotation(rot.x, rot.y);
            this.boss.chainFlat.draw(camera);
            
            temp.addv(dir);
        }
    }
};

/**
 * Launches the hook out from the Fortress boss
 */ 
FortressHook.prototype.launch = function() {
    this.active = true;
    this.dur = this.boss.hookDur;
    this.arot = this.rot.clone();
    this.arot.rotate(this.boss.rotation.x, this.boss.rotation.y);
    this.vel = new Vector(this.arot.x * 15, this.arot.y * 15);
    this.worldPos = this.pos.clone().addv(this.boss.pos);
};