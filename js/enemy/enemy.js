depend('weapon/weapons');

/**
 * An enemy robot in the game
 *
 * @param {string} name         - name of the enemy sprite image
 * @param {number} x            - initial horizontal position
 * @param {number} y            - initial vertical position
 * @param {number} health       - max health
 * @param {number} speed        - movement speed
 * @param {number} range        - attack range
 * @param {number} exp          - experience yield
 * @param {string} rank         - difficulty rank
 * @param {number} [patternMin] - minimum time between switching attack patterns
 * @param {number} [patternMax] - maximum time between switching attack patterns
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

// Experience constants
Enemy.LIGHT_EXP = 24;
Enemy.HEAVY_EXP = 36;
Enemy.MINIBOSS_EXP = 120;
Enemy.BOSS_EXP = 588;
Enemy.DRAGON_EXP = 1188;
Enemy.HYDRA_EXP = 8880;

// Experience constants
Enemy.LIGHT_ENEMY = '';
Enemy.HEAVY_ENEMY = '';
Enemy.MINIBOSS_ENEMY = '';
Enemy.BOSS_ENEMY = '';
Enemy.DRAGON_ENEMY = '';
Enemy.HYDRA_ENEMY = '';

/**
 * Exponential scaling formula
 *
 * @param {number} pow - power ratio
 *
 * @returns {number} the scale multiplier
 */
Enemy.pow = function(pow) {
    var score = enemyManager.bossCount;
    if (score > 4) {
        return Math.pow(2, pow * (2 + score / 2));
    }
    else {
        return Math.pow(2, pow * score);
    }
};

/**
 * Summation scaling formula
 *
 * @returns {number} the scale multiplier
 */
Enemy.sum = function() {
    var score = enemyManager.bossCount + 1;
    return (score / 2) * (score + 1);
};

/**
 * Checks whether or not the enemy is a boss
 *
 * @returns {boolean} true if a boss, false otherwise
 */
Enemy.prototype.isBoss = function() {
    return false;
};

/**
 * Adds a weapon to the enemy for a given attack pattern
 *
 * @param {function} weapon    - the weapon function
 * @param {object}   data      - the weapon data set
 * @param {number}   [pattern] - the attack pattern ID
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
    this.patternTimer = rand(this.patternMin, this.patternMax);
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
    if (!this.isBoss()) {
        if (enemyManager.enemies.length > 0) {
            for (i = 0; i < enemyManager.enemies.length; i++) {
                var enemy = enemyManager.enemies[i];
                var d = enemy.pos.clone().subtractv(this.pos);
                if (d.lengthSq() < Sq(this.sprite.width) && d.lengthSq() > 0) {
                    if (this.rotation.dot(d) > 0) {
                        this.pos.subtractv(this.rotation.clone().multiply(0.5, 0.5));
                        break;
                    }
                    else {
                        this.pos.addv(this.rotation.clone().multiply(0.5, 0.5));
                        break;
                    }
                }
            }
        }
    }

    this.clamp();
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
