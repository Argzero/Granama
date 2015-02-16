/**
 * A turret that is placed and fires bullets at the player
 * 
 * @param {Number} x      - initial horizontal coordinate
 * @param {Number} y      - initial vertical coordinate
 * @param {Number} damage - damage the turret deals
 *
 * @constructor
 */
extend('Turret', 'Robot');
function Turret(x, y, damage, health) {
    this.super('turretGun', x, y, Robot.TURRET, health, 0);
    
    this.preChildren.push(new Sprite('turretBase', 0, 0).child(this, false));
    this.gunData = {
        cd    : 0,
        damage: damage,
        range : TURRET_RANGE * 1.5,
        rate  : TURRET_RATE,
        dx    : 0,
        dy    : 22,
        target: Robot.PLAYER
    };
    this.fire = weapon.gun;
}

/**
 * Updates the turret
 */
this.Update = function() {

    // Update the turret's angle
    var player = getClosestPlayer(this.pos);
    this.lookAt(player.pos);

    // Fire if in range
    this.fire(this.gunData);
    
    // Turret blew up
    this.expired = this.dead;
    if (this.expired) {
        gameScreen.particles.push(new Explosion(this.pos.x, this.pos.y, this.width / 150));
    }
};

/**
 * Checks whether or not the enemy is in range of a player using the specified range
 * 
 * @param {Number} range - the range of the weapon
 *
 * @returns {boolean} true if in range, false otherwise
 */
Turret.prototype.isInRange = function(range) {
    var player = getClosestPlayer(this.pos);
    return player.health > 0 && this.pos.distanceSq(player.pos) < sq(range);
};