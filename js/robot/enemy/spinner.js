/**
 * An enemy that bounces off walls and can collide with players for damage
 *
 * @param {string}  name         - name of the enemy sprite image
 * @param {number}  x            - initial horizontal position
 * @param {number}  y            - initial vertical position
 * @param {Number}  type         - robot type ID of the enemy (should be Robot.MOB)
 * @param {number}  health       - max health
 * @param {number}  speed        - movement speed
 * @param {number}  range        - attack range
 * @param {number}  exp          - experience yield
 * @param {string}  rank         - difficulty rank
 * @param {number}  [patternMin] - minimum time between switching attack patterns
 * @param {number}  [patternMax] - maximum time between switching attack patterns
 * @param {number}  damage       - damage dealt by mines or turrets
 * @param {number}  distance     - how far the spinner pushes players on collision
 * @param {string}  back         - the sprite image name for the spinner's back
 * @param {number}  spin         - the spin speed of the spinner's back
 * @param {boolean} fire         - whether or not to spew fire
 *
 * @constructor
 */
extend('Spinner', 'Enemy');
function Spinner(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax, damage, distance, back, spin, fire) {
    this.super(name, x, y, health, speed, range, exp, rank, patternMin, patternMax);
    this.movement = movement.bounce;
    this.scale = 1;
    this.power = damage * Enemy.sum();
    this.distance = distance;

    var angle = rand(0, 360) * Math.PI / 180;
    this.direction = new Vector(Math.cos(angle), Math.sin(angle));

    this.back = new SpinnerBack(back, this, spin, fire, this.power / 16);
}

/**
 * Draws the back of a spinner before the spinner itself
 *
 * @param {Camera} camera - camera to draw to
 */
Spinner.prototype.onPreDraw = function(camera) {
    this.back.draw(camera);
};

/**
 * Changes the direction of a spinner when knocked back
 *
 * @param {Vector} knockback - the new direction for the spinner
 */
Spinner.prototype.knockback = function(knockback) {
    if (knockback.lengthSq() > 0) {
        this.direction = knockback.normalize();
    }
};

/**
 * A light spinner enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightSpinner', 'Spinner');
function LightSpinner(x, y) {
    this.super(
        /* sprite name */ 'enemyLightSpinner',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 60 * Enemy.pow(0.9),
        /* speed       */ 5 + 0.3 * gameScreen.bossCount,
        /* range       */ 0,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* damage      */ 4,
        /* distance    */ 150,
        /* back        */ 'enemyLightSpinnerBack',
        /* spin        */ Math.PI / 15,
		/* fire        */ false
    );
}

/**
 * A heavy spinner enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavySpinner', 'Spinner');
function HeavySpinner(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavySpinner',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 80 * Enemy.pow(0.9),
        /* speed       */ 5 + 0.3 * gameScreen.bossCount,
        /* range       */ 0,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* damage      */ 6,
        /* distance    */ 200,
        /* back        */ 'enemyHeavySpinnerBack',
        /* spin        */ Math.PI / 30,
		/* fire        */ false
    );

    this.pierceDamage = 0.5;
}

/**
 * A spinner miniboss that spews fire around itself as it travels
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('Solar', 'Spinner');
function Solar(x, y) {
    this.super(
        /* sprite name */ 'enemySolar',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 200 * Enemy.pow(1.1),
        /* speed       */ 5 + 0.3 * gameScreen.bossCount,
        /* range       */ 0,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* damage      */ 8,
        /* distance    */ 300,
        /* back        */ 'enemySolarBack',
        /* spin        */ Math.PI / 30,
		/* fire        */ true
    );

    this.pierceDamage = 0.5;
    this.back.fire = true;
    this.back.damage = 0.5 * Enemy.sum();
}

/**
 * A back piece to a spinner
 *
 * @param sprite
 * @param source
 * @param angle
 * @param fire
 * @param damage
 * @constructor
 */
extend('SpinnerBack', 'Sprite');
function SpinnerBack(sprite, source, angle, fire, damage) {
    this.super(sprite, source.x, source.y, source, true, false);
    this.sprite = sprite;
    this.source = source;
    this.cos = Math.cos(angle);
    this.sin = Math.sin(angle);
    this.fire = fire;
    this.damage = damage;
    this.fireCd = 0;
}

/**
 * Launches fire and rotates each draw cycle
 *
 * @param {Camera} camera - camera being drawn to
 */
SpinnerBack.prototype.onDraw = function(camera) {

    // Launch fire when not paused
    if (!game.paused) {
        this.rotate(this.cos, this.sin);

        if (this.fire && this.damage && this.fireCd <= 0) {
            var fireDir = this.rotation.clone();
            var fireVel = this.forward().multiply(10, 10);
            fireDir.rotate(HALF_RT_2, HALF_RT_2);
            fireVel.rotate(HALF_RT_2, HALF_RT_2);
            var firePos = this.source.pos.clone().addv(fireVel.clone().multiply(this.sprite.width / 20, this.sprite.width / 20));
            for (var i = 0; i < 4; i++) {
                var fire = new Fire(
                    'bossFlame',
                    this.source,
                    firePos.clone(),
                    fireVel.clone(),
                    fireDir.clone(),
                    this.damage,
                    100
                );
                gameScreen.bullets.push(fire);
                fireDir.rotate(0, 1);
                fireVel.rotate(0, 1);
                firePos.rotateAround(this.source.pos.x, this.source.pos.y, 0, 1);
            }
            this.fireCd = 2;
        }
        else if (this.fireCd > 0) {
            this.fireCd--;
        }
    }
};