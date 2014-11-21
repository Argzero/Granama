depend('lib/2d/transform');

/**
 * A damageable entity in the game
 *
 * @param {Image} sprite - the main sprite of the entity
 * @param {Number} x     - the horizontal starting position
 * @param {Number} y     - the vertical starting position
 *
 * @constructor
 */
extend('Entity', 'Transform');
function Entity(sprite, x, y) {
    this.super();
    this.move(x, y);
    this.sprite = sprite;
}

// Functions
/*
isBoss: enemyFunctions.isBoss,
stun: enemyFunctions.stun,
AddWeapon: enemyFunctions.AddWeapon,
SetRange: enemyFunctions.SetRange,
SetMovement: enemyFunctions.SetMovement,
Knockback: enemyFunctions.Knockback,
SwitchPattern: enemyFunctions.SwitchPattern,
Update: enemyFunctions.Update,
clamp: enemyFunctions.clamp,
Draw: enemyFunctions.Draw,
IsInRange: enemyFunctions.IsInRange,
Damage: enemyFunctions.Damage,
Slow: enemyFunctions.Slow
*/