depend('data/images');
depend('draw/camera');
depend('robot/weapons');
depend('robot/player/playerManager');
depend('robot/player/player');
depend('robot/player/slayer');
depend('screen/gameScreen');

var TILE = undefined;

var MOVE = 'move';
var LOOK = 'look';
var SHOOT = 'shoot';
var SKILL = 'skill';
var PAUSE = 'pause';
var SELECT = 'select';

var camera = undefined;
var gameScreen = undefined;
var constants = false;
onLoaderDone = function() {
	if (!constants) {
		depend('data/constants');
		constants = true;
		return;
	}

	camera = new Camera('granama');
	
	TILE = new Sprite('tile', 0, 0);
	ui.canvas = document.getElementById('ui');
	ui.ctx = ui.canvas.getContext('2d');
	
	controls.mapButton(SHOOT, controls.MOUSE_LEFT, controls.BUTTON_RT);
	controls.mapButton(SKILL, controls.KEY_SPACE, controls.BUTTON_LT);
	controls.mapButton(PAUSE, controls.KEY_ESC, controls.BUTTON_START);
	
	players[0] = new PlayerSlayer();
	players[0].input = new KeyboardInput();
	players[0].moveTo(200, 200);
	
	controls.mapDirectionKey(MOVE, controls.KEY_A, controls.KEY_D, controls.KEY_W, controls.KEY_S, controls.AXIS_LX, controls.AXIS_LY);
	controls.mapDirectionMouse(LOOK, true, controls.AXIS_RX, controls.AXIS_RY);
	
	gameScreen = new GameScreen();
	
	// Cancel the context menu
    camera.canvas.oncontextmenu = function(e) {
        return false;
    };

    window.onresize = resizeCanvas;

    // Game loop
    window.setInterval(function() {
        window.scrollTo(0, 0);
		ui.clear();
        if (gameScreen && gameScreen.draw) {
            if (gameScreen.update) {
                gameScreen.update();
            }
            gameScreen.draw();
        }
    }, 1000 / GAME_FPS);

    resizeCanvas();
}

/**
 * Prevents scrolling the page using the scroll wheel
 *
 * @param {Event} e - event details
 */
window.onmousewheel = document.onmousewheel = function(e) {
    e.preventDefault();
    e.returnValue = false;
}

/**
 * Updates the resolution of the canvas to match the
 * displayed size of the HTML element.
 */
function resizeCanvas() {
    camera.canvas.width = ui.canvas.width = camera.canvas.clientWidth;
    camera.canvas.height = ui.canvas.height = "innerHeight" in window
        ? window.innerHeight
        : document.documentElement.offsetHeight;
    WINDOW_WIDTH = camera.canvas.width - SIDEBAR_WIDTH;
    WINDOW_HEIGHT = camera.canvas.height;
    if (gameScreen && gameScreen.draw) {
        gameScreen.draw();
    }
}