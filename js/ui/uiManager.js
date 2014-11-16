// Handles drawing the UI in the game
function UIManager(screen) {

	this.screen = screen;
	this.ready = undefined;
	this.hovered = undefined;
	this.start = undefined;
	this.upgradeAlpha = 0;
    
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
        canvas.textBaseline = 'alphabetic';
        canvas.textAlign = 'left';
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
            canvas.fillText(player.profile.name, 10, y);
            
			// Level
			canvas.fillStyle = 'white';
            canvas.font = '16px Flipbash';
			canvas.fillText('Level: ' + player.level, 10, y + 25);
			
            // Health
            canvas.fillText('HP: ' + player.health.toFixed(0) + '/' + player.maxHealth, 10, y + 50);
            
			if (player.icons) {
			
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
					var upImg = GetImage('upgrade' + player.icons[j]);
					var current = player.upgrades[j];
					
					canvas.drawImage(upImg, 5, y + 60 + iconSize * j, iconSize, iconSize);
					canvas.fillStyle = (current == 10 ? '#0ff' : player.color);
					canvas.fillRect(iconSize + 10, y + 60 + iconSize * (j + 0.2), (SIDEBAR_WIDTH - 50) * current / 10, iconSize * 0.6);
				}
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
		var droneImg = this.droneImgs[player.drones.length % 3];
        if (player.drones.length < 6) {
            canvas.drawImage(droneImg, (SIDEBAR_WIDTH - droneImg.width) / 2, WINDOW_HEIGHT - droneImg.height - 20);
            var left = player.droneTarget - player.droneCounter;
            canvas.fillText(left, (SIDEBAR_WIDTH - StringWidth(left, canvas.font)) / 2, WINDOW_HEIGHT - droneImg.height / 2 - 35);
        }
        else canvas.fillText("MAX", (SIDEBAR_WIDTH - StringWidth("MAX", canvas.font)) / 2, WINDOW_HEIGHT - droneImg.height / 2 - 35);
    };
	
	 // Sets up the end screen to show the stats of the given game screen
    this.SetupUpgradeUI = function() {
		this.screen.paused = true;
		
		// Start off with no one ready
		this.upgradeAlpha = 0;
		this.ready = [];
		this.hovered = [];
		this.start = [];
		for (var i = 0; i < playerManager.players.length; i++) {
			this.ready.push(false);
			this.hovered.push(0);
			var list = [];
			for (var j = 0; j < 5; j++) {	
				list.push(playerManager.players[i].robot.upgrades[j]);
			}
			this.start.push(list);
		}
    },
	
	// Draws the upgrade UI for the game
	this.DrawUpgradeUI = function() {
	
		this.upgradeAlpha = Math.min(1, this.upgradeAlpha + 0.02);
		
		canvas.globalAlpha = this.upgradeAlpha;
	
		// Draw the title box
        var x = (element.width + SIDEBAR_WIDTH) / 2;
        var y = element.height / 2;
        canvas.font = "40px Flipbash";
        canvas.fillStyle = "#484848";
        canvas.fillRect(x - 395, y - 380, 790, 80);
        canvas.fillStyle = "#000000";
        canvas.fillRect(x - 385, y - 370, 770, 60);
        
        // Draw the title
        canvas.fillStyle = "#FFFFFF";
        canvas.textAlign = 'center';
        canvas.textBaseline = 'top';
        canvas.fillText("Upgrades", x, y - 380);
        
        // Draw player stats
        var baseX = x - (playerManager.players.length - 1) * 135;
        for (var i = 0; i < playerManager.players.length; i++) {
            var player = playerManager.players[i].robot;
        
            x = baseX + 270 * i;
            
            // Draw the boxes for the options
            canvas.fillStyle = '#484848';
            canvas.fillRect(x - 125, y - 280, 250, 600);
            canvas.fillStyle = (this.ready[i] ? '#666' : '#000');
            canvas.fillRect(x - 115, y - 270, 230, 580);
            
            // Input
            var input = playerManager.players[i].input;
            
            // Name
            canvas.font = '32px Flipbash';
            canvas.textAlign = 'center';
            canvas.textBaseline = 'top';
            canvas.fillStyle = player.color;
            canvas.fillText(player.name, x, y - 260);
			
			// Points
			canvas.font = '24px Flipbash';
			canvas.fillStyle = 'white';
			canvas.fillText('Points: ' + player.points, x, y - 220);
			
			// Upgrades
			for (var j = 0; j < 5; j++) {
				for (var k = 0; k < 10; k++) {
					var upped = player.upgrades[j] > k;
					var newUpped = upped && this.start[i][j] <= k;
					canvas.drawImage(GetImage((newUpped ? 'Full' : (upped ? player.name : 'Empty')) + 'Bar'), x + 17 * k - 57, y - 150 + j * 90);
				}
				var img = GetImage(player.name + player.ups[j] + 'UI' + (this.hovered[i] == j ? 'Selected' : ''));
				canvas.drawImage(img, x - 115, y - 175 + j * 90);
			}
			
			// Ready button
			canvas.fillStyle = '#484848';
			canvas.fillRect(x - 125, y + 300, 250, 80);
			canvas.fillStyle = (this.hovered[i] == 5 ? '#666' : '#000');
			canvas.fillRect(x - 115, y + 310, 230, 60);
			canvas.fillStyle = 'white';
			canvas.font = '32px Flipbash';
			canvas.fillText('Ready', x, y + 310);
            
			if (input.up == 1 && this.hovered[i] > 0 && !this.ready[i]) {
				this.hovered[i]--;
			}
			if (input.down == 1 && this.hovered[i] < 5 && !this.ready[i]) {
				this.hovered[i]++;
			}
			
            if (input.confirm == 1 || (input.right == 1 && input.id === undefined)) {
                if (this.hovered[i] < 5) {
					if (player.points > 0 && player.upgrades[this.hovered[i]] < 10) {	
						player.upgrades[this.hovered[i]]++;
						player.points--;
					}
				}
				else if (input.confirm == 1) {
					this.ready[i] = true;
					
					var allReady = true;
					for (var j = 0; j < this.ready.length; j++) {
						if (!this.ready[j]) allReady = false;
					}
					if (allReady) {
						gameScreen = this.screen;
						gameScreen.paused = false;
					}
				}
            }
			if (input.cancel == 1 || (input.left == 1 && input.id === undefined)) {
				if (this.hovered[i] < 5) {
					if (player.upgrades[this.hovered[i]] > this.start[i][this.hovered[i]]) {
						player.upgrades[this.hovered[i]]--;
						player.points++;
					}
				}
				else if (input.cancel == 1) this.ready[i] = false;
			}
        }
        
		// Reset the alpha
		canvas.globalAlpha = 1;
	};
}