function RopeTail(source, segment, end, length, offset, base, endOffset, constraint) {
    this.source = source;
    this.dir = Vector(0, 1);
    this.rel = Vector(1, 0);
    this.pos = Vector(source.x, source.y - base - offset);
    this.offset = base;
    this.sprite = length <= 1 ? end : segment;
    this.locked = false;
    
    constraint = Math.PI * constraint / 180;
    
    this.segments = new Array(length - 1);
    var parent = this;
    for (var i = 0; i < length - 1; i++) {
        var seg = new TailSegment(parent, i == length - 2 ? end : segment, i == length - 2 ? endOffset + offset : offset, constraint);
        this.segments[i] = seg;
        parent = seg;
    }
}

RopeTail.prototype.update = function() {
    
    // Update the position/orientation
    this.dir.x = this.source.cos;
    this.dir.y = this.source.sin;
    this.dir.Rotate(this.rel.x, this.rel.y);
    if (this.reverse) this.dir.Rotate(-1, 0);
    this.pos.x = 0;
    this.pos.y = -this.offset;
    this.pos.Rotate(this.dir.y, -this.dir.x);
    this.pos.Add(this.source.x, this.source.y);
    
    this.clamp();
    
    canvas.save();
    
    // Draw everything
    if (this.reverse) this.draw();
    for (var i = this.segments.length - 1; i >= 0; i--) {
        var j = this.reverse ? this.segments.length - 1 - i : i;
        this.segments[j].draw();
    }
    if (!this.reverse) this.draw();
    
    canvas.restore();
}

// Draws the root of the rope tail
RopeTail.prototype.draw = function() {
    ResetTransform(canvas);
    canvas.translate(this.pos.x, this.pos.y);
    canvas.transform(this.dir.y, -this.dir.x, this.dir.x, this.dir.y, 0, 0);
    canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
}

RopeTail.prototype.followParent = function() {
    
    if (this.prevX !== undefined && this.prevY !== undefined) {
        this.pos.Add(this.source.x - this.prevX, this.source.y - this.prevY);
        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].pos.Add(this.source.x - this.prevX, this.source.y - this.prevY);
        }
    }
    
    this.prevX = this.source.x;
    this.prevY = this.source.y;
}

// Clamps segments to their proper positions/rotations
RopeTail.prototype.clamp = function() {

    // While locked, force directions on segments
    if (this.locked) {
        for (var i = 0; i < this.segments.length; i++) {
            var s = this.segments[i];
            s.dir = this.locked[i];
            s.pos.x = s.parent.pos.x - s.dir.x * s.offset;
            s.pos.y = s.parent.pos.y - s.dir.y * s.offset;
        }
    }
    
    // Update other segments normally otherwise
    else {
        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].update();
        }
    }
}

// Gets the total rotation through the tail (the direction the tail is pointing)
RopeTail.prototype.getEndDir = function() {
    var d = this.segments[this.segments.length - 1].dir;
    return Vector(d.x, d.y);
}

// Turns the tail towards the given direction
ROPE_TURN_ALL = 0;
ROPE_TURN_END = 1;
ROPE_TURN_ROOT = 2;
RopeTail.prototype.turnTowards = function(dir, speed, mode) {
    
    var d = this.getEndDir();
    if (d.Dot(dir) > 0.95) return;
    d.Rotate(0, 1);
    var m = d.Dot(dir) > 0 ? 1 : -1;
    
    if (mode == 1) {
        var t = (this.segments.length + 1) * (this.segments.length / 2);
        var s = 0;
        for (var i = 0; i < this.segments.length; i++) {
            s += speed * (i + 1) / t;
            this.segments[i].rotate(Math.cos(s), m * Math.sin(s));
        }
    }
    
    else if (mode == 2) {
        var t = (this.segments.length + 1) * (this.segments.length / 2);
        var s = 0;
        for (var i = 0; i < this.segments.length; i++) {
            s += speed * (this.segments.length - i) / t;
            this.segments[i].rotate(Math.cos(s), m * Math.sin(s));
        }
    }
    
    else {
        var t = speed / this.segments.length;
        var s = 0;
        for (var i = 0; i < this.segments.length; i++) {
            s += t;
            this.segments[i].rotate(Math.cos(s), m * Math.sin(s));
        }
    }
}