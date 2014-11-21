/**
 * A 2D vector with helper methods
 *
 * @constructor
 *
 * @param {Number} x - the horizontal component
 * @param {Number} y - the vertical component
 */
function Vector(x, y) {
	this.x = x ? x : 0;
	this.y = y ? y : 0;
}

/**
 * Computes the dot product between two vectors
 *
 * @param {Vector} vector - the second vector
 *
 * @returns {Number} the dot product result
 */
Vector.prototype.dot = function(vector) {
	return vector.x * this.x + vector.y * this.y;
};

/**
 * Computes the cross product between two vectors, keeping only the Z scalar since it's 2D
 *
 * @param {Vector} vector - the second vector
 *
 * @returns {Number} the z component of the cross product result
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
 * @param vector - the vector direction of the line to reflect over
 *
 * @returns {Vector} the reflected vector
 */
Vector.prototype.reflect = function(vector) {
    var projected = this.project(vector);
    return projected.add(projected.x - this.x, projected.y - this.y);
};

/**
 * Adds to the components of the vector
 *
 * @param {Number} x - the amount to add to the horizontal component
 * @param {Number} y - the amount to add to the vertical component
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.add = function(x, y) {
	this.x += x;
	this.y += y;
	return this;
};

/**
 * Subtracts from the components of the vector
 *
 * @param {Number} x - the amount to subtract from the horizontal component
 * @param {Number} y - the amount to subtract from the vertical component
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.subtract = function(x, y) {
	this.x -= x;
	this.y -= y;
	return this;
};

/**
 * Multiplies the components of the vector
 *
 * @param {Number} x - the amount to multiply the horizontal component by
 * @param {Number} y - the amount to multiply the vertical component by
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.multiply = function(x, y) {
	this.x *= x;
	this.y *= y;
	return this;
};

/**
 * Divides the components of the vector
 *
 * @param {Number} x - the amount to divide the horizontal component by
 * @param {Number} y - the amount to divide the vertical component by
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.divide = function(x, y) {
	this.x /= x;
	this.y /= y;
	return this;
};

/**
 * Rotates the vector about the origin
 *
 * @param {Number} cos - the cosine of the angle to rotate by
 * @param {Number} sin - the sine of the angle to rotate by
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
 * @param {Number} angle - the angle to rotate by
 *
 * @returns {Vector} the modified vector
 */
Vector.prototype.rotateAngle = function(angle) {
    return this.rotate(Math.cos(angle), Math.sin(angle));
};

/**
 * Rotates the vector about the given coordinates
 *
 * @param {Number} x   - the horizontal pivot coordinate
 * @param {Number} y   - the vertical pivot coordinate
 * @param {Number} cos - the cosine of the angle to rotate by
 * @param {Number} sin - the sine of the angle to rotate by
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
 * Calculates the squared distance between two vector coordinates
 *
 * @param {Vector} vector - the second vector
 *
 * @returns {Number} the squared distance between the vector coordinates
 */
Vector.prototype.distanceSq = function(vector) {
	return (this.x - vector.x) * (this.x - vector.x) + (this.y - vector.y) * (this.y - vector.y);
};

/**
 * Calculates the distance between two vector coordinates
 *
 * @param {Vector} vector - the second vector
 *
 * @returns {Number} the distance between the vector coordinates
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
 * @returns {Number} the distance to the line segment
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
 * @returns {Number} the squared distance to the line segment
 */
Vector.prototype.segmentDistanceSq = function(p1, p2) {
    var l2 = p1.distanceSq(p2);
    var t = ((this.x - p1.x) * (p2.x - p1.x) + (this.y - p1.y) * (p2.y - p1.y)) / l2;
    if (t <= 0) return this.distanceSq(p1);
    if (t >= 1) return this.distanceSq(p2);
    return this.distanceSq({ x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) });
};

/**
 * Calculates the squared length of the vector
 *
 * @returns {Number} the squared length of the vector
 */
Vector.prototype.lengthSq = function() {
	return this.x * this.x + this.y * this.y;
};

/**
 * Calculates the length of the vector
 *
 * @returns {Number} the length of the vector
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