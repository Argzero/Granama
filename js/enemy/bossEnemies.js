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
    
    // Attack pattern 0 - Orbiting mines
    enemy.SetRange(0, 350);
    enemy.SetMovement(0, EnemyMoveOrbit);
    enemy.AddWeapon(EnemyWeaponMines, {
        type: 'boss',
        damage: 8 * damageScale,
        rate: 30,
        range: 9999,
        duration: 2700
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
		BOSS_EXP
    );
	
    enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
	
	var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
	
	// Fire
	for (var i = 0; i < 2; i++) {
		enemy.AddWeapon(EnemyWeaponFire, {
			damage: 0.02 * damageScale,
			range: 200,
			rate: 3,
			dx: -60 + 120 * i,
			dy: 40
		});
	}
	
	// Rockets
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