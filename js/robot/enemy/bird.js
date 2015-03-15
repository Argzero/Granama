/**
 * A light bird enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightBird', 'Enemy');
function LightBird(x, y) {
    this.super(
        /* sprite name */ 'enemyLightBirdBody',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 60 * Enemy.pow(0.9),
        /* speed       */ 3 + 0.3 * gameScreen.bossCount,
        /* range       */ 0,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY
    );

    // Movement
    this.movement = movement.bird;
    this.birdSize = 1;
}
