var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var SBPARTS = {
    DISCONNECTED: 0,
    CONNECTED: 1,
    PROFILE: 2,
	NEW_PROFILE: 2.5,
	TEAM: 3,
    ROBOT: 4,
    ABILITY: 5,
    READY: 6
};

function SBPlayerSettings(id) {
    return {
        id: id,
		team: 'Blue',
        robot: 0,
        ability: 0,
        frame: 0,
		profile: 0,
		newProfile: '',
        error: '',
        part: SBPARTS.DISCONNECTED
    };
}

// The character selection screen of the game
function SBSelectScreen() {

	GAME_WIDTH = 1748;
	GAME_HEIGHT = 813;
	WINDOW_WIDTH += SIDEBAR_WIDTH
	SIDEBAR_WIDTH = 0;

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
    for (var i = 0; i < playerManager.players.length; i++) {
        this.settings.push(SBPlayerSettings(i));
    }
    
    // Start off with all classes available
    for (var i = 0; i < SB_DATA.length; i++) {
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
    
    this.prevPart = function(settings) {
    
        settings.part--;
        
        switch (settings.part)
        {
        
            // Make a profile available again when a player no longer selects it
            case SBPARTS.PROFILE:
                
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
                
            // Make a robot available again when a player no longer selects it
            case SBPARTS.ROBOT:
            
                playerManager.players[settings.id].robot = undefined;
                this.open.push(settings.robot);
                
                break;
        }
    }
	
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
			var settings = this.settings[i];
			var robot = SB_DATA[settings.robot];
	
            // Draw the boxes for the options
            canvas.fillStyle = '#484848';
            canvas.fillRect(x - 125, y - 170, 250, 500);
            canvas.fillStyle = settings.part == SBPARTS.READY ? '#333' : '#000';
            canvas.fillRect(x - 115, y - 160, 230, 480);
            
            // Input
            var input = playerManager.players[i].input;
            input.update();
			
			// Valid/invalid input switches parts
			if (input.valid && settings.part == SBPARTS.DISCONNECTED) {
				settings.part = SBPARTS.CONNECTED;
				settings.frame = 0;
			}
			else if (!input.valid) {
				settings.part = SBPARTS.DISCONNECTED;
				settings.frame = 0;
			}
			
			// Display information based on the UI part the player is at
			switch(settings.part)
			{
				// Controller is disconnected and awaiting connection
				case SBPARTS.DISCONNECTED:
				
					// Prompt to connect a controller
					canvas.fillStyle = 'white';
					canvas.font = '24px Flipbash';
					canvas.textAlign = 'center';
					canvas.fillText('Connect a', x, y);
					canvas.fillText('controller...', x, y + 30);
				
					break;
				
				// Controller is connected and awaiting the player to join
				case SBPARTS.CONNECTED:
				
					// Prompt to press a button to join
					canvas.fillStyle = 'white';
					canvas.font = '24px Flipbash';
					canvas.textAlign = 'center';
					if (input.id === undefined) {
						canvas.fillText('Press "Space"', x, y);
					}
					else {
						canvas.fillText('Press "Start"', x, y);
					}
					canvas.fillText('to join...', x, y + 30);
					
					// Joining the game
					if ((input.id !== undefined && input.pause == 1) 
							|| (input.id === undefined && input.ability == 1)) {
						settings.part++;
                        settings.profile = 0;
					}
					
					// Returning to main menu
					if (input.id === undefined && input.cancel == 1) {
						gameScreen = new TitleScreen();
					}
				
					break;
				
                // Player is choosing a profile
				case SBPARTS.PROFILE:
                
					// Profile options
					var min = Math.max(0, settings.profile - 5);
					var max = Math.min(this.profilesArray.length - 1, settings.profile + 5);
					canvas.fillStyle = 'white';
					canvas.textAlign = 'center';
					var ty = y + 50 + (min - settings.profile) * 30;
					for (var j = min; j <= max; j++) {
						var dif = j - settings.profile;
						var abs = Math.abs(dif);
                        if (abs == 0) canvas.font = '32px Flipbash';
                        else canvas.font = (26 - abs * 2) + 'px Flipbash';
                        if (abs == 0) canvas.globalAlpha = 1;
						else canvas.globalAlpha = 0.6 - abs * 0.1;
                        canvas.fillText(this.profilesArray[j], x, ty);
                        if (abs == 0) ty += 40;
                        else ty += 36 - abs * 2;
					}
					canvas.globalAlpha = 1;
					
					// Next option
					if (input.down == 1) {
						settings.profile = Math.min(settings.profile + 1, this.profilesArray.length - 1);
					}
					
					// Previous option
					if (input.up == 1) {
						settings.profile = Math.max(0, settings.profile - 1);
					}
				
					// Next screen
					if (input.confirm == 1) {
					
						if (settings.profile < this.profilesArray.length - 1) {
							settings.part++;
                            var num = settings.profile;
                            settings.profile = this.profilesArray[num];
                            if (num < this.profilesArray.length - 2) {
                                this.profilesArray.splice(num, 1);
                                for (var j = 0; j < this.settings.length; j++) {
                                    if (j != i && this.settings[j].part == SBPARTS.PROFILE && this.settings[j].profile >= num && this.settings[j].profile > 0) {
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
					if (input.cancel == 1) {
						settings.part--;
					}
				
					break;
					
                // Player is creating a new profile
				case SBPARTS.NEW_PROFILE: 
                
                    // Current name display
                    canvas.fillStyle = '#ccc';
					canvas.textAlign = 'center';
                    canvas.font = '32px Flipbash';
                    var text = '[' + settings.newProfile + ']';
                    canvas.fillText(text, x, y - 75);
                    
                    // Draw the letter grid
                    var perRow = 5;
                    var interval = 230 / 5;
                    var rows = Math.ceil((4 + ALPHABET.length) / perRow);
                    canvas.font = '24px Flipbash';
                    for (var j = 0; j < ALPHABET.length; j++) {
                        var row = Math.floor(j / perRow);
                        var column = j % perRow;
                        canvas.fillStyle = j == settings.frame ? 'white' : '#666';
                        canvas.fillText(ALPHABET[j], x - 115 + interval * (column + 0.5), y + 30 * row);
                    }
                
                    // Del button
                    canvas.fillStyle = settings.frame == ALPHABET.length ? 'white' : '#666';
                    canvas.fillText('Del', x + 115 - 3 * interval, y + 30 * (rows - 1));
                    
                    // Done button
                    canvas.fillStyle = settings.frame > ALPHABET.length ? 'white' : '#666';
                    canvas.fillText('Done', x + 115 - interval, y + 30 * (rows - 1));
				
                    // Errors
                    canvas.fillStyle = 'red';
                    canvas.fillText(settings.error, x, y + 30 * (rows + 1));
                
                    // Input for navigating the letter grid
                    var r = Math.floor(settings.frame / perRow);
                    var c = settings.frame % perRow;
                    if (input.left == 1) {
                        c = (c + perRow - 1) % perRow;
                        if (settings.frame > ALPHABET.length) {
                            c = ALPHABET.length % perRow;
                        }
                    }
                    if (input.right == 1) {
                        c = (c + 1) % perRow;
                        if (settings.frame == ALPHABET.length) {
                            settings.frame += 2;
                        }
                        else if (settings.frame > ALPHABET.length) {
                            c = 0;
                        }
                    }
                    if (input.down == 1) {
                        r = (r + 1) % rows;
                    }
                    if (input.up == 1) {
                        r = (r + rows - 1) % rows;
                    }
                    settings.frame = c + r * perRow;
                
                    // Choosing a letter/finishing
                    if (input.confirm == 1) {
                        if (settings.frame < ALPHABET.length && settings.newProfile.length < 6) {
                            settings.newProfile += ALPHABET[settings.frame];
                        }
                        else if (settings.frame == ALPHABET.length && settings.newProfile.length > 0) {
                            settings.newProfile = settings.newProfile.substring(0, settings.newProfile.length - 1);
                        }
                        else if (settings.frame > ALPHABET.length) {
                            if (settings.newProfile.length == 0) {
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
                    if (input.cancel == 1) {
                        settings.part -= 0.5;
                    }
                
					break;
					
				// Player joined and is selecting a team
				case SBPARTS.TEAM:
					settings.part++;
					break;
                
				// Player has a team and is selecting a robot type
				case SBPARTS.ROBOT:
                    
                    // Profile name
                    canvas.fillStyle = 'white';
                    canvas.font = '32px Flipbash';
					canvas.textAlign = 'center';
                    canvas.fillText(settings.profile, x, y - 160);
                
					canvas.globalAlpha = 0.5;
                    
                    // Next/previous options
                    var next = settings.robot, prev = settings.robot;
                    do { next = (next + 1) % SB_DATA.length; } while (!this.isOpen(next));
					do { prev = (prev + SB_DATA.length - 1) % SB_DATA.length; } while (!this.isOpen(prev));
                    
					// Previous image
					var preview = GetImage(SB_DATA[prev].preview + settings.team);
					var scale = 75 / preview.height;
					canvas.drawImage(preview, preview.width / 2, 0, preview.width / 2, preview.height, x - 115, y + 20, preview.width * scale / 2, 75);
					
					// Next image
					preview = GetImage(SB_DATA[next].preview + settings.team);
					var scale = 50 / preview.height;
					canvas.drawImage(preview, 0, 0, preview.width / 2, preview.height, x + 115 - preview.width * scale / 2, y + 20, preview.width * scale / 2, 75);
				
					canvas.globalAlpha = 1;
				
					// Preview image
				    preview = GetImage(robot.preview + settings.team);
					canvas.drawImage(preview, x - preview.width / 2 + 10, y - preview.height / 2);

					// Name
					canvas.font = '32px Flipbash';
					canvas.fillStyle = robot.color;
					canvas.textBaseline = 'top';
					canvas.fillText(robot.name, x, y + 80);
					
					// Weapon titles
					canvas.font = '24px Flipbash';
					canvas.fillStyle = 'white';
					canvas.textAlign = 'left';
					canvas.fillText('Weapon', x - 100, y + 180);
					canvas.fillRect(x - 100, y + 212, 105, 2);
					
					// Weapon names
					canvas.font = '18px Flipbash';
					canvas.fillText(robot.weapon, x - 100, y + 215);
				
					// Indicator
                    var dx = Math.cos(this.frame * Math.PI / 15);
                    canvas.drawImage(GetImage('uiArrowLeft'), x - 130 - 5 * dx, y - 10);
                    canvas.drawImage(GetImage('uiArrowRight'), x + 79 + 5 * dx, y - 10);
				
					// Switch to next robot
                    if (input.left == 1) {
                        settings.robot = prev;
                    }
					
					// Switch to previous robot
                    if (input.right == 1) {
                        settings.robot = next;
                    }
					
					// Choose the robot
                    if (input.confirm == 1) {
                        settings.part++;
                        for (var k = 0; k < this.open.length; k++) {
                            if (this.open[k] == settings.robot) {
                                this.open.splice(k, 1);
                                break;
                            }
                        }
                        for (var k = 0; k < this.settings.length; k++) {
							if (k != i) {
								if (this.settings[k].part <= SBPARTS.ROBOT) {
									if (!this.isOpen(this.settings[k].robot)) {
										this.settings[k].robot = this.open[0];
									}
								}
							}
                        }
                    }
					
					// Quitting
                    if (input.cancel == 1) {
                        this.prevPart(settings);
                    }
				
					break;
				
				// Player is selecting an ability
				case SBPARTS.ABILITY:
				
                    // Profile name
                    canvas.fillStyle = 'white';
                    canvas.font = '32px Flipbash';
                    canvas.fillText(settings.profile, x, y - 160);
                
					// Preview image
				    var preview = GetImage(robot.preview + settings.team);
					canvas.drawImage(preview, x - preview.width / 2 + 10, y - preview.height / 2);

					// Name
					canvas.font = '32px Flipbash';
					canvas.fillStyle = robot.color;
					canvas.textAlign = 'center';
					canvas.textBaseline = 'top';
					canvas.fillText(robot.name, x, y + 80);
					
					// Hovered ability
					canvas.drawImage(GetImage('ability' + robot.skills[settings.ability].name), x - 45, y + 160, 90, 90);
					
					// Other abilities
					canvas.globalAlpha = 0.5;
					canvas.drawImage(GetImage('ability' + robot.skills[(settings.ability + 2) % 3].name), x - 105, y + 205, 45, 45);
					canvas.drawImage(GetImage('ability' + robot.skills[(settings.ability + 1) % 3].name), x + 60, y + 205, 45, 45);
					canvas.globalAlpha = 1;
					
					// Skill name
                    canvas.textAlign = 'center';
                    canvas.fillStyle = 'white';
                    canvas.font = '24px Flipbash';
                    canvas.fillText(robot.skills[settings.ability].name, x, y + 250);
					
					// Indicator
                    var dx = Math.cos(this.frame * Math.PI / 15);
                    canvas.drawImage(GetImage('uiArrowLeft'), x - 130 - 5 * dx, y  + 170);
                    canvas.drawImage(GetImage('uiArrowRight'), x + 79 + 5 * dx, y + 170);
					
					// Next Ability
                    if (input.left == 1) {
                        settings.ability = (settings.ability + 2) % 3;
                    }
					
					// Previous ability
                    if (input.right == 1) {
                        settings.ability = (settings.ability + 1) % 3;
                    }
					
					// Choose the ability
                    if (input.confirm == 1) {
					
						// Apply the options to get ready for playing
                        var player = robot.player(settings.team);
                        player.profile = Profile(settings.profile);
                        player.color = robot.color;
                        player.name = robot.name;
                        var skill = robot.skills[settings.ability];
                        player.ability = skill.name;
                        player.input = input;
						player.ups = robot.ups;
						player.icons = robot.icons;
                        skill.callback(player);
                        playerManager.players[i].robot = player;
                        settings.part++;
                    }
					
					// Return to robot selection
                    else if (input.cancel == 1) {
                        this.prevPart(settings);
                    }
				
					break;
					
				// Player is ready to play
				case SBPARTS.READY:
									
					// Preview image
					var preview = GetImage(robot.preview + settings.team);
					canvas.drawImage(preview, x - preview.width / 2, y - 40 - preview.height / 2);

					// Name
					canvas.font = '32px Flipbash';
					canvas.fillStyle = robot.color;
					canvas.textAlign = 'center';
					canvas.textBaseline = 'top';
					canvas.fillText(robot.name, x, y + 40);
					
					canvas.fillText('Ready', x, y + 150);
					
					// Return to profile select
					if (input.cancel == 1) {
                        settings.part--;
                    }
				
					break;
			}
        }
        
        this.frame = (this.frame + 1) % 60;
     
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
        
        canvas.textBaseline = 'alphabetic';
        canvas.textAlign = 'left';
        
        // Start the game when everyone is ready
        var allReady = true;
        var oneReady = false;
        for (var k = 0; k < playerManager.players.length; k++) {
            if (this.settings[k].part != SBPARTS.READY && this.settings[k].part > SBPARTS.CONNECTED) {
                allReady = false;
            }
            else if (this.settings[k].part == SBPARTS.READY) {
                oneReady = true;
            }
        }
        if (allReady && oneReady) {
            playerManager.clean();
            for (var i = 0; i < playerManager.players.length; i++) {
                var robot = playerManager.players[i].robot;
                robot.profile.addStat(robot.name, STAT.GAMES, 1);
                robot.profile.addStat(robot.name, robot.ability, 1);
            }
            //gameScreen = new GameScreen(false);
			gameScreen = new SpinnerBall();
        }
    };
}