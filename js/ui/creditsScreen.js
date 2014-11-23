// The title gameScreen for the game
function CreditsScreen() {

    // Setup UI
    this.ui = UIGrid(1000, 75)
        .addTitle('Credits', -300, 100)
        .add(UIRow(-175, 1000, 75)
            .addTitle('Steven Sucy', 500)
            .addTitle('Clifton Rice', 500))
        .add(UIRow(-75, 1000, 50)
            .addTitle('Code', 500)
            .addTitle('Art', 500))
        .add(UIRow(10, 1000, 50)
            .addTitle('Sound', 500)
            .addTitle('Player Design', 500))
        .add(UIRow(95, 1000, 50)
            .addTitle('UI Design', 500)
            .addTitle('Enemy Design', 500))
        .addTitle('Special Thanks: James Castle and Aaron Fingar', 190, 45)
        .addButton('Return', 300, function() {
            gameScreen = new TitleScreen();
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