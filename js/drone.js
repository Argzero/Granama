// Positioning constants
var DRONE_ROTATE_SPEED = 0.02;
var MAX_ROT_SPEED = DRONE_ROTATE_SPEED * 1.5;
var MIN_ROT_SPEED = DRONE_ROTATE_SPEED / 1.5;
var PLAYER_DIST = 80;

// Mechanic constants
var DRONE_HEAL = 0.01;
var DRONE_DAMAGE = 0.5;
var DRONE_SHIELD = 0.02;
var DRONE_LASER_CD = 1.3;
var DRONE_SHIELD_CD = 15 * GAME_FPS;
var DRONE_SHIELD_RANGE = 0.25;

function Drone(name, angle, mechanics) {
    
    this.mechanics = mechanics;
    this.orbitAngle = angle;
    this.angle = 0;
    this.targetAngle = angle;
    this.sprite = GetImage('drone' + name);
    this.targetAngle = angle;
    this.x = 0;
    this.y = 0;
    this.cd = 0;
    
    // Updates the drone, applying its mechanics and rotates around the player
    this.Update = function(player) {
        
        // Rotate around the player
        this.targetAngle += DRONE_ROTATE_SPEED;
        this.orbitAngle += Math.max(Math.min(MAX_ROT_SPEED, this.targetAngle - this.orbitAngle), MIN_ROT_SPEED);
        if (this.orbitAngle > 2 * Math.PI) {
            this.orbitAngle -= 2 * Math.PI;
            this.targetAngle -= 2 * Math.PI;
        }
        
        // Update the position of this
        this.x = PLAYER_DIST * Math.cos(this.orbitAngle);
        this.y = PLAYER_DIST * Math.sin(this.orbitAngle);
        
        // Apply mechanics
        this.mechanics(player);
    }
    
    // Sets a new target angle for the drone
    this.SetAngle = function(targetAngle) {
        this.targetAngle = targetAngle;
        if (Math.abs(this.targetAngle - this.orbitAngle) > Math.PI) {
            if (this.targetAngle > this.orbitAngle) {
                this.orbitAngle += 2 * Math.PI;
            }
            else this.targetAngle += 2 * Math.PI;
        }
    }
    
    // Draws the drone
    this.Draw = function(canvas) {
        canvas.translate(this.x, this.y);
        canvas.rotate(this.angle);
        canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        canvas.rotate(-this.angle);
        canvas.translate(-this.x, -this.y);
    }
}

function HealMehcanics(player) {
    this.angle = GetAngle(this.x, this.y, 0, 0);
    player.health += DRONE_HEAL;
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
}

function AssaultMechanics(player) {
    this.angle = GetAngle(player.x + this.x, player.y + this.y, mouseX, mouseY);
    if (this.cd <= 0) {
        if (KeyPressed(KEY_LMB)) {
            this.cd = 60 * DRONE_LASER_CD / (LASER_APS + player.upgrades[LASER_ID] * LASER_UP);
            var c = -Math.sin(this.angle);
            var s = Math.cos(this.angle);
            var laser = ProjectileBase(GetImage('bossLaser'), this, 0, 25, c * BULLET_SPEED, s * BULLET_SPEED, this.angle, DRONE_DAMAGE * player.GetDamageMultiplier(), LASER_RANGE, true, false);
            laser.source = player;
            laser.x += player.x;
            laser.y += player.y;
            laser.ox += player.x;
            laser.oy += player.y;
    		player.bullets[player.bullets.length] = laser;
        }
    }
    else this.cd--;
}

function ShieldMechanics(player) {
    this.angle = GetAngle(this.x, this.y, 0, 0);
    if (this.cd <= 0) {
        if (player.health < player.getMaxHealth * DRONE_SHIELD_RANGE) {
            player.shield = player.maxHealth * SHIELD_MAX;   
        }
    }
    else this.cd--;
}

var DRONE_MECHANICS = [AssaultMechanics, HealMehcanics, ShieldMechanics];
var DRONE_NAMES = ["Assaulter", "Healer", "Shielder"];