// A drop in the game
//    x - horizontal coordinate of the drop
//    y - vertical coordinate of the drop
// type - name of the type of the drop
function Drop(x, y, type, id, player) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.id = id;
    this.player = player;
    this.scale = 1;
    this.sprite = new Image();
    this.sprite.src = "images/upgrade" + type + ".png";
    
    // Draws the drop
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        canvas.drawImage(this.sprite, this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
        if (this.player) {
            canvas.strokeStyle = this.player.color;
            canvas.lineWidth = 3;
            canvas.beginPath();
            canvas.arc(this.x, this.y, this.sprite.width / 2, 0, Math.PI * 2);
            canvas.stroke();
        }
    }
}