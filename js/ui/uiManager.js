// Handles drawing the UI in the game
function UIManager(screen) {

    // Health bar images
    this.healthTop = GetImage("healthTop");
    this.healthBottom = GetImage("healthBottom");
    this.healthRed = GetImage("healthr");
    this.healthGreen = GetImage("healthg");
    this.healthYellow = GetImage("healthy");
    this.healthBlue = GetImage("healthb");
    
    // Player upgrade/skill icons
    this.skillIcon = GetImage('ability' + screen.player.ability);
    this.upIcons = [];
    for (var i = 0; i < DROP_COUNT; i++) {
        this.upIcons.push(GetImage("icon" + screen.player.drops[DROP_VALUES * i + DROP_TYPE]));
    }
    
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
        canvas.fillText(screen.bossScore, (SIDEBAR_WIDTH - StringWidth(screen.bossScore, canvas.font)) / 2, 210);
        
        canvas.font = "30px Flipbash";
        
        // Spacing between upgrade counters
        var space = element.height - 220;
        var margin = Math.floor((space - 4 * 120) / 5);
        var extra = Math.floor((space - 480 - margin * 5) / 2) + 220;
        var interval = 120 + margin;
        
        // Upgrade counters
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
    }

    // Draws the health bar
    this.DrawHealthBar = function() {

        // Move to the sidebar location
        canvas.translate(WINDOW_WIDTH + SIDEBAR_WIDTH, 0);
        
        // Background
        canvas.fillStyle = "#000000";
        canvas.fillRect(0, 0, UI_WIDTH, WINDOW_HEIGHT);
        
        // Top and bottom images
        canvas.drawImage(this.healthTop, 0, 110);
        canvas.drawImage(this.healthBottom, 0, element.height - this.healthBottom.height);
       
        // Get measurements
        var space = element.height - this.healthTop.height - this.healthBottom.height - 110;
        var blocks = Math.floor(space / (this.healthBlue.height + 4));
        if (blocks < 1) {
            blocks = 1;
        }
        var margin = Math.floor((space - blocks * this.healthBlue.height) / (blocks + 1));
        var extra = Math.floor((space - blocks * this.healthBlue.height - margin * (blocks + 1)) / 2) + 110;
        var percent = 100 * screen.player.health / screen.player.maxHealth;
        var shield = 100 * screen.player.shield / (screen.player.maxHealth * SHIELD_MAX);
        
        // Draw each health box individually
        for (var i = 0; i < blocks; i++) {
            var y = this.healthTop.height + extra + margin + (this.healthBlue.height + margin) * i;
            if (shield * blocks > 100 * (blocks - 1 - i)) {
                canvas.drawImage(this.healthBlue, 0, y);
            }
            else if (percent > 99 - i * 33 / blocks) {
                canvas.drawImage(this.healthGreen, 0, y);
            }
            else if (percent > 66 - i * 33 / blocks) {
                canvas.drawImage(this.healthYellow, 0, y);
            }
            else if (percent > 33 - i * 33 / blocks && percent > 0) {
                canvas.drawImage(this.healthRed, 0, y);
            }
        }
        
        // Reset the canvas transform
        canvas.setTransform(1, 0, 0, 1, 0, 0);
    };
    
    // Draws the skill info for the player
    this.DrawSkillInfo = function() {
    
        // Move to the sidebar location
        canvas.translate(WINDOW_WIDTH + SIDEBAR_WIDTH, 0);
    
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
        
        // Reset the canvas transform
        canvas.setTransform(1, 0, 0, 1, 0, 0);
    }
}