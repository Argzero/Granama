// Base functionality for enemies
function EnemyBase(sprite, x, y, health, speed, range, exp, patternMin, patternMax) {
    return {
    
        // Fields
        x: x,
        y: y,
        angle: 0,
        cos: 0,
        sin: 1,
		exp: exp,
        speed: speed,
        speedM: undefined,
        speedMDuration: undefined,
        stunDuration: 0,
        health: health,
        maxHealth: health,
        sprite: sprite,
        killer: undefined,
        knockback: Vector(0, 0),
        range: range,
		ranges: [range],
        movements: [],
		patterns: [[]],
		pattern: 0,
		patternMin: patternMin,
		patternMax: patternMax,
		patternTimer: 0,
        
        // Components to be set for specific enemy types
        ApplyMove: undefined,
        ApplyDraw: undefined,
        ApplySprite: undefined,
        
        // Functions
        isBoss: enemyFunctions.isBoss,
        stun: enemyFunctions.stun,
        AddWeapon: enemyFunctions.AddWeapon,
		SetRange: enemyFunctions.SetRange,
        SetMovement: enemyFunctions.SetMovement,
        Knockback: enemyFunctions.Knockback,
        SwitchPattern: enemyFunctions.SwitchPattern,
        Update: enemyFunctions.Update,
        clamp: enemyFunctions.clamp,
        Draw: enemyFunctions.Draw,
        IsInRange: enemyFunctions.IsInRange,
		Damage: enemyFunctions.Damage,
        Slow: enemyFunctions.Slow
    };
};

// Functions for enemy objects
var enemyFunctions = {

    // Checks whether or not this enemy is a boss
    isBoss: function() {
        return this.exp >= 300;
    },
    
    // Stuns the enemy for a duration
    stun: function(duration) {
        this.stunDuration = duration;
    },
        
    // Knocks back the enemy the given distance
    Knockback: function(x, y) {
        this.knockback.Set(x, y);
    },
	
	// Knocks back the enemy the given distance
    KnockbackBouncer: function(x, y) {
		this.direction.Set(x, y);
		this.direction.SetLength(1);
    },
	
	// Knocks back minibosses a lesser amount
	MinibossKnockback: function(x, y) {
		this.knockback.Set(x / 3, y / 3);
	},
    
    // Knocks back the boss a lesser amount
    BossKnockback: function(x, y) {
        this.knockback.Set(x / 5, y / 5);
    },
    
    // Adds a weapon to the enemy
    AddWeapon: function(method, data, pattern) {
		if (pattern === undefined) pattern = 0;
		
        data.method = method.bind(this);
        data.list = gameScreen.enemyManager.bullets;
        data.cd = 0;
		while (this.patterns[pattern] === undefined) this.patterns.push([]);
        this.patterns[pattern].push(data);
    },
	
	// Sets a range for a specific pattern
	SetRange: function(pattern, range) {
		this.ranges[pattern] = range;
	},
	
	// Sets the movement for a specific pattern
	SetMovement: function(pattern, movement) {
		this.movements[pattern] = movement;
	},
    
    // Switches attack patterns
    SwitchPattern: function() {
        this.pattern = Rand(this.patterns.length);
        this.range = this.ranges[this.pattern] || this.range;
        this.ApplyMove = this.movements[this.pattern] || this.ApplyMove;
        this.patternTimer = Rand(this.patternMax - this.patternMin) + this.patternMin;
    },
    
    // Updates the enemy
    Update: function() 
	{
        // Don't do anything while stunned
        if (this.stunDuration > 0) {
            this.stunDuration--;
            return;
        }
    
		// Pattern switching
		if (this.patterns.length > 1) {
			this.patternTimer--;
			if (this.patternTimer <= 0) {
                this.SwitchPattern();
			}
		}
	
        // Speed multiplier countdown
        if (this.speedMDuration) {
            this.speedMDuration--;
        }
    
        // Apply knockback
        if (this.knockback.LengthSq() > 0) {
            var l = this.knockback.Length();
            if (l < KNOCKBACK_SPEED) l = KNOCKBACK_SPEED;
            var dx = this.knockback.x * KNOCKBACK_SPEED / l;
            var dy = this.knockback.y * KNOCKBACK_SPEED / l;
            this.knockback.Add(-dx, -dy);
            this.x += dx;
            this.y += dy;
            this.clamp();
            return;
        }
        
        // Apply weapons
        for (var i = 0; i < this.patterns[this.pattern].length; i++) {
            this.patterns[this.pattern][i].method(this.patterns[this.pattern][i]);
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
        
        this.clamp();
    },
    
    // Clamps the enemy to the map
    clamp: function() {
        this.x = clamp(this.x, this.sprite.width / 2, GAME_WIDTH - this.sprite.width / 2);
        this.y = clamp(this.y, this.sprite.height / 2, GAME_HEIGHT - this.sprite.height / 2);
    },
    
    // Draws the enemy
    Draw: function() {
        canvas.translate(this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
        
        // Draws extra enemy parts if applicable
        if (this.ApplyDraw) {
            this.ApplyDraw();
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
		
		// Restore the transform for the health bar
		ResetTransform(canvas);
		canvas.translate(this.x - this.sprite.width / 2, this.y - this.sprite.height / 2);
		
		// Health bar
        if (this.health < this.maxHealth) {
            var greenWidth = this.sprite.width * this.health / this.maxHealth;
            canvas.fillStyle = "#00FF00";
            canvas.fillRect(0, -10, greenWidth, 5);
            canvas.fillStyle = "#FF0000";
            canvas.fillRect(greenWidth, -10, this.sprite.width - greenWidth, 5);
        }
        
        // Reset the canvas transform
        ResetTransform(canvas);
    },
    
    // Checks whether or not the enemy is in range of a player using the specified range
    IsInRange: function(range) {
        var player = playerManager.getClosest(this.x, this.y);
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        return player.health > 0 && dx * dx + dy * dy < Sq(range + this.speed) && this.cos * dx + this.sin * dy >= 0;
    },
    
    // Dragon ignores direction
    DragonRange: function(range) {
        var player = playerManager.getClosest(this.x, this.y);
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        return player.health > 0 && dx * dx + dy * dy < Sq(range + this.speed);
    },
	
	// Damages the enemy
	Damage: function(amount, source) {
		this.health -= amount;
        this.killer = source;
	},
    
    // Slows the enemy down temporarily
    Slow: function(multiplier, duration) {
        this.speedM = multiplier;
        this.speedMDuration = duration;
    },
    
    // Slows the boss down a lesser amount
    BossSlow: function(multiplier, duration) {
        this.speedM = multiplier + (1 - multiplier) * 4 / 5;
        this.speedMDuration = duration;
    }
};