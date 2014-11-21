function RoyalHydra(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('hydraRoyalBody'), 
        x, 
        y,
        2500 * ScalePower(c, 1.4) * playerManager.players.length,
        4 + 0.3 * c,
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
    enemy.IsInRange = enemyFunctions.DragonRange;
    enemy.turnRange = 1000 * 1000;
    enemy.disableClamp = true;
    
    // Specific values
    enemy.leftWing = GetImage('hydraRoyalWingLeft');
    enemy.rightWing = GetImage('hydraRoyalWingRight');
    
    // Movement pattern
    enemy.ApplyMove = EnemyMoveDragon;
    
    var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
    
    // Hydra's tail   
	enemy.tail = new RopeTail(enemy, GetImage('hydraRoyalTail'), GetImage('hydraRoyalEnd'), 7, 175, 150, 175, 20);
	enemy.ApplyDraw = function() {
    
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
    enemy.headLeft = new RopeTail(enemy, GetImage('hydraRoyalNeck'), GetImage('hydraRoyalHeadSmall'), 4, 125, 250, 0, 20);
    enemy.headRight = new RopeTail(enemy, GetImage('hydraRoyalNeck'), GetImage('hydraRoyalHeadSmall'), 4, 125, 250, 50, 20);
    enemy.head.reverse = enemy.headLeft.reverse = enemy.headRight.reverse = true;
    enemy.headLeft.rel = Vector(COS_60, SIN_60);
    enemy.headRight.rel = Vector(COS_60, -SIN_60);
    enemy.ApplySprite = function() {
        this.head.update();
        
        this.headLeft.followParent();
        this.headRight.followParent();
        this.headLeft.turnTowards(this.head.dir, 0.04, ROPE_TURN_END);
        this.headRight.turnTowards(this.head.dir, 0.04, ROPE_TURN_END);
        this.headLeft.update();
        this.headRight.update();
    }

    return enemy;
}