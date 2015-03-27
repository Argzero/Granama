// Dependencies
var http = require('http');
var fs = require('fs');
var owner = false;

// name, room, socket, selection
var users = {};

// users, name, mode, max
var roomList = {};

/**
 * Handles distributing files to the user such as the HTML pageX
 * and all the individual resources/scripts used by the game.
 *
 * @param {HTMLRequest}  request  - the request made by the client
 * @param {HTMLResponse} response - the response to send to the client
 */ 
function htmlHandler(request, response) {
    var file;
    if (request.url.length > 2) file = '.' + request.url.replace('%20', ' ');
    else file = './index.html';
    fs.readFile(file, function(error, data) {
        if (error) {
            console.log('Failed to load ' + request.url);
            response.writeHead(500);
            return response.end('Error loading ' + request.url);
        }
        
        response.writeHead(200);
        response.end(data);
    });
}

// Set up the server
var app = http.createServer(htmlHandler);
var server = app.listen(process.env.PORT || process.env.NODE_PORT || 18000);
var io = require('socket.io')(app);

/**
 * Sets up the websocket server, listening for connecting clients
 * to set up individual channel listeners for each individual client.
 *
 * @param {Socket} socket - the socket of the connecting client
 */ 
io.on('connection', function(socket) {
    
    /**
     * Creates a new hosted room for a user with the provided data.
     * The data should contain the following values:
     *
     *   room = { name, numPlayers, maxPlayers, gameType, inProgress }
     *   users = [ { playerName, robot, ability, team, ready } ]
     *
     * @param {Object} data - the data sent by the user
     */
    socket.on('createRoom', function(data) {
        console.log('Action: Create Room [' + data.room.name + ']');
        
        // Create the room only if there isn't already a room with the same name
        if (!roomList[data.room.name]) {
            
            // Initialize the data for the room
            data.room.selections = data.users;
            roomList[data.room.name] = data.room;
            socket.room = data.room.name;
            socket.join(data.room.name);
            
            // Tell the users to join the new room
            socket.emit('joinRoom', { 
                room: data.room, 
                selections: data.users, 
                index: 0 
            });
            
            console.log('Result: Room created - ' + Object.keys(roomList).length + ' rooms now');
        }
        
        // When the name is taken, send back an error message
        else {
            socket.emit('general', {
                success: false,
                error: 'Name is already taken'
            });
            
            console.log('Result: Name taken');
        }
    });
    
    /**
     * Destroys an active room, removing all players and clearing all
     * related data on the server. The data should contain these values:
     *
     *   reason = message saying why the room was disbanded
     *
     * @param {Object} data - the information of the room to delete
     */
    socket.on('destroyRoom', function(data) {
        console.log('Action: Destroy room [' + socket.room + ']');
        
        // If the room doesn't exist, send an error message
        if (!socket.room) {
            socket.emit('general', {
                success: false,
                error: 'Room does not exist'
            });
            
            console.log('Result: Room does not exist');
        }

        // Delete the room when it's there
        else {
            
            // Clear the server data for the room
            room = socket.room;
            delete roomList[room];
            socket.leave(room);
            
            // Tell the other clients to leave the room
            var clientIds = io.sockets.adapter.rooms[room];
            if (clientIds) {
                var keys = Object.keys(clientIds);
                for (var i = 0; i < keys.length; i++) {
                    var clientSocket = io.sockets.adapter.nsp.connected[keys[i]];
                    clientSocket.leave(room);
                    clientSocket.emit('kick', { reason: data.reason });
                    delete clientSocket.room;
                }
            }
            
            // Clear the host's socket data
            delete socket.room;
        }
    });
    
    /**
     * Fetches the list of available rooms for the user. This will
     * check room size limits and what the user is joining for when
     * determining what rooms they can join. The data should include
     * these values:
     *
     *   players = number of players (0 if spectating)
     *
     * @param {Object} data - the data provided by the client.
     */
    socket.on('fetchRooms', function(data) {
        
        console.log('Action: Fetch rooms');
        
        var rooms = [];
        var x;
        
        // Spectator games - need to be in progress
        if (data.players === 0) {
            for (x in roomList) {
                if (roomList[x].inProgress) {
                    rooms.push(roomList[x]);
                }
            }
        }    
        
        // Non-spectator games - need to have room for the players
        else {
            for (x in roomList) {
                if (roomList[x].maxPlayers - roomList[x].numPlayers >= data.players) {
                    rooms.push(roomList[x]);
                }
            }
        }
        
        console.log('Result: ' + rooms.length + ' rooms');
        
        socket.emit('updateRooms', { rooms: rooms });
    });
    
    /**
     * Handles time sync requests. The data should contain these
     * values:
     * 
     *   localTime - the timestamp of the client
     *
     * @param {Object} data - the local timestamp of the client
     */
    socket.on('getTime', function(data) {
        data.serverTime = new Date().getTime();
        socket.emit('getTime', data);
    });
    
    /**
     * Handles login attempts from the client. The data should
     * include these values:
     *
     *   username = the client's username
     *   password = the client's password
     *
     * @param {Object} data - the login credentials provided by the client
     */
    socket.on('login', function(data) {
        
        // TODO do login validation
        
        socket.emit('general', { success: true, error: '' });
    });
    
    /**
     * Removes a client from a room. The data should include
     * these values:
     *
     *   index = the starting index of the players
     *   amount = the number of players playing on the client's machine
     *   time = the time the players disconnected
     *
     * @param {Object} data - the player information of the client
     */
    socket.on('removePlayer', function(data) {
        console.log('Action: remove player');
        socket.broadcast.to(socket.room).emit('removePlayer', data);
        roomList[socket.room].numPlayers -= data.amount;
        roomList[socket.room].selections.splice(data.index, data.amount);
        socket.leave(socket.room);
        delete socket.room;
    });
    
    /**
     * Receives a client request to join another client's room.
     * The data should include these values:
     *
     *   users = [ { playerName, robot, ability, team, ready } ]
     *   room = the name of the room to join
     *
     * @param {Object} data - the information needed to join the room
     */
    socket.on('requestJoin', function(data) {
        console.log('Action: Join Request [' + data.room + ']');
        
        // The room must be a currently active room
        if (roomList[data.room]) {
            var room = roomList[data.room];
            
            // The room must have enough space for the users
            if (room.maxPlayers - room.numPlayers >= data.users.length) {
                
                console.log(data.users.length + ' players joined room ' + data.room);
                
                // Add them to the room
                for (var i = 0; i < data.users.length; i++) {
                    room.selections.push(data.users[i]);
                }
                socket.join(data.room);
                socket.room = data.room;
                room.numPlayers += data.users.length;
                
                // Tell the users they joined
                socket.emit('joinRoom', {
                    room: room,
                    selections: room.selections,
                    index: room.numPlayers - data.users.length
                });
                
                // Tell other players who is joining
                socket.broadcast.to(data.room).emit('addPlayers', {
                    selections: data.users,
                    index: room.numPlayers - data.users.length
                });
                
                console.log('Result: Joined');
            }
            
            // When there's not enough space, send an error message
            else {
                socket.emit('general', {
                    success: false,
                    error: 'Too many players'
                });
                
                console.log('Result: Room full');
            }
        }
        
        // When the room doesn't exist, send an error message
        else {
            socket.emit('general', {
                success: false,
                error: 'Room does not exist'
            });
            
            console.log('Result: Does not exist');
        }
    });
    
    /**
     * Handles a request to start a game for a room. The data
     * should contain these values:
     * 
     *   room: { name, numPlayers, maxPlayers, gameType, inProgress }
     * 
     * @param {Object} data - the request data
     */
    socket.on('requestStart', function(data) {
        console.log("Action: Request start");
        var room = roomList[data.room.name];
        
        if (room.inProgress) return;
        
        // Make sure the game can still be started
        var allReady = true;
        var oneReady = false;
        for (var i = 0; i < room.selections.length; i++) {
            if (room.selections[i].part != 3 && room.selections[i].part > 0) {
                allReady = false;
            }
            else if (room.selections[i].part == 3) {
                oneReady = true;
            }
        }
        
        // Can start the room so send out the message
        if (allReady && oneReady) {
            io.sockets.in(data.room.name).emit('startGame', { selections: room.selections });
            room.inProgress = true;
        }
    });
    
    /**
     * Relays messages to spawn an enemy. The data should
     * contain these values:
     *
     *   construct - the name of the function to create the enemy
     *   pos       - the position to create the enemy
     *   id        - the unique ID of the spawned robot
     *   bossSpawn - whether or not the spawn is for a boss spawn
     *   time      - the time the enemy was created
     *
     * @param {Object} data - the spawn data to relay
     */
    socket.on('spawn', function(data) {
        console.log('Action: Spawn');
        socket.broadcast.to(socket.room).emit('spawn', data);
    });
    
    /**
     * Relays a player update to the other clients within a room.
     * The data should contain these values:
     * 
     *   robot = player index
     *   pos = position of the player
     *   rot = orientation of the player
     *   dir = movement direction of the player
     *   time = timestamp of when the message was sent
     * 
     * @param {Object} data - the update to send to the other players
     */
    socket.on('updatePlayer', function(data) {
        socket.broadcast.to(socket.room).emit('updatePlayer', data);
    });
    
    /**
     * Relays a selection update in the lobby screen to other users in
     * the same room. The data should contain these values:
     *
     *   selection = { playerName, robot, ability, team, ready }
     *   index = the index of the player sending the update
     *   time = the time in which the update was sent
     *
     * @param {Object} data - the update to send to other players
     */
    socket.on('updateSelection', function(data) {
        console.log('Action: Update selection [room= ' + socket.room + ']');
        roomList[socket.room].selections[data.index] = data.selection;
        socket.broadcast.to(socket.room).emit('updateSelection', data);
    });
});