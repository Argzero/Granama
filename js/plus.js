// A plus particle
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
//   velX - horizontal velocity
//   velY - vertical velocity
function Plus(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.sprite = GetImage("abilityPlus");
    
    // Updates the bullet's position
    this.Update = Update;
    function Update() {
        this.x += this.velX;
        this.y += this.velY;
    }
    
    // Draws the bullet
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        canvas.drawImage(this.sprite, this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
    }
}