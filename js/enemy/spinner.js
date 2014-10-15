function EnemySpinner(sprite, source, angle, fire, damage) {
	return {
		sprite: sprite,
		source: source,
		cos: Math.cos(angle),
		sin: Math.sin(angle),
		rotAngle: angle,
		angle: 0,
		fire: fire,
		damage: damage,
		fireCd: 0,
		direction: Vector(1, 0),
		
		draw: function() {
		
            if (!gameScreen.paused) {
                this.angle += this.rotAngle;
                this.direction.Rotate(this.cos, this.sin);
                
                if (this.fire && this.fireCd == 0) {
                    var fireDir = Vector(0, 1);
                    var fireVel = Vector(this.direction.x, this.direction.y);
                    fireDir.Rotate(HALF_RT_2, HALF_RT_2);
                    fireVel.Rotate(HALF_RT_2, HALF_RT_2);
                    for (var i = 0; i < 4; i++) {
                    //sprite, source, x, y, velX, velY, angle, damage, range
                        var fire = FireProjectile(
                            GetImage('bossFlame'),
                            this.source,
                            fireDir.x * this.sprite.width / 2,
                            fireDir.y * this.sprite.height / 2, 
                            BULLET_SPEED * fireVel.x,
                            BULLET_SPEED * fireVel.y,
                            this.angle,
                            this.damage, 
                            100
                        );
                        gameScreen.enemyManager.bullets.push(fire);
                        fireDir.Rotate(0, 1);
                        fireVel.Rotate(0, 1);
                    }
                    this.fireCd = 2;
                }
                else if (this.fireCd > 0) {
                    this.fireCd--;
                }
            }
		
			canvas.save();
			ResetTransform(canvas);
			canvas.translate(this.source.x, this.source.y);
			canvas.transform(this.direction.x, this.direction.y, -this.direction.y, this.direction.x, 0, 0);
			canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
			canvas.restore();
		}
	}
}