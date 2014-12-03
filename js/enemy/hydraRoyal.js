function BabyHydra(x, y) {
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('hydraBabyBody'), 
        x, 
        y,
        100 * ScalePower(c, 1.4) * playerManager.players.length,
        10,
        750,
		1,
        600,
        750
    );
    enemy.rank = STAT.DRAGON;
    
    enemy.pierceDamage = 0.3;
    enemy.Knockback = undefined;
    enemy.Slow = undefined;
    enemy.stun = undefined;
    enemy.IsInRange = function() { return true; };
    enemy.turnRange = 750 * 750;
    enemy.disableClamp = true;
    
    // Specific values
    enemy.leftWing = GetImage('hydraBabyWingLeft');
    enemy.rightWing = GetImage('hydraBabyWingRight');
    enemy.leftArm = GetImage('hydraBabyArmLeft');
	enemy.rightArm = GetImage('hydraBabyArmRight');
	enemy.fireball = GetImage("FireBall");
	enemy.canTransform = gameScreen.enemyManager.enemies.length == 0;
	
    // Movement pattern
    enemy.ApplyMove = EnemyMoveDragon;
    
    var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
    
	// Attack pattern 0 - Missile Barrage
    enemy.SetMovement(0, EnemyMoveDragon);
	for (var i = 0; i < 2; i++) {
		var m = i * 2 - 1;
		enemy.AddWeapon(EnemyWeaponRocket, {
			sprite: GetImage('rocket'),
			damage: 6 * damageScale,
			range: 500,
			radius: 100,
			knockback: 150,
			rate: 50,
			dx: m * 170,
			dy: 10,
			speed: 16,
			angleOffset: 45 * m,
			lists: [playerManager.getRobots()]
		}, 0);
	}
	
	// Attack pattern 1 - Fireball
	enemy.SetMovement(1, EnemyMoveDragon);
	enemy.AddWeapon(EnemyWeaponRocket, {
		sprite: GetImage('FireBall'),
		damage: 15 * damageScale,
		range: 500,
		radius: 150,
		knockback: 75,
		rate: 150,
		dx: 0,
		dy: 100,
		scale: 0.6,
		rotation: -Math.PI / 20,
		speed: 20,
		angleOffset: 0,
		lists: [playerManager.getRobots()]
	}, 1);
	
    // Hydra's tail   
	enemy.tail = new RopeTail(enemy, GetImage('hydraBabyTail'), GetImage('hydraBabyEnd'), 5, 100, 90, 50, 25);
	enemy.ApplyDraw = function() {
    
        // Turn into royal hydra
        if (this.canTransform && this.health < this.maxHealth * 0.2) {
            if (this.exp > 0) {
                gameScreen.particles.push(new RocketExplosion('Enemy', this.x, this.y, 3000));
                gameScreen.enemyManager.enemies = [];
                gameScreen.enemyManager.enemies.push(RoyalHydra(-200, -200));
				gameScreen.enemyManager.turrets = [];
            }
        }
	
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

    return enemy;
}

function RoyalHydra(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('hydraRoyalBody'), 
        x, 
        y,
        2500 * ScalePower(c, 1.4) * playerManager.players.length,
        8,
        750,
		2388,
        720,
        900
    );
    enemy.rank = STAT.DRAGON;
    
    enemy.pierceDamage = 0.1;
    enemy.Knockback = undefined;
    enemy.Slow = undefined;
    enemy.stun = undefined;
    enemy.IsInRange = function() { return true; };
    enemy.turnRange = 1000 * 1000;
    enemy.disableClamp = true;
	enemy.rotateSpeed = Math.PI / 240;
	enemy.patternTimer = enemy.patternMax;
	enemy.pattern = 3;
	
	// Test settings
	//enemy.pattern = 4;
	//enemy.patternTimer = 999999;
    
    // Specific values
    enemy.leftWing = GetImage('hydraRoyalWingLeft');
    enemy.rightWing = GetImage('hydraRoyalWingRight');
	enemy.fireball = GetImage("FireBall");
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveHydraPads;
    
    var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
	enemy.damageScale = damageScale;
    
	// Attack pattern 0 - Missile Barrage
	enemy.SetMovement(0, EnemyMoveDragon);
	for (var i = 0; i < 2; i++) {
		var m = i * 2 - 1;
		for (var j = 0; j < 2; j++) {
			enemy.AddWeapon(EnemyWeaponHomingRocket, {
				sprite: GetImage('rocket'),
				damage: 6 * damageScale,
				range: 600,
				radius: 100,
				knockback: 150,
				rate: 30,
				dx: m * (400 + 340 * j),
				dy: 100 - 100 * j,
				speed: 16
			}, 0);
		}
	}
	
	// Attack pattern 1 - Hyper Beam
	enemy.SetMovement(1, EnemyMoveRotate);
	enemy.hyperBeamData = {
        sprite: GetImage('bossCannon'),
        damage: 2 * damageScale,
        rate: 60,
        range: 1000,
        discharge: 0.1,
        duration: 480,
        dy: 550,
        cd: 60,
		pierce: true
    };
	enemy.AddWeapon(EnemyWeaponRail, enemy.hyperBeamData, 1);
	enemy.hyperBeamData.cd = 60;
	
	// Attack pattern 2 - Spawn baby
	enemy.SetMovement(2, EnemyMoveDragonCenter);
	enemy.AddWeapon(EnemyWeaponSpawn, {
		enemies: HYDRA_SPAWNS,
        max: 1,
        rate: 120,
        delay: 120,
        dx: 0,
        dy: 0
	}, 2);
	
	// Attack pattern 3 - Lay turrets
	enemy.SetMovement(3, EnemyMoveHydraPads);
	
	// Attack pattern 4 - Fireball
	enemy.SetMovement(4, EnemyMoveDragon);
	enemy.AddWeapon(EnemyWeaponRocket, {
		sprite: GetImage('FireBall'),
		damage: 20 * damageScale,
		range: 500,
		radius: 200,
		knockback: 100,
		rate: 120,
		dx: 0,
		dy: 550,
		rotation: -Math.PI / 20,
		speed: 20,
		angleOffset: 0,
		lists: [playerManager.getRobots()]
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
    enemy.head.consumeDamageStart = damageScale * 5;
    enemy.head.consumeDamageTick = damageScale * 0.1;
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
    this.consumeDamageTick = damage * 0.1;
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
        this.held.Damage(this.consumeDamageTick, this.hydra);
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