/**
 * Sets up the Targeter skill for a player which shoots a target
 * to apply a mark on them, causing drones to get increased range
 * and focus that target while it takes double damage
 */
function skillTargeter(player) {

    /** 
     * Handles casting the skill and applying drone buffs
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            this.skillCd = 600;

            // Fire the missile
            var missile = new Projectile(
                'targeterMissile',
                0, 0,
                this, this,
                20,
                0,
                5 * this.get('power'),
                999,
                false,
                Robot.ENEMY
            );
            missile.onHit = targeterProjectileHit;
            gameScreen.bullets.push(missile);
        }

        // Increases drone range while active
        this.droneRangeM = this.skillDuration > 0 ? 1.5 : 1;

        // Expired particle means to stop the skill effects
        if (this.skillDuration > 0 && this.particle.expired) {
            this.skillDuration = 0;
        }
    };
}

TARGET_LIFESPAN = 600;
TARGET_INFECT_RADIUS = 600;

/**
 * Along with the damage, the targeter projectile also
 * marks the target and causes them to take double damage.
 */
function targeterProjectileHit(target) {
    this.shooter.skillDuration = TARGET_LIFESPAN;
    this.shooter.particle = new TargeterParticle(target);
    target.buff('defense', 2, TARGET_LIFESPAN);
    gameScreen.particles.push(this.shooter.particle);
}

/**
 * The particle used by the Targeter ability
 *
 * @param {Robot} target - the target to mark
 *
 * @constructor
 */
extend('TargeterParticle', 'Sprite');
function TargeterParticle(target) {
    this.super('pCommandoTarget', target.pos.x, target.pos.y);
       
    this.pos = target.pos;
    this.target = target,
    this.lifespan = TARGET_LIFESPAN,
    this.updateSize();
}

/**
 * Updates the size of the particle to match its target's size
 */
TargeterParticle.prototype.updateSize = function() {
    var w = 0.9 * this.target.width;
    var h = 0.9 * this.target.height;
    var s = Math.min(w, h);
    this.setScale(s / this.width, s / this.height);
}

/**
 * Updates the particle, changing size and switching targets
 * as needed such as when the current target dies
 */
TargeterParticle.prototype.update = function() {

    this.pos = this.target.pos;

    // Switching targets when the current dies
    if (this.target.dead) {
        var newTarget = gameScreen.getClosest(this.target.pos, Robot.ENEMY);
        if (newTarget && this.target.pos.distanceSq(newTarget.pos) < sq(TARGET_INFECT_RADIUS)) {
            this.target = newTarget;
            this.lifespan = TARGET_LIFESPAN;
            newTarget.buff('defense', 2, TARGET_LIFESPAN);
            this.updateSize();
        }
        else {
            this.expired = true;
            return;
        }
    }

    // Expiring after an amount of time
    this.lifespan--;
    if (this.lifespan <= 0) {
        this.expired = true;
    }
}