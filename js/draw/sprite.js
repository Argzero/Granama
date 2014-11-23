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
 * @param {Sprite}  [parent] - the parent to inherit transforms from
 * @param {boolean} [before] - whether or not to draw before the parent
 * @param {boolean} [rotate] - whether or not to inherit rotations as well
 *
 * @constructor
 */
extend('Sprite', 'Transform');
function Sprite(name, x, y, parent, before, rotate) {
    this.super();
    this.sprite = images.get(name);
    this.parent = parent;
    this.rotate = rotate;
    this.hidden = false;
    this.preChildren = [];
    this.postChildren = [];
    this.pivot = new Vector(0, 0);
    this.alpha = 1;
    this.moveTo(x, y);

    // Add itself to the parent
    if (parent) {
        if (before) this.parent.preChildren.push(this);
        else this.parent.postChildren.push(this);
    }
}

/**
 * Draws the sprite using it's given transformation
 *
 * @param {Camera} camera - the camera to draw to
 */
Sprite.prototype.drawSprite = function(camera) {
    if (this.hidden) return;
    if (this.rotate && this.parent) this.parent.applyRotation(camera);

    camera.ctx.globalAlpha = this.alpha;
    camera.ctx.translate(this.x, this.y);
    if (this.onPreDraw) this.onPreDraw(camera);
    this.drawList(camera, this.preChildren);
    this.applyRotation(camera, false);
    camera.ctx.drawImage(this.sprite, -this.sprite.width / 2 - this.pivot.x, -this.sprite.height / 2 - this.pivot.y);
    this.applyRotation(camera, true);
    this.drawList(camera, this.postChildren);
    if (this.onDraw) this.onDraw(camera);
    camera.ctx.translate(-this.x, -this.y);
    camera.ctx.globalAlpha = 1;

    if (this.rotate && this.parent) this.parent.applyRotation(camera, true);
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
 * @param {Camera}   camera  - camera to draw to
 * @param {Sprite[]} list    - list of children
 */
Sprite.prototype.drawList = function(camera, list) {
    for (var i = 0; i < list.length; i++) {
        list[i].drawSprite(camera);
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