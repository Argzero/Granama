function SkillTeleport(player) {
    player.onMove = function() {
    
        // Marking the return location
        if (this.IsSkillCast()) {
            this.teleX = this.x;
            this.teleY = this.y;
            this.skillDuration = TELEPORT_DURATION;
            this.skillCd = TELEPORT_CD;
        }
        
        // Teleport back to the location
        else if (this.skillDuration < TELEPORT_DURATION - 60 && KeyPressed(KEY_SPACE)) {
            this.x = this.teleX;
            this.y = this.teleY;
            this.skillDuration = 0;
        }
    };
}