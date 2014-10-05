// Base object for projectiles
function ProjectileBase(sprite, source, x, y, velX, velY, angle, damage, range, pierce, offScreen) {
    var tx = source.x + source.cos * y - source.sin * x;
    var ty = source.y + source.sin * y + source.cos * x;
    return {
    
        // Fields
        sprite: sprite,
        source: source,
        x: tx,
        y: ty,
        ox: tx,
        oy: ty,
        pierce: pierce,
        velX: velX,
        velY: velY,
        angle: angle,
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        range: range,
        damage: damage,
        scale: undefined,
        offScreen: offScreen,
        expired: false,
        
        // Components to be set by specific projectiles
        ApplyUpdate: undefined,
        
        // Functions
        Update: projectileFunctions.Update,
        Draw: projectileFunctions.Draw
    };
}

// Functions for bullets
var projectileFunctions = {

    // Updates the bullet's position
    Update: function() {
    
        // Move according to its velocity
        this.x += this.velX;
        this.y += this.velY;
        
        // Mark as expired when outside its range
        var dx = this.x - this.ox;
        var dy = this.y - this.oy;
        if (dx * dx + dy * dy >= range) {
            this.expired = true;
        }
        
        // Apply special updates if applicable
        if (this.ApplyUpdate) {
            this.ApplyUpdate();
        }
    },
    
    // Draws the bullet
    Draw: function() {
        canvas.translate(this.x, this.y);
        canvas.transform(this.cos, this.sin, -this.sin, this.cos, 0, 0);
        if (this.scale) {
            canvas.drawImage(this.sprite, -this.sprite.width * this.scale / 2, -this.sprite.height * this.scale / 2, this.sprite.width * this.scale, this.sprite.height * this.scale);
        }
        else {
            canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        }
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
    }
};