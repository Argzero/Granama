function SkillMedic(player) {

    // Activate the ability on move
    player.onMove = function() {
        if (this.IsSkillCast()) {
			//doesn't let Angel place another health pack if there are too many on the screen.
			if(gameScreen.dropManager.drops.length < 5)
			{
				this.skillDuration = 1;
				this.skillCd = 300;
				player.skillStarted = true;
			}
        }
    
		if(this.skillDuration > 0)
		{
			var angle = player.angle + 1/2 * Math.PI;
			var radius = 200;
			var x = 0;
			var y = 0;
				
			x = Math.cos(angle) * radius;
			y = Math.sin(angle) * radius;
			
			gameScreen.dropManager.drops.push(new Drop(x + this.x, y + this.y, HEAL, HEAL_ID));
		}
	
	}
}