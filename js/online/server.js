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
    fs.readFile('./index.html', function(error, data) {
        if (error) {
            response.writeHead(500);
            return response.end('Error loading index.html');
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
    
    // Handle chat messages
    //socket.on('msg', function(data) {
        //socket.broadcast.to('room1').emit('msg', data);
    //});
    
    // Handles socket disconnects
    socket.on('disconnect', function() {        
        //delete users[socket.name];
        
        // Remove from the room
        //socket.leave('room1');
    });
});