// A skill that lets the player place a wall for bullets
function SkillPerfectShield(player) {

    player.perfectShield = GetImage('perfectShield');
    player.shieldAlpha = 0;

    // Update the shield on move
    player.onMove = function() {

        // Cast the skill
        if (this.IsSkillCast()) {
            this.skillDuration = 600;
            this.skillCd = 300;
            this.shieldCos = this.sin;
            this.shieldSin = -this.cos;
        }

        // Update the alpha
        if (this.skillDuration > 0) {
            this.shieldAlpha = Math.min(1, this.shieldAlpha + 0.05);
        }
        else this.shieldAlpha = Math.max(0, this.shieldAlpha - 0.05);

        // Stop bullets
        if (this.shieldAlpha > 0.5) {
            var bullets = gameScreen.enemyManager.bullets;
            for (var i = 0; i < bullets.length; i++) {
                var bullet = bullets[i];
                //target, x, y, radius, thickness, start, end
                if (arcCollides(bullet, this.x, this.y, 100, 25, Math.PI / 4 + this.angle, 3 * Math.PI / 4 + this.angle)) {
                    if (bullet.stop) {
                        bullet.stop({x: this.x + 100 * this.cos, y: this.y + 100 * this.sin});
                    }
                    else {
                        bullets.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    };

    // Draw the shield while active
    player.onDraw = function() {

        if (this.shieldAlpha) {
            canvas.translate(this.x, this.y);
            canvas.transform(this.sin, -this.cos, this.cos, this.sin, 0, 0);
            canvas.globalAlpha = this.shieldAlpha;
            canvas.drawImage(this.perfectShield, -this.perfectShield.width / 2, -this.perfectShield.height / 2 + 100);
            canvas.globalAlpha = 1;
            ResetTransform(canvas);
        }
    };
}