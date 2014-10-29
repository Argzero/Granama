// Loading gameScreen for loading all assets before starting the game
function LoadingScreen() {

    this.images = new Array(
        'abilityArrow',
        'abilityArtillery',
        'abilityBlink',
        'abilityCannon',
        'abilityCritical Blast',
        'abilityDecimation',
        'abilityFire',
        'abilityGyro Slash',
        'abilityIonic Thunder',
        'abilityKO Cannon',
        'abilityLaser',
        'abilityLaser Bomb',
        'abilityLock Down',
        'abilityMissile',
        'abilityMissile Barrage',
        'abilityOverdrive',
        'abilityPerfect Shield',
        'abilityPiercing Arrow',
        'abilityPlus',
        'abilityReflect',
        'abilityReflector',
        'abilityShell',
        'abilityStasis',
        'abilitySweeping Blade',
        'abilitySword',
        'abilityTargeter',
        'abilityWave Burst',
        'arrow',
        'BlitzBar',
        'BlitzCooldownReductionUI',
        'BlitzCooldownReductionUISelected',
        'BlitzMovementSpeedUI',
        'BlitzMovementSpeedUISelected',
        'BlitzShieldRechargeUI',
        'BlitzShieldRechargeUISelected',
        'BlitzShotgunProjectilesUI',
        'BlitzShotgunProjectilesUISelected',
        'BlitzSlowingDurationUI',
        'BlitzSlowingDurationUISelected',
        'bossDragonEnd',
        'bossDragonGun',
        'bossDragonHead',
        'bossDragonLeftWing',
        'bossDragonRightWing',
        'bossDragonSegment',
        'bossDragonTurret',
        'bossFire',
        'bossFireClawLeft',
        'bossFireClawRight',
        'bossFireEnd',
        'bossFireSegment',
        'bossFlame',
        'bossHeavy',
        'bossHeavyCoverLeft',
        'bossHeavyCoverRight',
        'bossLaser',
        'bossMine',
        'bossPunch',
        'bossQueen',
        'bossQueenAbdomen',
        'bossQueenWingLeft',
        'bossQueenWingRight',
        'bullet',
        'CommandoBar',
        'CommandoDroneRangeUI',
        'CommandoDroneRangeUISelected',
        'CommandoDroneShotsUI',
        'CommandoDroneShotsUISelected',
        'CommandoLMGBaseDamageUI',
        'CommandoLMGBaseDamageUISelected',
        'CommandoMovementSpeedUI',
        'CommandoMovementSpeedUISelected',
        'CommandoShieldRechargeUI',
        'CommandoShieldRechargeUISelected',
        'controls',
        'controlsScreen',
        'credits',
        'creditsScreen',
        'cursor',
        'damage',
        'drone',
        'droneArmLeft',
        'droneArmRight',
        'droneAssaulter',
        'droneGun',
        'droneHealer',
        'dronePropeller',
        'droneShielder',
        'EmptyBar',
        'enemyHeavyArtillery',
        'enemyHeavyBomber',
        'enemyHeavyBouncer',
        'enemyHeavyBouncerBack',
        'enemyHeavyGrabber',
        'enemyHeavyGrabberArm',
        'enemyHeavyGrabberArmLeft',
        'enemyHeavyGrabberArmRight',
        'enemyHeavyMedic',
        'enemyHeavyMelee',
        'enemyHeavyOrbiter',
        'enemyHeavyOrbiterTail',
        'enemyHeavyRanged',
        'enemyHiveDefender',
        'enemyHiveDefenderAbdomen',
        'enemyHiveDefenderWingLeft',
        'enemyHiveDefenderWingRight',
        'enemyHiveDrone',
        'enemyHiveDroneAbdomen',
        'enemyHiveDroneWingLeft',
        'enemyHiveDroneWingRight',
        'enemyHunter',
        'enemyHunterEnd',
        'enemyHunterSegment',
        'enemyLightArtillery',
        'enemyLightBomber',
        'enemyLightBouncer',
        'enemyLightBouncerBack',
        'enemyLightGrabber',
        'enemyLightGrabberArm',
        'enemyLightMedic',
        'enemyLightMelee',
        'enemyLightOrbiter',
        'enemyLightOrbiterTail',
        'enemyLightRanged',
        'enemyPaladin',
        'enemyPointer',
        'enemyRailer',
        'enemySnatcher',
        'enemySnatcherArm',
        'enemySnatcherArmLeft',
        'enemySnatcherArmRight',
        'enemySolar',
        'enemySolarBack',
        'enemyTurret',
        'EX1',
        'EX10',
        'EX2',
        'EX3',
        'EX4',
        'EX5',
        'EX6',
        'EX7',
        'EX8',
        'EX9',
        'exp1',
        'exp25',
        'exp5',
        'fire',
        'fistLeft',
        'fistRight',
        'FullBar',
        'grappleHook',
        'GuardianBar',
        'GuardianBlastRadiusUI',
        'GuardianBlastRadiusUISelected',
        'GuardianKnockbackUI',
        'GuardianKnockbackUISelected',
        'GuardianMinigunAttackSpeedUI',
        'GuardianMinigunAttackSpeedUISelected',
        'GuardianMovementSpeedUI',
        'GuardianMovementSpeedUISelected',
        'GuardianShieldRechargeUI',
        'GuardianShieldRechargeUISelected',
        'hammer',
        'healingPad',
        'healthBarSymbol',
        'HeavyBomberMine',
        'KnightArrowVolleyCountUI',
        'KnightArrowVolleyCountUISelected',
        'KnightBar',
        'KnightGrappleStunUI',
        'KnightGrappleStunUISelected',
        'KnightMovementSpeedUI',
        'KnightMovementSpeedUISelected',
        'KnightShieldRechargeUI',
        'KnightShieldRechargeUISelected',
        'KnightSwordLifeStealUI',
        'KnightSwordLifeStealUISelected',
        'KnightSwordSwingArcUI',
        'KnightSwordSwingArcUISelected',
        'laser',
        'LevelUpWords',
        'LightBomberMine',
		'lmgBullet',
        'minigunBullet',
        'missile',
        'pCommando',
        'pCommandoBody',
        'pCommandoDroneKit',
        'pCommandoLMG',
        'pCommandoShield',
        'pDefense',
        'pDefenseBody',
        'pDefenseGun',
        'pDefenseMissile',
        'pDefenseShield',
        'perfectShield',
        'PEX1',
        'PEX10',
        'PEX2',
        'PEX3',
        'PEX4',
        'PEX5',
        'PEX6',
        'PEX7',
        'PEX8',
        'PEX9',
        'pKnight',
        'pKnightArm',
        'pKnightBody',
        'pKnightGrappleEmpty',
        'pKnightGrappleFull',
        'pKnightQuiver',
        'pKnightShield',
        'play',
        'pPower',
        'pPowerBody',
        'pPowerFlame',
        'pPowerLaser',
        'pPowerShield',
        'pPowerSpread',
        'pSpeed',
        'pSpeedBody',
        'pSpeedGun',
        'pSpeedShield',
        'pSpeedShotgun',
        'pTraitorBody',
        'pTraitorFlame',
        'pTraitorLaser',
        'pTraitorShield',
        'pTraitorSpread',
        'pValkyrie',
        'pValkyrieBody',
        'pValkyrieGun',
        'pValkyrieRailLeft',
        'pValkyrieRailRight',
        'pValkyrieRod',
        'pValkyrieScope',
        'pValkyrieShell',
        'pValkyrieShield',
        'pValkyrieTarget',
        'pValkyrieTurret',
        'pValkyrieWing',
        'rocket',
        'rush',
        'shell',
        'SlayerAttackSpeedUI',
        'SlayerAttackSpeedUISelected',
        'SlayerBar',
        'SlayerFlamethrowerRangeUI',
        'SlayerFlamethrowerRangeUISelected',
        'SlayerLaserSpreadUI',
        'SlayerLaserSpreadUISelected',
        'SlayerMovementSpeedUI',
        'SlayerMovementSpeedUISelected',
        'SlayerShieldRechargeUI',
        'SlayerShieldRechargeUISelected',
        'slowMissile',
        'stinger',
        'sword',
        'tile',
        'title',
        'turretBase',
        'turretGun',
        'uiArrowLeft',
        'uiArrowRight',
        'upgradeArrow',
        'upgradeCharge',
        'upgradeCooldown',
        'upgradeDamage',
        'upgradeDroneRange',
        'upgradeDroneShots',
        'upgradeDual',
        'upgradeExplosion',
        'upgradeFlamethrower',
        'upgradeGrapple',
        'upgradeHeal',
        'upgradeHealth',
        'upgradeKnockback',
        'upgradeLaser',
        'upgradeLifesteal',
        'upgradeLMGDamage',
        'upgradeMinigun',
        'upgradeRange',
        'upgradeShield',
        'upgradeShotgun',
        'upgradeSlash',
        'upgradeSlow',
        'upgradeSpeed',
        'upgradeSpread',
        'ValkyrieBar',
        'ValkyrieChargeSpeedUI',
        'ValkyrieChargeSpeedUISelected',
        'ValkyrieDualShotUI',
        'ValkyrieDualShotUISelected',
        'ValkyrieMovementSpeedUI',
        'ValkyrieMovementSpeedUISelected',
        'ValkyrieRailGunRangeUI',
        'ValkyrieRailGunRangeUISelected',
        'ValkyrieShieldRechargeUI',
        'ValkyrieShieldRechargeUISelected'
    );
    this.index = 0;
    this.loading = false;
    
    // Moves to the next image when one finishes loading
    this.ImageLoaded = function() {
        gameScreen.index++;
    }
    
    // Updates the loading gameScreen
    this.Update = Update;
    function Update() {
        
        // Start loading the images
        if (!this.loading) {
            this.loading = true;
            for (var i = 0; i < this.images.length; i++) {
                GetImage(this.images[i], this.ImageLoaded);
            }
        }
        
        // Finished loading
        else if (this.index == this.images.length) {
            gameScreen = new TitleScreen();
        }
    }
    
    // Draws the loading gameScreen
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

// The title gameScreen for the game
function TitleScreen() {

    this.imgTitle = GetImage("title");
    this.imgCredits = GetImage("credits");
    this.imgControls = GetImage("controls");
    this.imgPlay = GetImage("play");
    this.imgRush = GetImage('rush');

    // Draws the title gameScreen
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
        canvas.fillRect(x1, wy - 330, 620, 40 + this.imgTitle.height);
        canvas.fillStyle = BUTTON_BG;
        canvas.fillRect(x1 + 10, wy - 320, 600, 20 + this.imgTitle.height);
        canvas.drawImage(this.imgTitle, wx - this.imgTitle.width / 2, wy - 310);
        
        // Draw the play button
        var playHovered = xBounds && cy > wy - 120 && cy < wy - 80 + this.imgPlay.height;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(x1, wy - 140, 620, 40 + this.imgPlay.height);
        canvas.fillStyle = playHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(x1 + 10, wy - 130, 600, 20 + this.imgPlay.height);
        canvas.drawImage(this.imgPlay, wx - this.imgPlay.width / 2, wy - 120);
        
        // Draw the boss rush button
        var rushHovered = xBounds && cy > wy && cy < wy + 40 + this.imgRush.height;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(x1, wy - 20, 620, 40 + this.imgRush.height);
        canvas.fillStyle = rushHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(x1 + 10, wy - 10, 600, 20 + this.imgRush.height);
        canvas.drawImage(this.imgRush, wx - this.imgRush.width / 2, wy);
        
        // Draw the controls button
        var controlsHovered = xBounds && cy > wy + 120 && cy < wy + 160 + this.imgControls.height;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(x1, wy + 100, 620, 40 + this.imgControls.height);
        canvas.fillStyle = controlsHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(x1 + 10, wy + 110, 600, 20 + this.imgControls.height);
        canvas.drawImage(this.imgControls, wx - this.imgControls.width / 2, wy + 120);
        
        // Draw the credits button
        var creditsHovered = xBounds && cy > wy + 240 && cy < wy + 280 + this.imgCredits.height;
        canvas.fillStyle = BUTTON_BORDER;
        canvas.fillRect(x1, wy + 220, 620, 40 + this.imgCredits.height);
        canvas.fillStyle = creditsHovered ? BUTTON_HOVER : BUTTON_BG;
        canvas.fillRect(x1 + 10, wy + 230, 600, 20 + this.imgCredits.height);
        canvas.drawImage(this.imgCredits, wx - this.imgCredits.width / 2, wy + 240);
        
        canvas.translate(0, -15);
        
        // Unmarks the left mouse button as pressed
        if (!KeyPressed(KEY_LMB)) {
            escDown = false;
        }
        
        // Button interactions
        if (KeyPressed(KEY_LMB) && !escDown) {
            if (playHovered) {
                //gameScreen = new SelectScreen();
                playerManager.setMultiplayer();
				//gameScreen = new PlayerScreen();
                gameScreen = new SelectScreen();
            }
            else if (rushHovered) {
                playerManager.setSingleplayer();
                player = PlayerTraitorType();
                player.color = '#f80';
                player.name = 'Traitor';
                playerManager.players[0].robot = player;
                player.input = playerManager.players[0].input;
                gameScreen = new GameScreen(player, true);
            }
            else if (controlsHovered) {
                gameScreen = new ControlsScreen();
            }
            else if (creditsHovered) {
                gameScreen = new CreditsScreen();
            }
            escDown = true;
        }
        
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}

// The controls gameScreen
function CreditsScreen() {

    this.credits = GetImage("creditsScreen");

    // Draws the controls gameScreen
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
                gameScreen = new SelectScreen();
            }
            else if (backHovered) {
                gameScreen = new TitleScreen();
            }
            escDown = true;
        }
        
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}

// The controls gameScreen
function ControlsScreen() {

    this.controls = GetImage('controlsScreen');

    // Draws the controls gameScreen
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
                gameScreen = new SelectScreen();
            }
            else if (backHovered) {
                gameScreen = new TitleScreen();
            }
            else if (abilityHovered) {
                gameScreen = new AbilityScreen();
            }
            escDown = true;
        }
        
        // Draw the cursor
        canvas.drawImage(cursor, cx - cursor.width / 2, cy - cursor.height / 2);
    }
}