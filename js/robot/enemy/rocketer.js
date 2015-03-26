/**
 * A light rocket enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightRocketer', 'Enemy');
function LightRocketer(x, y) {
    this.super(
        /* sprite name */ 'enemyLightRocket',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 30 * Enemy.pow(0.9),
        /* speed       */ 2 + 0.2 * gameScreen.bossCount,
        /* range       */ 300,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY
    );

    // Weapon data
    this.addWeapon(weapon.gun, {
        sprite: 'rocket',
        damage: Enemy.sum() * 3,
        rate  : 60,
        range : 325,
        dx    : 0,
        dy    : 30,
        target: Robot.PLAYER,
        //                                 args: [type,    radius, knockback
        templates: [{ name: 'setupRocket', args: ['Enemy', 100,    150] }]
    });

    // Movement
    this.movement = movement.basic;
}

/**
 * A heavy rocket enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyRocketer', 'Enemy');
function HeavyRocketer(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavyRocket',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 45 * Enemy.pow(0.9),
        /* speed       */ 2 + 0.2 * gameScreen.bossCount,
        /* range       */ 400,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY
    );

    // Weapon data
    this.addWeapon(weapon.gun, {
        sprite: 'rocket',
        damage: Enemy.sum() * 5,
        rate  : 70,
        range : 425,
        dx    : 0,
        dy    : 30,
        target: Robot.PLAYER,
        //                                 args: [type,    radius, knockback
        templates: [{ name: 'setupRocket', args: ['Enemy', 150,    150] }]
    });

    // Movement
    this.movement = movement.basic;
}

/**
 * A rocket miniboss that drops artillery down on players
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('Harrier', 'Enemy');
function Harrier(x, y) {
    this.super(
        /* sprite name */ 'enemyHarrier',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 100 * Enemy.pow(1.1),
        /* speed       */ 3 + 0.25 * gameScreen.bossCount,
        /* range       */ 625,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY
    );

    // Weapon data
	for (var i = 0; i < 4; i++) {
		this.addWeapon(weapon.artillery, {
			damage    : 10 * Enemy.sum(),
			rate      : 240,
			range     : 650,
			radius    : 200,
            knockback : 200,
			chargeTime: 120,
			randX     : 150,
			randY     : 150,
			delay     : 15 * i,
			target    : Robot.PLAYER
		});
	}

    // Movement
    this.movement = movement.basic;

    // Knockback reduction
    this.knockbackFactor = 0.4;
}
