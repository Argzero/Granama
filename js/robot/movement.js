// AI Movement patterns available for enemies
var movement = {

    /**
     * Helper function for moving towards a target
     *
     * @param {Robot}   target      - target to move towards
     * @param {boolean} [backwards] - whether or not to face backwards
     */
    moveTowards: function(target, backwards) {
    
        // Turning values
        if (this.prevTurnDivider != this.turnDivider) {
            this.turnVec = new Vector(Math.cos(this.speed / this.turnDivider), Math.sin(this.speed / this.turnDivider));
            this.prevTurnDivider = this.turnDivider;
        }

        // Turn towards the player
        if (backwards) this.lookAway(target.pos, this.turnVec);
        else this.lookTowards(target.pos, this.turnVec);

        // Get the direction to move
        var forward = this.forward();
        var m = forward.dot(this.pos.clone().subtractv(target.pos)) > 0 ? -1 : 1;

        // Move the enemy to their preferred range
        var speed = this.get('speed');
        var dSq = this.pos.distanceSq(target.pos);
        if (dSq > sq(this.range + speed)) {
            this.move(forward.x * m * speed, forward.y * m * speed);
        }
        else if (dSq < sq(this.range - speed)) {
            this.move(-forward.x * m * speed / 3, -forward.y * m * speed / 3);
        }
    },

    /**
     * Basic movement pattern which moves towards the player up until the
     * preferred range and moving away when too close while facing away
     * from the player at the same time.
     */
    backwards: function() {
        this.movementHelper = movement.moveTowards;
        this.movementHelper(getClosestPlayer(this.pos), true);
    },
    
    /**
     * Basic movement pattern which moves towards the player up until the
     * preferred range and moving away when too close.
     */
    basic: function() {
        this.movementHelper = movement.moveTowards;
        this.movementHelper(getClosestPlayer(this.pos));
    },

    /**
     * Movement pattern that moves in a straight line, bouncing off walls or players
     */
    bounce: function() {
        this.ignoreClamp = true;

        // Movement
        var speed = this.get('speed');
        this.move(this.direction.x * speed, this.direction.y * speed);

        // Looking direction
        var player = getClosestPlayer(this.pos);
        this.lookAt(player.pos);

        // Bounds
        if (this.xMin() <= 0) {
            this.direction.x = Math.abs(this.direction.x);
        }
        if (this.xMax() >= GAME_WIDTH) {
            this.direction.x = -Math.abs(this.direction.x);
        }
        if (this.yMin() < 0) {
            this.direction.y = Math.abs(this.direction.y);
        }
        if (this.yMax() > GAME_HEIGHT) {
            this.direction.y = -Math.abs(this.direction.y);
        }

        // Collision
        if (player.health > 0 && this.collides(player)) {
            this.direction = this.pos.clone().subtractv(player.pos).normalize();
            player.damage(this.power, this);

            var knockback = this.direction.clone().multiply(-this.distance, -this.distance);
            player.knockback(knockback);
        }
    },

    /**
     * Movement pattern that moves normally until in range, then charges and collides with players
     */
    charge: function() {

        // When charging, keep moving forward
        if (this.charging) {
            this.charging--;

            this.move(this.forward().x * this.speed * 2, this.forward().y * this.speed * 2);

            // Stop charging when reaching the edge of the map
            if (this.xMin() < 0 || this.xMax() > GAME_WIDTH || this.yMin() < 0 || this.yMax() > GAME_HEIGHT) {
                this.charging = 0;
            }

            // Collision
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                if (player.health > 0 && this.collides(player)) {
                    var direction = player.pos.clone().subtractv(this.pos);
                    var dot = this.rotation.dot(direction);
                    if (dot > 0) {
                        player.knockback(this.rotation.clone().multiply(this.distance, this.distance));
                    }
                    else {
                        player.knockback(this.rotation.clone().multiply(-this.distance, -this.distance));
                    }
                    player.damage(this.power, this);
                }
            }
        }

        // Normal movement otherwise
        else {

            this.subMovement = movement.basic;
            this.subMovement();

            // Charge when in range
            if (this.forward().dot(getClosestPlayer(this.pos).pos.clone().subtractv(this.pos).normalize()) > 0.995) {
                this.charging = this.chargeDuration;
            }
        }
    },

    /**
     * Movement for flying around the map and staying around players
     */
    flying: function() {

        // Turning values
        if (this.prevTurnDivider != this.turnDivider) {
            this.turnVec = new Vector(Math.cos(this.speed / this.turnDivider), Math.sin(this.speed / this.turnDivider));
            this.prevTurnDivider = this.turnDivider;
        }

        // Turn towards the player or the center if too close to an edge
        var target;
        var padding = 400;
        if (this.pos.x < padding || this.pos.x > game.width - padding || this.pos.y < padding || this.pos.y > game.height - padding) {
            target = new Vector(GAME_WIDTH / 2, GAME_HEIGHT / 2);
        }
        else {
            var player = getClosestPlayer(this.pos);
            if (this.pos.distanceSq(player.pos) > sq(this.turnRange || padding)) {
                target = player.pos;
            }
        }

        // Update the angle/cos/sin values if necessary
        if (target) {
            this.lookTowards(target, this.turnVec);
        }

        // Move forward
        this.move(this.forward().x * this.speed, this.forward().y * this.speed);
    },

    /**
     * Movement for flying around the center of the map
     */
    flyCenter: function() {

        // Turning values
        this.turnVec = this.turnVec || new Vector(Math.cos(this.speed / this.turnDivider), Math.sin(this.speed / this.turnDivider));

        // Turn towards the center
        var target = new Vector(GAME_WIDTH / 2, GAME_HEIGHT / 2);
        this.lookTowards(target, this.turnVec);

        // Move forward
        this.move(this.forward().x * this.speed, this.forward().y * this.speed);
    },
    
    /**
     * Movement pattern for moving towards other enemies and healing them
     */
    medic: function() {
    
        // Turn towards the nearest damaged enemy, ignoring faster units and
        // prioritizing non-healers
        var target, dSq;
        if (this.spawner) {
            target = this.spawner;
            dSq = target.pos.distanceSq(this.pos);
        }
        else {
            for (var i = 0; i < gameScreen.robots.length; i++) {
                var e = gameScreen.robots[i];
                if (e == this || e.health >= e.maxHealth || e.speed > this.speed || !(e.type & Robot.MOBILE)) continue;
                var temp = e.pos.distanceSq(this.pos);
                if (!dSq || ((!e.heal || target.heal) && temp < dSq)) {
                    dSq = temp;
                    target = e;
                }
            }
        }

        // Move randomly when there's no targets to heal
        if (!target) {
            while (!this.backup || this.pos.distanceSq(this.backup.pos) < sq(this.range + 100)) {
                this.backup = { pos: new Vector(rand(GAME_WIDTH), rand(GAME_HEIGHT)) };
            }
            target = this.backup;
        }

        // Heal the enemy if close enough
        else if (dSq <= sq(this.range + 10)) {
            target.health += this.heal;
            if (target.health > target.maxHealth) {
                target.health = target.maxHealth;
            }
        }

        // Move towards the target
        this.movementHelper = movement.moveTowards;
        this.movementHelper(target);
    },
    
    /**
     * Movement pattern for orbiting around the player
     */
    orbit: function() {
    
        // Move normally if not in the preferred range
        var player = getClosestPlayer(this.pos);
        var ds = this.pos.distanceSq(player.pos);
        var tooFar = ds > sq(this.range + 100);
        var tooClose = ds < sq(this.range - 100);
        
        // Turn towards the player
        var d = player.pos.clone().subtractv(this.pos);
        var d1 = d.dot(this.rotation);
        
        // Turn in the correct direction
        this.movementHelper = movement.moveTowards;
        if (tooFar) {
            this.movementHelper(player);
        }
        else if (tooClose) {
            this.movementHelper({ pos: d.multiply(-500, -500).addv(this.pos) });
        }
        else if (d1 > 0) {
            d.rotate(0, 1).multiply(500, 500).addv(this.pos);
            this.movementHelper({ pos: d });
        }
        else if (d1 < 0) {
            d.rotate(0, -1).multiply(500, 500).addv(this.pos);
            this.movementHelper({ pos: d });
        }
    },
    
    /**
     * Movement pattern for flying over the pads, dropping turrets
     */
    pads: function() {
    
        // Turning values
        if (this.prevTurnDivider != this.turnDivider) {
            this.turnVec = new Vector(Math.cos(this.speed / this.turnDivider), Math.sin(this.speed / this.turnDivider));
            this.prevTurnDivider = this.turnDivider;
        }
    
        this.pads = this.pads || [];
    
        // Get a random pad
        if (!this.pad)
        {
            var x, y;
            do {
                x = (rand(2) + 1) * GAME_WIDTH / 3;
                y = (rand(2) + 1) * GAME_HEIGHT / 3;
            }
            while ((this.pos.x - x) * (this.pos.x - x) + (this.pos.y - y) * (this.pos.y - y) < sq(GAME_WIDTH / 8));
            this.pad = new Vector(x, y);
        }
    
        // Move towards the target pad
        this.lookTowards(this.pad, this.turnVec);
        this.move(this.forward().x * this.speed, this.forward().y * this.speed);
        
        // Drop a turret if applicable
        if (this.pos.distanceSq(this.pad) < sq(this.speed * 2)) {
            
            var occupied = false;
            for (var i = 0; i < this.pads.length; i++) {
                var t = this.pads[i];
                occupied = occupied || (t.pos.x == this.pad.x && t.pos.y == this.pad.y);
            }
            if (!occupied) {
                var turret = new Turret(
                    'padTurretTop',
                    'padTurretBase',
                    this.pad.x,
                    this.pad.y,
                    Boss.sum(),
                    125 * Enemy.pow(1.2) * players.length
                );
                turret.gunData.dy = 50;
                gameScreen.robots.push(turret);
            }
        
            this.pad = false;
        }
    },
    
    /**
     * Rotates the enemy in place
     */
    rotate: function() {
        this.rotation.rotateAngle(Math.PI / 360);
    }
};