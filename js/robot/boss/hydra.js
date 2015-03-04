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
	this.fireball = new Sprite("FireBall", 0, 0).child(this, true);
	this.postChildren.push(
		this.fireball,
		new Sprite('hydraBabyWingLeft', 0, 0).child(this, true),
		new Sprite('hydraBabyWingRight', 0, 0).child(this, true),
		new Sprite('hydraBabyArmLeft', 0, 0).child(this, true),
		new Sprite('hydraBabyArmRight', 0, 0).child(this, true),
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
			dx         : m * 170,
			dy         : 10,
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
		target     : Robot.PLAYER
		templates  : [
			//                     args: [type,    radius, knockback 
			{ name: 'setupRocket', args: ['Enemy', 100,    150] }
			//                       args: [rotSpeed]
			{ name: 'setupSpinning', args: [-Math.PI / 20] }
		]
	}, 1);
	
    // Hydra's tail   
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'hydraBabyTail',
        /* End        */ 'hydraBabyTailEnd',
        /* Length     */ 5,
        /* Offset     */ 100,
        /* Base       */ 0,
        /* End Offset */ 0,
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

	this.applyDraw = function() {
    
        
	
        // Tail
        this.tail.update();
        
        canvas.save();
        canvas.translate(this.sprite.width / 2, this.sprite.height / 2);
		canvas.transform(this.sin, -this.cos, this.cos, this.sin, 0, 0);
		
		// Fireball charging
		if (this.pattern == 1) {
			var cd = this.patterns[1][0].cd;
			if (cd < 90) {
				var w = (1 - cd / 90) * this.fireball.width * 0.6;
				canvas.save();
				canvas.translate(0, 100);
				canvas.rotate(cd * Math.PI / 20);
				canvas.drawImage(this.fireball, -w/2, -w/2, w, w);
				canvas.restore();
			}
		}
		else this.patterns[1][0].cd = this.patterns[1][0].rate;
		
        canvas.translate(-this.sprite.width / 2, -this.sprite.height / 2);
        
        // Wings
        canvas.drawImage(this.rightWing, this.sprite.width - 100, -210);
        canvas.drawImage(this.leftWing, 100 - this.leftWing.width, -210);
		
		// arms
		canvas.drawImage(this.rightArm, this.sprite.width - 45, -30);
		canvas.drawImage(this.leftArm, 45 - this.leftArm.width, -30);
        
        canvas.restore();
	}
}

HydraBoss.FIREBALL_ROT = new Vector(Math.cos(Math.PI / 20), Math.sin(Math.PI / 20));

/**
 * Updates and draws the tail before the dragon is drawn
 */
HydraBoss.prototype.onPreDraw = function() {
    this.tail.update();
	
	this.fireball.hidden = this.pattern != 1;
	var scale = this.patterns[1][0].cd;
	scale = 
	this.fireball.setScale(
	this.fireball.rotate(HydraBoss.FIREBALL_ROT.x, HydraBoss.FIREBALL_ROT.y);
};

/**
 * Boss that uses a minigun, mines, and rockets to fight
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 */
extend('DragonBoss', 'Boss');
function DragonBoss(x, y) {
    this.super(
        /* Sprite      */ 'bossDragonHead', 
        /* Position    */ x, y, 
        /* Type        */ Robot.BOSS, 
        /* Health      */ 750 * Enemy.pow(1.4) * players.length,
        /* Speed       */ 4 + 0.3 * gameScreen.bossCount,
        /* Move Range  */ 300,
        /* Experience  */ Enemy.DRAGON_EXP,
        /* Stat Rank   */ Enemy.DRAGON_ENEMY,
        /* Pattern Min */ 600,
        /* Pattern Max */ 750
    );
    
    this.pierceDamage = 0.4;
    this.turnDivider = 300;
    this.ignoreClamp = true;
	
    // Wing sprites
    this.preChildren.push(
		new Sprite('bossDragonLeftWing', 278, -66).child(this, true),
		new Sprite('bossDragonRightWing', -278, -66).child(this, true)
	);

    // Movement pattern
    this.movement = movement.flying;

    var damageScale = Boss.sum();

    // Attack pattern 0 - Lasers and fire
    this.setMovement(0, movement.flying);
    for (var i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite: 'bossLaser',
            damage: 0.1 * damageScale,
            range : 1000,
            rate  : 30,
            dx    : -185 + 370 * i,
            dy    : 17,
            speed : 15,
            pierce: true
        });
    }
    this.addWeapon(weapon.gun, {
        sprite  : 'bossFlame',
        damage  : 0.1 * damageScale,
        range   : 300,
        rate    : 3,
        dx      : 0,
        dy      : 100,
        onUpdate: projEvents.fireUpdate
    });

    // Attack pattern 1 - Spawning minibosses
    this.setMovement(1, movement.flyCenter);
    this.addWeapon(weapon.spawn, {
        enemies: DRAGON_SPAWNS,
        max    : 8,
        rate   : 120,
        delay  : 300,
        dx     : 0,
        dy     : -100,
        range  : 9999
    }, 1);

    // Attack pattern 2 - Homing missiles
    this.setMovement(2, movement.dragon);
    this.addWeapon(weapon.gun, {
		sprite: 'bossFlame',
        damage: 0.05 * damageScale,
        range : 300,
        rate  : 3,
        dx    : 0,
        dy    : 42,
		onUpdate: projEvents.fireUpdate
    }, 2);
    for (var i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite   : 'rocket',
            damage   : 5 * damageScale,
            range    : 600,
            radius   : 100,
            knockback: 150,
            rate     : 90,
            dx       : -238 + 476 * i,
            dy       : -10,
            speed    : 8,
			templates: [
				//                     args: [type,    radius, knockback]
				{ name: 'setupRocket', args: ['Enemy', 100,    150] },
				//                     args: [target,       rotSpeed]
				{ name: 'setupHoming', args: [Robot.PLAYER, 0.02] }
			]
        }, 2);
    }

	// The enemy's tail
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'bossDragonEnd',
        /* End        */ 'bossDragonEnd',
        /* Length     */ 5,
        /* Offset     */ 150,
        /* Base       */ 0,
        /* End Offset */ 0,
        /* Constraint */ 45,
        /* Front      */ true
    );
    this.tail.setTurrets(
        /* Sprite */ 'bossDragonTurret',
        /* DX     */ 0,
        /* DY     */ 0,
        /* Weapon */ {
            damage: damageScale,
            range : 1000,
            rate  : 60,
            dx    : 0,
            dy    : 48,
            target: Robot.PLAYER
        }
    );
}

/**
 * Updates and draws the tail before the dragon is drawn
 */
DragonBoss.prototype.onPreDraw = function() {
    this.tail.update();
};