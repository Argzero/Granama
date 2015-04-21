/**
 * Represents the controls screen
 */
function ControlsScreen() {
    this.controls = images.get('controlsScreen');
    this.clicking = false;
}

/**
 * Draws the controls screen to the ui.ctx
 */ 
ControlsScreen.prototype.draw = function() {

    // Prevent IE bugs
    ui.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Draw the background
    ui.drawBackground();

    // Draw the main section
    var scale = (ui.canvas.height - 140) / this.controls.height;
    var scale2 = (ui.canvas.width - 20) / this.controls.width;
    if (scale2 < scale) {
        scale = scale2;
    }
    ui.ctx.drawImage(this.controls, (ui.canvas.width - this.controls.width * scale) / 2, 10, this.controls.width * scale, this.controls.height * scale);

    var cx = controls.mouse.x;
    var cy = controls.mouse.y;

    var wx = ui.canvas.width / 2;
    var wy = ui.canvas.height / 2;

    var bw = (ui.canvas.width - 40) / 2;
    if (bw > this.controls.width * scale / 2 - 10) {
        bw = this.controls.width * scale / 2 - 10;
    }
    var by = this.controls.height * scale + 20;

    // Back button
    ui.ctx.textBaseline = 'middle';
    var backHovered = cx < wx - 10 && cx > wx - bw - 10 && cy > by && cy < by + 80;
    ui.ctx.fillStyle = BUTTON_BORDER;
    ui.ctx.fillRect(wx - bw - 10, by, bw, 80);
    ui.ctx.fillStyle = backHovered ? BUTTON_HOVER : BUTTON_BG;
    ui.ctx.fillRect(wx - bw, by + 10, bw - 20, 60);
    ui.ctx.fillStyle = "#FFFFFF";
    ui.ctx.font = "50px Flipbash";
    ui.ctx.fillText("Back", wx - 10 - bw / 2 - ui.ctx.measureText("Back").width / 2, by + 40);

    // Play button
    var playHovered = cx > wx + 10 && cx < wx + bw + 10 && cy > by && cy < by + 80;
    ui.ctx.fillStyle = BUTTON_BORDER;
    ui.ctx.fillRect(wx + 10, by, bw, 80);
    ui.ctx.fillStyle = playHovered ? BUTTON_HOVER : BUTTON_BG;
    ui.ctx.fillRect(wx + 20, by + 10, bw - 20, 60);
    ui.ctx.fillStyle = "#FFFFFF";
    ui.ctx.font = "50px Flipbash";
    ui.ctx.fillText("Play", wx + 10 + bw / 2 - ui.ctx.measureText("Play").width / 2, by + 40);

    // Unmarks the left mouse button as pressed
    if (!controls.mouse.left) {
        escDown = false;
    }

    // Button interactions
    if (this.clicking && !controls.mouse.left) {
        if (playHovered) {
            setPlayerCount(5);
            gameScreen = new SelectScreen();
        }
        else if (backHovered) {
            gameScreen = new TitleScreen();
        }
    }
    this.clicking = controls.mouse.left;

    // Draw the cursor
    ui.drawCursor();
};