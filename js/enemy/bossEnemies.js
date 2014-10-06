// Boss that uses a minigun, mines, and rockets to fight
function HeavyBoss(x, y) {
    
    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('bossPunch'), 
        x, 
        y,
        150 * ScalePower(c, 2),
        3 + 0.2 * c,
        300
    );
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Mines
    enemy.AddWeapon(EnemyWeaponMines, {
        type: 'boss',
        damage: 8 * ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000),
        rate: 30,
        range: 9999,
        duration: 2700
    });
}

// Boss that uses fists and a rail gun to fight
function PunchBoss(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('bossPunch'), 
        x, 
        y,
        150 * ScalePower(c, 2),
        3 + 0.2 * c,
        300
    );
    
    // Specific values
    enemy.leftFist = true;
    enemy.rightFist = true;
    enemy.leftFistImg = GetImage('fistLeft');
    enemy.rightFistImg = GetImage('fistRight');
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveBasic;
    
    // Fist weapon
    enemy.AddWeapon(EnemyWeaponFist, {
        rate: 300,
        speed: 10,
        range: 400,
        damage: ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000)
    });
    
    // Rail weapon
    enemy.AddWeapon(EnemyWeaponRail, {
        damage: 0.05 * ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000),
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