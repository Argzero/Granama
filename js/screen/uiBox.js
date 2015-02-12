function UIGrid(width, buttonHeight) {
    return {

        width       : width,
        buttonHeight: buttonHeight,
        elements    : [],

        addButton: function(text, yOffset, callback) {
            this.elements.push(UIButton(text, yOffset, this.width * 5 / 6, this.width, this.buttonHeight, callback));
            return this;
        },

        addTitle: function(content, yOffset, height) {
            this.elements.push(UITitle(content, yOffset, this.width, height));
            return this;
        },

        add: function(element) {
            this.elements.push(element);
            return this;
        },

        draw: function() {

            var x = (ui.canvas.width - this.width) / 2;

            // Draw the rails
            ui.ctx.fillStyle = '#333';
            ui.ctx.fillRect(x - 25, 0, 25, ui.canvas.height);
            ui.ctx.fillRect(x + this.width, 0, 25, ui.canvas.height);
            ui.ctx.fillStyle = '#878787'
            ui.ctx.fillRect(x - 17, 0, 9, ui.canvas.height);
            ui.ctx.fillRect(x + this.width + 8, 0, 9, ui.canvas.height);

            // Draw the content
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].draw();
            }
        }
    };
}

function UIRow(yOffset, width, height) {
    return {

        yOffset  : yOffset,
        height   : height,
        width    : width,
        usedWidth: 0,
        elements : [],
        widths   : [],

        addButton: function(text, width, callback) {
            this.elements.push(UIButton(text, this.yOffset, width, width, this.height, callback));
            this.usedWidth += width;
            this.widths.push(width);
            return this;
        },

        addTitle: function(content, width) {
            this.elements.push(UITitle(content, this.yOffset, width, this.height));
            this.usedWidth += width;
            this.widths.push(width);
            return this;
        },

        draw: function() {

            var x = (ui.canvas.width - this.width) / 2;
            var spacing = (this.width - this.usedWidth) / (this.elements.length + 1);

            // Connecting rail
            ui.ctx.fillStyle = '#333';
            ui.ctx.fillRect(x, ui.canvas.height / 2 + this.yOffset - 10, this.width, 20);
            ui.ctx.fillStyle = '#878787';
            ui.ctx.fillRect(x - 8, ui.canvas.height / 2 + this.yOffset - 5, this.width + 16, 10);

            // Draw the content
            x = spacing - this.width / 2;
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].x = x + this.widths[i] / 2;
                if (this.elements[i].box) {
                    this.elements[i].box.x = x;
                }
                this.elements[i].draw();
                x += spacing + this.widths[i];
            }
        }
    };
}

// An expanding background box for UI elements
function UIBox(center, yOffset, minWidth, maxWidth, height) {
    return {

        // Constants
        EXPAND_RATE: 5,
        MAX_COLOR  : 100,

        // Fields
        center     : center,
        y          : yOffset,
        x          : 0,
        width      : minWidth,
        minWidth   : minWidth,
        maxWidth   : maxWidth,
        height     : height,
        active     : false,

        // Draws the button
        draw       : function() {

            // Calculations
            var midX = ui.canvas.width / 2;
            var midY = ui.canvas.height / 2;
            var x = (this.center ? midX - this.maxWidth / 2 : 0) + this.x;
            var y = (this.center ? midY - this.height / 2 : 0) + this.y;

            // Hover updates
            var color, alpha;
            if (this.active) {
                this.width = Math.min(this.width + this.EXPAND_RATE, this.maxWidth);
            }
            else {
                this.width = Math.max(this.width - this.EXPAND_RATE, this.minWidth);
            }

            // More calculations
            var ratio = ((this.width - this.minWidth) / (this.maxWidth - this.minWidth));
            color = Math.floor(this.MAX_COLOR * ratio);

            // Draw the box
            ui.ctx.globalAlpha = 0.75;
            ui.ctx.fillStyle = 'rgb(' + color + ',' + color + ',' + color + ')';
            ui.ctx.fillRect(x, y, this.width, this.height);
            ui.ctx.globalAlpha = 1;
        }
    };
}

function UITitle(content, yOffset, width, height) {
    return {

        content: content,
        yOffset: yOffset,
        width  : width,
        height : height,
        x      : 0,

        // Draws the button
        draw   : function() {

            // Images
            var tl = GetImage('buttonClampTop');
            var bl = GetImage('buttonClampBottom');
            var tr = GetImage('buttonClampTR');
            var br = GetImage('buttonClampBR');

            // Calculations
            var midX = ui.canvas.width / 2;
            var midY = ui.canvas.height / 2;
            var x = midX - this.width / 2 + this.x;
            var y = midY + this.yOffset - this.height / 2;

            // Draw the box
            ui.ctx.globalAlpha = 0.75;
            ui.ctx.fillStyle = '#000';
            ui.ctx.fillRect(x, y, this.width, this.height);
            ui.ctx.globalAlpha = 1;

            // Draw the text
            if (this.content.length) {
                ui.ctx.font = (this.height * 2 / 3) + 'px Flipbash';
                ui.ctx.fillStyle = 'white';
                ui.ctx.textAlign = this.align;
                ui.ctx.textBaseline = 'middle';
                ui.ctx.textAlign = 'center';
                ui.ctx.fillText(this.content, midX + this.x, y + this.height * 4 / 9);
            }

            // Draw the clamps
            ui.ctx.drawImage(tl, x - 18, y - 19);
            ui.ctx.drawImage(bl, x - 18, y + this.height - 17);
            ui.ctx.drawImage(tr, x + width + 18 - tr.width, y - 19);
            ui.ctx.drawImage(br, x + width + 18 - br.width, y + this.height - 17);
        }
    }
}

// A fancy button for the title screen
function UIButton(text, yOffset, minWidth, maxWidth, height, callback) {
    return {

        // Constants
        MAX_ROTS : 15,
        MAX_COLOR: 100,

        // Fields
        box      : UIBox(true, yOffset, minWidth, maxWidth, height),
        text     : text,
        y        : yOffset,
        height   : height,
        rotation : new Vector(1, 0),
        rotCount : 0,
        hovered  : false,
        clicking : false,
        callback : callback,
        x        : 0,

        // Draws the button
        draw     : function() {

            // Images
            var top = GetImage('buttonClampTop');
            var bottom = GetImage('buttonClampBottom');

            // Calculations
            var midX = ui.canvas.width / 2;
            var midY = ui.canvas.height / 2;
            var x = midX - this.box.maxWidth / 2 + this.x;
            var y = midY - this.height / 2 + this.y;
            var w = this.box.width;
            var h = this.height;

            // Hover updates
            this.hovered = controls.isMouseOver(x, y, w, h);
            var color, alpha;
            if (this.hovered) {
                if (this.rotCount < this.MAX_ROTS) {
                    this.rotation.rotate(COS_1, SIN_1);
                    this.rotCount++;
                }
            }
            else {
                if (this.rotCount > 0) {
                    this.rotation.rotate(COS_1, -SIN_1);
                    this.rotCount--;
                }
            }

            // Draws the UI box
            this.box.active = this.hovered;
            this.box.draw();

            // Draw the clamps
            ui.ctx.translate(x, y - 1);
            ui.ctx.transform(this.rotation.x, -this.rotation.y, this.rotation.y, this.rotation.x, 0, 0);
            ui.ctx.drawImage(top, -18, -18);
            ui.ctx.setTransform(1, 0, 0, 1, 0, 0);
            ui.ctx.translate(x, y + h + 1);
            ui.ctx.transform(this.rotation.x, this.rotation.y, -this.rotation.y, this.rotation.x, 0, 0);
            ui.ctx.drawImage(bottom, -18, -18);
            ui.ctx.setTransform(1, 0, 0, 1, 0, 0);

            // Draw the text
            ui.ctx.font = (h * 2 / 3) + 'px Flipbash';
            ui.ctx.fillStyle = 'white';
            ui.ctx.textAlign = 'left';
            ui.ctx.textBaseline = 'middle';
            ui.ctx.fillText(this.text, x + 80 + (this.box.width - this.box.minWidth) / 2, y + h * 4 / 9);

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
}