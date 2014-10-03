// Scorpion boss that uses flamethrowers and lasers
// x - initial horizontal coordinate
// y - initial vertical coordinate
function DragonBoss(x, y) {
    this.x = x;
    this.y = y;
    this.c = 0;
    this.s = 1;
    this.health = BOSS_DATA[34] * gameScreen.bossHealthMultiplier;
    this.speed = BOSS_DATA[35] + gameScreen.bossSpeedBonus;
    this.tailLength = BOSS_DATA[36];
    this.tailOffset = Math.round(BOSS_DATA[37] / (this.speed / 3));
    this.tailSpace = Math.round(BOSS_DATA[38] / (this.speed / 3));
    this.tailEnd = Math.round(BOSS_DATA[39] / (this.speed / 3));
    this.gunRate = BOSS_DATA[40];
    this.gunDmg = BOSS_DATA[41] * gameScreen.bossDmgMultiplier;
    this.gunRange = BOSS_DATA[42];
    this.turretRate = BOSS_DATA[43];
    this.turretDmg = BOSS_DATA[44] * gameScreen.bossDmgMultiplier;
    this.turretRange = BOSS_DATA[45];
    this.gunCd = this.gunRate;
    this.turretCd = this.turretRate;
    this.ox = 0;
    this.oy = 1;
    this.oa = 2;
    this.index = 0;
    this.maxIndex = this.tailSpace * (this.tailLength - 1) + this.tailOffset + this.tailEnd; 
    this.maxHealth = this.health;
    this.angle = 0.0;	
    this.sprite = GetImage("bossDragonHead");
    this.segment = GetImage("bossDragonSegment");
    this.end = GetImage("bossDragonEnd");
    this.turret = GetImage("bossDragonTurret");
    this.leftWing = GetImage("bossDragonLeftWing");
    this.rightWing = GetImage("bossDragonRightWing");
    this.leftBoomerang = GetImage("bossDragonBoomerangLeft");
    this.rightBoomerang = GetImage("bossDragonBoomerangRight");
    this.gun = GetImage("bossDragonGun");
    this.orientations = new Array();    
    
    // Updates the enemy
    this.Update = Update;
    function Update() {
    
        // Update the orientation array
        var dSq = Sq(this.x - player.x) + Sq(this.y - player.y);
        this.orientations[this.index * 3 + this.ox] = this.x;
        this.orientations[this.index * 3 + this.oy] = this.y;
        this.orientations[this.index * 3 + this.oa] = this.angle;
        this.index = (this.index + 1) % this.maxIndex;
    
        // Turn towards the player
        var a = Math.atan((player.y - this.y) / (this.x - gameScreen.player.x));
        if (this.x < gameScreen.player.x) {
            a = -HALF_PI - a;
        }
        else {
            a = HALF_PI - a;
        }
        var dx = gameScreen.player.x - this.x;
        var dy = gameScreen.player.y - this.y;
        var dot = this.s * dx + -this.c * dy;
        if (dot > 0) {
            while (a > this.angle) {
                a -= 2 * Math.PI;
            }
            this.angle -= this.speed / 300.0;
            if (this.angle < a) {
                this.angle = a;
            }
        }
        else {
            while (a < this.angle) {
                a += 2 * Math.PI;
            }
            this.angle += this.speed / 300.0;
            if (this.angle > a) {
                this.angle = a;
            }
        }
        
        // Get the direction to move
        var m = 1;
        if (this.c * dx + this.s * dy < 0) {
            m = -1;
        }
        
        // Update the angle values
        this.c = -Math.sin(this.angle);
        this.s = Math.cos(this.angle);
        
        // Move forward
        this.x += this.c * this.speed;
        this.y += this.s * this.speed;
        
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
        
        // Wing guns
        if (this.gunCd <= 0) {
            var bdx = this.gun.width / 2 + this.sprite.width / 2 + 30;
            var bdy = this.gun.height - this.sprite.height / 2;
            gameScreen.bullets[gameScreen.bullets.length] = new Bullet(this.x + this.s * bdx + this.c * bdy, this.y + bdy * this.s - this.c * bdx, BULLET_SPEED * this.c, BULLET_SPEED * this.s, this.gunDmg, this.gunRange);
            gameScreen.bullets[gameScreen.bullets.length] = new Bullet(this.x - this.s * bdx + this.c * bdy, this.y + bdy * this.s + this.c * bdx, BULLET_SPEED * this.c, BULLET_SPEED * this.s, this.gunDmg, this.gunRange);
            this.gunCd = this.gunRate;
        }
        else {
            this.gunCd--;
        }
        
        // Tail Turrets
        if (this.turretCd <= 0) {
            for (var i = this.tailLength - 2; i >= 0; i--) {
                j = (this.index - i * this.tailSpace - this.tailOffset + this.maxIndex) % this.maxIndex;
                var segX = this.orientations[j * 3 + this.ox];
                var segY = this.orientations[j * 3 + this.oy];
                if (j * 3 + 2 > this.orientations.length) {
                    j = 0;
                }
                a = Math.atan((player.y - segY) / (segX - player.x));
                if (segX < player.x) {
                    a = -HALF_PI - a;
                }
                else {
                    a = HALF_PI - a;
                }
                //Projectile(x, y, velX, velY, angle, damage, range, pierce, name) 
                var tcos = Math.cos(a);
                var tsin = Math.sin(a);
                gameScreen.bullets[gameScreen.bullets.length] = new Projectile(segX - tsin * this.turret.height / 2, segY + tcos * this.turret.height / 2, BULLET_SPEED * -tsin, BULLET_SPEED * tcos, a, this.turretDmg, this.turretRange, true, "bossLaser");
            }
            this.turretCd = this.turretRate;
        }
        else {
            this.turretCd--;
        }
    }
    
    // Draws the enemy to the gameScreen
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        
        // Tail
        var a;
        if (this.orientations.length > 0) {
            var j;
            j = (this.index) % this.maxIndex;
            if (j * 3 + 2 > this.orientations.length) {
                j = 0;
            }
            canvas.translate(this.orientations[j * 3 + this.ox], this.orientations[j * 3 + this.oy]);
            canvas.rotate(this.orientations[j * 3 + this.oa]);
            canvas.drawImage(this.end, -this.end.width / 2, -this.end.height / 2);
            canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
            for (var i = this.tailLength - 2; i >= 0; i--) {
                j = (this.index - i * this.tailSpace - this.tailOffset + this.maxIndex) % this.maxIndex;
                var segX = this.orientations[j * 3 + this.ox];
                var segY = this.orientations[j * 3 + this.oy];
                if (j * 3 + 2 > this.orientations.length) {
                    j = 0;
                }
                canvas.translate(segX, segY);
                canvas.rotate(this.orientations[j * 3 + this.oa]);
                canvas.drawImage(this.segment, -this.segment.width / 2, -this.segment.height / 2);
                canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX + segX, segY - gameScreen.scrollY);
                a = Math.atan((gameScreen.player.y - segY) / (segX - gameScreen.player.x));
                if (segX < player.x) {
                    a = -HALF_PI - a;
                }
                else {
                    a = HALF_PI - a;
                }
                canvas.rotate(a);
                canvas.drawImage(this.turret, -this.turret.width / 2, -this.turret.height / 2);
                canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
            }
            canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
        }
        
        // Orientation
        canvas.translate(this.x, this.y);
        canvas.rotate(this.angle);
        canvas.translate(-this.sprite.width / 2, -this.sprite.height / 2);
        
        // Sprite
        canvas.drawImage(this.leftBoomerang, this.sprite.width / 2 + 25, this.sprite.height - 25);
        canvas.drawImage(this.rightBoomerang, this.sprite.width / 2 - 25 - this.rightBoomerang.width, this.sprite.height - 25);
        canvas.drawImage(this.sprite, 0, 0);
        canvas.drawImage(this.leftWing, this.sprite.width, -100);
        canvas.drawImage(this.rightWing, -this.rightWing.width, -100);
        canvas.drawImage(this.gun, -this.gun.width - 30, 0);
        canvas.drawImage(this.gun, this.sprite.width + 30, 0);
        
        
        // Health bar
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX + this.x - this.sprite.width / 2, -gameScreen.scrollY + this.y - this.sprite.height / 2);
        if (this.health < this.maxHealth) {
            var greenWidth = this.sprite.width * this.health / this.maxHealth;
            canvas.fillStyle = "#00FF00";
            canvas.fillRect(0, -10, greenWidth, 5);
            canvas.fillStyle = "#FF0000";
            canvas.fillRect(greenWidth, -10, this.sprite.width - greenWidth, 5);
        }
        
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