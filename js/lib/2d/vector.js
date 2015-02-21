/**
 * A 2D vector with helper methods
 *
 * @constructor
 *
 * @param {number} x - the horizontal component
 * @param {number} y - the vertical component
 */
function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

// Zero vector constant
Vector.ZERO = new Vector(0, 0);

/**
 * Computes the dot product between two vectors
 *
 * @param {Vector} vector - the second vector
 *
 * @returns {number} the dot product result
 */
Vector.prototype.dot = function(vector) {
    return vector.x * this.x + vector.y * this.y;
};

/**
 * Computes the cross product between two vectors, keeping only the Z scalar since it's 2D
 *
 * @param {Vector} vector - the second vector
 *
 * @returns {number} the z component of the cross product result
 */
Vector.prototype.cross = function(vector) {
    return this.x * vector.y - this.y * vector.x;
};

/**
 * Projects this vector onto the given vector
 *
 * @param vector - the vector to project onto
 *
 * @returns {Vector} the projected vector
 */
Vector.prototype.project = function(vector) {
    var scalar = this.dot(vector) / vector.dot(vector);
    return new Vector(vector.x * scalar, vector.y * scalar);
};

/**
 * Reflects the vector over a line with a direction of the given vector
 *
 * @param {Vector} vector - the vector direction of the line to reflect over
 *
 * @returns {Vector} the reflected vector
 */
Vector.prototype.reflect = function(vector) {
    var projected = this.project(vector);
    return projected.add(projected.x - this.x, projected.y - this.y);
};

/**
 * Turns the vector towards the target vector
 *
 * @param {Vector} target   - target direction to rotate towards
 * @param {Vector} rotation - rotation vector representing the max rotation
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.rotateTowards = function(target, rotation) {

    var n = target.clone().rotate(0, -1);
    var d = n.dot(this);

    if (d > 0) this.rotatev(rotation);
    else this.rotate(rotation.x, -rotation.y);

    if (n.dot(this) * d <= 0) {
        this.x = target.x;
        this.y = target.y;
    }

    return this;
};

/**
 * Adds to the components of the vector
 *
 * @param {number} x - the amount to add to the horizontal component
 * @param {number} y - the amount to add to the vertical component
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.add = function(x, y) {
    this.x += x;
    this.y += y;
    return this;
};

/**
 * Adds to the components of the vector
 *
 * @param {Vector} vector - the vector to add
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.addv = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
};

/**
 * Subtracts from the components of the vector
 *
 * @param {number} x - the amount to subtract from the horizontal component
 * @param {number} y - the amount to subtract from the vertical component
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.subtract = function(x, y) {
    this.x -= x;
    this.y -= y;
    return this;
};

/**
 * Subtracts from the components of the vector
 *
 * @param {Vector} vector - the vector to subtract
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.subtractv = function(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
};

/**
 * Multiplies the components of the vector
 *
 * @param {number} x - the amount to multiply the horizontal component by
 * @param {number} y - the amount to multiply the vertical component by
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.multiply = function(x, y) {
    this.x *= x;
    this.y *= y;
    return this;
};

/**
 * Multiplies the components of the vector
 *
 * @param {Vector} vector - the vector to multiply
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.multiplyv = function(vector) {
    this.x *= vector.x;
    this.y *= vector.y;
    return this;
};

/**
 * Divides the components of the vector
 *
 * @param {number} x - the amount to divide the horizontal component by
 * @param {number} y - the amount to divide the vertical component by
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.divide = function(x, y) {
    this.x /= x;
    this.y /= y;
    return this;
};

/**
 * Divides the components of the vector
 *
 * @param {Vector} vector - the vector to divide
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.dividev = function(vector) {
    this.x /= vector.x;
    this.y /= vector.y;
    return this;
};

/**
 * Rotates the vector about the origin
 *
 * @param {number} cos - the cosine of the angle to rotate by
 * @param {number} sin - the sine of the angle to rotate by
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.rotate = function(cos, sin) {
    var xt = this.x * cos - this.y * sin;
    this.y = this.x * sin + this.y * cos;
    this.x = xt;
    return this;
};

/**
 * Rotates the vector about the origin
 *
 * @param {Vector} vector - the vector direction
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.rotatev = function(vector) {
    return this.rotate(vector.x, vector.y);
};

/**
 * Rotates the vector about the origin
 *
 * @param {number} angle - the angle to rotate by
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.rotateAngle = function(angle) {
    return this.rotate(Math.cos(angle), Math.sin(angle));
};

/**
 * Rotates the vector about the given coordinates
 *
 * @param {number} x   - the horizontal pivot coordinate
 * @param {number} y   - the vertical pivot coordinate
 * @param {number} cos - the cosine of the angle to rotate by
 * @param {number} sin - the sine of the angle to rotate by
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.rotateAround = function(x, y, cos, sin) {
    this.x -= x;
    this.y -= y;
    var xt = this.x * cos - this.y * sin;
    this.y = this.x * sin + this.y * cos;
    this.x = xt;
    this.x += x;
    this.y += y;
    return this;
};

/**
 * Rotates the vector about the given coordinates
 *
 * @param {Vector} pos - the position to rotate around
 * @param {Vector} dir - the direction of the rotation
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.rotateAroundv = function(pos, dir) {
    return this.rotateAround(pos.x, pos.y, dir.x, dir.y);
};

/**
 * Calculates the squared distance between two vector coordinates
 *
 * @param {Vector} vector - the second vector
 *
 * @returns {number} the squared distance between the vector coordinates
 */
Vector.prototype.distanceSq = function(vector) {
    return (this.x - vector.x) * (this.x - vector.x) + (this.y - vector.y) * (this.y - vector.y);
};

/**
 * Calculates the distance between two vector coordinates
 *
 * @param {Vector} vector - the second vector
 *
 * @returns {number} the distance between the vector coordinates
 */
Vector.prototype.distance = function(vector) {
    return Math.sqrt((this.x - vector.x) * (this.x - vector.x) + (this.y - vector.y) * (this.y - vector.y));
};

/**
 * Calculates the distance to the line segment between p1 and p2
 *
 * @param {Vector} p1 - the starting point of the segment
 * @param {Vector} p2 - the ending point of the segment
 *
 * @returns {number} the distance to the line segment
 */
Vector.prototype.segmentDistance = function(p1, p2) {
    return Math.sqrt(this.segmentDistanceSq(p1, p2));
};

/**
 * Calculates the squared distance to the line segment between p1 and p2
 *
 * @param {Vector} p1 - the starting point of the segment
 * @param {Vector} p2 - the ending point of the segment
 *
 * @returns {number} the squared distance to the line segment
 */
Vector.prototype.segmentDistanceSq = function(p1, p2) {
    var l2 = p1.distanceSq(p2);
    var t = ((this.x - p1.x) * (p2.x - p1.x) + (this.y - p1.y) * (p2.y - p1.y)) / l2;
    if (t <= 0) return this.distanceSq(p1);
    if (t >= 1) return this.distanceSq(p2);
    return this.distanceSq({x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y)});
};

/**
 * Calculates the squared length of the vector
 *
 * @returns {number} the squared length of the vector
 */
Vector.prototype.lengthSq = function() {
    return this.x * this.x + this.y * this.y;
};

/**
 * Calculates the length of the vector
 *
 * @returns {number} the length of the vector
 */
Vector.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
}

/**
 * Normalizes the vector if not currently 0 length
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.normalize = function() {
    var magSq = this.x * this.x + this.y * this.y;
    if (magSq != 0 && magSq != 1) {
        var mag = Math.sqrt(magSq);
        this.x /= mag;
        this.y /= mag;
    }
    return this;
};

/**
 * Sets the magnitude of the vector if not currently 0 length
 *
 * @param length - the new length for the vector
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.setMagnitude = function(length) {
    var magSq = this.x * this.x + this.y * this.y;
    if (magSq != 0 && magSq != 1) {
        var mag = Math.sqrt(magSq);
        this.x /= mag;
        this.y /= mag;
    }
    this.x *= length;
    this.y *= length;
    return this;
};

/**
 * Clones the vector
 *
 * @returns {Vector} the clone of the vector
 */
Vector.prototype.clone = function() {
    return new Vector(this.x, this.y);
};