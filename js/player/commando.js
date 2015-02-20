/**
 * The commando player that uses an LMG 
 * and drones as its primary weapons.
 *
 * @constructor
 */
extend('PlayerCommando', 'Player');
function PlayerCommando() {
    //         Sprite Name      X  Y  Type          HP   Speed  HP+  Damage+  Shield+  Speed+
	this.super('pCommandoBody', 0, 0, Robot.PLAYER, 100, 3,     26,  1,       1,       1);

    // Sprites drawn on top of the robot's body
	this.postChildren.push(
        new Sprite('pCommandoShield', 30, 0).child(this, true),
        new Sprite('pCommandoLMG', -30, 0).child(this, true),
        new Sprite('pCommandoDroneKit', 0, -10).child(this, true)
    );
    
    // Weapon data
    p.lmgData = {
        sprite: 'lmgBullet',
        cd    : 0,
        range : 499,
        angle : 5,
        dx    : -30,
        dy    : 45,
        rate  : 5,
        target: Robot.ENEMY
    };
    this.gun = weapon.gun;
    
    // Drone data
    this.drones = [];
    this.addDrone();
    this.nextDroneLevel = 4;
    this.droneRangeM = 1;
}

/**
 * Adds a new drone to the commando
 */
PlayerCommando.prototype.addDrone = function() {

    // Add the drone
    var drone = new CommandoDrone(this).child(this, false);
    this.drones.push(drone);
    this.postChildren.push(drone);

    // Update drone angles
    var totalAngle = Math.min(Math.PI, this.drones.length * Math.PI / 8);
    var increment = Math.PI / 8;
    var angle = -totalAngle / 2;
    for (var i = 0; i < this.drones.length; i++) {
        this.drones[i].setAngle(angle + this.angle);
        this.drones[i].update();
        angle += increment;
    }
};

/**
 * Updates the commando's gun
 */
PlayerCommando.prototype.applyUpdate = function() {

    // Get damage multiplier
    var m = this.get('power');

    // LMG
    this.lmgData.damage = m * (5 + 2 * this.upgrades[LMG_DAMAGE_ID]);
    this.gun(this.lmgData);
};

/**
 * Gives a drone to the commando upon reaching the target level
 */
PlayerCommando.prototype.onLevel = function() {
    if (this.level >= this.nextDroneLevel && this.drones.length < 8) {
        this.addDrone();
        this.nextDroneLevel += 3;
    }
};

var COMMANDO_DRONE_RADIUS = 100;

/** 
 * Represents a drone for the player
 *
 * @param {Robot} player - the player the drone is owned by
 */
extend('CommandoDrone', 'Sprite');
function CommandoDrone(player) {
    this.super('drone', 0, -1);

    this.player = player;
    this.targetRadius = COMMANDO_DRONE_RADIUS;
    this.radius = 1;
    this.targetRot = new Vector(0, -1);

    // Weapon data
    this.gunData = {
        sprite   : 'lmgBullet',
        cd       : 0,
        rate     : 90,
        discharge: 0,
        interval : 5,
        initial  : true,
        speed    : 10,
        dx       : -6,
        dy       : 15,
        target   : Robot.ENEMY
    };
    this.chargeData: {
        sprite   : 'pCommandoChargeLaser',
        damage   : 0,
        cd       : 0,
        rate     : 1,
        discharge: 0,
        interval : 1,
        initial  : true,
        speed    : 20,
        dx       : -6,
        dy       : 15,
        target   : Robot.ENEMY
    };
    this.rail = wepaon.rail;
}

// Sets the new target angle of the drone
CommandoDrone.prototype.setAngle = function(angle) {
    while (angle < this.dirAngle - Math.PI) {
        this.dirAngle -= Math.PI * 2;
    }
    while (angle > this.dirAngle + Math.PI) {
        this.dirAngle += Math.PI * 2;
    }
    this.targetAngle = angle;
},

// Updates the drone
update    : function() {

    // Move outward after spawning to the desired radius
    if (this.radius < this.targetRadius) {
        this.radius = Math.min(this.radius + 1, this.targetRadius);
        this.pos.setLength(this.radius);
    }

    // Move to the correct angle when the player turns
    if (this.player.charging) {
        this.lookAt(this.player.forward().multiply(LASER_BOMB_OFFSET, LASER_BOMB_OFFSET));
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
        this.rail(this.chargeData);
    }
    else {

        // Update rotation
        var enemy = this.getTarget();
        if (enemy) {
            this.angle = AngleTowards(enemy, this, 0.05);
            this.cos = -Math.sin(this.angle);
            this.sin = Math.cos(this.angle);
        }

        this.gunData.damage = 5 * this.player.GetDamageMultiplier();
        this.gunData.range = (349 + 25 * this.player.upgrades[DRONE_RANGE_ID]) * this.player.droneRangeM;
        this.gunData.duration = (5 + this.player.upgrades[DRONE_SHOTS_ID]) * this.gunData.interval;
        var prevLength = this.player.bullets.length;
        this.shoot(this.gunData);
        for (var i = prevLength; i < this.player.bullets.length; i++) {
            this.player.bullets[i].source = this.player;
        }
    }
};

// Checks if the drone is in range of an enemy
CommandoDrone.prototype.isInRange = function(range) {
    var enemy = this.getTarget();
    return this.player.charging || (enemy && enemy.pos.distanceSq(this.pos) < sq(range));
};

// Gets the target of the drone
CommandoDrone.prototype.getTarget = function() {
    if (this.player.particle && this.player.skillDuration > 0) {
        var target = this.player.particle.target;
        if (target.pos.distanceSq(this.pos.clone().addv(this.player.pos)) < sq(this.gunData.range)) {
            return target;
        }
    }
    return gameScreen.getClosest(this.pos.clone().addv(this.player.pos), Robot.ENEMY);
}