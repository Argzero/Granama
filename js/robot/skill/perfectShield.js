/**
 * Sets up the Perfect Shield ability for a player
 */
function skillPerfectShield(player) {

    player.perfectShield = new Sprite('perfectShield', 0, 100).child(player, true);
    player.perfectShield.alpha = 0;
    player.perfectShield.hidden = true;
    player.postChildren.push(player.perfectShield);

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
        this.perfectShield.hidden = this.perfectShield.alpha === 0;

        // Stop bullets
        if (this.perfectShield.alpha > 0.5) {
            
            // Update the arc
            var angle = this.getAngle() + Math.PI / 4;
            var arc = new Arc(this.pos, 100, 25, angle, angle + Math.PI / 2);
            
            // Check bullet collision
            var bullets = gameScreen.bullets;
            for (var i = 0; i < bullets.length; i++) {
                var bullet = bullets[i];
                var type = bullet.group & this.type;
                var collides = arc.collides(bullet);
                if (type && collides) {
                    bullet.block();
                }
            }
        }
    };
}