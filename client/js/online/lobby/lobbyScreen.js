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
    this.boxes = [];

    // Initialize player settings
    for (i = 0; i < players.length; i++) {
        this.boxes.push(new UIBox(false, 0, 0, 0, 0));
        if (!players[i].settings) {
            players[i].settings = new PlayerSettings(i);
        }
    }

    // Start off with all classes available
    for (i = 0; i < PLAYER_DATA.length; i++) {
        this.open.push(i);
    }
    
    this.updateOpenList();
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
    var i;
    for (i = 0; i < PLAYER_DATA.length; i++) {
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
    
    for (i = 0; i < players.length; i++) {
        if (players[i].settings.part >= LobbyScreen.PARTS.ABILITY) continue;
        while (!this.isOpen(players[i].settings.robot)) {
            players[i].settings.robot = (players[i].settings.robot + 1) % PLAYER_DATA.length;
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
    
    var x = ui.canvas.width / 2;
    var y = ui.canvas.height / 2;
    
    var cx = controls.mouse.x - ui.canvas.offsetLeft;
    var cy = controls.mouse.y - ui.canvas.offsetTop;

    var scaleY = Math.min((WINDOW_HEIGHT - 20) / players.length - 20, 175);
    var baseY = y - (players.length - 1) * (scaleY + 20) / 2;
    var fontScale = scaleY / 175;
    
    var rw = camera.canvas.width - 4.25 * scaleY - fontScale * 500 - 60;
    if (rw > 100) {
        chatBox.style.display = 'block';
        chatBox.style.width = rw + 'px';
    }
    else chatBox.style.display = 'none';
    
    var i, j, k, dx, xs, ys, s, preview, robot, input;
    for (i = 0; i < players.length; i++) {
        
        // Re-initialize settings if lost for some reason (players leaving)
        if (!players[i].settings) {
            players[i].settings = new PlayerSettings(i);
        }
        
        var settings = players[i].settings;
        robot = PLAYER_DATA[settings.robot];

        x = scaleY * 2;
        y = baseY + (scaleY + 20) * i;
        this.boxes[i].minWidth = scaleY * 3;
        this.boxes[i].maxWidth = scaleY * 3.25;
        this.boxes[i].height = scaleY;
        this.boxes[i].x = scaleY / 2;
        this.boxes[i].y = y - scaleY / 2;
        this.boxes[i].active = settings.part == LobbyScreen.PARTS.READY;
        if (this.boxes[i].width < this.boxes[i].minWidth) {
            this.boxes[i].width = this.boxes[i].minWidth;
        }
        else if (this.boxes[i].width > this.boxes[i].maxWidth) {
            this.boxes[i].width = this.boxes[i].maxWidth;
        }
        
        // Draw the boxes for the options
        this.boxes[i].draw();
        ui.ctx.fillStyle = '#484848';
        ui.ctx.beginPath();
        ui.ctx.arc(scaleY / 2, y, scaleY / 2, 0, Math.PI * 2);
        ui.ctx.fill();
        ui.ctx.fillStyle = '#000';
        ui.ctx.beginPath();
        ui.ctx.arc(scaleY / 2, y, scaleY / 2 - 8, 0, Math.PI * 2);
        ui.ctx.fill();
        
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
                ui.ctx.font = (fontScale * 24).toFixed(0) + 'px Flipbash';
                ui.ctx.textAlign = 'center';
                ui.ctx.fillText('Awaiting', x, y - 10 * fontScale);
                ui.ctx.fillText('Players...', x, y + 20 * fontScale);

                break;

            // Player joined and is selecting a robot type
            case LobbyScreen.PARTS.ROBOT:

                // Profile name
                ui.ctx.fillStyle = 'white';
                ui.ctx.font = (fontScale * 32).toFixed(0) + 'px Flipbash';
                ui.ctx.textAlign = 'center';
                ui.ctx.fillText(settings.profile, x, y - 50 * fontScale);

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

                // Preview image
                preview = images.get(robot.preview);
                xs = (scaleY - 16) / preview.width;
                ys = (scaleY - 16) / preview.height;
                s = Math.min(xs, ys);
                ui.ctx.drawImage(preview, scaleY / 2 - s * preview.width / 2, y - s * preview.height / 2, preview.width * s, preview.height * s);

                // Name
                ui.ctx.font = (fontScale * 32).toFixed(0) + 'px Flipbash';
                ui.ctx.fillStyle = robot.color;
                ui.ctx.textBaseline = 'top';
                ui.ctx.fillText(robot.name, x, y - fontScale * 50);

                // Weapon titles
                ui.ctx.font = (fontScale * 24).toFixed(0) + 'px Flipbash';
                ui.ctx.fillStyle = 'white';
                ui.ctx.textAlign = 'left';
                ui.ctx.fillText('Primary: ' + robot.weapons[0], scaleY + 10, y);
                ui.ctx.fillText('Secondary: ' + robot.weapons[1], scaleY + 10, y + fontScale * 40);

                // Indicator
                dx = Math.cos(this.frame * Math.PI / 15);
                var w = images.get('uiArrowLeft').width;
                var h = images.get('uiArrowLeft').height;
                ui.ctx.drawImage(
                    images.get('uiArrowLeft'), 
                    x - 115 * fontScale - 5 * dx - fontScale * w / 2, 
                    y - 40 * fontScale, 
                    w * fontScale, 
                    h * fontScale
                );
                ui.ctx.drawImage(
                    images.get('uiArrowRight'), 
                    x + 115 * fontScale + 5 * dx - fontScale * w / 2, 
                    y - 40 * fontScale, 
                    w * fontScale, 
                    h * fontScale
                );
                
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
                ui.ctx.font = (fontScale * 32).toFixed(0) + 'px Flipbash';
                ui.ctx.textAlign = 'center';
                ui.ctx.fillText(settings.profile, x, y - 50 * fontScale);

                // Preview image
                preview = images.get(robot.preview);
                xs = (scaleY - 16) / preview.width;
                ys = (scaleY - 16) / preview.height;
                s = Math.min(xs, ys);
                ui.ctx.drawImage(preview, scaleY / 2 - s * preview.width / 2, y - s * preview.height / 2, preview.width * s, preview.height * s);

                ui.ctx.textBaseline = 'top';

                // Hovered ability
                ui.ctx.drawImage(images.get('ability' + robot.skills[settings.ability].name), x - 45 * fontScale, y - 45 * fontScale, 90 * fontScale, 90 * fontScale);

                // Other abilities
                ui.ctx.globalAlpha = 0.5;
                ui.ctx.drawImage(images.get('ability' + robot.skills[(settings.ability + 2) % 3].name), x - 105 * fontScale, y, 45 * fontScale, 45 * fontScale);
                ui.ctx.drawImage(images.get('ability' + robot.skills[(settings.ability + 1) % 3].name), x + 60 * fontScale, y, 45 * fontScale, 45 * fontScale);
                ui.ctx.globalAlpha = 1;

                // Skill name
                ui.ctx.textAlign = 'center';
                ui.ctx.fillStyle = 'white';
                ui.ctx.font = (24 * fontScale).toFixed(0) + 'px Flipbash';
                ui.ctx.fillText(robot.skills[settings.ability].name, x, y + 40 * fontScale);
                
                // Indicator
                dx = Math.cos(this.frame * Math.PI / 15);
                var aw = images.get('uiArrowLeft').width;
                var ah = images.get('uiArrowLeft').height;
                ui.ctx.drawImage(images.get('uiArrowLeft'), x - 145 * fontScale - 5 * dx - aw * fontScale / 2, y, aw * fontScale, ah * fontScale);
                ui.ctx.drawImage(images.get('uiArrowRight'), x + 145 * fontScale + 5 * dx - aw * fontScale / 2, y, aw * fontScale, ah * fontScale);

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

                // Profile name
                ui.ctx.fillStyle = 'white';
                ui.ctx.font = (fontScale * 32).toFixed(0) + 'px Flipbash';
                ui.ctx.textAlign = 'center';
                ui.ctx.fillText(settings.profile, x, y - 50 * fontScale);

                // Preview image
                preview = images.get(robot.preview);
                xs = (scaleY - 16) / preview.width;
                ys = (scaleY - 16) / preview.height;
                s = Math.min(xs, ys);
                ui.ctx.drawImage(preview, scaleY / 2 - s * preview.width / 2, y - s * preview.height / 2, preview.width * s, preview.height * s);

                // Name
                ui.ctx.font = (fontScale * 32).toFixed(0) + 'px Flipbash';
                ui.ctx.fillStyle = robot.color;
                ui.ctx.textBaseline = 'top';
                ui.ctx.fillText(robot.name, x, y - fontScale * 50);

                ui.ctx.fillText('Ready', x, y + 30 * fontScale);
                
                // No input available for networked players
                if (!input) break;

                // Return to profile select
                if (input.button(CANCEL_1) == 1 || input.button(CANCEL_2) == 1) {
                    settings.part--;
                    connection.updateSelection(i);
                }

                break;
        }
        ui.ctx.textBaseline = 'alphabetic';
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
    if (allReady && oneReady && connection.isHost) {
        console.log('Start!');
        connection.requestStart();
    }
};