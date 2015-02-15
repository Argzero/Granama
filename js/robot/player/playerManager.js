depend('lib/input');

// Active players
var players = [];

keyboardActive = true;
gamepadActive  = true;

/**
 * Grabs the closest alive player to the coordinates.
 * If all players are dead, this will instead grab the
 * first player in the list.
 *
 * @param {Number} x - horizontal coordinate
 * @param {Number} y - vertical coordinate
 */
function getClosestPlayer(x, y) {
	var r = undefined;
	var min = 9999999;
	for (var i = 0; i < this.players.length; i++) {
		var robot = this.players[i];
		if (robot.health <= 0) continue;
		var dSq = (robot.x - x) * (robot.x - x) + (robot.y - y) * (robot.y - y);
		if (dSq < min) {
			min = dSq;
			r = robot;
		}
	}
	return r || this.players[0];
}

/**
 * Sets the amount of players able to play in the current game
 *
 * @param {Number} amount - the amount of players to set up
 */
function setPlayerCount(amount) {
	this.players = [];
	while (this.players.length < amount && (this.players.length < 1 || controls.GAMEPADS_SUPPORTED)) {
		this.players.push(new PlayerWrapper(this.players.length - 1));
	}
	this.keyboardActive = true;
	this.gamepadActive = players.length > 1;
}

/**
 * Cleans the list of players, removing players that did not join
 */
function cleanPlayerList() {
	this.keyboardActive = false;
	this.gamepadActive = false;
	for (var i = 0; i < this.players.length; i++) {
		if (!players[i].health) {
			this.players.splice(i, 1);
			i--;
		}
		else if (players[i].input.id === undefined) {
			this.keyboardActive = true;
		}
		else this.gamepadActive = true;
	}
}

/**
 * Gets a wrapper for a player during robot selection
 *
 * @param {Number} index - index of the player
 */ 
function PlayerWrapper(index) {
    this.input = (index == -1 ? new KeyboardInput() : new GamepadInput(index));
}