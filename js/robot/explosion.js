/**
 * Represents a basic explosion when enemies die
 *
 * @param {Number} x    - the horizontal coordinate of the explosion's center
 * @param {Number} y    - the vertical coordinate of the explosion's center
 * @param {Number} size - the size of the explosion as a multiplier of base size
 */
function Explosion(x, y, size) {
    this.frame = 0;
    this.size = size;
    this.x = x;
    this.y = y;
    this.c = 0;
}

/**
 * Draws the explosion to the screen
 */
Explosion.prototype.draw = function() {
    var img = EXPLOSION_IMGS[Math.floor(this.c + this.frame)];
    img.setScale(this.size / 2, this.size / 2);
    img.moveTo(this.x, this.y);
    img.draw(camera);
    this.frame += 0.4;
    if (this.frame >= 10) {
        this.expired = true;
    }
}

function RocketExplosion(type, x, y, size) {
    var angle = rand(360) * Math.PI / 180;
    var dir = new Vector(Math.cos(angle), Math.sin(angle));
    var zero = new Vector(0, 0);

    this.type = type;
    this.x = x;
    this.y = y;
    this.size = size;
    this.frame = 0;

    this.pieces: [
        e.Piece(e.randSmoke(), 0, x + dir.rotate(COS_60, SIN_60).x * size / 4, y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        e.Piece(e.randSmoke(), 1, x + dir.rotate(COS_60, SIN_60).x * size / 4, y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        e.Piece(e.randSmoke(), 2, x + dir.rotate(COS_60, SIN_60).x * size / 4, y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        e.Piece(e.randSmoke(), 3, x + dir.rotate(COS_60, SIN_60).x * size / 4, y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        e.Piece(e.randSmoke(), 4, x + dir.rotate(COS_60, SIN_60).x * size / 4, y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        e.Piece(e.randSmoke(), 5, x + dir.rotate(COS_60, SIN_60).x * size / 4, y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        e.Piece(e.randSmoke(), 6, x + dir.rotate(COS_60, SIN_60).x * size / 4, y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        e.Piece(GetImage('explodeBase' + type), 7, x, y, size * 2 / 3, zero, 1, 0.08, 10, true)
    ];
}

draw: function() {

    // Add new bits occasionally
    if (this.frame < 7) {
        var angle = rand(360) * Math.PI / 180;
        var speed = this.size * (rand(10) + 5) / 600;
        var dir = Vector(speed * Math.cos(angle), speed * Math.sin(angle));
        this.pieces.push(explosionFunctions.Piece(GetImage('explodeBit' + this.type), this.pieces.length, this.x, this.y, this.size / 10, dir, 1, 0.03, 10, false, explosionFunctions.updateBit));
    }
    this.frame++;

    // Clear update flag
    for (var i = 0; i < this.pieces.length; i++) {
        this.pieces[i].updated = false;
    }
    for (var i = 0; i < this.pieces.length; i++) {
        if (!this.pieces[i].updated) {
            this.pieces[i].updated = true;
            this.pieces[i].update(this);
        }
    }

    // Draw the pieces
    this.expired = true;
    for (var i = 0; i < this.pieces.length; i++) {
        if (!this.pieces[i].expired) {
            this.pieces[i].draw();
            this.expired = false;
        }
    }
},

randSmoke: function() {
    return GetImage('explodeSmoke' + (rand(4) + 1));
},

updateBit: function(explosion) {

    // Frames alive
    if (!this.frame) {
        this.frame = 1;
    }
    else this.frame++;

    // Scale slightly down
    if (!this.oSize) {
        this.oSize = this.size;
        this.oAlpha = this.alpha;
    }
    this.size = (0.5 + (0.5 * this.alpha / this.oAlpha)) * this.oSize;

    // Spawn smoke trail
    if (this.alpha > 0.4 && this.frame % 3 == 0) {
        var e = explosionFunctions;
        explosion.pieces.splice(8, 0, e.Piece(e.randSmoke(), 8, this.x, this.y, this.size, Vector(0, 0), this.alpha, 0.02, 20, false));
    }
},

/**
 * Represents one bit of an explosion that has its own data
 */
extend('ExplosionPiece', 'Sprite');
ExplosionPiece: function(sprite, id, x, y, size, vel, alpha, alphaDecay, alphaDelay, fadeIn, update) {
    sprite     : sprite,
    fadeIn     : fadeIn,
    id         : id,
    x          : x,
    y          : y,
    size       : size,
    vel        : vel,
    alpha      : fadeIn ? 0 : alpha,
    targetAlpha: alpha,
    alphaDecay : alphaDecay,
    alphaDelay : alphaDelay,
    expired    : false,

    callback: update;
},

/**
 * Updates the piece of the explosion
 *
 * @param {RocketExplosion} explosion - the parent explosion
 */
ExplosionPiece.prototype.update = function(explosion) {

    // Position update
    this.move(this.vel.x, this.vel.y);

    // Alpha update
    if (this.fadeIn) {
        this.alpha = Math.min(this.targetAlpha, this.alpha + 0.08);
        if (this.alpha == this.targetAlpha) {
            this.fadeIn = false;
        }
    }
    else if (this.alphaDelay > 0) {
        this.alphaDelay--;
    }
    else {
        this.alpha -= this.alphaDecay;
        if (this.alpha <= 0) {
            this.expired = true;
        }
    }

    // Callback update
    if (this.callback) {
        this.callback(explosion);
    }
};