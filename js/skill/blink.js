function SkillBlink(player) {
	player.onMove = function() {
        if (this.IsSkillCast()) {
            var blinkX = 0;
            var blinkY = 0;
            if (KeyPressed(KEY_D)) {
                blinkX += 300;
            }
            if (KeyPressed(KEY_A)) {
                blinkX -= 300;
            }
            if (KeyPressed(KEY_W)) {
                blinkY -= 300;
            }
            if (KeyPressed(KEY_S)) {
                blinkY += 300;
            }
            if (blinkX != 0 && blinkY != 0) {
                blinkX *= HALF_RT_2;
                blinkY *= HALF_RT_2;
            }
            if (blinkX != 0 || blinkY != 0) {
                this.x += blinkX;
                this.y += blinkY;
                this.skillCd = 360 * this.cdm;
            }
        }
	};
}