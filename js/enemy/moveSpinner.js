GAME_WIDTH = 1748;
	GAME_HEIGHT = 813;

var SPINNER_BALL_BOUNDS = [
	{ x: 0,    y: 0,   w: 210,  h: 300, xm: 1,  ym: 1  },
	{ x: 0,    y: 513, w: 210,  h: 300, xm: 1,  ym: -1 },
	{ x: 1538, y: 0,   w: 210,  h: 300, xm: -1, ym: 1  },
	{ x: 1538, y: 513, w: 210,  h: 300, xm: -1, ym: -1 },
	{ x: 0,    y: -99, w: 1748, h: 121, xm: 1,  ym: 1  },
	{ x: 0,    y: 793, w: 1748, h: 121, xm: 1,  ym: -1 }
];

// Moves the enemy towards the player to their preferred range
function EnemyMoveSpinner() {

	this.checkBounds = this.checkBounds || EnemyMoveSpinnerBoundsCheck;

	// Movement
	var speed = this.speed;
    if (this.speedMDuration) {
        speed *= this.speedM;
    }
	this.x += this.direction.x * speed;
    this.checkBounds(true);
	this.y += this.direction.y * speed;
	this.checkBounds(false);
	
	// Entering a goal
	if (Math.abs(GAME_WIDTH / 2 - this.x) > GAME_WIDTH / 2 - 50)
	{
		gameScreen.particles.push(new RocketExplosion('Enemy', this.x, GAME_HEIGHT / 2, 200));
		this.x = GAME_WIDTH / 2;
		this.y = GAME_HEIGHT / 2;
		this.direction.x = 0;
		this.direction.y = Rand(2) * 2 - 1;
		
		// Award points
		if (this.x < GAME_WIDTH / 2) gameScreen.redScore++;
		else gameScreen.blueScore++;
	}
	
	// Looking direction
	var player = playerManager.getClosest(this.x, this.y);
	this.angle = AngleTo(player, this);
    this.cos = -Math.sin(this.angle);
    this.sin = Math.cos(this.angle);
	
	// Collision
	for (var i = 0; i < playerManager.players.length; i++) {
		var player = playerManager.players[i].robot;
		if (player.health > 0 && BulletCollides(this, player)) {
			this.direction = Vector(this.x - player.x, this.y - player.y);
			this.direction.SetLength(1);
			player.Damage(this.damage, this);
			
			var knockback = Vector(-this.direction.x, -this.direction.y);
			knockback.x *= this.distance;
			knockback.y *= this.distance;
			player.Knockback(knockback.x, knockback.y);
		}
	}
}

function EnemyMoveSpinnerBoundsCheck(horizontal) {
	var speed = this.speed;
    if (this.speedMDuration) {
        speed *= this.speedM;
    }
	for (var i = 0; i < SPINNER_BALL_BOUNDS.length; i++)
	{
		var b = SPINNER_BALL_BOUNDS[i];
		if (this.x - this.sprite.width / 2 < b.x + b.w && this.x + this.sprite.width / 2 > b.x
				&& this.y - this.sprite.height / 2 < b.y + b.h && this.y + this.sprite.height / 2 > b.y)
		{
			if (horizontal)
			{
				this.x -= this.direction.x * speed
				this.direction.x = b.xm * Math.abs(this.direction.x);
			}
			else
			{
				this.y -= this.direction.y * speed
				this.direction.y = b.ym * Math.abs(this.direction.y);
			}
			return true;
		}
	}
	return false;
}