// The title gameScreen for the game
function TitleScreen() {

    this.imgTitle = GetImage("title");
    this.buttons = [
        TitleButton("Play", -140, 500, 600, 75, function() {
            playerManager.setMultiplayer();
            gameScreen = new SelectScreen();
        }),
        TitleButton("Boss Rush", -30, 500, 600, 75, function() {
            playerManager.setSingleplayer();
            player = PlayerTraitorType();
            player.color = '#f80';
            player.name = 'Traitor';
            playerManager.players[0].robot = player;
            player.input = playerManager.players[0].input;
            gameScreen = new GameScreen(player, true);
        }),
        TitleButton("Stats", 80, 500, 600, 75, function() {
            gameScreen = new StatScreen();
        }),
        TitleButton("Controls", 190, 500, 600, 75, function() {
            gameScreen = new ControlsScreen();
        }),
        TitleButton("Credits", 300, 500, 600, 75, function() {
            gameScreen = new CreditsScreen();
        })
    ];
    
    // Draws the title gameScreen
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
        
        // Draw the title image
        var x = element.width / 2 - 325;
        var y = element.height / 2;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(x, y - 350, 620, 40 + this.imgTitle.height);
        canvas.fillRect(x, y - 310 + this.imgTitle.height, 25, element.height);
        canvas.fillStyle = '#878787'
        canvas.fillRect(x + 8, y - 310 + this.imgTitle.height, 9, element.height);
        canvas.fillStyle = BUTTON_BG;
        canvas.fillRect(x + 10, y - 340, 600, 20 + this.imgTitle.height);
        canvas.drawImage(this.imgTitle, element.width / 2 - this.imgTitle.width / 2, y - 330);
        
        // Draw the buttons
        canvas.setTransform(1, 0, 0, 1, 0, 0);
        for (var i = 0; i < this.buttons.length; i++) {
            this.buttons[i].draw();
        }
        
        // Draw the cursor
        canvas.drawImage(cursor, mx - cursor.width / 2, my - cursor.height / 2);
    }
}