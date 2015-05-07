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
    this.extra = { direction: this.direction };

    this.back = new SpinnerBack(back, this, spin, fire, this.power / 16).child(this, false);
    this.preChildren.push(this.back);
    
    // Update back regularly
    this.onUpdate = function() {
        this.back.update();
    };
}

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
        /* fire        */ true,
		/* fire damage */ 0.5 * Enemy.sum()
    );

    this.pierceDamage = 0.4;
}

// Solars don't care about anything
Solar.prototype.subUpdate = function() { };
Solar.prototype.stun = function() { };
Solar.prototype.knockback = function() { };

/**
 * A back piece to a spinner
 *
 * @param sprite - the name of the sprite of the back piece
 * @param source - the enemy owning the back piece
 * @param angle  - the angle to rotate each frame
 * @param fire   - whether or not to spew fire 
 * @param damage - the damage of the fire
 *
 * @constructor
 */
extend('SpinnerBack', 'Sprite');
function SpinnerBack(sprite, source, angle, fire, damage) {
    this.super(sprite, source.x, source.y);
    this.source = source;
    this.cos = Math.cos(angle);
    this.sin = Math.sin(angle);
    this.fire = fire;
    this.power = damage;
    this.fireCd = 0;
}

/**
 * Launches fire and rotates each update
 */
SpinnerBack.prototype.update = function() {

    // Launch fire when not paused
    if (!game.paused) {
        this.rotate(this.cos, this.sin);

        if (this.fire && this.power && this.fireCd <= 0) {
            var offset = new Vector(0, this.width / 2);
            offset.rotate(HALF_RT_2, HALF_RT_2);
            for (var i = 0; i < 4; i++) {
                var fire = new Projectile(
                    /* Sprite */ 'bossFlame',
                    /* Offset */ offset.x, offset.y,
                    /* Source */ this.source, this,
                    /* Speed  */ 5,
                    /* Angle  */ i * Math.PI / 2 + Math.PI / 4,
                    /* Damage */ this.power,
                    /* Range  */ 50,
                    /* Pierce */ true,
                    /* Target */ Robot.PLAYER
                );
                fire.onUpdate = projEvents.fireUpdate;
                fire.updateName = 'fireUpdate';
                gameScreen.bullets.push(fire);
                offset.rotate(0, 1);
            }
            this.fireCd = 2;
        }
        else if (this.fireCd > 0) {
            this.fireCd--;
        }
    }
};