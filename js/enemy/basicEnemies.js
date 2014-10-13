// sprite, x, y, health, speed, range
// AddWeapon(method, data)
// ApplyMove: undefined,
// ApplyDraw: undefined,
// ApplySprite: undefined,

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
        20 * ScalePower(c, 0.8),
        2.5 + 0.2 * c,
        200
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponGun, {
        damage: ((c + 1) / 2) * (c + 2),
        rate: 20,
        range: 200,
        spread: Rand(c + 0.8),
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
        30 * ScalePower(c, 0.8),
        2 + 0.2 * c,
        250
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponGun, {
        damage: ((c + 1) / 2) * (c + 2),
        rate: 15,
        range: 250,
        spread: Rand(c + 0.8),
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
        300
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponGun, {
        sprite: GetImage('hammer'),
        damage: 4 * ((c + 1) / 2) * (c + 2),
        rate: 60,
        range: 300,
        spread: Math.max((c - 3) / 3, 2),
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
        10 * ScalePower(c, 0.8),
        2 + 0.1 * c,
        400
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponGun, {
        damage: ((c + 1) / 2) * (c + 2),
        rate: 45,
        range: 400,
        spread: Rand((c + 1) / 2),
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
        30 * ScalePower(c, 0.8),
        1.5 + 0.1 * c,
        400
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.AddWeapon(EnemyWeaponGun, {
        damage: 2 * ((c + 1) / 2) * (c + 2),
        rate: 35,
        range: 400,
        spread: Rand((c + 1) / 2),
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
        550
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Rail weapon
    enemy.AddWeapon(EnemyWeaponRail, {
        damage: 0.1 * ((c + 1) / 2) * (c + 2),
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
        35 * ScalePower(c, 0.8),
        3.5 + 0.4 * c,
        50
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
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
        45 * ScalePower(c, 0.8),
        3 + 0.3 * c,
        50
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
        15 * ScalePower(c, 0.8),
        2.5 + 0.25 * c,
        400
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
        20 * ScalePower(c, 0.8),
        2.5 + 0.25 * c,
        500
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
        550
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveOrbit;
    
    // Turrets
    enemy.AddWeapon(EnemyWeaponTurrets, {
        health: 120 * TURRET_HEALTH * ScalePower(c, 1),
        damage: ((c + 1) / 2) * (c + 2),
        rate: 600,
        range: 650
    });
    
    return enemy;
}