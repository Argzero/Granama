function BasePlayer(x, y) {
	return {
	
		// Events
		onDamaged: undefined,
		onUpdate: undefined,
		onDraw: undefined,
	
		// Fields
		x: x,
		y: y,
		skillCd: 0,
		skillActive: false,
		angle: 0,
		shield: 0,
		shieldCd: SHIELD_RATE,
		cos: 0,
		sin: 1,
		sprite: undefined,
		speed: PLAYER_SPEED,
		health: PLAYER_HEALTH,
		maxHealth: PLAYER_HEALTH,
		bullets: [],
		upgrades: [0, 0, 0, 0, 0, 0, 0, 0],
		
		// Damages the player using an optional damage source
		Damage: function(amount, damager) {
			
			// Damage event
			if (this.onDamaged) {
				amount = this.onDamaged(amount, damager);
			}
			
			// Deduct shield damage
			if (this.shield > 0) {
				if (this.shield > amount) {
					this.shield -= amount;
					amount = 0;
				}
				else {
					amount -= this.shield;
					this.shield = 0;
				}
			}
			
			// Health damage
			if (amount) {
				this.health -= amount;
			}
		}
		
		// Updates the player
		Update: function() {
	
			// Shield regeneration
			if (this.upgrades[SHIELD_ID] > 0) {
				this.shieldCd--;
				if (this.shieldCd <= 0) {
					this.shieldCd += SHIELD_RATE - this.upgrades[SHIELD_ID] * SHIELD_SCALE;
					this.shield += this.maxHealth * SHIELD_GAIN;
					if (this.shield > this.maxHealth * SHIELD_MAX) {
						this.shield = this.maxHealth * SHIELD_MAX;
					}
				}
			}
			
			// Update bullets
			for (var i = 0; i < this.bullets.length; i++) {
				if (!this.bullets[i]) {
					this.bullets.splice(i, 1);
					i--;
				}
				this.bullets[i].Update();
				if (DistanceSq(this.bullets[i].ox, this.bullets[i].oy, this.bullets[i].x, this.bullets[i].y) > Sq(this.bullets[i].range) || !WithinScreen(this.bullets[i])) {
					this.bullets.splice(i, 1);
					i--;
				}
			}
			
			// Update event
			var speed = this.speed;
			if (this.onUpdate) {
				speed = this.onUpdate();
				if (!speed) {
					return;
				}
			}
			
			//Player's ability
			if (this.skillCd > 0 && this.skillActive == false)
			{
				this.skillCd--;
			}
			
			// Update the player's angle
			var a = Math.atan((mouseY - this.y) / (this.x - mouseX));
			if (this.x < mouseX) {
				this.angle = -HALF_PI - a;
			}
			else {
				this.angle = HALF_PI - a;
			}
			this.cos = c;
			this.sin = s;
			
			// Movement
			var hor = KeyPressed(KEY_D) != KeyPressed(KEY_A);
			var vert = KeyPressed(KEY_W) != KeyPressed(KEY_S);
			var m = (this.ability == OVERDRIVE && this.abilityActive == true) ? 2 : 1;
			if (KeyPressed(KEY_W)) {
				this.y -= speed * (hor ? HALF_RT_2 : 1) * m;
			}
			if (KeyPressed(KEY_S)) {
				this.y += speed * (hor ? HALF_RT_2 : 1) * m;
			}
			if (KeyPressed(KEY_A)) {
				this.x -= speed * (vert ? HALF_RT_2 : 1) * m;
			}
			if (KeyPressed(KEY_D)) {
				this.x += speed * (vert ? HALF_RT_2 : 1) * m;
			}
			
			// Bounding
			if (this.XMin() < 0) {
				this.x += -this.XMin();
			}
			if (this.XMax() > GAME_WIDTH) {
				this.x -= this.XMax() - GAME_WIDTH;
			}
			if (this.YMin() < 0) {
				this.y += -this.YMin();
			}
			if (this.YMax() > GAME_HEIGHT) {
				this.y -= this.YMax() - GAME_HEIGHT;
			}
		}
		
		// Draws the player and its bullets
		Draw: function(canvas) {
		
			// Draw bullets
			for (var i = 0; i < this.bullets.length; i++) {
				this.bullets[i].Draw(canvas);
			}
			
			// Draw event
			if (this.onDraw) {
				this.onDraw();
			}
		}
	}
}