/**
 * Sets up the Piercing Arrow ability which damages and
 * drags enemies along with it 
 */
function skillPiercingArrow(player) {

    /**
     * Updates the ability each frame, firing the arrow
     * upon casting the skill
     */ 
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            this.skillCd = 360;
            var arrow = new Projectile(
                'abilityArrow',
                0, 40,
                this, this,
                15,
                0,
                this.get('power') * 20,
                1249,
                true,
                Enemy.MOBILE
            );
            arrow.buffs.push({ name: 'speed', multiplier: 0.5, duration: 300 });
            arrow.onUpdate = piercingArrowUpdate;
            arrow.n1 = new Vector(-this.sin * COS_60 - this.cos * SIN_60, -this.sin * SIN_60 + this.cos * COS_60);
            arrow.n2 = new Vector(this.sin * COS_60 - this.cos * SIN_60, -this.sin * SIN_60 - this.cos * COS_60);
            arrow.n3 = this.forward();
            arrow.n2 = arrow.n3.clone().rotate(COS_60, -SIN_60).multiply(-1, -1);
            arrow.n1 = arrow.n3.clone().rotate(COS_60, SIN_60);
            gameScreen.bullets.push(arrow);
        }
    }
}

// Amount of knockback to use for the arrow
var PA_KNOCKBACK = 200;

/** 
 * Updates the piercing arrow, draging along all nearby enemies
 */
function piercingArrowUpdate() {
    for (var i = 0; i < gameScreen.robots.length; i++) {
        var target = gameScreen.robots[i];
        if ((target & Enemy.MOBILE) && target.pos.distanceSq(this.pos) < 90000) {
            var rel = this.vel.clone().multiply(5, 5).addv(target.pos).subtractv(this.pos);
            if (rel.dot(this.n1) > 0 && rel.dot(this.n2) > 0) {
                if (rel.dot(this.n3) > 0) {
                    target.knockback(-PA_KNOCKBACK * this.n1.x, -PA_KNOCKBACK * this.n1.y);
                }
                else {
                    target.knockback(-PA_KNOCKBACK * this.n2.x, -PA_KNOCKBACK * this.n2.y);
                }
            }
        }
    }
    this.updateBase();
}