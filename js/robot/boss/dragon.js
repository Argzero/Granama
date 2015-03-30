/**
 * Boss that uses a minigun, mines, and rockets to fight
 *
 * @param {number} x - horizontal starting position
 * @param {number} y - vertical starting position
 *
 * @constructor
 */
extend('DragonBoss', 'Boss');
function DragonBoss(x, y) {
    this.super(
        /* Sprite      */ 'bossDragonHead', 
        /* Position    */ x * 4 - 1.5 * GAME_WIDTH, y * 4 -  1.5 * GAME_HEIGHT, 
        /* Type        */ Robot.BOSS, 
        /* Health      */ 750 * Enemy.pow(1.4) * players.length,
        /* Speed       */ 4 + 0.3 * gameScreen.bossCount,
        /* Move Range  */ 300,
        /* Experience  */ Enemy.DRAGON_EXP,
        /* Stat Rank   */ Enemy.DRAGON_ENEMY,
        /* Pattern Min */ 600,
        /* Pattern Max */ 750,
        /* Title       */ 'Dragon'
    );
    
    this.pierceDamage = 0.4;
    this.turnDivider = 300;
    this.ignoreClamp = true;
	
    // Wing sprites
    this.preChildren.push(
		new Sprite('bossDragonLeftWing', 278, -66).child(this, true),
		new Sprite('bossDragonRightWing', -278, -66).child(this, true)
	);

    // Movement pattern
    this.movement = movement.flying;

    var damageScale = Boss.sum();

    // Attack pattern 0 - Lasers and fire
    this.setMovement(0, movement.flying);
    var i;
    for (i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite: 'bossLaser',
            damage: 0.1 * damageScale,
            range : 1000,
            rate  : 30,
            dx    : -142 + 284 * i,
            dy    : 17,
            speed : 15,
            pierce: true
        });
    }
    this.addWeapon(weapon.gun, {
        sprite  : 'bossFlame',
        damage  : 0.1 * damageScale,
        range   : 300,
        rate    : 3,
        dx      : 0,
        dy      : 100,
        onUpdate: projEvents.fireUpdate
    });

    // Attack pattern 1 - Spawning minibosses
    this.setMovement(1, movement.flyCenter);
    this.addWeapon(weapon.spawn, {
        enemies: DRAGON_SPAWNS,
        max    : 8,
        rate   : 120,
        delay  : 300,
        dx     : 0,
        dy     : -100,
        range  : 9999
    }, 1);

    // Attack pattern 2 - Homing missiles
    this.setMovement(2, movement.dragon);
    this.addWeapon(weapon.gun, {
		sprite: 'bossFlame',
        damage: 0.05 * damageScale,
        range : 300,
        rate  : 3,
        dx    : 0,
        dy    : 100,
		onUpdate: projEvents.fireUpdate
    }, 2);
    for (i = 0; i < 2; i++) {
        this.addWeapon(weapon.gun, {
            sprite   : 'rocket',
            damage   : 5 * damageScale,
            range    : 600,
            radius   : 100,
            knockback: 150,
            rate     : 90,
            dx       : -215 + 430 * i,
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
        /* Segment    */ 'bossDragonEnd',
        /* End        */ 'bossDragonEnd',
        /* Length     */ 5,
        /* Offset     */ 150,
        /* Base       */ 0,
        /* End Offset */ 0,
        /* Constraint */ 45,
        /* Front      */ true
    );
    this.tail.setTurrets(
        /* Sprite */ 'bossDragonTurret',
        /* DX     */ 0,
        /* DY     */ 0,
        /* Weapon */ {
            shooter: this,
            damage : damageScale,
            range  : 1000,
            rate   : 60,
            dx     : 0,
            dy     : 48,
            target : Robot.PLAYER
        }
    );
}

/**
 * Updates and draws the tail before the dragon is drawn
 */
DragonBoss.prototype.onPreDraw = function() {
    this.tail.update();
};

// Dragons ignore knockback/stuns
DragonBoss.prototype.knockback = function() { };
DragonBoss.prototype.stun = function() { };