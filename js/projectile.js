// Base object for projectiles
function ProjectileBase(sprite, source, x, y, velX, velY, angle, damage, range, pierce, offScreen) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var tx = source.x - sin * y + cos * x;
    var ty = source.y + cos * y + sin * x;
    return {
    
        // Fields
        sprite: sprite,
        source: source,
        x: tx,
        y: ty,
        ox: tx,
        oy: ty,
        pierce: pierce,
        velX: velX,
        velY: velY,
        angle: angle,
        cos: cos,
        sin: sin,
        range: range,
        damage: damage,
        scale: 1,
        offScreen: offScreen,
        expired: false,
        
        // Components to be set by specific projectiles
        ApplyUpdate: undefined,
        
        // Functions
        Update: projectileFunctions.Update,
        Draw: projectileFunctions.Draw,
        Collides: projectileFunctions.Collides,
        Spread: projectileFunctions.Spread
    };
}

// Fire projectile
function FireProjectile(sprite, source, x, y, velX, velY, angle, damage, range) {
    var projectile = ProjectileBase(sprite, source, x, y, velX, velY, angle, damage, range, true, false);
    projectile.ApplyUpdate = projectileFunctions.ScaleFire;
    projectile.ApplyUpdate();
    return projectile;
}

// Reflection ability projectile
function ReflectionProjectile(source, x, y, velX, velY, damage, target) {
    var projectile = ProjectileBase(GetImage("abilityReflect"), source, x, y, velX, velY, 0, damage, 2500, false, true);
    projectile.target = target;
    projectile.ApplyUpdate = projectileFunctions.UpdateHoming;
    return projectile;
}

// Functions for bullets
var projectileFunctions = {

    // Updates the bullet's position
    Update: function() {
    
        // Move according to its velocity
        this.x += this.velX;
        this.y += this.velY;
        
        // Mark as expired when outside its range
        var dx = this.x - this.ox;
        var dy = this.y - this.oy;
        if (dx * dx + dy * dy >= this.range * this.range) {
            this.expired = true;
        }
        
        // Mark as expired when off screen
        if (!this.offScreen && !WithinScreen(this)) {
            this.expired = true;
        }
        
        // Apply special updates if applicable
        if (this.ApplyUpdate) {
            this.ApplyUpdate();
        }
    },
    
    // Draws the bullet
    Draw: function() {
        canvas.translate(this.x, this.y);
        canvas.transform(this.cos, this.sin, -this.sin, this.cos, 0, 0);
        if (this.scale != 1) {
            canvas.drawImage(this.sprite, -this.sprite.width * this.scale / 2, -this.sprite.height * this.scale / 2, this.sprite.width * this.scale, this.sprite.height * this.scale);
        }
        else {
            canvas.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        }
        canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
    },
    
    // Collision detection for bullets
    Collides: function(target) {
        return Sq(this.sprite.width * this.scale / 2 + target.sprite.width / 2) > Sq(this.x - target.x) + Sq(this.y - target.y);
    },
    
    // Spreads more projectiles from this one, putting the new ones into the array
    Spread: function(amount, array) {
    
        // Get angle data
        var angle, sin, cos;
        if (amount > 29) {
            angle = Math.PI / 180;
            sin = SIN_1;
            cos = COS_1;
        }
        else if (amount > 17) {
            angle = Math.PI / 60;
            sin = SIN_3;
            cos = COS_3;
        }
        else if (amount > 8) {
            angle = Math.PI / 36;
            sin = SIN_5;
            cos = COS_5;
        }
        else if (amount > 5) {
            angle = Math.PI / 18;
            sin = SIN_10;
            cos = COS_10;
        }
        else {
            angle = Math.PI / 12;
            sin = SIN_15;
            cos = COS_15;
        }
    
        // Spread the bullet
        var vel = [this.velX, this.velY, this.velX, this.velY];
        for (var i = 0; i < amount; i++) {
            for (var j = 0; j < 2; j++) {
                var k = j * 2 - 1;
                var proj = Clone(this);
                proj.velX = vel[j * 2] * cos - vel[j * 2 + 1] * sin * k;
                proj.velY = vel[j * 2] * sin * k + vel[j * 2 + 1] * cos;
                proj.angle += angle * k * (i + 1);
                proj.cos = Math.cos(proj.angle);
                proj.sin = Math.sin(proj.angle);
                vel[j * 2] = proj.velX;
                vel[j * 2 + 1] = proj.velY;
                array.push(proj);
            }
        }
    },
    
    // Scales fire projectiles on update
    ScaleFire: function() {
        this.scale = 0.1 + 0.9 * DistanceSq(this.x, this.y, this.ox, this.oy) / Sq(this.range * 3 / 4);
    },
    
    // Reflection ability projectiles' homing behavior
    UpdateHoming: function() {
    
        // Remove the bullet if the target is dead
        if (this.target.health <= 0) {
            this.expired = true;
            return;
        }
        
        // Turn towards the target
        var dx = this.target.x - this.x;
        var dy = this.target.y - this.y;
        var dot = this.velY * dx + -this.velX * dy;
        var angle;
        if (dot > 0) {
            angle = -0.1;
        }
        else {
            angle = 0.1;
        }
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var tx = this.velX * c - this.velY * s;
        var ty = this.velX * s + this.velY * c;
        this.velX = tx;
        this.velY = ty;
    }
};