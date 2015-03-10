/**
 * Represents a particle that is a reticle used to show 
 * where an explosion is about to land
 *
 * @param {String} sprite   - the name of the sprite image to use
 * @param {Vector} pos      - the position of the particle
 * @param {number} lifespan - how long until the explosion
 * @param {Object} data     - the data for the explosion (see "artillery" weapon for example)
 *
 * @constructor
 */
extend('ReticleParticle', 'Sprite');
function ReticleParticle(sprite, pos, lifespan, data) {
	this.super(sprite, pos.x, pos.y);
	
	this.data = data;
	this.lifespan = data;
}

/**
 * Updates the particle, creating the explosion upon expiring
 */
ReticleParticle.prototype.update = function() {
	this.lifespan--;
	this.expired = this.lifespan <= 0;
	if (this.expired) {
		this.data.explode();
	}
};