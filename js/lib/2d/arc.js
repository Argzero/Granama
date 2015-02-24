/**
 * Represents an arc that can check against sprites for collision. Do not
 * make an arc with a difference between the start and end of more than
 * Pi radians. Instead, make multiple smaller ones.
 *
 * @param {Vector} pos       - the center position of the arc
 * @param {Number} radius    - the radius of the arc
 * @param {Number} thickness - the width of the arc for collisions
 * @param {Number} start     - the starting angle of the arc
 * @param {Number} end       - the ending angle of the arc
 *
 * @constructor 
 */
function Arc(pos, radius, thickness, start, end) {
    this.pos = pos;
    this.radius = radius;
    this.thickness = thickness;
    this.start = start;
    this.end = end;
    
    this.startTrig = new Vector(Math.cos(start), Math.sin(start)).rotate(0, 1);
    this.endTrig = new Vector(Math.cos(end), Math.sin(end)).rotate(0, -1);
}

/**
 * Checks whether or not the arc collides with the given sprite
 * 
 * @param {Sprite} target - the target to check for collisions against
 *
 * @returns {boolean} true if collides, false otherwise
 */
Arc.prototype.collides = function(target) {
    if (target.startTrig) return false;
    var dif = this.pos.clone().subtractv(target.pos);
    var dSq = dif.lengthSq();
    var thickness = (this.thickness + target.width) / 2;
    
    return dSq < sq(this.radius + thickness) 
        && dSq > sq(this.radius - thickness) 
        && this.endTrig.dot(dif) <= 0
        && this.startTrig.dot(dif) <= 0;
}
