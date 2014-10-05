// Base functionality for enemies
function EnemyBase(sprite, x, y, health, speed, range) {
    return {
    
        // Fields
        x: x,
        y: y,
        angle: 0,
        cos: 0,
        sin: 1,
        speed: speed,
        health: health,
        maxHealth: health,
        sprite: sprite,
        knockback: Vector(0, 0),
        
        // Components to be set for specific enemy types
        ApplyWeapons: undefined,
        ApplyMove: undefined,
        ApplyDraw: undefined,
        ApplySprite: undefined,
        
        // Functions
        Knockback: enemyFunctions.Knockback,
        Update: enemyFunctions.Update,
        Draw: enemyFunctions.Draw,
        IsInRange: enemyFunctions.IsInRange
    };
}

// Functions for enemy objects
var enemyFunctions = {
        
    // Knocks back the enemy the given distance
    Knockback: function(x, y) {
        this.knockback.Set(x, y);
    },
    
    // Updates the enemy
    Update: function() {
    
        // Apply knockback
        if (this.knockback.LengthSq() > 0) {
            var l = this.knockback.Length();
            if (l < KNOCKBACK_SPEED) l = KNOCKBACK_SPEED;
            var dx = this.knockback.x * KNOCKBACK_SPEED / l;
            var dy = this.knockback.y * KNOCKBACK_SPEED / l;
            this.knockback.Add(-dx, -dy);
            this.x += dx;
            this.y += dy;
            return;
        }
        
        // Apply weapons
        if (this.ApplyWeapons) {
            this.ApplyWeapons();
        }
        
        // Apply movement
        if (this.ApplyMove) {
            this.ApplyMove();
        }
        
        // Move away from other enemies
        if (gameScreen.enemyManager.enemies.length > 0) {
            for (var i = 0; i < gameScreen.enemyManager.enemies.length; i++) {
                var enemy = gameScreen.enemyManager.enemies[i];
                if (DistanceSq(this.x, this.y, enemy.x, enemy.y) < Sq(this.sprite.width) && DistanceSq(this.x, this.y, enemy.x, enemy.y) > 0) {
                    if (this.sin * (enemy.x - this.x) - this.cos * (enemy.y - this.y) > 0) {
                        this.x -= this.speed * this.sin / 2;
                        this.y += this.speed * this.cos / 2;
                        break;
                    }
                    else {
                        this.x += this.speed * this.sin / 2;
                        this.y -= this.speed * this.cos / 2;
                        break;
                    }
                }
            }
        }
        
        // Limit the enemy to the map
        if (XMin(this) < 0) {
            this.x += -this.XMin();
        }
        if (XMax(this) > GAME_WIDTH) {
            this.x -= this.XMax() - GAME_WIDTH;
        }
        if (YMin(this) < 0) {
            this.y += -this.YMin();
        }
        if (YMax(this) > GAME_HEIGHT) {
            this.y -= this.YMax() - GAME_HEIGHT;
        }
    },
    
    // Draws the enemy
    Draw: function() {
        canvas.translate(this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
        
        // Draws extra enemy parts if applicable
        if (this.ApplyDraw) {
            this.ApplyDraw();
        }
    
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
        
        // Draws extra aligned enemy parts if applicable
        if (this.ApplySprite) {
            this.ApplySprite();
        }
        
        // Reset the canvas transform
        ResetTransform(canvas);
    },
    
    // Checks whether or not the enemy is in range of a player using the specified range
    IsInRange: function(range) {
        var dx = gameScreen.player.x - this.x;
        var dy = gameScreen.player.y - this.y;
        return dx * dx + dy * dy < Sq(range + this.speed) && this.cos * dx + this.sin * dy >= 0;
    }
};