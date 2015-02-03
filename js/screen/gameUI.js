depend('data/images');

// Handles drawing the UI in the game
var ui = {

	// UI canvas
	this.canvas = undefined;
	this.ctx = undefined;
	
    this.ready = undefined;
    this.hovered = undefined;
    this.start = undefined;
    this.upgradeAlpha = 0;
	
    // Draws the sidebar with the upgrades
    drawStatBar: function() {

        // Background
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, SIDEBAR_WIDTH, WINDOW_HEIGHT);

        // Score
        this.ctx.font = "24px Flipbash";
        this.ctx.fillStyle = "#fff";
        this.ctx.textBaseline = 'alphabetic';
        this.ctx.textAlign = 'left';
        this.ctx.fillText("Kills", 10, 30);
        this.ctx.fillText("Boss", SIDEBAR_WIDTH - StringWidth("Boss", this.ctx.font) - 10, 30);
        this.ctx.fillRect(5, 35, SIDEBAR_WIDTH - 10, 2);
        this.ctx.fillStyle = "#0f0"
        this.ctx.font = '20px Flipbash';
        this.ctx.fillText(gameScreen.score, 10, 70);
        this.ctx.fillText(gameScreen.bossScore, SIDEBAR_WIDTH - StringWidth(gameScreen.bossScore, this.ctx.font) - 10, 70);

        this.ctx.font = "30px Flipbash";

        // Spacing between upgrade counters
        var base = 120;
        var space = element.height - base - 10;
        var interval = Math.min(255, space / players.length);

        // Player stats
        for (var i = 0; i < players.length; i++) {
            var player = players[i];

            var y = base + interval * i;

            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(5, y - 35, SIDEBAR_WIDTH - 10, 2);

            // Name
            this.ctx.font = '32px Flipbash';
            this.ctx.fillStyle = player.color;
            this.ctx.textAlign = 'left';
            this.ctx.fillText(player.profile.name, 10, y);

            // Level
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Flipbash';
            this.ctx.fillText('Level: ' + player.level, 10, y + 25);

            // Health
            this.ctx.fillText('HP: ' + player.health.toFixed(0) + '/' + player.maxHealth, 10, y + 50);

            if (player.icons) {

                // Upgrade graph
                var graphHeight = interval - 105;
                var iconSize = graphHeight / 5;
                this.ctx.fillStyle = '#222';
                this.ctx.strokeStyle = '#666';
                this.ctx.lineWidth = 2;
                this.ctx.fillRect(iconSize + 10, y + 60, SIDEBAR_WIDTH - iconSize - 20, graphHeight);
                this.ctx.strokeRect(iconSize + 10, y + 60, SIDEBAR_WIDTH - iconSize - 20, graphHeight);

                // Draw icons on left
                this.ctx.fillStyle = '#f0f';
                for (var j = 0; j < 5; j++) {
                    var upImg = GetImage('upgrade' + player.icons[j]);
                    var current = player.upgrades[j];

                    this.ctx.drawImage(upImg, 5, y + 60 + iconSize * j, iconSize, iconSize);
                    this.ctx.fillStyle = (current == 10 ? '#0ff' : player.color);
                    this.ctx.fillRect(iconSize + 10, y + 60 + iconSize * (j + 0.2), (SIDEBAR_WIDTH - 50) * current / 10, iconSize * 0.6);
                }
            }
        }
    }

    // Sets up the end screen to show the stats of the given game screen
    this.SetupUpgradeUI = function() {
        this.gameScreen.paused = true;

        // Start off with no one ready
        this.upgradeAlpha = 0;
        this.ready = [];
        this.hovered = [];
        this.start = [];
        for (var i = 0; i < players.length; i++) {
            this.ready.push(false);
            this.hovered.push(0);
            var list = [];
            for (var j = 0; j < 5; j++) {
                list.push(players[i].upgrades[j]);
            }
            this.start.push(list);
        }
    },

	// Draws the upgrade UI for the game
	this.DrawUpgradeUI = function() {

		this.upgradeAlpha = Math.min(1, this.upgradeAlpha + 0.02);

		this.ctx.globalAlpha = this.upgradeAlpha;

		// Draw the title box
		var x = (element.width + SIDEBAR_WIDTH) / 2;
		var y = element.height / 2;
		this.ctx.font = "40px Flipbash";
		this.ctx.fillStyle = "#484848";
		this.ctx.fillRect(x - 395, y - 380, 790, 80);
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(x - 385, y - 370, 770, 60);

		// Draw the title
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'top';
		this.ctx.fillText("Upgrades", x, y - 380);

		// Draw player stats
		var baseX = x - (players.length - 1) * 135;
		for (var i = 0; i < players.length; i++) {
			var player = players[i];

			x = baseX + 270 * i;

			// Draw the boxes for the options
			this.ctx.fillStyle = '#484848';
			this.ctx.fillRect(x - 125, y - 280, 250, 600);
			this.ctx.fillStyle = (this.ready[i] ? '#666' : '#000');
			this.ctx.fillRect(x - 115, y - 270, 230, 580);

			// Input
			var input = players[i].input;

			// Name
			this.ctx.font = '32px Flipbash';
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'top';
			this.ctx.fillStyle = player.color;
			this.ctx.fillText(player.name, x, y - 260);

			// Points
			this.ctx.font = '24px Flipbash';
			this.ctx.fillStyle = 'white';
			this.ctx.fillText('Points: ' + player.points, x, y - 220);

			// Upgrades
			for (var j = 0; j < 5; j++) {
				for (var k = 0; k < 10; k++) {
					var upped = player.upgrades[j] > k;
					var newUpped = upped && this.start[i][j] <= k;
					this.ctx.drawImage(GetImage((newUpped ? 'Full' : (upped ? player.name : 'Empty')) + 'Bar'), x + 17 * k - 57, y - 150 + j * 90);
				}
				var img = GetImage(player.name + player.ups[j] + 'UI' + (this.hovered[i] == j ? 'Selected' : ''));
				this.ctx.drawImage(img, x - 115, y - 175 + j * 90);
			}

			// Ready button
			this.ctx.fillStyle = '#484848';
			this.ctx.fillRect(x - 125, y + 300, 250, 80);
			this.ctx.fillStyle = (this.hovered[i] == 5 ? '#666' : '#000');
			this.ctx.fillRect(x - 115, y + 310, 230, 60);
			this.ctx.fillStyle = 'white';
			this.ctx.font = '32px Flipbash';
			this.ctx.fillText('Ready', x, y + 310);

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
		this.ctx.globalAlpha = 1;
	};
}