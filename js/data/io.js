/**
 * The helper for getting/saving user data to the local storage.
 * The available methods will not do anything if localStorage is
 * not supported on the current browser and return values will 
 * all be undefined.
 */
io = {

    // Whether or not the storage is enabled
    enabled: typeof(Storage) !== 'undefined',

    /**
     * Sets a value to the local storage if enabled
	 *
	 * @param {string} key   - the unique identifier to store the value under
	 * @param {Object} value - the value to store under the key
	 */
    set: function(key, value) {
        if (this.enabled) {
            localStorage.setItem(key, value);
        }
    },

    /**
     * Sets an object to the local storage if enabled
	 *
	 * @param {string} key - the unique identifier to store the value under
	 * @param {Object} value - the value to store under the key as serialized JSON
	 */
    setObject: function(key, value) {
        if (this.enabled) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    },

	/**
     * Retrieves an object from the local storage
	 *
	 * @param {string} key - the unique identifier the value is stored under
	 * 
	 * @returns {Object} the retrieved object value
	 */
    get: function(key) {
        if (this.enabled) {
            return localStorage[key];
        }
    },

    /**
     * Retrieves an object from the local storage that was stored as 
	 * a serialized JSON string
	 *
	 * @param {string} key - the unique identifier the value is stored under
	 * 
	 * @returns {Object} the retrieved deserialized object value
	 */
    getObject: function(key) {
        if (this.enabled) {
            var data = localStorage[key];
            if (data) {
                return JSON.parse(data);
            }
        }
    },

	/**
     * Retrieves a number from the local storage
	 *
	 * @param {string} key - the unique identifier the value is stored under
	 * 
	 * @returns {number} the retrieved number value
	 */
    getNum: function(key) {
        if (this.enabled && localStorage[key]) {
            return Number(localStorage[key]);
        }
        else return 0;
    }
};