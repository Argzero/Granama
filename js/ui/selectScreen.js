var PARTS = {
    DISCONNECTED: 0,
    CONNECTED: 1,
    ROBOT: 2,
    ABILITy: 3,
    PROFILE: 4,
    READY: 5
};

function PlayerSettings() {
    return {
        robot: 0,
        ability: 0,
        frame: 0,
        part: PARTS.DISCONNECTED
    };
}

// The character selection screen of the game
function SelectScreen() {

	this.frame = 0;
    this.settings = [];
    this.open = [];
    
    // Initialize player settings
    for (var i = 0; i < playerManager.players.length; i++) {
        this.settings.push(PlayerSettings());
    }
    
    // Start off with all classes available
    for (var i = 0; i < PLAYER_DATA.length; i++) {
        this.open.push(i);
    }
    
    // Checks if a robot ID is still open
    this.isOpen = function(id) {
        for (var i = 0; i < this.open.length; i++) {
            if (id == this.open[i]) {
                return true;
            }
        }
        return false;
    };
	
    // Draws the selection gameScreen
    this.Draw = function() {

        // Prevent IE bugs
        canvas.setTransform(1, 0, 0, 1, 0, 0);
		
        // Draw the background
        if (tile && tile.width) {
            for (var i = 0; i < element.width / tile.width + 1; i++) {
                var x = i * tile.width;
                for (var j = 0; j < element.height / tile.height + 1; j++) {
                    canvas.drawImage(tile, x, j * tile.height);
                }
            }
        }
        
        var cx = mx - element.offsetLeft + pageScrollX;
        var cy = my - element.offsetTop + pageScrollY;
        
        canvas.font = "70px Flipbash";
        
        // Draw the title box
        var x = element.width / 2;
        var y = element.height / 2;
        canvas.fillStyle = "#484848";
        canvas.fillRect(x - 395, y - 300, 790, 110);
        canvas.fillStyle = "#000000";
        canvas.fillRect(x - 385, y - 290, 770, 90);
        
        // Draw the title
        canvas.fillStyle = "#FFFFFF";
        canvas.textAlign = 'center';
        canvas.textBaseline = 'top';
        canvas.fillText("Choose A Robot", x, y - 300);
        
        var baseX = x - (playerManager.players.length - 1) * 135;
        for (var i = 0; i < playerManager.players.length; i++) {
        
            x = baseX + 270 * i;
            
            // Draw the boxes for the options
            canvas.fillStyle = '#484848';
            canvas.fillRect(x - 125, y - 170, 250, 500);
            canvas.fillStyle = this.ready[i] ? '#aaa' : '#000';
            canvas.fillRect(x - 115, y - 160, 230, 480);
            
            // Input
            var input = playerManager.players[i].input;
            input.update();
            
            // Prompt to plug in controllers if not done so
            if (!input.valid) {
                canvas.fillStyle = 'white';
                canvas.font = '24px Flipbash';
                canvas.textAlign = 'center';
                canvas.fillText('Connect a', x, y);
                canvas.fillText('controller...', x, y + 30);
            }
            
            // Prompt to press the buttons to join when a controller is connected
            else if (!this.joined[i]) {
                canvas.fillStyle = 'white';
                canvas.font = '24px Flipbash';
                canvas.textAlign = 'center';
                canvas.fillText('Press "Space"', x, y);
                canvas.fillText('or "Start"', x, y + 30);
                canvas.fillText('to join...', x, y + 60);
                
                if ((input.id !== undefined && input.pause == 1) 
                    || (input.id === undefined && input.ability == 1)) {
                    this.joined[i] = true;
                }
                if (input.id === undefined && input.cancel == 1) {
                    gameScreen = new TitleScreen();
                }
            }
            
            // When a player has joined, the robot will be displayed
            else {
            
                // Draw the selected option
                var data = PLAYER_DATA[this.selection[i]];
                
                // Preview image
                var preview = GetImage(data.preview);
                canvas.drawImage(preview, x - preview.width / 2, y - 70 - preview.height / 2);

                // Name
                canvas.font = '32px Flipbash';
                canvas.fillStyle = data.color;
                canvas.textAlign = 'center';
                canvas.textBaseline = 'top';
                canvas.fillText(data.name, x, y);
                
                // Weapon titles
                canvas.font = '24px Flipbash';
                canvas.fillStyle = 'white';
                canvas.textAlign = 'left';
                canvas.fillText('Primary', x - 100, y + 50);
                canvas.fillText('Secondary', x - 100, y + 120);
                canvas.fillRect(x - 100, y + 82, 105, 2);
                canvas.fillRect(x - 100, y + 152, 150, 2);
                
                // Weapon names
                canvas.font = '18px Flipbash';
                canvas.fillText(data.weapons[0], x - 100, y + 85);
                canvas.fillText(data.weapons[1], x - 100, y + 155);
            
                // When ready, wait for further input in case of cancelling
                if (this.ready[i]) {
                
                    canvas.fillStyle = 'red';
                    canvas.fillRect(x - 110 + this.abilityId[i] * 75, y + 195, 70, 70);
                
                    if (input.cancel == 1) {
                        playerManager.players[i].robot = undefined;
                        this.ready[i] = false;
                    }
                }
                
                // If the robot is selected, have them select a skill
                else if (this.playerSet[i]) {
                    
                    // Highlight
                    canvas.fillStyle = 'red';
                    canvas.fillRect(x - 110 + this.abilityId[i] * 75, y + 195, 70, 70);
                    
                    // Skill name
                    canvas.textAlign = 'center';
                    canvas.fillStyle = 'white';
                    canvas.font = '24px Flipbash';
                    canvas.fillText(data.skills[this.abilityId[i]].name, x, y + 270);
                    
                    // Controls
                    if (input.left == 1) {
                        this.abilityId[i] = (this.abilityId[i] + 2) % 3;
                    }
                    if (input.right == 1) {
                        this.abilityId[i] = (this.abilityId[i] + 1) % 3;
                    }
                    if (input.confirm == 1) {
                        input.locked = true;
                        var robot = data.player();
                        robot.color = data.color;
                        robot.name = data.name;
                        var skill = data.skills[this.abilityId[i]];
                        robot.ability = skill.name;
                        robot.input = input;
						robot.ups = data.ups;
						robot.icons = data.icons;
                        skill.callback(robot);
                        playerManager.players[i].robot = robot;
                        this.ready[i] = true;
                        
                        var allReady = true;
                        for (var k = 0; k < 4; k++) {
                            if (!this.ready[k] && this.joined[k]) {
                                allReady = false;
                            }
                        }
                        if (allReady) {
                            playerManager.clean();
                            gameScreen = new GameScreen(false);
                        }
                    }
                    else if (input.cancel == 1) {
                        this.playerSet[i] = false;
                        this.open.push(this.selection[i]);
                    }
                }
                
                // Have the player select a robot
                else {
                
                    // Indicator
                    var dx = Math.cos(this.frame * Math.PI / 15);
                    canvas.drawImage(GetImage('uiArrowLeft'), x - 130 - 5 * dx, y + 10);
                    canvas.drawImage(GetImage('uiArrowRight'), x + 79 + 5 * dx, y + 10);
                    
                    // Controls
                    if (input.left == 1) {
                        do {
                            this.selection[i] = (this.selection[i] + PLAYER_DATA.length - 1) % PLAYER_DATA.length;
                        }
                        while (!this.isOpen(this.selection[i]));
                        input.locked = true;
                    }
                    if (input.right == 1) {
                        do {
                            this.selection[i] = (this.selection[i] + 1) % PLAYER_DATA.length;
                        }
                        while (!this.isOpen(this.selection[i]));
                        input.locked = true;
                    }
                    if (input.confirm == 1) {
                        input.locked = true;
                        this.playerSet[i] = true;
                        for (var k = 0; k < this.open.length; k++) {
                            if (this.open[k] == this.selection[i]) {
                                this.open.splice(k, 1);
                                break;
                            }
                        }
                        for (var k = 0; k < 4; k++) {
                            if (!this.playerSet[k]) {
                                if (!this.isOpen(this.selection[k])) {
                                    this.selection[k] = this.open[0];
                                }
                            }
                        }
                    }
                    if (input.cancel == 1) {
                        this.joined[i] = false;
                    }
                }
                
                // Ability icons
                for (var j = 0; j < 3; j++) {
                    canvas.drawImage(GetImage('ability' + data.skills[j].name), x - 105 + 75 * j, y + 200, 60, 60);
                }
            }
        }
        
        this.frame = (this.frame + 1) % 60;
     
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
        
        canvas.textBaseline = 'alphabetic';
        canvas.textAlign = 'left';
    };
}