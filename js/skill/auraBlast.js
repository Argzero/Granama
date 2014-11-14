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
			var color1;
			var thickness;
			var damage;
			
			//since the aura immediately changes, we want to 'blast away' the old one
			if(player.staticActive)
			{
				color1 = '#0ff';
				damage = this.GetDamageMultiplier() + (.1 * player.upgrades[STATIC_AURA_ID]);
			}
			else
			{
				color1 = '#0ff';
				damage = this.GetDamageMultiplier() + (.1 * player.upgrades[POWER_AURA_ID]);
			}
			
			//thickness of waves is half that of the active aura
			thickness = player.activeRadius * .5;
			
			for (var i = 0; i < 2; i++) 
			{
				var shockwave = Shockwave(
					this,
					color1,
					color1,
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