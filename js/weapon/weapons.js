depend('lib/math');
depend('lib/2d/vector');
depend('robot');

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
    checkTime: function (data, inRange) {

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
     * Checks the rotation of the velocity. This uses the values:
     * <ul>
     *     <li>{number} [speed]       - the speed of the bullet</li>
     *     <li>{number} [angle]       - random angle range for spread</li>
     *     <li>{number} [angleOffset] - definite angle for spread</li>
     * </ul>
     *
     * @param {Robot}  source - the source of the weapon
     * @param {Object} data   - the weapon data
     *
     * @returns {object} the velocity and angle offset of the bullet
     */
    checkRotation: function (source, data) {

        var forward = source.forward();
        var vel = Vector(forward.x * (data.speed || weapon.DEFAULT_SPEED), forward.y * (data.speed || weapon.DEFAULT_SPEED));

        // Get the angle
        var angle = 0;
        if (data.angle) {
            angle += rand(-data.angle, data.angle + 1) * Math.PI / 180;
        }
        if (data.angleOffset) {
            angle += data.angleOffset * Math.PI / 180;
        }

        // Apply the angle
        var c = 1, s = 0;
        if (angle != 0) {
            c = Math.cos(angle);
            s = Math.sin(angle);
            vel.rotate(c, s);
        }

        // Return the result
        return {vel: vel, rot: new Vector(c, s).rotatev(source.rotation) };
    },

    /**
     * Gets the starting position for a bullet
     *
     * @param {Robot}  source - the source of the weapon
     * @param {Object} data   - the weapon data
     *
     * @returns {Vector} starting position for the bullet
     */
    getPosition: function (source, data) {

        // Initialize values
        if (data.dx === undefined) data.dx = 0;
        if (data.dy === undefined) data.dy = 0;

        return new Vector(data.dx, data.dy).rotateAroundv(source.pos, source.rotation).addv(source.pos);
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
     * A bullet that on contact deals damage and applies a debuff
     * <ul>
     *     <li>{number}  rate          - the number of frames between shots</li>
     *     <li>{number}  damage        - the damage dealt by the bullet</li>
     *     <li>{number}  range         - the range of the bullet</li>
     *     <li>{string}  stat          - the stat to affect</li>
     *     <li>{number}  multiplier    - the multiplier to apply</li>
     *     <li>{number}  duration      - the duration of the buff</li>
     *     <li>{string}  [sprite]      - the name of the bullet sprite</li>
     *     <li>{number}  [speed]       - the speed of the bullet</li>
     *     <li>{number}  [dx]          - horizontal position offset</li>
     *     <li>{number}  [dy]          - vertical position offset</li>
     *     <li>{boolean} [pierce]      - whether or not the bullets pierce</li>
     *     <li>{number}  [angle]       - random angle range for spread</li>
     *     <li>{number}  [angleOffset] - definite angle for spread</li>
     *     <li>{number}  [spread]      - the number of bullets to spread</li>
     *     <li>{number}  [delay]       - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    debuff: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var result = weapon.checkRotation(this, data);
            var pos = weapon.getPosition(this, data);
            var bullet = new DebuffBullet(
                data.sprite || 'slowMissile',
                this,
                pos,
                result.vel,
                result.rot,
                data.damage,
                data.range * 1.5,
                data.pierce,
                data.stat,
                data.multiplier,
                data.duration
            );
            data.list.push(bullet);
            weapon.spread(bullet, data);
        }
    },

    /**
     * A weapon that slashes a sword in front of the user
     * <ul>
     *     <li>{number} rate        - the number of frames between shots</li>
     *     <li>{number} radius      - the radius of the swing arc</li>
     *     <li>{number} angle       - the angle to start the swing at</li>
     *     <li>{number} arc         - the angle of the swing arc</li>
     *     <li>{string} sprite      - the name of the sword image</li>
     *     <li>{number} knockback   - the amount of knockback to apply</li>
     *     <li>{number} [lifesteal] - the amount of lifesteal to apply</li>
     *     <li>{number} [range]     - the range of the bullet</li>
     *     <li>{number} [dx]        - horizontal position offset</li>
     *     <li>{number} [dy]        - vertical position offset</li>
     *     <li>{number} [delay]     - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    doubleSword: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range || 150))) {
            if (data.dx) {
                var m = this.right ? 1 : -1;
                data.dx = Math.abs(data.dx) * m;
            }
            var pos = weapon.getPosition(this, data);
            var side = this.right ? 'Right' : 'Left';
            this.right = !this.right;
            var sword = new Sword(
                data.sprite + side,
                this,
                pos,
                data.radius,
                data.angle,
                data.damage,
                data.arc * m,
                data.knockback,
                0
            );
            data.list.push(sword);
            this.sword = false;
        }
    },

    /**
     * A flamethrower weapon with expanding fire projectiles
     * <ul>
     *     <li>{number}  rate          - the number of frames between shots</li>
     *     <li>{number}  damage        - the damage dealt by the bullet</li>
     *     <li>{number}  range         - the range of the bullet</li>
     *     <li>{string}  [sprite]      - the name of the bullet sprite</li>
     *     <li>{number}  [speed]       - the speed of the bullet</li>
     *     <li>{number}  [dx]          - horizontal position offset</li>
     *     <li>{number}  [dy]          - vertical position offset</li>
     *     <li>{boolean} [pierce]      - whether or not the bullets pierce</li>
     *     <li>{number}  [angle]       - random angle range for spread</li>
     *     <li>{number}  [angleOffset] - definite angle for spread</li>
     *     <li>{number}  [delay]       - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    fire: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var result = weapon.checkRotation(this, data);
            var pos = weapon.getPosition(this, data);
            var fire = new Fire(
                data.sprite || 'fire',
                this,
                pos,
                result.vel,
                result.rot,
                data.damage,
                data.range * 1.5
            );
            data.list.push(fire);
        }
    },

    /**
     * A weapon that slashes a sword in front of the user (usable only by fist boss)
     * <ul>
     *     <li>{number} rate       - the number of frames between shots</li>
     *     <li>{number} speed      - how fast the fist travels</li>
     *     <li>{number} [range]    - the range of the fist</li>
     *     <li>{number} [delay]    - the delay before shooting while in range</li>
     *     <li>{number} [duration] - how long the fist stays still</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    fist: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range || 150))) {
            var tx = (data.side ? -1 : 1) * (5 + this.sprite.width / 2 + this.rightFistImg.width / 2);
            var fist = new Fist(
                this,
                new Vector(tx + this.x, this.y),
                this.forward().multiply(data.speed, data.speed),
                this.rotation.clone(),
                data.damage,
                data.range * 1.5,
                data.duration || 120,
                data.side ? 'Right' : 'Left'
            );
            gameScreen.enemyManager.bullets.push(fist);
            this[(data.side ? 'right' : 'left') + 'Fist'] = false;
            data.side = !data.side;
        }
    },

    /**
     * A grapple hook that brings targets to the shooter or vice versa
     * <ul>
     *     <li>{number}  rate     - the number of frames between shots</li>
     *     <li>{number}  damage   - the damage dealt by the bullet</li>
     *     <li>{number}  range    - the range of the bullet</li>
     *     <li>{string}  [sprite] - the name of the bullet sprite</li>
     *     <li>{number}  [delay]  - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    grapple: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var grapple = new Grapple(
                data.sprite || 'grappleHook',
                this,
                data.damage,
                data.range,
                data.stun,
                data.self
            );
            this.grapple = grapple;
            data.list.push(grapple);
        }
    },

    /**
     * A simple gun weapon that fires one or more bullets
     * <ul>
     *     <li>{number}  rate          - the number of frames between shots</li>
     *     <li>{number}  damage        - the damage dealt by the bullet</li>
     *     <li>{number}  range         - the range of the bullet</li>
     *     <li>{string}  [sprite]      - the name of the bullet sprite</li>
     *     <li>{number}  [speed]       - the speed of the bullet</li>
     *     <li>{number}  [dx]          - horizontal position offset</li>
     *     <li>{number}  [dy]          - vertical position offset</li>
     *     <li>{boolean} [pierce]      - whether or not the bullets pierce</li>
     *     <li>{number}  [angle]       - random angle range for spread</li>
     *     <li>{number}  [angleOffset] - definite angle for spread</li>
     *     <li>{number}  [spread]      - the number of bullets to spread</li>
     *     <li>{number}  [delay]       - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    gun: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var result = weapon.checkRotation(this, data);
            var pos = weapon.getPosition(this, data);
            var bullet = new Bullet(
                data.sprite || 'bullet',
                this,
                pos,
                result.vel,
                result.rot,
                data.damage,
                data.range * 1.5,
                data.pierce
            );
            data.list.push(bullet);
            weapon.spread(bullet, data);
        }
    },

    /**
     * A missile that follows a target and explodes on impact or reaching the end of its
     * range to deal AOE damage
     * <ul>
     *     <li>{number}    rate          - the number of frames between shots</li>
     *     <li>{number}    damage        - the damage dealt by the bullet</li>
     *     <li>{number}    range         - the range of the bullet</li>
     *     <li>{number}    radius        - the radius of the explosion</li>
     *     <li>{number}    knockback     - the amount of knockback</li>
     *     <li>{Robot[][]} lists         - the lists of robots the explosion can hit</li>
     *     <li>{string}    [sprite]      - the name of the bullet sprite</li>
     *     <li>{number}    [speed]       - the speed of the bullet</li>
     *     <li>{number}    [dx]          - horizontal position offset</li>
     *     <li>{number}    [dy]          - vertical position offset</li>
     *     <li>{boolean}   [pierce]      - whether or not the bullets pierce</li>
     *     <li>{number}    [angle]       - random angle range for spread</li>
     *     <li>{number}    [angleOffset] - definite angle for spread</li>
     *     <li>{number}    [spread]      - the number of bullets to spread</li>
     *     <li>{number}    [delay]       - the delay before shooting while in range</li>
     *     <li>{string}    [type]        - the type of the explosion effect</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    homingRocket: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var result = weapon.checkRotation(this, data);
            var pos = weapon.getPosition(this, data);
            var m = 1;
            if (data.dx > 0) m = -1;
            if (data.dx == 0) m = rand(2) * 2 - 1;
            var rocket = new HomingRocket(
                data.sprite,
                this,
                getNearest(data.lists, pos),
                pos,
                result.vel.rotate(HALF_RT_2, m * HALF_RT_2),
                result.rot.rotate(HALF_RT_2, m * HALF_RT_2),
                data.damage,
                data.range * 1.5,
                data.radius,
                data.knockback,
                data.type || 'Enemy',
                data.lists
            );
            data.list.push(rocket);
            weapon.spread(rocket, data);
        }
    },

    /**
     * An instant melee attack that can apply a debuff
     * <ul>
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
            var robot = getNearest(data.lists, this.pos);
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
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    mine: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var pos = weapon.getPosition(this, data);
            var mine = new Mine(pos, data.damage, data.type);
            enemyManager.mines.push(mine);
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
                this.subWeapon = data.subWeapon;
                var tempCd = data.cd;
                var tempDelay = data.delay;
                data.delay = 0;
                for (var i = 0; i < (data.bullets || 1); i++) {
                    this.subWeapon(data);
                    data.cd = tempCd;
                }
                data.delay = tempDelay;
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
     * A missile that explodes on impact or when reaching its max range to deal AOE damage
     * <ul>
     *     <li>{number}    rate          - the number of frames between shots</li>
     *     <li>{number}    damage        - the damage dealt by the bullet</li>
     *     <li>{number}    range         - the range of the bullet</li>
     *     <li>{number}    radius        - the radius of the explosion</li>
     *     <li>{number}    knockback     - the amount of knockback</li>
     *     <li>{Robot[][]} lists         - the lists of robots the explosion can hit</li>
     *     <li>{string}    [sprite]      - the name of the bullet sprite</li>
     *     <li>{number}    [speed]       - the speed of the bullet</li>
     *     <li>{number}    [dx]          - horizontal position offset</li>
     *     <li>{number}    [dy]          - vertical position offset</li>
     *     <li>{boolean}   [pierce]      - whether or not the bullets pierce</li>
     *     <li>{number}    [angle]       - random angle range for spread</li>
     *     <li>{number}    [angleOffset] - definite angle for spread</li>
     *     <li>{number}    [spread]      - the number of bullets to spread</li>
     *     <li>{number}    [delay]       - the delay before shooting while in range</li>
     *     <li>{string}    [type]        - the type of the explosion effect</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    rocket: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var result = weapon.checkRotation(this, data);
            var pos = weapon.getPosition(this, data);
            var rocket = new Rocket(
                data.sprite || 'rocket',
                this,
                pos,
                result.vel,
                result.rot,
                data.damage,
                data.range * 1.5,
                data.radius,
                data.knockback,
                data.type || 'Enemy',
                data.lists
            );
            data.list.push(rocket);
            weapon.spread(rocket, data);
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
            var pos = weapon.getPosition(this, data);
            var shockwave = Shockwave(
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
     * A simple gun weapon that fires one or more bullets perpendicular to the source
     * <ul>
     *     <li>{number}    rate          - the number of frames between shots</li>
     *     <li>{number}    damage        - the damage dealt by the bullet</li>
     *     <li>{number}    range         - the range of the bullet</li>
     *     <li>{Robot[][]} lists         - the lists of robots this can hit</li>
     *     <li>{string}    [sprite]      - the name of the bullet sprite</li>
     *     <li>{number}    [speed]       - the speed of the bullet</li>
     *     <li>{number}    [dx]          - horizontal position offset</li>
     *     <li>{number}    [dy]          - vertical position offset</li>
     *     <li>{boolean}   [pierce]      - whether or not the bullets pierce</li>
     *     <li>{number}    [angle]       - random angle range for spread</li>
     *     <li>{number}    [angleOffset] - definite angle for spread</li>
     *     <li>{number}    [spread]      - the number of bullets to spread</li>
     *     <li>{number}    [delay]       - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    sideGun: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var result = weapon.checkRotation(this, data);
            var pos = weapon.getPosition(this, data);

            var target = getNearest(this.lists, pos);
            var d = this.pos.clone().subtractv(target.pos);
            var right = d.dot(this.rotation) < 0;
            var m = right ? 1 : -1;
            result.vel.rotate(0, m);

            var bullet = new Bullet(
                data.sprite || 'bullet',
                this,
                pos,
                result.vel,
                result.rot,
                data.damage,
                data.range * 1.5,
                data.pierce
            );
            data.list.push(bullet);
            weapon.spread(bullet, data);
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
        if (enemyManager.enemies.length > data.max) {
            this.switchPattern();
            return;
        }

        // Spawn enemies when off cooldown and in range
        if (weapon.checkTime(data, this.isInRange(data.range))) {
            var pos = weapon.getPosition(this, data);
            enemyManager.spawnEnemy(data.enemies, pos.x, pos.y);
        }
    },

    /**
     * A weapon that slashes a sword in front of the user
     * <ul>
     *     <li>{number} rate        - the number of frames between shots</li>
     *     <li>{number} radius      - the radius of the swing arc</li>
     *     <li>{number} angle       - the angle to start the swing at</li>
     *     <li>{number} arc         - the angle of the swing arc</li>
     *     <li>{number} knockback   - the amount of knockback to apply</li>
     *     <li>{number} [lifesteal] - the amount of lifesteal to apply</li>
     *     <li>{string} [sprite]    - name of the sword image</li>
     *     <li>{number} [range]     - the range of the bullet</li>
     *     <li>{number} [dx]        - horizontal position offset</li>
     *     <li>{number} [dy]        - vertical position offset</li>
     *     <li>{number} [delay]     - the delay before shooting while in range</li>
     * </ul>
     *
     * @param {Object} data - weapon data
     */
    sword: function(data) {
        if (weapon.checkTime(data, this.isInRange(data.range || 150))) {
            var pos = weapon.getPosition(this, data);
            var sword = new Sword(
                data.sprite || 'sword',
                this,
                pos.x,
                pos.y,
                data.radius,
                data.angle,
                data.damage,
                data.arc,
                data.knockback,
                data.lifesteal
            );
            data.list.push(sword);
            this.sword = false;
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
            var pos = weapon.getPosition(this, data);
            gameScreen.enemyManager.turrets.push(new Turret(pos, data.damage, data.health));
        }
    }
};
