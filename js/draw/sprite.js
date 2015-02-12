depend('draw/camera');
depend('lib/image');
depend('lib/2d/transform');
depend('lib/2d/vector');

/**
 * Available events for sprite objects:
 *
 * onPreDraw - before the sprite and its children are drawn
 * onDraw    - after the sprite and its children is drawn
 */

/**
 * A drawable in the game
 *
 * @param {Image}  sprite    - the main sprite of the entity
 * @param {number}  x        - the horizontal starting position
 * @param {number}  y        - the vertical starting position
 *
 * @constructor
 */
extend('Sprite', 'Transform');
function Sprite(name, x, y, parent, rotate) {
    this.super();
	this.src = name;
    this.sprite = images.get(name);
    this.parent = undefined;
    this.rotate = false;
    this.hidden = false;
    this.preChildren = [];
    this.postChildren = [];
    this.pivot = new Vector(0, 0);
    this.alpha = 1;
    this.moveTo(x, y);
	this.width = this.sprite.width;
	this.height = this.sprite.height;
	
	if (!this.width) {
		this.sprite.sprite = this;
		this.sprite.onload = function() {
			this.sprite.width = this.width;
			this.sprite.height = this.height;
		}
	}
}

/**
 * Sets the parent of the sprite, optionally inheriting rotation
 *
 * @param {Sprite}  [parent] - the parent to inherit transforms from
 * @param {boolean} [rotate] - whether or not to inherit rotations as well
 *
 * @returns {Sprite} this
 */
Sprite.prototype.child = function(parent, rotate) {
	this.parent = parent;
	this.rotate = rotate;
	return this;
}

/**
 * Draws the sprite using it's given transformation
 *
 * @param {Camera} camera - the camera to draw to
 */
Sprite.prototype.draw = function(camera) {
    if (this.hidden) return;
	
    camera.ctx.globalAlpha *= this.alpha;
    camera.ctx.translate(this.pos.x, this.pos.y);
	if (this.onPreDraw) this.onPreDraw(camera);
    this.drawList(camera, this.preChildren, false);
    this.applyRotation(camera, false);
	this.drawList(camera, this.preChildren, true);
    camera.ctx.drawImage(this.sprite, (-this.sprite.width / 2 - this.pivot.x) * this.size.x, (-this.sprite.height / 2 - this.pivot.y) * this.size.y, this.sprite.width * this.size.x, this.sprite.height * this.size.y);
	this.drawList(camera, this.postChildren, true);
    this.applyRotation(camera, true);
    this.drawList(camera, this.postChildren, false);
    if (this.onDraw) this.onDraw(camera);
    camera.ctx.translate(-this.pos.x, -this.pos.y);
    camera.ctx.globalAlpha /= this.alpha;
};

/**
 * Applies the sprite's rotation to the camera
 *
 * @param {Camera}  camera   - the camera to apply to
 * @param {boolean} [invert] - whether or not to invert the rotation
 */
Sprite.prototype.applyRotation = function(camera, invert) {
    var m = invert ? -1 : 1;
    camera.ctx.transform(this.rotation.x, m * this.rotation.y, -m * this.rotation.y, this.rotation.x, 0, 0);
};

/**
 * Sets the pivot of the sprite relative to it's center
 *
 * @param {number} x - horizontal pivot
 * @param {number} y - vertical pivot
 */
Sprite.prototype.setPivot = function(x, y) {
    this.pivot.x = x;
    this.pivot.y = y;
};

/**
 * Draws a list of children based on the current state
 *
 * @param {Camera}   camera - camera to draw to
 * @param {Sprite[]} list   - list of children
 * @param {boolean}  rotate - whether or not rotation is applied 
 */
Sprite.prototype.drawList = function(camera, list, rotate) {
    for (var i = 0; i < list.length; i++) {
		if (list[i].rotate == rotate)
		{
			list[i].draw(camera);
		}
    }
};

/**
 * Hides the sprite, making it no longer visible. All children will
 * also be hidden.
 */
Sprite.prototype.hide = function() {
    this.hidden = true;
};

/**
 * Shows the sprite, making it visible again. All children will be
 * visible again unless they are individually hidden as well.
 */
Sprite.prototype.show = function() {
    this.hidden = false;
};

/**
 * Sets the visibility of the sprite. This is basically show/hide but lets you
 * toggle using booleans.
 *
 * @param {boolean} visible - whether or not to make the sprite visible
 */
Sprite.prototype.setVisible = function(visible) {
    this.hidden = !visible;
};

/**
 * Calculates the x coordinate of the min of the sprite bounds
 *
 * @returns {number} the x coordinate of the min of the sprite bounds
 */
Sprite.prototype.xMin = function() {
    return this.pos.x - this.sprite.width / 2;
};

/**
 * Calculates the x coordinate of the max of the sprite bounds
 *
 * @returns {number} the x coordinate of the max of the sprite bounds
 */
Sprite.prototype.xMax = function() {
    return this.pos.x + this.sprite.width / 2;
};

/**
 * Calculates the y coordinate of the min of the sprite bounds
 *
 * @returns {number} the y coordinate of the min of the sprite bounds
 */
Sprite.prototype.yMin = function() {
    return this.pos.y - this.sprite.height / 2;
};

/**
 * Calculates the y coordinate of the max of the sprite bounds
 *
 * @returns {number} the y coordinate of the max of the sprite bounds
 */
Sprite.prototype.yMax = function() {
    return this.pos.y + this.sprite.height / 2;
};

/**
 * Checks whether or not this collides with the other sprite using circular collision
 *
 * @param {Sprite} sprite - sprite to compare against
 */
Sprite.prototype.collides = function(sprite) {
    return sprite.pos.distanceSq(this.pos) < sq((sprite.sprite.width * sprite.size.x + this.sprite.width * this.size.x) / 2);
};