// The title gameScreen for the game
function TitleScreen() {

    delete PROFILE_DATA['Overall'];
    delete PROFILE_DATA['Guest'];

	// Setup UI
	this.ui = UIGrid(600, 75)
        .addTitle('Granama', -300, 100)
        .addButton('Play', -140, function() {
            playerManager.setMultiplayer();
            gameScreen = new SelectScreen();
        })
        .addButton('Boss Rush', -30,  function() {
            playerManager.setSingleplayer();
            player = PlayerTraitorType();
            player.color = '#f80';
            player.name = 'Traitor';
            playerManager.players[0].robot = player;
            PROFILE_DATA['Overall'] = {};
            playerManager.players[0].robot.profile = Profile('Overall');
            player.input = playerManager.players[0].input;
            gameScreen = new GameScreen(player, true);
        })
        .addButton('Stats', 80, function() {
            gameScreen = new StatScreen();
        })
        .addButton('Controls', 190, function() {
            gameScreen = new ControlsScreen();
        })
        .addButton('Credits', 300, function() {
            gameScreen = new CreditsScreen();
        });
    
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
        
		this.ui.draw();
        
        // Draw the cursor
        canvas.drawImage(cursor, mx - cursor.width / 2, my - cursor.height / 2);
    }
}