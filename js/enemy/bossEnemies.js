var BOSS_EXP = 600;

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
    
    enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
    
    var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
    
    // Attack pattern 0 - Orbiting mines/spawning
    enemy.SetRange(0, 350);
    enemy.SetMovement(0, EnemyMoveOrbit);
    enemy.AddWeapon(EnemyWeaponMines, {
        type: 'boss',
        damage: 8 * damageScale,
        rate: 30,
        range: 9999,
        duration: 2700
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
    enemy.SetRange(1, 300);
    enemy.SetMovement(1, EnemyMoveBasic);
	for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponGun, {
			damage: 0.5 * damageScale,
			range: 350,
			rate: 10,
			dx: -60 + 120 * i,
			dy: 100,
			angle: 20,
			delay: 5 * i
		}, 1);
	}
	for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponRocket, {
			sprite: GetImage('rocket'),
            lists: [playerManager.getRobots()],
			damage: 4 * damageScale,
			range: 350,
            radius: 100,
            knockback: 150,
			rate: 120,
			dx: -46 + 92 * i,
			dy: 18,
			delay: 60 * i,
            speed: 15
		}, 1);
	}
    
    // Attack pattern 2 - Homing rockets
    enemy.SetRange(2, 500);
    enemy.SetMovement(2, EnemyMoveBasic);
    for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponHomingRocket, {
			sprite: GetImage('rocket'),
			damage: 4 * damageScale,
			range: 550,
            radius: 100,
            knockback: 150,
			rate: 60,
			dx: -46 + 92 * i,
			dy: 18,
			delay: 30 * i,
            speed: 8
		}, 2);
	}
	
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
	
    enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
    
    // Specific stuff
    enemy.leftClawImg = GetImage('bossFireClawLeft');
    enemy.rightClawImg = GetImage('bossFireClawRight');
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
			dx: -60 + 120 * i,
			dy: 40
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
    enemy.SetRange(1, 100);
    enemy.AddWeapon(EnemyWeaponDoubleSword, {
        spriteName: 'bossFireClaw',
        range: 125,
        rate: 60,
        arc: Math.PI * 3 / 4,
        radius: 125,
        damage: damageScale,
        knockback: 100,
        angle: 0,
        dx: -32,
        dy: -27
    }, 1);
    
    
    // Drawing claws
    enemy.ApplySprite = function() {
        if (this.sword || !this.right) {
            canvas.drawImage(this.leftClawImg, this.sprite.width - 28, 69);
        }
        if (this.sword || this.right) {
            canvas.drawImage(this.rightClawImg, 28 - this.rightClawImg.width, 69);
        }
    };
	
	// Draw the tail
	enemy.tail = EnemyTail(enemy, GetImage('bossTailMid'), GetImage('bossTailEnd'), 15, 5, 25, 0);
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
		BOSS_EXP
    );
    
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
    
    // Fist weapon
    enemy.AddWeapon(EnemyWeaponFist, {
        rate: 300,
        speed: 10,
        range: 400,
        damage: damageScale
    });
    
    // Rail weapon
    enemy.AddWeapon(EnemyWeaponRail, {
        damage: 0.05 * damageScale,
        rate: 150,
        range: 500,
        discharge: 0.1,
        duration: 60
    });
    
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
		BOSS_EXP,
        1200,
        1500
    );
    
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
	enemy.SetMovement(0, EnemyMoveDragon);
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
	enemy.tail = EnemyTail(enemy, GetImage('bossDragonSegment'), GetImage('bossDragonEnd'), 30, 5, 40, 10);
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