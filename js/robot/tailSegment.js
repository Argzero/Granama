/**
 * Represents a single segment of a Rope Tail
 *
 * @param {RopeTail|TailSegment} parent     - parent of the segment
 * @param {string}               sprite     - name of the sprite of the segment
 * @param {number}               offset     - distance between segments
 * @param {number}               constraint - maximum angle segments can bend
 */
extend('TailSegment', 'Sprite');
function TailSegment(parent, sprite, offset, constraint) {
    this.super(sprite, 0, -offset);

    this.parent = parent;
    this.constraint = constraint;
    this.offset = offset;
    this.lim = new Vector(Math.cos(constraint), Math.sin(constraint));
    this.dir = new Vector(0, 1);
}

/**
 * Updates the tail segment, applying rotations and clamping to the constraintsd
 */
TailSegment.prototype.update = function() {
    var dir = this.parent.dir;
    var limMax = dir.clone().rotate(this.lim.x, this.lim.y).rotate(0, -1);
    var limMin = dir.clone().rotate(this.lim.x, -this.lim.y).rotate(0, 1);
    
    // When directly on top of the parent segment, move straight back
    if (this.pos.x == this.parent.pos.x && this.pos.y == this.parent.pos.y) {
        this.pos.x = 0;
        this.pos.y = -this.offset;
        this.pos.rotate(this.dir.y, -this.dir.x);
        this.pos.addv(this.parent.pos);
        this.dir.x = this.parent.dir.x;
        this.dir.y = this.parent.dir.y;
    }
    
    // Otherwise, move according to the current angle to the parent segment
    else {
        this.dir.x = this.parent.pos.x - this.pos.x;
        this.dir.y = this.parent.pos.y - this.pos.y;
        if (this.dir.dot(limMin) < 0) {
            limMin.rotate(0, -1);
            this.dir.x = limMin.x;
            this.dir.y = limMin.y;
        }
        else if (this.dir.dot(limMax) < 0) {
            limMax.rotate(0, 1);
            this.dir.x = limMax.x;
            this.dir.y = limMax.y;
        }
        else this.dir.normalize();
        this.pos.x = this.parent.pos.x - this.dir.x * this.offset;
        this.pos.y = this.parent.pos.y - this.dir.y * this.offset;
    }
};
