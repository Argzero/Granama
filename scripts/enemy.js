// An generic enemy in the game
//        x - initial horizontal position
//        y - initial vertical position
//     type - type of the enemy
//    range - range for attacks and movement
// attackCd - number of frames between each attack
//   health - maximum health of the enemy
//   damage - base damage of the enemy
//   spread - how much spread the enemy attacks have
//   attack - type of attack the enemy uses
function Enemy(x, y, type, range, attackCd, health, damage, spread, attack, speed) {
    this.x = x;
    this.y = y;
    this.c = 0;
    this.s = 1;
    this.type = type;
    this.health = health;
    this.maxHealth = health;
    this.damage = damage;
    this.cd = attackCd;
    this.spread = spread;
    this.angle = 0.0;
    this.range = range;
    this.attackCd = attackCd;
    this.speed = speed;
    this.attack = attack;
    this.sprite = GetImage("enemy" + type);
    
    // Updates the enemy
    this.Update = Update;
    function Update() {
    
        if (this.attack == ATTACK_MINES || this.attack == ATTACK_TURRET) {
            this.MoveMines();
        }
        else {
            this.MoveNormal();
        }
        
        // Move away from other enemies
        if (enemies.length > 0) {
            for (var i = 0; i < enemies.length; i++) {
                if (DistanceSq(this.x, this.y, screen.enemies[i].x, screen.enemies[i].y) < Sq(this.sprite.width) && DistanceSq(this.x, this.y, screen.enemies[i].x, screen.enemies[i].y) > 0) {
                    if (this.s * (screen.enemies[i].x - this.x) - this.c * (screen.enemies[i].y - this.y) > 0) {
                        this.x -= this.speed * this.s / 2;
                        this.y += this.speed * this.c / 2;
                        break;
                    }
                    else {
                        this.x += this.speed * this.s / 2;
                        this.y -= this.speed * this.c / 2;
                        break;
                    }
                }
            }
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
    
    // Normal movement for enemies
    // Moves towards or away from the player to the preferred range while turning towards them
    this.MoveNormal = MoveNormal;
    function MoveNormal() {
    
        // Turn towards the player
        var dx = screen.player.x - this.x;
        var dy = screen.player.y - this.y;
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
        var dSq = Sq(this.x - screen.player.x) + Sq(this.y - screen.player.y);
        if (dSq - Sq(this.range + this.speed) > 0) {
            this.x += m * this.c * this.speed;
            this.y += m * this.s * this.speed;
        }
        else if (dSq - Sq(this.range - this.speed) < 0) {
            this.x -= m * this.c * this.speed;
            this.y -= m * this.s * this.speed;
        }
        
        var inRange = DistanceSq(this.x, this.y, screen.player.x, screen.player.y) < Sq(this.range + this.speed) && m == 1;
        
        // Railgun
        if (this.attack == ATTACK_RAIL) {
            if (inRange || this.cd < 0) {
                this.cd--;
                if (this.cd < 0) {
                    var laser = new Projectile(this.x + this.c * this.sprite.height / 2, this.y + this.s * this.sprite.height / 2, this.c * BULLET_SPEED, this.s * BULLET_SPEED, this.angle, this.damage, this.range * 1.5, true, "bossLaser");
                    screen.bullets[screen.bullets.length] = laser;
                    if (this.cd < -120) {
                        this.cd = this.attackCd;
                    }
                }
            }
            else if (this.cd <= this.attackCd) {
                this.cd += 0.1;
            }
        }
        
        // Firing bullets
        else if (inRange && this.cd <= 0) {
            if (this.attack == ATTACK_BULLET) {
                FireBullet(this);
            }
            else if (this.attack == ATTACK_MELEE) {
                screen.player.Damage(this.damage);
            }
			else if (attack == ATTACK_HAMMER) {
				FireHammer(this);
			}
            this.cd = this.attackCd;
        }
        else if (this.cd > 0) {
            this.cd--;
        }
    }
    
    // Movement for mine layers
    // Circles around the player in a more flexible preferred range
    this.MoveMines = MoveMines;
    function MoveMines() {
    
        // Move normally if not in the preferred range
        var ds = DistanceSq(this.x, this.y, screen.player.x, screen.player.y);
        var tooFar = ds > Sq(this.range + 100);
        var tooClose = ds < Sq(this.range - 100);
    
        // Turn towards the player
        var dx = screen.player.x - this.x;
        var dy = screen.player.y - this.y;
        var d1 = this.s * dx + -this.c * dy;
        var d2 = this.c * dx + this.s * dy;
        
        // Turn in the correct direction
        if (tooFar && d1 > 0) {
            this.angle -= this.speed / 100.0;
        }
        else if (tooFar) {
            this.angle += this.speed / 100.0;
        }
        else if (tooClose && d1 > 0) {
            this.angle += this.speed / 100.0;
        }
        else if (tooClose) {
            this.angle -= this.speed / 100.0;
        }
        else if (d1 * d2 > 0) {
            this.angle += this.speed / 100.0;
        }
        else {
            this.angle -= this.speed / 100.0;
        }
        
        // Update the angle values
        this.c = -Math.sin(this.angle);
        this.s = Math.cos(this.angle);
        
        // Move forward
        if (tooClose && d2 > 0) {
            this.x -= this.c * this.speed;
            this.y -= this.s * this.speed;
        }
        else {
            this.x += this.c * this.speed;
            this.y += this.s * this.speed;
        }
        
        // Drop mines
        if (!tooFar && this.cd <= 0) {
            if (this.attack == ATTACK_MINES) {
                screen.mines[screen.mines.length] = new Mine(this.x, this.y, this.damage, this.type);
            }
            else if (this.attack == ATTACK_TURRET) {
                screen.turrets[screen.turrets.length] = new Turret(this.x, this.y, this.damage, this.maxHealth * TURRET_HEALTH);
            }
            this.cd = this.attackCd;
        }
        else if (this.cd > 0) {
            this.cd--;
        }
    }
    
    // Draws the enemy to the screen
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
        
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - screen.scrollX, -screen.scrollY);
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

// An explosion for when an enemy dies
function Explosion(x, y, size) {
    this.frame = 0;
    this.size = size;
    this.x = x;
    this.y = y;
    
    // Draws the explosion
    this.Draw = Draw;
    function Draw(canvas) {
        var img = screen.explosion[Math.floor(this.frame)];
        canvas.drawImage(img, this.x - img.width * this.size / 2, this.y - img.height * this.size / 2, this.size * img.width, this.size * img.height);
        this.frame += 0.4;
    }
}