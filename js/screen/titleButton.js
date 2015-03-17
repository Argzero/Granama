// A fancy button for the title screen
function TitleButton(text, yOffset, minWidth, maxWidth, height, callback) {
    return {

        // Constants
        MAX_ROTS : 15,
        MAX_COLOR: 100,

        // Fields
        box      : UIBox(true, yOffset, minWidth, maxWidth, height),
        text     : text,
        y        : yOffset,
        height   : height,
        rotation : Vector(1, 0),
        rotCount : 0,
        hovered  : false,
        clicking : false,
        callback : callback,

        // Draws the button
        draw     : function() {

            // Images
            var top = images.get('buttonClampTop');
            var bottom = images.get('buttonClampBottom');

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