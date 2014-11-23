function EnemyTail(source, segment, end, offset, length, base, endOffset) {
    offset = Math.round(offset / source.speed);
    base = Math.round(base / source.speed);
    endOffset = Math.round(endOffset / source.speed);
    var obj = {
        source      : source,
        segment     : segment,
        end         : end,
        offset      : offset,
        length      : length,
        base        : base,
        index       : 0,
        prevX       : source.x,
        prevY       : source.y,
        maxIndex    : offset * (length - 1) + base + endOffset,
        orientations: [],
        turrets     : [],

        // Sets the turrets along the tail
        SetTurrets  : function(sprite, bulletSprite, damage, rate, pierce, dx, dy) {
            this.turrets = [];
            for (var i = 0; i < this.length - 1; i++) {
                var turret = new Turret(-100, -100, damage, 9999);
                turret.sprite = sprite;
                turret.base = undefined;
                turret.gunData.sprite = bulletSprite;
                turret.gunData.damage = damage;
                turret.gunData.rate = rate;
                turret.gunData.pierce = pierce;
                turret.gunData.dx = dx;
                turret.gunData.dy = dy;
                this.turrets.push(turret);
            }
        },

        // Draws the tail
        Draw        : function() {

            // Update when not paused
            if (!gameScreen.paused) {

                // Update the orientation array
                if (this.prevX != this.source.x || this.prevY != this.source.y) {
                    this.orientations[this.index * 3] = source.x;
                    this.orientations[this.index * 3 + 1] = source.y;
                    this.orientations[this.index * 3 + 2] = source.angle;
                    this.index = (this.index + 1) % this.maxIndex;
                    this.prevX = this.source.x;
                    this.prevY = this.source.y;
                }

                // Update the turrets
                for (var i = 0; i < this.turrets.length; i++) {
                    var j = (this.index - i * this.offset - this.base + this.maxIndex) % this.maxIndex;
                    this.turrets[i].x = this.orientations[j * 3];
                    this.turrets[i].y = this.orientations[j * 3 + 1];
                    this.turrets[i].Update();
                }
            }

            // Draw the tail
            canvas.save();
            ResetTransform(canvas);
            var j = this.index;
            canvas.translate(this.orientations[j * 3], this.orientations[j * 3 + 1]);
            canvas.rotate(this.orientations[j * 3 + 2]);
            canvas.drawImage(this.end, -this.end.width / 2, -this.end.height / 2);
            ResetTransform(canvas);
            for (var i = this.length - 2; i >= 0; i--) {
                j = (this.index - i * this.offset - this.base + this.maxIndex) % this.maxIndex;
                canvas.translate(this.orientations[j * 3], this.orientations[j * 3 + 1]);
                canvas.rotate(this.orientations[j * 3 + 2]);
                canvas.drawImage(this.segment, -this.segment.width / 2, -this.segment.height / 2);
                ResetTransform(canvas);
                if (this.turrets[i]) {
                    this.turrets[i].Draw();
                }
            }
            canvas.restore();
        }
    };

    // Populate the orientations array
    for (var i = 0; i < obj.maxIndex; i++) {
        obj.orientations.push(source.x);
        obj.orientations.push(source.y);
        obj.orientations.push(source.angle);
    }

    return obj;
}