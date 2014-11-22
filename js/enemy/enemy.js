/**
 * An enemy robot in the game
 *
 * @param {string} name
 * @param {number} x
 * @param {number} y
 * @param {number} health
 * @param {number} speed
 * @param {number} range
 * @param {number} exp
 * @param {string} rank
 * @param {number} [patternMin]
 * @param {number} [patternMax]
 *
 * @constructor
 */
extend('Enemy', 'Robot');
function Enemy(name, x, y, health, speed, range, exp, rank, patternMin, patternMax) {
    this.super(name, x, y, health, speed);

    this.range = range;
    this.exp = exp;
    this.rank = rank;
    this.patternMin = patternMin;
    this.patternMax = patternMax;

    this.ranges = [range];
    this.movements = [];
    this.patterns = [[]];
    this.pattern = 0;
    this.patternTimer = 0;
    this.pierceDamage = 1;
    this.turnDivider = 50;
}

/**
 * Checks whether or not the enemy is a boss
 *
 * @returns {boolean} true if a boss, false otherwise
 */
Enemy.prototype.isBoss = function() {
    return this.rank == STAT.BOSS || this.rank == STAT.DRAGON;
};

/**
 * Adds a weapon to the enemy for a given attack pattern
 *
 * @param {function} weapon  - the weapon function
 * @param {object}   data    - the weapon data set
 * @param {number}   pattern - the attack pattern ID
 */
Enemy.prototype.addWeapon = function(weapon, data, pattern) {
    if (pattern === undefined) pattern = 0;

    data.method = weapon.bind(this);
    data.list = gameScreen.enemyManager.bullets;
    data.cd = 0;
    while (this.patterns[pattern] === undefined) this.patterns.push([]);
    this.patterns[pattern].push(data);
};

/**
 * Sets a range of the enemy for a given attack pattern
 *
 * @param {number} pattern - the attack pattern ID
 * @param {number} range   - the movement pattern function
 */
Enemy.prototype.setRange = function(pattern, range) {
    this.ranges[pattern] = range;
};

/**
 * Sets the movement pattern of the enemy for a given attack pattern
 *
 * @param {number}   pattern  - the attack pattern ID
 * @param {function} movement - the movement pattern function
 */
Enemy.prototype.setMovement = function(pattern, movement) {
    this.movements[pattern] = movement;
};

/**
 * Switches to a random attack pattern
 */
Enemy.prototype.switchPattern = function() {
    this.pattern = rand(this.patterns.length);
    this.range = this.ranges[this.pattern] || this.range;
    this.movement = this.movements[this.pattern] || this.ApplyMove;
    this.patternTimer = rand(this.patternMin, this.patternMax - this.patternMin);
};

/**
 * Updates the enemy
 */
Enemy.prototype.onUpdate = function() {

    // Pattern switching
    if (this.patterns.length > 1) {
        this.patternTimer--;
        if (this.patternTimer <= 0) {
            this.switchPattern();
        }
    }

    // Apply weapons
    var i;
    for (i = 0; i < this.patterns[this.pattern].length; i++) {
        this.patterns[this.pattern][i].method(this.patterns[this.pattern][i]);
    }

    // Apply movement
    if (this.movement) {
        this.movement();
    }

    // Move away from other enemies
    /*
    if (!this.isBoss()) {
        if (gameScreen.enemyManager.enemies.length > 0) {
            for (i = 0; i < gameScreen.enemyManager.enemies.length; i++) {
                var enemy = gameScreen.enemyManager.enemies[i];
                if (DistanceSq(this.x, this.y, enemy.x, enemy.y) < Sq(this.sprite.width) && DistanceSq(this.x, this.y, enemy.x, enemy.y) > 0) {
                    if (this.sin * (enemy.x - this.x) - this.cos * (enemy.y - this.y) > 0) {
                        this.x -= this.speed * this.sin / 2;
                        this.y += this.speed * this.cos / 2;
                        break;
                    }
                    else {
                        this.x += this.speed * this.sin / 2;
                        this.y -= this.speed * this.cos / 2;
                        break;
                    }
                }
            }
        }
    }

    this.clamp();
    */
};

/**
 * Checks whether or not the enemy is in range of a player to fire their weapon
 *
 * @param {number} range - weapon range
 *
 * @returns {boolean} true if in range, false otherwise
 */
Enemy.prototype.isInRange = function(range) {
    var player = playerManager.getClosest(this.pos);
    var d = this.pos.clone().subtractv(player.pos);
    return player.health > 0 && d.lengthSq() < sq(range + this.speed) && this.forward().dot(d) >= 0;
};

/**
 * Sets the killer of the enemy upon taking damage
 *
 * @param {number} amount - the amount of damage to deal
 * @param {Robot}  source - the source of the damage
 */
Enemy.prototype.onDamaged = function(amount, source) {
    if (amount > 0) this.killer = source;
};
