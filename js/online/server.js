// Dependencies
var http = require('http');
var fs = require('fs');
var mongoose = require('mongoose');
var crypto = require('crypto');

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
     * Relays a buff for a robot. The data should include the values:
     *
     *   robot = the ID of the robot to buff
     *   stat = the name of the stat to buff
     *   multiplier = the buff multiplier to apply
     *   duration = how long to apply the buff for
     *   time = when the buff was applied
     * 
     * @param {Object} object - the server data
     */
    socket.on('buff', function(data) {
        console.log('Action: Buff');
        socket.broadcast.to(socket.room).emit('buff', data);
    });
    
    /**
     * Relays a pattern change for a robot. The data should
     * include the values:
     *
     *   robot = the ID of the robot changing patterns
     *   pattern = the new pattern of the robot
     *   time = the time when the robot changed patterns
     *
     * @param {Object} data - the pattern change data
     */
    socket.on('changePattern', function(data) {
        console.log('Action: Change Pattern');
        socket.broadcast.to(socket.room).emit('changePattern', data);
    });
    
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
     * Relays damage events across the network The data should
     * include the values:
     *
     *   robot = the unique ID of the damaged robot
     *   damager = the unique ID of the robot dealing damage
     *   amount = the amount of damage dealt
     *   healthLeft = the amount of health the robot has left
     *   shieldLeft = the amount of shield the robot has left
     *   time = the timestamp for when the damage occurred
     *
     * @param {Object} the data
     */
    socket.on('damage', function(data) {
        console.log('Action: Damage');
        socket.broadcast.to(socket.room).emit('damage', data);
    });
    
    /**
     * Relays the event to destroy an enemy robot.
     * The data should include the values:
     *
     *   robot = the unique ID of the destroyed enemy
     *   exp = the amount of exp to drop per player
     *   score = the new score of the game
     *   time = the time stamp for when the enemy died
     *
     * @param {Object} data - response data from the server
     */
    socket.on('destroy', function(data) {
        socket.broadcast.to(socket.room).emit('destroy', data);
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
     * Informs other clients of the start of the next round. The
     * data should include the values:
     *
     *   time = the time when the round started
     *
     * @param {Object} data - the data from the server
     */ 
    socket.on('doneUpgrades', function(data) {
        console.log('Action: Done Upgrades');
        socket.broadcast.to(socket.room).emit('doneUpgrades', data);
    });
    
    /**
     * Relays a downgrade for a player. The data should include the values:
     *
     *   player = the index of the player downgrading a stat
     *   upgrade = the index of the downgraded stat
     *   time = when the downgrade took place 
     *
     * @param {Object} data - the data for the downgrade
     */ 
    socket.on('downgrade', function(data) {
        console.log('Action: Downgrade');
        socket.broadcast.to(socket.room).emit('downgrade', data);
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
     * Gives experience to a player. The data should include the values:
     *
     *   player = the index of the player receiving exp
     *   exp = the amount of received experience
     *   time = the time stamp for when the experience was received
     *
     * @param {Object} data - the data from the server
     */
    socket.on('giveExp', function(data) {
        console.log('Action: Give Exp [' + data.exp + ' to ' + data.player + ']');
        socket.broadcast.to(socket.room).emit('giveExp', data);
    });
    
    /**
     * Relays knockback to a robot. The data should include the values:
     *
     *   robot = the ID of the robot being knocked back
     *   knockback = the knockback to apply
     *   time = the time when the knockback was applied
     *
     * @param {Object} data - the data received from the server
     */
    socket.on('knockback', function(data) {
        console.log('Action: Knockback');
        socket.broadcast.to(socket.room).emit('knockback', data);
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
        
        console.log('Action: login');
        
        dbModel.authenticate(data.username, data.password, function(err, account) {
            if (err) {
                socket.emit('general', { success: false, error: 'Login Unavailable' });
            }
            else if (!account) {
                socket.emit('general', { success: false, error: 'Bad Credentials' });
            }
            else {
                socket.emit('general', { success: true });
            }
        });
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
     * Relays the paused state of the game. The data should include the values:
     *
     *   player = the index of the player who paused the game or -1 if not paused
     *   time = the time in which the game was paused/unpaused
     * 
     * @param {Object} data - the pause data
     */
    socket.on('setPaused', function(data) {
        console.log('Action: Set Paused');
        socket.broadcast.to(socket.room).emit('setPaused', data);
    });
    
    /**
     * Handles sign-up attempts from the client. The data should
     * include these values:
     *
     *   username = the client's requested username
     *   password = the client's requested password
     *
     * @param {Object} data - the login credentials provided by the client
     */
    socket.on('signup', function(data) {
        
        console.log('Action: signup');
        
        dbModel.findByUsername(data.username, function(err, account) {
            if (err) {
                console.log('Error while looking for username');
                socket.emit('general', { success: false, error: 'The login service is not available' });
            }
            else if (account) {
                console.log('Username taken');
                socket.emit('general', { success: false, error: 'Username taken' });
            }
            else {
                dbModel.generateHash(data.password, function(salt, hash) {
                    var credentials = {
                        username: data.username,
                        salt: salt,
                        password: hash
                    };
                    
                    var newAccount = new dbModel(credentials);
                    newAccount.save(function (err) {
                        if (err) {
                            console.log(err);
                            socket.emit('general', { success: false, error: 'Login Unavailable' });
                        }
                        else {
                            socket.emit('general', { success: true });
                        }
                    });
                });
            }
        });
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
     * Relays updates for non-player robots to other clients. The data
     * should include the values:
     *
     *   <id> = the position and rotation data for the robot with the ID (one for each robot)
     *   time = the time stamp from when the data was sent
     *
     * @param {Object} data - robot data
     */
    socket.on('updateRobots', function(data) {
        socket.broadcast.to(socket.room).emit('updateRobots', data);
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
    
    /**
     * Relays an upgrade for a player. The data should include the values:
     *
     *   player = the index of the player upgrading a stat
     *   upgrade = the index of the upgraded stat
     *   time = when the upgrade took place 
     *
     * @param {Object} data - the data for the upgrade
     */ 
    socket.on('upgrade', function(data) {
        console.log('Action: Upgrade');
        socket.broadcast.to(socket.room).emit('upgrade', data);
    });

    /**
     * Relays a selection update for the upgrade screen. The data
     * should include the values:
     *
     *   player = the index of the player to update for
     *   id = the index of the stat the player is now hovered over
     *   ready = whether or not the player is ready
     *   time = when the change took place
     *
     * @param {Object} data - the new selection data
     */
    socket.on('upgradeSelection', function(data) {
        console.log('Action: Upgrade Selection');
        socket.broadcast.to(socket.room).emit('upgradeSelection', data);
    });
});

// ------------------------- Database setup -------------------------------- //

var iterations = 10000;
var saltLength = 64;
var keyLength = 64;

var dbURL = process.env.MONGOLAB_URI || "mongodb://localhost/Granama";

var db = mongoose.connect(dbURL, function(err) {
    if (err) {
        console.log("Could not connect to database");
        throw err;
    }
});

var schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^[A-Za-z0-9_\-\.]{1,16}$/
    },
    
    salt: {
        type: Buffer,
        required: true
    },
    
    password: {
        type: String,
        required: true
    },
    
    profile: {
        type: String,
        required: true,
        default: '{}'
    },
    
    createDate: {
        type: Date,
        default: Date.now
    }
});

schema.methods.toAPI = function() {
    return {
        username: this.username,
        profile: JSON.parse(this.profile)
    };
};

schema.methods.validatePassword = function(password, callback) {
	var pass = this.password;
	
	crypto.pbkdf2(password, this.salt, iterations, keyLength, function(err, hash) {
		if(hash.toString('hex') !== pass) {
			return callback(false);
		}
		return callback(true);
	});
};

schema.statics.findByUsername = function(name, callback) {

    var search = {
        username: name
    };

    return dbModel.findOne(search, callback);
};

schema.statics.generateHash = function(password, callback) {
	var salt = crypto.randomBytes(saltLength);
	
	crypto.pbkdf2(password, salt, iterations, keyLength, function(err, hash){
		return callback(salt, hash.toString('hex'));
	});
};

schema.statics.authenticate = function(username, password, callback) {
	return dbModel.findByUsername(username, function(err, doc) {

		if(err)
		{
			return callback(err);
		}

        if(!doc) {
            return callback();
        }

        doc.validatePassword(password, function(result) {
            if(result === true) {
                return callback(null, doc);
            }
            
            return callback();
        });
        
	});
};

dbModel = mongoose.model('Granama', schema);