function HostScreen() {
    this.name = '';
    this.mode = 'Arcade';
    this.index = 0;
    this.error = '';
}

HostScreen.prototype.draw = function() {
    
    // Prevent IE bugs
    ui.ctx.setTransform(1, 0, 0, 1, 0, 0);
    ui.drawBackground();
    
    ui.ctx.font = "70px Flipbash";

    // Draw the title box
    var x = ui.canvas.width / 2;
    var y = ui.canvas.height / 2;
    ui.ctx.fillStyle = "#484848";
    ui.ctx.fillRect(x - 395, y - 300, 790, 110);
    ui.ctx.fillStyle = "#000000";
    ui.ctx.fillRect(x - 385, y - 290, 770, 90);

    // Draw the title
    ui.ctx.fillStyle = "#FFFFFF";
    ui.ctx.textAlign = 'center';
    ui.ctx.textBaseline = 'top';
    ui.ctx.fillText("Create a Room", x, y - 300);

    var j, k, dx;
    
    // Draw the boxes for the options
    ui.ctx.fillStyle = '#484848';
    ui.ctx.fillRect(x - 125, y - 170, 250, 500);
    ui.ctx.fillStyle = '#000';
    ui.ctx.fillRect(x - 115, y - 160, 230, 480);

    // Input
    var input = players[0].input;
    input.update();
    
    // Current name display
    ui.ctx.textAlign = 'center';
    ui.ctx.font = '32px Flipbash';
    ui.ctx.fillStyle = '#fff';
    ui.ctx.fillText('Room Name', x, y - 125);
    ui.ctx.font = '24px Flipbash';
    ui.ctx.fillStyle = '#ccc';
    var text = '[' + this.name + ']';
    ui.ctx.fillText(text, x, y - 75);

    // Draw the letter grid
    var perRow = 5;
    var interval = 230 / 5;
    var rows = Math.ceil((4 + ALPHABET.length) / perRow);
    for (j = 0; j < ALPHABET.length; j++) {
        var row = Math.floor(j / perRow);
        var column = j % perRow;
        ui.ctx.fillStyle = j == this.index ? 'white' : '#666';
        ui.ctx.fillText(ALPHABET[j], x - 115 + interval * (column + 0.5), y + 30 * row);
    }

    // Del button
    ui.ctx.fillStyle = this.index == ALPHABET.length ? 'white' : '#666';
    ui.ctx.fillText('Del', x + 115 - 3 * interval, y + 30 * (rows - 1));

    // Done button
    ui.ctx.fillStyle = this.index > ALPHABET.length ? 'white' : '#666';
    ui.ctx.fillText('Done', x + 115 - interval, y + 30 * (rows - 1));

    // Errors
    ui.ctx.font = '18px Flipbash';
    ui.ctx.fillStyle = 'red';
    ui.ctx.fillText(this.error, x, y + 30 * (rows + 1));

    // Input for navigating the letter grid
    var r = Math.floor(this.index / perRow);
    var c = this.index % perRow;
    if (input.button(LEFT_1) == 1 || input.button(LEFT_2) == 1) {
        c = (c + perRow - 1) % perRow;
        if (this.index > ALPHABET.length) {
            c = ALPHABET.length % perRow;
        }
    }
    if (input.button(RIGHT_1) == 1 || input.button(RIGHT_2) == 1) {
        c = (c + 1) % perRow;
        if (this.index == ALPHABET.length) {
            this.index += 2;
        }
        else if (this.index > ALPHABET.length) {
            c = 0;
        }
    }
    if (input.button(DOWN_1) == 1 || input.button(DOWN_2) == 1) {
        r = (r + 1) % rows;
    }
    if (input.button(UP_1) == 1 || input.button(UP_2) == 1) {
        r = (r + rows - 1) % rows;
    }
    this.index = c + r * perRow;

    // Choosing a letter/finishing
    if (input.button(SELECT_1) == 1 || input.button(SELECT_2) == 1) {
        
        // Adding a letter
        if (this.index < ALPHABET.length) {
            if (this.name.length < 10) {
                this.name += ALPHABET[this.index];
            }
        }
        
        // Backspace
        else if (this.index == ALPHABET.length) {
            if (this.name.length > 0) {
                this.name = this.name.substring(0, this.name.length - 1);
            }
        }
        
        // Cannot be an empty username
        else if (this.name.length === 0) {
            this.error = 'Invalid Room Name';
        }

        // Complete the input
        else {
            connection.createRoom(this.name, function(data) {
                this.error = data.error;
            });
        }
    }

    // Returning to profile select
    if (input.button(CANCEL_1) == 1 || input.button(CANCEL_2)) {
        settings.part -= 0.5;
    }
};