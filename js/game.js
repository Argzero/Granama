var

gameScreen,
bodyElement,
pageScrollX = 0,
pageScrollY = 0,
canvas,
parent,
element,
tile,
player,
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
    tile = GetImage("tile", function() {
        
        // Set up the initial gameScreen
        cursor = GetImage("cursor");
        gameScreen = new LoadingScreen();
        //gameScreen = new TitleScreen();
    });
    
    // Cancel the context menu
    element.oncontextmenu = function(e) {
        return false;
    };
    
    window.onresize = ResizeCanvas;
    ResizeCanvas();
    
    // Game loop
    window.setInterval(function() {
        window.scrollTo(0, 0);
        if (gameScreen && gameScreen.Draw) {
            if (gameScreen.player) {
                this.player = gameScreen.player;
            }
    		if (gameScreen.Update) {
                gameScreen.Update();
            }
            gameScreen.Draw();
        }
    }, 1000 / GAME_FPS);
}

window.onmousewheel = document.onmousewheel = function(e) {
	e.preventDefault();
	e.returnValue = false;
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