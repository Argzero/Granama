// Measures the width of the string using the given font
//    s - string to measure
// font - font to measure the string with
function StringWidth(s, font) {
    var measure = document.getElementById("measure");
    measure.style.font = font;
    measure.innerHTML = s;
    return measure.clientWidth + 1;
}

// Checks if a bullet is within the gameScreen
// bullet - bullet to check for
function WithinScreen(obj) {
    if (XMax(obj) - gameScreen.scrollX < 0) return false;
    if (XMin(obj) - gameScreen.scrollX > WINDOW_WIDTH) return false;
    if (YMax(obj) - gameScreen.scrollY < 0) return false;
    if (YMin(obj) - gameScreen.scrollY > WINDOW_HEIGHT) return false;
    return true;
}

// Checks if the point is off the gameScreen using the given padding
//       x - horizontal coordinate
//       y - vertical coordinate
// padding - amount to be off the gameScreen by
function OffScreen(x, y, padding) {
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
    return Sq(bullet.sprite.width * bullet.scale / 2 + robot.sprite.width / 2) > Sq(bullet.x - robot.x) + Sq(bullet.y - robot.y);
}

// Squares a number
// num - number to square
function Sq(num) {
    return num * num;
}

// Distance between two points
// x1 - horizontal coordinate of the first point
// y1 - vertical coordinate of the first point
// x2 - horizontal coordinate of the second point
// y2 - vertical coordinate of the second point
function DistanceSq(x1, y1, x2, y2) {
    return Sq(x1 - x2) + Sq(y1 - y2);
}

// Returns a random integer in the interval [0, max)
// max - ceiling for the random number (number of possible results)
function Rand(max) {
    return Math.floor(Math.random() * max);
}

// Speads the bullet by the given factor
// bullet - bullet to spread from
// factor - direction factor (1 or -1)
//      c - cosine of the angle to rotate by
//      s - sine of the angle to rotate by
function Spread(bullet, factor, c, s) {
	var velX = bullet.velX * c - bullet.velY * s * factor;
	var velY = bullet.velX * s * factor + bullet.velY * c;
	
	return new Bullet(bullet.x, bullet.y, velX, velY, bullet.damage, bullet.range, bullet.enemy);
}

// Spreads a laser by the given factor
//  laser - laser to spread from
// factor - direction factor (-1 or 1)
//      c - cosine of the angle to rotate by
//      s - sine of the angle to rotate by
function SpreadHammer(hammer, factor, angle, c, s) {
    var velX = hammer.velX * c - hammer.velY * s * factor;
	var velY = hammer.velX * s * factor + hammer.velY * c;
	
	return NewHammer(hammer.x, hammer.y, velX, velY, hammer.angle + angle * factor, hammer.damage, hammer.range);
}

// Spreads a laser by the given factor
//  laser - laser to spread from
// factor - direction factor (-1 or 1)
//      c - cosine of the angle to rotate by
//      s - sine of the angle to rotate by
function SpreadLaser(laser, factor, angle, c, s) {
    var velX = laser.velX * c - laser.velY * s * factor;
	var velY = laser.velX * s * factor + laser.velY * c;
	
	var result = NewLaser(laser.x, laser.y, velX, velY, laser.angle + angle * factor, laser.damage, laser.range);
	result.sprite = laser.sprite;
	return result;
}

// Rotates the x, y pair by the given integer value and returns the x coordinate
function RotateX(x, y, angle) {
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
	var m = angle < 0 ? -1 : 1;
	angle = Math.abs(angle);
	for (var i = 0; i < angle; i++) {
		var xt = x * COS_1 - y * SIN_1 * m;
		y = x * SIN_1 * m + y * COS_1;
		x = xt;
	}
	return y;
}

// Fires spread shots form the robot based on the initial bullet
//  robot - robot to fire the spread shot for
// bullet - initial fired bullet
//  array - list to add the bullets to
function SpreadShots(robot, bullet, array) {

    // Spread shots
    var l = bullet;
    var r = bullet;
    var d = GetSpreadData(robot);
    
    for (var i = 0; i < robot.spread; i++) {
        l = Spread(l, 1, d.c, d.s);
        r = Spread(r, -1, d.c, d.s);
        array[array.length] = l;
        array[array.length] = r;
    }
}

// Fires spread shots from the robot based on the initial laser
// robot - robot to fire the spread shot for
// laser - initial fired laser
// array - list to add the lasers to
function SpreadHammers(robot, hammer, array) {

    var l = hammer;
    var r = hammer;
    var c = COS_15;
    var s = SIN_15;
    var a = Math.PI / 12;
	
    // Hammers don't spread as much
    var spread = robot.spread / 5;
	if (spread > 2) {
		spread = 2;
	}
    
    for (var i = 0; i < spread; i++) {
        l = SpreadHammer(l, 1, a, c, s);
        r = SpreadHammer(r, -1, a, c, s);
        array[array.length] = l;
        array[array.length] = r;
    }
}

// Fires spread shots from the robot based on the initial laser
// robot - robot to fire the spread shot for
// laser - initial fired laser
// array - list to add the lasers to
function SpreadLaserShots(robot, laser, array, amount) {

    var l = laser;
    var r = laser;
    var d = GetSpreadData(amount);
    
    for (var i = 0; i < amount && i < 90; i++) {
        l = SpreadLaser(l, 1, d.a, d.c, d.s);
        r = SpreadLaser(r, -1, d.a, d.c, d.s);
        array[array.length] = l;
        array[array.length] = r;
    }
}

// Retrieves the value of the angle in radians for the spread shot of the robot
// amount - Spread of the bullets
function GetSpreadData(amount) {
    if (amount > 29) {
		return { a: Math.PI / 180, s: SIN_1, c: COS_1 };
	}
	else if (amount > 17) {
        return { a: Math.PI / 60, s: SIN_3, c: COS_3 };
    }
    else if (amount > 8) {
        return { a: Math.PI / 36, s: SIN_5, c: COS_5 };
    }
    else if (amount > 5) {
        return { a: Math.PI / 18, s: SIN_10, c: COS_10 };
    }
    else {
        return { a: Math.PI / 12, s: SIN_15, c: COS_15 };
    }
}

// Fires a bullet from the given enemy
function FireBullet(enemy) {

    // Normal bullet
    var bullet = new Bullet(enemy.x + enemy.c * enemy.sprite.width / 2, enemy.y + enemy.s * enemy.sprite.width / 2, enemy.c * BULLET_SPEED, enemy.s * BULLET_SPEED, enemy.damage, enemy.range * 1.5, enemy);
    gameScreen.bullets[gameScreen.bullets.length] = bullet;
    
    // Spread shots
	SpreadShots(enemy, bullet, gameScreen.bullets);
}

// Fires a hammer from the given enemy
function FireHammer(enemy) {
	
	// Hammer
	var hammer = NewHammer(enemy.x, enemy.y, enemy.c * BULLET_SPEED, enemy.s * BULLET_SPEED, enemy.angle, enemy.damage, enemy.range * 1.5);
	gameScreen.bullets[gameScreen.bullets.length] = hammer;
	
	// Spread shots
	SpreadHammers(enemy, hammer, gameScreen.bullets);
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