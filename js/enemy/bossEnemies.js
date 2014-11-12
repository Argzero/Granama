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
    enemy.rank = STAT.BOSS;
    
    enemy.pierceDamage = 0.1;
    enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
    enemy.coverRight = GetImage('bossHeavyCoverRight');
    enemy.coverLeft = GetImage('bossHeavyCoverLeft');
    enemy.coverOffset = 0;
    enemy.stun = undefined;
    
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
        if (this.pattern != 0 && this.coverOffset < 45) {
            this.coverOffset++;
        }
        else if (this.pattern == 0 && this.coverOffset > 0) {
            this.coverOffset--;
        }
        canvas.drawImage(this.coverRight, 88 - this.coverOffset, 56);
        canvas.drawImage(this.coverLeft, this.sprite.width - 88 - this.coverLeft.width + this.coverOffset, 56);
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
    enemy.rank = STAT.BOSS;
	
    enemy.pierceDamage = 0.2;
    enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
    enemy.stun = undefined;
    
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
    enemy.rank = STAT.BOSS;
    
    enemy.pierceDamage = 0.2;
    enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
    enemy.stun = undefined;
    
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
        sprite: GetImage('bossLaser'),
        damage: 0.15 * damageScale,
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
    enemy.rank = STAT.DRAGON;
    
    enemy.pierceDamage = 0.4;
    enemy.Knockback = undefined;
    enemy.Slow = undefined;
    enemy.stun = undefined;
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
			dx: -185 + 370 * i,
			dy: 17,
            speed: 15,
            pierce: true
		});
	}
    enemy.AddWeapon(EnemyWeaponFire, {
        damage: 0.1 * damageScale,
        range: 300,
        rate: 3,
        dx: 0,
        dy: 100
    });
    
    // Attack pattern 1 - Spawning minibosses
    enemy.SetMovement(1, EnemyMoveDragonCenter);
    enemy.AddWeapon(EnemyWeaponSpawn, {
        enemies: DRAGON_SPAWNS,
        max: 8,
        rate: 120,
        delay: 300,
        dx: 0,
        dy: -100
    }, 1);
	
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
			dx: -238 + 476 * i,
			dy: -10,
            speed: 8
		}, 2);
	}
    
    // Dragon's tail
    enemy.tail2 = EnemyTail(enemy, GetImage('bossDragonEnd'), GetImage('bossDragonEnd'), 0, 1, 0, 90);
	enemy.tail = EnemyTail(enemy, GetImage('bossDragonEnd'), GetImage('bossDragonEnd'), 150, 5, 240, 0);
    enemy.tail.SetTurrets(GetImage('bossDragonTurret'), GetImage('bullet'), damageScale, 60, false, 0, 48);
	enemy.ApplyDraw = function() {
        this.tail.Draw();
        this.tail2.Draw();
	}
    
    // Drawing wings
    enemy.ApplySprite = function() {
        canvas.drawImage(this.leftWing, this.sprite.width - 10, -50);
        canvas.drawImage(this.rightWing, 10 - this.rightWing.width, -50);
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
    enemy.rank = STAT.BOSS;
    
	// Boss Stuff
    enemy.pierceDamage = 0.2;
    enemy.IsInRange = enemyFunctions.BossInRange;
	enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
	enemy.ApplyMove = EnemyMoveBasic;
    enemy.stun = undefined;
	
	var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
	
	// Stats for collision
	enemy.scale = 1;
	enemy.damage = 3 * damageScale;
	enemy.distance = 400;
	enemy.chargeDuration = 180;
    enemy.patternTimer = enemy.patternMax;
    
	// Attack Pattern 0 - Charging around spawning bees
	enemy.SetMovement(0, EnemyMoveCharge);
	enemy.AddWeapon(EnemyWeaponSpawn, {
        enemies: QUEEN_SPAWNS,
        max: 15,
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

function TankBoss(x, y) {

    // Base enemy stats
    var c = gameScreen.enemyManager.bossCount;
    var enemy = EnemyBase(
        GetImage('bossTank'), 
        x, 
        y,
        600 * ScalePower(c, 1.4) * playerManager.players.length,
        1 + 0.1 * c,
        450,
		BOSS_EXP,
        600,
        600
    );
    enemy.rank = STAT.BOSS;
    
	// Boss Stuff
    enemy.pierceDamage = 0.1;
    enemy.IsInRange = enemyFunctions.BossInRange;
	enemy.Knockback = enemyFunctions.BossKnockback;
    enemy.Slow = enemyFunctions.BossSlow;
	enemy.ApplyMove = EnemyMoveBasic;
    enemy.stun = undefined;
    enemy.turnDivider = 100;
	
    enemy.cover = GetImage('bossTankCover');
    enemy.cannon = GetImage('bossTankCannon');
    enemy.chainFlat = GetImage('chainFlat');
    enemy.chainUp = GetImage('chainUp');
    enemy.hook = GetImage('bossTankGrapple');
    enemy.armLeft = GetImage('bossTankArmLeft');
    enemy.armRight = GetImage('bossTankArmRight');
    
    enemy.hooks = [
        { root: Vector(-132, -100), pos: Vector(-132, -100), rot: Vector(-1, 0) },
        { root: Vector(-132, -30), pos: Vector(-132, -30), rot: Vector(-1, 0) },
        { root: Vector(-132, 40), pos: Vector(-132, 40), rot: Vector(-1, 0) },
        { root: Vector(132, -100), pos: Vector(132, -100), rot: Vector(1, 0) },
        { root: Vector(132, -30), pos: Vector(132, -30), rot: Vector(1, 0) },
        { root: Vector(132, 40), pos: Vector(132, 40), rot: Vector(1, 0) }
    ];
    enemy.nextHook = Rand(6);
    enemy.hookCd = 300;
    enemy.hookDur = 480;
    
    
	var damageScale = ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
	
	// Attack Pattern 0 - Rocket barrage
	enemy.AddWeapon(EnemyWeaponRail, {
    
        sprite: GetImage('rocket'),
        lists: [playerManager.getRobots()],
        damage: 4 * damageScale,
        radius: 150,
        knockback: 200,
        dx: 0,
        dy: 0,
        speed: 10,
        angle: 180,
    
        subWeapon: EnemyWeaponRocket,
        rate: 120,
        range: 500,
        discharge: 0.1,
        duration: 120,
        interval: 6
    }, 0);
    
    // Attack pattern 1 - Shield/Cannon
    // Attack Pattern 0 - Rocket barrage
	enemy.AddWeapon(EnemyWeaponRail, {
        sprite: GetImage('bossCannon'),
        damage: 0.5 * damageScale,
        rate: 150,
        range: 500,
        discharge: 0.1,
        duration: 120,
        dy: 180
    }, 1);
    
    // Draw spite stuff (cannon and whatnot)
    enemy.ApplySprite = function() {
    
        this.turnDivider = this.pattern == 1 ? 250 : 100;
        
        canvas.translate(this.sprite.width / 2, this.sprite.height / 2);
        
        var armOX = this.sprite.width / 2 + 175;
        canvas.drawImage(this.armLeft, -armOX, 30);
        canvas.drawImage(this.armRight, armOX - this.armLeft.width, 30);
        
        for (var i = 0; i < this.hooks.length; i++) {
            var hook = this.hooks[i];
            var root = Vector(hook.root.x, hook.root.y);
            root.Rotate(this.sin, -this.cos);
            root.Add(this.x, this.y);
            
            canvas.save();
            
            // Active hooks are absolute coordinates
            if (hook.active) {
                ResetTransform(canvas);
                canvas.translate(hook.pos.x, hook.pos.y);
                canvas.transform(hook.arot.x, hook.arot.y, -hook.arot.y, hook.arot.x, 0, 0);
            }
            
            // Inactive hooks are relative coordinates
            else {
                canvas.translate(hook.root.x, hook.root.y);
                canvas.transform(hook.rot.x, hook.rot.y, -hook.rot.y, hook.rot.x, 0, 0);
            }
            
            canvas.drawImage(this.hook, -this.hook.width / 2, -this.hook.height / 2);
            canvas.restore();
            
            // Chain drawing
            var dir;
            if (hook.active) {
                var rotPos = Vector(-45, 0);
                rotPos.Rotate(hook.arot.x, hook.arot.y);
                var x = this.x - hook.pos.x - rotPos.x;
                var y = this.y - hook.pos.y - rotPos.y;
                dir = Vector(x, y);
                dir.SetLength(30);
                
                canvas.save();
                ResetTransform(canvas);
                canvas.translate(hook.pos.x + rotPos.x, hook.pos.y + rotPos.y);
                var angle = AngleTo(dir, { x: 0, y: 0 });
                var cos = Math.cos(angle + Math.PI / 2);
                var sin = Math.sin(angle + Math.PI / 2);
                canvas.transform(cos, sin, -sin, cos, 0, 0);
                
                var xo = 0;
                var xt = 0;
                while ((x - xt) * dir.x > 0) {
                    canvas.drawImage(this.chainFlat, xo + 30 - this.chainFlat.width / 2, -this.chainFlat.height / 2);
                    canvas.drawImage(this.chainUp, xo - this.chainUp.width / 2, -this.chainUp.height / 2);
                    xo += 60;
                    xt += 2 * dir.x;
                }
                canvas.restore();
            }
            
            if (!gameScreen.paused) {
                if (hook.active) {    
                    if (hook.vel.x || hook.vel.y) {
                        hook.pos.x += hook.vel.x;
                        hook.pos.y += hook.vel.y;
                        if (hook.pos.DistanceSq(root) > 250000) {
                            hook.vel.x = 0;
                            hook.vel.y = 0;
                        }
                    }
                    else if (hook.dur > 0) {
                        hook.dur--;
                    }
                    else {
                        hook.pos.x += 3 * dir.x / 5;
                        hook.pos.y += 3 * dir.y / 5;
                        
                        if (hook.pos.DistanceSq({ x: this.x, y: this.y }) < 2500) {
                            hook.active = false;
                        }
                    }
                    
                    // Collision
                    for (var i = 0; i < playerManager.players.length; i++) {
                        var player = playerManager.players[i].robot;
                        var p1 = Vector(this.x, this.y);
                        var p2 = Vector(player.x, player.y);
                        var r = player.sprite.width / 2 + this.chainFlat.height / 2;
                        if (p2.SegmentDistanceSq(p1, hook.pos) < r * r) {
                            player.Slow(0.2, 60);
                        }
                    }
                }
                
                // Launching hooks
                if (this.nextHook == i && --this.hookCd == 0) {
                    this.hookCd = 300;
                    var num;
                    do {
                        num = Rand(this.hooks.length);
                    }
                    while (num == i);
                    this.nextHook = num;
                    
                    hook.active = true;
                    hook.dur = this.hookDur;
                    hook.arot = Vector(hook.rot.x, hook.rot.y);
                    hook.arot.Rotate(this.sin, -this.cos);
                    hook.vel = Vector(hook.arot.x * 15, hook.arot.y * 15);
                    hook.pos = root;
                }
            }
        }
    
        canvas.drawImage(this.cover, -this.cover.width / 2, -this.cover.height / 2 - 30);
        canvas.drawImage(this.cannon, -this.cannon.width / 2, -this.cannon.height / 2 + 50);
    }
	
	return enemy;
}