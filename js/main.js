// Data scripts
depend('data/io');
depend('data/music');
depend('data/profile');

// Draw scripts
depend('draw/camera');
depend('draw/sprite');

// Lib scripts
depend('lib/image');
depend('lib/input');
depend('lib/math');
depend('lib/2d/arc');
depend('lib/2d/rect');
depend('lib/2d/transform');
depend('lib/2d/vector');

// Screen scripts
depend('screen/controlsScreen');
depend('screen/creditsScreen');
depend('screen/endScreen');
depend('screen/gameScreen');
depend('screen/gameUI');
depend('screen/loadScreen');
depend('screen/selectScreen');
depend('screen/statScreen');
depend('screen/titleScreen');
depend('screen/uiBox');

// Robot scripts
depend('robot/dust');
depend('robot/explosion');
depend('robot/movement');
depend('robot/pad');
depend('robot/plus');
depend('robot/reticleParticle');
depend('robot/robot');
depend('robot/ropeTail');

// Weapon scripts
depend('robot/weapon/mine');
depend('robot/weapon/projectile');
depend('robot/weapon/shockwave');
depend('robot/weapon/turret');
depend('robot/weapon/weapons');

// Player scripts
depend('robot/player/angel');
depend('robot/player/beta');
depend('robot/player/blitz');
depend('robot/player/commando');
depend('robot/player/guardian');
depend('robot/player/knight');
depend('robot/player/meteor');
depend('robot/player/player');
depend('robot/player/playerManager');
depend('robot/player/slayer');
depend('robot/player/valkyrie');

// Boss Scripts
depend('robot/boss/boss');
depend('robot/boss/brawler');
depend('robot/boss/dragon');
depend('robot/boss/fortress');
depend('robot/boss/heavy');
depend('robot/boss/hiveQueen');
depend('robot/boss/hydra');
depend('robot/boss/scorpion');

// Enemy scripts
depend('robot/enemy/ant');
depend('robot/enemy/artillery');
depend('robot/enemy/bomber');
depend('robot/enemy/enemy');
depend('robot/enemy/grabber');
depend('robot/enemy/gunner');
depend('robot/enemy/medic');
depend('robot/enemy/melee');
depend('robot/enemy/orbiter');
depend('robot/enemy/rocketer');
depend('robot/enemy/spinner');

// Shared online code
depend('online/client');
depend('online/networkInput');

// Multiplayer lobby menus
depend('online/lobby/joinScreen');
depend('online/lobby/roomScreen');
depend('online/lobby/lobbyScreen');

// Background tile sprite
var TILE;

// Control mapping keys
var MOVE = 'move';
var LOOK = 'look';
var SHOOT = 'shoot';
var SKILL = 'skill';
var PAUSE = 'pause';
var SELECT_1 = 'select1';
var CANCEL_1 = 'cancel';
var SELECT_2 = 'select2';
var CANCEL_2 = 'cancel2';
var JOIN = 'join';
var UP_1 = 'up1';
var DOWN_1 = 'down1';
var LEFT_1 = 'left1';
var RIGHT_1 = 'right1';
var UP_2 = 'up2';
var DOWN_2 = 'down2';
var LEFT_2 = 'left2';
var RIGHT_2 = 'right2';

// Modifier for frame rate
var DELTA_TIME;

var camera;
var gameScreen;
var constants = false;
onLoaderDone = function() {
    if (!constants) {
        depend('data/constants');
        constants = true;
        return;
    }

    camera = new Camera('granama');
    
    TILE = new Sprite('tile', 0, 0);
    ui.canvas = camera.canvas;
    ui.ctx = camera.ctx;
    
    controls.mapButton(SHOOT, controls.MOUSE_LEFT, controls.BUTTON_RT);
    controls.mapButton(SKILL, controls.KEY_SPACE, controls.BUTTON_LT);
    controls.mapButton(PAUSE, controls.KEY_ESC, controls.BUTTON_START);
    controls.mapButton(SELECT_1, controls.KEY_ENTER, controls.BUTTON_DOWN);
    controls.mapButton(CANCEL_1, controls.KEY_ESC, controls.BUTTON_RIGHT);
    controls.mapButton(SELECT_2, controls.KEY_SPACE, controls.BUTTON_RT);
    controls.mapButton(CANCEL_2, controls.KEY_DEL, controls.BUTTON_LT);
    controls.mapButton(JOIN, controls.KEY_SPACE, controls.BUTTON_START);
    controls.mapButton(UP_1, controls.KEY_W, controls.AXIS_LYN);
    controls.mapButton(DOWN_1, controls.KEY_S, controls.AXIS_LYP);
    controls.mapButton(LEFT_1, controls.KEY_A, controls.AXIS_LXN);
    controls.mapButton(RIGHT_1, controls.KEY_D, controls.AXIS_LXP);
    controls.mapButton(UP_2, controls.KEY_UP, controls.AXIS_RYN);
    controls.mapButton(DOWN_2, controls.KEY_DOWN, controls.AXIS_RYP);
    controls.mapButton(LEFT_2, controls.KEY_LEFT, controls.AXIS_RXN);
    controls.mapButton(RIGHT_2, controls.KEY_RIGHT, controls.AXIS_RXP);
    
    controls.mapDirectionKey(MOVE, controls.KEY_A, controls.KEY_D, controls.KEY_W, controls.KEY_S, controls.AXIS_LX, controls.AXIS_LY);
    controls.mapDirectionMouse(LOOK, true, controls.AXIS_RX, controls.AXIS_RY);
    
    gameScreen = new LoadingScreen();
    
    // Cancel the context menu
    camera.canvas.oncontextmenu = function(e) {
        return false;
    };

    window.onresize = resizeCanvas;

    // Game loop
    var lastTime = performance.now();
    var interval = 100 / 6;
    window.setInterval(function() {
    
        // Reset the canvas elements
        window.scrollTo(0, 0);
        ui.clear();
        
        // Update time change
        var now = performance.now();
        var dt = now - lastTime;
        lastTime = now;
        DELTA_TIME = Math.min(dt / interval, 5);
        
        // Update/draw the screen
        if (gameScreen && gameScreen.draw) {
            if (gameScreen.update) {
                gameScreen.update();
            }
            gameScreen.draw();
        }
    }, interval);

    resizeCanvas();
};

/**
 * Cleans up server connections before quitting
 */ 
window.onbeforeunload = function() {
    connection.quitGame();
    connection.disconnect();
};

/**
 * Prevents scrolling the page using the scroll wheel
 *
 * @param {Event} e - event details
 */
window.onmousewheel = document.onmousewheel = function(e) {
    e.preventDefault();
    e.returnValue = false;
};

/**
 * Updates the resolution of the canvas to match the
 * displayed size of the HTML element.
 */
function resizeCanvas() {
    camera.canvas.width = ui.canvas.width = camera.canvas.clientWidth;
    camera.canvas.height = ui.canvas.height = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    WINDOW_WIDTH = camera.canvas.width - SIDEBAR_WIDTH;
    WINDOW_HEIGHT = camera.canvas.height;
    if (gameScreen && gameScreen.draw) {
        gameScreen.draw();
    }
}

// Dear god why
function julian(extreme) {
    gameScreen.julian = extreme ? 'EXTREME' : true;
}