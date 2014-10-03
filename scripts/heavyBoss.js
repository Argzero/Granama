// Heavy boss that uses a machine gun and rockets
// x - starting horizontal coordinate
// y - starting vertical coordinate
function HeavyBoss(x, y) {
    this.x = x;
    this.y = y;
    this.c = 0;
    this.s = 1;
    this.health = BOSS_DATA[0] * gameScreen.bossHealthMultiplier;
	this.gunRange = BOSS_DATA[1];
    this.gunRate = BOSS_DATA[2];
	this.gunDmg = BOSS_DATA[3] * gameScreen.bossDmgMultiplier;
	this.rocketRange = BOSS_DATA[4];
	this.rocketRate = BOSS_DATA[5];
	this.rocketDmg = BOSS_DATA[6] * gameScreen.bossDmgMultiplier;
	this.mineRate = BOSS_DATA[7];
	this.mineDmg = BOSS_DATA[8] * gameScreen.bossDmgMultiplier;
	this.mineLifespan = BOSS_DATA[9];
	this.speed = BOSS_DATA[10] + gameScreen.bossSpeedBonus;
    this.maxHealth = this.health;
    this.gunCd = this.gunRate;
	this.rocketCd = this.rocketRate;
	this.mineCd = this.mineRate;
	this.gunSide = false;
	this.rocketSide = false;
    this.angle = 0.0;	
    this.sprite = GetImage("bossHeavy");
    
    // Updates the enemy
    this.Update = Update;
    function Update() {
        
        // Turn towards the player
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        var dot = this.s * dx + -this.c * dy;
        
        if (dot > 0) {
            this.angle -= this.speed / 100.0;
        }
        else {
            this.angle += this.speed / 100.0;
        }
        
        // Get the direction to move
        var m = 1;
        if (this.c * dx + this.s * dy < 0) {
            m = -1;
        }
        
        // Update the angle values
        this.c = -Math.sin(this.angle);
        this.s = Math.cos(this.angle);
        
        // Move the enemy to their preferred range
        var dSq = Sq(this.x - player.x) + Sq(this.y - player.y);
        console.log(player.x + ", " + player.y + ", " + dSq + ", " + this.gunRange + ", " + this.speed);
        if (dSq - Sq(this.gunRange + this.speed) > 0) {
            this.x += m * this.c * this.speed;
            this.y += m * this.s * this.speed;
        }
        else if (dSq - Sq(this.gunRange - this.speed) < 0) {
            this.x -= m * this.c * this.speed;
            this.y -= m * this.s * this.speed;
        }
        
        // Firing bullets
        if (DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y) < Sq(this.gunRange + this.speed) && this.gunCd <= 0 && m == 1) {
			var dir = this.gunSide ? 1 : -1;
			this.gunSide = !this.gunSide;
			var angle = Rand(21) - 10;
			var velX = RotateX(this.c * BULLET_SPEED, this.s * BULLET_SPEED, angle);
			var velY = RotateY(this.c * BULLET_SPEED, this.s * BULLET_SPEED, angle);
			var bullet = new Bullet(this.x + this.c * this.sprite.width / 2 - 60 * dir * this.s, this.y + this.s * this.sprite.width / 2 + 60 * dir * this.c, velX, velY, this.gunDmg, this.gunRange * 1.5);
			gameScreen.bullets[gameScreen.bullets.length] = bullet;
            this.gunCd = this.gunRate;
        }
        else if (this.gunCd > 0) {
            this.gunCd--;
        }
		
		// Firing Rockets
		if (DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y) < Sq(this.rocketRange + this.speed) && this.rocketCd <= 0 && m == 1) {
			var dir = this.rocketSide ? 1 : -1;
			this.rocketSide = !this.rocketSide;
			var bullet = NewRocket(this.x + this.c * this.sprite.width / 2 - 50 * dir * this.s - 80 * this.c, this.y + this.s * this.sprite.width / 2 + 50 * dir * this.c - 80 * this.s, 2 * this.c * BULLET_SPEED, 2 * this.s * BULLET_SPEED, this.angle, this.rocketDmg, this.rocketRange * 1.5);
			gameScreen.bullets[gameScreen.bullets.length] = bullet;
            this.rocketCd = this.rocketRate;
        }
        else if (this.rocketCd > 0) {
            this.rocketCd--;
        }
		
		// Laying mines
		if (this.mineCd <= 0) {
			var mine = new Mine(this.x - 75 * this.c, this.y - 75 * this.s, this.mineDmg, "boss");
			gameScreen.mines[gameScreen.mines.length] = mine;
			mine.lifespan = this.mineLifespan;
			this.mineCd = this.mineRate;
		}
		else {
			this.mineCd--;
		}
		
        // Limit the enemy to the map
        if (this.XMin() < 0) {
            this.x += -this.XMin();
        }
        if (this.XMax() > GAME_WIDTH) {
            this.x -= this.XMax() - GAME_WIDTH;
        }
        if (this.YMin() < 0) {
            this.y += -this.YMin();
        }
        if (this.YMax() > GAME_HEIGHT) {
            this.y -= this.YMax() - GAME_HEIGHT;
        }
    }
    
    // Draws the enemy to the gameScreen
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        canvas.translate(this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
        
        // Health bar
        if (this.health < this.maxHealth) {
            var greenWidth = this.sprite.width * this.health / this.maxHealth;
            canvas.fillStyle = "#00FF00";
            canvas.fillRect(0, -10, greenWidth, 5);
            canvas.fillStyle = "#FF0000";
            canvas.fillRect(greenWidth, -10, this.sprite.width - greenWidth, 5);
        }
        
        // Orientation
        canvas.translate(this.sprite.width / 2, this.sprite.height / 2);
        canvas.rotate(this.angle);
        canvas.translate(-this.sprite.width / 2, -this.sprite.height / 2);
        
        // Sprite
        canvas.drawImage(this.sprite, 0, 0);
        
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
    }
    
    // Gets the horizontal coordinate of the left side of the enemy
    this.XMin = XMin;
    function XMin() {
        return this.x - this.sprite.height / 2;
    }
    
    // Gets the horizontal coordinate of the right side of the enemy
    this.XMax = XMax;
    function XMax() {
        return this.x + this.sprite.height / 2;
    }
    
    // Gets the vertical coordinate of the top of the enemy
    this.YMin = YMin;
    function YMin() {
        return this.y - this.sprite.height / 2;
    }
    
    // Gets the vertical coordinate of the bottom of the enemy
    this.YMax = YMax;
    function YMax() {
        return this.y + this.sprite.height / 2;
    }
}