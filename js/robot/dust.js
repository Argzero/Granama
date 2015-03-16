/**
 * A dust particle used for burrowing units
 *
 * @param {number} x        - initial horizontal coordinate
 * @param {number} y        - initial vertical coordinate
 * @param {number} velX     - horizontal velocity
 * @param {number} velY     - vertical velocity
 * @param {number} lifespan - how long the particle lasts
 */
extend('Dust', 'Sprite');
function Dust(pos, vel, lifespan, size) {
    this.super('dust', pos.x, pos.y);
    
    this.vel = vel;
    this.lifespan = lifespan;
    this.fullLife = lifespan;
    this.setScale(size, size);
}

/**
 * Moves the particle each frame and marks it as
 * expired after its lifespan is up
 */ 
Dust.prototype.update = function() {
    this.move(this.vel.x, this.vel.y);
    this.lifespan--;
    this.expired = this.lifespan <= 0;
    this.alpha = 0.5 + 0.5 * this.lifespan / this.fullLife;
};