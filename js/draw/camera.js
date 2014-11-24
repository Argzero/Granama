depend('lib/2d/transform');
depend('lib/2d/vector');

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
    this.fullScreen = true;
    this.bounds = new Rect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    // Update the canvas dimensions
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    // Initialize the clipping region
    this.ctx.restore();
    this.applyBounds();
}

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
 * Sets the bounds of the camera view.
 *
 * @param rect bounding rectangle
 */
Camera.prototype.setBounds = function(rect) {
    this.bounds = rect;
    this.applyBounds();
};

/**
 * Removes the bounds of the camera, making it draw to the full canvas
 */
Camera.prototype.removeBounds = function() {
    this.ctx.restore();
};

/**
 * Checks whether or not a sprite is visible
 *
 * @param {Sprite} sprite - the sprite to checked
 *
 * @returns {boolean} true if visible, false otherwise
 */
Camera.prototype.isVisible = function(sprite) {
	return sprite.xMax() >= this.bounds.topLeft.x + this.pos.x && sprite.xMin() <= this.bounds.bottomRight.y + this.pos.x
		&& sprite.yMax() >= this.bounds.topLeft.y + this.pos.y && sprite.yMin() <= this.bounds.bottomRight.y + this.pos.y;
};

/**
 * Applies bound changes for the camera
 */
Camera.prototype.applyBounds = function() {
    this.ctx.restore();
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(this.bounds.topLeft.x, this.topLeft.y);
    this.ctx.lineTo(this.bounds.topRight.x, this.topRight.y);
    this.ctx.lineTo(this.bounds.bottomRight.x, this.bottomRight.y);
    this.ctx.lineTo(this.bounds.bottomLeft.x, this.bottomLeft.y);
    this.ctx.closePath();
    this.ctx.clip();
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
