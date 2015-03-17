// Dependencies
var http = require('http');
var fs = require('fs');
var owner = false;

// name, room, socket, selection
var users = {};

// users, name, mode, max
var roomList = {};

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
    
    // Create a new room
    socket.on('createRoom', function(data) {
        console.log('Action: Create Room [' + data.room.name + ']');
        if (!roomList[data.room.name]) {
            data.room.selections = data.users;
            roomList[data.room.name] = data.room;
            socket.room = data.room.name;
            socket.join(data.room.name);
            socket.emit('joinRoom', { 
                room: data.room, 
                selections: data.users, 
                index: 0 
            });
            console.log('Result: Room created - ' + Object.keys(roomList).length + ' rooms now');
            console.log('Users in ' + data.room.name + ' = ' + Object.keys(io.sockets.adapter.rooms[data.room.name]).length);
        }
        else {
            socket.emit('general', {
                success: true,
                error: 'Name is already taken'
            });
            console.log('Result: Name taken');
        }
    });
    
    // Destroys a room, removing its reference and all players in the room
    socket.on('destroyRoom', function(data) {
        console.log('Action: Destroy room [' + socket.room + ']');
        if (!socket.room) return;
        room = socket.room;
        delete roomList[room];
        socket.leave(room);
        var clients = io.sockets.adapter.rooms[room];
        if (clients) {
            var keys = Object.keys(clients);
            for (var i = 0; i < keys.length; i++) {
                clients[keys[i]].leave(room);
                clients[keys[i]].emit('kick', { reason: data.reason });
                delete clients[keys[i]].room;
            }
        }
        delete socket.room;
    });
    
    // Handles socket disconnects
    socket.on('disconnect', function() { 
    
        // Leave a room if in one
        if (socket.room) {
            socket.leave(socket.room);
            delete socket.room;
        }
    });
    
    // Fetch rooms for a user
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
    
    // Check logins
    socket.on('login', function(data) {
        
        // TODO do login validation
        
        socket.emit('general', { success: true, error: '' });
    });
    
    // Removes a player from a room
    socket.on('removePlayer', function(data) {
        console.log('Action: remove player');
        socket.broadcast.to(socket.room).emit('removePlayer', data);
        roomList[socket.room].numPlayers -= data.amount;
        roomList[socket.room].selections.splice(data.index, data.amount);
        socket.leave(socket.room);
        delete socket.room;
    });
    
    // See if a user can join a room
    socket.on('requestJoin', function(data) {
        console.log('Action: Join Request [' + data.room + ']');
        if (roomList[data.room]) {
            var room = roomList[data.room];
            if (room.maxPlayers - room.numPlayers >= data.users.length) {
                
                console.log(data.users.length + ' players joined room ' + data.room);
                
                // Add them to the room
                for (var i = 0; i < data.users.length; i++) {
                    room.selections.push(data.users[i]);
                }
                socket.join(data.room);
                socket.room = data.room;
                room.numPlayers += data.users.length;
                
                console.log('Now there are ' + room.numPlayers + ' players [' + room.selections.length + ' selections]');
                
                // Tell the users they joined
                socket.emit('joinRoom', {
                    room: room,
                    selections: room.selections,
                    index: room.numPlayers - data.users.length
                });
                
                // Tell other players who joined
                socket.broadcast.to(data.room).emit('addPlayers', {
                    selections: data.users,
                    index: room.numPlayers - data.users.length
                });
                
                console.log('Result: Joined');
                console.log('Users in ' + data.room + ' = ' + Object.keys(io.sockets.adapter.rooms[data.room]).length);
            }
            else {
                socket.emit('general', {
                    success: false,
                    error: 'Too many players'
                });
                
                console.log('Result: Room full');
            }
        }
        else {
            socket.emit('general', {
                success: false,
                error: 'Room does not exist'
            });
            
            console.log('Result: Does not exist');
        }
    });
    
    // Updates a player's lobby selection
    socket.on('updateSelection', function(data) {
        console.log('Action: Update selection [room= ' + socket.room + ']');
        socket.broadcast.to(socket.room).emit('updateSelection', data);
    });
});