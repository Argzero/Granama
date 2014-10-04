function SkillOverdrive(player) {
    player.onMove = function(speed) {
    
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillDuration = OVERDRIVE_DURATION;
            this.skillCd = OVERDRIVE_CD;
        }
        
        // Effects while active
        if (this.skillDuration > 0) {
        
            // Fire behind the player
            if (this.skillDuration % FIRE_CD == 0) {
                
                var oppositeAngle;
                var velX = 0;
                var velY = 0;
                if (KeyPressed(KEY_D)) {
                    oppositeAngle = HALF_PI;
                    velX = -5;
                }
                if (KeyPressed(KEY_A)) {
                    oppositeAngle = -HALF_PI;
                    velX = 5;
                }
                if (KeyPressed(KEY_W)) {
                    oppositeAngle = 0;
                    velY = 5;
                }
                if (KeyPressed(KEY_S)) {
                    oppositeAngle = Math.Pi;
                    velY = -5;
                }
                if (velX != 0 && velY != 0) {
                    velX *= HALF_RT_2;
                    velY *= HALF_RT_2;
                }
                
                if (velX != 0 || velY != 0) {
                    var range = 200;
                    var fire = new Fire(this.x, this.y, velX, velY, oppositeAngle, FIRE_DAMAGE, range);
                    fire.sprite = GetImage('abilityFire');
                    this.bullets[this.bullets.length] = fire;
                }
            }
            
            // Double the speed
            return speed * 2;
        }
    };
}