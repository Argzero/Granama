function PlayerAngelType() {
    var p = BasePlayer(
        GetImage('pAngelBody'),
		16
    );
    
    // Sprites
    
    p.drawObjects.push({
        sprite: GetImage('pAngelShield'),
        xOffset: 10,
        yOffset: -25
    });
    p.drawObjects.push({
        sprite: GetImage('pAngelPrismBeam'),
        xOffset: -50,
        yOffset: -25
    });
	p.drawObjects.push({ 
        sprite: GetImage('pAngelHealingKit'), 
        xOffset: -26,
		yOffset: -45
    });
	
	// Weapon data
	p.prismData = { 
        cd: 0, 
        range: 300, 
        angle: 4, 
        dx: -26, 
        dy: 60, 
		rate: 2,
        sprite: GetImage('prismBeam'), 
        list: p.bullets,
		rotSpeed: 10
    };

    p.shootPrism = EnemyWeaponRotating;
	
	//aura variables
	p.staticActive = true;
	p.powerActive = false;
	p.skillStarted = false;
	p.activeRadius = 0;
	p.shieldBuff = 0;
	p.powerBuff = 0;
    
    // Updates the player
    p.Update = function() {
        this.UpdateBase();
        
        // Get damage multiplier
        var m = this.GetDamageMultiplier();
        var m2 = 1;
        if (this.onFire) {
            var temp = this.onFire();
            if (temp !== undefined) {
                m2 = temp;
            }
            if (!m2) {
                return;
            }
        }
		
		this.prismData.sprite = m2 > 1 ? GetImage('abilityPrismBeam') : GetImage('prismBeam');
		
		// Beam
        this.prismData.damage = m * m2 * (2 + .8 * this.upgrades[PRISM_POWER_ID]);
        this.shootPrism(this.prismData);
		
		//checks all bullets for collisions with players
		for(var i = 0; i < p.bullets.length; i++){
			//looks at all players to check collisions
			for(var k = 0; k < playerManager.players.length; k++){
				
				//here is the test player
				var player = playerManager.players[k].robot;
				
				//if the bullet collides with a player...
				if(p.bullets[i].Collides(player) && player.name != "Angel"){
				
					//and its health is less than max...
					if(player.health < player.maxHealth && player.health > 0)
					{ 
						//increase health based on beam power!
						player.health += m2 * (1 + 1 * this.upgrades[PRISM_POWER_ID]);
						
						p.bullets[i].expired = true;
						
						//but not more than max health
						if(player.health > player.maxHealth)
						{
							player.health = player.maxHealth;
						}
					}
				}
			}
		}
		
		//updates the active radius for calculations
		//then updates active Buff
		if(p.staticActive)
		{
			p.activeRadius = 100 + (20 * this.upgrades[STATIC_AURA_ID]);
			//shield recharge buff
			p.shieldBuff = 2 + 0.5 * this.upgrades[STATIC_AURA_ID];
		}
		else
		{
			p.activeRadius = 100 + (20 * this.upgrades[POWER_AURA_ID]);
			
			//power buff
			p.powerBuff = .1 + .04 * this.upgrades[POWER_AURA_ID];
		}
		
		//checks to see if allies are in aura range
		for(var k = 0; k < playerManager.players.length; k++){
		
			//here is the test player
			var player = playerManager.players[k].robot;
			
			//buffs target player if in range of aura
			if (DistanceSq(player.x, player.y, this.x, this.y) < Sq(p.activeRadius)) {
			
				if(p.staticActive)
				{
					//gives player buff, then resets their buff duration timer to full
					player.shieldRechargeBuff = p.shieldBuff;
					player.shieldRechargeBuffTimer = 60;
				}
				else
				{
					//gives player buff, then resets their buff duration timer to full
					player.damageBuff = p.powerBuff;
					player.powerBuffTimer = 60;
				}
			
			}
		}
		
		//checks to see if enemies are in aura range
		for(var k = 0; k < gameScreen.enemyManager.enemies.length; k++){
		
			//here is the test player
			var enemy = gameScreen.enemyManager.enemies[k];
			
			if (DistanceSq(enemy.x, enemy.y, this.x, this.y) < Sq(p.activeRadius)) {
			
				if(p.staticActive)
				{
					//gives enemy some slowness
					enemy.Slow(.9 - (.05 * this.upgrades[STATIC_AURA_ID]),50);
				}
				else
				{
					//gives enemies a lack of damage
					enemy.weaknessMultiplier = (1.1 + .04 * this.upgrades[POWER_AURA_ID]);
					enemy.weaknessTimer = 60;
				}
			
			}
		}
		
		//checks to see if she has just used her ability. If so, change active auras
		if(p.skillStarted)
		{
			if(p.staticActive)
			{
				p.staticActive = false;
				p.powerActive = true;
			}
			else
			{
				p.staticActive = true;
				p.powerActive = false;
			}
			p.skillStarted = false;
		}
		
    };
	
	//draws auras and wings below the player
	p.onPreDraw = function(){
		
		
		canvas.save();
		canvas.globalAlpha = 0.3;
		if(p.staticActive)
		{
			canvas.beginPath();
            canvas.arc(this.x, this.y, p.activeRadius, 0, Math.PI * 2);
            canvas.fillStyle = '#00f';
            canvas.fill();
		}
		else
		{
			canvas.beginPath();
            canvas.arc(this.x, this.y, p.activeRadius, 0, Math.PI * 2);
            canvas.fillStyle = '#f0f';
            canvas.fill();
		}
		canvas.restore();
	
	
		canvas.translate(this.x, this.y);
        canvas.transform(this.sin, -this.cos, this.cos, this.sin, 0, 0);
		
		if (p.skillDuration > 1) {
            canvas.drawImage(GetImage('pAngelAbilityWingLeft'), -87, -71);
            canvas.drawImage(GetImage('pAngelAbilityWingRight'), 7, -71);
        }

		ResetTransform(canvas);
	}
    
    return p;
}