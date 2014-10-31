// Clones an object entirely
function Clone(obj) {
    var clone = { };
    for (var field in obj) {
        clone[field] = obj[field];
    }
    return clone;
}

// A vector representation with helpful methods
function Vector(x, y) {
    return {
        x: x,
        y: y,
        Dot: vectorMethods.Dot,
        Distance: vectorMethods.Distance,
        DistanceSq: vectorMethods.DistanceSq,
        Length: vectorMethods.Length,
        LengthSq: vectorMethods.LengthSq,
        Rotate: vectorMethods.Rotate,
        Set: vectorMethods.Set,
        Add: vectorMethods.Add,
        SetLength: vectorMethods.SetLength,
        Normalize: vectorMethods.Normalize
    };
}

// Functions used in the vector representation
var vectorMethods = {

    // Dot product between two vectors
    Dot: function(vector) {
        return this.x * vector.x + this.y * vector.y;
    },
    
    // Distance between two vectors
    Distance: function(vector) {
        var dx = this.x - vector.x;
        var dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Squared distance between two vectors
    DistanceSq: function(vector) {
        var dx = this.x - vector.x;
        var dy = this.y - vector.y;
        return dx * dx + dy * dy;
    },
    
    // Length of the vector
    Length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    
    // Squared length of the vector
    LengthSq: function() {
        return this.x * this.x + this.y * this.y;
    },
    
    // Rotates the vector using the cos/sin values 
    // or an angle if one argument is provided
    Rotate: function(cos, sin) {
        if (!sin) {
            sin = Math.sin(cos);
            cos = Math.cos(cos);
        }
        var tx = this.x * cos - this.y * sin;
        this.y = this.x * sin + this.y * cos;
        this.x = tx;
		return this;
    },
    
    // Sets the components of the vector
    Set: function(x, y) {
        this.x = x;
        this.y = y;
    },
    
    // Adds to the components of the vector
    Add: function(x, y) {
        this.x += x;
        this.y += y;
    },
    
    // Sets the length of the vector
    SetLength: function(length) {
        var l = this.Length();
        this.x *= length / l;
        this.y *= length / l;
    }
};

// Returns a modified value clamped to the given bounds
function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

// Measures the width of the string using the active canvas font
// str - string to measure
function StringWidth(str) {
    return canvas.measureText(str).width;
}

// Checks if an object is within the game screen
// obj - object to check for
function WithinScreen(obj) {
    if (XMax(obj) - gameScreen.scrollX < 0) return false;
    if (XMin(obj) - gameScreen.scrollX > WINDOW_WIDTH) return false;
    if (YMax(obj) - gameScreen.scrollY < 0) return false;
    if (YMin(obj) - gameScreen.scrollY > WINDOW_HEIGHT) return false;
    return true;
}

// Checks if the point is off the game screen using the given padding
//       x - horizontal coordinate
//       y - vertical coordinate
// padding - amount to be off the gameScreen by (0 by default)
function OffScreen(x, y, padding) {
    if (padding === undefined) padding = 0;
	if (x - gameScreen.scrollX < -padding) return true;
	if (x - gameScreen.scrollX > WINDOW_WIDTH + padding) return true;
	if (y - gameScreen.scrollY < -padding) return true;
	if (y - gameScreen.scrollY > WINDOW_HEIGHT + padding) return true;
	return false;
}

// Checks if a bullet collides with the given robot
// bullet - bullet to check with
//  robot - robot to check against
function BulletCollides(bullet, robot) {
    if (!bullet || bullet.sprite === undefined || !robot || robot.sprite === undefined) {
        console.log('huh?');
    }
    return Sq(bullet.sprite.width * bullet.scale / 2 + robot.sprite.width / 2) > Sq(bullet.x - robot.x) + Sq(bullet.y - robot.y);
}

function arcCollides(target, x, y, radius, thickness, start, end) {
    var dx = target.x - x;
    var dy = target.y - y;
    var dSq = Sq(dx) + Sq(dy);
    var minVec = Vector(Math.cos(start), Math.sin(start));
    var maxVec = Vector(Math.cos(end), Math.sin(end));
    if (!target.sprite) {
        return false;
        /*
        if (dSq > Sq(radius + target.radius)) {
            
        }
        else return false;
        */
    }
    else {
        var thickness = (thickness + target.sprite.width) / 2;
        if (dSq > Sq(radius - thickness) && dSq < Sq(radius + thickness)) {
            var minDot = minVec.y * dx - minVec.x * dy;
            var maxDot = maxVec.y * dx - maxVec.x * dy;
            
            return maxDot >= 0 && minDot <= 0;
        }
        else return false;
    }
}

// Squares a number
// num - number to square
function Sq(num) {
    return num * num;
}

// Distance squared between two points
// x1 - horizontal coordinate of the first point
// y1 - vertical coordinate of the first point
// x2 - horizontal coordinate of the second point
// y2 - vertical coordinate of the second point
function DistanceSq(x1, y1, x2, y2) {
    return Sq(x1 - x2) + Sq(y1 - y2);
}

// Distance between two points
// x1 - horizontal coordinate of the first point
// y1 - vertical coordinate of the first point
// x2 - horizontal coordinate of the second point
// y2 - vertical coordinate of the second point
function Distance(x1, y1, x2, y2) {
    return Math.sqrt(Sq(x1 - x2) + Sq(y1 - y2));
}

// Returns a random integer in the interval [0, max)
// max - ceiling for the random number (number of possible results)
function Rand(max) {
    return Math.floor(Math.random() * max);
}

// Rotates the x, y pair by the given integer value and returns the x coordinate
function RotateX(x, y, angle) {
    if (angle >= 10) {
        return x * Math.cos(angle) - y * Math.sin(angle);
    }
	var m = angle < 0 ? -1 : 1;
	angle = Math.abs(angle);
	for (var i = 0; i < angle; i++) {
		var xt = x * COS_1 - y * SIN_1 * m;
		y = x * SIN_1 * m + y * COS_1;
		x = xt;
	}
	return x;
}

// Rotates the x, y pair by the given integer value and returns the y coordinate
function RotateY(x, y, angle) {
    if (angle >= 10) {
        return x * Math.sin(angle) + y * Math.cos(angle);
    }
	var m = angle < 0 ? -1 : 1;
	angle = Math.abs(angle);
	for (var i = 0; i < angle; i++) {
		var xt = x * COS_1 - y * SIN_1 * m;
		y = x * SIN_1 * m + y * COS_1;
		x = xt;
	}
	return y;
}

// Gets the angle from the first point to the second point
function GetAngle(x1, y1, x2, y2) {
    var a = Math.atan((y2 - y1) / (x1 - x2));
    if (x1 < x2) {
        return -HALF_PI - a;
    }
    else {
        return HALF_PI - a;
    }
}

// Resets the transform of the canvas to the game's scroll position
function ResetTransform(canvas) {
    canvas.setTransform(1, 0, 0, 1, SIDEBAR_WIDTH - gameScreen.scrollX, -gameScreen.scrollY);
}

// Lower X bound for a game object
function XMin(obj) {
    return obj.x - obj.sprite.width / 2;
}

// Upper X bound for a game object
function XMax(obj) {
    return obj.x + obj.sprite.width / 2;
}

// Lower Y bound for a game object
function YMin(obj) {
    return obj.y - obj.sprite.height / 2;
}

// Upper Y bound for a game object
function YMax(obj) {
    return obj.y + obj.sprite.height / 2; 
}

// Calculates the angle to a target from a source
function AngleTo(target, source) {
	var a = Math.atan((target.y - source.y) / (source.x - target.x));
	if (source.x < target.x) {
		a = -HALF_PI - a;
	}
	else {
		a = HALF_PI - a;
	}
	return a;
}

// Calculates a new angle towards the target using a turn speed
function AngleTowards(target, source, turnSpeed, backwards) {
	var a = AngleTo(target, source);
	
	var dx, dy;
	if (backwards) {
		a = a + Math.PI;
		dx = source.x - target.x;
		dy = source.y - target.y;
	}
	else {
		var dx = target.x - source.x;
		var dy = target.y - source.y;
	}
	var dot = source.sin * dx + -source.cos * dy;
	
	var result = source.angle;
	
	// Turning to the left
	var m = dot < 0 ? 1 : -1;
	while (m * (a - result) < 0) {
		a += m * 2 * Math.PI;
	}
	result += m * turnSpeed;
	if (m * (result - a) > 0) {
		result = a;
	}
	return result;
}