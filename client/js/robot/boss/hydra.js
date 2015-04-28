/**
 * Boss that uses rockets and a fireball to attack
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 *
 * @constructor
 */
extend('HydraBoss', 'Boss');
function HydraBoss(x, y) {
    this.super(
        /* Sprite      */ 'hydraBabyBody', 
        /* Position    */ x * 4 - 1.5 * GAME_WIDTH, y * 4 -  1.5 * GAME_HEIGHT, 
        /* Type        */ Robot.BOSS, 
        /* Health      */ 100 * Enemy.pow(1.4) * players.length,
        /* Speed       */ 10,
        /* Move Range  */ 750,
        /* Experience  */ 0,
        /* Stat Rank   */ Enemy.BOSS,
        /* Pattern Min */ 600,
        /* Pattern Max */ 750,
        /* Title       */ 'Hydra'
    );
    
    this.pierceDamage = 0.5;
    this.turnDivider = 300;
    this.ignoreClamp = true;
	this.canTransform = gameScreen.enemyCount === 0;
	
    // Specific values
	this.fireball = new Sprite("FireBall", 0, 100).child(this, true);
    this.fireball.hidden = true;
	this.preChildren.push(
		this.fireball,
		new Sprite('hydraBabyWingLeft', -130, -170).child(this, true),
		new Sprite('hydraBabyWingRight', 130, -170).child(this, true),
		new Sprite('hydraBabyArmLeft', -150, 0).child(this, true),
		new Sprite('hydraBabyArmRight', 150, 0).child(this, true)
	);
	
    // Movement pattern
    this.movement = movement.flying;
    
    var damageScale = Boss.sum();
    
	// Attack pattern 0 - Missile Barrage
    this.setMovement(0, movement.flying);
	for (var i = 0; i < 2; i++) {
		var m = i * 2 - 1;
		this.addWeapon(weapon.gun, {
			sprite     : 'rocket',
			damage     : 2 * damageScale,
			range      : 500,
			rate       : 50,
			dx         : m * 120,
			dy         : 115,
			speed      : 16,
			angleOffset: 45 * m,
			target     : Robot.PLAYER,
			//                                 args: [type,    radius, knockback 
			templates: [{ name: 'setupRocket', args: ['Enemy', 100,    150] }]
		}, 0);
	}
	
	// Attack pattern 1 - Fireball
	this.setMovement(1, movement.flying);
	this.addWeapon(weapon.gun, {
		sprite     : 'FireBall',
		damage     : 4 * damageScale,
		range      : 500,
		rate       : 150,
		dx         : 0,
		dy         : 100,
		size       : 0.6,
		speed      : 20,
		angleOffset: 0,
		target     : Robot.PLAYER,
		templates  : [
			//                     args: [type,    radius, knockback 
			{ name: 'setupRocket', args: ['Enemy', 100,    150] },
			//                       args: [rotSpeed]
			{ name: 'setupSpinning', args: [-Math.PI / 20] }
		]
	}, 1);
	
    // Hydra's tail   
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'hydraBabyTail',
        /* End        */ 'hydraBabyEnd',
        /* Length     */ 5,
        /* Offset     */ 100,
        /* Base       */ 0,
        /* End Offset */ 40,
        /* Constraint */ 25,
        /* Front      */ true
    );
}

// Hydras ignore knockback/stuns
HydraBoss.prototype.knockback = function() { };
HydraBoss.prototype.stun = function() { };

/**
 * Checks for transforming into the royal hydra
 */
HydraBoss.prototype.onUpdate = function() {
	
	// Turn into royal hydra
	if (this.canTransform && this.health < this.maxHealth * 0.2) {
		gameScreen.particles.push(new RocketExplosion('Enemy', this.pos, 3000));
		gameScreen.robots.splice(gameScreen.robots.length - 1, 1);
        
        var royalHydra = new RoyalHydra(-GAME_WIDTH / 2, -GAME_HEIGHT / 2);
		gameScreen.robots.push(royalHydra);
        gameScreen.boss = royalHydra;
		gameScreen.bossTimer = 300;
	}
};

HydraBoss.FIREBALL_ROT = new Vector(Math.cos(Math.PI / 20), Math.sin(Math.PI / 20));

/**
 * Updates and draws the tail before the dragon is drawn
 */
HydraBoss.prototype.onPreDraw = function() {
    this.tail.update();
	
    if (!gameScreen.paused) {
        var scale = this.patterns[1][0].cd;
        scale = (1 - scale / 90) * this.patterns[1][0].size;
        this.fireball.hidden = this.pattern != 1 || scale <= 0;
        this.fireball.setScale(scale, scale);    
        this.fireball.rotate(HydraBoss.FIREBALL_ROT.x, HydraBoss.FIREBALL_ROT.y);
    }
};

/**
 * Umm...it's the hydra...it explains itself...
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 *
 * @constructor
 */
extend('RoyalHydra', 'Boss');
function RoyalHydra(x, y) {
    this.super(
        /* Sprite      */ 'hydraRoyalBody', 
        /* Position    */ x, y, 
        /* Type        */ Robot.BOSS, 
        /* Health      */ 1200 * Enemy.pow(1.4) * players.length,
        /* Speed       */ 8,
        /* Move Range  */ 750,
        /* Experience  */ Enemy.HYDRA_EXP,
        /* Stat Rank   */ Enemy.HYDRA_ENEMY,
        /* Pattern Min */ 720,
        /* Pattern Max */ 900,
        /* Title       */ 'Royal Hydra'
    );
    
    this.pierceDamage = 0.1;
    this.turnDivider = 300;
    this.ignoreClamp = true;
	this.patternTimer = this.patternMax;
    this.pattern = 3;
    this.rotateSpeed = Math.PI / 240;
    this.turrets = 0;
	
    // Specific values
    this.fireball = new Sprite('FireBall', 0, 550).child(this, true);
    this.preChildren.push(
        this.fireball,
        new Sprite('hydraRoyalWingLeft', -460, -180).child(this, true),
        new Sprite('hydraRoyalWingRight', 460, 180).child(this, true)
    );
    
    // Movement pattern
    this.movement = movement.pads;
    
    var damageScale = Boss.sum();
	this.damageScale = damageScale;
    
	// Attack pattern 0 - Missile Barrage
	this.setMovement(0, movement.flying);
	for (var i = 0; i < 2; i++) {
		var m = i * 2 - 1;
		for (var j = 0; j < 2; j++) {
			this.addWeapon(weapon.gun, {
				sprite: 'rocket',
				damage: 2 * damageScale,
				range: 600,
				rate: 75,
				dx: m * (400 + 340 * j),
				dy: 100 - 100 * j,
				speed: 16,
                target: Robot.PLAYER,
                //                                 args: [type,   radius, knockback
                templates: [{ name: 'setupRocket', args: ['Enemy', 100,   150] }]
			}, 0);
		}
	}
	
	// Attack pattern 1 - Hyper Beam
	this.setMovement(1, movement.rotate);
    this.hyperBeamData = {
        sprite: 'bossCannon',
        damage: damageScale,
        rate: 60,
        range: 1000,
        discharge: 0.1,
        duration: 480,
        dy: 550,
        cd: 60,
		pierce: true,
        target: Robot.PLAYER
    };
	this.addWeapon(weapon.rail, this.hyperBeamData, 1);
	this.hyperBeamData.cd = 60;
	
	// Attack pattern 2 - Spawn baby
	this.setMovement(2, movement.flyCenter);
	this.addWeapon(weapon.spawn, {
		enemies: [1, 0, HydraBoss],
        max    : 2,
        rate   : 120,
        delay  : 120,
        dx     : 0,
        dy     : 0,
        range  : 9999
	}, 2);
	
	// Attack pattern 3 - Lay turrets
	this.setMovement(3, movement.pads);
	
	// Attack pattern 4 - Fireball
	this.setMovement(4, movement.flying);
	this.addWeapon(weapon.gun, {
		sprite: 'FireBall',
		damage: 5 * damageScale,
		range: 500,
		radius: 200,
		knockback: 100,
		rate: 120,
		dx: 0,
		dy: 550,
		rotation: -Math.PI / 20,
		speed: 20,
		angleOffset: 0,
		target: Robot.PLAYER,
        //                                 args: [type,    radius, knockback
        templates: [{ name: 'setupRocket', args: ['Enemy', 200,    100] }]
	}, 4);
	
    // Hydra's tail   
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'hydraRoyalTail',
        /* End        */ 'hydraRoyalEnd',
        /* Length     */ 7,
        /* Offset     */ 175,
        /* Base       */ 0,
        /* End Offset */ 100,
        /* Constraint */ 20,
        /* Front      */ true
    );
	
	// Hydra's heads
	this.head = new RopeTail(
		/* Robot      */ this,
        /* Segment    */ 'hydraRoyalNeck',
        /* End        */ 'hydraRoyalHeadLarge',
        /* Length     */ 3,
        /* Offset     */ 110,
        /* Base       */ 65,
        /* End Offset */ 65,
        /* Constraint */ 0,
        /* Front      */ false
    );
    this.headLeft = new RoyalHydraSideHead(this, new RopeTail(
		/* Robot      */ this,
        /* Segment    */ 'hydraRoyalNeck',
        /* End        */ 'hydraRoyalHeadSmall',
        /* Length     */ 3,
        /* Offset     */ 110,
        /* Base       */ 115,
        /* End Offset */ 65,
        /* Constraint */ 20,
        /* Front      */ false
    ), damageScale);
	this.headRight = new RoyalHydraSideHead(this, new RopeTail(
		/* Robot      */ this,
        /* Segment    */ 'hydraRoyalNeck',
        /* End        */ 'hydraRoyalHeadSmall',
        /* Length     */ 3,
        /* Offset     */ 110,
        /* Base       */ 115,
        /* End Offset */ 65,
        /* Constraint */ 20,
        /* Front      */ false
    ), damageScale);
	
    this.headLeft.rope.setBaseDir(new Vector(-COS_60, SIN_60));
    this.headRight.rope.setBaseDir(new Vector(-COS_60, -SIN_60));
    this.head.setBaseDir(new Vector(-1, 0));
    this.head.held = undefined;
    this.head.heldTimer = 0;
    this.head.hydra = this;
    this.consumeDamage = damageScale * 5;
    this.head.consume = RoyalHydra.consume;
}

// Royal hydra ignores knockback/stuns
RoyalHydra.prototype.knockback = function() { };
RoyalHydra.prototype.stun = function() { };

/**
 * Manages special mechanics of the Royal
 * Hydra's attack patterns
 */
RoyalHydra.prototype.onUpdate = function() {
    
    // Turret laying stops when all are occupied
    if (this.pattern == 3 && this.turrets == 4) {
        this.pattern = 0;
        this.ApplyMove = this.movements[0];
    }
    
    // Hyper beam management
    if (this.pattern == 1) 
    {
        // Knock back nearby players
        for (var i = 0; i < players.length; i++)
        {
            var r = players[i];
            var dir = r.pos.clone().subtractv(this.pos);
            var dSq = dir.lengthSq();
            if (dSq < 360000)
            {
                var d = Math.sqrt(dSq);
                dir.multiply(100 / d, 100 / d);
                r.knockback(dir);
            }
        }
        
        // Stop the attack after one rotation
        if (this.hyperBeamData.cd < 0 && !this.firinLazors) {
			this.firinLazors = true;
		}
		else if (this.hyperBeamData.cd > 0 && this.firinLazors) {
			this.firinLazors = false;
			this.pattern = 0;
			this.movement = this.movements[0];
			this.patternTimer = this.patternMax;
		}
    }
    
    // Scaling/showing the fireball when applicable
    if (!gameScreen.paused) {
        var scale = this.patterns[4][0].cd;
        scale = (1 - scale / 90);
        this.fireball.hidden = this.pattern != 1 || scale <= 0;
        this.fireball.setScale(scale, scale);    
        this.fireball.rotate(HydraBoss.FIREBALL_ROT.x, HydraBoss.FIREBALL_ROT.y);
    }
};

/**
 * Updates and draws the tail before the dragon is drawn
 */
RoyalHydra.prototype.onPreDraw = function() {
    this.tail.update();
	
    // Scaling/showing the fireball when applicable
    if (!gameScreen.paused) {
        var scale = this.patterns[4][0].cd;
        scale = (1 - scale / 90);
        this.fireball.hidden = this.pattern != 1 || scale <= 0;
        this.fireball.setScale(scale, scale);    
        this.fireball.rotate(HydraBoss.FIREBALL_ROT.x, HydraBoss.FIREBALL_ROT.y);
    }
};

/**
 * Updates and draws the heads of the hydra
 */
RoyalHydra.prototype.onDraw = function() {
	var end = this.head.segments[this.head.segments.length - 1];
	this.head.update();
	this.headLeft.update();
	this.headRight.update();
	
	// Consumption attack
	var rot = this.head.getEndDir();
	this.head.rotation = rot.rotate(-1, 0);
	this.head.pos = end.pos.clone();
	this.head.consume();
	
	camera.ctx.fillStyle = 'blue';
	camera.ctx.strokeStyle = 'red';
	camera.ctx.lineWidth = 3;
	camera.ctx.beginPath();
	camera.ctx.moveTo(this.head.pos.x - this.pos.x, this.head.pos.y - this.pos.y);
	camera.ctx.lineTo(this.head.pos.x - this.pos.x + this.head.rotation.x * 100, this.head.pos.y - this.pos.y + this.head.rotation.y * 100);
	camera.ctx.stroke();
	camera.ctx.fillRect(this.head.pos.x - this.pos.x - 5, this.head.pos.y - this.pos.y - 5, 10, 10);
};

/** 
 * One of the secondary heads of the royal hydra
 *
 * @param {RoyalHydra} hydra  - the hydra with the heads
 * @param {RopeTail}   rope   - the rope tail to use
 * @param {number}     damage - the damage scale to use for fireballs and consuming
 *
 * @constructor
 */
function RoyalHydraSideHead(hydra, rope, damage) {

	this.hydra = hydra;
	this.rope = rope;
	this.pattern = 0;
    this.held = null;
    this.heldTimer = 0;
    this.consume = RoyalHydra.consume;
	
	// Side head weapon 0 - flamethrower
	this.rail = weapon.rail;
	this.fireData = {
		sprite   : 'bossFlame',
		shooter  : hydra,
		damage   : 0.1 * damage,
        range    : 400,
        interval : 3,
        dx       : 120,
        dy       : 0,
		discharge: 0,
        duration : 240,
		rate     : 120,
        speed    : 14,
		cd       : 0,
		taret    : Robot.PLAYER,
		onUpdate : 'fireUpdate'
	};
}

// Set required functions to use weapons
RoyalHydraSideHead.prototype.isInRange = function() { return true; };
RoyalHydraSideHead.prototype.getWorldRotation = function() { return this.rotation; };
RoyalHydraSideHead.prototype.getWorldPos = function() { return this.pos; };

/**
 * Updates the side head, breathing fire and picking up players when
 * applicable along with updating/drawing the RopeTail neck
 */
RoyalHydraSideHead.prototype.update = function() {
	this.rope.update();
	if (!gameScreen.paused) {
		this.rope.turnTowards(this.hydra.head.dir, 0.04, ROPE_TURN_END);
		this.rope.followParent();
		
		var end = this.rope.segments[this.rope.segments.length - 1];
		this.pos = end.pos.clone();
		this.rotation = this.rope.getEndDir().rotate(0, 1);
        
        this.consume();
        
        if (!this.held) {
            this.rail(this.fireData);
        }
	}
	
	camera.ctx.fillStyle = 'blue';
	camera.ctx.strokeStyle = 'red';
	camera.ctx.lineWidth = 3;
	camera.ctx.beginPath();
	camera.ctx.moveTo(this.pos.x - this.hydra.pos.x, this.pos.y - this.hydra.pos.y);
	camera.ctx.lineTo(this.pos.x - this.hydra.pos.x + this.rotation.x * 100, this.pos.y - this.hydra.pos.y + this.rotation.y * 100);
	camera.ctx.stroke();
	camera.ctx.fillRect(this.pos.x - this.hydra.pos.x - 5, this.pos.y - this.hydra.pos.y - 5, 10, 10);
};

RoyalHydra.consumeOffset = new Vector(0, 150);

/**
 * Manages the consume attack for the hydra where each head can pick
 * up a player and drag them around the map
 */
RoyalHydra.consume = function() {

	// Look for a player to grab
	var holdPos = this.pos.clone().addv(RoyalHydra.consumeOffset.clone().rotate(this.rotation.x, this.rotation.y));
    if (!this.held && this.hydra.pattern != 1 && this.heldTimer <= 0) {
		var p = getClosestPlayer(this.pos);
        if (!p) return;
		var dSq = p.pos.distanceSq(holdPos);
        if (dSq < 10000) {
            this.held = p;
            this.heldTimer = 300;
            p.ignoreClamp = true;
            p.damage(this.hydra.consumeDamage, this.hydra);
        }
    }
	
	// Carry a grabbed player with the head
    else if (this.held) {
        this.held.moveTo(holdPos.x, holdPos.y);
        this.heldTimer--;
        if (this.held.grapple) {
            this.held.grapple.expired = true;
        }
        if (this.heldTimer <= 0 || this.hydra.pattern == 1) {
            this.heldTimer = 300;
            this.held.ignoreClamp = false;
            this.held = undefined;
        }
    }
	
	// Cannot grab another player right after letting one go
    else if (this.heldTimer > 0) {
        this.heldTimer--;
    }
};