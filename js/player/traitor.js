function PlayerTraitorType() {
    var p = BasePlayer(
        GetImage('pTraitorBody'),
        20
    );

    p.upgrades[SHIELD_ID] = 3;
    p.upgrades[SPREAD_ID] = 1;

    // Sprites
    p.drawObjects.push({
        sprite : GetImage('pTraitorSpread'),
        xOffset: -20.5,
        yOffset: -50
    });
    p.drawObjects.push({
        sprite : GetImage('pTraitorShield'),
        xOffset: -11,
        yOffset: -10
    });
    p.drawObjects.push({
        sprite : GetImage('pTraitorFlame'),
        xOffset: -40,
        yOffset: -20
    });
    p.drawObjects.push({
        sprite   : GetImage('droneArmRight'),
        xOffset  : -75,
        yOffset  : -40,
        condition: function() {
            return this.drones.length == 6;
        }.bind(p)
    });
    p.drawObjects.push({
        sprite   : GetImage('droneArmLeft'),
        xOffset  : 25,
        yOffset  : -40,
        condition: function() {
            return this.drones.length == 6;
        }.bind(p)
    });

    // Weapon data
    p.fireData = {sprite: GetImage('bossFlame'), cd: 0, list: p.bullets, dx: -30, dy: 45, rate: FIRE_CD};
    p.laserData = {
        sprite: GetImage('bossLaser'),
        cd    : 0,
        range : LASER_RANGE,
        list  : p.bullets,
        dx    : 0,
        dy    : 54,
        pierce: true
    };
    p.droneLaser = {
        sprite: GetImage('bossLaser'),
        cd    : 0,
        range : LASER_RANGE,
        list  : p.bullets,
        dx    : 65,
        dy    : 54,
        pierce: true
    };
    p.ShootFire = EnemyWeaponFire;
    p.FireLasers = EnemyWeaponGun;

    // Drone data
    p.drones = [];
    p.droneCounter = 0;
    p.droneTarget = 1;
    p.droneScale = 1;
    p.droneLast = 0;

    // Damage reduction
    p.onDamaged = function(amount, damager) {
        return amount / 2;
    };

    // Drawing drones
    p.onDraw = function() {

        canvas.translate(this.x, this.y);

        // Draw drones
        if (this.drones.length < 6) {
            for (i = 0; i < this.drones.length; i++) {
                this.drones[i].Draw(canvas);
            }
        }

        ResetTransform(canvas);
    };

    // Updates the player
    p.Update = function() {
        this.UpdateBase();

        // Get damage multiplier
        var m = this.GetDamageMultiplier();
        var m2 = 1;
        if (this.onFire) {
            var temp = this.onFire();
            if (temp !== undefined) {
                m = temp;
            }
            if (!m) {
                return;
            }
        }

        // Flamethrower
        var fireUps = this.upgrades[FLAME_ID];
        this.fireData.damage = FIRE_DAMAGE * m * m2;
        this.fireData.range = fireUps * FLAME_UP + FIRE_RANGE;
        this.ShootFire(this.fireData);

        // Lasers
        this.laserData.damage = LASER_DAMAGE * m * m2;
        this.laserData.rate = 60 / (LASER_APS + this.upgrades[LASER_ID] * LASER_UP);
        this.laserData.spread = this.upgrades[SPREAD_ID] / 2;
        this.FireLasers(this.laserData);

        // Drone lasers
        if (this.drones.length == 6) {
            this.droneLaser.damage = this.laserData.damage * 2;
            this.droneLaser.rate = this.laserData.rate;
            this.droneLaser.spread = this.laserData.spread > 3 ? 1 : 0;
            for (var i = 0; i < 2; i++) {
                this.FireLasers(this.droneLaser);
                this.droneLaser.dx *= -1;
            }
        }

        // Update Drones
        for (var i = 0; i < this.drones.length && i < 5; i++) {
            if (i % 3 == 0 && this.drones.length == 6) {
                continue;
            }
            this.drones[i].Update(this);
        }

        // Gaining drones
        if (this.drones.length == 6 || this.droneLast >= gameScreen.score) return;
        this.droneCounter += gameScreen.score - this.droneLast;
        this.droneLast = gameScreen.score;
        if (this.droneCounter >= this.droneTarget) {
            this.droneCounter -= this.droneTarget;
            this.droneTarget += this.droneScale;
            var droneAngle = 2 * Math.PI / (this.drones.length + 1);
            if (this.drones.length > 0) {
                var minAngle = this.drones[0].angle;
                var minIndex = 0;
                var i;
                for (i = 1; i < this.drones.length; i++) {
                    if (this.drones[i].angle < this.minAngle) {
                        this.minAngle = this.drones[i].angle;
                        minIndex = i;
                    }
                }
                for (i = 0; i < this.drones.length; i++) {
                    this.drones[(i + minIndex) % this.drones.length].SetAngle(droneAngle * (i + 1));
                }
            }
            this.drones.splice(minIndex, 0, new Drone(DRONE_NAMES[this.drones.length % 3], 0, DRONE_MECHANICS[this.drones.length % 3]));
        }
    };

    return p;
}