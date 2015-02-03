depend('data/images');
depend('data/constants');
depend('draw/camera');
depend('robot/weapons');
depend('robot/player/playerManager');
depend('robot/player/player');
depend('robot/player/slayer');
depend('screen/gameScreen');

var MOVE_X = 'moveX';
var MOVE_Y = 'moveY';
var LOOK_X = 'lookX';
var LOOK_Y = 'lookY';
var SHOOT = 'shoot';
var SKILL = 'skill';
var PAUSE = 'pause';
var SELECT = 'select';

var camera = undefined;
var gameScreen = undefined;
onLoaderDone = function() {
	camera = new Camera('granama');
	
	controls.mapButton(SHOOT, controls.MOUSE_LEFT, controls.BUTTON_RT);
	controls.mapButton(SKILL, controls.KEY_SPACE, controls.BUTTON_LT);
	controls.mapButton(PAUSE, controls.KEY_ESC, controls.BUTTON_START);
	
	controls.mapAxisKey(MOVE_X, controls.KEY_A, controls.KEY_D, controls.AXIS_LX);
	controls.mapAxisKey(MOVE_Y, controls.KEY_W, controls.KEY_S, controls.AXIS_LY);
	
	players[0] = new PlayerSlayer();
	gameScreen = new GameScreen();
	
	// Cancel the context menu
    camera.canvas.oncontextmenu = function(e) {
        return false;
    };

    window.onresize = resizeCanvas;

    // Game loop
    window.setInterval(function() {
        window.scrollTo(0, 0);
        if (gameScreen && gameScreen.Draw) {
            if (gameScreen.update) {
                gameScreen.update();
            }
            gameScreen.draw();
        }
    }, 1000 / GAME_FPS);

    resizeCanvas();
}

window.onmousewheel = document.onmousewheel = function(e) {
    e.preventDefault();
    e.returnValue = false;
}

/**
 * Updates the resolution of the canvas to match the
 * displayed size of the HTML element.
 */
function resizeCanvas() {
    camera.canvas.width = document.clientWidth;
    camera.canvas.height = "innerHeight" in window
        ? window.innerHeight
        : document.documentElement.offsetHeight;
    WINDOW_WIDTH = camera.canvas.width - SIDEBAR_WIDTH;
    WINDOW_HEIGHT = camera.canvas.height;
    if (gameScreen && gameScreen.draw) {
        gameScreen.draw();
    }
}