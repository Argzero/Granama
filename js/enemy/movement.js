var movement = {

	/**
	 * Helper function for moving towards a target
	 */
	moveTowards: function(target) {
	
		// Turning values
        this.turnVec = this.turnVec || new Vector(Math.cos(this.speed / this.turnDivider), Math.sin(this.speed / this.turnDivider));

        // Turn towards the player
        if (this.backwards) this.lookAway(target.pos, this.turnVec);
        else this.lookTowards(target.pos, this.turnVec);

        // Get the direction to move
        var forward = this.forward();
        var m = forward.dot(this.pos.clone().subtractv(target.pos)) > 0 ? -1 : 1;

        // Move the enemy to their preferred range
        var speed = this.get('speed');
        var dSq = this.pos.distanceSq(target.pos);
        if (dSq - sq(this.range + speed) > 0) {
            this.move(forward.x * m * speed, forward.y * m * speed);
        }
        else if (dSq - sq(this.range - speed) < 0) {
            this.move(forward.x * m * speed / 3, forward.y * m * speed / 3);
        }
	},

    /**
     * Basic movement pattern which moves towards the player up until the
     * preferred range and moving away when too close.
     */
    basic: function() {
		this.movementHelper = movement.moveTowards;
		this.movementHelper(playerManager.getClosest(this.pos));
    },

    /**
     * Movement pattern that moves in a straight line, bouncing off walls or players
     */
    bounce: function() {

        // Movement
        var speed = this.get('speed');
        this.x += this.direction.x * speed;
        this.y += this.direction.y * speed;

        // Looking direction
        var player = playerManager.getClosest(this.pos);
        this.lookAt(player.pos);

        // Bounds
        if (this.xMin() <= 0) {
            this.direction.x = Math.abs(this.direction.x);
        }
        if (this.xMax() >= game.width) {
            this.direction.x = -Math.abs(this.direction.x);
        }
        if (this.yMin() < 0) {
            this.direction.y = Math.abs(this.direction.y);
        }
        if (this.yMax() > game.height) {
            this.direction.y = -Math.abs(this.direction.y);
        }

        // Collision
        if (player.health > 0 && this.collides(player)) {
            this.direction = this.pos.clone().subtractv(player.pos).normalize();
            player.damage(this.damage, this);

            var knockback = this.direction.multiply(-this.distance, -this.distance);
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
            if (this.xMin() < 0 || this.xMax() > game.width || this.yMin() < 0 || this.yMax() > game.height) {
                this.charging = 0;
            }

            // Collision
            for (var i = 0; i < playerManager.players.length; i++) {
                var player = playerManager.players[i].robot;
                if (player.health > 0 && this.collides(player)) {
                    var direction = player.pos.clone().subtractv(this.pos);
                    var dot = this.rotation.dot(direction);
                    if (dot > 0) {
                        player.knockback(this.rotation.x * this.distance, this.rotation.y * this.distance);
                    }
                    else {
                        player.knockback(-this.rotation.x * this.distance, -this.rotation.y * this.distance);
                    }
                    player.damage(this.damage, this);
                }
            }
        }

        // Normal movement otherwise
        else {

            this.subMovement = movement.basic;
            this.subMovement();

            // Charge when in range
            if (this.forward().dot(playerManager.getClosest(this.pos).pos.clone().subtractv(this.pos).normalize()) > 0.995) {
                this.charging = this.chargeDuration;
            }
        }
    },

    /**
     * Movement for flying around the map and staying around players
     */
    flying: function() {

        // Turning values
        this.turnVec = this.turnVec || new Vector(Math.cos(this.speed / this.turnDivider), Math.sin(this.speed / this.turnDivider));

        // Turn towards the player or the center if too close to an edge
        var target;
        var padding = 400;
        if (this.pos.x < padding || this.pos.x > game.width - padding || this.pos.y < padding || this.pos.y > game.height - padding) {
            target = new Vector(game.width / 2, game.height / 2);
        }
        else {
            var player = playerManager.getClosest(this.pos);
            if (this.pos.distanceSq(player.pos) > sq(this.turnRange || padding)) {
                target = player;
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
        var target = new Vector(game.width / 2, game.height / 2);
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
		if (this.forcedTarget) {
			target = this.forcedTarget;
			dSq = target.pos.distanceSq(this.pos);
		}
		else {
			for (var i = 0; i < enemyManager.enemies.length; i++) {
				var e = enemyManager.enemies[i];
				if (e == this || e.health >= e.maxHealth || e.speed > this.speed) continue;
				var temp = e.pos.distanceSq(this.pos);
				if (!dSq || ((!e.heal || target.heal) && temp < dSq)) {
					dSq = temp;
					target = e;
				}
			}
		}

		// Move randomly when there's no targets to heal
		if (!target) {
			while (!this.backup || this.pos.distanceSq(this.backup) < sq(this.range + 100)) {
				this.backup = new Vector(rand(game.width), rand(game.height));
			}
			target = this.backup;
		}

		// Heal the enemy if close enough
		else if (dSq <= Sq(this.range + 10)) {
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
		var player = playerManager.getClosest(this.pos);
		var ds = this.pos.distanceSq(player.pos);
		var tooFar = ds > sq(this.range + 100);
		var tooClose = ds < sq(this.range - 100);

		// Turn towards the player
		var d = player.pos.clone().subtractv(this.pos);
		var d1 = this.rotation.dot(d);
		var d2 = this.forward().dot(d);

		// Turn in the correct direction
		this.movementHelper = movement.moveTowards;
		if (tooFar || tooClose) {
			this.movementHelper(player);
		}
		else if (d1 < 0) {
			this.movementHelper({ pos: this.pos.clone().addv(d.rotate(0, 1)) });
		}
		else {
			this.movementHelper({ pos: this.pos.clone().addv(d.rotate(0, -1)) });
		}
	}
};