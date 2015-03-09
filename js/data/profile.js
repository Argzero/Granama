// The key which profile data is saved to
var PROFILE_DATA_KEY = 'profiles';

// The serializable object representation of profile data
var PROFILE_DATA = {};

depend('data/io', function() { PROFILE_DATA = io.getObject(PROFILE_DATA_KEY) || {}; });

// Available stats
var STAT = {

    TOTAL_KILLS   : 'kills',
    TOTAL_DEATHS  : 'deaths',
    TOTAL_RESCUES : 'rescues',
    TOTAL_DEALT   : 'dealt',
    TOTAL_TAKEN   : 'taken',
    TOTAL_ABSORBED: 'absorbed',
    TOTAL_EXP     : 'exp',

    MOST_KILLS   : 'mKills',
    MOST_DEATHS  : 'mDeaths',
    MOST_RESCUES : 'mRescues',
    MOST_DEALT   : 'mDealt',
    MOST_TAKEN   : 'mTaken',
    MOST_ABSORBED: 'mAbsorbed',

    LAST_10      : 'last',
    BEST_SCORE   : 'score',
    HIGHEST_LEVEL: 'level',
    LIGHT        : 'light',
    HEAVY        : 'heavy',
    MINIBOSS     : 'miniboss',
    BOSS         : 'boss',
    DRAGON       : 'dragon',
    HYDRA        : 'hydra',
    GAMES        : 'games'
}

// Update profile data before exiting
window.addEventListener('beforeunload', function() {
    if (gameScreen.isPlaying) {
        for (var i = 0; i < players.length; i++) {
            players[i].submitStats();
        }
    }
    io.setObject(PROFILE_DATA_KEY, PROFILE_DATA);
});

/**
 * Handles managing the data for a profile
 *
 * @param {string} name - the name of the profile to manage
 *
 * @constructor
 */
function Profile(name) {
    if (PROFILE_DATA[name] === undefined) {
        PROFILE_DATA[name] = {};
    }
    
    // Profile data
    this.name = name;
    this.data = PROFILE_DATA[name];
}

/**
 * Adds to a cumulative stat in the profile data
 *
 * @param {string} name   - name of the robot to set the stat for
 * @param {string} stat   - the key of the stat to add to
 * @param {Number} amount - the amount to add to the stat
 */
Profile.prototype.addStat = function(name, stat, amount) {

    // Overall stat
    if (!this.data[stat]) {
        this.data[stat] = amount;
    }
    else {
        this.data[stat] += amount;
    }

    // Stat for the robot
    if (!this.data[name]) {
        this.data[name] = {};
    }
    if (!this.data[name][stat]) {
        this.data[name][stat] = amount;
    }
    else {
        this.data[name][stat] += amount;
    }
};

/**
 * Adds a value to a list with a set capacity
 *
 * @param {string} name   - the name of the robot to set the stat for
 * @param {string} stat   - the key of the stat to set
 * @param {Number} max    - the most amount of entries the list can hold
 * @param {Number} amount - the new stat value
 */
Profile.prototype.addList = function(name, stat, max, amount) {

    // Overall stat
    if (!this.data[stat]) {
        this.data[stat] = [amount];
    }
    else {
        var arr = this.data[stat];
        arr.unshift(amount);
        if (arr.length > max) {
            arr.pop();
        }
    }

    // Robot stat
    if (!this.data[name]) {
        this.data[name] = {};
    }
    if (!this.data[name][stat]) {
        this.data[name][stat] = [amount];
    }
    else {
        var arr = this.data[name][stat];
        arr.unshift(amount);
        if (arr.length > max) {
            arr.pop();
        }
    }
};

/**
 * Sets a stat if it is higher than the previous record
 *
 * @param {string} name   - the name of the robot to set the stat for
 * @param {string} stat   - the stat key to set
 * @param {Number} amount - the new value for the stat
 */
Profile.prototype.setBest = function(name, stat, amount) {

    // Overall stat
    var current = this.getStat(stat);
    if (amount > current) {
        this.data[stat] = amount;
    }

    // Robot stat
    var current = this.getRobotStat(name, stat);
    if (amount > current) {
        if (!this.data[name]) {
            this.data[name] = {};
        }
        this.data[name][stat] = amount;
    }
};

/**
 * Retrieves a stat from the profile data
 *
 * @param {string} stat - key for the stat to retrieve
 *
 * @returns {Number} the found stat value or 0 if not found
 */
Profile.prototype.getStat = function(stat) {
    if (this.data[stat]) {
        return this.data[stat];
    }
    else {
        return 0;
    }
};

/**
 * Retrieves a stat from the profile data for the robot type
 *
 * @param {string} name - name of the robot type
 * @param {string} stat - key for the stat to retrieve
 *
 * @returns {Number} the found stat value or 0 if not found
 */
Profile.prototype.getRobotStat = function(name, stat) {
    if (this.data[name] && this.data[name][stat]) {
        return this.data[name][stat];
    }
    else {
        return 0;
    }
};