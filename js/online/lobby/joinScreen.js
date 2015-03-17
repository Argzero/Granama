var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

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
    this.newProfile = '';
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
    this.profilesArray = [];

    var i = 0;
    for (var profile in PROFILE_DATA) {
        this.profilesArray[i++] = profile;
    }
    this.profilesArray.sort();
    this.profilesArray.push('Guest');
    this.profilesArray.push('New Profile');

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

            if (settings.profile != 'Guest') {
                this.profilesArray.push(settings.profile);
                this.profilesArray.sort(function(a, b) {
                    if (a == 'New Profile') return 1;
                    if (b == 'New Profile') return -1;
                    if (a == 'Guest') return 1;
                    if (b == 'Guest') return -1;
                    return a.localeCompare(b);
                });
            }
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
                var min = Math.max(0, settings.profile - 5);
                var max = Math.min(this.profilesArray.length - 1, settings.profile + 5);
                ui.ctx.fillStyle = 'white';
                ui.ctx.textAlign = 'center';
                var ty = y + 50 + (min - settings.profile) * 30;
                for (j = min; j <= max; j++) {
                    var dif = j - settings.profile;
                    var abs = Math.abs(dif);
                    if (abs === 0) ui.ctx.font = '32px Flipbash';
                    else ui.ctx.font = (26 - abs * 2) + 'px Flipbash';
                    if (abs === 0) ui.ctx.globalAlpha = 1;
                    else ui.ctx.globalAlpha = 0.6 - abs * 0.1;
                    ui.ctx.fillText(this.profilesArray[j], x, ty);
                    if (abs === 0) ty += 40;
                    else ty += 36 - abs * 2;
                }
                ui.ctx.globalAlpha = 1;

                // Next option
                if ((input.button(DOWN_1) == 1) || (input.button(DOWN_2) == 1)) {
                    settings.profile = Math.min(settings.profile + 1, this.profilesArray.length - 1);
                }

                // Previous option
                if ((input.button(UP_1) == 1) || (input.button(UP_2) == 1)) {
                    settings.profile = Math.max(0, settings.profile - 1);
                }

                // Next screen
                if (input.button(SELECT_1) == 1 || input.button(SELECT_2) == 1) {

                    if (settings.profile < this.profilesArray.length - 1) {
                        settings.part++;
                        var num = settings.profile;
                        settings.profile = this.profilesArray[num];
                        if (num < this.profilesArray.length - 2) {
                            this.profilesArray.splice(num, 1);
                            for (j = 0; j < this.settings.length; j++) {
                                if (j != i && this.settings[j].part == JoinScreen.PARTS.PROFILE && this.settings[j].profile >= num && this.settings[j].profile > 0) {
                                    this.settings[j].profile--;
                                }
                            }
                        }
                    }

                    else {
                        settings.part += 0.5;
                        settings.newProfile = '';
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
                ui.ctx.fillStyle = '#ccc';
                ui.ctx.textAlign = 'center';
                ui.ctx.font = '32px Flipbash';
                var text = '[' + settings.newProfile + ']';
                ui.ctx.fillText(text, x, y - 75);

                // Draw the letter grid
                var perRow = 5;
                var interval = 230 / 5;
                var rows = Math.ceil((4 + ALPHABET.length) / perRow);
                ui.ctx.font = '24px Flipbash';
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
                    if (settings.frame < ALPHABET.length && settings.newProfile.length < 6) {
                        settings.newProfile += ALPHABET[settings.frame];
                    }
                    else if (settings.frame == ALPHABET.length && settings.newProfile.length > 0) {
                        settings.newProfile = settings.newProfile.substring(0, settings.newProfile.length - 1);
                    }
                    else if (settings.frame > ALPHABET.length) {
                        if (settings.newProfile.length === 0) {
                            settings.error = 'Invalid Name';
                        }
                        else if (PROFILE_DATA[settings.newProfile]) {
                            settings.error = 'Name in use';
                        }
                        else {
                            settings.part += 0.5;
                            settings.profile = settings.newProfile;
                            PROFILE_DATA[settings.newProfile] = {};
                        }
                    }
                }

                // Returning to profile select
                if (input.button(CANCEL_1) == 1 || input.button(CANCEL_2)) {
                    settings.part -= 0.5;
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