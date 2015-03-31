/**
 * Represents a tail that uses simple rope-like physics to bend
 *
 * @param {Robot}   source     - the robot owning the tail
 * @param {string}  segment    - the name of the sprite of the tail segments
 * @param {string}  end        - the name of the sprite of the last segment of the tail
 * @param {number}  length     - the number of segments the tail should have
 * @param {number}  offset     - the distance each segment should be from eachother
 * @param {number}  base       - the distance of the first segment from the source
 * @param {number}  endOffset  - the distance the last segment should be from the others
 * @param {number}  constraint - the max angle segments can bend from eachother
 * @param {boolean} [front]    - whether or not the end is the front most segment (normally false)
 *
 * @constructor 
 */
extend('RopeTail', 'Sprite');
function RopeTail(source, segment, end, length, offset, base, endOffset, constraint, front) {
    this.super(length <= 1 ? end : segment, 0, -base - offset);
    
    // Data
    this.front = front;
    this.source = source;
    this.rel = new Vector(1, 0);
    this.dir = new Vector(0, 1);
    this.offset = this.pos.y;
	this.hideDist = 0;
    
    constraint *= Math.PI / 180;
    
    this.segments = [];
    this.turrets = [];
    var parent = this;
    for (var i = 0; i < length - 1; i++) {
        var seg = new TailSegment(parent, i == length - 2 ? end : segment, i == length - 2 ? endOffset + offset : offset, constraint);
        this.segments.push(seg);
        parent = seg;
    }
}

/**
 * Adds turrets to the tail
 *
 * @param {string} sprite     - name of the turret's gun sprite
 * @param {number} dx         - horizontal offset of the turret
 * @param {number} dy         - vertical offset of the turret
 * @param {Object} weaponData - the gun data to use for the turrets
 */
RopeTail.prototype.setTurrets = function(sprite, dx, dy, weaponData)
{
    this.turretOffset = new Vector(dx, dy);
    for (var i = 0; i < this.segments.length; i++)
    {
        var turret = new TailTurret(sprite, weaponData);
        this.turrets.push(turret);
    }
};

/**
 * Set the base direction for the tail. This is the direction
 * from the center of the robot the tail will point out of
 *
 * @param {Vector} dir - the direction of the tail
 */
RopeTail.prototype.setBaseDir = function(dir) {
    this.pos.rotate(this.rel.x, -this.rel.y);
    this.pos.rotate(dir.x, dir.y);
    this.rotation = dir.clone();
    this.rel = dir.clone();
    return this;
};

/**
 * Updates the tail including all segments, applying
 * constraints and bending according to the source's movement
 */
RopeTail.prototype.update = function() {
	
	var prevPos = this.pos.clone();
	
    this.dir = this.source.rotation.clone().rotate(0, 1).rotate(this.rel.x, this.rel.y);
    this.pos.x = 0;
    this.pos.y = this.offset;
    this.pos.rotate(this.dir.y, -this.dir.x);
    this.pos.addv(this.source.pos);
    this.rotation = this.source.rotation.clone().rotate(this.rel.x, this.rel.y);
    
    camera.ctx.translate(-this.source.pos.x, -this.source.pos.y);
    var i;
    if (!this.front) {
        this.draw(camera);
        for (i = 0; i < this.segments.length; i++) {
            this.segments[i].update();
            this.segments[i].draw(camera);
            this.updateTurret(i);
        }
    }
    else {
        for (i = this.segments.length - 1; i >= 0; i--) {
            this.segments[i].update();
            this.segments[i].draw(camera);
            this.updateTurret(i);
        }
        this.draw(camera);
    }
    camera.ctx.translate(this.source.pos.x, this.source.pos.y);
	
	// Hide the tail gradually (burrowing into the same spot)
	if ((this.source.hidden != this.hidden) || this.hideDist) {
		this.hideDist += prevPos.distance(this.pos);
		if (this.hideDist >= Math.abs(this.offset)) {
			this.hidden = !this.hidden;
			this.hideDist = 0;
		}
	}
	
	// Particles when burrowing
	if (this.hidden) {
		vel = new Vector(rand(8) + 2);
		vel.rotateAngle(rand(360) * Math.PI / 180);
		size = rand(this.width * 0.4) + this.width * 0.2;
		gameScreen.particles.push(new Dust(this.pos, vel, 10, size));
	}
};

/**
 * Updates a turret on the tail if it exists
 *
 * @param {number} index - the index of the turret to update
 */
RopeTail.prototype.updateTurret = function(index) 
{
    if (this.turrets.length > index && index >= 0)
    {
        var pos = this.segments[index].pos.clone();
        pos.addv(this.turretOffset.clone().rotate(this.segments[index].rotation.x, this.segments[index].rotation.y));
        this.turrets[index].moveTo(pos.x, pos.y);
        this.turrets[index].update();
        this.turrets[index].draw(camera);
    }
};

/**
 * Gets the orientation of the end of the tail
 */
RopeTail.prototype.getEndDir = function() {
    return this.segments[this.segments.length - 1].rotation;
};

/**
 * Causes the tail to drift towards the parent
 */
RopeTail.prototype.followParent = function() {
    
    if (this.prev) {
        this.pos.addv(this.source.pos).subtractv(this.prev);
        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].pos.addv(this.source.pos).subtractv(this.prev);
        }
    }
    
    this.prev = this.source.pos.clone();
};

// Modes for the turnTowards method
ROPE_TURN_ALL = 0;  // Turns all segments the same amount
ROPE_TURN_END = 1;  // Turns the end of the tail faster than the base
ROPE_TURN_ROOT = 2; // Turns the base of the tail faster than the end

/**
 * Turns the tail towards the given direction using a given mode
 *
 * @param {Vector} dir   - direction to point towards
 * @param {number} speed - speed of rotation to use (in angles per frame)
 * @param {number} mode  - how to apply the rotation throughout the tail
 */
RopeTail.prototype.turnTowards = function(dir, speed, mode) {
    
    var d = this.getEndDir();
    if (d.dot(dir) > 0.95) return;
    d.rotate(0, 1);
    var m = d.dot(dir) > 0 ? 1 : -1;
    
    // Turn End mode
    var i, s, t;
    if (mode == 1) {
        t = (this.segments.length + 1) * (this.segments.length / 2);
        s = 0;
        for (i = 0; i < this.segments.length; i++) {
            s += speed * (i + 1) / t;
            this.segments[i].rotate(Math.cos(s), m * Math.sin(s));
        }
    }
    
    // Turn Root mode
    else if (mode == 2) {
        t = (this.segments.length + 1) * (this.segments.length / 2);
        s = 0;
        for (i = 0; i < this.segments.length; i++) {
            s += speed * (this.segments.length - i) / t;
            this.segments[i].rotate(Math.cos(s), m * Math.sin(s));
        }
    }
    
    // Turn All mode
    else {
        t = speed / this.segments.length;
        s = 0;
        for (i = 0; i < this.segments.length; i++) {
            s += t;
            this.segments[i].rotate(Math.cos(s), m * Math.sin(s));
        }
    }
};

/**
 * Represents a single segment of a Rope Tail
 *
 * @param {RopeTail|TailSegment} parent     - parent of the segment
 * @param {string}               sprite     - name of the sprite of the segment
 * @param {number}               offset     - distance between segments
 * @param {number}               constraint - maximum angle segments can bend
 *
 * @constructor
 */
extend('TailSegment', 'Sprite');
function TailSegment(parent, sprite, offset, constraint) {
    this.super(sprite, 0, -offset);

    this.parent = parent;
    this.constraint = constraint;
    this.offset = offset;
    this.lim = new Vector(Math.cos(constraint), Math.sin(constraint));
    this.dir = new Vector(0, 1);
	this.hideDist = 0;
}

/**
 * Updates the tail segment, applying rotations and clamping to the constraintsd
 */
TailSegment.prototype.update = function() {
	var prevPos = this.pos.clone();
    var dir = this.parent.dir;
    var limMax = dir.clone().rotate(this.lim.x, this.lim.y).rotate(0, -1);
    var limMin = dir.clone().rotate(this.lim.x, -this.lim.y).rotate(0, 1);
    
    // When directly on top of the parent segment, move straight back
    if (this.pos.x == this.parent.pos.x && this.pos.y == this.parent.pos.y) {
        this.pos.x = 0;
        this.pos.y = -this.offset;
        this.pos.rotate(this.dir.y, -this.dir.x);
        this.pos.addv(this.parent.pos);
        this.dir.x = this.parent.dir.x;
        this.dir.y = this.parent.dir.y;
    }
    
    // Otherwise, move according to the current angle to the parent segment
    else {
        this.dir.x = this.parent.pos.x - this.pos.x;
        this.dir.y = this.parent.pos.y - this.pos.y;
        if (this.dir.dot(limMin) < 0) {
            limMin.rotate(0, -1);
            this.dir.x = limMin.x;
            this.dir.y = limMin.y;
        }
        else if (this.dir.dot(limMax) < 0) {
            limMax.rotate(0, 1);
            this.dir.x = limMax.x;
            this.dir.y = limMax.y;
        }
        else this.dir.normalize();
        this.pos.x = this.parent.pos.x - this.dir.x * this.offset;
        this.pos.y = this.parent.pos.y - this.dir.y * this.offset;
        
        this.setRotation(this.dir.x, this.dir.y);
        this.rotation.rotate(0, -1);
    }
	
	// Hide the tail gradually (burrowing into the same spot)
	if ((this.parent.hidden != this.hidden) || this.hideDist) {
		this.hideDist += prevPos.distance(this.pos);
		if (this.hideDist >= Math.abs(this.offset)) {
			this.hidden = !this.hidden;
			this.hideDist = 0;
		}
	}
	
	// Particles when burrowing
	if (this.hidden) {
		vel = new Vector(rand(8) + 2);
		vel.rotateAngle(rand(360) * Math.PI / 180);
		size = rand(this.width * 0.4) + this.width * 0.2;
		gameScreen.particles.push(new Dust(this.pos, vel, 10, size));
	}
};

/**
 * Represents a simple turret that gets mounted on top of a
 * robot's tail and shoots independently
 *
 * @param {string} sprite  - the sprite of the turret's gun
 * @param {Object} gunData - the data to use for the turret's gun
 */
extend('TailTurret', 'Sprite');
function TailTurret(sprite, gunData) {
    this.super(sprite, 0, 0);
    
    this.fire = weapon.gun;
    this.gunData = gunData;
}

/**
 * Checks whether or not the turret should fire
 */
TailTurret.prototype.isInRange = function() {
    return true;
};

/**
 * Updates the turret's orientation and fires its gun
 */
TailTurret.prototype.update = function() {
    
    // Update the turret's angle
    var player = getClosestPlayer(this.pos);
    if (!player) return;
    this.lookAt(player.pos);
    
    // Fire if in range
    this.fire(this.gunData);
};