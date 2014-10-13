var endScreen = {
    
    score: 0,
    enemyManager: undefined,
    ui: undefined,
    
    // Sets up the end screen to show the stats of the given game screen
    setup: function(screen) {
        this.enemyManager = screen.enemyManager;
        this.ui = screen.ui;
        this.score = screen.score;
    },
    
    // Updates the end screen
    Update: function() {
    },
    
    // Draws the end screen
    Draw: function() {
        
        // Prevent IE bugs
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH, 0);

        // Draw the background
        if (tile && tile.width) {
            for (var i = 0; i < element.width / tile.width + 1; i++) {
                var x = i * tile.width;
                for (var j = 0; j < element.height / tile.height + 1; j++) {
                    canvas.drawImage(tile, x, j * tile.height);
                }
            }
        }
        
        // Draw the title box
        var x = (element.width - SIDEBAR_WIDTH) / 2;
        var y = element.height / 2;
        canvas.font = "70px Flipbash";
        canvas.fillStyle = "#484848";
        canvas.fillRect(x - 395, y - 300, 790, 110);
        canvas.fillStyle = "#000000";
        canvas.fillRect(x - 385, y - 290, 770, 90);
        
        // Draw the title
        canvas.fillStyle = "#FFFFFF";
        canvas.textAlign = 'center';
        canvas.textBaseline = 'top';
        canvas.fillText("Player Stats", x, y - 300);
        
        // Draw player stats
        var baseX = x - (playerManager.players.length - 1) * 135;
        for (var i = 0; i < playerManager.players.length; i++) {
            var player = playerManager.players[i].robot;
        
            x = baseX + 270 * i;
            
            // Draw the boxes for the options
            canvas.fillStyle = '#484848';
            canvas.fillRect(x - 125, y - 170, 250, 500);
            canvas.fillStyle = '#000';
            canvas.fillRect(x - 115, y - 160, 230, 480);
            
            // Input
            var input = playerManager.players[i].input;
            input.update();
            
            // Name
            canvas.font = '32px Flipbash';
            canvas.textAlign = 'center';
            canvas.textBaseline = 'top';
            canvas.fillStyle = player.color;
            canvas.fillText(player.name, x, y - 150);
            
            // Stat titles
            canvas.font = '24px Flipbash';
            canvas.fillStyle = 'white';
            canvas.textAlign = 'left';
            canvas.fillText('Dmg Dealt', x - 105, y - 100);
            canvas.fillText('Dmg Taken', x - 105, y - 25);
            canvas.fillText('Dmg Blocked', x - 105, y + 50);
            canvas.fillText('Kills', x - 105, y + 125);
            canvas.fillText('Deaths', x - 105, y + 200);
            
            // Stat numbers
            canvas.fillStyle = '#0f0';
            canvas.fillText(player.damageDealt.toFixed(0), x - 105, y - 70);
            canvas.fillText(player.damageTaken.toFixed(0), x - 105, y + 5);
            canvas.fillText(player.damageAbsorbed.toFixed(0), x - 105, y + 80);
            canvas.fillText(player.enemiesKilled, x - 105, y + 155);
            canvas.fillText(player.deaths, x - 105, y + 230);
            
            if (input.confirm) {
                gameScreen = new TitleScreen();
            }
        }
        
        // Draw the cursor
        canvas.setTransform(1, 0, 0, 1, 0, 0);
        
        // Draw the stats
        this.ui.DrawStatBar();
        
        // Cursor
        canvas.drawImage(cursor, mx - element.offsetLeft + pageScrollX - cursor.width / 2, my - element.offsetTop + pageScrollY - cursor.height / 2);
    }
};