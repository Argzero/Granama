/**
 * A container for UI elements that aligns children
 * horizontally. and centers elements vertically
 * based on the amount of space they take up.
 *
 * @param {number} width        - the width of the menu
 * @param {number} buttonHeight - how tall each button added should be 
 *
 * @constructor
 */
function UIGrid(width, buttonHeight) {
    this.width = width;
    this.buttonHeight = buttonHeight;
    this.elements = [];
}    

/**
 * Adds a button to the grid
 *
 * @param {string}   text     - the text to be displayed on the button
 * @param {number}   yOffset  - the vertical position to place the button relative to the center
 * @param {function} callback - the function to call when the button is clicked
 */
UIGrid.prototype.addButton = function(text, yOffset, callback) {
    this.elements.push(new UIButton(text, yOffset, this.width * 5 / 6, this.width, this.buttonHeight, callback));
    return this;
};

/**
 * Adds a label to the grid
 *
 * @param {string} content - the content to display on the label (image or text)
 * @param {number} yOffset - the vertical position to place the button relative to the center
 * @param {number} height  - how tall the label should be
 */
UIGrid.prototype.addTitle = function(content, yOffset, height) {
    this.elements.push(new UITitle(content, yOffset, this.width, height));
    return this;
};

/**
 * Adds a generic UI element to the grid. It must have
 * a draw method so that it can be drawn to the screen.
 *
 * @param {Object} element - the element to add to the grid
 */ 
UIGrid.prototype.add = function(element) {
    this.elements.push(element);
    return this;
};

/** 
 * Draws the grid to the UI canvas
 */
UIGrid.prototype.draw = function() {

    var x = (ui.canvas.width - this.width) / 2;

    // Draw the rails
    ui.ctx.fillStyle = '#333';
    ui.ctx.fillRect(x - 25, 0, 25, ui.canvas.height);
    ui.ctx.fillRect(x + this.width, 0, 25, ui.canvas.height);
    ui.ctx.fillStyle = '#878787';
    ui.ctx.fillRect(x - 17, 0, 9, ui.canvas.height);
    ui.ctx.fillRect(x + this.width + 8, 0, 9, ui.canvas.height);

    // Draw the content
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i].draw();
    }
};

/**
 * A container for elements that lines things up horizontally
 * while giving equal space between each element.
 *
 * @param {number} yOffset - the vertical position to place the row
 * @param {number} width   - how wide to make the row
 * @param {number} height  - how tall the row and its children should be
 *
 * @constructor
 */
function UIRow(yOffset, width, height) {
    this.yOffset = yOffset;
    this.height = height;
    this.width = width;
    this.usedWidth = 0;
    this.elements = [];
    this.widths = [];
}

/**
 * Adds a generic element to the row. The element
 * needs to have a draw function and a width.
 *
 * @param {Object} element - the element to add to the row
 */
UIRow.prototype.add = function(element) {
    this.elements.push(element);
    this.usedWidth += element.width;
    this.widths.push(element.width);
    return this;
}

/**
 * Adds a button to the row
 *
 * @param {string}   text     - the text to display on the button
 * @param {number}   width    - the horizontal size of the button
 * @param {function} callback - the function to call when the button is clicked
 */  
UIRow.prototype.addButton = function(text, width, callback) {
    this.elements.push(new UIButton(text, this.yOffset, width, width, this.height, callback));
    this.usedWidth += width;
    this.widths.push(width);
    return this;
};

/**
 * Adds a label to the row
 *
 * @param {string} content - the content to display on the label (image or text)
 * @param {number} width   - the horizontal size of the label
 */
UIRow.prototype.addTitle = function(content, width) {
    this.elements.push(new UITitle(content, this.yOffset, width, this.height));
    this.usedWidth += width;
    this.widths.push(width);
    return this;
};

/**
 * Draws the row to the screen
 */
UIRow.prototype.draw = function() {

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

/**
 * An expanding background box for UI elements
 *
 * @param {boolean} center   - whether or not to center the box on the screen
 * @param {number}  yOffset  - the vertical position of the button relative to the center
 * @param {number}  minWidth - the horizontal size the box retracts to when not active
 * @param {number}  maxWidth - the horizontal size the box extends to when active
 * @param {number}  height   - the vertical size of the button
 *
 * @constructor
 */
function UIBox(center, yOffset, minWidth, maxWidth, height) {

    // Constants
    this.EXPAND_RATE = 5;
    this.MAX_COLOR = 100;

    // Fields
    this.center = center;
    this.y = yOffset;
    this.x = 0;
    this.width = minWidth;
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
    this.height = height;
    this.active = false;
    this.alpha = 0.75;
}

/**
 * Draws the box to the screen
 */
UIBox.prototype.draw = function() {

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
    ui.ctx.globalAlpha = this.alpha;
    ui.ctx.fillStyle = 'rgb(' + color + ',' + color + ',' + color + ')';
    ui.ctx.fillRect(x, y, this.width, this.height);
    ui.ctx.globalAlpha = 1;
};

/**
 * A simple label for menus
 *
 * @param {string|Image} content - the content to display on the label
 * @param {number}       yOffset - the vertical position of the label
 * @param {number}       width   - the horizontal size of the label
 * @param {number}       height  - the vertical size of the label
 *
 * @constructor
 */
function UITitle(content, yOffset, width, height) {
    this.content = content;
    this.yOffset = yOffset;
    this.width = width;
    this.height = height;
    this.x = 0;
}

/**
 * Draws the label to the screen
 */
UITitle.prototype.draw = function() {

    // Images for clamps
    var tl = images.get('buttonClampTop');
    var bl = images.get('buttonClampBottom');
    var tr = images.get('buttonClampTR');
    var br = images.get('buttonClampBR');

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
    
    // Draw an image
    else {
        ui.ctx.drawImage(this.content, midX + this.x - this.content.width / 2, y + this.height / 2 - this.content.height / 2);
    }

    // Draw the clamps
    ui.ctx.drawImage(tl, x - 18, y - 19);
    ui.ctx.drawImage(bl, x - 18, y + this.height - 17);
    ui.ctx.drawImage(tr, x + this.width + 18 - tr.width, y - 19);
    ui.ctx.drawImage(br, x + this.width + 18 - br.width, y + this.height - 17);
};

/**
 * A button for menus that expands when hovered over
 *
 * @param {string}   text     - the text to display on the button
 * @param {number}   yOffset  - the vertical position of the button
 * @param {number}   minWidth - the width the button retracts to when not hovered
 * @param {number}   maxWidth - the width the button expands to when hovered
 * @param {number}   height   - the vertical size of the button
 * @param {function} callback - the function to call when the button is clicked
 *
 * @constructor
 */
function UIButton(text, yOffset, minWidth, maxWidth, height, callback) {

    // Constants
    this.MAX_ROTS = 15;

    // Fields
    this.box = new UIBox(true, yOffset, minWidth, maxWidth, height);
    this.text = text;
    this.y = yOffset;
    this.height = height;
    this.rotation = new Vector(1, 0);
    this.rotCount = 0;
    this.hovered = false;
    this.clicking = false;
    this.callback = callback;
    this.x = 0;
}

/**
 * Draws the button to the screen and checks
 * for clicking on the button.
 */
UIButton.prototype.draw = function() {

    // Images
    var top = images.get('buttonClampTop');
    var bottom = images.get('buttonClampBottom');

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
};
