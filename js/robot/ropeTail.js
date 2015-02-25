depend('robot/tailSegment');

/**
 * Represents a tail that uses simple rope-like physics to bend
 *
 * @param {Robot}   source     - the robot owning the tail
 * @param {string}  segment    - the name of the sprite of the tail segments
 * @param {string}  end        - the name of the sprite of the last segment of the tail
 * @param {number}  length     - the number of segments the tail should have
 * @param {number}  offset     - the distance each segment should be from eachother
 * @param {number}  base       - the distance of the first segment from the source
 * @param {number}  endOffset  - the distance the last segment should be from the others
 * @param {number}  constraint - the max angle segments can bend from eachother
 * @param {boolean} [front]    - whether or not the end is the front most segment (normally false)
 *
 * @constructor 
 */
extend('RopeTail', 'Sprite');
function RopeTail(source, segment, end, length, offset, base, endOffset, constraint, front) {
    this.super(length <= 1 ? end : segment, 0, -base - offset);
    
    // Apply parenting
    if (front) source.postChildren.push(this);
    else source.preChildren.unshift(this);
    this.child(source, true);
    
    // Data
    this.source = source;
    this.rel = new Vector(1, 0);
    this.dir = new Vector(0, 1);
    this.offset = this.pos.y;
    
    constraint *= Math.PI / 180;
    
    this.segments = new Array(length - 1);
    var parent = this;
    for (var i = 0; i < length - 1; i++) {
        var seg = new TailSegment(parent, i == length - 2 ? end : segment, i == length - 2 ? endOffset + offset : offset, constraint);
        this.segments[i] = seg;
        parent = seg;
    }
}

/**
 * Set the base direction for the tail. This is the direction
 * from the center of the robot the tail will point out of
 *
 * @param {Vector} dir - the direction of the tail
 */
RopeTail.prototype.setBaseDir = function(dir) {
    this.pos.rotate(this.rel.x, -this.rel.y);
    this.pos.rotate(dir.x, dir.y);
    this.rotation = dir.clone();
    this.rel = dir.clone();
    return this;
}

/**
 * Updates the tail including all segments, applying
 * constraints and bending according to the source's movement
 */
RopeTail.prototype.update = function() {
    this.dir = this.source.rotation.clone().rotate(0, 1).rotate(this.rel.x, this.rel.y);
    this.pos.x = 0;
    this.pos.y = this.offset;
    this.pos.rotate(this.dir.y, -this.dir.x);
    this.pos.addv(this.source.pos);
    
    camera.ctx.translate(-this.source.pos.x, -this.source.pos.y);
    if (!this.front) {
        this.draw(camera);
        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].update();
            this.segments[i].draw(camera);
        }
    }
    else {
        for (var i = this.segments.length - 1; i >= 0; i--) {
            this.segments[i].update();
            this.segments[i].draw(camera);
        }
        this.draw(camera);
    }
    camera.ctx.translate(this.source.pos.x, this.source.pos.y);
}

/**
 * Gets the orientation of the end of the tail
 */
RopeTail.prototype.getEndDir = function() {
    return this.segments[this.segments.length - 1].getWorldRotation();
}


// Modes for the turnTowards method
ROPE_TURN_ALL = 0;  // Turns all segments the same amount
ROPE_TURN_END = 1;  // Turns the end of the tail faster than the base
ROPE_TURN_ROOT = 2; // Turns the base of the tail faster than the end

/**
 * Turns the tail towards the given direction using a given mode
 *
 * @param {Vector} dir   - direction to point towards
 * @param {number} speed - speed of rotation to use (in angles per frame)
 * @param {number} mode  - how to apply the rotation throughout the tail
 */
RopeTail.prototype.turnTowards = function(dir, speed, mode) {
    
    var d = this.getEndDir();
    if (d.Dot(dir) > 0.95) return;
    d.Rotate(0, 1);
    var m = d.Dot(dir) > 0 ? 1 : -1;
    
    // Turn End mode
    if (mode == 1) {
        var t = (this.segments.length + 1) * (this.segments.length / 2);
        var s = 0;
        for (var i = 0; i < this.segments.length; i++) {
            s += speed * (i + 1) / t;
            this.segments[i].rotate(Math.cos(s), m * Math.sin(s));
        }
    }
    
    // Turn Root mode
    else if (mode == 2) {
        var t = (this.segments.length + 1) * (this.segments.length / 2);
        var s = 0;
        for (var i = 0; i < this.segments.length; i++) {
            s += speed * (this.segments.length - i) / t;
            this.segments[i].rotate(Math.cos(s), m * Math.sin(s));
        }
    }
    
    // Turn All mode
    else {
        var t = speed / this.segments.length;
        var s = 0;
        for (var i = 0; i < this.segments.length; i++) {
            s += t;
            this.segments[i].rotate(Math.cos(s), m * Math.sin(s));
        }
    }
}