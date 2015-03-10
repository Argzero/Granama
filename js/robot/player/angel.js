// Load in ability scripts
depend('robot/skill/angelicAssault');
depend('robot/skill/auraBlast');
depend('robot/skill/repulse');

/**
 * The commando player that uses an LMG 
 * and drones as its primary weapons.
 *
 * @constructor
 */
extend('PlayerAngel', 'Player');
function PlayerAngel() {
    //         Sprite Name   X  Y  Type          HP   Speed  HP+  Damage+  Shield+  Speed+
    this.super('pAngelBody', 0, 0, Robot.PLAYER, 100, 3,     16,  1,       1,       1);

    // Angel revives slightly faster normally
    this.revBase = this.revSpeed = 1 / 250;
    
    // Hidden sprites
    this.leftWing = new Sprite('pAngelAbilityWingLeft', -54, -60).child(this, true);
    this.rightWing = new Sprite('pAngelAbilityWingRight', 54, -60).child(this, true);
    this.leftWing.hidden = true;
    this.rightWing.hidden = true;
    
    // Sprites drawn behind the robot's body
    this.preChildren.push(this.leftWing, this.rightWing);
    
    // Sprites drawn on top of the robot's body
    this.postChildren.push(
        new Sprite('pAngelShield', 36, 18).child(this, true),
        new Sprite('pAngelPrismBeam', -32, 12).child(this, true),
        new Sprite('pAngelHealingKit', 0, -19).child(this, true)
    );
    
    // Weapon data
    this.prismData = {
        sprite        : 'prismBeam',
        cd            : 0,
        range         : 300,
        angle         : 10,
        dx            : -26,
        dy            : 60,
        rate          : 2,
        rotSpeed      : 10,
        onCollideCheck: projEvents.mixedCollide,
        //                                        args: [rotSpeed]
        templates     : [{ name: 'setupSpinning', args: [10] }],
        target        : Robot.ENEMY | Robot.PLAYER
    };
    this.gun = weapon.gun;

    //aura variables
    this.staticActive = true;
}

/**
 * Gets the radius in which Angel's buff applies
 */
PlayerAngel.prototype.getAuraRadius = function() {
    if (this.staticActive) {
        return 100 + (20 * this.upgrades[STATIC_AURA_ID]);
    }
    else {
        return 100 + (20 * this.upgrades[POWER_AURA_ID]);
    }
};
    
/**
 * Updates the angel's weapons and auras
 */
PlayerAngel.prototype.applyUpdate = function() {
    
    // Get damage multiplier
    var m = this.get('power');

    // Beam
    this.prismData.damage = m * (2 + 0.8 * this.upgrades[PRISM_POWER_ID]);
    this.prismData.size = rand(3) / 3 + 1;
    this.gun(this.prismData);
    
    // Counts the number of allies in the aura that can receive benefits
    var affected = [];
    var radiusSq = sq(this.getAuraRadius());
    var k, player;
    for(k = 0; k < players.length; k++){
        player = players[k];
        
        // Angel always counts, regardless of stats
        if (player == this) affected.push(player);
        
        // Other players count if in range
        else if (player.pos.distanceSq(this.pos) < radiusSq) {
            //if (p.staticActive && player.shield >= player.maxHealth * SHIELD_MAX) continue;
            //if (!p.staticActive && player.health >= player.maxHealth) continue;
            affected.push(player);
        }
    }

    // Apply auras to affected allies
    for (k = 0; k < affected.length; k++) {
        player = affected[k];

        if (this.staticActive) {
            player.buff('shieldBuff', 1 + (3 + this.upgrades[STATIC_AURA_ID]) / affected.length, 60);
        }
        else {
            player.buff('healthBuff', (0.001 + 0.0003 * this.upgrades[POWER_AURA_ID]) / affected.length, 60);
        }
    }

    // Apply auras to affected enemies
    if (this.staticActive) {
        for (k = 0; k < gameScreen.robots.length; k++) {
            var r = gameScreen.robots[k];
            
            // Make sure it's a valid enemy
            if ((r.type & Robot.MOBILE) === 0) continue;
        
            // Check to make sure they're in range
            if (r.pos.distanceSq(this.pos) < radiusSq) {

                // Slow the enemy
                enemy.buff('speed', 0.9 - (0.05 * this.upgrades[STATIC_AURA_ID]), 30);
            }
        }
    }
};

/**
 * Draw the auras when active
 *
 * @param {Camera} camera - camera to draw to
 */
PlayerAngel.prototype.onAuraDraw = function(camera) {
    if (this.dead) return;
    
    camera.ctx.globalAlpha *= 0.3;
    if (this.staticActive) {
        camera.ctx.fillStyle = '#00f';
        camera.ctx.beginPath();
        camera.ctx.arc(this.pos.x, this.pos.y, this.getAuraRadius(), 0, Math.PI * 2);
        camera.ctx.fill();
    }
    else {
        camera.ctx.fillStyle = '#f0f';
        camera.ctx.beginPath();
        camera.ctx.arc(this.pos.x, this.pos.y, this.getAuraRadius(), 0, Math.PI * 2);
        camera.ctx.fill();
    }
    camera.ctx.globalAlpha /= 0.3;
};