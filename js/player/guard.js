function PlayerGuard(team) {
    var p = BasePlayer(
        GetImage('sbGuard' + team),
		30
    );
	
	p.team = team;
	p.spinnerBall = true;
	p.x = (team == 'Blue' ? GAME_WIDTH / 4 : GAME_WIDTH * 0.75);
	
	// Weapon data
	/*
	p.punchData = { 
        cd: 0, 
        range: 499, 
        dx: -30, 
        dy: 45, 
		damage: 0,
		rate: 30,
        sprite: GetImage('sbDisk' + team), 
        list: p.bullets 
    };
    p.Shoot = EnemyWeaponGun;
	*/
	
	// Updates the player
    p.Update = function() {
        if (this.UpdateBase()) {
            return;
        }
		
		return;
		
		// Disc gun
		this.Shoot(this.diskData);
	}
	
    return p;
}