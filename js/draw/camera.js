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
