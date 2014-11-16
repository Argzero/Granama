// Manages players
var playerManager = {
    
    // The list of players
    players: [Player(-1)],
    
    // Updates all the players
    update: function(paused) {
        for (var i = 0; i < this.players.length; i++) {
            this.players[i].input.update();
            if (!paused) {
                if (this.players[i].robot.health > 0) {
                    this.players[i].robot.Update();
                }
                else {
                    this.players[i].robot.UpdateDead();
                }
            }
            else {
                this.players[i].robot.UpdatePause();
            }
        }
    },
    
    // Retrieves the list of player robots
    getRobots: function() {
        var list = [];
        for (var i = 0; i < this.players.length; i++) {
            list.push(this.players[i].robot);
        }
        return list;
    },
    
    // Gets the nearest player to the coordinates
    getClosest: function(x, y) {
        var r = undefined;
        var min = 9999999;
        for (var i = 0; i < this.players.length; i++) {
            var robot = this.players[i].robot;
            if (robot.health <= 0) continue;
            var dSq = (robot.x - x) * (robot.x - x) + (robot.y - y) * (robot.y - y);
            if (dSq < min) {
                min = dSq;
                r = robot;
            }
        }
        return r || this.players[0].robot;
    },
    
    // Sets up the list for single player
    setSingleplayer: function() {
		this.players = [];
        this.players.splice(1, this.players.length - 1);
    },
    
    // Adds players so that there's 4
    setMultiplayer: function() {
		this.players = [];
        while (this.players.length < 5 && (this.players.length < 1 || gamepads)) {
            this.players.push(Player(this.players.length - 1));
        }
    },
    
    // Cleans inactive player objects from the list
    clean: function() {
        for (var i = 0; i < this.players.length; i++) {
            if (!this.players[i].robot) {
                this.players.splice(i, 1);
                i--;
            }
        }
    }
};

function Player(gamepadIndex) {
    return {
        input: (gamepadIndex == -1 ? StandardInput() : GamepadInput(gamepadIndex)),
        robot: undefined
    };
}