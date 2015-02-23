depend('data/images');

// Handles drawing the UI in the game
var ui = {

    // UI canvas
    canvas: undefined,
    ctx: undefined,
    
    ready: undefined,
    hovered: undefined,
    start: undefined,
    upgradeAlpha: 0,
    cursor: GetImage('cursor'),
    
    /**
     * Clears the UI canvas
     */
    clear: function() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    
    /**
     * Draws the background of the game
     */ 
    drawBackground: function() {
        var modX = -camera.pos.x - (-camera.pos.x) % TILE.width;
        var modY = -camera.pos.y - (-camera.pos.y) % TILE.height;
        if (TILE && TILE.width) {
            var width = camera.canvas.width;
            var height = camera.canvas.height;
            for (var i = -1; i < width / TILE.width + 3; i++) {
                var x = i * TILE.width;
                for (var j = -1; j < height / TILE.height + 3; j++) {
                    var y = j * TILE.height;
                    TILE.moveTo(x + modX, y + modY);
                    TILE.draw(camera);
                }
            }
        }
    },
    
    /**
     * Draws the overlay for a paused game with the provided player
     * as the one who paused it.
     * 
     * @param {Player} player - the player who paused the game
     */
    drawPauseOverlay: function(player) {
        ui.ctx.globalAlpha = 0.65;
        ui.ctx.fillStyle = 'black';
        ui.ctx.fillRect(SIDEBAR_WIDTH, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        ui.ctx.globalAlpha = 1;
        ui.ctx.fillStyle = 'white';
        ui.ctx.font = '48px Flipbash';
        ui.ctx.textAlign = 'center';
        ui.ctx.fillText('Paused By', WINDOW_WIDTH / 2 + SIDEBAR_WIDTH, WINDOW_HEIGHT / 2 - 50);
        ui.ctx.fillStyle = gameScreen.paused.color;
        ui.ctx.fillText(gameScreen.paused.name, WINDOW_WIDTH / 2 + SIDEBAR_WIDTH, WINDOW_HEIGHT / 2 + 20);
    },
    
    /**
     * Draws the UI cursor
     */
    drawCursor: function() {
        if (keyboardActive) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.drawImage(this.cursor, controls.mouse.x - this.cursor.width / 2, controls.mouse.y - this.cursor.height / 2);
        }
    },

    /**
     * Draws the HUDs around each player
     */
    drawPlayerHUDs: function() {
    
        this.ctx.translate(SIDEBAR_WIDTH + gameScreen.scrollX, gameScreen.scrollY);
    
        for (var i = 0; i < players.length; i++) {
        
            var player = players[i];
            
            // Draw level up effect
            if (player.levelFrame >= 0) {
                var circleFrame = player.levelFrame % 15;
                ui.ctx.globalAlpha = 1 - 0.06 * circleFrame;
                ui.ctx.fillStyle = '#6ff';
                ui.ctx.beginPath();
                ui.ctx.arc(player.pos.x, player.pos.y, circleFrame * 5, 0, Math.PI * 2);
                ui.ctx.fill();

                var img = GetImage('LevelUpWords');
                ui.ctx.translate(player.pos.x, player.pos.y);
                angle = 0;
                if (player.levelFrame < 30) angle = Math.PI * ((30 - player.levelFrame) / 30);
                ui.ctx.rotate(angle);
                ui.ctx.globalAlpha = 1;
                if (player.levelFrame > 150) ui.ctx.globalAlpha = 1 - (player.levelFrame - 150) / 60;
                ui.ctx.drawImage(img, -img.width / 2, -120);
                ui.ctx.globalAlpha = 1;
                ui.ctx.setTransform(1, 0, 0, 1, 0, 0);
                ui.ctx.translate(SIDEBAR_WIDTH + gameScreen.scrollX, gameScreen.scrollY);

                player.levelFrame++;
                if (player.levelFrame >= 210) {
                    player.levelFrame = -1;
                }
            }

            // Damage effect
            if (player.damageAlpha > 0) {
                ui.ctx.globalAlpha = player.damageAlpha;
                ui.ctx.drawImage(GetImage('damage'), player.pos.x - 75, player.pos.y - 75, 150, 150);
                ui.ctx.globalAlpha = 1;
                player.damageAlpha -= DAMAGE_ALPHA_DECAY;
            }
            
            // Draw HUD if alive
            if (player.health > 0) {

                // Health bar
                ui.ctx.lineWidth = 3;
                var healthPercent = player.health / player.maxHealth;
                var shieldPercent = player.shield / (player.maxHealth * SHIELD_MAX);
                ui.ctx.beginPath();
                ui.ctx.arc(player.pos.x, player.pos.y, 75, ((1 - healthPercent) * Math.PI * 8 / 10) - Math.PI * 9 / 10, -Math.PI / 10, false);
                if (healthPercent > 0.66) ui.ctx.strokeStyle = '#0f0';
                else if (healthPercent > 0.33) ui.ctx.strokeStyle = '#ff0';
                else ui.ctx.strokeStyle = '#f00';
                ui.ctx.stroke();
                ui.ctx.beginPath();
                ui.ctx.arc(player.pos.x, player.pos.y, 75, Math.PI / 10, Math.PI / 10 + shieldPercent * Math.PI * 8 / 10);
                ui.ctx.strokeStyle = '#00f';
                ui.ctx.stroke();
                ui.ctx.drawImage(GetImage('healthBarSymbol'), player.pos.x + 50, player.pos.y - 20);

                // Draw skill icon
                if (player.ability) {
                    if (player.skillCd > 0) {
                        ui.ctx.globalAlpha = 0.5;
                    }
                    ui.ctx.drawImage(GetImage('ability' + player.ability), player.pos.x - 95, player.pos.y - 20, 40, 40);
                    ui.ctx.globalAlpha = 1;

                    // Skill cooldown/duration
                    var num;
                    if (player.skillDuration > 0) {
                        num = player.skillDuration / 60;
                        ui.ctx.fillStyle = '#0f0';
                    }
                    else {
                        num = player.skillCd / 60;
                        ui.ctx.fillStyle = '#fff';
                    }
                    if (num > 0) {
                        ui.ctx.font = '24px Flipbash';
                        if (num < 10) {
                            num = num.toFixed(1);
                        }
                        else num = num.toFixed(0);
                        ui.ctx.fillText(num, player.pos.x - 75 - ui.ctx.measureText(num).width / 2, player.pos.y + 10);
                    }
                }
            }

            // Otherwise draw rescue circle
            else {
                ui.ctx.strokeStyle = 'white';
                ui.ctx.lineWidth = 3;
                ui.ctx.beginPath();
                ui.ctx.arc(player.pos.x, player.pos.y, 100, 0, Math.PI * 2 * player.rescue);
                ui.ctx.stroke();
            }
        }
        
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
    
    /** 
     * Draws health bars for all active enemies
     */
    drawEnemyHealth: function() {
        var r;
        this.ctx.translate(SIDEBAR_WIDTH + gameScreen.scrollX, gameScreen.scrollY);
        for (var i = 0; i < gameScreen.robots.length; i++) {
            r = gameScreen.robots[i];
            if (r.type == Robot.PLAYER || r.health >= r.maxHealth || r.health <= 0) continue;
            var greenWidth = r.width * r.health / r.maxHealth;
            this.ctx.fillStyle = "#00FF00";
            this.ctx.fillRect(r.pos.x - r.width / 2, r.pos.y - r.height / 2 - 10, greenWidth, 5);
            this.ctx.fillStyle = "#FF0000";
            this.ctx.fillRect(r.pos.x + greenWidth - r.width / 2, r.pos.y - r.height / 2 - 10, r.width - greenWidth, 5);
        }
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
    
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
        this.ctx.fillText("Boss", SIDEBAR_WIDTH - this.ctx.measureText("Boss").width - 10, 30);
        this.ctx.fillRect(5, 35, SIDEBAR_WIDTH - 10, 2);
        this.ctx.fillStyle = "#0f0"
        this.ctx.font = '20px Flipbash';
        this.ctx.fillText(gameScreen.score, 10, 70);
        this.ctx.fillText(gameScreen.bossScore, SIDEBAR_WIDTH - this.ctx.measureText(gameScreen.bossScore).width - 10, 70);

        this.ctx.font = "30px Flipbash";

        // Spacing between upgrade counters
        var base = 120;
        var space = this.canvas.height - base - 10;
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
    },

    // Sets up the end screen to show the stats of the given game screen
    setupUpgradeUI: function() {
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
    drawUpgradeUI: function() {

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
    }
}