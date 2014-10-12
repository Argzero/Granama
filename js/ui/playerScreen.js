// The character selection gameScreen of the game
function PlayerScreen() {

	this.selection = [0, 0, 0, 0];
	this.frame = 0;
    this.playerSet = [false, false, false, false];
    this.joined = [true, false, false, false];
    this.ready = [false, false, false, false];
    this.abilityId = [0, 0, 0, 0];
    this.open = [0, 1, 2];
    
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
        var sw = StringWidth("Choose A Robot", canvas.font) / 2;
        
        // Draw the title box
        var x = element.width / 2;
        var y = element.height / 2;
        canvas.fillStyle = "#484848";
        canvas.fillRect(x - 395, y - 300, 790, 110);
        canvas.fillStyle = "#000000";
        canvas.fillRect(x - 385, y - 290, 770, 90);
        
        // Draw the title
        canvas.fillStyle = "#FFFFFF";
        canvas.textAlign = 'left';
        canvas.fillText("Choose A Robot", x - sw, y - 300);
        
        for (var i = 0; i < playerManager.players.length; i++) {
        
            x = element.width / 2 - 405 + 270 * i;
            
            // Draw the boxes for the options
            canvas.fillStyle = '#484848';
            canvas.fillRect(x - 125, y - 170, 250, 500);
            canvas.fillStyle = this.ready[i] ? '#aaa' : '#000';
            canvas.fillRect(x - 115, y - 160, 230, 480);
            
            // Input
            var input = playerManager.players[i].input;
            input.update();
            
            // Stage specific stuff
            if (!input.valid) {
                canvas.fillStyle = 'white';
                canvas.font = '24px Flipbash';
                canvas.textAlign = 'center';
                canvas.fillText('Connect a', x, y);
                canvas.fillText('controller...', x, y + 30);
            }
            else if (!this.joined[i]) {
                canvas.fillStyle = 'white';
                canvas.font = '24px Flipbash';
                canvas.textAlign = 'center';
                canvas.fillText('Press "Start"', x, y);
                canvas.fillText('to join...', x, y + 30);
                
                // Joining
                if (input.confirm) {
                    input.locked = true;
                    this.joined[i] = true;
                }
            }
            else {
            
                // Draw the selected option
                var data = PLAYER_DATA[this.selection[i]];
                
                // Preview image
                var preview = GetImage(data.preview);
                canvas.drawImage(preview, x - preview.width / 2, y - 115);

                // Name
                canvas.font = '32px Flipbash';
                canvas.fillStyle = '#0F0';
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
            
                if (this.ready[i]) {
                
                    canvas.fillStyle = 'red';
                    canvas.fillRect(x - 110 + this.abilityId[i] * 75, y + 195, 70, 70);
                
                    if (input.confirm) {
                        playerManager.players[i].robot = undefined;
                        this.ready[i] = false;
                        this.playerSet[i] = false;
                        this.open.push(this.selection[i]);
                        input.locked = true;
                    }
                }
                else if (this.playerSet[i]) {
                    
                    canvas.fillStyle = 'red';
                    canvas.fillRect(x - 110 + this.abilityId[i] * 75, y + 195, 70, 70);
                    
                    // Controls
                    if (input.movement.x < 0) {
                        this.abilityId[i] = (this.abilityId[i] + 2) % 3;
                        input.locked = true;
                    }
                    if (input.movement.x > 0) {
                        this.abilityId[i] = (this.abilityId[i] + 1) % 3;
                        input.locked = true;
                    }
                    if (input.confirm) {
                        input.locked = true;
                        var robot = data.player();
                        var skill = data.skills[this.abilityId[i]];
                        robot.ability = skill.name;
                        robot.input = input;
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
                }
                else {
                
                    // Indicator
                    var dx = Math.cos(this.frame * Math.PI / 30);
                    canvas.drawImage(GetImage('uiArrowLeft'), x - 125 - 10 * dx, y + 10);
                    canvas.drawImage(GetImage('uiArrowRight'), x + 74 + 10 * dx, y + 10);
                    
                    // Controls
                    if (input.movement.x < 0) {
                        do {
                            this.selection[i] = (this.selection[i] + PLAYER_DATA.length - 1) % PLAYER_DATA.length;
                        }
                        while (!this.isOpen(this.selection[i]));
                        input.locked = true;
                    }
                    if (input.movement.x > 0) {
                        do {
                            this.selection[i] = (this.selection[i] + 1) % PLAYER_DATA.length;
                        }
                        while (!this.isOpen(this.selection[i]));
                        input.locked = true;
                    }
                    if (input.confirm) {
                        input.locked = true;
                        this.playerSet[i] = true;
                        for (var k = 0; k < 4; k++) {
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