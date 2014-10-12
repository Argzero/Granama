// Base object for player input
function PlayerInput(confirmButtonName) {
    return {
    
        // Fields
        movement: Vector(0, 0),
        direction: Vector(0, 1),
        shoot: false,
        ability: false,
        confirm: false,
        pause: false,
        locked: false,
        valid: true,
        confirmButtonName: confirmButtonName,
        player: undefined,
        
        
        // Base update for controls
        updateBase: inputFunctions.updateBase,
        setPlayer: inputFunctions.setPlayer
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

    // Base update for player input
    updateBase: function() {
        if (this.movement.LengthSq() == 0 && !this.pause && !this.confirm) {
            this.locked = false;
        }
        if (this.locked) {
            this.pause = false;
            this.confirm = false;
            this.movement.x = 0;
            this.movement.y = 0;
        }
    },
    
    // Updates for keyboard input
    updateStandard: function() {
        
        // Weapons
        this.ability = KeyPressed(KEY_SPACE);
        this.shoot = KeyPressed(KEY_LMB);
        this.pause = KeyPressed(KEY_ESC);
        this.confirm = this.ability;
        
        // Movement
        var hor = KeyPressed(KEY_D) != KeyPressed(KEY_A);
        var vert = KeyPressed(KEY_W) != KeyPressed(KEY_S);
        this.movement.x = this.movement.y = 0;
        if (KeyPressed(KEY_W)) {
            this.movement.y -= (hor ? HALF_RT_2 : 1);
        }
        if (KeyPressed(KEY_S)) {
            this.movement.y += (hor ? HALF_RT_2 : 1);
        }
        if (KeyPressed(KEY_A)) {
            this.movement.x -= (vert ? HALF_RT_2 : 1);
        }
        if (KeyPressed(KEY_D)) {
            this.movement.x += (vert ? HALF_RT_2 : 1);
        }
        
        // Direction
        if (this.player && (mouseX != this.player.x || mouseY != this.player.y)) {
            this.direction.x = mouseX - this.player.x;
            this.direction.y = mouseY - this.player.y;
            this.direction.SetLength(1);
        }
        
        this.updateBase();
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
        this.ability = gamepad.buttons[6].value >= 0.1;
        this.shoot = gamepad.buttons[7].value >= 0.1;
        this.confirm = gamepad.buttons[9].value == 1;
        this.pause = this.confirm;
        
        // Movement
        this.movement.x = gamepad.axes[0];
        this.movement.y = gamepad.axes[1];
        if (Math.abs(this.movement.x) < 0.2 && Math.abs(this.movement.y) < 0.2) {
            this.movement.x = this.movement.y = 0;
        }
        
        // Direction
        if (this.player && (Math.abs(gamepad.axes[2]) > 0.2 || Math.abs(gamepad.axes[3]) > 0.2)) {
            this.direction.x = gamepad.axes[2];
            this.direction.y = gamepad.axes[3];
            this.direction.SetLength(1);
        }
        
        this.updateBase();
    }
};