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
    this.cos = 0;
    this.sin = 1;
    this.gunData = { 
        cd: 0, 
        list: gameScreen.enemyManager.bullets, 
        damage: damage, 
        range: TURRET_RANGE * 1.5, 
        rate: TURRET_RATE,  
        dx: 0,
        dy: 22
    };
    this.Fire = EnemyWeaponGun;
    
    // Updates the turret
    this.Update = function() {
    
        // Update the turret's angle
        var player = playerManager.getClosest(this.x, this.y);
        this.angle = AngleTo(player, this);
        this.cos = -Math.sin(this.angle);
        this.sin = Math.cos(this.angle);
        
        // Fire if in range
        this.Fire(this.gunData);
    };
    
    // Draws the turret
    // canvas - context of the canvas to draw to
    this.Draw = function() {
        canvas.translate(this.x, this.y);
        
        // Health bar
        if (this.health < this.maxHealth) {
            var greenWidth = this.sprite.width * this.health / this.maxHealth;
            canvas.fillStyle = "#00FF00";
            canvas.fillRect(-this.sprite.width / 2, -10 - this.sprite.height / 2, greenWidth, 5);
            canvas.fillStyle = "#FF0000";
            canvas.fillRect(greenWidth - this.sprite.width / 2, -10 - this.sprite.height / 2, this.sprite.width - greenWidth, 5);
        }
        
        // Base of the turret
        if (this.base) {
            canvas.drawImage(this.base, -this.base.width / 2, -this.base.height / 2);
        }
        
        // Turret gun
        canvas.rotate(this.angle);
        canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
    };
	
	// Damages the turret
	this.Damage = function(amount, source) {
		this.health -= amount;
	};
    
    // Checks whether or not the enemy is in range of a player using the specified range
    this.IsInRange = function(range) {
        var player = playerManager.getClosest(this.x, this.y);
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        return player.health > 0 && dx * dx + dy * dy < Sq(range);
    };
}