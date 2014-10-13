// Handles drawing the UI in the game
function UIManager(screen) {

    // Health bar images
    this.healthTop = GetImage("healthTop");
    this.healthBottom = GetImage("healthBottom");
    this.healthRed = GetImage("healthr");
    this.healthGreen = GetImage("healthg");
    this.healthYellow = GetImage("healthy");
    this.healthBlue = GetImage("healthb");
    
    // Drone images
    this.droneImgs = [
        GetImage('droneAssaulter'),
        GetImage('droneHealer'),
        GetImage('droneShielder')
    ];
    
    // Player upgrade/skill icons
    /*
    if (screen.player.ability) {
        this.skillIcon = GetImage('ability' + screen.player.ability);
    }
    */
    this.upIcons = [];
    /*
    for (var i = 0; i < DROP_COUNT; i++) {
        this.upIcons.push(GetImage("icon" + screen.player.drops[DROP_VALUES * i + DROP_TYPE]));
    }
    */
    
    
    // Draws the sidebar with the upgrades
    this.DrawStatBar = function() {

        // Background
        canvas.fillStyle = "#000000";
        canvas.fillRect(0, 0, SIDEBAR_WIDTH, WINDOW_HEIGHT);

        // Score
        //canvas.drawImage(scoreTitle, 20, 0);
        canvas.font = "24px Flipbash";
        canvas.fillStyle = "#fff";
        canvas.fillText("Kills", 10, 30);
        canvas.fillText("Boss", SIDEBAR_WIDTH - StringWidth("Boss", canvas.font) - 10, 30);
        canvas.fillRect(5, 35, SIDEBAR_WIDTH - 10, 2);
        canvas.fillStyle = "#0f0"
        canvas.font = '20px Flipbash';
        canvas.fillText(screen.score, 10, 70);
        canvas.fillText(screen.enemyManager.bossScore, SIDEBAR_WIDTH - StringWidth(screen.enemyManager.bossScore, canvas.font) - 10, 70);
        
        canvas.font = "30px Flipbash";
        
        // Spacing between upgrade counters
        var base = 120;
        var space = element.height - base - 10;
        var interval = Math.min(255, space / playerManager.players.length);
        
        // Player stats
        for (var i = 0; i < playerManager.players.length; i++) {
            var player = playerManager.players[i].robot;
            
            var y = base + interval * i;
            
            canvas.fillStyle = 'white';
            canvas.fillRect(5, y - 35, SIDEBAR_WIDTH - 10, 2);
            
            // Name
            canvas.font = '32px Flipbash';
            canvas.fillStyle = player.color;
            canvas.textAlign = 'left';
            canvas.fillText(player.name, 10, y);
            
            // Health
            canvas.fillStyle = 'white';
            canvas.font = '16px Flipbash';
            canvas.fillText('HP: ' + player.health.toFixed(0) + '/' + player.maxHealth, 10, y + 25);
            
            // Damage
            canvas.fillText('DMG: x ' + player.GetDamageMultiplier().toFixed(1), 10, y + 50);
            
            // Upgrade graph
            var graphHeight = interval - 105;
            var iconSize = graphHeight / 5;
            canvas.fillStyle = '#222';
            canvas.strokeStyle = '#666';
            canvas.lineWidth = 2;
            canvas.fillRect(iconSize + 10, y + 60, SIDEBAR_WIDTH - iconSize - 20, graphHeight);
            canvas.strokeRect(iconSize + 10, y + 60, SIDEBAR_WIDTH - iconSize - 20, graphHeight);
            
            // Draw icons on left
            canvas.fillStyle = '#f0f';
            for (var j = 0; j < 5; j++) {
                var upImg = GetImage('upgrade' + player.drops[j * DROP_VALUES + DROP_TYPE]);
                var max = player.drops[j * DROP_VALUES + DROP_MAX];
                var current = player.upgrades[j];
                
                canvas.drawImage(upImg, 5, y + 60 + iconSize * j, iconSize, iconSize);
                canvas.fillRect(iconSize + 10, y + 60 + iconSize * (j + 0.2), (SIDEBAR_WIDTH - 50) * current / max, iconSize * 0.6);
            }
        }
        
        // Upgrade counters
        /*
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 2; j++) {
                var index = i * 2 + j;
                var ups = screen.player.upgrades[index];
                var max = screen.player.drops[index * DROP_VALUES + DROP_MAX];
                if (max > 0 && ups >= max) {
                    ups = "Max";
                }
                canvas.drawImage(this.upIcons[index], 10 + 100 * j, margin + extra + interval * i);
                canvas.fillText(ups, 50 + 100 * j - StringWidth(ups) / 2, margin + extra + 110 + interval * i);
            }
        }
        */
    }
    
    this.DrawDroneInfo = function() {
    
        canvas.fillStyle = '#FFFFFF';
        canvas.font = '30px Flipbash';
        var player = playerManager.players[0].robot;
        if (player.drones.length < 6) {
            var droneImg = this.droneImgs[player.drones.length % 3];
            canvas.drawImage(droneImg, (SIDEBAR_WIDTH - droneImg.width) / 2, WINDOW_HEIGHT - droneImg.height - 20);
            var left = player.droneTarget - player.droneCounter;
            canvas.fillText(left, (SIDEBAR_WIDTH - StringWidth(left, canvas.font)) / 2, WINDOW_HEIGHT - droneImg.height / 2 - 35);
        }
        else canvas.fillText("MAX", (SIDEBAR_WIDTH - StringWidth("MAX", canvas.font)) / 2, WINDOW_HEIGHT - droneImg.height / 2 - 35);
    };
}