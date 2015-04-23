depend('lib/2d/transform');
depend('lib/2d/vector');
depend('lib/2d/rect');

/**
 * Represents a camera on a 2D canvas
 *
 * @param {string} id - ID of the HTML canvas element
 *
 * @constructor
 */
extend('Camera', 'Transform');
function Camera(id) {
    this.super();
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');

    // Update the canvas dimensions
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
}

/**
 * Translates to the given point
 *
 * @param {number} x - the new horizontal pos
 * @param {number} y - the new vertical pos
 *
 * @returns {Camera} the Camera object
 */
Camera.prototype.moveTo = function(x, y) {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(x, y);
    this.pos.x = x;
    this.pos.y = y;
    return this;
};

/**
 * Translates relatively
 *
 * @param {number} x - the amount to add to the horizontal pos
 * @param {number} y - the amount to add to the vertical pos
 *
 * @returns {Camera} the Camera object
 */
Camera.prototype.move = function(x, y) {
    this.ctx.translate(x, y);
    this.pos.x += x;
    this.pos.y += y;
    return this;
};

/**
 * Draws a list of sprites to the camera
 *
 * @param {Sprite[]} sprites - the list of sprites to draw
 */
Camera.prototype.drawList = function(sprites) {
    for (var i = 0; i < sprites.length; i++) {
        sprites[i].draw(this);
    }
};

/**
 * Checks whether or not a sprite is visible
 *
 * @param {Sprite} sprite - the sprite to checked
 *
 * @returns {boolean} true if visible, false otherwise
 */
Camera.prototype.isVisible = function(sprite) {
    return sprite.xMax() >= this.pos.x && sprite.xMin() <= this.pos.x + this.canvas.width && sprite.yMax() >= this.pos.y && sprite.yMin() <= this.pos.y + this.canvas.height;
};

/**
 * Checks whether or not a sprite is visible
 *
 * @param {Vector} point     - the point to check for visibility
 * @param {number} [padding] - the amount of padding to use
 *
 * @returns {boolean} true if visible, false otherwise
 */
Camera.prototype.isVisible = function(point, padding) {
    padding = padding ? padding : 0;
    return point.x + padding >= this.pos.x && point.x - padding <= this.pos.x + this.canvas.width && point.y + padding >= this.pos.y && point.y - padding <= this.pos.y + this.canvas.height;
};

/**
 * Resets the viewport to the camera
 */
Camera.prototype.reset = function() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.transform(this.size.x, 0, 0, this.size.y, 0, 0);
    this.ctx.transform(this.rotation.x, this.rotation.y, -this.rotation.y, this.rotation.x, 0, 0);
    this.ctx.translate(-this.pos.x, -this.pos.y);
};
