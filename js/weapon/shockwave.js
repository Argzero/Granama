// A shockwave that hits things like projectiles, but behaves much differently
function Shockwave(source, color, x, y, speed, min, max, radius, thickness, damage, range, knockback) {
    return {
        
        // Fields
        source: source,
        color: color,
        x: x,
        y: y,
        speed: speed,
        min: min,
        minVec: Vector(Math.cos(min), Math.sin(min)),
        max: max,
        maxVec: Vector(Math.cos(max), Math.sin(max)),
        radius: radius,
        thickness: thickness,
        damage: damage,
        range: range,
        knockback: knockback,
        scale: 1,
        offScreen: true,
        expired: false,
        pierce: true,
        
        // Components to be set by specific projectiles
        ApplyUpdate: undefined,
        
        // Functions
        Update: shockwaveFunctions.Update,
        Draw: shockwaveFunctions.Draw,
        Collides: shockwaveFunctions.Collides,
		Hit: shockwaveFunctions.Hit
    }
}

var shockwaveFunctions = {

    Update: function() {
        this.radius += this.speed;
        if (this.radius > this.range) this.expired = true;
    },
    
    Draw: function() {
        canvas.lineWidth = this.thickness;
        canvas.strokeStyle = this.color;
        canvas.beginPath();
        canvas.arc(this.x, this.y, this.radius, this.min, this.max);
        canvas.stroke();
    },
    
    Collides: function(target) {
        var dx = target.x - this.x;
        var dy = target.y - this.y;
        var dSq = Sq(dx) + Sq(dy);
        var thickness = (this.thickness + target.sprite.width) / 2;
        if (dSq > Sq(this.radius - thickness) && dSq < Sq(this.radius + thickness)) {
            var minDot = this.minVec.y * dx - this.minVec.x * dy;
            var maxDot = this.maxVec.y * dx - this.maxVec.x * dy;
            
            return maxDot >= 0 && minDot <= 0;
        }
        else return false;
    },
    
    Hit: function(target) {
        target.Damage(this.damage);
        
        // Knockback if applicable
        if (this.knockback && target.Knockback) {
            var dir = Vector(target.x - this.x, target.y - this.y);
            dir.SetLength(this.knockback);
            target.Knockback(dir.x, dir.y);
        }
    }
};