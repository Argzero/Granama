// Base object for player input
function PlayerInput(confirmButtonName) {
    return {
    
        // Fields
        movement: Vector(0, 0),
        direction: Vector(0, 1),
        
        up: 0,
        down: 0,
        right: 0,
        left: 0,
        
        ability: 0,
        cancel: 0,
        confirm: 0,
        pause: 0,
        shoot: 0,
        
        valid: true,
        confirmButtonName: confirmButtonName,
        player: undefined,
        
        
        // Base update for controls
        setPlayer: inputFunctions.setPlayer,
        checkKey: inputFunctions.checkKey,
        checkButton: inputFunctions.checkButton
    };
};

// Keyboard/mouse input
function StandardInput() {
    var obj = PlayerInput('Spacebar');
    
    obj.update = inputFunctions.updateStandard;
    return obj;
};

// Gamepad input
function GamepadInput(id) {
    var obj = PlayerInput('Start');
    obj.id = id;
    
    obj.update = inputFunctions.updateGamepad;
    return obj;
};

// Functions for inputs
var inputFunctions = {

    // Sets the player of the input
    setPlayer: function(player) {
        this.player = player;
    },
    
    // Checks a key for input
    checkKey: function(key, property) {
        if (KeyPressed(key)) this[property]++;
        else this[property] = 0;
    },
    
    // Checks a gamepad button for input
    checkButton: function(gamepad, buttonId, property) {
        if (gamepad.buttons[buttonId].value >= 0.1) {
			this[property]++;
		}
        else this[property] = 0;
    },
    
    // Updates for keyboard input
    updateStandard: function() {
        
        // Weapons
        this.checkKey(KEY_SPACE, 'ability');
        this.checkKey(KEY_ESC, 'cancel');
        this.checkKey(KEY_ENTER, 'confirm');
        this.checkKey(KEY_ESC, 'pause');
        this.checkKey(KEY_LMB, 'shoot');
        
        // Movement
		var up = KeyPressed(KEY_W) || KeyPressed(KEY_UP);
		var down = KeyPressed(KEY_S) || KeyPressed(KEY_DOWN);
		var left = KeyPressed(KEY_A) || KeyPressed(KEY_LEFT);
		var right = KeyPressed(KEY_D) || KeyPressed(KEY_RIGHT);
        var hor = left != right;
        var vert = up != down;
        this.movement.x = this.movement.y = 0;
        if (up) {
            this.up++;
            this.movement.y -= (hor ? HALF_RT_2 : 1);
        }
        else this.up = 0;
        if (down) {
            this.down++;
            this.movement.y += (hor ? HALF_RT_2 : 1);
        }
        else this.down = 0;
        if (left) {
            this.left++;
            this.movement.x -= (vert ? HALF_RT_2 : 1);
        }
        else this.left = 0;
        if (right) {
            this.right++;
            this.movement.x += (vert ? HALF_RT_2 : 1);
        }
        else this.right = 0;
        
        // Direction
        if (this.player && (mouseX != this.player.x || mouseY != this.player.y)) {
            this.direction.x = mouseX - this.player.x;
            this.direction.y = mouseY - this.player.y;
            this.direction.SetLength(1);
        }
    },
    
    // Updates for gamepad input
    updateGamepad: function() {
        
        // Get the gamepad to read from
        var gamepads = navigator.getGamepads();
        var gamepad = gamepads[this.id];
        if (gamepad === undefined) {
            this.valid = false;
            return;
        }
        else this.valid = true;
        
        // Weapons
        this.checkButton(gamepad, 6, 'ability');
        this.checkButton(gamepad, 1, 'cancel');
        this.checkButton(gamepad, 0, 'confirm');
        this.checkButton(gamepad, 9, 'pause');
        this.checkButton(gamepad, 7, 'shoot');
        
        // Movement
        this.movement.x = gamepad.axes[0];
        this.movement.y = gamepad.axes[1];
        if (Math.abs(this.movement.x) < 0.2 && Math.abs(this.movement.y) < 0.2) {
            this.movement.x = this.movement.y = 0;
        }
        if (this.movement.x > 0.2) this.right++;
        else this.right = 0;
        if (this.movement.x < -0.2) this.left++;
        else this.left = 0;
        if (this.movement.y > 0.2) this.down++;
        else this.down = 0;
        if (this.movement.y < -0.2) this.up++;
        else this.up = 0;
        
        // Direction
        if (this.player && (Math.abs(gamepad.axes[2]) > 0.2 || Math.abs(gamepad.axes[3]) > 0.2)) {
            this.direction.x = gamepad.axes[2];
            this.direction.y = gamepad.axes[3];
            this.direction.SetLength(1);
        }
    }
};