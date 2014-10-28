// An explosion for when an enemy dies
function Explosion(x, y, size) {
    this.frame = 0;
    this.size = size;
    this.x = x;
    this.y = y;
    this.c = 0;
    
    // Draws the explosion
    this.draw = function() {
        var img = EXPLOSION_IMGS[Math.floor(this.c + this.frame)];
        canvas.drawImage(img, this.x - img.width * this.size / 2, this.y - img.height * this.size / 2, this.size * img.width, this.size * img.height);
        this.frame += 0.4;
		if (this.frame >= 10) {
			this.expired = true;
		}
    }
}