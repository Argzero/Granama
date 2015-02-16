function TailSegment(parent, sprite, offset, constraint) {
    this.parent = parent;
    this.sprite = sprite;
    this.offset = offset;
    this.constraint = constraint;
    this.pos = new Vector(parent.pos.x, parent.pos.y - offset);
    this.dir = new Vector(0, 1);
    this.lim = new Vector(Math.cos(constraint), Math.sin(constraint));
}

TailSegment.prototype.update = function() {
    var dir = this.parent.dir;
    var limMax = Vector(dir.x, dir.y).Rotate(this.lim.x, this.lim.y).Rotate(0, -1);
    var limMin = Vector(dir.x, dir.y).Rotate(this.lim.x, -this.lim.y).Rotate(0, 1);

    // When directly on top of the parent segment, move straight back
    if (this.pos.x == this.parent.pos.x && this.pos.y == this.parent.pos.y) {
        this.pos.x = 0;
        this.pos.y = -this.offset;
        this.pos.Rotate(this.dir.y, -this.dir.x);
        this.pos.Add(this.parent.pos.x, this.parent.pos.y);
        this.dir.x = this.parent.dir.x;
        this.dir.y = this.parent.dir.y;
    }

    // Otherwise, move according to the current angle to the parent segment
    else {
        this.dir.x = this.parent.pos.x - this.pos.x;
        this.dir.y = this.parent.pos.y - this.pos.y;
        if (this.dir.Dot(limMin) < 0) {
            limMin.Rotate(0, -1);
            this.dir.x = limMin.x;
            this.dir.y = limMin.y;
        }
        else if (this.dir.Dot(limMax) < 0) {
            limMax.Rotate(0, 1);
            this.dir.x = limMax.x;
            this.dir.y = limMax.y;
        }
        else this.dir.Normalize();
        this.pos.x = this.parent.pos.x - this.dir.x * this.offset;
        this.pos.y = this.parent.pos.y - this.dir.y * this.offset;
    }
}

TailSegment.prototype.draw = function() {
    ResetTransform(canvas);
    canvas.translate(this.pos.x, this.pos.y);
    canvas.transform(this.dir.y, -this.dir.x, this.dir.x, this.dir.y, 0, 0);
    canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
}