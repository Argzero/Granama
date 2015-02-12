// The title gameScreen for the game
function TitleScreen() {

    delete PROFILE_DATA['Overall'];
    delete PROFILE_DATA['Guest'];

    // Set up UI
    this.ui = UIGrid(600, 75)
        .addTitle('Granama', -300, 100)
        .addButton('Play', -140, function() {
            playerManager.setMultiplayer();
            gameScreen = new SelectScreen();
        })
        .addButton('Boss Rush', -30, function() {
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
}

/**
 * Draws the title screen to the canvas
 */
TitleScreen.prototype.draw = function() {

    // Fix weird IE issue
    ui.ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Draw stuff
    ui.drawBackground();
    this.ui.draw();
    ui.drawCursor();
}