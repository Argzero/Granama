function UIGrid(width, buttonHeight) {
	return {
		
		width: width,
		buttonHeight: buttonHeight,
		elements: [],
		
		addButton: function(text, yOffset, callback) {
			this.elements.push(UIButton(text, yOffset, this.width * 5 / 6, this.width, this.buttonHeight, callback));
		},
		
		addTitle: function(content, yOffset, height) {
			this.elements.push(UITitle(content, yOffset, this.width, height));
		},
		
		draw: function() {
	
			var x = (element.width - this.width) / 2;
	
			// Draw the rails
			canvas.fillStyle = '#333';
			canvas.fillRect(x - 25, 0, 25, element.height);
			canvas.fillRect(x + this.width, 0, 25, element.height);
			canvas.fillStyle = '#878787'
			canvas.fillRect(x - 17, 0, 9, element.height);
			canvas.fillRect(x + this.width + 8, 0, 9, element.height);
		
			// Draw the content
			for (var i = 0; i < this.elements.length; i++) {	
				this.elements[i].draw();
			}
		}
	};
}

// An expanding background box for UI elements
function UIBox(center, yOffset, minWidth, maxWidth, height) {
    return {
    
        // Constants
        EXPAND_RATE: 5,
        MAX_COLOR: 100,
        
        // Fields
        center: center,
        y: yOffset,
        width: minWidth,
        minWidth: minWidth,
        maxWidth: maxWidth,
        height: height,
        active: false,
        
        // Draws the button
        draw: function() {
        
            // Calculations
            var midX = element.width / 2;
            var midY = element.height / 2;
            var x = this.center ? midX - this.maxWidth / 2 : 0;
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
            canvas.globalAlpha = 0.75;
            canvas.fillStyle = 'rgb(' + color + ',' + color + ',' + color + ')';
            canvas.fillRect(x, y, this.width, this.height);
            canvas.globalAlpha = 1;
        }
    };
}

function UITitle(content, yOffset, width, height) {
	return {
	
		content: content,
		yOffset: yOffset,
		width: width,
		height: height,
		
		// Draws the button
        draw: function() {
		
			// Images
            var tl = GetImage('buttonClampTop');
            var bl = GetImage('buttonClampBottom');
			var tr = GetImage('buttonClampTR');
			var br = GetImage('buttonClampBR');
			
			// Calculations
            var midX = element.width / 2;
            var midY = element.height / 2;
			var x = midX - this.width / 2;
            var y = midY + this.yOffset - this.height / 2;
		
			// Draw the box
            canvas.globalAlpha = 0.75;
            canvas.fillStyle = '#000';
            canvas.fillRect(x, y, this.width, this.height);
            canvas.globalAlpha = 1;
			
			// Draw the text
			if (this.content.length) {
				canvas.font = (this.height * 2 / 3) + 'px Flipbash';
				canvas.fillStyle = 'white';
				canvas.textAlign = this.align;
				canvas.textBaseline = 'middle';
				canvas.textAlign = 'center';
				canvas.fillText(this.content, midX, y + this.height * 4 / 9);
			}
			
			// Draw the clamps
            
            canvas.drawImage(tl, x - 18, y -19);
            canvas.drawImage(bl, x - 18, y + this.height - 17);
            canvas.drawImage(tr, x + width + 18 - tr.width, y - 19);
            canvas.drawImage(br, x + width + 18 - br.width, y + this.height - 17);
		}
	}
}

// A fancy button for the title screen
function UIButton(text, yOffset, minWidth, maxWidth, height, callback) {
    return {
    
        // Constants
        MAX_ROTS: 15,
        MAX_COLOR: 100,
        
        // Fields
        box: UIBox(true, yOffset, minWidth, maxWidth, height),
        text: text,
        y: yOffset,
        height: height,
        rotation: Vector(1, 0),
        rotCount: 0,
        hovered: false,
        clicking: false,
        callback: callback,
        
        // Draws the button
        draw: function() {
        
            // Images
            var top = GetImage('buttonClampTop');
            var bottom = GetImage('buttonClampBottom');
            
            // Calculations
            var midX = element.width / 2;
            var midY = element.height / 2;
            var x = midX - this.box.maxWidth / 2;
            var y = midY - this.height / 2 + this.y;
            var w = this.box.width;
            var h = this.height;
            
            // Hover updates
            this.hovered = mx >= x && mx <= x + w && my >= y + 20 && my <= y + h + 20;
            var color, alpha;
            if (this.hovered) { 
                if (this.rotCount < this.MAX_ROTS) {
                    this.rotation.Rotate(COS_1, SIN_1);
                    this.rotCount++;
                }
            }
            else {
                if (this.rotCount > 0) {
                    this.rotation.Rotate(COS_1, -SIN_1);
                    this.rotCount--;
                }
            }
            
            // Draws the UI box
            this.box.active = this.hovered;
            this.box.draw();
            
            // Draw the clamps
            canvas.translate(x, y - 1);
            canvas.transform(this.rotation.x, -this.rotation.y, this.rotation.y, this.rotation.x, 0, 0);
            canvas.drawImage(top, -18, -18);
            canvas.setTransform(1, 0, 0, 1, 0, 0);
            canvas.translate(x, y + h + 1);
            canvas.transform(this.rotation.x, this.rotation.y, -this.rotation.y, this.rotation.x, 0, 0);
            canvas.drawImage(bottom, -18, -18);
            canvas.setTransform(1, 0, 0, 1, 0, 0);
            
            // Draw the text
            canvas.font = (h * 2 / 3) + 'px Flipbash';
            canvas.fillStyle = 'white';
            canvas.textAlign = 'left';
            canvas.textBaseline = 'middle';
            canvas.fillText(this.text, x + 80 + (this.box.width - this.box.minWidth) / 2, y + h * 4 / 9);
            
            // Callback function
            if (this.clicking && !KeyPressed(KEY_LMB)) {
                this.clicking = false;
                if (this.hovered) {
                    this.callback();
                }
            }
            else if (KeyPressed(KEY_LMB)) {
                this.clicking = true;
            }
        }
    };
}