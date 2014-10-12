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
        canvas.font = "50px Flipbash";
        canvas.fillStyle = "#FFFFFF";
        canvas.fillText("Kills", SIDEBAR_WIDTH / 2 - StringWidth("Kills", canvas.font) / 2, 50);
        canvas.fillRect(5, 55, SIDEBAR_WIDTH - 10, 2);
        canvas.fillStyle = "#00FF00"
        canvas.fillText(screen.score, (SIDEBAR_WIDTH - StringWidth(screen.score, canvas.font)) / 2, 100);
        
        // Boss countdown
        canvas.fillStyle = "#FFFFFF";
        canvas.fillText("Boss", SIDEBAR_WIDTH / 2 - StringWidth("Boss", canvas.font) / 2, 160);
        canvas.fillRect(5, 165, SIDEBAR_WIDTH - 10, 2);
        canvas.fillStyle = "#00FF00"
        canvas.fillText(screen.enemyManager.bossScore, (SIDEBAR_WIDTH - StringWidth(screen.enemyManager.bossScore, canvas.font)) / 2, 210);
        
        canvas.font = "30px Flipbash";
        
        // Spacing between upgrade counters
        var space = element.height - 220;
        var margin = Math.floor((space - 4 * 120) / 5);
        var extra = Math.floor((space - 480 - margin * 5) / 2) + 220;
        var interval = 120 + margin;
        
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
    
    // Draws the skill info for the player
    this.DrawSkillInfo = function() {
   
        /*
   
        // Skill Icon
        canvas.drawImage(this.skillIcon, 10, 60 - UI_WIDTH / 2, UI_WIDTH - 20, UI_WIDTH - 20);
    
        // Skill Duration
        if (player.skillDuration > 0) {
            canvas.fillStyle = '#00FF00';
            canvas.font = '30px Flipbash';
            var cd = Math.ceil(player.skillDuration / 60);
            canvas.fillText(cd, (UI_WIDTH - StringWidth(cd, canvas.font)) / 2, 65);
        }
        
        // Skill Cooldown
        else if (player.skillCd > 0) {
            canvas.fillStyle = '#FFFFFF';
            canvas.font = '30px Flipbash';
            var cd = Math.ceil(player.skillCd / 60);
            canvas.fillText(cd, (UI_WIDTH - StringWidth(cd, canvas.font)) / 2, 65);
        }
        
        */
    };
    
    this.DrawDroneInfo = function() {
    
        canvas.fillStyle = '#FFFFFF';
        canvas.font = '30px Flipbash';
        if (screen.player.drones.length < 6) {
            var droneImg = this.droneImgs[screen.player.drones.length % 3];
            canvas.drawImage(droneImg, (UI_WIDTH - droneImg.width) / 2, 55 - droneImg.height / 2);
            var left = screen.player.droneTarget - screen.player.droneCounter;
            canvas.fillText(left, (UI_WIDTH - StringWidth(left, canvas.font)) / 2, 65);
        }
        else canvas.fillText("MAX", (UI_WIDTH - StringWidth("MAX", canvas.font)) / 2, 65);
    };
}