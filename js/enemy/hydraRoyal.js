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
        600,
        750
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
    
    // Specific values
    enemy.leftWing = GetImage('hydraRoyalWingLeft');
    enemy.rightWing = GetImage('hydraRoyalWingRight');
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveDragon;
	enemy.speed = 8;
    
    var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
    
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
				rate: 90,
				dx: m * (400 + 340 * j),
				dy: 100 - 100 * j,
				speed: 12
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
	
    // Hydra's tail   
	enemy.tail = new RopeTail(enemy, GetImage('hydraRoyalTail'), GetImage('hydraRoyalEnd'), 7, 175, 150, 175, 20);
	enemy.ApplyDraw = function() {
	
		// Hyper beam
		if (this.hyperBeamData.cd < 0 && !this.firinLazors) {
			this.firinLazors = true;
		}
		else if (this.hyperBeamData.cd > 0 && this.firinLazors) {
			do {
				this.SwitchPattern();
			}
			while (this.pattern == 1);
		}
	
        // Tail
        this.tail.update();
        
        canvas.save();
        canvas.translate(this.sprite.width / 2, this.sprite.height / 2);
		canvas.transform(this.sin, -this.cos, this.cos, this.sin, 0, 0);
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
    enemy.ApplySprite = function() {
        this.head.update();
        this.headLeft.update();
		this.headRight.update();
    }

    return enemy;
}

function RoyalHydraSideHead(hydra, rope, damage) {
	this.hydra = hydra;
	this.rope = rope;
	this.pattern = 0;
	
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
		
		this.flamethrower(this.fireData);
	}
	this.rope.update();
}