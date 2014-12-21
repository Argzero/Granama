function SkillAngelicAssault(player) {

    // Activate the ability on move
    player.onMove = function(speed) {
        if (this.IsSkillCast()) {
            this.skillDuration = 300;
            this.skillCd = 240;
			this.revSpeed = 1/100;
			this.staticActive = !this.staticActive;
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