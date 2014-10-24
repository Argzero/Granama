var BOSS_EXP = 588;

// Boss that uses a minigun, mines, and rockets to fight
function HeavyBoss(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('bossHeavy'), 
        x, 
        y,
        300 * ScalePower(c, 1.4) * playerManager.players.length,
        3 + 0.2 * c,
        300,
		BOSS_EXP,
        300,
        400
    );
    
    enemy.pierceResistant = true;
    enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
    enemy.coverRight = GetImage('bossHeavyCoverRight');
    enemy.coverLeft = GetImage('bossHeavyCoverLeft');
    
    var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
    
    // Attack pattern 0 - Orbiting mines/spawning
    enemy.SetRange(0, 450);
    enemy.SetMovement(0, EnemyMoveOrbit);
    enemy.AddWeapon(EnemyWeaponMines, {
        type: 'boss',
        damage: 8 * damageScale,
        rate: 30,
        range: 9999,
        duration: 2700,
        dx: 0,
        dy: -105
    });
	enemy.AddWeapon(EnemyWeaponSpawn, {
		enemies: c < 4 ? HEAVY_EASY_SPAWNS : HEAVY_SPAWNS,
        max: 10,
        rate: 120,
        delay: 120,
        dx: 0,
        dy: 0
	});
	
    // Attack pattern 1 - Minigun/Rockets
    enemy.SetRange(1, 400);
    enemy.SetMovement(1, EnemyMoveBasic);
	for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponGun, {
			damage: 0.5 * damageScale,
			range: 450,
			rate: 10,
			dx: -130 + 260 * i,
			dy: 130,
			angle: 20,
			delay: 5 * i
		}, 1);
	}
	for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponRocket, {
			sprite: GetImage('rocket'),
            lists: [playerManager.getRobots()],
			damage: 4 * damageScale,
			range: 450,
            radius: 100,
            knockback: 150,
			rate: 120,
			dx: -60 + 120 * i,
			dy: -35,
			delay: 60 * i,
            speed: 15
		}, 1);
	}
    
    // Attack pattern 2 - Homing rockets
    enemy.SetRange(2, 600);
    enemy.SetMovement(2, EnemyMoveBasic);
    for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponHomingRocket, {
			sprite: GetImage('rocket'),
			damage: 4 * damageScale,
			range: 650,
            radius: 100,
            knockback: 150,
			rate: 60,
			dx: -60 + 120 * i,
			dy: -35,
			delay: 30 * i,
            speed: 8
		}, 2);
	}
    
    // Drawing covers
    enemy.ApplySprite = function() {
        if (this.pattern == 0) {
            canvas.drawImage(this.coverRight, 88, 56);
            canvas.drawImage(this.coverLeft, this.sprite.width - 88 - this.coverLeft.width, 56);
        }
    };
	
	return enemy;
}

// Boss that uses fire and rockets to attack
function FireBoss(x, y) {

	// Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('bossFire'), 
        x, 
        y,
        250 * ScalePower(c, 1.4) * playerManager.players.length,
        3 + 0.2 * c,
        200,
		BOSS_EXP,
        300,
        400
    );
	
    enemy.pierceResistant = true;
    enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
    
    // Specific stuff
    enemy.leftClawImg = GetImage('bossFireClawLeft');
    enemy.rightClawImg = GetImage('bossFireClawRight');
    enemy.clawRotation = Vector(1, 0);
    enemy.clawRotCount = 0;
    enemy.sword = true;
    enemy.right = true;
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
	
	var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
	
    // Weapon pattern 0 - rockets and fire
    enemy.SetRange(0, 200);
	for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponFire, {
			damage: 0.02 * damageScale,
			range: 200,
			rate: 3,
            angle: -30 + 60 * i,
			dx: -120 + 240 * i,
			dy: 15
		});
	}
	for (var i = 0; i < 3; i++) {
		enemy.AddWeapon(EnemyWeaponGun, {
			sprite: GetImage('rocket'),
			damage: 4 * damageScale,
			range: 500,
			rate: 180,
			dx: 12 - 12 * i,
			dy: -23,
			delay: 20 * i
		});
	}
    
    // Weapon pattern 1 - claw melee
    enemy.SetRange(1, 150);
    enemy.AddWeapon(EnemyWeaponDoubleSword, {
        spriteName: 'bossFireClaw',
        range: 175,
        rate: 60,
        arc: Math.PI * 3 / 4,
        radius: 175,
        damage: damageScale,
        knockback: 100,
        angle: 0,
        dx: -90,
        dy: 0
    }, 1);
	
	// Weapon pattern 2 - Spawning grabbers
    enemy.AddWeapon(EnemyWeaponSpawn, {
        enemies: FIRE_SPAWNS,
        max: 3,
        rate: 60,
        delay: 60,
        dx: 0,
        dy: 0
    }, 2);
    
    // Drawing claws
    enemy.ApplySprite = function() {
        if (this.pattern == 0 && this.clawRotCount < 30) {
            this.clawRotation.Rotate(COS_1, SIN_1);
            this.clawRotCount++;
        }
        else if (this.pattern != 0 && this.clawRotCount > 0) {
            this.clawRotation.Rotate(COS_1, -SIN_1);
            this.clawRotCount--;
        }
        if (this.sword || !this.right) {
            canvas.save();
            canvas.translate(this.leftClawImg.width / 2 + this.sprite.width, 40 + this.leftClawImg.height / 2);
            canvas.transform(this.clawRotation.x, this.clawRotation.y, -this.clawRotation.y, this.clawRotation.x, 0, 0);
            canvas.drawImage(this.leftClawImg, -this.leftClawImg.width / 2, -this.leftClawImg.height / 2);
            canvas.restore();
        }
        if (this.sword || this.right) {
            canvas.save();
            canvas.translate(-this.leftClawImg.width / 2, 40 + this.leftClawImg.height / 2);
            canvas.transform(this.clawRotation.x, -this.clawRotation.y, this.clawRotation.y, this.clawRotation.x, 0, 0);
            canvas.drawImage(this.rightClawImg, -this.rightClawImg.width / 2, -this.rightClawImg.height / 2);
            canvas.restore();
        }
    };
	
	// Draw the tail
	enemy.tail = EnemyTail(enemy, GetImage('bossFireSegment'), GetImage('bossFireEnd'), 60, 4, 90, 25);
	enemy.ApplyDraw = function() {
		this.tail.Draw();
	}
	
	return enemy;
}

// Boss that uses fists and a rail gun to fight
function PunchBoss(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('bossPunch'), 
        x, 
        y,
        300 * ScalePower(c, 1.4) * playerManager.players.length,
        3 + 0.2 * c,
        300,
		BOSS_EXP,
		300,
		400
    );
    
    enemy.pierceResistant = true;
    enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
    
    // Specific values
    enemy.leftFist = true;
    enemy.rightFist = true;
    enemy.leftFistImg = GetImage('fistLeft');
    enemy.rightFistImg = GetImage('fistRight');
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
	
	var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
    
    // Weapon pattern 0 - fists and rail gun
    enemy.AddWeapon(EnemyWeaponFist, {
        rate: 300,
        speed: 10,
        range: 400,
        damage: damageScale
    });
    enemy.AddWeapon(EnemyWeaponRail, {
        damage: 0.05 * damageScale,
        rate: 150,
        range: 500,
        discharge: 0.1,
        duration: 60
    });
    
    // Weapon pattern 1 - shockwaves
    for (var i = 0; i < 5; i++) {
        var offset = 3 * Math.PI * i / 8;
        enemy.AddWeapon(EnemyWeaponShockwave, {
            rate: 120,
            damage: 2 * damageScale,
            start: offset,
            end: 2 * Math.PI / 8 + offset,
            radius: 75,
            range: 750,
            knockback: 50,
            speed: enemy.speed
        }, 1);
    }
    
    // Weapon pattern 2 - Spawning paladins
    enemy.AddWeapon(EnemyWeaponSpawn, {
        enemies: PUNCH_SPAWNS,
        max: 1,
        rate: 120,
        delay: 300,
        dx: 0,
        dy: 0
    }, 2);
    
    // Drawing fists
    enemy.ApplySprite = function() {
        if (this.leftFist) {
            canvas.drawImage(this.leftFistImg, 5 + this.sprite.width, 0);
        }
        if (this.rightFist) {
            canvas.drawImage(this.rightFistImg, -5 - this.rightFistImg.width, 0);
        }
    };
    
    return enemy;
}

function DragonBoss(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('bossDragonHead'), 
        x, 
        y,
        500 * ScalePower(c, 1.4) * playerManager.players.length,
        4 + 0.3 * c,
        300,
		1188,
        600,
        750
    );
    
    enemy.pierceResistant = true;
    enemy.Knockback = undefined;
    enemy.Slow = undefined;
    enemy.IsInRange = enemyFunctions.DragonRange;
    
    // Specific values
    enemy.leftWing = GetImage('bossDragonLeftWing');
    enemy.rightWing = GetImage('bossDragonRightWing');
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveDragon;
    
    var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
    
    // Attack pattern 0 - Lasers and fire
    enemy.SetMovement(0, EnemyMoveDragon);
    for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponGun, {
			sprite: GetImage('bossLaser'),
			damage: 0.1 * damageScale,
			range: 1000,
			rate: 30,
			dx: -133 + 266 * i,
			dy: -23,
            speed: 15,
            pierce: true
		});
	}
    enemy.AddWeapon(EnemyWeaponFire, {
        damage: 0.05 * damageScale,
        range: 300,
        rate: 3,
        dx: 0,
        dy: 42
    });
    
    // Attack pattern 1 - Spawning minibosses
    enemy.SetMovement(1, EnemyMoveDragonCenter);
    enemy.AddWeapon(EnemyWeaponSpawn, {
        enemies: DRAGON_SPAWNS,
        max: 5,
        rate: 120,
        delay: 300,
        dx: 0,
        dy: -100
    });
	
	// Attack pattern 2 - Homing missiles
	enemy.SetMovement(2, EnemyMoveDragon);
	enemy.AddWeapon(EnemyWeaponFire, {
        damage: 0.05 * damageScale,
        range: 300,
        rate: 3,
        dx: 0,
        dy: 42
    }, 2);
	for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponHomingRocket, {
			sprite: GetImage('rocket'),
			damage: 5 * damageScale,
			range: 600,
            radius: 100,
            knockback: 150,
			rate: 90,
			dx: -223 + 446 * i,
			dy: -33,
            speed: 8
		}, 2);
	}
    
    // Dragon's tail
	enemy.tail = EnemyTail(enemy, GetImage('bossDragonSegment'), GetImage('bossDragonEnd'), 90, 5, 120, 30);
    enemy.tail.SetTurrets(GetImage('bossDragonTurret'), GetImage('bullet'), damageScale, 60, false, 0, 48);
	enemy.ApplyDraw = function() {
		this.tail.Draw();
	}
    
    // Drawing wings
    enemy.ApplySprite = function() {
        canvas.drawImage(this.leftWing, this.sprite.width, -100);
        canvas.drawImage(this.rightWing, -this.rightWing.width, -100);
    }

    return enemy;
}

// Boss that uses a minigun, mines, and rockets to fight
function QueenBoss(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('bossQueen'), 
        x, 
        y,
        300 * ScalePower(c, 1.4) * playerManager.players.length,
        3 + 0.3 * c,
        600,
		BOSS_EXP,
        600,
        600
    );
    
	// Boss Stuff
    enemy.pierceResistant = true;
    enemy.IsInRange = enemyFunctions.BossInRange;
	enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
	enemy.ApplyMove = EnemyMoveBasic;
	
	var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
	
	// Stats for collision
	enemy.scale = 1;
	enemy.damage = 10 * damageScale;
	enemy.distance = 400;
	enemy.chargeDuration = 180;
    
	// Attack Pattern 0 - Charging around spawning bees
	enemy.SetMovement(0, EnemyMoveCharge);
	enemy.AddWeapon(EnemyWeaponSpawn, {
        enemies: QUEEN_SPAWNS,
        max: 20,
        rate: 45,
        delay: 45,
        dx: 0,
        dy: 0
    }, 0);
	
	// Attack pattern 1 - Backwards shooting
	enemy.SetMovement(1, EnemyMoveBasic);
	for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponGun, {
			sprite: GetImage('stinger'),
			damage: damageScale * 3,
			range: 750,
			rate: 45,
			spread: 2,
			dx: -50 + 100 * i,
			dy: -155,
			speed: -12
		}, 1);
	}
	
	// Attack pattern 2 - X Laser
	enemy.SetMovement(2, EnemyMoveBasic);
	for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponGun, {
			sprite: GetImage('bossLaser'),
			damage: damageScale * 0.2,
			pierce: true,
			range: 750,
			rate: 1,
			dx: -85 + 170 * i,
			dy: 90,
			angleOffset: -10 + 20 * i
		}, 2);
	}
	
	// Draw the wings
	enemy.wings = EnemyWings(enemy, 'bossQueen', -15, -30);
	enemy.ApplyDraw = function() {
		this.wings.draw();
		this.backwards = this.pattern == 1;
	};
	
	return enemy;
}