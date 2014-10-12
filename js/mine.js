// A mine that can be placed that blows up on contact or after a certain amount of time
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
// damage - amount of damage the mine deals
function Mine(x, y, damage, type) {
    this.x = x;
    this.y = y;
    this.scale = 1;
    this.lifespan = MINE_DURATION;
    this.damage = damage;
    this.exploded = false;
    this.sprite = GetImage(type + "Mine");
    
    // Updates the mine
    this.Update = Update;
    function Update() {
        this.lifespan--;
        if (this.lifespan <= 0) {
            this.Explode();
        }
    }
    
    // Blows up the mine
    this.Explode = Explode;
    function Explode() {
        if (this.exploded) {
            return;
        }
        this.exploded = true;
        gameScreen.explosions[gameScreen.explosions.length] = new Explosion(this.x, this.y, this.sprite.width / 100);
        for (var i = 0; i < playerManager.players.length; i++) {
            var player = playerManager.players[i].robot;
            if (DistanceSq(this.x, this.y, player.x, player.y) < Sq(MINE_RADIUS)) {
                player.Damage(this.damage);
            }
        }
    }
    
    // Draws the mine
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        if (!this.exploded) {
            canvas.drawImage(this.sprite, this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
        }
    }
}