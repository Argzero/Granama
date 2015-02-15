depend('robot/tailSegment');

function RopeTail(source, segment, end, length, offset, base, endOffset, constraint) {
    this.source = source;
    this.dir = Vector(0, 1);
    this.rel = Vector(1, 0);
    this.pos = Vector(source.x, source.y - base - offset);
    this.offset = base;
    this.sprite = length <= 1 ? end : segment;

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
    this.pos.x = 0;
    this.pos.y = -this.offset;
    this.pos.Rotate(this.dir.y, -this.dir.x);
    this.pos.Add(this.source.x, this.source.y);

    // Update other segments
    for (var i = 0; i < this.segments.length; i++) {
        this.segments[i].update();
    }

    canvas.save();

    // Draw the other segments
    for (var i = this.segments.length - 1; i >= 0; i--) {
        this.segments[i].draw();
    }

    // Draw the root
    ResetTransform(canvas);
    canvas.translate(this.pos.x, this.pos.y);
    canvas.transform(this.dir.y, -this.dir.x, this.dir.x, this.dir.y, 0, 0);
    canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);

    canvas.restore();
}