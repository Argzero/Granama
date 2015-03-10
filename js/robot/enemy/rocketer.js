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
        damage: Enemy.sum() * 4,
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
        damage: Enemy.sum() * 7,
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
 *<li>{number}   target           - the ID of the target group the bullet hits</li>
     *     <li>{number}   rate             - the number of frames between shots</li>
     *     <li>{number}   damage           - the damage dealt by the bullet</li>
     *     <li>{number}   range            - the minimum range to start firing from</li>
     *     <li>{string}   [sprite]         - the name of the explosion type</li>
	 *     <li>{string}   [fromSelf]       - whether or not to originate from yourself instead of the target</li>
	 *     <li>{number}   [chargeTime]     - time in frames before the explosion happens</li>
     *     <li>{number}   [dx]             - horizontal position offset assuming no rotation</li>
     *     <li>{number}   [dy]             - vertical position offset assuming no rotation</li>
     *     <li>{Robot}    [shooter]        - the actual shooter of the bullet</li>
     *     <li>{Array}    [buffs]          - buffs to apply on hit { stat, multiplier, duration }</li>
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
        /* range       */ 500,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY
    );

    // Weapon data
	for (var i = 0; i < 4; i++) {
		this.addWeapon(weapon.artillery, {
			damage    : 10 * Enemy.sum(),
			rate      : 240,
			range     : 525,
			radius    : 200,
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
