function SkillAngelicAssault(player) {

    // Activate the ability on move
    player.onMove = function(speed) {
        if (this.IsSkillCast()) {
            this.skillDuration = 600;
            this.skillCd = 300;
			this.revSpeed = 1/100;
			player.skillStarted = true;
        }
		
		if (this.skillDuration > 0) {
            // increase the speed slightly
            return speed * 1.5;
        }
		else
		{
			this.revSpeed = 1/300;
		}
    }
    
    // Damage multiplier when active
    player.onFire = function() {
        if (this.skillDuration > 0) {
            return 2;
        }
    }
}