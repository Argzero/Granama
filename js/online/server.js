// Dependencies
var http = require('http');
var fs = require('fs');
var owner = false;

// name, room, socket, selection
var users = {};

// users, name, mode, max
var rooms = {};

// Handles sending the web page to connecting clients
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

// Handles socket connections
io.on('connection', function(socket) {
    //socket.join('room1');
    
    // Check logins
    socket.on('login', function(data) {
        
        // TODO do login validation
        
        socket.emit('general', { success: true, error: '' });
    });
    
    // Fetch rooms for a user
    socket.on('fetchRooms', function(data) {
        
        var rooms = [];
        var x;
        
        // Spectator games - need to be in progress
        if (data.players === 0) {
            for (x in rooms) {
                if (rooms[x].inProgress) {
                    rooms.push(rooms[x]);
                }
            }
        }    
        
        // Non-spectator games - need to have room for the players
        else {
            for (x in rooms) {
                if (rooms[x].maxPlayers - rooms[x].numPlayers >= data.players) {
                    rooms.push(rooms[x]);
                }
            }
        }
        
        socket.emit('updateRooms', { rooms: rooms });
    });
    
    // Create a new room
    socket.on('createRoom', function(data) {
        if (!rooms[data.room.name]) {
            data.room.selections = data.users;
            rooms[data.room.name] = data.room;
            socket.join(data.room.name);
            socket.emit('joinRoom', { 
                room: data.room, 
                selections: data.users, 
                index: 0 
            });
        }
        else {
            socket.emit('general', {
                success: true,
                error: 'Name is already taken'
            });
        }
    });
    
    // See if a user can join a room
    socket.onRequestJoin('joinRoom', function(data) {
        if (rooms[data.room]) {
            var room = rooms[data.room];
            if (room.maxPlayers - room[x].numPlayers >= data.users.length) {
                
                // Add them to the room
                for (var i = 0; i < data.users.length; i++) {
                    room.selections.push(data.users[i]);
                }
                socket.join(data.room);
                socket.room = data.room;
                room[x].numPlayers += data.users.length;
                
                // Tell the users they joined
                socket.emit('joinRoom', {
                    room: room,
                    selections: room.selections,
                    index: room[x].numPlayers - data.users.length
                });
                
                // Tell other players who joined
                socket.broadcast.to(data.room).emit('addPlayers', {
                    selections: data.users,
                    index: room[x].numPlayers - data.users.length
                });
            }
            else {
                socket.emit('general', {
                    success: false,
                    error: 'Too many players'
                });
            }
        }
        else {
            socket.emit('general', {
                success: false,
                error: 'Room does not exist'
            });
        }
    });
    
    // Updates a player's lobby selection
    socket.onUpdateSelection('updateSelection', function(data) {
        socket.broadcast.to(socket.room).emit('updateSelection', data);
    });
    
    // Handles socket disconnects
    socket.on('disconnect', function() { 
    
        // Leave a room if in one
        if (socket.room) {
            
            // TODO remove from game
            
            socket.leave(socket.room);
            delete socket.room;
        }
    });
});