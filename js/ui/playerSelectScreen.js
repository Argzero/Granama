// The character selection gameScreen of the game
function SelectScreen() {

    this.imgDefOption = GetImage("pDefense");
    this.imgPowOption = GetImage("pPower");
    this.imgSpdOption = GetImage("pSpeed");

    // Draws the selection gameScreen
    this.Draw = Draw;
    function Draw() {

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
        
        // Get measurements
        var y = element.height / 2 - 50;
        
        canvas.font = "70px Flipbash";
        var sw = StringWidth("Choose A Robot", canvas.font) / 2;
        
        // Unmarks the left mouse button as pressed
        if (!KeyPressed(KEY_LMB)) {
            escDown = false;
        }
        
        // Draw the title box
        canvas.fillStyle = "#484848";
        canvas.fillRect(element.width / 2 - 395, y - 180, 790, 110);
        canvas.fillStyle = "#000000";
        canvas.fillRect(element.width / 2 - 385, y - 170, 770, 90);
        
        // Draw the title
        canvas.fillStyle = "#FFFFFF";
        canvas.fillText("Choose A Robot", element.width / 2 - sw, y - 100);
        
        // Draw the boxes for the options
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
                        gameScreen = new SkillScreen(PlayerSpeedType(), BLINK, OVERDRIVE, TELEPORT);
                    }
                    else {
                        gameScreen = new SkillScreen(PlayerPowerType(), WAVEBURST, BREAKERBLASTER, DECIMATION);
                    }
                    escDown = true;
                }
            }
            else {
                canvas.fillStyle = "#000000";
            }
            canvas.fillRect(x + 10, y + 10, 230, 230);
        }
        
        // Draw the robot images for the options
        canvas.drawImage(this.imgDefOption, x - 415 - this.imgDefOption.width / 2, y + 100 - this.imgDefOption.height / 2);
        canvas.drawImage(this.imgSpdOption, x - 145 - this.imgSpdOption.width / 2, y + 100 - this.imgSpdOption.height / 2);
        canvas.drawImage(this.imgPowOption, x + 125 - this.imgPowOption.width / 2, y + 100 - this.imgPowOption.height / 2);

        // Draw the text for each option
        canvas.fillStyle = "#FFFFFF";
        canvas.font = "30px Flipbash";
        canvas.fillText("Defense", x - 415 - StringWidth("Defense", canvas.font) / 2, y + 220);
        canvas.fillText("Speed", x - 145 - StringWidth("Speed", canvas.font) / 2, y + 220);
        canvas.fillText("Power", x + 125 - StringWidth("Power", canvas.font) / 2, y + 220);
        
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}