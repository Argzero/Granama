/**
 * Represents the game over screen for Arcade mode
 */
function EndScreen() {
    this.score = gameScreen.score;
    this.bossScore = gameScreen.bossScore;
    this.screen = gameScreen;
    controls.setOffset(0, 0);
}    
    
/**
 * Draws the end screen for a game
 */
EndScreen.prototype.draw = function() {
    
    // Prevent IE bugs
    ui.ctx.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH, 0);

    // Draw the background
    ui.drawBackground();
    
    // Draw the title box
    var x = (ui.canvas.width - SIDEBAR_WIDTH) / 2;
    var y = ui.canvas.height / 2;
    ui.ctx.font = "70px Flipbash";
    ui.ctx.fillStyle = "#484848";
    ui.ctx.fillRect(x - 395, y - 300, 790, 110);
    ui.ctx.fillStyle = "#000000";
    ui.ctx.fillRect(x - 385, y - 290, 770, 90);
    
    // Draw the title
    ui.ctx.fillStyle = "#FFFFFF";
    ui.ctx.textAlign = 'center';
    ui.ctx.textBaseline = 'top';
    ui.ctx.fillText("Player Stats", x, y - 300);
    
    // Draw player stats
    var baseX = x - (players.length - 1) * 135;
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
    
        x = baseX + 270 * i;
        
        // Draw the boxes for the options
        ui.ctx.fillStyle = '#484848';
        ui.ctx.fillRect(x - 125, y - 170, 250, 500);
        ui.ctx.fillStyle = '#000';
        ui.ctx.fillRect(x - 115, y - 160, 230, 480);
        
        // Input
        var input = player.input;
        input.update();
        
        // Name
        ui.ctx.font = '32px Flipbash';
        ui.ctx.textAlign = 'center';
        ui.ctx.textBaseline = 'top';
        ui.ctx.fillStyle = player.color;
        ui.ctx.fillText(player.name, x, y - 150);
        
        // Stat titles
        ui.ctx.font = '24px Flipbash';
        ui.ctx.fillStyle = 'white';
        ui.ctx.textAlign = 'left';
        ui.ctx.fillText('Dmg Dealt', x - 105, y - 100);
        ui.ctx.fillText('Dmg Taken', x - 105, y - 25);
        ui.ctx.fillText('Dmg Blocked', x - 105, y + 50);
        ui.ctx.fillText('Kills', x - 105, y + 125);
        ui.ctx.fillText('Deaths', x - 105, y + 200);
        
        // Stat numbers
        ui.ctx.fillStyle = '#0f0';
        ui.ctx.fillText(player.damageDealt.toFixed(0), x - 105, y - 70);
        ui.ctx.fillText(player.damageTaken.toFixed(0), x - 105, y + 5);
        ui.ctx.fillText(player.damageAbsorbed.toFixed(0), x - 105, y + 80);
        ui.ctx.fillText(player.enemiesKilled, x - 105, y + 155);
        ui.ctx.fillText(player.deaths, x - 105, y + 230);
        
        // Returning to the title screen
        if (input.button(SELECT_1) == 1 || input.button(SELECT_2) == 1) {
            gameScreen = new TitleScreen();
        }
    }
    
    // Draw the cursor
    ui.ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Draw the stats
    ui.drawStatBar();
    
    // Cursor
    ui.drawCursor();
};