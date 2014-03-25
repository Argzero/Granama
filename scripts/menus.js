// Loading screen for loading all assets before starting the game
function LoadingScreen() {

    this.images = new Array(
        'bossDragonBoomerangLeft.png',
        'bossDragonBoomerangRight.png',
        'bossDragonEnd.png',
        'bossDragonGun.png',
        'bossDragonHead.png',
        'bossDragonLeftWing.png',
        'bossDragonRightWing.png',
        'bossDragonSegment.png',
        'bossDragonTurret.png',
        'bossFire.png',
        'bossFlame.png',
        'bossHeavy.png',
        'bossLaser.png',
        'bossMine.png',
        'bossPunch.png',
        'bossTailEnd.png',
        'bossTailMid.png',
        'bullet.png',
        'controls.png',
        'controlsScreen.png',
        'credits.png',
        'creditsScreen.png',
        'cursor.png',
        'damage.png',
        'enemyHeavyArtillery.png',
        'enemyHeavyBomber.png',
        'enemyHeavyMelee.png',
        'enemyHeavyRanged.png',
        'enemyLightArtillery.png',
        'enemyLightBomber.png',
        'enemyLightMelee.png',
        'enemyLightRanged.png',
        'enemyPaladin.png',
        'enemyRailer.png',
        'enemyTurret.png',
        'EX1.png',
        'EX10.png',
        'EX2.png',
        'EX3.png',
        'EX4.png',
        'EX5.png',
        'EX6.png',
        'EX7.png',
        'EX8.png',
        'EX9.png',
        'fire.png',
        'fistLeft.png',
        'fistRight.png',
        'hammer.png',
        'healthb.png',
        'healthBottom.png',
        'healthg.png',
        'healthr.png',
        'healthTop.png',
        'healthy.png',
        'HeavyBomberMine.png',
        'iconDamage.png',
        'iconFlamethrower.png',
        'iconHeal.png',
        'iconHealth.png',
        'iconLaser.png',
        'iconShield.png',
        'iconSpeed.png',
        'iconSpread.png',
        'laser.png',
        'LightBomberMine.png',
        'pause.png',
        'pDefense.png',
        'pDefenseBody.png',
        'pDefenseFlame.png',
        'pDefenseLaser.png',
        'pDefenseShield.png',
        'pDefenseSpread.png',
        'play.png',
        'pPower.png',
        'pPowerBody.png',
        'pPowerFlame.png',
        'pPowerLaser.png',
        'pPowerShield.png',
        'pPowerSpread.png',
        'pSpeed.png',
        'pSpeedBody.png',
        'pSpeedFlame.png',
        'pSpeedLaser.png',
        'pSpeedShield.png',
        'pSpeedSpread.png',
        'rocket.png',
        'scoreTitle.png',
        'tile.png',
        'title.png',
        'turretBase.png',
        'turretGun.png',
        'upgradeBuzzsaw.png',
        'upgradeDamage.png',
        'upgradeFlamethrower.png',
        'upgradeHeal.png',
        'upgradeHealth.png',
        'upgradeLaser.png',
        'upgradeShield.png',
        'upgradeSpeed.png',
        'upgradeSpread.png',
        'wallHorizontal.png',
        'wallVertical.png'
    );
    this.index = 0;
    this.img = new Image();
    this.img.onload = function() {
        screen.index++;
        if (screen.index < screen.images.length) {
            screen.img.src = 'images/' + screen.images[screen.index];
        }
    }
    this.img.src = 'images/' + this.images[0];
    
    // Updates the loading screen
    this.Update = Update;
    function Update() {
        if (this.index == this.images.length) {
            screen = new TitleScreen();
        }
    }
    
    // Draws the loading screen
    this.Draw = Draw;
    function Draw() {
    
        // Prevent IE bugs
        canvas.setTransform(1, 0, 0, 1, 0, 0);
        
        var cx = mx - element.offsetLeft + pageScrollX;
        var cy = my - element.offsetTop + pageScrollY;
        
        var wx = element.width / 2;
        var wy = element.height / 2;
        
        // Draw the background
        if (tile && tile.width) {
            for (var i = 0; i < element.width / tile.width + 1; i++) {
                var x = i * tile.width;
                for (var j = 0; j < element.height / tile.height + 1; j++) {
                    canvas.drawImage(tile, x, j * tile.height);
                }
            }
        }
        
        canvas.font = '50px Flipbash';
        canvas.fillStyle = '#FFFFFF';
        var text = Math.round(100 * this.index / this.images.length) + '%';
        canvas.fillText(text, (element.width - StringWidth(text, canvas.font)) / 2, element.height / 2);
        
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}

// The title screen for the game
function TitleScreen() {

    this.imgTitle = GetImage("title");
    this.imgCredits = GetImage("credits");
    this.imgControls = GetImage("controls");
    this.imgPlay = GetImage("play");

    // Draws the title screen
    this.Draw = Draw;
    function Draw() {
        
        // Prevent IE bugs
        canvas.setTransform(1, 0, 0, 1, 0, 0);
        
        var cx = mx - element.offsetLeft + pageScrollX;
        var cy = my - element.offsetTop + pageScrollY;
        
        var wx = element.width / 2;
        var wy = element.height / 2;
        
        var x1 = wx - 310;
        var xBounds = cx > x1 && cx < x1 + 620;
        
        // Draw the background
        if (tile && tile.width) {
            for (var i = 0; i < element.width / tile.width + 1; i++) {
                var x = i * tile.width;
                for (var j = 0; j < element.height / tile.height + 1; j++) {
                    canvas.drawImage(tile, x, j * tile.height);
                }
            }
        }
        
        canvas.translate(0, 15);
        
        // Draw the title image
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(x1, wy - 270, 620, 40 + this.imgTitle.height);
        canvas.fillStyle = BUTTON_BG;
        canvas.fillRect(x1 + 10, wy - 260, 600, 20 + this.imgTitle.height);
        canvas.drawImage(this.imgTitle, wx - this.imgTitle.width / 2, wy - 250);
        
        // Draw the play button
        var playHovered = xBounds && cy > wy - 80 && cy < wy - 40 + this.imgPlay.height;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(x1, wy - 80, 620, 40 + this.imgPlay.height);
        canvas.fillStyle = playHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(x1 + 10, wy - 70, 600, 20 + this.imgPlay.height);
        canvas.drawImage(this.imgPlay, wx - this.imgPlay.width / 2, wy - 60);
        
        // Draw the controls button
        var controlsHovered = xBounds && cy > wy + 40 && cy < wy + 80 + this.imgControls.height;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(x1, wy + 40, 620, 40 + this.imgControls.height);
        canvas.fillStyle = controlsHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(x1 + 10, wy + 50, 600, 20 + this.imgControls.height);
        canvas.drawImage(this.imgControls, wx - this.imgControls.width / 2, wy + 60);
        
        // Draw the credits button
        var creditsHovered = xBounds && cy > wy + 160 && cy < wy + 200 + this.imgCredits.height;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(x1, wy + 160, 620, 40 + this.imgCredits.height);
        canvas.fillStyle = creditsHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(x1 + 10, wy + 170, 600, 20 + this.imgCredits.height);
        canvas.drawImage(this.imgCredits, wx - this.imgCredits.width / 2, wy + 180);
        
        canvas.translate(0, -15);
        
        // Unmarks the left mouse button as pressed
        if (!KeyPressed(KEY_LMB)) {
            escDown = false;
        }
        
        // Button interactions
        if (KeyPressed(KEY_LMB) && !escDown) {
            if (playHovered) {
                screen = new SelectScreen();
            }
            else if (controlsHovered) {
                screen = new ControlsScreen();
            }
            else if (creditsHovered) {
                screen = new CreditsScreen();
            }
            escDown = true;
        }
        
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}

// The controls screen
function CreditsScreen() {

    this.credits = GetImage("creditsScreen");

    // Draws the controls screen
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
        
        // Draw the main section
        var scale = (element.height - 140) / this.credits.height;
        var scale2 = (element.width - 20) / this.credits.width;
        if (scale2 < scale) {
            scale = scale2;
        }
        canvas.drawImage(this.credits, (element.width - this.credits.width * scale) / 2, 10, this.credits.width * scale, this.credits.height * scale);
        
        var cx = mx - element.offsetLeft + pageScrollX;
        var cy = my - element.offsetTop + pageScrollY;
        
        var wx = element.width / 2;
        var wy = element.height / 2;
        
        var bw = (element.width - 40) / 2;
        if (bw > this.credits.width * scale / 2 - 10) {
            bw = this.credits.width * scale / 2 - 10;
        }
        var by = this.credits.height * scale + 20;
        
        // Back button
        var backHovered = cx < wx - 10 && cx > wx - bw - 10 && cy > by && cy < by + 80;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(wx - bw - 10, by, bw, 80);
        canvas.fillStyle = backHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(wx - bw, by + 10, bw - 20, 60);
        canvas.fillStyle = "#FFFFFF";
        canvas.font = "50px Flipbash";
        canvas.fillText("Back", wx - 10 - bw / 2 - StringWidth("Back", canvas.font) / 2, by + 60);
        
        // Play button
        var playHovered = cx > wx + 10 && cx < wx + bw + 10 && cy > by && cy < by + 80;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(wx + 10, by, bw, 80);
        canvas.fillStyle = playHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(wx + 20, by + 10, bw - 20, 60);
        canvas.fillStyle = "#FFFFFF";
        canvas.font = "50px Flipbash";
        canvas.fillText("Play", wx + 10 + bw / 2 - StringWidth("Play", canvas.font) / 2, by + 60);
        
        // Unmarks the left mouse button as pressed
        if (!KeyPressed(KEY_LMB)) {
            escDown = false;
        }
        
        // Button interactions
        if (KeyPressed(KEY_LMB) && !escDown) {
            if (playHovered) {
                screen = new SelectScreen();
            }
            else if (backHovered) {
                screen = new TitleScreen();
            }
            escDown = true;
        }
        
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}

// The controls screen
function ControlsScreen() {

    this.controls = GetImage("controlsScreen");

    // Draws the controls screen
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
        
        // Draw the main section
        var scale = (element.height - 140) / this.controls.height;
        var scale2 = (element.width - 20) / this.controls.width;
        if (scale2 < scale) {
            scale = scale2;
        }
        canvas.drawImage(this.controls, (element.width - this.controls.width * scale) / 2, 10, this.controls.width * scale, this.controls.height * scale);
        
        var cx = mx - element.offsetLeft + pageScrollX;
        var cy = my - element.offsetTop + pageScrollY;
        
        var wx = element.width / 2;
        var wy = element.height / 2;
        
        var bw = (element.width - 40) / 2;
        if (bw > this.controls.width * scale / 2 - 10) {
            bw = this.controls.width * scale / 2 - 10;
        }
        var by = this.controls.height * scale + 20;
        
        // Back button
        var backHovered = cx < wx - 10 && cx > wx - bw - 10 && cy > by && cy < by + 80;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(wx - bw - 10, by, bw, 80);
        canvas.fillStyle = backHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(wx - bw, by + 10, bw - 20, 60);
        canvas.fillStyle = "#FFFFFF";
        canvas.font = "50px Flipbash";
        canvas.fillText("Back", wx - 10 - bw / 2 - StringWidth("Back", canvas.font) / 2, by + 60);
        
        // Play button
        var playHovered = cx > wx + 10 && cx < wx + bw + 10 && cy > by && cy < by + 80;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(wx + 10, by, bw, 80);
        canvas.fillStyle = playHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(wx + 20, by + 10, bw - 20, 60);
        canvas.fillStyle = "#FFFFFF";
        canvas.font = "50px Flipbash";
        canvas.fillText("Play", wx + 10 + bw / 2 - StringWidth("Play", canvas.font) / 2, by + 60);
        
        // Unmarks the left mouse button as pressed
        if (!KeyPressed(KEY_LMB)) {
            escDown = false;
        }
        
        // Button interactions
        if (KeyPressed(KEY_LMB) && !escDown) {
            if (playHovered) {
                screen = new SelectScreen();
            }
            else if (backHovered) {
                screen = new TitleScreen();
            }
            escDown = true;
        }
        
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}

// The character selection screen of the game
function SelectScreen() {

    this.imgDefOption = GetImage("pDefense");
    this.imgPowOption = GetImage("pPower");
    this.imgSpdOption = GetImage("pSpeed");

    // Draws the selection screen
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
        
        var cx = mx - element.offsetLeft + pageScrollX;
        var cy = my - element.offsetTop + pageScrollY;
        
        // Get measurements
        var y = element.height / 2 - 50;
        
        canvas.font = "70px Flipbash";
        var sw = StringWidth("Choose A Robot", canvas.font) / 2;
        
        // Unmarks the left mouse button as pressed
        if (!KeyPressed(KEY_LMB)) {
            escDown = false;
        }
        
        // Draw the title box
        canvas.fillStyle = "#484848";
        canvas.fillRect(element.width / 2 - 395, y - 180, 790, 110);
        canvas.fillStyle = "#000000";
        canvas.fillRect(element.width / 2 - 385, y - 170, 770, 90);
        
        // Draw the title
        canvas.fillStyle = "#FFFFFF";
        canvas.fillText("Choose A Robot", element.width / 2 - sw, y - 100);
        
        // Draw the boxes for the options
        for (var i = 0; i < 3; i++) {
            var x = element.width / 2 - 395 + 270 * i;
            canvas.fillStyle = "#484848";
            canvas.fillRect(x, y, 250, 250);
            if (cx > x && cx < x + 250 && cy > y && cy < y + 250) {
                canvas.fillStyle = "#383838";
                
                // Choosing an option
                if (KeyPressed(KEY_LMB) && !escDown) {
                    if (i == 0) {
                        player = new Player(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Defense", "Overdrive", -22, 5, 2, 13);
                        screen = new GameScreen(player, 1, 5, 1);
                    }
                    else if (i == 1) {
                        player = new Player(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Speed", "Overdrive", -17, 5, 16, 9);
                        screen = new GameScreen(player, 1, 1, 1.5);
                    }
                    else {
                        player = new Player(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Power", "Overdrive", -15, 9, 14, 9);
                        screen = new GameScreen(player, 2, 1, 1);
                    }
                }
            }
            else {
                canvas.fillStyle = "#000000";
            }
            canvas.fillRect(x + 10, y + 10, 230, 230);
        }
        
        // Draw the robot images for the options
        canvas.drawImage(this.imgDefOption, x - 415 - this.imgDefOption.width / 2, y + 100 - this.imgDefOption.height / 2);
        canvas.drawImage(this.imgSpdOption, x - 145 - this.imgSpdOption.width / 2, y + 100 - this.imgSpdOption.height / 2);
        canvas.drawImage(this.imgPowOption, x + 125 - this.imgPowOption.width / 2, y + 100 - this.imgPowOption.height / 2);

        // Draw the text for each option
        canvas.fillStyle = "#FFFFFF";
        canvas.font = "30px Flipbash";
        canvas.fillText("Defense", x - 415 - StringWidth("Defense", canvas.font) / 2, y + 220);
        canvas.fillText("Speed", x - 145 - StringWidth("Speed", canvas.font) / 2, y + 220);
        canvas.fillText("Power", x + 125 - StringWidth("Power", canvas.font) / 2, y + 220);
        
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}