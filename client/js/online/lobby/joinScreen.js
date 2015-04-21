var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

JoinScreen.PARTS = {
    DISCONNECTED: 0,
    CONNECTED   : 1,
    PROFILE     : 2,
    NEW_PROFILE : 2.5,
    READY       : 3
};

function PlayerSettings(id) {
    this.id = id;
    this.robot = 0;
    this.ability = 0;
    this.frame = 0;
    this.profile = 0;
    this.user = '';
    this.pass = '';
    this.onUser = true;
    this.error = '';
    this.part = JoinScreen.PARTS.DISCONNECTED;
}

/**
 * The screen where local players join in before 
 * joining/creating a game lobby on the network.
 */
function JoinScreen() {

    this.frame = 0;
    this.settings = [];
    this.open = [];
    this.authID = -1;
    var i = 0;

    // Initialize player settings
    for (i = 0; i < players.length; i++) {
        this.settings.push(new PlayerSettings(i));
    }

    // Start off with all classes available
    for (i = 0; i < PLAYER_DATA.length; i++) {
        this.open.push(i);
    }
}

// Checks if a robot ID is still open
JoinScreen.prototype.isOpen = function(id) {
    for (var i = 0; i < this.open.length; i++) {
        if (id == this.open[i]) {
            return true;
        }
    }
    return false;
};

JoinScreen.prototype.prevPart = function(settings) {

    settings.part--;

    switch (settings.part) {

        // Make a profile available again when a player no longer selects it
        case JoinScreen.PARTS.PROFILE:
            settings.profile = 0;
            break;
    }
};

// Draws the selection gameScreen
JoinScreen.prototype.draw = function() {

    // Prevent IE bugs
    ui.ctx.setTransform(1, 0, 0, 1, 0, 0);
    ui.drawBackground();
    
    var cx = controls.mouse.x - ui.canvas.offsetLeft;
    var cy = controls.mouse.y - ui.canvas.offsetTop;

    ui.ctx.font = "70px Flipbash";

    // Draw the title box
    var x = ui.canvas.width / 2;
    var y = ui.canvas.height / 2;
    ui.ctx.fillStyle = "#484848";
    ui.ctx.fillRect(x - 395, y - 300, 790, 110);
    ui.ctx.fillStyle = "#000000";
    ui.ctx.fillRect(x - 385, y - 290, 770, 90);

    // Draw the title
    ui.ctx.fillStyle = "#FFFFFF";
    ui.ctx.textAlign = 'center';
    ui.ctx.textBaseline = 'top';
    ui.ctx.fillText("Choose A Robot", x, y - 300);

    var baseX = x - (players.length - 1) * 135;
    var i, j, k, dx, preview, robot;
    for (i = 0; i < players.length; i++) {

        x = baseX + 270 * i;
        var settings = this.settings[i];
        robot = PLAYER_DATA[settings.robot];

        // Draw the boxes for the options
        ui.ctx.fillStyle = '#484848';
        ui.ctx.fillRect(x - 125, y - 170, 250, 500);
        ui.ctx.fillStyle = settings.part == JoinScreen.PARTS.READY ? '#333' : '#000';
        ui.ctx.fillRect(x - 115, y - 160, 230, 480);

        // Input
        var input = players[i].input;
        input.update();

        // Valid/invalid input switches JoinScreen.PARTS
        if (input.valid && settings.part == JoinScreen.PARTS.DISCONNECTED) {
            settings.part = JoinScreen.PARTS.CONNECTED;
            settings.frame = 0;
        }
        else if (!input.valid) {
            settings.part = JoinScreen.PARTS.DISCONNECTED;
            settings.frame = 0;
        }

        // Display information based on the UI part the player is at
        switch (settings.part) {
        
            // Controller is disconnected and awaiting connection
            case JoinScreen.PARTS.DISCONNECTED:

                // Prompt to connect a controller
                ui.ctx.fillStyle = 'white';
                ui.ctx.font = '24px Flipbash';
                ui.ctx.textAlign = 'center';
                ui.ctx.fillText('Connect a', x, y);
                ui.ctx.fillText('controller...', x, y + 30);

                break;

            // Controller is connected and awaiting the player to join
            case JoinScreen.PARTS.CONNECTED:

                // Prompt to press a button to join
                ui.ctx.fillStyle = 'white';
                ui.ctx.font = '24px Flipbash';
                ui.ctx.textAlign = 'center';
                if (input.id === undefined) {
                    ui.ctx.fillText('Press "Space"', x, y);
                }
                else {
                    ui.ctx.fillText('Press "Start"', x, y);
                }
                ui.ctx.fillText('to join...', x, y + 30);

                // Joining the game
                if (input.button(JOIN) == 1) {
                    settings.part++;
                    settings.profile = 0;
                }

                // Returning to main menu
                if (input.button(CANCEL_1) == 1 || input.button(CANCEL_2)) {
                    gameScreen = new TitleScreen();
                }

                break;

            // Player is choosing a profile
            case JoinScreen.PARTS.PROFILE:
            
                // Profile options
                var options = ['Login', 'Sign Up', 'Guest'];
                ui.ctx.font = '32px Flipbash';
                ui.ctx.textAlign = 'center';
                ui.ctx.textBaseline = 'middle';
                for (j = 0; j < options.length; j++) {
                    if (j == settings.profile) {
                        ui.ctx.fillStyle = '#666';
                        ui.ctx.fillRect(x - 115, y + 160 * (j - 1), 230, 160);
                    }
                    ui.ctx.fillStyle = '#fff';
                    ui.ctx.fillText(options[j], x, y - 80 + 160 * j);
                }

                // Next option
                if ((input.button(DOWN_1) == 1) || (input.button(DOWN_2) == 1)) {
                    settings.profile = Math.min(settings.profile + 1, 2);
                }

                // Previous option
                if ((input.button(UP_1) == 1) || (input.button(UP_2) == 1)) {
                    settings.profile = Math.max(0, settings.profile - 1);
                }

                // Next screen
                if (input.button(SELECT_1) == 1 || input.button(SELECT_2) == 1) {

                    if (settings.profile == 2) {
                        settings.part++;
                        settings.profile = 'GUEST';
                    }

                    else {
                        settings.part += 0.5;
                        settings.user = '';
                        settings.pass = '';
                        settings.onUser = true;
                    }
                }

                // Returning to previous screen
                if (input.button(CANCEL_1) == 1 || input.button(CANCEL_2)) {
                    settings.part--;
                }

                break;

            // Player is creating a new profile
            case JoinScreen.PARTS.NEW_PROFILE:

                // Current name display
                ui.ctx.textAlign = 'center';
                ui.ctx.font = '32px Flipbash';
                ui.ctx.fillStyle = '#fff';
                ui.ctx.fillText(settings.onUser ? 'Username' : 'Password', x, y - 125);
                ui.ctx.font = '24px Flipbash';
                ui.ctx.fillStyle = '#ccc';
                var text = '[' + (settings.onUser ? settings.user : new Array(1 + settings.pass.length).join('*')) + ']';
                ui.ctx.fillText(text, x, y - 75);

                // Draw the letter grid
                var perRow = 5;
                var interval = 230 / 5;
                var rows = Math.ceil((4 + ALPHABET.length) / perRow);
                for (j = 0; j < ALPHABET.length; j++) {
                    var row = Math.floor(j / perRow);
                    var column = j % perRow;
                    ui.ctx.fillStyle = j == settings.frame ? 'white' : '#666';
                    ui.ctx.fillText(ALPHABET[j], x - 115 + interval * (column + 0.5), y + 30 * row);
                }

                // Del button
                ui.ctx.fillStyle = settings.frame == ALPHABET.length ? 'white' : '#666';
                ui.ctx.fillText('Del', x + 115 - 3 * interval, y + 30 * (rows - 1));

                // Done button
                ui.ctx.fillStyle = settings.frame > ALPHABET.length ? 'white' : '#666';
                ui.ctx.fillText('Done', x + 115 - interval, y + 30 * (rows - 1));

                // Errors
                ui.ctx.font = '18px Flipbash';
                ui.ctx.fillStyle = 'red';
                ui.ctx.fillText(settings.error, x, y + 30 * (rows + 1));

                // Input for navigating the letter grid
                var r = Math.floor(settings.frame / perRow);
                var c = settings.frame % perRow;
                if (input.button(LEFT_1) == 1 || input.button(LEFT_2) == 1) {
                    c = (c + perRow - 1) % perRow;
                    if (settings.frame > ALPHABET.length) {
                        c = ALPHABET.length % perRow;
                    }
                }
                if (input.button(RIGHT_1) == 1 || input.button(RIGHT_2) == 1) {
                    c = (c + 1) % perRow;
                    if (settings.frame == ALPHABET.length) {
                        settings.frame += 2;
                    }
                    else if (settings.frame > ALPHABET.length) {
                        c = 0;
                    }
                }
                if (input.button(DOWN_1) == 1 || input.button(DOWN_2) == 1) {
                    r = (r + 1) % rows;
                }
                if (input.button(UP_1) == 1 || input.button(UP_2) == 1) {
                    r = (r + rows - 1) % rows;
                }
                settings.frame = c + r * perRow;

                // Choosing a letter/finishing
                if (input.button(SELECT_1) == 1 || input.button(SELECT_2) == 1) {
                    
                    // Adding a letter
                    if (settings.frame < ALPHABET.length) {
                        if (settings.onUser && settings.user.length < 10) {
                            settings.user += ALPHABET[settings.frame];
                        }
                        else if (!settings.onUser && settings.pass.length < 10) {
                            settings.pass += ALPHABET[settings.frame];
                        }
                    }
                    
                    // Backspace
                    else if (settings.frame == ALPHABET.length) {
                        if (settings.onUser && settings.user.length > 0) {
                            settings.user = settings.user.substring(0, settings.user.length - 1);
                        }
                        else if (!settings.onUser && settings.pass.length > 0) {
                            settings.pass = settings.pass.substring(0, settings.pass.length - 1);
                        }
                    }
                    
                    // Cannot be an empty username
                    else if (settings.user.length === 0) {
                        settings.error = 'Invalid Username';
                    }
                    
                    // Cannot be an empty password
                    else if (settings.pass.length === 0 && !settings.onUser) {
                        settings.error = 'Invalid Password';
                    }

                    // Complete the input
                    else {
                        
                        // Move to the password
                        if (settings.onUser) {
                            settings.onUser = false;
                            settings.frame = 0;
                        }
                        
                        // Query the server with the input
                        else if (this.authID == -1) {
                            this.authID = i;
                            if (settings.profile === 0) {
                                connection.login(settings.user, settings.pass, handleLoginResponse);
                            }
                            else {
                                connection.signup(settings.user, settings.pass, handleLoginResponse);
                            }
                        }
                    }
                }

                // Returning to profile select
                if (input.button(CANCEL_1) == 1 || input.button(CANCEL_2)) {
                    if (settings.onUser) {
                        settings.part -= 0.5;
                    }
                    else settings.onUser = true;
                }

                break;

            // Player is ready to play
            case JoinScreen.PARTS.READY:

                // Name
                ui.ctx.font = '32px Flipbash';
                ui.ctx.fillStyle = '#FFF';
                ui.ctx.textAlign = 'center';
                ui.ctx.textBaseline = 'top';
                ui.ctx.fillText(robot.name, x, y + 40);

                ui.ctx.fillText('Ready', x, y + 150);

                // Return to profile select
                if (input.button(CANCEL_1) == 1 || input.button(CANCEL_2) == 1) {
                    settings.part--;
                }

                break;
        }
    }

    this.frame = (this.frame + 1) % 60;

    // Draw the cursor
    ui.drawCursor();

    ui.ctx.textBaseline = 'alphabetic';
    ui.ctx.textAlign = 'left';

    // Start the game when everyone is ready
    var allReady = true;
    var oneReady = false;
    for (k = 0; k < players.length; k++) {
        if (this.settings[k].part != JoinScreen.PARTS.READY && this.settings[k].part > JoinScreen.PARTS.CONNECTED) {
            allReady = false;
        }
        else if (this.settings[k].part == JoinScreen.PARTS.READY) {
            oneReady = true;
            players[k].settings = this.settings[k];
        }
    }
    if (allReady && oneReady) {
        cleanPlayerList();
        gameScreen = new RoomScreen(false);
    }
};

function handleLoginResponse(result) {
    var settings = gameScreen.settings[gameScreen.authID];
    gameScreen.authID = -1;
    if (result.success) {
        settings.name = settings.user;
        settings.profile = settings.user;
        settings.part += 0.5;
    }
    else {
        settings.error = result.error;
        settings.frame = 0;
        settings.onUser = true;
        settings.user = '';
        settings.pass = '';
    }
}