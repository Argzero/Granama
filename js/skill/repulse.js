function SkillRepulse(player) {

    // Activate the ability on move
    player.onMove = function() {
        if (this.IsSkillCast()) {
            this.skillCd = 480;
			this.staticActive = !this.staticActive;
			
			var color1, color2;
			var thickness;
			var damage;
			
			//since the aura immediately changes, we want to 'blast away' the old one
			if(!player.staticActive)
			{
				color1 = '#0ff';
                color2 = '#06c';
				damage = this.GetDamageMultiplier() * (0.2 + 0.08 * player.upgrades[STATIC_AURA_ID]);
			}
			else
			{
				color1 = '#f0f';
                color2 = '#c06';
				damage = this.GetDamageMultiplier() * (0.2 + 0.08 * player.upgrades[POWER_AURA_ID]);
			}
			
			//thickness of waves is half that of the active aura
			thickness = player.activeRadius * .5;
			
			var shockwave = Shockwave(
				this,
				color1,
				color2,
				this.x,
				this.y,
				10,
				this.angle + Math.PI / 4,
				this.angle + 3 * Math.PI / 4,
				30,
				thickness,
				damage,
				700,
				50
			);
			
			this.bullets.push(shockwave);
		}
    }
}