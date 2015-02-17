/**
 * Sets up the Perfect Shield ability for a player
 */
function skillPerfectShield(player) {

    player.perfectShield = new Sprite('perfectShield', 0, 100).child(player, true);
    player.postChildren.push(player.perfectShield);
    player.arc = new Arc(new Vector(0, 0), 100, 25, -Math.PI / 4, Math.PI / 4);
    player.arc.initialStart = player.arc.startTrig.clone();
    player.arc.initialEnd = player.arc.endTrig.clone();

    /**
     * Updates the skill each frame, applying activation
     * and destroying hostile bullets that come in contact
     * with the activated shield.
     */
    player.onUpdate = function() {

        // Cast the skill
        if (this.isSkillCast()) {
            this.skillDuration = 600;
            this.skillCd = 300;
            this.shieldCos = this.sin;
            this.shieldSin = -this.cos;
        }

        // Update the alpha
        if (this.skillDuration > 0) {
            this.perfectShield.alpha = Math.min(1, this.perfectShield.alpha + 0.05);
        }
        else this.perfectShield.alpha = Math.max(0, this.perfectShield.alpha - 0.05);

        // Stop bullets
        if (this.perfectShield.alpha > 0.5) {
            var bullets = gameScreen.bullets;
            this.arc.pos.x = this.x;
            this.arc.pos.y = this.y;
            this.arc.startTrig.x = this.arc.initialStart.x;
            this.arc.startTrig.y = this.arc.initialStart.y;
            this.arc.endTrig.x = this.arc.initialEnd.x;
            this.arc.endTrig.y = this.arc.initialEnd.y;
            this.arc.startTrig.rotate(this.rotation.x, this.rotation.y);
            this.arc.endTrig.rotate(this.rotation.x, this.rotation.y);
            for (var i = 0; i < bullets.length; i++) {
                var bullet = bullets[i];
                if ((bullet.group & Robot.PLAYER) && this.arc.collides(bullet)) {
                    bullet.block();
                }
            }
        }
    };
}