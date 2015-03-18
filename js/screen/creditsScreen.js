/**
 * Represents the credits screen of the game
 */
function CreditsScreen() {

    // Setup UI
    this.ui = new UIGrid(1000, 75)
        .addTitle('Credits', -300, 100)
        .add(new UIRow(-175, 1000, 75)
            .addTitle('Steven Sucy', 500)
            .addTitle('Clifton Rice', 500))
        .add(new UIRow(-75, 1000, 50)
            .addTitle('Code', 500)
            .addTitle('Art', 500))
        .add(new UIRow(10, 1000, 50)
            .addTitle('Sound', 500)
            .addTitle('Player Design', 500))
        .add(new UIRow(95, 1000, 50)
            .addTitle('UI Design', 500)
            .addTitle('Enemy Design', 500))
        .addTitle('Special Thanks: James Castle and Aaron Fingar', 190, 45)
        .addButton('Return', 300, function() {
            gameScreen = new TitleScreen();
        });
}

/**
 * Draws the credits screen to the canvas
 */
CreditsScreen.prototype.draw = function() {

    // Prevent IE bugs
    ui.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Draw the background
    ui.drawBackground();
    
    this.ui.draw();

    // Draw the cursor
    ui.drawCursor();
};