
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