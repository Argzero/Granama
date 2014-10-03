// Boss with rocket fists
// x - initial horizontal coordinate
// y - initial vertical coordinate
function PunchBoss(x, y) {
    this.x = x;
    this.y = y;
    this.c = 0;
    this.s = 1;
    this.health = BOSS_DATA[23] * gameScreen.bossHealthMultiplier;
    this.speed = BOSS_DATA[24] + gameScreen.bossSpeedBonus;
    this.punchRange = BOSS_DATA[25];
    this.punchRate = BOSS_DATA[26];
    this.punchDmg = BOSS_DATA[27] * gameScreen.bossDmgMultiplier;
    this.punchSpeed = BOSS_DATA[28];
    this.punchDelay = BOSS_DATA[29];
    this.laserRange = BOSS_DATA[30];
    this.laserRate = BOSS_DATA[31];
    this.laserRound = BOSS_DATA[32];
    this.laserDmg = BOSS_DATA[33] * gameScreen.bossDmgMultiplier;
    this.punchCd = this.punchRate;
    this.punchSide = true;
    this.leftFist = true;
    this.rightFist = true;
    this.laserClip;
    this.laserCd = this.laserRate;
    this.ox = 0;
    this.oy = 1;
    this.oa = 2;
    this.index = 0;
    this.maxIndex = this.tailOffset * (this.tailLength - 1) + this.tailBase; 
    this.maxHealth = this.health;
    this.flameCd = this.flameRate;
    this.laserCd = this.laserRate;
    this.laserClip = 0;
    this.angle = 0.0;	
    this.sprite = GetImage("bossPunch");
    this.leftFistImg = GetImage("fistLeft");
    this.rightFistImg = GetImage("fistRight");
    
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
        var dSq = Sq(this.x - gameScreen.player.x) + Sq(this.y - gameScreen.player.y);
        if (dSq - Sq(this.punchRange + this.speed) > 0) {
            this.x += m * this.c * this.speed;
            this.y += m * this.s * this.speed;
        }
        else if (dSq - Sq(this.punchRange - this.speed) < 0) {
            this.x -= m * this.c * this.speed;
            this.y -= m * this.s * this.speed;
        }
        
        // Firing lasers
        if (DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y) < Sq(this.laserRange + this.speed) && this.laserCd <= 0 && m == 1) {
            this.laserClip = this.laserRound;
            this.laserCd = this.laserRate;
        }
        else if (this.laserCd > 0) {
            this.laserCd--;
        }
        if (this.laserClip > 0) {
            var laser = NewLaser(this.x + this.c * 75, this.y + this.s * 75, BULLET_SPEED * this.c, BULLET_SPEED * this.s, this.angle, this.laserDmg, this.laserRange * 1.5);
            laser.sprite = GetImage("bossLaser");
            gameScreen.bullets[gameScreen.bullets.length] = laser;
            this.laserClip--;
        }
        
        // Fists
        // x, y, velX, velY, angle, damage, range, boss, speed, delay, side
        if (DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y) < Sq(this.punchRange + this.speed) && this.punchCd <= 0 && m == 1) {
            this.punchCd = this.punchRate;
            
            // Determine the side to launch from
            var side;
            var m;
            var tx;
            if (this.punchSide) {
                side = "Right";
                m = 1;
                this.rightFist = false;
                tx = -5 - this.sprite.width / 2 - this.rightFistImg.width / 2;
            }
            else {
                side = "Left";
                m = -1;
                this.leftFist = false;
                tx = 5 + this.sprite.width / 2 + this.leftFistImg.width / 2;
            }
            this.punchSide = !this.punchSide;
            
            // Launch the fist
            var fist = new Fist(this.x + tx * this.s, this.y - tx * this.c, this.punchSpeed * this.c, this.punchSpeed * this.s, this.angle, this.punchDmg, this.punchRange * 1.5, this, this.punchSpeed, this.punchDelay, side, tx);
            gameScreen.bullets[gameScreen.bullets.length] = fist;
        }
        else if (this.punchCd > 0) {
            this.punchCd--;
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
        
        // Fists
        if (this.leftFist) {
            canvas.drawImage(this.leftFistImg, 5 + this.sprite.width, 0);
        }
        if (this.rightFist) {
            canvas.drawImage(this.rightFistImg, -5 - this.rightFistImg.width, 0);
        }
        
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