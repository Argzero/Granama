function SkillTeleport(player) {
    player.onMove = function() {

        // Marking the return location
        if (this.IsSkillCast()) {
            this.teleX = this.x;
            this.teleY = this.y;
            this.skillDuration = 1800;
            this.skillCd = 600 * this.cdm;
        }

        // Teleport back to the location
        else if (this.skillDuration < 1740 && KeyPressed(KEY_SPACE)) {
            this.x = this.teleX;
            this.y = this.teleY;
            this.skillDuration = 0;
        }
    };
}