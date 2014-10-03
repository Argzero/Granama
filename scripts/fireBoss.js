// Scorpion boss that uses flamethrowers and lasers
// x - initial horizontal coordinate
// y - initial vertical coordinate
function FireBoss(x, y) {
    this.x = x;
    this.y = y;
    this.c = 0;
    this.s = 1;
    this.health = BOSS_DATA[11] * gameScreen.bossHealthMultiplier;
    this.flameRange = BOSS_DATA[12];
    this.flameRate = BOSS_DATA[13];
    this.flameDmg = BOSS_DATA[14] * gameScreen.bossDmgMultiplier;
    this.rocketRange = BOSS_DATA[15];
    this.rocketRate = BOSS_DATA[16];
    this.rocketRound = BOSS_DATA[17];
    this.rocketDmg = BOSS_DATA[18] * gameScreen.bossDmgMultiplier;
    this.speed = BOSS_DATA[19] + gameScreen.bossSpeedBonus;
    this.tailOffset = Math.round(BOSS_DATA[20] / (this.speed / 3));
    this.tailLength = Math.round(BOSS_DATA[21] / (this.speed / 3));
    this.tailBase = Math.round(BOSS_DATA[22] / (this.speed / 3));
    this.ox = 0;
    this.oy = 1;
    this.oa = 2;
    this.index = 0;
    this.maxIndex = this.tailOffset * (this.tailLength - 1) + this.tailBase; 
    this.maxHealth = this.health;
    this.flameCd = this.flameRate;
    this.rocketCd = this.rocketRate;
    this.rocketDelay = 0;
    this.rocketShot = -1;
    this.angle = 0.0;	
    this.sprite = GetImage("bossFire");
    this.tailMid = GetImage("bossTailMid");
    this.tailEnd = GetImage("bossTailEnd");
    this.orientations = new Array();    
    
    // Updates the enemy
    this.Update = Update;
    function Update() {
    
        // Update the orientation array
        var dSq = Sq(this.x - gameScreen.player.x) + Sq(this.y - gameScreen.player.y);
        var far = dSq - Sq(this.flameRange + this.speed) > 0;
        var close = dSq - Sq(this.flameRange - this.speed) < 0;
        if (far || close) {
            this.orientations[this.index * 3 + this.ox] = this.x;
            this.orientations[this.index * 3 + this.oy] = this.y;
            this.orientations[this.index * 3 + this.oa] = this.angle;
            this.index = (this.index + 1) % this.maxIndex;
        }
    
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
        if (far) {
            this.x += m * this.c * this.speed;
            this.y += m * this.s * this.speed;
        }
        else if (close) {
            this.x -= m * this.c * this.speed;
            this.y -= m * this.s * this.speed;
        }
        
        // Firing Rockets
		if (DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y) < Sq(this.rocketRange + this.speed) && this.rocketCd <= 0 && m == 1) {
            this.rocketShot = 2;
            this.rocketDelay = 0;
            this.rocketCd = this.rocketRate;
        }
        else if (this.rocketCd > 0) {
            this.rocketCd--;
        }
        if (this.rocketShot >= 0) {
            if (this.rocketDelay <= 0) {
                this.rocketDelay = this.rocketRound;
                var offset = 15 - 15 * this.rocketShot;
                this.rocketShot--;
                var xPos = this.x + offset + this.s * offset;
                var yPos = this.y + offset - this.c * offset;
                var rocket = NewRocket(this.x + offset + this.s * offset, this.y + offset - this.c * offset, 1.5 * this.c * BULLET_SPEED, 1.5 * this.s * BULLET_SPEED, this.angle, this.rocketDmg, this.rocketRange * 1.5);
                gameScreen.bullets[gameScreen.bullets.length] = rocket;
            }
            else {
                this.rocketDelay--;
            }
        }
        
        // Flamethrower
        if (DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y) < Sq(this.flameRange + this.speed) && this.flameCd <= 0 && m == 1) {
            var xOffset1 = 40 * this.c - 60 * this.s;
            var yOffset1 = 40 * this.s + 60 * this.c;
            var xOffset2 = 40 * this.c + 60 * this.s;
            var yOffset2 = 40 * this.s - 60 * this.c;
            var img = GetImage("bossFlame");
            var fire = new Fire(this.x + xOffset1, this.y + yOffset1, BULLET_SPEED * this.c, BULLET_SPEED * this.s, this.angle, this.flameDmg, this.flameRange * 1.5);
            fire.sprite = img;
            gameScreen.bullets[gameScreen.bullets.length] = fire;
            fire = new Fire(this.x + xOffset2, this.y + yOffset2, BULLET_SPEED * this.c, BULLET_SPEED * this.s, this.angle, this.flameDmg, this.flameRange * 1.5);
            fire.sprite = img;
            gameScreen.bullets[gameScreen.bullets.length] = fire;
            this.flameCd = this.flameRate;
        }
        else if (this.flameCd > 0) {
            this.flameCd--;
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
        
        // Tail
        if (this.orientations.length == this.maxIndex * 3) {
            var j;
            for (var i = 0; i < this.tailLength - 1; i++) {
                j = (this.index - i * this.tailOffset - this.tailBase + this.maxIndex) % this.maxIndex;
                canvas.translate(this.orientations[j * 3 + this.ox], this.orientations[j * 3 + this.oy]);
                canvas.rotate(this.orientations[j * 3 + this.oa]);
                canvas.drawImage(this.tailMid, -this.tailMid.width / 2, -this.tailMid.height / 2);
                canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
            }
            j = this.index % this.maxIndex;
            canvas.translate(this.orientations[j * 3 + this.ox], this.orientations[j * 3 + this.oy]);
            canvas.rotate(this.orientations[j * 3 + this.oa]);
            canvas.drawImage(this.tailEnd, -this.tailEnd.width / 2, -this.tailEnd.height / 2);
            canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
        }
        
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