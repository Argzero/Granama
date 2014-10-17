var upgradeScreen = {
    
	screen: undefined,
	ready: undefined,
	hovered: undefined,
	start: undefined,
    
    // Sets up the end screen to show the stats of the given game screen
    setup: function(screen) {
        this.screen = screen;
		this.screen.paused = true;
		
		// Start off with no one ready
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
    
    // Updates the end screen
    Update: function() {
		
    },
    
    // Draws the end screen
    Draw: function() {
        
		// Draw the game screen
        this.screen.Draw();
		
        
    }
};