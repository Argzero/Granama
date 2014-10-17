// sprite, x, y, health, speed, range
// AddWeapon(method, data)
// ApplyMove: undefined,
// ApplyDraw: undefined,
// ApplySprite: undefined,

var LIGHT_EXP = 24;
var HEAVY_EXP = 36;
var MINIBOSS_EXP = 120;

// Power function for scaling enemy health
function ScalePower(c, step) {
    if (c > 4) {
        return Math.pow(2, step * (2 + c / 2));
    }
    else {
        return Math.pow(2, step * c);
    }
}

function LightRangedEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyLightRanged'), 
        x, 
        y,
        20 * ScalePower(c, 0.9),
        2.5 + 0.2 * c,
        200,
		LIGHT_EXP
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponGun, {
        damage: ((c + 1) / 2) * (c + 2),
        rate: 20,
        range: 200,
        spread: Rand(c / 2 + 0.4),
        dx: 23,
        dy: 30
    });
    
    return enemy;
}

function HeavyRangedEnemy(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHeavyRanged'), 
        x, 
        y,
        30 * ScalePower(c, 0.9),
        2 + 0.2 * c,
        250,
		HEAVY_EXP
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponGun, {
        damage: ((c + 1) / 2) * (c + 2),
        rate: 15,
        range: 250,
        spread: Rand(c / 2 + 0.4),
        dx: 0,
        dy: 35
    });
    
    return enemy;
}

function PaladinEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyPaladin'), 
        x, 
        y,
        100 * ScalePower(c, 1.1),
        3 + 0.25 * c,
        300,
		MINIBOSS_EXP
    );
	
	enemy.Knockback = enemyFunctions.MinibossKnockback;
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponGun, {
        sprite: GetImage('hammer'),
        damage: 4 * ((c + 1) / 2) * (c + 2),
        rate: 60,
        range: 300,
        spread: Math.max((c - 3) / 4, 2),
        dx: 0,
        dy: 45
    });
    
    return enemy;
}

function LightArtilleryEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyLightArtillery'), 
        x, 
        y,
        10 * ScalePower(c, 0.9),
        2 + 0.1 * c,
        400,
		LIGHT_EXP
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponGun, {
        damage: ((c + 1) / 2) * (c + 2),
        rate: 45,
        range: 400,
        spread: Rand((c + 1) / 3),
        dx: 0,
        dy: 38
    });
	
    return enemy;
}

function HeavyArtilleryEnemy(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHeavyArtillery'), 
        x, 
        y,
        30 * ScalePower(c, 0.9),
        1.5 + 0.1 * c,
        400,
		HEAVY_EXP
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponGun, {
        damage: 2 * ((c + 1) / 2) * (c + 2),
        rate: 35,
        range: 400,
        spread: Rand((c + 1) / 3),
        dx: 0,
        dy: 53
    });
    
    return enemy;
}

function RailerEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyRailer'), 
        x, 
        y,
        80 * ScalePower(c, 1.1),
        2 + 0.2 * c,
        550,
		MINIBOSS_EXP
    );
	
	enemy.Knockback = enemyFunctions.MinibossKnockback;
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Rail weapon
    enemy.AddWeapon(EnemyWeaponRail, {
        damage: 0.2 * ((c + 1) / 2) * (c + 2),
        rate: 60,
        range: 600,
        discharge: 0.1,
        duration: 120,
        pierce: true,
        dy: 68,
        dx: 0
    });
    
    return enemy;
}

function LightMeleeEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyLightMelee'), 
        x, 
        y,
        35 * ScalePower(c, 0.9),
        3.5 + 0.4 * c,
        50,
		LIGHT_EXP
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Melee weapon
    enemy.AddWeapon(EnemyWeaponMelee, {
        damage: 2 * ((c + 1) / 2) * (c + 2),
        rate: 30,
        range: 50
    });
    
    return enemy;
}

function HeavyMeleeEnemy(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHeavyMelee'), 
        x, 
        y,
        45 * ScalePower(c, 0.9),
        3 + 0.3 * c,
        50,
		HEAVY_EXP
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponMelee, {
        damage: 3 * ((c + 1) / 2) * (c + 2),
        rate: 40,
        range: 50
    });
    
    return enemy;
}

function LightBomberEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyLightBomber'), 
        x, 
        y,
        15 * ScalePower(c, 0.9),
        2.5 + 0.25 * c,
        400,
		LIGHT_EXP
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveOrbit;
    
    // Mines
    enemy.AddWeapon(EnemyWeaponMines, {
        type: 'LightBomber',
        damage: 3 * ((c + 1) / 2) * (c + 2),
        rate: 90,
        range: 500
    });
    
    return enemy;
}

function HeavyBomberEnemy(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHeavyBomber'), 
        x, 
        y,
        20 * ScalePower(c, 0.9),
        2.5 + 0.25 * c,
        500,
		HEAVY_EXP
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveOrbit;
    
    // Mines
    enemy.AddWeapon(EnemyWeaponMines, {
        type: 'HeavyBomber',
        damage: 5 * ((c + 1) / 2) * (c + 2),
        rate: 90,
        range: 600
    });
    
    return enemy;
}

function TurretEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyTurret'), 
        x, 
        y,
        120 * ScalePower(c, 1.1),
        2.5 + 0.2 * c,
        550,
		MINIBOSS_EXP
    );
	
	enemy.Knockback = enemyFunctions.MinibossKnockback;
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveOrbit;
    
    // Turrets
    enemy.AddWeapon(EnemyWeaponTurrets, {
        health: 50 * ScalePower(c, 0.8),
        damage: ((c + 1) / 2) * (c + 2),
        rate: 600,
        range: 650
    });
    
    return enemy;
}

function LightOrbiterEnemy(x, y) {

	// Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyLightOrbiter'), 
        x, 
        y,
        60 * ScalePower(c, 0.9),
        4 + 0.5 * c,
        300,
		LIGHT_EXP
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveOrbit;
    
    // Side gun
    enemy.AddWeapon(EnemyWeaponSideGun, {
        damage: ((c + 1) / 2) * (c + 2),
        rate: 45,
        range: 450
    });
	
	//offset, length, base, endOffset
	// Draw the tail
	enemy.tail = EnemyTail(enemy, GetImage('enemyLightOrbiterTail'), GetImage('enemyLightOrbiterTail'), 28, 3, 40, 0);
	enemy.ApplyDraw = function() {
		this.tail.Draw();
	}
    
    return enemy;
}

function HeavyOrbiterEnemy(x, y) {

	// Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHeavyOrbiter'), 
        x, 
        y,
        80 * ScalePower(c, 0.9),
        3.75 + 0.45 * c,
        300,
		HEAVY_EXP
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveOrbit;
    
    // Side gun
    enemy.AddWeapon(EnemyWeaponSideGun, {
        damage: 2 * ((c + 1) / 2) * (c + 2),
        rate: 60,
        range: 450
    });
	
	//offset, length, base, endOffset
	// Draw the tail
	enemy.tail = EnemyTail(enemy, GetImage('enemyHeavyOrbiterTail'), GetImage('enemyHeavyOrbiterTail'), 30, 3, 35, 0);
	enemy.ApplyDraw = function() {
		this.tail.Draw();
	}
    
    return enemy;
}

function HunterEnemy(x, y) {

	// Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHunter'), 
        x, 
        y,
        300 * ScalePower(c, 1.1),
        3.5 + 0.4 * c,
        350,
		MINIBOSS_EXP
    );
	
	enemy.Knockback = enemyFunctions.MinibossKnockback;
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveOrbit;
    
    // Side gun
    enemy.AddWeapon(EnemyWeaponSideGun, {
        damage: 3 * ((c + 1) / 2) * (c + 2),
        rate: 45,
        range: 450
    });
	
	//offset, length, base, endOffset
	// Draw the tail
	enemy.tail = EnemyTail(enemy, GetImage('enemyHunterSegment'), GetImage('enemyHunterEnd'), 27, 4, 33, 0);
	enemy.ApplyDraw = function() {
		this.tail.Draw();
		
		// Switch to melee when below 1/4 hp
		if (this.health < this.maxHealth * 0.5 && this.ApplyMove != EnemyMoveBasic) {
			this.ApplyMove = EnemyMoveBasic;
			this.range = 50;
			this.weapons = [];
			this.AddWeapon(EnemyWeaponMelee, {
				damage: 4 * ((c + 1) / 2) * (c + 2),
				rate: 40,
				range: 50
			});
		}
	}
    
    return enemy;
}

function LightBouncerEnemy(x, y) {

	// Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyLightBouncer'), 
        x, 
        y,
        60 * ScalePower(c, 0.9),
        5 + 0.3 * c,
        0,
		LIGHT_EXP
    );
    
    // Movement pattern
	var angle = Rand(360 * Math.PI / 180);
	enemy.direction = Vector(Math.cos(angle), Math.sin(angle));
    enemy.ApplyMove = EnemyMoveBounce;
	enemy.Knockback = enemyFunctions.KnockbackBouncer;
	
	// Stats for collision
	enemy.scale = 1;
	enemy.damage = 4 * ((c + 1) / 2) * (c + 2);
	enemy.distance = 150;
	
	// Draw the spinner
	enemy.spinner = EnemySpinner(GetImage('enemyLightBouncerBack'), enemy, Math.PI / 15);
	enemy.ApplyDraw = function() {
		this.spinner.draw();
	}
    
    return enemy;
}

function HeavyBouncerEnemy(x, y) {

	// Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHeavyBouncer'), 
        x, 
        y,
        80 * ScalePower(c, 0.9),
        5 + 0.3 * c,
        0,
		HEAVY_EXP
    );
    
    // Movement pattern
	var angle = Rand(360 * Math.PI / 180);
	enemy.direction = Vector(Math.cos(angle), Math.sin(angle));
    enemy.ApplyMove = EnemyMoveBounce;
	enemy.Knockback = enemyFunctions.KnockbackBouncer;
	
	// Stats for collision
	enemy.scale = 1;
	enemy.damage = 6 * ((c + 1) / 2) * (c + 2);
	enemy.distance = 200;
	
	// Draw the spinner
	enemy.spinner = EnemySpinner(GetImage('enemyHeavyBouncerBack'), enemy, Math.PI / 30);
	enemy.ApplyDraw = function() {
		this.spinner.draw();
	}
    
    return enemy;
}

function SolarEnemy(x, y) {

	// Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemySolar'), 
        x, 
        y,
        230 * ScalePower(c, 1.1),
        5 + 0.3 * c,
        0,
		MINIBOSS_EXP
    );
    
    // Movement pattern
	var angle = Rand(360 * Math.PI / 180);
	enemy.direction = Vector(Math.cos(angle), Math.sin(angle));
    enemy.ApplyMove = EnemyMoveBounce;
	enemy.Knockback = undefined;
	
	// Stats for collision
	enemy.scale = 1;
	enemy.damage = 8 * ((c + 1) / 2) * (c + 2);
	enemy.distance = 300;
	
	// Draw the spinner
	enemy.spinner = EnemySpinner(GetImage('enemySolarBack'), enemy, Math.PI / 30, true, 0.5 * ((c + 1) / 2) * (c + 2));
	enemy.ApplyDraw = function() {
		this.spinner.draw();
	}
    
    return enemy;
}