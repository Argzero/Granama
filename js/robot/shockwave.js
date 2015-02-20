/**
 * Represents an arc projectile that expands outward from
 * a central point. Do not make a shockwave with a difference between 
 * the start and end of more than Pi radians. Instead, make multiple smaller ones.
 *
 * @param {Robot}  source    - robot releasing the shockwave
 * @param {string} color1    - primary CSS color for the shockwave
 * @param {string} color2    - primary CSS color for the shockwave
 * @param {number} x         - horizontal coordinate of the center of the shockwave arc
 * @param {number} y         - vertical coordinate of the center of the shockwave arc
 * @param {number} speed     - the rate the shockwave expands at
 * @param {number} min       - the starting angle in radians for the arc
 * @param {number} max       - the ending angle in radians for the arc
 * @param {number} radius    - the radius of the shockwave's arc
 * @param {number} thickness - how thick the shockwave is for collisions
 * @param {number} damage    - the amount of damage the shockwave deals
 * @param {number} range     - the max radius the shockwave can expand out to
 * @param {number} knockback - the amount of knockback to apply with the shockwave
 * @param {number} target    - the robot type ID to allow the shockwave to hit
 *
 * @constructor
 */
function Shockwave(source, color1, color2, x, y, speed, min, max, radius, thickness, damage, range, knockback, target) {
    this.arc = new Arc(new Vector(x, y), radius, thickness, min, max);
    this.source = source;
    this.color1 = color1;
    this.color2 = color2;
    this.speed = speed;
    this.damage = damage;
    this.range = range;
    this.knockback = knockback;
    this.expired = false;
    this.target = target;
}

/**
 * Updates the shockwave, expanding it outward according
 * to its speed and expiring after it reaches its range
 */
Shockwave.prototype.update = function() {
    this.arc.radius += this.speed;
    if (this.arc.radius > this.range) this.expired = true;
};

/** 
 * Draws the shockwave to the screen
 */
Shockwave.prototype.draw = function() {
    camera.ctx.lineWidth = this.thickness;
    camera.ctx.strokeStyle = this.color1;
    camera.ctx.beginPath();
    camera.ctx.arc(this.arc.pos.x, this.arc.pos.y, this.arc.radius, this.arc.start, this.arc.end);
    camera.ctx.stroke();
    camera.ctx.lineWidth = this.thickness / 2;
    camera.ctx.strokeStyle = this.color2;
    camera.ctx.beginPath();
    camera.ctx.arc(this.arc.pos.x, this.arc.pos.y, this.arc.radius + this.arc.thickness / 4, this.arc.start, this.arc.end);
    camera.ctx.stroke();
};

/**
 * Checks whether or not the shockwave is hitting the target
 * 
 * @param {Robot} target - target to check for collision against
 */
Shockwave.prototype.isHitting = function(target) {
    return this.arc.collides(target) && (this.target & target.type);
};

/**
 * Hits the target with the shockwave, dealing damage and applying knockback
 *
 * @param {Robot} target - target to deal damage to
 */
Shockwave.prototype.hit = function(target) {
    target.damage(this.damage, this.source);

    // Knockback if applicable
    if (this.knockback && target.Knockback) {
        var dir = target.pos.clone().subtractv(this.arc.clone());
        dir.setLength(this.knockback);
        target.knockback(dir);
    }
};