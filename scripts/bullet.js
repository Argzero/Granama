// A fist used by a boss
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
//   velX - initial horizontal velocity
//   velY - initial vertical velocity
//  angle - angle of the fist
// damage - damage dealt per frame
//  range - distance the fist can travel
//   boss - boss that launched the fist
//  speed - speed of the fist
//  delay - frames to sit still before returning to the boss
//   side - which side of the boss the fist came from
function Fist(x, y, velX, velY, angle, damage, range, boss, speed, delay, side, tx) {
    this.x = x;
    this.y = y;
    this.ox = x;
    this.oy = y;
    this.tx = tx;
    this.pierce = true;
    this.velX = velX;
    this.velY = velY;
    this.angle = angle;
    this.range = range;
    this.damage = damage;
    this.actualDamage = damage;
    this.boss = boss;
    this.speed = speed;
    this.delay = delay;
    this.sprite = GetImage("fist" + side);
    this.returning = false;
    this.side = side;
    this.returnCd;
    this.scale = 1;
    this.expired = false;
    
    // Updates the bullet's position
    this.Update = Update;
    function Update() {
    
        // Change the velocity when returning
        if (this.returning) {
        
            // If actually returning, move back towards the boss
            if (this.returnCd <= 0) {
                this.damage = this.actualDamage;
                dx = boss.x - this.x + tx * boss.s;
                dy = boss.y - this.y - tx * boss.c;
                m = this.speed / Math.sqrt(Sq(dx) + Sq(dy));
                this.velX = dx * m;
                this.velY = dy * m;
            }
            
            // Otherwise just sit still and wait
            else {
                this.returnCd--;
                this.velX = 0;
                this.velY = 0;
            }
        }
        
        // Move the fist
        this.x += this.velX;
        this.y += this.velY;
        
        // When returning, reattach to the boss if close by
        if (this.returning) {
            if (DistanceSq(this.x, this.y, boss.x, boss.y) < 10000) {
                this.expired = true;
                if (this.side == "Left") {
                    boss.leftFist = true;
                }
                else {
                    boss.rightFist = true;
                }
            }
            else if (boss.health <= 0) {
                this.expired = true;
            }
        }
        
        // Mark as returning when reaching the fist's range
        else if (DistanceSq(this.x + this.velX, this.y + this.velY, this.ox, this.oy) >= Sq(this.range)) {
            this.returning = true;
            this.returnCd = this.delay;
            this.damage = 0;
        }
    }
    
    // Draws the fist
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        canvas.translate(this.x, this.y);
        canvas.rotate(this.angle);
        canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH -gameScreen.scrollX, -gameScreen.scrollY);
    }
    
    // Gets the horizontal coordinate of the left side of the laser
    this.XMin = XMin;
    function XMin() {
        return this.x - this.sprite.height * this.scale / 2;
    }
    
    // Gets the horizontal coordinate of the right side of the laser
    this.XMax = XMax;
    function XMax() {
        return this.x + this.sprite.height * this.scale / 2;
    }
    
    // Gets the vertical coordinate of the top of the laser
    this.YMin = YMin;
    function YMin() {
        return this.y - this.sprite.height * this.scale / 2;
    }
    
    // Gets the vertical coordinate of the bottom of the laser
    this.YMax = YMax;
    function YMax() {
        return this.y + this.sprite.height * this.scale / 2;
    }
}

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
    this.Update = Update;
    function Update() {
    
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
    }
    
    // Draws the turret
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
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
    }
}

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
        if (DistanceSq(this.x, this.y, gameScreen.player.x, gameScreen.player.y) < Sq(MINE_RADIUS)) {
            gameScreen.player.Damage(this.damage);
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

// A fire projectile from the flamethrower
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
//   velX - horizontal velocity
//   velY - vertical velocity
//  angle - angle to draw at
// damage - damage to deal per frame
//  range - range the fire is allowed to travel
function Fire(x, y, velX, velY, angle, damage, range) {
    this.x = x;
    this.y = y;
    this.ox = x;
    this.oy = y;
    this.pierce = true;
    this.scale = 0.1;
    this.velX = velX;
    this.velY = velY;
    this.angle = angle;
    this.range = range;
    this.damage = damage;
    this.sprite = GetImage("fire");
    
    // Updates the bullet's position
    this.Update = Update;
    function Update() {
        this.x += this.velX;
        this.y += this.velY;
        
        this.scale = 0.1 + 0.9 * DistanceSq(this.x, this.y, this.ox, this.oy) / Sq(this.range * 3 / 4);
    }
    
    // Draws the bullet
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        canvas.translate(this.x, this.y);
        canvas.rotate(this.angle);
        canvas.drawImage(this.sprite, -this.sprite.width * this.scale / 2, -this.sprite.height * this.scale / 2, this.sprite.width * this.scale, this.sprite.height * this.scale);
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
    }
    
    // Gets the horizontal coordinate of the left side of the fire
    this.XMin = XMin;
    function XMin() {
        return this.x - this.sprite.height * this.scale / 2;
    }
    
    // Gets the horizontal coordinate of the right side of the fire
    this.XMax = XMax;
    function XMax() {
        return this.x + this.sprite.height * this.scale / 2;
    }
    
    // Gets the vertical coordinate of the top of the fire
    this.YMin = YMin;
    function YMin() {
        return this.y - this.sprite.height * this.scale / 2;
    }
    
    // Gets the vertical coordinate of the bottom of the fire
    this.YMax = YMax;
    function YMax() {
        return this.y + this.sprite.height * this.scale / 2;
    }
}

// Creates a new laser
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
//   velX - horizontal velocity
//   velY - vertical velocity
//  angle - angle to draw at
// damage - damage to deal per frame
//  range - range the projectile is allowed to travel
function NewLaser(x, y, velX, velY, angle, damage, range) {
    return new Projectile(x, y, velX, velY, angle, damage, range, true, "laser");
}

// Creates a new rocket
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
//   velX - horizontal velocity
//   velY - vertical velocity
//  angle - angle to draw at
// damage - damage to deal per frame
//  range - range the projectile is allowed to travel
function NewRocket(x, y, velX, velY, angle, damage, range) {
    return new Projectile(x, y, velX, velY, angle, damage, range, false, "rocket");
}

// Creates a new hammer
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
//   velX - horizontal velocity
//   velY - vertical velocity
//  angle - angle to draw at
// damage - damage to deal per frame
//  range - range the projectile is allowed to travel
function NewHammer(x, y, velX, velY, angle, damage, range) {
    return new Projectile(x, y, velX, velY, angle, damage, range, false, "hammer");
}

// A fired projectile
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
//   velX - horizontal velocity
//   velY - vertical velocity
//  angle - angle to draw at
// damage - damage to deal per frame
//  range - range the projectile is allowed to travel
// pierce - whether or not it is a piercing projectile
//   name - name of the projectile image
function Projectile(x, y, velX, velY, angle, damage, range, pierce, name) {
    this.x = x;
    this.y = y;
    this.ox = x;
    this.oy = y;
    this.pierce = pierce;
    this.velX = velX;
    this.velY = velY;
    this.angle = angle;
    this.range = range;
    this.damage = damage;
    this.sprite = GetImage(name);
    this.scale = 1;
    
    // Updates the bullet's position
    this.Update = Update;
    function Update() {
        this.x += this.velX;
        this.y += this.velY;
    }
    
    // Draws the bullet
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        canvas.translate(this.x, this.y);
        canvas.rotate(this.angle);
        canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
    }
    
    // Gets the horizontal coordinate of the left side of the laser
    this.XMin = XMin;
    function XMin() {
        return this.x - this.sprite.height * this.scale / 2;
    }
    
    // Gets the horizontal coordinate of the right side of the laser
    this.XMax = XMax;
    function XMax() {
        return this.x + this.sprite.height * this.scale / 2;
    }
    
    // Gets the vertical coordinate of the top of the laser
    this.YMin = YMin;
    function YMin() {
        return this.y - this.sprite.height * this.scale / 2;
    }
    
    // Gets the vertical coordinate of the bottom of the laser
    this.YMax = YMax;
    function YMax() {
        return this.y + this.sprite.height * this.scale / 2;
    }
}

// A bullet object
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
//   velX - horizontal velocity
//   velY - vertical velocity
// damage - damage to deal per frame
//  range - range the fire is allowed to travel
//  enemy - enemy that fired the bullet
function Bullet(x, y, velX, velY, damage, range, enemy) {
    this.x = x;
    this.y = y;
    this.ox = x;
    this.oy = y;
    this.pierce = false;
    this.velX = velX;
    this.velY = velY;
    this.range = range;
    this.damage = damage;
    this.sprite = GetImage("bullet");
    this.scale = 1;
    this.enemy = enemy;
    
    // Updates the bullet's position
    this.Update = Update;
    function Update() {
        this.x += this.velX;
        this.y += this.velY;
    }
    
    // Draws the bullet
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        canvas.drawImage(this.sprite, this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
    }
    
    // Gets the horizontal coordinate of the left side of the bullet
    this.XMin = XMin;
    function XMin() {
        return this.x - this.sprite.height * this.scale / 2;
    }
    
    // Gets the horizontal coordinate of the right side of the bullet
    this.XMax = XMax;
    function XMax() {
        return this.x + this.sprite.height * this.scale / 2;
    }
    
    // Gets the vertical coordinate of the top of the bullet
    this.YMin = YMin;
    function YMin() {
        return this.y - this.sprite.height * this.scale / 2;
    }
    
    // Gets the vertical coordinate of the bottom of the bullet
    this.YMax = YMax;
    function YMax() {
        return this.y + this.sprite.height * this.scale / 2;
    }
}

// A bullet object
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
//   velX - horizontal velocity
//   velY - vertical velocity
// damage - damage to deal per frame
//  range - range the fire is allowed to travel
//  enemy - enemy that fired the bullet
function Reflection(x, y, velX, velY, damage, enemy) {
    this.x = x;
    this.y = y;
    this.ox = x;
    this.oy = y;
    this.pierce = false;
    this.velX = velX;
    this.velY = velY;
    this.range = 99999;
    this.damage = damage;
    this.sprite = GetImage("abilityReflect");
    this.scale = 1;
    this.enemy = enemy;
    
    // Updates the bullet's position
    this.Update = Update;
    function Update() {
        
        // Remove the bullet if the enemy is dead
        if (this.enemy.health <= 0) {
            this.x = -99999;
            this.y = -99999;
        }
        
        this.x += this.velX;
        this.y += this.velY;
        
        // Turn towards the enemy
        var dx = this.enemy.x - this.x;
        var dy = this.enemy.y - this.y;
        var dot = this.velY * dx + -this.velX * dy;
        var angle;
        if (dot > 0) {
            angle = -0.1;
        }
        else {
            angle = 0.1;
        }
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        
        var tx = this.velX * c - this.velY * s;
        var ty = this.velX * s + this.velY * c;
        this.velX = tx;
        this.velY = ty;
    }
    
    // Draws the bullet
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        canvas.drawImage(this.sprite, this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
    }
    
    // Gets the horizontal coordinate of the left side of the bullet
    this.XMin = XMin;
    function XMin() {
        return this.x - this.sprite.height * this.scale / 2;
    }
    
    // Gets the horizontal coordinate of the right side of the bullet
    this.XMax = XMax;
    function XMax() {
        return this.x + this.sprite.height * this.scale / 2;
    }
    
    // Gets the vertical coordinate of the top of the bullet
    this.YMin = YMin;
    function YMin() {
        return this.y - this.sprite.height * this.scale / 2;
    }
    
    // Gets the vertical coordinate of the bottom of the bullet
    this.YMax = YMax;
    function YMax() {
        return this.y + this.sprite.height * this.scale / 2;
    }
}

// A bullet object
//      x - initial horizontal coordinate
//      y - initial vertical coordinate
//   velX - horizontal velocity
//   velY - vertical velocity
// damage - damage to deal per frame
//  range - range the fire is allowed to travel
//  enemy - enemy that fired the bullet
function Plus(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.sprite = GetImage("abilityPlus");
    
    // Updates the bullet's position
    this.Update = Update;
    function Update() {
        this.x += this.velX;
        this.y += this.velY;
    }
    
    // Draws the bullet
    // canvas - context of the canvas to draw to
    this.Draw = Draw;
    function Draw(canvas) {
        canvas.drawImage(this.sprite, this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
    }
}