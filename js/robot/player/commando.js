// Load in ability scripts
depend('robot/skill/laserBomb');
depend('robot/skill/missileBarrage');
depend('robot/skill/targeter');

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
    this.lmgData = {
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
    this.nextDroneLevel = 4;
    this.droneRangeM = 1;
}

/**
 * Adds a new drone to the commando
 */
PlayerCommando.prototype.addDrone = function() {

    // Add the drone
    var drone = new CommandoDrone(this);
    this.drones.push(drone);
    gameScreen.robots.push(drone);

    // Update drone angles
    var totalAngle = (this.drones.length - 1) * Math.PI / 8;
    var increment = Math.PI / 8;
    var angle = -totalAngle / 2;
    for (var i = 0; i < this.drones.length; i++) {
        this.drones[i].setAngle(angle);
        angle += increment;
    }
};

/**
 * Updates the commando's gun
 */
PlayerCommando.prototype.applyUpdate = function() {

    if (this.drones.length == 0) this.addDrone();

    // Get damage multiplier
    var m = this.get('power');

    // LMG
    this.lmgData.damage = m * (5 + 2 * this.upgrades[LMG_DAMAGE_ID]);
    this.gun(this.lmgData);
    
    // Update drones
    for (var i = 0; i < this.drones.length; i++) {
        this.drones[i].update();
    }
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
    this.super('drone', 0, 0);

    this.player = player;
    this.offset = new Vector(0, -1);
    this.targetRadius = COMMANDO_DRONE_RADIUS;
    this.radius = 1;
    this.type = 0;
    
    // Weapon data
    this.gunData = {
        sprite   : 'lmgBullet',
        shooter  : player,
        cd       : 0,
        rate     : 90,
        discharge: 0,
        interval : 10,
        initial  : true,
        speed    : 10,
        dx       : -6,
        dy       : 15,
        target   : Robot.ENEMY
    };
    this.chargeData = {
        sprite   : 'pCommandoChargeLaser',
        shooter  : player,
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
    this.rail = weapon.rail;
}

// Sets the new target angle of the drone
CommandoDrone.prototype.setAngle = function(angle) {
    this.targetRot = new Vector(Math.sin(angle), -Math.cos(angle)).multiply(this.radius, this.radius);
};

// Updates the drone
CommandoDrone.prototype.update = function() {

    // Move outward after spawning to the desired radius
    if (this.radius < this.targetRadius) {
        this.radius++;
        this.offset.setMagnitude(this.radius);
        this.targetRot.setMagnitude(this.radius);
    }

    // Look to the correct angle when the player turns
    if (this.player.charging) {
        var target = this.player.forward().multiply(LASER_BOMB_OFFSET, LASER_BOMB_OFFSET);
        this.lookAt(target);
        this.chargeData.range = target.distance(this.offset) / 1.5;
        this.rail(this.chargeData);
    }
    else {
    
        // Rotate around the player to the desired position
        this.offset.rotateTowards(this.targetRot.clone().rotate(this.player.rotation.x, this.player.rotation.y), new Vector(COS_1, SIN_1));
    
        // Update rotation
        var enemy = this.getTarget();
        if (enemy) {
            this.lookTowards(enemy.pos, new Vector(COS_3, SIN_3));
        }
        
        this.moveTo(this.player.pos.x + this.offset.x, this.player.pos.y + this.offset.y);

        // Drone gun
        this.gunData.damage = 5 * this.player.get('power');
        this.gunData.range = (349 + 25 * this.player.upgrades[DRONE_RANGE_ID]) * this.player.droneRangeM;
        this.gunData.duration = (5 + this.player.upgrades[DRONE_SHOTS_ID]) * this.gunData.interval;
        this.rail(this.gunData);
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
        if (target.pos.distanceSq(this.pos) < sq(this.gunData.range)) {
            return target;
        }
    }
    return gameScreen.getClosest(this.pos, Robot.ENEMY);
};