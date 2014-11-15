function SkillAuraBlast(player) {

    // Activate the ability on move
    player.onMove = function() {
        if (this.IsSkillCast()) {
            this.skillDuration = 1;
            this.skillCd = 480;
			player.skillStarted = true;
        }
		
		if(this.skillDuration > 0)
		{
			var color1, color2;
			var thickness;
			var damage;
			
			//since the aura immediately changes, we want to 'blast away' the old one
			if(player.staticActive)
			{
				color1 = '#0ff';
                color2 = '#06c';
				damage = this.GetDamageMultiplier() * (2 + .2 * player.upgrades[STATIC_AURA_ID]);
			}
			else
			{
				color1 = '#f0f';
                color2 = '#c06';
				damage = this.GetDamageMultiplier() * (2 + .2 * player.upgrades[POWER_AURA_ID]);
			}
			
			//thickness of waves is half that of the active aura
			thickness = player.activeRadius * .5;
			
			for (var i = 0; i < 2; i++) 
			{
				var shockwave = Shockwave(
					this,
					color1,
					color2,
					this.x,
					this.y,
					10,
					Math.PI * i,
					Math.PI * (i + 1),
					30,
					thickness,
					damage,
					700,
					0
				);
				
				this.bullets.push(shockwave);
			}
		}
    }
}