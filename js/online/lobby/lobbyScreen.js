var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

LobbyScreen.PARTS = {
    DISCONNECTED: 0,
    ROBOT       : 1,
    ABILITY     : 2,
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
    this.part = LobbyScreen.PARTS.DISCONNECTED;
}

// The character selection screen of the game
function LobbyScreen() {

    this.frame = 0;
    this.open = [];

    // Initialize player settings
    for (i = 0; i < players.length; i++) {
        if (!players[i].settings) {
            players[i].settings = new PlayerSettings(i);
        }
    }

    // Start off with all classes available
    for (i = 0; i < PLAYER_DATA.length; i++) {
        this.open.push(i);
    }
}

// Checks if a robot ID is still open
LobbyScreen.prototype.isOpen = function(id) {
    return this.open.indexOf(id) >= 0;
};

/**
 * Reinitializes the open list to match network changes
 */ 
LobbyScreen.prototype.updateOpenList = function() {
    this.open = [];
    for (var i = 0; i < PLAYER_DATA.length; i++) {
        var open = true;
        for (var j = 0; j < players.length; j++) {
            if (players[j].settings.robot == i && players[j].settings.part > LobbyScreen.PARTS.ROBOT) {
                open = false;
                break;
            }
        }
        if (open) {
            this.open.push(i);
        }
    }
};

LobbyScreen.prototype.prevPart = function(settings) {

    settings.part--;

    switch (settings.part) {

        // Make a robot available again when a player no longer selects it
        case LobbyScreen.PARTS.ROBOT:

            this.open.push(settings.robot);

            break;
         
        // Quit the room 
        case LobbyScreen.PARTS.DISCONNECTED:
        
            connection.quitGame();
            
            break;
    }
};

// Draws the selection gameScreen
LobbyScreen.prototype.draw = function() {

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
    var i, j, k, dx, preview, robot, input;
    for (i = 0; i < players.length; i++) {

        x = baseX + 270 * i;
        var settings = players[i].settings;
        robot = PLAYER_DATA[settings.robot];

        // Draw the boxes for the options
        ui.ctx.fillStyle = '#484848';
        ui.ctx.fillRect(x - 125, y - 170, 250, 500);
        ui.ctx.fillStyle = settings.part == LobbyScreen.PARTS.READY ? '#333' : '#000';
        ui.ctx.fillRect(x - 115, y - 160, 230, 480);

        // Input
        input = undefined;
        if (players[i].input) {
            input = players[i].input;
            input.update();

            // Valid/invalid input switches LobbyScreen.PARTS
            if (input.valid && settings.part == LobbyScreen.PARTS.DISCONNECTED) {
                settings.part = LobbyScreen.PARTS.CONNECTED;
                settings.frame = 0;
            }
            else if (!input.valid) {
                settings.part = LobbyScreen.PARTS.DISCONNECTED;
                settings.frame = 0;
            }
        }

        // Display information based on the UI part the player is at
        switch (settings.part) {
        
            // Controller is disconnected and awaiting connection
            case LobbyScreen.PARTS.DISCONNECTED:

                // Prompt to connect a controller
                ui.ctx.fillStyle = 'white';
                ui.ctx.font = '24px Flipbash';
                ui.ctx.textAlign = 'center';
                ui.ctx.fillText('Awaiting', x, y);
                ui.ctx.fillText('Players...', x, y + 30);

                break;

            // Player joined and is selecting a robot type
            case LobbyScreen.PARTS.ROBOT:

                // Profile name
                ui.ctx.fillStyle = 'white';
                ui.ctx.font = '32px Flipbash';
                ui.ctx.textAlign = 'center';
                ui.ctx.fillText(settings.profile, x, y - 160);

                ui.ctx.globalAlpha = 0.5;

                // Next/previous options
                var next = settings.robot, prev = settings.robot;
                do {
                    next = (next + 1) % PLAYER_DATA.length;
                }
                while (!this.isOpen(next));
                do {
                    prev = (prev + PLAYER_DATA.length - 1) % PLAYER_DATA.length;
                }
                while (!this.isOpen(prev));

                // Previous image
                preview = GetImage(PLAYER_DATA[prev].preview);
                var scale = 75 / preview.height;
                ui.ctx.drawImage(preview, preview.width / 2, 0, preview.width / 2, preview.height, x - 115, y + 20, preview.width * scale / 2, 75);

                // Next image
                preview = GetImage(PLAYER_DATA[next].preview);
                scale = 50 / preview.height;
                ui.ctx.drawImage(preview, 0, 0, preview.width / 2, preview.height, x + 115 - preview.width * scale / 2, y + 20, preview.width * scale / 2, 75);

                ui.ctx.globalAlpha = 1;

                // Preview image
                preview = GetImage(robot.preview);
                ui.ctx.drawImage(preview, x - preview.width / 2 + 10, y - preview.height / 2);

                // Name
                ui.ctx.font = '32px Flipbash';
                ui.ctx.fillStyle = robot.color;
                ui.ctx.textBaseline = 'top';
                ui.ctx.fillText(robot.name, x, y + 80);

                // Weapon titles
                ui.ctx.font = '24px Flipbash';
                ui.ctx.fillStyle = 'white';
                ui.ctx.textAlign = 'left';
                ui.ctx.fillText('Primary', x - 100, y + 180);
                ui.ctx.fillText('Secondary', x - 100, y + 250);
                ui.ctx.fillRect(x - 100, y + 212, 105, 2);
                ui.ctx.fillRect(x - 100, y + 282, 150, 2);

                // Weapon names
                ui.ctx.font = '18px Flipbash';
                ui.ctx.fillText(robot.weapons[0], x - 100, y + 215);
                ui.ctx.fillText(robot.weapons[1], x - 100, y + 285);

                // Indicator
                dx = Math.cos(this.frame * Math.PI / 15);
                ui.ctx.drawImage(GetImage('uiArrowLeft'), x - 130 - 5 * dx, y - 10);
                ui.ctx.drawImage(GetImage('uiArrowRight'), x + 79 + 5 * dx, y - 10);
                
                // No input available for networked players
                if (!input) break;

                // Switch to next robot
                if (input.button(LEFT_1) == 1 || input.button(LEFT_2) == 1) {
                    settings.robot = prev;
                    connection.updateSelection(i);
                }

                // Switch to previous robot
                if (input.button(RIGHT_1) == 1 || input.button(RIGHT_2) == 1) {
                    settings.robot = next;
                    connection.updateSelection(i);
                }

                // Choose the robot
                if (input.button(SELECT_1) == 1 || input.button(SELECT_2) == 1) {
                    settings.part++;
                    connection.updateSelection(i);
                    for (k = 0; k < this.open.length; k++) {
                        if (this.open[k] == settings.robot) {
                            this.open.splice(k, 1);
                            break;
                        }
                    }
                    for (k = 0; k < players.length; k++) {
                        if (k != i) {
                            if (players[k].settings.part <= LobbyScreen.PARTS.ROBOT) {
                                if (!this.isOpen(players[k].settings.robot)) {
                                    players[k].settings.robot = this.open[0];
                                }
                            }
                        }
                    }
                }

                // Quitting
                if (input.button(CANCEL_1) == 1 || input.button(CANCEL_2) == 1) {
                    this.prevPart(settings);
                }

                break;

            // Player is selecting an ability
            case LobbyScreen.PARTS.ABILITY:

                // Profile name
                ui.ctx.fillStyle = 'white';
                ui.ctx.font = '32px Flipbash';
                ui.ctx.fillText(settings.profile, x, y - 160);

                // Preview image
                preview = GetImage(robot.preview);
                ui.ctx.drawImage(preview, x - preview.width / 2 + 10, y - preview.height / 2);

                // Name
                ui.ctx.font = '32px Flipbash';
                ui.ctx.fillStyle = robot.color;
                ui.ctx.textAlign = 'center';
                ui.ctx.textBaseline = 'top';
                ui.ctx.fillText(robot.name, x, y + 80);

                // Hovered ability
                ui.ctx.drawImage(GetImage('ability' + robot.skills[settings.ability].name), x - 45, y + 160, 90, 90);

                // Other abilities
                ui.ctx.globalAlpha = 0.5;
                ui.ctx.drawImage(GetImage('ability' + robot.skills[(settings.ability + 2) % 3].name), x - 105, y + 205, 45, 45);
                ui.ctx.drawImage(GetImage('ability' + robot.skills[(settings.ability + 1) % 3].name), x + 60, y + 205, 45, 45);
                ui.ctx.globalAlpha = 1;

                // Skill name
                ui.ctx.textAlign = 'center';
                ui.ctx.fillStyle = 'white';
                ui.ctx.font = '24px Flipbash';
                ui.ctx.fillText(robot.skills[settings.ability].name, x, y + 250);

                // Indicator
                dx = Math.cos(this.frame * Math.PI / 15);
                ui.ctx.drawImage(GetImage('uiArrowLeft'), x - 130 - 5 * dx, y + 170);
                ui.ctx.drawImage(GetImage('uiArrowRight'), x + 79 + 5 * dx, y + 170);

                // No input available for networked players
                if (!input) break;
                
                // Next Ability
                if (input.button(LEFT_1) == 1 || input.button(LEFT_2) == 1) {
                    settings.ability = (settings.ability + 2) % 3;
                    connection.updateSelection(i);
                }

                // Previous ability
                if (input.button(RIGHT_1) == 1 || input.button(RIGHT_2) == 1) {
                    settings.ability = (settings.ability + 1) % 3;
                    connection.updateSelection(i);
                }

                // Choose the ability
                if (input.button(SELECT_1) == 1 || input.button(SELECT_2) == 1) {

                    // Apply the options to get ready for playing
                    settings.part++;
                    
                    connection.updateSelection(i);
                }

                // Return to robot selection
                else if (input.button(CANCEL_1) == 1 || input.button(CANCEL_2) == 1) {
                    this.prevPart(settings);
                    connection.updateSelection(i);
                }

                break;

            // Player is ready to play
            case LobbyScreen.PARTS.READY:

                // Preview image
                preview = GetImage(robot.preview);
                ui.ctx.drawImage(preview, x - preview.width / 2, y - 40 - preview.height / 2);

                // Name
                ui.ctx.font = '32px Flipbash';
                ui.ctx.fillStyle = robot.color;
                ui.ctx.textAlign = 'center';
                ui.ctx.textBaseline = 'top';
                ui.ctx.fillText(robot.name, x, y + 40);

                ui.ctx.fillText('Ready', x, y + 150);
                
                // No input available for networked players
                if (!input) break;

                // Return to profile select
                if (input.button(CANCEL_1) == 1 || input.button(CANCEL_2) == 1) {
                    settings.part--;
                    connection.updateSelection(i);
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
        if (players[k].settings.part != LobbyScreen.PARTS.READY && players[k].settings.part > 0) {
            allReady = false;
        }
        else if (players[k].settings.part == LobbyScreen.PARTS.READY) {
            oneReady = true;
        }
    }
    if (allReady && oneReady) {
        console.log('Start!');
        /*
        cleanPlayerList();
        for (i = 0; i < players.length; i++) {
            robot = players[i];
        }
        gameScreen = new GameScreen(false);
        */
    }
};