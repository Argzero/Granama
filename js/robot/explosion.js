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
};

/**
 * Represents a fancy explosion used for mine and rocket explosions
 *
 * @param {string} type - type of the explosion (determines the color)
 * @param {number} x    - horizontal coordinate of the explosion
 * @param {number} y    - vertical coordinate of the explosion
 * @param {number} size - size of the explosion
 *
 * @constructor
 */
function RocketExplosion(type, pos, size) {
    var angle = rand(360) * Math.PI / 180;
    var dir = new Vector(Math.cos(angle), Math.sin(angle));
    var zero = new Vector(0, 0);

    this.type = type;
    this.pos = pos;
    this.size = size;
    this.frame = 0;

    // Initialize starting pieces
    this.pieces = [
        new ExplosionPiece('explodeSmoke' + (rand(4) + 1), 0, pos.x + dir.rotate(COS_60, SIN_60).x * size / 4, pos.y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        new ExplosionPiece('explodeSmoke' + (rand(4) + 1), 1, pos.x + dir.rotate(COS_60, SIN_60).x * size / 4, pos.y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        new ExplosionPiece('explodeSmoke' + (rand(4) + 1), 2, pos.x + dir.rotate(COS_60, SIN_60).x * size / 4, pos.y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        new ExplosionPiece('explodeSmoke' + (rand(4) + 1), 3, pos.x + dir.rotate(COS_60, SIN_60).x * size / 4, pos.y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        new ExplosionPiece('explodeSmoke' + (rand(4) + 1), 4, pos.x + dir.rotate(COS_60, SIN_60).x * size / 4, pos.y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        new ExplosionPiece('explodeSmoke' + (rand(4) + 1), 5, pos.x + dir.rotate(COS_60, SIN_60).x * size / 4, pos.y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        new ExplosionPiece('explodeSmoke' + (rand(4) + 1), 6, pos.x + dir.rotate(COS_60, SIN_60).x * size / 4, pos.y + dir.y * size / 4, size / 2, zero, 0.8, 0.02, 30, true),
        new ExplosionPiece('explodeBase' + type, 7, pos.x, pos.y, size * 2 / 3, zero, 1, 0.08, 10, true)
    ];
}

/**
 * Draws the explosion by drawing each of its pieces
 */
RocketExplosion.prototype.draw = function() {

    // Add new bits occasionally
    if (this.frame < 6) {
        var angle = rand(360) * Math.PI / 180;
        var speed = this.size * (rand(10) + 5) / 600;
        var dir = new Vector(speed * Math.cos(angle), speed * Math.sin(angle));
        this.pieces.push(new ExplosionPiece('explodeBit' + this.type, this.pieces.length, this.pos.x, this.pos.y, this.size / 10, dir, 1, 0.03, 10, false, updateBit));
    }
    this.frame++;

    // Clear update flag
    var i;
    for (i = 0; i < this.pieces.length; i++) {
        this.pieces[i].updated = false;
    }
    for (i = 0; i < this.pieces.length; i++) {
        if (!this.pieces[i].updated) {
            this.pieces[i].updated = true;
            this.pieces[i].update(this);
        }
    }

    // Draw the pieces
    this.expired = true;
    for (i = 0; i < this.pieces.length; i++) {
        if (!this.pieces[i].expired) {
            this.pieces[i].draw(camera);
            this.expired = false;
        }
    }
};

/**
 * Represents one bit of an explosion that has its own data
 *
 * @param {string}   sprite     - name of the sprite of the piece
 * @param {number}   id         - index of the piece
 * @param {number}   x          - horizontal coordinate of the piece
 * @param {number}   y          - vertical coordinate of the piece
 * @param {number}   size       - size of the piece
 * @param {Vector}   vel        - initial velocity of the piece
 * @param {number}   alpha      - starting transparency of the piece
 * @param {number}   alphaDecay - how fast the transparency decays
 * @param {boolean}  fadeIn     - whether or not the alpha fades in
 * @param {function} update     - the update callback of the piece
 *
 * @constructor
 */
extend('ExplosionPiece', 'Sprite');
function ExplosionPiece(sprite, id, x, y, size, vel, alpha, alphaDecay, alphaDelay, fadeIn, update) {
    this.super(sprite, x, y);
    this.fadeIn = fadeIn;
    this.id = id;
    this.setScale(size / this.width, size / this.height);
    this.vel = vel;
    this.alpha = fadeIn ? 0 : alpha;
    this.targetAlpha = alpha;
    this.alphaDecay = alphaDecay;
    this.alphaDelay = alphaDelay;
    this.expired = false;

    this.callback = update;
}

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

/**
 * Callback update for explosion bits
 *
 * @param {RocketExplosion} explosion - the parent explosion
 */
function updateBit(explosion) {

    // Frames alive
    if (!this.frame) {
        this.frame = 1;
    }
    else this.frame++;

    // Scale slightly down
    if (!this.oSize) {
        this.oSize = this.size.clone();
        this.oAlpha = this.alpha;
    }
    var size = (0.5 + (0.5 * this.alpha / this.oAlpha)) * this.oSize.x;
    this.setScale(size, size);

    // Spawn smoke trail
    if (this.alpha > 0.4 && this.frame % 3 === 0) {
        explosion.pieces.splice(8, 0, new ExplosionPiece('explodeSmoke' + (rand(4) + 1), 8, this.pos.x, this.pos.y, this.size.x * this.width, new Vector(0, 0), this.alpha, 0.02, 20, false));
    }
}