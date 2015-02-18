depend('lib/math');
depend('lib/2d/vector');
depend('robot/projectile');

var weapon = {

    // Constants
    DEFAULT_SPEED: 10,

    /**
     * Checks to make sure the weapon can be fired based on cooldown/delay. This uses these values:
     * <ul>
     *     <li>{number} rate    - the number of frames between shots</li>
     *     <li>{number} [delay] - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object}  data    - the weapon data
     * @param {boolean} inRange - whether or not the robot is in range
     *
     * @returns {boolean} true when able to fire, false otherwise
     */
    checkTime: function(data, inRange) {

        // Initialize data
        if (data.delayTimer === undefined) data.delayTimer = 0;
        if (data.cd === undefined) data.cd = 0;

        // Must be off cooldown and past the delay
        if (inRange && data.cd <= 0) {
            if (data.delay && data.delayTimer < data.delay) {
                data.delayTimer++;
                return false;
            }
            data.cd = data.rate;
            return true;
        }
        // Lower cooldown when on cooldown
        else if (data.cd > 0) {
            data.cd--;
        }

        // Reset the delay timer when out of range
        else data.delayTimer = 0;

        return false;
    },

    /**
     * Gets the rotation for the velocity of a bullet using wepaon data
     * <ul>
     *     <li>{number} [angle]       - random angle range for spread</li>
     *     <li>{number} [angleOffset] - definite angle for spread</li>
     * </ul>
     *
     * @param {Object} data   - the weapon data
     *
     * @returns {Number} the angle offset to use
     */
    getAngle: function(data) {

        // Get the angle
        var angle = 0;
        if (data.angle) {
            angle += rand(-data.angle, data.angle + 1) * Math.PI / 180;
        }
        if (data.angleOffset) {
            angle += data.angleOffset * Math.PI / 180;
        }
		
		return angle;
    },

    /**
     * Gets the starting position for a bullet
     *
     * @param {Robot}  source - the source of the weapon
     * @param {Object} data   - the weapon data
     *
     * @returns {Vector} starting position for the bullet
     */
    getPosition: function(source, data) {

        // Initialize values
        if (data.dx === undefined) data.dx = 0;
        if (data.dy === undefined) data.dy = 0;

        return new Vector(data.dx, data.dy);
    },

    /**
     * Fires a bullet using the given settings
     *
     * @param {Robot}  source - robot firing the bullet
     * @param {Object} data   - settings to apply
     */
    fireBullet: function(source, data) {
        var pos = weapon.getPosition(source, data);
			
        // Create the projectile
        var projectile = new Projectile(
            data.sprite || 'bullet',
            pos.x, pos.y,
            data.shooter || source, source,
            data.speed || weapon.DEFAULT_SPEED,
            weapon.getAngle(data),
            data.damage,
            data.distance || (data.range * 1.5),
            data.pierce,
            data.target
        );
        
        // Copy over provided buffs
        if (data.buffs) {
            projectile.buffs = data.buffs;
        }
        
        // Copy over event handlers
        projectile.onUpdate = data.onUpdate;
        projectile.onCollideCheck = data.onCollideCheck;
        projectile.onHit = data.onHit;
        projectile.onBlocked = data.onBlocked;
        projectile.onExpire = data.onExpire;
        
        // Apply template calls
        if (data.templates) {
            for (var i = 0; i < data.templates.length; i++) {
                var temp = data.templates[i];
                projectile[temp.name].apply(projectile, temp.args);
            }
        }
        
        // Apply extra data
        if (data.extra) {
            var x;
            for (x in data.extra) {
                projectile[x] = data.extra[x];
            }
        }
        
        // Add the bullet to the game and spread it
        gameScreen.bullets.push(projectile);
        if (data.spread) {
            projectile.spread(data.spread);
        }
    },

    /**
     * Spreads the bullet into multiple bullets based on the weapon data. This uses these values:
     *  <ul>
     *     <li>{number} [spread] - the number of bullets to spread</li>
     * </ul>
     *
     * @param bullet
     * @param data
     */
    spread: function(bullet, data) {
        if (data.spread) {
            bullet.spread(data.spread, data.list);
        }
    },

    /**
     * A simple gun weapon that fires one or more bullets
     * <ul>
	 *     <li>{number}   target           - the ID of the target group the bullet hits</li>
     *     <li>{number}   rate             - the number of frames between shots</li>
     *     <li>{number}   damage           - the damage dealt by the bullet</li>
     *     <li>{number}   range            - the range of the bullet</li>
	 *     <li>{number}   [distance]       - how far the bullet travels</li>
     *     <li>{string}   [sprite]         - the name of the bullet sprite</li>
     *     <li>{number}   [speed]          - the speed of the bullet</li>
     *     <li>{number}   [dx]             - horizontal position offset assuming no rotation</li>
     *     <li>{number}   [dy]             - vertical position offset assuming no rotation</li>
     *     <li>{boolean}  [pierce]         - whether or not the bullets pierce</li>
     *     <li>{number}   [angle]          - random angle range for spread</li>
     *     <li>{number}   [angleOffset]    - definite angle for spread</li>
     *     <li>{number}   [spread]         - the number of bullets to spread</li>
     *     <li>{number}   [delay]          - the delay before shooting while in range</li>
	 *     <li>{Robot}    [shooter]        - the actual shooter of the bullet</li>
     *     <li>{Array}    [buffs]          - buffs to apply on hit { stat, multiplier, duration }</li>
     *     <li>{Array}    [templates]      - templates to apply { name, args }</li>
     *     <li>{function} [onUpdate]       - onUpdate event handler (projEvent function)</li>
     *     <li>{function} [onCollideCheck] - onCoolideCheck event handler (projEvent function)</li>
     *     <li>{function} [onHit]          - onHit event handler (projEvent function)</li>
     *     <li>{function} [onBlocked]      - onBlocked event handler (projEvent function)</li>
     *     <li>{function} [onExpire]       - onExpire event handler (projEvent function)</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    gun: function(data) {
	
		// Must meet the conditions
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            weapon.fireBullet(this, data);
        }
    },

    /**
     * An instant melee attack that can apply a debuff
     * <ul>
           <li>{number}  target       - target robot group ID to hit</li>
     *     <li>{number}  rate         - the number of frames between shots</li>
     *     <li>{number}  damage       - the damage dealt by the bullet</li>
     *     <li>{number}  range        - the range of the bullet</li>
     *     <li>{string}  [stat]       - the stat to affect</li>
     *     <li>{number}  [multiplier] - the multiplier to apply</li>
     *     <li>{number}  [duration]   - the duration of the buff</li>
     *     <li>{number}  [delay]      - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    melee: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var robot = gameScreen.getClosest(this.pos, data.target);
            robot.damage(data.damage, this);
            if (data.stat && data.slow && data.duration) {
                robot.buff(data.stat, data.multiplier, data.duration);
            }
        }
    },

    /**
     * A weapon that drops mines
     * <ul>
     *     <li>{number}  rate       - the number of frames between shots</li>
     *     <li>{number}  damage     - the damage dealt by the bullet</li>
     *     <li>{number}  range      - the range of the bullet</li>
     *     <li>{string}  [type]     - the type of mine</li>
     *     <li>{number}  [speed]    - the speed of the bullet</li>
     *     <li>{number}  [dx]       - horizontal position offset</li>
     *     <li>{number}  [dy]       - vertical position offset</li>
     *     <li>{number}  [delay]    - the delay before shooting while in range</li>
     *     <li>{number}  [duration] - the lifespan of the mine
     *     <li>{number}  [target]   - the target group the mine can hit
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    mine: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var pos = weapon.getPosition(this, data).addv(this.pos);
            var mine = new Mine(this, pos, data.damage, data.type, data.target || Robot.PLAYER);
            gameScreen.robots.push(mine);
            if (data.duration) {
                mine.lifespan = data.duration;
            }
        }
    },

    /**
     * A weapon that applies another weapon after charging up over an interval. Along with the values below,
     * you should add the values for the sub weapon to the weapon data. Any values used by this
     * that are also used by the sub weapon are ignored in the sub weapon.
     * <ul>
     *     <li>{function} subWeapon  - the weapon to fire</li>
     *     <li>{number}   rate       - the charge up time in frames</li>
     *     <li>{number}   duration   - the firing interval time in frames</li>
     *     <li>{number}   range      - the range of the weapon</li>
     *     <li>{number}   [interval] - the delay between each shot during the firing interval</li>
     *     <li>{boolean}  [initial]  - whether or not to skip the first charging time</li>
     *     <li>{number}   [bullets]  - the number of bullets to fire per shot</li>
     *     <li>{number}   [delay]    - the delay before firing outside of charging up</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    rail: function(data) {

        // Initialize values
        data.subWeapon = data.subWeapon || weapon.gun;
        if (data.delayTimer === undefined) data.delayTimer = 0;

        // Charge up when in range
        if (this.isInRange(data.range) || data.cd < 0) {
            if (data.delay && data.delayTimer < data.delay) {
                data.delayTimer++;
                return;
            }
            data.cd--;

            // Fire when charged up
            if (data.cd < 0) {
                if (data.intervalTimer > 1) {
                    data.intervalTimer--;
                    return;
                }
                for (var i = 0; i < (data.bullets || 1); i++) {
                    weapon.fireBullet(this, data);
                }
                data.intervalTimer = data.interval;

                // "Overheating" resets the charge countdown
                if (data.cd < -data.duration) {
                    data.cd = data.rate;
                }
            }
        }

        // Discharge when unable to attack
        else if (data.cd <= data.rate) {
            if (data.initial) {
                if (data.cd > 0) {
                    data.cd--;
                }
            }
            else {
                data.cd += data.discharge;
            }
        }
    },

    /**
     * A weapon that emits a shockwave that expands outward
     * <ul>
     *     <li>{number}  rate        - the number of frames between shots</li>
     *     <li>{number}  damage      - the damage dealt by the bullet</li>
     *     <li>{number}  range       - the range of the bullet</li>
     *     <li>{number}  start       - the starting angle of the shockwave</li>
     *     <li>{number}  end         - the ending angle of the shockwave</li>
     *     <li>{number}  radius      - the starting radius of the arc</li>
     *     <li>{number}  [thickness] - the width of the shockwave</li>
     *     <li>{string}  [color1]    - the primary color of the shockwave</li>
     *     <li>{string}  [color2]    - the secondary color of the shockwave</li>
     *     <li>{number}  [speed]     - the speed of the bullet</li>
     *     <li>{number}  [knockback] - the amount of knockback</li>
     *     <li>{number}  [dx]        - horizontal position offset</li>
     *     <li>{number}  [dy]        - vertical position offset</li>
     *     <li>{number}  [delay]     - the delay before shooting while in range</li>
     *     <li>{boolean} [alternate] - whether or not to alternate sides</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    shockwave: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var pos = weapon.getPosition(this, data).addv(this.pos);
            var shockwave = new Shockwave(
                this,
                data.color1 || '#ff9933',
                data.color2 || '#f70',
                pos,
                data.speed || 5,
                data.start + this.angle,
                data.end + this.angle,
                data.radius,
                data.thickness || 20,
                data.damage,
                data.range,
                data.knockback
            );
            data.list.push(shockwave);
            if (data.alternate) {
                var temp = Math.PI - data.end;
                data.end = Math.PI - data.start;
                data.start = temp;
            }
        }
    },

    /**
     * A weapon that spawns enemies (not usable by players)
     * <ul>
     *     <li>{number} rate    - the number of frames between shots</li>
     *     <li>{number} range   - the range of the bullet</li>
     *     <li>{number} max     - the max amount of enemies to spawn</li>
     *     <li>{Array}  enemies - the spawn data to use</li>
     *     <li>{number} [dx]    - horizontal position offset</li>
     *     <li>{number} [dy]    - vertical position offset</li>
     *     <li>{number} [delay] - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    spawn: function(data) {

        // Don't spawn more if already reached the max
        if (gameScreen.robots.length > data.max + players.length) {
            this.switchPattern();
            return;
        }

        // Spawn enemies when off cooldown and in range
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var pos = weapon.getPosition(this, data).addv(this.pos);
            gameScreen.spawnEnemy(data.enemies, pos).exp = 0;
        }
    },

    /**
     * A weapon that drops mines
     * <ul>
     *     <li>{number} rate    - the number of frames between shots</li>
     *     <li>{number} damage  - the damage dealt by the bullet</li>
     *     <li>{number} range   - the range of the bullet</li>
     *     <li>{number} health  - the amount of health the turret has</li>
     *     <li>{number} [dx]    - horizontal position offset</li>
     *     <li>{number} [dy]    - vertical position offset</li>
     *     <li>{number} [delay] - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    turret: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var pos = weapon.getPosition(this, data).addv(this.pos);
            gameScreen.robots.push(new Turret(pos, data.damage, data.health));
        }
    }
};
