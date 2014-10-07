// An explosion for when an enemy dies
function Explosion(x, y, size) {
    this.frame = 0;
    this.size = size;
    this.x = x;
    this.y = y;
    
    // Draws the explosion
    this.Draw = Draw;
    function Draw(canvas) {
        var img = gameScreen.explosion[Math.floor(this.frame)];
        canvas.drawImage(img, this.x - img.width * this.size / 2, this.y - img.height * this.size / 2, this.size * img.width, this.size * img.height);
        this.frame += 0.4;
    }
}