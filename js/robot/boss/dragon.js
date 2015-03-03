/**
 * Boss that uses a minigun, mines, and rockets to fight
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 */
extend('DragonBoss', 'Boss');
function FortressBoss(x, y) {
    this.super(
        /* Sprite      */ 'bossDragonHead', 
        /* Position    */ x, y, 
        /* Type        */ Robot.BOSS, 
        /* Health      */ 750 * Enemy.pow(1.4) * players.length,
        /* Speed       */ 4 + 0.3 * gameScreen.bossCount,
        /* Move Range  */ 300,
        /* Experience  */ Enemy.DRAGON_EXP,
        /* Stat Rank   */ Enemy.DRAGON_ENEMY,
        /* Pattern Min */ 600,
        /* Pattern Max */ 750
    );
    
    this.pierceDamage = 0.4;
	
    // Wing sprites
    this.postChildren.push(
		new Sprite('bossDragonLeftWing', 113, -166),
		new Sprite('bossDragonRightWing' -113, -166)
	);

    // Movement pattern
    this.movement = movement.flying;

    var damageScale = Boss.sum();

    // Attack pattern 0 - Lasers and fire
    this.setMovement(0, movement.flying);
    for (var i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite: 'bossLaser',
            damage: 0.1 * damageScale,
            range : 1000,
            rate  : 30,
            dx    : -185 + 370 * i,
            dy    : 17,
            speed : 15,
            pierce: true
        });
    }
    this.addWeapon(weapon.fire, {
        damage: 0.1 * damageScale,
        range : 300,
        rate  : 3,
        dx    : 0,
        dy    : 100
    });

    // Attack pattern 1 - Spawning minibosses
    this.setMovement(1, movement.flyCenter);
    this.addWeapon(weapon.spawn, {
        enemies: DRAGON_SPAWNS,
        max    : 8,
        rate   : 120,
        delay  : 300,
        dx     : 0,
        dy     : -100
    }, 1);

    // Attack pattern 2 - Homing missiles
    this.setMovement(2, movement.dragon);
    this.addWeapon(weapon.gun, {
		sprite: 'bossFire',
        damage: 0.05 * damageScale,
        range : 300,
        rate  : 3,
        dx    : 0,
        dy    : 42,
		onUpdate: projEvents.fireUpdate
    }, 2);
    for (var i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite   : 'rocket',
            damage   : 5 * damageScale,
            range    : 600,
            radius   : 100,
            knockback: 150,
            rate     : 90,
            dx       : -238 + 476 * i,
            dy       : -10,
            speed    : 8,
			templates: [
				//                     args: [type,    radius, knockback]
				{ name: 'setupRocket', args: ['Enemy', 100,    150] },
				//                     args: [target,       rotSpeed]
				{ name: 'setupHoming', args: [Robot.PLAYER, 0.02] }
			]
        }, 2);
    }

	// The enemy's tail
    this.tail = new RopeTail(
        /* Robot      */ this,
        /* Segment    */ 'enemyLightOrbiterTail',
        /* End        */ 'enemyLightOrbiterTail',
        /* Length     */ 3,
        /* Offset     */ 28,
        /* Base       */ 12,
        /* End Offset */ 0,
        /* Constraint */ 30
    );
	
    // Dragon's tail
    this.tail2 = EnemyTail(enemy, GetImage('bossDragonEnd'), GetImage('bossDragonEnd'), 0, 1, 0, 90);
    this.tail = EnemyTail(enemy, GetImage('bossDragonEnd'), GetImage('bossDragonEnd'), 150, 5, 240, 0);
    this.tail.SetTurrets(GetImage('bossDragonTurret'), GetImage('bullet'), damageScale, 60, false, 0, 48);

    // Drawing wings
    enemy.ApplySprite = function() {
        canvas.drawImage(this.leftWing, this.sprite.width - 10, -50);
        canvas.drawImage(this.rightWing, 10 - this.rightWing.width, -50);
    }