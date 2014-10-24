var keysDown = new Array(false, false, false, false, false, false, false, false, false, false, false, false);
var mouseX = 0, mouseY = 0, mx, my;
var gamepads = (navigator.getGamepads ? navigator.getGamepads() : undefined);

// Key down event
document.addEventListener('keydown', function(event) {
    var index = KeyCodeToIndex(event.keyCode);
    if (index != KEY_UNUSED) {
        keysDown[index] = true;
    }
});

// Key up event
document.addEventListener('keyup', function(event) {
    var index = KeyCodeToIndex(event.keyCode);
    if (index != KEY_UNUSED) {
        keysDown[index] = false;
    }
});

if (gamepads) {
    
    // Gamepad connected
    window.addEventListener('gamepadconnected', function(e) {
        console.log("Pad connected at index "  + e.gamepad.index + " and ID " + e.gamepad.id);
        gamepads[e.gamepad.index] = e.gamepad;
    });

    // Gamepad disconnected
    window.addEventListener('gamepaddisconnected', function(e) {
        console.log("Pad disconnected at index " + e.gamepad.index);
        gamepads[e.gamepad.index] = undefined;
    });
}

// Updates the mouse according to the client mouse position
document.addEventListener('mousemove', function(e) {
    e = e || event;
    mx = e.pageX - e.target.offsetLeft;
    my = e.pageY - e.target.offsetTop;
    /*
    // Firefox/Chrome
    if (event) {
        mx = event.clientX;
        my = event.clientY;
    }
    
    // IE
    else {
        mx = window.event.clientX;
        my = window.event.clientY;
    }
    */
});

// Tells when the mouse button is no longer pressed
function MouseUp() {
    keysDown[KEY_LMB] = false;
}

// Tells when the mouse button is now pressed
function MouseDown() {
    keysDown[KEY_LMB] = true;
}

// Checks whether or not the key is pressed
// key - the key to check for
function KeyPressed(key) {
    return keysDown[key];
}

// Converts a key code to an array index for storage
// keyCode - the code of the key to convert
function KeyCodeToIndex(keyCode) {
    switch(keyCode) {
        case 87: return KEY_W;
        case 65: return KEY_A;
        case 68: return KEY_D;
        case 83: return KEY_S;
		case 32: return KEY_SPACE;
        case 27: return KEY_ESC;
		case 38: return KEY_UP;
		case 40: return KEY_DOWN;
		case 37: return KEY_LEFT;
		case 39: return KEY_RIGHT;
		case 13: return KEY_ENTER;
        default: return KEY_UNUSED;
    }
}