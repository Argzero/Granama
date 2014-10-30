function PlayerCommandoType() {
    var p = BasePlayer(
        GetImage('pCommandoBody'),
		20
    );
	
    // Sprites
	p.drawObjects.push({
		sprite: GetImage('pCommandoShield'),
		xOffset: 3,
		yOffset: -21
	});
	p.drawObjects.push({
		sprite: GetImage('pCommandoLMG'),
		xOffset: -46,
		yOffset: -15
	});
	p.drawObjects.push({
		sprite: GetImage('pCommandoDroneKit'),
		xOffset: -10,
		yOffset: -35
	});
	
	// Weapon data
	p.lmgData = { 
        cd: 0, 
        range: 499, 
        angle: 5, 
        dx: -30, 
        dy: 45, 
		rate: 5,
        sprite: GetImage('lmgBullet'), 
        list: p.bullets 
    };
	p.shootLMG = EnemyWeaponGun;
    
    // Drone data
    p.drones = [CommandoDrone(p, 0)];
	p.nextDroneLevel = 4;
	p.droneRangeM = 1;
    
    // Drawing drones
    p.onDraw = function() {
    
        canvas.translate(this.x, this.y);
    
        // Draw drones
		for (i = 0; i < this.drones.length; i++) {
			this.drones[i].draw();
		}
        
        ResetTransform(canvas);
    };
    
    // Updates the player
    p.Update = function() {
        this.UpdateBase();
        
        // Get damage multiplier
        var m = this.GetDamageMultiplier();
		
		// LMG
        this.lmgData.damage = m * (5 + this.upgrades[LMG_DAMAGE_ID]);
        this.shootLMG(this.lmgData);
        
        // Update Drones
        var totalAngle = Math.min(Math.PI, this.drones.length * Math.PI / 8);
        var increment = Math.PI / 8;
        var angle = -totalAngle / 2;
        for (var i = 0; i < this.drones.length; i++) {
            this.drones[i].setAngle(angle + this.angle);
            this.drones[i].update();
            angle += increment;
        }
    };
	
    // Gaining drones on leveling
	p.onLevel = function() {
        if (this.level >= this.nextDroneLevel && this.drones.length < 8) {
            this.drones.push(CommandoDrone(this, 0));
			this.nextDroneLevel += 3;
        }
	};
    
    return p;
}

var COMMANDO_DRONE_RADIUS = 100;

// A drone for the Commando class
function CommandoDrone(player, angle) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
	return {
	
		player: player,
		sprite: GetImage('drone'),
		direction: Vector(cos, sin),
        dirAngle: angle,
        targetAngle: angle,
		angle: 0,
        cos: 0,
        sin: 1,
        targetRadius: COMMANDO_DRONE_RADIUS,
        radius: 0,
        x: player.x,
        y: player.y,
        
        gunData: {  
            cd: 0,
            rate: 90,
            discharge: 0,
            interval: 5,
            sprite: GetImage('lmgBullet'),
            initial: true,
            speed: 10,
            dx: -6,
            dy: 15,
            list: player.bullets
        },
		chargeData: {
			damage: 0,
			cd: 0,
			rate: 1,
			discharge: 0,
			interval: 1,
			sprite: GetImage('pCommandoChargeLaser'),
			initial: true,
			speed: 20,
			dx: -6,
			dy: 15,
			list: player.bullets
		},
        shoot: EnemyWeaponRail,
		charge: EnemyWeaponRail,
        
        // Sets the new target angle of the drone
        setAngle: function(angle) {
            while (angle < this.dirAngle - Math.PI) {
                this.dirAngle -= Math.PI * 2;
            }
            while (angle > this.dirAngle + Math.PI) {
                this.dirAngle += Math.PI * 2;
            }
            this.targetAngle = angle;
        },
		
		// Updates the drone
		update: function() {
        
            // Move outward after spawning to the desired radius
			if (this.radius < this.targetRadius) {
				this.radius = Math.min(this.radius + 1, this.targetRadius);
			}
            
            // Move to the correct angle when the player turns
			if (this.player.charging) {
				this.angle = AngleTo({ x: this.player.x + this.player.cos * LASER_BOMB_OFFSET, y: this.player.y + this.player.sin * LASER_BOMB_OFFSET }, this);
				this.cos = -Math.sin(this.angle);
                this.sin = Math.cos(this.angle);
			}
			else {
				if (this.dirAngle <= this.targetAngle - Math.PI / 180) {
					this.direction.Rotate(COS_1, SIN_1);
					this.dirAngle += Math.PI / 180;
				}
				else if (this.dirAngle >= this.targetAngle + Math.PI / 180) {
					this.direction.Rotate(COS_1, -SIN_1);
					this.dirAngle -= Math.PI / 180;
				}
			}
            
            // Update position
            this.x = this.player.x + this.direction.y * this.radius;
            this.y = this.player.y - this.direction.x * this.radius;
            
            // Drone weapon
			if (this.player.charging) {
				var dx = this.player.x + this.player.cos * LASER_BOMB_OFFSET - this.x;
				var dy = this.player.y + this.player.sin * LASER_BOMB_OFFSET - this.y;
				this.chargeData.range = Math.sqrt(Sq(dx) + Sq(dy)) / 1.5;
				this.charge(this.chargeData);
			}
			else {
			
				// Update rotation
				var enemy = this.getTarget();
				if (enemy) {
					this.angle = AngleTowards(enemy, this, 0.05);
					this.cos = -Math.sin(this.angle);
					this.sin = Math.cos(this.angle);
				}
			
				this.gunData.damage = 2 * this.player.GetDamageMultiplier();
				this.gunData.range = 349 + 25 * this.player.upgrades[DRONE_RANGE_ID];
				this.gunData.duration = (5 + this.player.upgrades[DRONE_SHOTS_ID]) * this.gunData.interval;
                var prevLength = this.player.bullets.length;
				this.shoot(this.gunData);
                for (var i = prevLength; i < this.player.bullets.length; i++) {
                    this.player.bullets[i].source = this.player;
                }
			}
		},
		
		// Draws the drone around the player
		draw: function() {
			canvas.save();
			canvas.transform(this.direction.x, this.direction.y, -this.direction.y, this.direction.x, 0, 0);
            canvas.translate(0, -this.radius);
            canvas.transform(this.direction.x, -this.direction.y, this.direction.y, this.direction.x, 0, 0);
            canvas.transform(this.sin, -this.cos, this.cos, this.sin, 0, 0);
			canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
			canvas.restore();
		},
        
        // Checks if the drone is in range of an enemy
        IsInRange: function(range) {
            var enemy = this.getTarget();
            return this.player.charging || (enemy && DistanceSq(enemy.x, enemy.y, this.x, this.y) < Sq(range * this.player.droneRangeM));
        },
		
		// Gets the target of the drone
		getTarget: function() {
			if (this.player.particle && this.player.skillDuration > 0) {
				return this.player.particle.target;
			}
			else return gameScreen.enemyManager.getNearest(this.x, this.y);
		}
	};
}