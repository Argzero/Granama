// The character selection gameScreen of the game
function SkillScreen(player, choice1, choice2, choice3) {

    this.player = player;

    this.firstChoice = GetImage('ability' + choice1);
    this.secondChoice = GetImage('ability' + choice2);
    this.thirdChoice = GetImage('ability' + choice3);
    
    this.choices = [choice1, choice2, choice3];
    
    this.methods = [
        SKILL_METHODS[choice1.replace(' ', '').toUpperCase()], 
        SKILL_METHODS[choice2.replace(' ', '').toUpperCase()], 
        SKILL_METHODS[choice3.replace(' ', '').toUpperCase()]
    ];

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
        canvas.fillText("Choose A Skill", element.width / 2 - sw, y - 100);
        
        // Draw the boxes for the options
        for (var i = 0; i < 3; i++) {
            var x = element.width / 2 - 395 + 270 * i;
            canvas.fillStyle = "#484848";
            canvas.fillRect(x, y, 250, 250);
            if (cx > x && cx < x + 250 && cy > y && cy < y + 250) {
                canvas.fillStyle = "#383838";
                
                // Choosing an option
                if (KeyPressed(KEY_LMB) && !escDown) {
                    this.methods[i](this.player);
                    this.player.ability = this.choices[i];
                    gameScreen = new GameScreen(this.player, this.player.mPower, this.player.mHealth, this.player.mSpeed);
                }
            }
            else {
                canvas.fillStyle = "#000000";
            }
            canvas.fillRect(x + 10, y + 10, 230, 230);
        }
        
        // Draw the robot images for the options
        canvas.drawImage(this.firstChoice, x - 415 - this.firstChoice.width / 2, y + 100 - this.firstChoice.height / 2);
        canvas.drawImage(this.secondChoice, x - 145 - this.secondChoice.width / 2, y + 100 - this.secondChoice.height / 2);
        canvas.drawImage(this.thirdChoice, x + 125 - this.thirdChoice.width / 2, y + 100 - this.thirdChoice.height / 2);

        // Draw the text for each option
        canvas.fillStyle = "#FFFFFF";
        canvas.font = "30px Flipbash";
        canvas.fillText(choice1, x - 415 - StringWidth(choice1, canvas.font) / 2, y + 220);
        canvas.fillText(choice2, x - 145 - StringWidth(choice2, canvas.font) / 2, y + 220);
        canvas.fillText(choice3, x + 125 - StringWidth(choice3, canvas.font) / 2, y + 220);
        
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}