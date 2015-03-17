var connection = new Connection();

/**
 * Reprsents the socket.io connection to the server. Use
 * connect() to set up the connection before trying to 
 * send/receive messages.
 *
 * @constructor
 */
function Connection() {
    this.socket = undefined;
    this.connected = false;
    this.callback = undefined;
    this.gameIndex = 0;
    this.localPlayers = 0;
    this.inRoom = false;
    this.room = undefined;
}

/**
 * Attempts to connect to the server. When successful, this
 * will set up the handlers for receiving messages.
 */
Connection.prototype.connect = function() {
    if (this.connected) return;

    // Join the server
    this.socket = io.connect();
    
    // Set up message handlers
    this.socket.on('kick', this.onKick.bind(this));
    this.socket.on('general', this.onGeneral.bind(this));
    this.socket.on('joinRoom', this.onJoinRoom.bind(this));
    this.socket.on('addPlayers', this.onAddPlayers.bind(this));
    this.socket.on('updateRooms', this.onUpdateRooms.bind(this));
    this.socket.on('removePlayer', this.onRemovePlayer.bind(this));
    this.socket.on('updateSelection', this.onUpdateSelection.bind(this));
    
    this.connected = true;
};

/**
 * Disconnects from the server, cleaning up any attachments to the server
 * such as the game the player was in or related activities.
 */
Connection.prototype.disconnect = function() {
    if (!this.connected) return;
    
    // TODO quit game if in one
    
    this.socket.disconnect();
    this.connected = false;
};

// ------------------------------------------------------------------------------ //
//                                  Client -> Server                              //
// ------------------------------------------------------------------------------ //

/**
 * Attempts to log the user in, responding to the callback
 * with the result. If another login attempt is already being
 * processed or there is no connection, this will do nothing instead.
 *
 * @param {string}   username - the player's username
 * @param {string}   password - the player's password
 * @param {function} callback - the method to use when a response is received
 */ 
Connection.prototype.login = function(username, password, callback) {
    if (!connected || this.callback) return;
    
    this.callback = callback;
    this.socket.emit('login', { username: username, password: password });
};

/**
 * Attempts to fetch the live rooms from the server that have 
 * room for the given number of players. When there's 0 players,
 * it will be assumed that it is for spectating.
 */
Connection.prototype.fetchRooms = function() {
    if (this.inRoom) return;
    this.socket.emit('fetchRooms', { players: players.length });
};

/**
 * Attempts to create a room on the server
 *
 * @param {string} name - name of the room
 */
Connection.prototype.createRoom = function(name) {
    if (this.inRoom) return;
    var users = [];
    for (var i = 0; i < players.length; i++) {
        players[i].settings.part = 1;
        users.push(players[i].settings);
    }
    this.socket.emit('createRoom', { 
        room: {
            name: name,
            numPlayers: players.length,
            maxPlayers: 5,
            gameType: 'Arcade',
            inProgress: false
        },
        users: users
    });
};

/**
 * Requests to join a game room using the given room name. If there
 * are no players, this will assume that it is for spectating.
 */
Connection.prototype.joinRoom = function(name) {
    if (this.inRoom) return;
    var users = [];
    for (var i = 0; i < players.length; i++) {
        players[i].settings.part = 1;
        users.push(players[i].settings);
    }
    this.socket.emit('requestJoin', { users: users, room: name });
};

/**
 * Sends an update for the player's current selection in the 
 * lobby screen so other players can see it.
 */
Connection.prototype.updateSelection = function(playerIndex) {
    if (!this.inRoom) return;
    this.socket.emit('updateSelection', { 
        selection: players[playerIndex].settings, 
        index: playerIndex, 
        time: new Date().getTime() 
    });
};

/**
 * Removes all local players from the current game for some
 * reason, whether it's quitting from the lobby, closing the
 * window, or losing connection.
 *
 * @param {string} reason - the reason for quitting the game (e.g. closed browser)
 */ 
Connection.prototype.quitGame = function(reason) {
    if (!this.inRoom) return;
    
    // Host leaving takes the room down with them 
    if (this.gameIndex === 0) {
        this.socket.emit('destroyRoom', {
            reason: reason
        });
    }
    
    // Normal players just remove themselves
    else {
        this.socket.emit('removePlayer', {
            room: this.room.name,
            index: this.gameIndex,
            amount: this.localPlayers,
            time: new Date().getTime()
        });
    }
    
    this.inRoom = false;
    players = players.slice(this.gameIndex, this.gameIndex + this.localPlayers);
    gameScreen = new RoomScreen();
};

// ------------------------------------------------------------------------------ //
//                                  Server -> Client                              //
// ------------------------------------------------------------------------------ //

/**
 * Message from the server about players joining the game 
 * from another computer.
 *
 * @param {Object} data - the data for the joining players
 */
Connection.prototype.onAddPlayers = function(data) {
    if (!this.inRoom) return;
    for (var i = 0; i < data.selections.length; i++) {
        players[i + data.index].settings = data.selections[i]; 
    }
};

/**
 * Receives a general response from the server containing whether
 * or not an action worked or not. If a callback was provided, this
 * will pass the result on to the callback.
 *
 * @param {Object} data - response data from the server
 */
Connection.prototype.onGeneral = function(data) {
    if (this.callback) {
        this.callback(data);
        delete this.callback;
    }
};

/**
 * Receives a response from the server when the players are able to
 * join a room that was requested.
 *
 * @param {Object} data - the response from the server
 */
Connection.prototype.onJoinRoom = function(data) {
    if (this.inRoom) return;
    
    this.inRoom = true;
    this.localPlayers = players.length;
    this.gameIndex = data.index;
    this.room = data.room;
    
	var i;
    for (i = 0; i < data.index; i++) {
        players.unshift({ settings: data.selections[i] });
    }
    for (i = players.length; i < data.selections.length; i++) {
        players.push({ settings: data.selections[i] });
    }
    appendPlayers(5);
    gameScreen = new LobbyScreen();
};

/**
 * Message from the server for when the user is kicked
 * from their current game.
 *
 * @param {Object} data - message from the server
 */
Connection.prototype.onKick = function(data) {
    if (!this.inRoom) return;
    
    this.inRoom = false;
    players = players.slice(this.gameIndex, this.gameIndex + this.localPlayers);
    gameScreen = new RoomScreen();
};

/**
 * Message for when players leave the current game
 *
 * @param {Object} data - information about the players who left
 */
Connection.prototype.onRemovePlayer = function(data) {
    players.splice(data.index, data.amount);
    appendPlayers(5);
};

/**
 * Retrieves the list of active rooms from the server and 
 * passes it along to the RoomScreen if still on that screen.
 */
Connection.prototype.onUpdateRooms = function(data) {
    if (gameScreen.updateRooms) {
        gameScreen.updateRooms(data);
    }
};

/**
 * Receives a player selection update from the server
 *
 * @param {Object} data - the selection update data
 */ 
Connection.prototype.onUpdateSelection = function(data) {
    if (!this.inRoom) return;
    
    // Ignore old updates
    if (players[data.index].lastUpdate && players.lastUpdate > data.time) return;
    
    // Apply the update
    players[data.index].settings = data.selection;
    players[data.index].lastUpdate = data.time;
    if (gameScreen.updateOpenList) {
        gameScreen.updateOpenList();
    }
};