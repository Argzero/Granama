/**
 * Represents an arc that can check against sprites for collision
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
    
    this.startTrig = new Vector(Math.cos(start), Math.sin(start));
    this.endTrig = new Vector(Math.cos(end), Math.sin(end));
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
        && this.endTrig.dot(dif) 
        && this.startTrig.dot(dif) <= 0;
}
