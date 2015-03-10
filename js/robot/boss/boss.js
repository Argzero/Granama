/**
 * A boss in the game that takes reduced effects from slows, stuns, and debuffs while not caring
 * about orientation for being "in range"
 *
 * @param {string} name       - name of the enemy sprite image
 * @param {number} x          - initial horizontal position
 * @param {number} y          - initial vertical position
 * @param {number} type       - Robot type ID of the enemy (should be Robot.BOSS)
 * @param {number} health     - max health
 * @param {number} speed      - movement speed
 * @param {number} range      - attack range
 * @param {number} exp        - experience yield
 * @param {string} rank       - difficulty rank
 * @param {number} patternMin - minimum time between switching attack patterns
 * @param {number} patternMax - maximum time between switching attack patterns
 * @param {string} title      - the title of the boss
 *
 * @constructor
 */
extend('Boss', 'Enemy');
function Boss(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax, title) {
    this.super(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax);
    this.knockbackFactor = 0.2;
    this.title = title;
}

/** 
 * Caculates the scaling multiplier for a summation scale
 * 
 * @returns {number} scaling multiplier
 */
Boss.sum = function() {
    var c = gameScreen.bossCount;
    return ((c + 1) / 2) * (c + 2) * (1 + gameScreen.score / 1000);
};

/**
 * Checks whether or not the enemy is a boss
 *
 * @returns {boolean} true if a boss, false otherwise
 */
Boss.prototype.isBoss = function() {
    return true;
};

/**
 * Checks whether or not the enemy is in range of a player to fire their weapon
 *
 * @param {number} range - weapon range
 *
 * @returns {boolean} true if in range, false otherwise
 */
Boss.prototype.isInRange = function(range) {
    var player = getClosestPlayer(this.pos);
    return player && player.health > 0 && this.pos.distanceSq(player.pos) < sq(range + this.speed);
};

/**
 * Bosses ignore stuns
 *
 * @param duration duration of the stun
 */
Boss.prototype.stun = function(duration) { };

/**
 * Bosses take reduced buff effects
 *
 * @param {string} name       - the name of the stat
 * @param {number} multiplier - the multiplier for the stat
 * @param {number} duration   - the duration of the buff in frames
 */
Boss.prototype.buff = function(name, multiplier, duration) {
    this.buffs[name] = {multiplier: multiplier + (1 - multiplier) * 0.8, duration: duration};
};

/**
 * Bosses cannot be walked over by players
 */
Boss.prototype.subUpdate = function() {
    if (this.movement == movement.flying || this.movement == movement.flyCenter) return;
    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        if (!p.dead && this.collides(p)) {
            var d = p.pos.clone().subtractv(this.pos);
            d.setMagnitude((this.width + p.width) / 2);
            d.addv(this.pos);
            p.moveTo(d.x, d.y);
        }
    }
};