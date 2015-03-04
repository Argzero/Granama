/**
 * Boss that uses rockets and a fireball to attack
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
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
        /* Pattern Max */ 750
    );
    
    this.pierceDamage = 0.5;
    this.turnDivider = 300;
    this.ignoreClamp = true;
	this.canTransform = gameScreen.enemyCount == 0;
	
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
    this.movement = movement.flying
    
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

/**
 * Checks for transforming into the royal hydra
 */
HydraBoss.prototype.onUpdate = function() {
	
	// Turn into royal hydra
	if (this.canTransform && this.health < this.maxHealth * 0.2) {
		gameScreen.particles.push(new RocketExplosion('Enemy', this.x, this.y, 3000));
		gameScreen.robots.splice(gameScreen.robots.length - 1, 1);
		gameScreen.robots.push(new RoyalHydra(-GAME_WIDTH / 2, -GAME_HEIGHT / 2));
		gameScreen.bossTimer = 0;
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
        console.log(scale);
        this.fireball.setScale(scale, scale);    
        this.fireball.rotate(HydraBoss.FIREBALL_ROT.x, HydraBoss.FIREBALL_ROT.y);
    }
};

/**
 * Umm...it's the hydra...it explains itself...
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
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
        /* Pattern Max */ 900
    );
    
    this.pierceDamage = 0.1;
    this.turnDivider = 300;
    this.ignoreClamp = true;
	this.patternTimer = this.patternMax;
    this.pattern = 3;
    this.rotateSpeed = Math.PI / 240;
	
    // Specific values
    this.fireball = new Sprite('Fireball', 0, 550);
    this.preChildren.push(
        this.fireball,
        new Sprite('hydraRoyalWingLeft', 0, 0),
        new Sprite('hydraRoyalWingRight', 0, 0)
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
                target: Robot.PLAYER
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
	this.addWeapon(wepaon.rail, this.hyperBeamData, 1);
	
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
	enemy.tail = new RopeTail(enemy, GetImage('hydraRoyalTail'), GetImage('hydraRoyalEnd'), 7, 175, 150, 175, 20);
	enemy.ApplyDraw = function() {
	
		// Turret laying stops when all are occupied
		if (this.pattern == 3 && gameScreen.enemyManager.turrets.length == 4) {
			this.pattern = 0;
			this.ApplyMove = this.movements[0];
		}
		
		// Hyper beam
		if (this.pattern == 1) 
		{
			for (var i = 0; i < playerManager.players.length; i++)
			{
				var r = playerManager.players[i].robot;
				var dx = r.x - this.x;
				var dy = r.y - this.y;
				if (dx * dx + dy * dy < Sq(600))
				{
					var d = Math.sqrt(dx * dx + dy * dy);
					dx /= d;
					dy /= d;
					r.Knockback(dx * 100, dy * 100);
				}
			}
		}
		if (this.hyperBeamData.cd < 0 && !this.firinLazors) {
			this.firinLazors = true;
		}
		else if (this.hyperBeamData.cd > 0 && this.firinLazors) {
			this.firinLazors = false;
			this.pattern = 0;
			this.ApplyMove = this.movements[0];
			this.patternTimer = this.patternMax;
		}
	
        // Tail
        this.tail.update();
        
        canvas.save();
        canvas.translate(this.sprite.width / 2, this.sprite.height / 2);
		canvas.transform(this.sin, -this.cos, this.cos, this.sin, 0, 0);
        
		// Fireball charging
		if (this.pattern == 4) {
			var cd = this.patterns[4][0].cd;
			if (cd < 90) {
				var w = (1 - cd / 90) * this.fireball.width;
				canvas.save();
				canvas.translate(0, 550);
				canvas.rotate(cd * Math.PI / 20);
				canvas.drawImage(this.fireball, -w/2, -w/2, w, w);
				canvas.restore();
			}
		}
		else this.patterns[4][0].cd = this.patterns[4][0].rate;
		
		canvas.translate(-this.sprite.width / 2, -this.sprite.height / 2);
		
        // Wings
        canvas.drawImage(this.rightWing, this.sprite.width - 250, -325);
        canvas.drawImage(this.leftWing, 250 - this.leftWing.width, -325);
        
        canvas.restore();
	}
    
    // Hydra's heads
    enemy.head = new RopeTail(enemy, GetImage('hydraRoyalNeck'), GetImage('hydraRoyalHeadLarge'), 3, 125, 150, 0, 0);
    enemy.headLeft = new RoyalHydraSideHead(enemy, new RopeTail(enemy, GetImage('hydraRoyalNeck'), GetImage('hydraRoyalHeadSmall'), 4, 125, 250, 0, 20), damageScale);
    enemy.headRight = new RoyalHydraSideHead(enemy, new RopeTail(enemy, GetImage('hydraRoyalNeck'), GetImage('hydraRoyalHeadSmall'), 4, 125, 250, 50, 20), damageScale);
    enemy.head.reverse = enemy.headLeft.rope.reverse = enemy.headRight.rope.reverse = true;
    enemy.headLeft.rope.rel = Vector(COS_60, SIN_60);
    enemy.headRight.rope.rel = Vector(COS_60, -SIN_60);
    enemy.head.held = null;
    enemy.head.heldTimer = 0;
    enemy.head.hydra = enemy;
    enemy.head.consumeDamageStart = damageScale;
    enemy.head.consumeDamageTick = damageScale * 0.02;
    enemy.head.consume = ConsumeAttackHelper;
    enemy.ApplySprite = function() {
        var end = this.head.segments[this.head.segments.length - 1];
        this.head.update();
        this.headLeft.update();
		this.headRight.update();
        
        // Consumption attack
        var rot = this.head.getEndDir();
		rot.Rotate(-1, 0);
		this.head.cos = rot.x;
		this.head.sin = rot.y;
        this.head.x = end.pos.x;
        this.head.y = end.pos.y;
        this.head.consume();
    }

    return enemy;
}

function RoyalHydraSideHead(hydra, rope, damage) {

	this.hydra = hydra;
	this.rope = rope;
	this.pattern = 0;
    this.held = null;
    this.heldTimer = 0;
    this.consumeDamageStart = damage * 5;
    this.consumeDamageTick = damage;
    this.consume = ConsumeAttackHelper;
	
	// Side head weapon 0 - flamethrower
	this.flamethrower = EnemyWeaponRail;
	this.fireData = {
		subWeapon: EnemyWeaponFire,
		damage: 0.1 * damage,
        range: 400,
        interval: 3,
        dx: 120,
        dy: 0,
		discharge: 0,
        duration: 240,
		rate: 120,
        speed: 14,
		cd: 0,
		list: gameScreen.enemyManager.bullets
	};
}

RoyalHydraSideHead.prototype.IsInRange = function() { return true; }

RoyalHydraSideHead.prototype.update = function() {
	if (!gameScreen.paused) {
		this.rope.turnTowards(this.hydra.head.dir, 0.04, ROPE_TURN_END);
		this.rope.followParent();
		
		var end = this.rope.segments[this.rope.segments.length - 1];
		this.x = end.pos.x;
		this.y = end.pos.y;
		var rot = this.rope.getEndDir();
		rot.Rotate(-1, 0);
		this.cos = rot.x;
		this.sin = rot.y;
		this.angle = Math.atan2(this.sin, this.cos);
        
        this.consume();
        
        if (!this.held) {
            this.flamethrower(this.fireData);
        }
	}
	this.rope.update();
}

function ConsumeAttackHelper() {

    // Consume attack
    var holdX = this.x + this.cos * 150;
    var holdY = this.y + this.sin * 150;
    if (!this.held && this.hydra.pattern != 1 && this.heldTimer <= 0) {
        var p = playerManager.getClosest(this.x, this.y);
        var dx = p.x - holdX;
        var dy = p.y - holdY;
        if (dx * dx + dy * dy < 10000) {
            this.held = p;
            this.heldTimer = 300;
            p.disableClamp = true;
            p.Damage(this.consumeDamageStart, this.hydra);
        }
    }
    else if (this.held) {
        //this.held.Damage(this.consumeDamageTick, this.hydra);
        this.held.x = holdX;
        this.held.y = holdY;
        this.heldTimer--;
        if (this.heldTimer <= 0 || this.hydra.pattern == 1) {
            this.heldTimer = 300;
            this.held.disableClamp = false;
            this.held = null;
        }
    }
    else if (this.heldTimer > 0) {
        this.heldTimer--;
    }
}