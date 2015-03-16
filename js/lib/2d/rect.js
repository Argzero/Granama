depend('lib/2d/vector');

/**
 * A rectangle made of 4 vertices
 *
 * @constructor
 *
 * @param {number} x - the top left horizontal coordinate of the rectangle
 * @param {number} y - the top left vertical coordinate of the rectangle
 * @param {number} w - the width of the rectangle
 * @param {number} h - the height of the rectangle
 */
function Rect(x, y, w, h) {
    this.width = w;
    this.height = h;
    this.topLeft = new Vector(x, y);
    this.topRight = new Vector(x + w, y);
    this.bottomLeft = new Vector(x, y + h);
    this.bottomRight = new Vector(x + w, y + h);
}

/**
 * Constructs a rectangle from four points
 *
 * @param {Vector} p1 - top left corner
 * @param {Vector} p2 - top right corner
 * @param {Vector} p3 - bottom left corner
 * @param {Vector} p4 - bottom right corner
 *
 * @returns {Rect} rectangle object
 */
Rect.fromPoints = function(p1, p2, p3, p4) {
    var rect = new Rect(0, 0, 0, 0);
    rect.topLeft = p1;
    rect.topRight = p2;
    rect.bottomLeft = p3;
    rect.bottomRight = p4;
    return rect;
};

/**
 * Constructs an axis-aligned rectangle from two points
 *
 * @param {Vector} p1 - top left corner
 * @param {Vector} p2 - bottom right corner
 *
 * @returns {Rect} rectangle object
 */
Rect.fromCorners = function(p1, p2) {
    var rect = new Rect(0, 0, 0, 0);
    rect.topLeft = p1;
    rect.topRight = new Vector(p2.x, p1.y);
    rect.bottomLeft = new Vector(p1.y, p2.x);
    rect.bottomRight = p2;
    return rect;
};

/**
 * Moves the rectangle relatively
 *
 * @param {number} x - amount to move horizontally
 * @param {number} y - amount to move vertically
 *
 * @returns {Rect} the Rect object
 */
Rect.prototype.move = function(x, y) {
    this.topLeft.add(x, y);
    this.topRight.add(x, y);
    this.bottomLeft.add(x, y);
    this.bottomRight.add(x, y);
    return this;
};

/**
 * Scales the rectangle
 *
 * @param {number} x - the horizontal multiplier
 * @param {number} y - the vertical multiplier
 *
 * @returns {Rect} the Rect object
 */
Rect.prototype.scale = function(x, y) {
    this.topLeft.multiply(x, y);
    this.topRight.multiply(x, y);
    this.bottomLeft.multiply(x, y);
    this.bottomRight.multiply(x, y);
    this.width *= x;
    this.height *= y;
    return this;
};

/**
 * Rotates the rectangle by an angle
 *
 * @param {number} angle - the angle of rotation
 *
 * @returns {Rect} the Rect object
 */
Rect.prototype.rotateAngle = function(angle) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    this.rotate(cos, sin);
    return this;
};

/**
 * Rotates the rectangle using precalculated sin/cos values
 *
 * @param {number} cos - the cosine of the angle of rotation
 * @param {number} sin - the sine of the angle of rotation
 *
 * @returns {Rect} the Rect object
 */
Rect.prototype.rotate = function(cos, sin) {
    this.topLeft.rotate(cos, sin);
    this.topRight.rotate(cos, sin);
    this.bottomLeft.rotate(cos, sin);
    this.bottomRight.rotate(cos, sin);
    return this;
};

/**
 * Retrieves the minimum X coordinate of the rectangle
 *
 * @returns {number} the minimum X coordinate of the rectangle
 */
Rect.prototype.minX = function() {
    return Math.min(this.topLeft.x, Math.min(this.topRight.x, Math.min(this.bottomLeft.x, this.bottomRight.x)));
};

/**
 * Retrieves the minimum Y coordinate of the rectangle
 *
 * @returns {number} the minimum Y coordinate of the rectangle
 */
Rect.prototype.minY = function() {
    return Math.min(this.topLeft.y, Math.min(this.topRight.y, Math.min(this.bottomLeft.y, this.bottomRight.y)));
};

/**
 * Retrieves the maximum X coordinate of the rectangle
 *
 * @returns {number} the maximum X coordinate of the rectangle
 */
Rect.prototype.maxX = function() {
    return Math.max(this.topLeft.x, Math.max(this.topRight.x, Math.max(this.bottomLeft.x, this.bottomRight.x)));
};

/**
 * Retrieves the maximum Y coordinate of the rectangle
 *
 * @returns {number} the maxiamum Y coordinate of the rectangle
 */
Rect.prototype.maxY = function() {
    return Math.max(this.topLeft.y, Math.max(this.topRight.y, Math.max(this.bottomLeft.y, this.bottomRight.y)));
};