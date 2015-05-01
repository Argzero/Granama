/**
 * An controls type for keyboard and mouse
 */
function NetworkInput() {
    this.data = {};
    this.valid = true;
    this.ability = false;
    this.abilityPending = 0;
    
    this.dir = new Vector(0, 0);
    this.look = new Vector(0, 1);
}

/**
 * Updates the controls data
 */
NetworkInput.prototype.update = function() { 
    this.ability = this.abilityPending > 0;
    if (this.abilityPending > 0) {
        this.abilityPending--;    
    }
};

/**
 * Checks the state of a mapped button value
 *
 * @param {string} key - button value key
 *
 * @returns {number} number of updates it has been pressed
 */
NetworkInput.prototype.button = function(key) {
    return (key == SKILL && this.ability) ? 1 : 0;
};

/**
 * Checks the state of a mapped axis value
 *
 * @param {string} key - axis value key
 * @param {Transform} target - target the input is controlling
 *
 * @returns {number} the current direction the axis is pointing
 */
NetworkInput.prototype.axis = function(key, target) {
    return 0;
};

/**
 * Checks the state of a mapped direction value
 *
 * @param {string}    key    - direction value key
 * @param {Transform} target - target the input is controlling
 *
 * @return {Vector} the current direction being pointed at
 */
NetworkInput.prototype.direction = function(key, target) {
    return key == MOVE ? this.dir.clone() : this.look.clone().rotate(0, 1);
};

/**
 * Waits to apply the player's ability until the next frame
 */
NetworkInput.prototype.applyAbility = function() {
    this.abilityPending++;
};