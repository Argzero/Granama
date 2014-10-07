// A turret that is placed and fires bullets at the player
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
// damage - damage the turret deals
function Turret(x, y, damage, health) {
    this.x = x;
    this.y = y;
    this.scale = 1;
    this.health = health;
    this.maxHealth = health;
    this.attackRate = TURRET_RATE;
    this.attackCd = TURRET_RATE;
    this.range = TURRET_RANGE;
    this.damage = damage;
    this.sprite = GetImage("turretGun");
    this.base = GetImage("turretBase");
    this.angle = 0;
    
    // Updates the turret
    this.Update = function() {
    
        // Update the turret's angle
        var a = Math.atan((gameScreen.player.y - this.y) / (this.x - gameScreen.player.x));
        if (this.x < player.x) {
            this.angle = -HALF_PI - a;
        }
        else {
            this.angle = HALF_PI - a;
        }
        var c = -Math.sin(this.angle);
        var s = Math.cos(this.angle);
        
        // Fire if in range
        if (this.attackCd <= 0 && DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y) < Sq(this.range) && gameScreen.player.health > 0) {
            var bullet = new Bullet(this.x + c * this.sprite.height / 2, this.y + s * this.sprite.height / 2, c * BULLET_SPEED, s * BULLET_SPEED, this.damage, this.range * 1.5);
            gameScreen.bullets[gameScreen.bullets.length] = bullet;
            this.attackCd = this.attackRate;
        }
        else if (this.attackCd > 0) {
            this.attackCd--;
        }
    };
    
    // Draws the turret
    // canvas - context of the canvas to draw to
    this.Draw = function(canvas) {
        canvas.translate(this.x, this.y);
        
        // Health bar
        if (this.health < this.maxHealth) {
            var greenWidth = this.sprite.width * this.health / this.maxHealth;
            canvas.fillStyle = "#00FF00";
            canvas.fillRect(-this.sprite.width / 2, -10 - this.sprite.height / 2, greenWidth, 5);
            canvas.fillStyle = "#FF0000";
            canvas.fillRect(greenWidth - this.sprite.width / 2, -10 - this.sprite.height / 2, this.sprite.width - greenWidth, 5);
        }
        
        canvas.drawImage(this.base, -this.base.width / 2, -this.base.height / 2);
        canvas.rotate(this.angle);
        canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
    };
	
	// Damages the turret
	this.Damage = function(amount, source) {
		this.health -= amount;
	};
}