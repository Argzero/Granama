function SkillOverdrive(player) {
    player.onMove = function(speed) {
    
        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillDuration = 300;
            this.skillCd = 900 * this.cdm;
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
                    var fire = FireProjectile(
                        GetImage('abilityFire'),
                        this,
                        0,
                        0, 
                        velX, 
                        velY, 
                        oppositeAngle, 
                        FIRE_DAMAGE, 
                        200
                    );
                    this.bullets.push(fire);
                }
            }
            
            // Double the speed
            return speed * 2;
        }
    };
}