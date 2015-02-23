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
    this.prev = this.getWorldPos();
}

/**
 * Updates the tail segment, applying rotations and clamping to the constraint
 */
TailSegment.prototype.update = function() {
    var pos = this.parent.getWorldPos();
    var dir = this.prev.subtractv(pos).normalize();
    if (dir.lengthSq() > 0) {
        var rot = this.parent.getWorldRotation();
        rot.y = -rot.y;
        dir.rotate(rot.x, rot.y);
        //this.rotation = dir.normalize();
        this.pos = dir.multiply(this.offset, this.offset);
        this.prev = pos.addv(this.pos);
    }
}