/**
 * An enemy robot in the game
 *
 * @param {string} name         - name of the enemy sprite image
 * @param {number} x            - initial horizontal position
 * @param {number} y            - initial vertical position
 * @param {number} type         - Robot type ID of the enemy (should be Enemy.MOB)
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
function Enemy(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax) {
    this.super(name, x, y, type, health, speed);

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
    this.turnDivider = 50;
    this.points = 1;
}

// Experience constants
Enemy.LIGHT_EXP = 24;
Enemy.HEAVY_EXP = 36;
Enemy.MINIBOSS_EXP = 120;
Enemy.BOSS_EXP = 588;
Enemy.DRAGON_EXP = 1188;
Enemy.HYDRA_EXP = 8880;

// Experience constants
Enemy.LIGHT_ENEMY = 'light';
Enemy.HEAVY_ENEMY = 'heavy';
Enemy.MINIBOSS_ENEMY = 'miniboss';
Enemy.BOSS_ENEMY = 'boss';
Enemy.DRAGON_ENEMY = 'dragon';
Enemy.HYDRA_ENEMY = 'hydra';

// Experience data
Enemy.EXP_M = [1, 5 / 3, 9 / 4, 8 / 3, 35 / 12];
Enemy.EXP_DATA = [
    {value: 25, sprite: 'exp25'},
    {value: 10, sprite: 'exp10'},
    {value: 5, sprite: 'exp5'},
    {value: 3, sprite: 'exp3'},
    {value: 1, sprite: 'exp1'}
];

/**
 * Exponential scaling formula
 *
 * @param {number} pow - power ratio
 *
 * @returns {number} the scale multiplier
 */
Enemy.pow = function(pow) {
    var score = gameScreen.bossCount;
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
    var score = gameScreen.bossCount + 1;
    return (score / 2) * (score + 1);
};

/**
 * Checks whether or not the enemy is a boss
 *
 * @returns {boolean} true if a boss, false otherwise
 */
Enemy.prototype.isBoss = function() {
    return this.rank == Enemy.BOSS_ENEMY || this.rank == Enemy.DRAGON_ENEMY || this.rank == Enemy.HYDRA_ENEMY;
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
    if (this.patterns.length <= 1) return;
    this.pattern = rand(this.patterns.length);
    this.range = this.ranges[this.pattern] || this.range;
    this.movement = this.movements[this.pattern] || this.movement;
    this.patternTimer = rand(this.patternMin, this.patternMax);
};

/**
 * Updates the enemy
 */
Enemy.prototype.update = function() {
    this.updateRobot();
    
    // Blow up and give exp/points upon dying
    if (this.isDead || this.health <= 0) {
        this.destroy();
    }
    
    // Don't act when stunned
    if (this.isStunned()) {
        return;
    }

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
        //this.patterns[this.pattern][i].method(this.patterns[this.pattern][i]);
    }

    // Apply movement
    if (this.movement) {
        this.movement();
    }

    // Updates specific to enemies vs bosses
    this.subUpdate();

    // Clamp unless marked otherwise
    if (!this.ignoreClamp) {
        this.clamp();
    }
};

/**
 * Normal enemies move away from other enemies
 */
Enemy.prototype.subUpdate = function() {

    // Move away from other enemies
    if (gameScreen.enemyCount > 0) {
        for (i = 0; i < gameScreen.robots.length; i++) {
            var enemy = gameScreen.robots[i];
            var d = enemy.pos.clone().subtractv(this.pos);
            if (enemy.type == Robot.MOB && d.lengthSq() < sq(this.width) && d.lengthSq() > 0) {
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
};

/**
 * Checks whether or not the enemy is in range of a player to fire their weapon
 *
 * @param {number} range - weapon range
 *
 * @returns {boolean} true if in range, false otherwise
 */
Enemy.prototype.isInRange = function(range) {
    var player = getClosestPlayer(this.pos);
    if (!player) return false;
    var d = player.pos.clone().subtractv(this.pos);
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

/**
 * Destroys the enemy, granting points and dropping exp
 */
Enemy.prototype.destroy = function() {
    gameScreen.particles.push(new Explosion(this.pos.x, this.pos.y, this.width / 150));
    this.expired = true;
    this.dead = true;
    if (this.points) {
        var num = Math.round(this.exp * Enemy.EXP_M[players.length - 1]);
        num = Math.floor(num / players.length);
        gameScreen.spawnExp(this, num);
        if (connection.isHost) {
            gameScreen.score += this.points;
            connection.destroy(this.id, num);
        }
    }
};
