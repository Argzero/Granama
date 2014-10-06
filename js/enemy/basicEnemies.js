// sprite, x, y, health, speed, range
// ApplyWeapons: undefined,
// ApplyMove: undefined,
// ApplyDraw: undefined,
// ApplySprite: undefined,

// Power function for scaling enemy health
function ScalePower(c, step) {
    if (c > 4) {
        return Math.pow(2, step * (2 + c / 2));
    }
    else {
        return Math.pow(2, step);
    }
}

function LightRangedEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyLightRanged'), 
        x, 
        y,
        20 * ScalePower(c, 1),
        2.5 + 0.2 * c,
        200
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponGun;
    enemy.gunDamage = ((c + 1) / 2) * (c + 2);
    enemy.gunSpeed = 20;
    enemy.gunRange = 200;
    enemy.gunSpread = Rand(c + 1);
    
    return enemy;
}

function HeavyRangedEnemy(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHeavyRanged'), 
        x, 
        y,
        30 * ScalePower(c, 1),
        2 + 0.2 * c,
        250
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponGun;
    enemy.gunDamage = ((c + 1) / 2) * (c + 2);
    enemy.gunSpeed = 15;
    enemy.gunRange = 250;
    enemy.gunSpread = Rand(c + 1);
    
    return enemy;
}

function PaladinEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyPaladin'), 
        x, 
        y,
        100 * ScalePower(c, 1.5),
        3 + 0.25 * c,
        300
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponGun;
    enemy.gunSprite = GetImage('hammer');
    enemy.gunDamage = 4 * ((c + 1) / 2) * (c + 2);
    enemy.gunSpeed = 60;
    enemy.gunRange = 300;
    enemy.gunSpread = Math.max((c - 3) / 3, 2);
    
    return enemy;
}

function LightArtilleryEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyLightArtillery'), 
        x, 
        y,
        10 * ScalePower(c, 1),
        2 + 0.1 * c,
        400
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponGun;
    enemy.gunDamage = ((c + 1) / 2) * (c + 2);
    enemy.gunSpeed = 45;
    enemy.gunRange = 400;
    enemy.gunSpread = Rand((c + 1) / 2);
    
    return enemy;
}

function HeavyArtilleryEnemy(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHeavyArtillery'), 
        x, 
        y,
        30 * ScalePower(c, 1),
        1.5 + 0.1 * c,
        400
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponGun;
    enemy.gunDamage = 2 * ((c + 1) / 2) * (c + 2);
    enemy.gunSpeed = 35;
    enemy.gunRange = 400;
    enemy.gunSpread = Rand((c + 1) / 2);
    
    return enemy;
}

function RailerEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyRailer'), 
        x, 
        y,
        80 * ScalePower(c, 1.5),
        2 + 0.2 * c,
        550
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponRail;
    enemy.railDamage = 0.1 * ((c + 1) / 2) * (c + 2);
    enemy.railSpeed = 60;
    enemy.railRange = 600;
    enemy.railDischarge = 0.1;
    enemy.railDuration = 120;
    
    return enemy;
}

function LightMeleeEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyLightMelee'), 
        x, 
        y,
        35 * ScalePower(c, 1),
        3.5 + 0.4 * c,
        50
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponMelee;
    enemy.meleeDamage = 2 * ((c + 1) / 2) * (c + 2);
    enemy.meleeSpeed = 30;
    enemy.meleeRange = 50;
    
    return enemy;
}

function HeavyMeleeEnemy(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHeavyMelee'), 
        x, 
        y,
        45 * ScalePower(c, 1),
        3 + 0.3 * c,
        50
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponGun;
    enemy.meleeDamage = 3 * ((c + 1) / 2) * (c + 2);
    enemy.meleeSpeed = 40;
    enemy.meleeRange = 50;
    
    return enemy;
}

function LightBomberEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyLightBomber'), 
        x, 
        y,
        15 * ScalePower(c, 1),
        2.5 + 0.25 * c,
        400
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveOrbit;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponMines;
    enemy.mineType = 'LightBomber';
    enemy.mineDamage = 3 * ((c + 1) / 2) * (c + 2);
    enemy.mineSpeed = 90;
    enemy.mineRange = 500;
    
    return enemy;
}

function HeavyBomberEnemy(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyHeavyBomber'), 
        x, 
        y,
        20 * ScalePower(c, 1),
        2.5 + 0.25 * c,
        500
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveOrbit;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponMines;
    enemy.mineType = 'HeavyBomber';
    enemy.mineDamage = 5 * ((c + 1) / 2) * (c + 2);
    enemy.mineSpeed = 90;
    enemy.mineRange = 600;
    
    return enemy;
}

function TurretEnemy(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('enemyTurret'), 
        x, 
        y,
        120 * ScalePower(c, 1.5),
        2.5 + 0.2 * c,
        550
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveOrbit;
    
    // Gun weapon
    enemy.ApplyWeapons = EnemyWeaponMines;
    enemy.turretDamage = 1 * ((c + 1) / 2) * (c + 2);
    enemy.turretSpeed = 600;
    enemy.turretRange = 650;
    
    return enemy;
}