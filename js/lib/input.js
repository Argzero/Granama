depend('lib/math');
depend('lib/2d/vector');

//var IS_FIREFOX = typeof InstallTrigger !== 'undefined';

var controls = {

    GAMEPADS_SUPPORTED: navigator.getGamepads !== undefined,

    KEY_UNUSED   : -1,

    // Letter keys
    KEY_A: 65, KEY_B: 66, KEY_C: 67, KEY_D: 68, KEY_E: 69,
    KEY_F: 70, KEY_G: 71, KEY_H: 72, KEY_I: 73, KEY_J: 74,
    KEY_K: 75, KEY_L: 76, KEY_M: 77, KEY_N: 78, KEY_O: 79,
    KEY_P: 80, KEY_Q: 81, KEY_R: 82, KEY_S: 83, KEY_T: 84,
    KEY_U: 85, KEY_V: 86, KEY_W: 87, KEY_X: 88, KEY_Y: 89,
    KEY_Z: 90,

    // Number keys
    KEY_0: 48, KEY_1: 49, KEY_2: 50, KEY_3: 51, KEY_4: 52,
    KEY_5: 53, KEY_6: 54, KEY_7: 55, KEY_8: 56, KEY_9: 57,

    // Arrow keys
    KEY_LEFT: 37, KEY_UP: 38, KEY_RIGHT: 39, KEY_DOWN: 40, KEY_DEL: 46,

    // Special keys
    KEY_BACK: 8,   KEY_TAB: 9,      KEY_ENTER: 13, KEY_SHIFT: 16,
    KEY_CTRL: 17,  KEY_ALT: 18,     KEY_ESC: 27,   KEY_SPACE: 32,
    KEY_PG_UP: 33, KEY_PG_DOWN: 34,

    // Mouse buttons
    MOUSE_LEFT: 998, MOUSE_RIGHT: 999,

    // Gamepad buttons
    BUTTON_DOWN: 0,    BUTTON_RIGHT: 1,   BUTTON_LEFT: 2,    BUTTON_UP: 3,
    BUTTON_LB: 4,      BUTTON_RB: 5,      BUTTON_LT: 6,      BUTTON_RT: 7,
    BUTTON_SELECT: 8,  BUTTON_START: 9,   BUTTON_LS: 10,     BUTTON_RS: 11,
    BUTTON_D_UP: 12,   BUTTON_D_DOWN: 13, BUTTON_D_LEFT: 14, BUTTON_D_RIGHT: 15,
    BUTTON_CENTER: 16,

    // Gamepad axes
    AXIS_LX: 0, AXIS_LY: 1,
    AXIS_RX: 2, AXIS_RY: 3,
    
    AXIS_LXP: 100, AXIS_LXN: 101, AXIS_LYP: 102, AXIS_LYN: 103,
    AXIS_RXP: 104, AXIS_RXN: 105, AXIS_RYP: 106, AXIS_RYN: 107,

    // Mapping data
    mapping: {
        button: {},
        axis  : {},
        dir   : {}
    },

    // Enabled data
    enabled: {
        key   : {},
        mouse : {},
        button: {},
        axis  : {}
    },

    // Current keys down
    keysDown: [],

    // The mouse data
    mouse: { x: 0, y: 0, ox: 0, oy: 0, left: false, right: false, xOffset: 0, yOffset: 0 },
	
	/**
	 * Sets the offset for the input updates to convert screen coordinates to
	 * game world coordinates while determining mouse position
	 *
	 * @param {Number} x - horizontal offet
	 * @param {Number} y - vertical offset
	 */
	setOffset: function(x, y) {
		this.mouse.ox = this.mouse.x - x;
		this.mouse.oy = this.mouse.y - y;
		this.mouse.xOffset = x;
		this.mouse.yOffset = y;
	},

    /**
     * Checks whether or not a key is currently pressed
     *
     * @param {number} keyId - the ID of the key to check
     *
     * @returns {boolean} true if pressed, false otherwise
     */
    keyPressed: function(keyId) {
        return this.keysDown[keyId];
    },

    /**
     * Maps a basic button press
     *
     * @param {string} key      - the access key for the control
     * @param {number} keyId    - the ID of the keyboard key to map
     * @param {number} buttonId - the ID of the gamepad button to map
     */
    mapButton: function(key, keyId, buttonId) {
        this.mapping.button[key] = {key: keyId, button: buttonId};
        this.enabled.key[keyId] = true;
        this.enabled.button[buttonId] = true;
    },

    /**
     * Maps a directional axis using the mouse's relative position
     *
     * @param {string} key    - the access key for the control
     * @param {number} axisId - the ID of the gamepad axis to map
     */
    mapAxisMouse: function(key, axisId) {
        this.mapping.axis[key] = {obj: true, axis: axisId};
        this.enabled.axis[axisId] = true;
    },

    /**
     * Maps a directional axis using multiple keyboard keys
     *
     * @param {string} key    - the access key for the control
     * @param {number} keyId1 - the ID of the negative keyboard key to map
     * @param {number} keyId2 - the ID of the positive keyboard key to map
     * @param {number} axisId - the ID of the gamepad axis to map
     */
    mapAxisKey: function(key, keyId1, keyId2, axisId) {
        this.mapping.axis[key] = {key1: keyId1, key2: keyId2, axis: axisId};
        this.enabled.axis[axisId] = true;
        this.enabled.key[keyId1] = true;
        this.enabled.key[keyId2] = true;
    },

    /**
     * Maps a directional axis using the mouse's relative position
     *
     * @param {string}  key     - the access key for the control
     * @param {boolean} mouseX  - whether or not to use the horizontal relative position
     * @param {number}  axisId1 - the ID of the gamepad axis to map horizontally
     * @param {number}  axisId2 - the ID of the gamepad axis to map vertically
     */
    mapDirectionMouse: function(key, mouseX, axisId1, axisId2) {
        this.mapping.axis[key] = {obj: true, x: mouseX, axis1: axisId1, axis2: axisId2};
        this.enabled.axis[axisId1] = true;
        this.enabled.axis[axisId2] = true;
    },

    /**
     * Maps a directional axis using multiple keyboard keys
     *
     * @param {string} key    - the access key for the control
     * @param {number} keyId1 - the ID of the negative horizontal keyboard key to map
     * @param {number} keyId2 - the ID of the positive horizontal keyboard key to map
     * @param {number} keyId3 - the ID of the negative vertical keyboard key to map
     * @param {number} keyId4 - the ID of the positive vertical keyboard key to map
     * @param {number} axisId1 - the ID of the gamepad axis to map horizontally
     * @param {number} axisId2 - the ID of the gamepad axis to map vertically
     */
    mapDirectionKey: function(key, keyId1, keyId2, keyId3, keyId4, axisId1, axisId2) {
        this.mapping.axis[key] = {
            key1 : keyId1,
            key2 : keyId2,
            key3 : keyId3,
            key4 : keyId4,
            axis1: axisId1,
            axis2: axisId2
        };
        this.enabled.axis[axisId1] = true;
        this.enabled.axis[axisId2] = true;
        this.enabled.key[keyId1] = true;
        this.enabled.key[keyId2] = true;
        this.enabled.key[keyId3] = true;
        this.enabled.key[keyId4] = true;
    },
    
    /**
     * Checks whether or not the mouse is currently hovered over the given rectangle
     *
     * @param {Number} x - the horizontal coordinate of the left edge
     * @param {Number} y - the vertical coordinate of the top edge
     * @param {Number} w - the width of the rectangle
     * @param {Number} h - the height of the rectangle
     *
     * @returns {boolean} true if the mouse is over the rectangle, false otherwise
     */ 
    isMouseOver: function(x, y, w, h) {
        return this.mouse.ox >= x && this.mouse.ox <= x + w && this.mouse.oy >= y && this.mouse.oy <= y + h;
    }
};

/**
 * An controls type for keyboard and mouse
 */
function KeyboardInput() {
    this.data = {};
    this.valid = true;
}

/**
 * Updates the controls data
 */
KeyboardInput.prototype.update = function() {
    var x;

    // Keyboard keys
    for (x in controls.enabled.key) {
        if (controls.keyPressed(x)) {
            if (this.data[x]) this.data[x]++;
            else this.data[x] = 1;
        }
        else if (x < 900) this.data[x] = 0;
    }

    // Left mouse button
    if (controls.mouse.left) {
        if (this.data[controls.MOUSE_LEFT]) this.data[controls.MOUSE_LEFT]++;
        else this.data[controls.MOUSE_LEFT] = 1;
    }
    else this.data[controls.MOUSE_LEFT] = 0;

    // Right mouse button
    if (controls.mouse.right) {
        if (this.data[controls.MOUSE_RIGHT]) this.data[controls.MOUSE_RIGHT]++;
        else this.data[controls.MOUSE_RIGHT] = 1;
    }
    else this.data[controls.MOUSE_RIGHT] = 0;
};

/**
 * Checks the state of a mapped button value
 *
 * @param {string} key - button value key
 *
 * @returns {number} number of updates it has been pressed
 */
KeyboardInput.prototype.button = function(key) {
    var mapping = controls.mapping.button[key];
    if (!mapping) return 0;
    else if (this.data[mapping.key]) return this.data[mapping.key];
    else return 0;
};

/**
 * Checks the state of a mapped axis value
 *
 * @param {string} key - axis value key
 * @param {Transform} target - target the input is controlling
 *
 * @returns {number} the current direction the axis is pointing
 */
KeyboardInput.prototype.axis = function(key, target) {
    var mapping = controls.mapping.axis[key];
    if (!mapping) return 0;
    else if (mapping.obj) {
        if (mapping.x) return controls.mouse.ox > target.pos.x ? 1 : -1;
        else return controls.mouse.oy > target.pos.y ? 1 : -1;
    }
    else return (controls.keyPressed(mapping.key1) ? -1 : 0) + (controls.keyPressed(mapping.key2) ? 1 : 0);
}

/**
 * Checks the state of a mapped direction value
 *
 * @param {string}    key    - direction value key
 * @param {Transform} target - target the input is controlling
 *
 * @return {Vector} the current direction being pointed at
 */
KeyboardInput.prototype.direction = function(key, target) {
    var mapping = controls.mapping.axis[key];
    if (!mapping) return new Vector(0, 0);
    else if (mapping.obj) {
        return new Vector(controls.mouse.ox - target.pos.x, controls.mouse.oy - target.pos.y).normalize();
    }
    else {
        var x = (controls.keyPressed(mapping.key1) ? -1 : 0) + (controls.keyPressed(mapping.key2) ? 1 : 0);
        var y = (controls.keyPressed(mapping.key3) ? -1 : 0) + (controls.keyPressed(mapping.key4) ? 1 : 0);
        return new Vector(x, y).normalize();
    }
};

/**
 * An controls type for keyboard and mouse
 *
 * @constructor
 */
function GamepadInput(index) {
    this.data = {};
    this.valid = navigator.getGamepads()[index];
    this.index = index;
}

/**
 * Updates the controls data
 */
GamepadInput.prototype.update = function() {
    this.valid = navigator.getGamepads()[this.index];
    if (!this.valid) return;

    var x;

    // Gamepad buttons
    for (x in controls.enabled.button) {
        if (this.valid.buttons) {
            if (this.data[x]) this.data[x]++;
            else this.data[x] = 1;
        }
        else this.data[x] = 0;
    }
};

/**
 * Checks the state of a mapped button value
 *
 * @param {string} key - button value key
 *
 * @returns {number} number of updates it has been pressed
 */
GamepadInput.prototype.button = function(key) {
    if (!this.valid) return 0;
    var mapping = controls.mapping.button[key];
    if (mapping === undefined) return 0;
    else if (mapping >= 100) {
        var p = mapping % 2 == 0;
        return (this.data[Math.floor(mapping.key - 100) / 2] > 0) == p;
    }
    else if (this.data[mapping.key]) return this.data[mapping.key];
    else return 0;
};

/**
 * Checks the state of a mapped axis value
 *
 * @param {string} key - axis value key
 *
 * @returns {number} the current direction the axis is pointing
 */
GamepadInput.prototype.axis = function(key) {
    if (!this.valid) return 0;
    var mapping = controls.mapping.axis[key];
    if (!mapping) return 0;
    else return this.valid.axis[mapping.axisId];
};

/**
 * Checks the state of a mapped direction value
 *
 * @param {string} key - direction value key
 *
 * @return {Vector} the current direction being pointed at
 */
GamepadInput.prototype.direction = function(key) {
    if (!this.valid) return 0;
    var mapping = controls.mapping.axis[key];
    if (!mapping) return new Vector(0, 0);
    else return new Vector(this.valid.axis[mapping.axis1], this.valid.axis[mapping.axis2]).normalize();
};

// Mouse down event
window.addEventListener('mousedown', function(e) {
    if (e.which == 1) controls.mouse.left = true;
    else if (e.which == 3) controls.mouse.right = true;
});

// Mouse up event
window.addEventListener('mouseup', function(e) {
    if (e.which == 1) controls.mouse.left = false;
    else if (e.which == 3) controls.mouse.right = false;
});

// Mouse move event
window.addEventListener('mousemove', function(event) {
    controls.mouse.x = event.pageX - event.target.offsetLeft;
    controls.mouse.y = event.pageY - event.target.offsetTop;
	controls.mouse.ox = controls.mouse.x - controls.mouse.xOffset;
	controls.mouse.oy = controls.mouse.y - controls.mouse.yOffset;
});

// Mouse out event
window.addEventListener('mouseout', function(event) {
    controls.mouse.x = controls.mouse.y = controls.mouse.ox = controls.mouse.oy = -999;
    controls.mouse.left = controls.mouse.right = false;
});

// Key down event
window.addEventListener('keydown', function(event) {
    controls.keysDown[event.keyCode] = true;
});

// Key up event
window.addEventListener('keyup', function(event) {
    controls.keysDown[event.keyCode] = false;
});
