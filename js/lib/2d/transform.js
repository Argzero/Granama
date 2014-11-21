depend('lib/2d/vector');

/**
 * A transform for applying rotations, scales, and translations
 * 
 * @constructor
 */
function Transform() {
    this.pos = new Vector(0, 0);
    this.rotation = new Vector(1, 0);
    this.size = new Vector(1, 1);
}
        
/**
 * Translates to the given point
 * 
 * @param {Number} x - the new horizontal pos
 * @param {Number} y - the new vertical pos
 * 
 * @returns {Transform} the Transform object
 */
Transform.prototype.moveTo = function(x, y) {
    this.pos.x = x;
    this.pos.y = y;
    return this;
},

/**
 * Translates relatively
 * 
 * @param {Number} x - the amount to add to the horizontal pos
 * @param {Number} y - the amount to add to the vertical pos
 * 
 * @returns {Transform} the Transform object
 */
Transform.prototype.move = function(x, y) {
    this.pos.x += x;
    this.pos.y += y;
    return this;
},

/**
 * Sets the angle using precalculated sin/cos values
 *
 * @param {Number} angle - the new angle of rotation
 * 
 * @returns {Transform} the Transform object
 */
Transform.prototype.setAngle = function(angle) {
    this.rotation.x = Math.cos(angle);
    this.rotation.y = Math.sin(angle);
    return this;
},

/**
 * Sets the rotation using precalculated sin/cos values
 * 
 * @param {Number} cos - the cosine of the new angle of rotation
 * @param {Number} sin - the sine of the new angle of rotation
 * 
 * @returns {Transform} the Transform object
 */
Transform.prototype.setRotation = function(cos, sin) {
    this.rotation.x = cos;
    this.rotation.y = sin;
    return this;
},

/**
 * Rotates relatively by an angle
 * 
 * @param {Number} angle - the angle to rotate the transform by
 * 
 * @returns {Transform} the Transform object
 */
Transform.prototype.rotateAngle = function(angle) {
    this.rotate(Math.cos(angle), Math.sin(angle));
    return this;
},

/**
 * Rotates relatively using precalculated sin/cos values
 * 
 * @param {Number} cos - the cosine of the angle to rotate the transform by
 * @param {Number} sin - the sine of the angle to rotate the transform by
 * 
 * @returns {Transform} the Transform object
 */
Transform.prototype.rotate = function(cos, sin) {
    this.rotation.rotate(cos, sin);
    return this;
},

/**
 * Rotates about an origin by the given angle
 * 
 * @param {Number} angle  - the angle to rotate the transform by
 * @param {Vector} origin - the point to rotate about
 * 
 * @returns {Transform} the Transform object
 */
Transform.prototype.rotateAngleAbout = function(angle, origin) {
    this.rotateAbout(Math.cos(angle), Math.sin(angle), origin);
    return this;
},

/**
 * Rotates about an origin using precalculated cos/sin values
 * 
 * @param {Number} cos    - the cosine of the angle to rotate the transform by
 * @param {Number} sin    - the sine of the angle to rotate the transform by
 * @param {Vector} origin - the point to rotate about
 * 
 * @returns {Transform} the Transform object
 */
Transform.prototype.rotateAbout = function(cos, sin, origin) {
    this.pos.add(-origin.x, -origin.y);
    this.pos.rotate(cos, sin);
    this.pos.add(origin.x, origin.y);
    this.rotation.rotate(cos, sin);
    return this;
},

/**
 * Scales the transform
 * 
 * @param {Number} x - the horizontal scale multiplier
 * @param {Number} y - the vertical scale multiplier
 * 
 * @returns {Transform} the Transform object
 */
Transform.prototype.scale = function(x, y) {
    this.size.x *= x;
    this.size.y *= y;
    return this;
},

/**
 * Sets the scale of the transform
 * 
 * @param {Number} x - the new horizontal scale
 * @param {Number} y - the new vertical scale
 */
Transform.prototype.setScale = function(x, y) {
    this.size.x = x;
    this.size.y = y;
    return this;
},

/**
 * Applies the transformation to the vector coordinates
 * 
 * @param {Vector} vector - the vector to apply the transformation to
 * 
 * @returns {Vector} the transformed vector
 */
Transform.prototype.apply = function(vector) {
    return vector.rotate(this.rotation.x, this.rotation.y)
        .multiply(this.size.x, this.size.y)
        .add(this.pos.x, this.pos.y);
},

/**
 * Applies the transform to a rectangle
 * 
 * @param {Rect} rect - the rectangle to apply the transformation to
 * 
 * @returns {Rect} the transformed rectangle
 */
Transform.prototype.applyRect = function(rect) {
    return rect.rotate(this.rotation.x, this.rotation.y)
        .scale(this.size.x, this.size.y)
        .move(this.pos.x, this.pos.y);
}