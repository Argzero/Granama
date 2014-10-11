// The character selection gameScreen of the game
function PlayerScreen() {

	this.selection = 0;
	this.leftPressed = false;
	this.rightPressed = false;
	this.frame = 0;
	
    // Draws the selection gameScreen
    this.Draw = Draw;
    function Draw() {

        // Prevent IE bugs
        canvas.setTransform(1, 0, 0, 1, 0, 0);
		
		if (KeyPressed(KEY_A)) {
			if (!this.leftPressed) {
				this.selection = (this.selection + PLAYER_DATA.length - 1) % PLAYER_DATA.length;
				this.leftPressed = true;
			}
		}
		else this.leftPressed = false;
		if (KeyPressed(KEY_D)) {
			if (!this.rightPressed) {
				this.selection = (this.selection + 1) % PLAYER_DATA.length;
				this.rightPressed = true;
			}
		}
		else this.rightPressed = false;

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
        
        // Unmarks the left mouse button as pressed
        if (!KeyPressed(KEY_LMB)) {
            escDown = false;
        }
        
        // Draw the title box
		var x = element.width / 2;
		var y = element.height / 2;
        canvas.fillStyle = "#484848";
        canvas.fillRect(x - 395, y - 300, 790, 110);
        canvas.fillStyle = "#000000";
        canvas.fillRect(x - 385, y - 290, 770, 90);
        
        // Draw the title
        canvas.fillStyle = "#FFFFFF";
        canvas.fillText("Choose A Robot", x - sw, y - 300);
        
        // Draw the boxes for the options
		canvas.fillStyle = '#484848';
		canvas.fillRect(x - 125, y - 170, 250, 500);
		canvas.fillStyle = '#000';
		canvas.fillRect(x - 115, y - 160, 230, 480);
		
		// Draw the selected option
		var data = PLAYER_DATA[this.selection];
		
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
		
		// Ability icons
		for (var i = 0; i < 3; i++) {
			canvas.drawImage(GetImage('ability' + data.skills[i].name), x - 105 + 75 * i, y + 200, 60, 60);
		}
		
		// Indicators
		this.frame = (this.frame + 1) % 60;
		var dx = Math.cos(this.frame * Math.PI / 30);
		canvas.drawImage(GetImage('uiArrowLeft'), x - 125 - 10 * dx, y + 10);
		canvas.drawImage(GetImage('uiArrowRight'), x + 74 + 10 * dx, y + 10);
		
		/*
        for (var i = 0; i < 3; i++) {
            var x = element.width / 2 - 395 + 270 * i;
            canvas.fillStyle = "#484848";
            canvas.fillRect(x, y, 250, 250);
            if (cx > x && cx < x + 250 && cy > y && cy < y + 250) {
                canvas.fillStyle = "#383838";
                
                // Choosing an option
                if (KeyPressed(KEY_LMB) && !escDown) {
                    if (i == 0) {
                        gameScreen = new SkillScreen(PlayerDefenseType(), STASIS, REFLECTOR, RECHARGER);
                    }
                    else if (i == 1) {
                        gameScreen = new SkillScreen(PlayerSpeedType(), BLINK, OVERDRIVE, BLITZ);
                    }
                    else {
                        gameScreen = new SkillScreen(PlayerPowerType(), WAVEBURST, BREAKERBLASTER, DECIMATION);
                        //gameScreen = new SkillScreen(PlayerKnightType(), WAVEBURST, BREAKERBLASTER, DECIMATION);
                    }
                    escDown = true;
                }
            }
            else {
                canvas.fillStyle = "#000000";
            }
            canvas.fillRect(x + 10, y + 10, 230, 230);
        }
		*/
        
        // Draw the robot images for the options
		/*
        canvas.drawImage(this.imgDefOption, x - 415 - this.imgDefOption.width / 2, y + 100 - this.imgDefOption.height / 2);
        canvas.drawImage(this.imgSpdOption, x - 145 - this.imgSpdOption.width / 2, y + 100 - this.imgSpdOption.height / 2);
        canvas.drawImage(this.imgPowOption, x + 125 - this.imgPowOption.width / 2, y + 100 - this.imgPowOption.height / 2);

        // Draw the text for each option
        canvas.fillStyle = "#FFFFFF";
        canvas.font = "30px Flipbash";
        canvas.fillText("Defense", x - 415 - StringWidth("Defense", canvas.font) / 2, y + 220);
        canvas.fillText("Speed", x - 145 - StringWidth("Speed", canvas.font) / 2, y + 220);
        canvas.fillText("Power", x + 125 - StringWidth("Power", canvas.font) / 2, y + 220);
        */
		
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}