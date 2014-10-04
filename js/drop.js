// A drop in the game
//    x - horizontal coordinate of the drop
//    y - vertical coordinate of the drop
// type - name of the type of the drop
function Drop(x, y, type) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.scale = 1;
    this.sprite = new Image();
    this.sprite.src = "images/upgrade" + type + ".png";
    
    // Draws the drop
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        canvas.drawImage(this.sprite, this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
    }
}