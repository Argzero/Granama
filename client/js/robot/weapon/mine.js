/**
 * A mine that can be placed that blows up on contact or after a certain amount of time
 * 
 * @param {Number} x      - initial horizontal coordinate
 * @param {Number} y      - initial vertical coordinate
 * @param {Number} damage - amount of damage the mine deals
 *
 * @constructor
 */
extend('Mine', 'Sprite');
function Mine(shooter, pos, damage, type, target) {
    this.super(type + 'Mine', pos.x, pos.y);
    this.shooter = shooter;
    this.lifespan = MINE_DURATION;
    this.power = damage;
    this.exploded = false;
    this.target = target;
    this.type = Robot.MINE;
    this.target = target || Robot.PLAYER;
    this.id = gameScreen.spawnId++;
}

/**
 * Updates the mine, detonating if its lifespan expires or a 
 * target gets too close
 */
Mine.prototype.update = function() {
    this.lifespan--;
    var closest = gameScreen.getClosest(this.pos, this.target);
    if (this.lifespan <= 0 || (closest && closest.pos.distanceSq(this.pos) < sq(this.width + closest.width))) {
        this.explode();
    }
};

/**
 * A mine taking damage causes it to explode
 *
 * @param {Number} amount - amount of damage dealt
 * @param {Robot}  source - the robot that dealt the damage
 */
Mine.prototype.damage = function(amount, source) {
    this.explode();
};

/**
 * Blows up the mine, dealing damage to nearby targets
 */
Mine.prototype.explode = function() {
    if (this.exploded) {
        this.expired = true;
        return;
    }
    this.exploded = true;
    gameScreen.particles.push(new RocketExplosion('Enemy', this.pos, this.width * 2));
    for (var i = 0; i < gameScreen.robots.length; i++) {
        var r = gameScreen.robots[i];
        if ((r.type & this.target) && this.pos.distanceSq(r.pos) < sq(r.width + 2 * this.width)) {
            r.damage(this.power, this.shooter);
        }
    }
    this.expired = true;
};
