// The helper for getting/saving user data
userData = {

    // Whether or not the storage is enabled
    enabled  : typeof(Storage) !== 'undefined',

    // Sets a value to the local storage if enabled
    set      : function(key, value) {
        if (this.enabled) {
            localStorage.setItem(key, value);
        }
    },

    // Sets an object to the local storage if enabled
    setObject: function(key, value) {
        if (this.enabled) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    },

    // Gets a value from the local storage if enabled
    get      : function(key) {
        if (this.enabled) {
            return localStorage[key];
        }
    },

    // Gets an object from the local storage if enabled
    getObject: function(key) {
        if (this.enabled) {
            var data = localStorage[key];
            if (data) {
                return JSON.parse(data);
            }
        }
    },

    // Gets a number value from the local storage if enabled
    getNum   : function(key) {
        if (this.enabled && localStorage[key]) {
            return Number(localStorage[key]);
        }
        else return 0;
    }
};