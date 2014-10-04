function SkillBlink(player) {
	player.onMove = function() {
        if (this.IsSkillCast()) {
            var blinkX = 0;
            var blinkY = 0;
            if (KeyPressed(KEY_D)) {
                blinkX += BLINK_DISTANCE;
            }
            if (KeyPressed(KEY_A)) {
                blinkX -= BLINK_DISTANCE;
            }
            if (KeyPressed(KEY_W)) {
                blinkY -= BLINK_DISTANCE;
            }
            if (KeyPressed(KEY_S)) {
                blinkY += BLINK_DISTANCE;
            }
            if (blinkX != 0 && blinkY != 0) {
                blinkX *= HALF_RT_2;
                blinkY *= HALF_RT_2;
            }
            if (blinkX != 0 || blinkY != 0) {
                this.x += blinkX;
                this.y += blinkY;
                this.skillCd = BLINK_CD;
            }
        }
	};
}