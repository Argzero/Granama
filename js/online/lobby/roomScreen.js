/**
 * The menu where the user can select a room to join
 * or to create their own room.
 *
 * @constructor
 */
function RoomScreen() {
    
    // Setup UI
    this.ui = UIGrid(1000, 75)//text, yOffset, maxWidth, height, callback
        .addTitle('Multiplayer Games', -300, 100)
        .add(UIRow(-160, 1000, 50)
            .add(new RoomButton('', -160, 500, 75, function() {
                gameScreen.applyClick(this.text);
            }))
            .add(new RoomButton('', -160, 500, 75, function() {
                gameScreen.applyClick(this.text);
            }))
        )
        .add(UIRow(-50, 1000, 50)
            .add(new RoomButton('', -50, 500, 75, function() {
                gameScreen.applyClick(this.text);
            }))
            .add(new RoomButton('', -50, 500, 75, function() {
                gameScreen.applyClick(this.text);
            }))
        )
        .add(UIRow(60, 1000, 50)
            .add(new RoomButton('', 60, 500, 75, function() {
                gameScreen.applyClick(this.text);
            }))
            .add(new RoomButton('', 60, 500, 75, function() {
                gameScreen.applyClick(this.text);
            }))
        )
        .add(UIRow(170, 1000, 50)
            .add(new RoomButton('', 170, 500, 75, function() {
                gameScreen.applyClick(this.text);
            }))
            .add(new RoomButton('', 170, 500, 75, function() {
                gameScreen.applyClick(this.text);
            }))
        )
        .add(UIRow(280, 1000, 50)  
            .addButton('Host', 300, function() {
                
                // TODO allow player to choose room name
                
                connection.createRoom('Room' + rand(1000000));
            })
            .addButton('Refresh', 400, function() {
                connection.fetchRooms();
            })
            .addButton('Return', 300, function() {
                connection.disconnect();
                gameScreen = new TitleScreen();
            })
        );
        
    connection.connect();
    connection.fetchRooms();
}

/**
 * Draws the room screen to the canvas
 */
RoomScreen.prototype.draw = function() {

    // Prevent IE bugs
    ui.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Draw the background
    ui.drawBackground();
    
    this.ui.draw();

    // Draw the cursor
    ui.drawCursor();
};

/**
 * Updates the room list using the response data from the server
 *
 * @param {Object} data - response data from the server 
 */
RoomScreen.prototype.updateRooms = function(data) {
    var a, b, i, cell;
    
    // Apply data to the UI rooms
    for (i = 0; i < data.rooms.length && i < 8; i++) {
        a = 1 + (i >> 1); // 1 + i / 2
        b = (i & 1);      //     i % 2
        
        cell = this.ui.elements[a].elements[b];
        var room = data[i];
        
        cell.text = room.name;
        cell.on = room.numPlayers;
        cell.off = room.maxPlayers - room.numPlayers;
        cell.gameType = room.gameType;
    }
    
    // Clear data for remaining UI rooms
    for (i = data.rooms.length; i < 8; i++) {
        a = 1 + (i >> 1); // 1 + i / 2
        b = (i & 1);      //     i % 2
        
        cell = this.ui.elements[a].elements[b];
        cell.text = '';
        cell.box.active = false;
    }
};

/**
 * Handles selecting a room to join
 *
 * @param {string} text - the room name to attempt to join
 */
RoomScreen.prototype.applyClick = function(text) {
    if (text.length === 0) return;
    
    connection.joinRoom(text);
};

/**
 * A Button containing information for joining a room
 *
 * @param {string} text    - the name of the room
 * @param {number} yOffset - 
 */
function RoomButton(text, yOffset, width, height, callback) {

    // Fields
    this.box = UIBox(true, yOffset, width - 1, width, height);
    this.box.EXPAND_RATE = 0.02;
    this.box.alpha = 0.85;
    this.text = text;
    this.y = yOffset;
    this.height = height;
    this.hovered = false;
    this.clicking = false;
    this.width = width;
    this.callback = callback;
    this.x = 0;
}

// Draws the button
RoomButton.prototype.draw = function() {

    // Images
    var top = images.get('buttonClampTop');
    var bottom = images.get('buttonClampBottom');
    var tr = images.get('buttonClampTR');
    var br = images.get('buttonClampBR');
    
    // Calculations
    var midX = ui.canvas.width / 2;
    var midY = ui.canvas.height / 2;
    var x = midX - this.box.maxWidth / 2 + this.x;
    var y = midY - this.height / 2 + this.y;
    var w = this.box.width;
    var h = this.height;

    // Draws the UI box
    this.box.draw();

    // Draw the clamps
    ui.ctx.drawImage(top, x - 18, y - 19);
    ui.ctx.drawImage(bottom, x - 18, y + h - 17);
    ui.ctx.drawImage(tr, x + w + 18 - tr.width, y - 19);
    ui.ctx.drawImage(br, x + w + 18 - br.width, y + h - 17);

    if (this.text.length > 0) {
    
        // Check for hovering
        this.hovered = controls.isMouseOver(x, y, w, h);
        this.box.active = this.hovered;
    
        // Draw the text
        ui.ctx.font = (h / 2) + 'px Flipbash';
        ui.ctx.fillStyle = 'white';
        ui.ctx.textAlign = 'left';
        ui.ctx.textBaseline = 'top';
        ui.ctx.fillText(this.text, x + 80, y + h * 0.05);

        // Callback function
        if (this.clicking && !controls.mouse.left) {
            this.clicking = false;
            if (this.hovered) {
                this.callback();
            }
        }
        else if (controls.mouse.left) {
            this.clicking = true;
        }
    }
};