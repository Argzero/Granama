/**
 * A turret that is placed and fires bullets at the player
 * 
 * @param {string} sprite - name of the turret sprite
 * @param {string} base   - name of the turret's base sprite
 * @param {number} x      - initial horizontal coordinate
 * @param {number} y      - initial vertical coordinate
 * @param {number} damage - damage the turret deals
 * @param {number} health - the amount of health the turret has
 *
 * @constructor
 */
extend('Turret', 'Robot');
function Turret(sprite, base, x, y, damage, health) {
    this.super(sprite, x, y, Robot.TURRET, health, 0);
    
    this.preChildren.push(new Sprite(base, 0, 0).child(this, false));
    this.gunData = {
        cd    : 0,
        damage: damage,
        range : 750,
        rate  : 15,
        dx    : 0,
        dy    : 22,
        target: Robot.PLAYER
    };
    this.fire = weapon.gun;
}

/**
 * Updates the turret
 */
Turret.prototype.update = function() {

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