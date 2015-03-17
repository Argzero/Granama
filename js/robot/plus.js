/**
 * A plus particle used for regenerative effects such as
 * Guardian's statis ability
 *
 * @param {number} x        - initial horizontal coordinate
 * @param {number} y        - initial vertical coordinate
 * @param {number} velX     - horizontal velocity
 * @param {number} velY     - vertical velocity
 * @param {number} lifespan - how long the particle lasts
 *
 * @constructor
 */
extend('Plus', 'Sprite');
function Plus(x, y, velX, velY, lifespan) {
    this.super('abilityPlus', x, y);
    
    this.velX = velX;
    this.velY = velY;
    this.lifespan = lifespan;
}

/**
 * Moves the particle each frame and marks it as
 * expired after its lifespan is up
 */ 
Plus.prototype.update = function() {
    this.move(this.velX, this.velY);
    this.lifespan--;
    this.expired = this.lifespan <= 0;
};