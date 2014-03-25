var

screen = new LoadingScreen(),
bodyElement,
pageScrollX = 0,
pageScrollY = 0,
canvas,
parent,
element,
tile,
escDown = true,
cursor;

// Set up the game when the page loads
window.onload = function() {

    // Load data
	parent = document.querySelector("#game");
	element = document.querySelector("#granama");
    bodyElement = parent;
    canvas = element.getContext("2d");
    bullets = new Array();
    mines = new Array();
    turrets = new Array();
    enemies = new Array();
    drops = new Array();
    cursor = GetImage("cursor");
    tile = GetImage("tile");
    
    window.onresize = ResizeCanvas;
    ResizeCanvas();

    // Game loop
    setInterval(function() {
		if (screen.Update) {
            screen.Update();
        }
        screen.Draw();
    }, 1000 / GAME_FPS);
}

// Resizes the canvas to the body size
function ResizeCanvas() {
    element.width = bodyElement.clientWidth;
    element.height = "innerHeight" in window 
               ? window.innerHeight
               : document.documentElement.offsetHeight; 
    WINDOW_WIDTH = element.width - UI_WIDTH - SIDEBAR_WIDTH;
    WINDOW_HEIGHT = element.height;
}