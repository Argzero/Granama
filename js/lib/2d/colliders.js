depend('lib/2d/vector');
depend('lib/math');

/**
 * A convex shape collider
 *
 * @constructor
 *
 * @param {Vector[]} points - the points making up the shape
 */
function ConvexCollider(points) {
    this.points = points;
    this.typeId = ConvexCollider.typeId;
    
    // Calculate edges for quicker access during collision checks
    var e = new Vector(points[1].x - points[0].x, points[1].y - points[0].y).rotate(0, 1);
    var e2 = new Vector(points[2].x - points[0].x, points[2].y - points[0].y);
    var m = e.dot(d2) > 0 ? 1 : -1;
    this.edges = [];
    this.normals = [];
    for (var i = 0; i < this.points.length; i++) {
        var p1 = this.points[i];
        var p2 = this.points[(i + 1) % this.points.length];
        this.edges.push(new Vector(p2.x - p1.x, p2.y - p1.y));
        this.normals.push(this.edges[i].clone().rotate(0, m));
    }
}

// The ID of the collider's type
ConvexCollider.typeId = 0;

/**
 * Moves the collider relatively
 *
 * @param {number} x - horizontal offset
 * @param {number} y - vertical offset
 */
ConvexCollider.prototype.move = function(x, y) {
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].add(x, y);
    }
};

/**
 * Checks whether or not it collides with the other collider
 *
 * @param {Object} collider - the other collider to check against
 *
 * @returns {boolean} true if collides, false otherwise
 */
ConvexCollider.prototype.collides = function(collider) {

    var i;
    switch (collider.typeId) {
    
        // Collision with another convex shape
        case ConvexCollider.typeId:
        
            var inside = true;
            for (i = 0; i < this.points.length; i++) {

                var r = this.edges[i];
                var p = this.points[i];
                var p2 = this.points[(i + 1) % this.points.length];
            
                for (var j = 0; j < collider.points.length; j++) {

                    var s = collider.edges[j];
                    var q = collider.points[j];
                    var q2 = collider.points[(i + 1) % collider.points.length];
                    
                    var uNumerator = (q.x - p.x) * r.y - (q.y - p.y) * r.x;
                    var denominator = r.cross(s);

                    if (uNumerator == 0 && denominator == 0) {
                        if (((q.x - p.x < 0) != (q.x - p2.x < 0) != (q2.x - p.x < 0) != (q2.x - p2.x < 0)) || 
                            ((q.y - p.y < 0) != (q.y - p2.y < 0) != (q2.y - p.y < 0) != (q2.y - p2.y < 0))) {
                            return true;
                        }
                    }

                    else if (denominator != 0) {
                        var u = uNumerator / denominator;
                        var t = ((q.x - p.x) * s.y - (q.y - p.y) * s.x) / denominator;

                        if ((t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)) {
                            return true;
                        }
                    }
                }
                
                if ((collider.points[0].x - this.points[i].x) * this.edges[i].x + (collider.points[0].y - this.points[i].y) * this.edges[i].y < 0) {
                    inside = false;
                }
            }
            return inside || collider.isInside(this.points[0]);
            
            break;
            
        // Collision with a circle
        case CircleCollider.typeId:

            for (i = 0; i < this.points.length; i++) {
                var dSq = collider.pos.segmentDistanceSq(this.points[i], this.points[(i + 1) % this.points.length]);
                if (dSq < sq(collider.r)) return true;
                if ((collider.pos.x - this.points[i].x) * this.edges[i].x + (collider.pos.y - this.points[i].y) * this.edges[i].y < 0) {
                    inside = false;
                }
            }
            return inside || collider.isInside(this.points[0]);
    }
};

/**
 * Checks whether or not the point is within the bounds
 *
 * @param {Vector} point - point to check
 * @returns {boolean} true if inside, false otherwise
 */
ConvexCollider.prototype.isInside = function(point) {
    for (var i = 0; i < this.points.length; i++) {
        if ((point.x - this.points[i].x) * this.edges[i].x + (point.y - this.points[i].y) * this.edges[i].y < 0) {
            return false;
        }
    }
    return true;
};

/**
 * A circular collider
 *
 * @constructor
 *
 * @param {number} r - the radius of the circle
 */
function CircleCollider(r) {
    this.pos = new Vector(0, 0);
    this.r = r;
}

// The ID of the collider's type
CircleCollider.typeId = 1;

/**
 * Moves the collider relatively
 *
 * @param {number} x - horizontal offset
 * @param {number} y - vertical offset
 */
CircleCollider.prototype.move = function(x, y) {
    this.pos.add(x, y);
};

/**
 * Checks whether or not it collides with the other collider
 *
 * @param {Object} collider - the other collider to check against
 *
 * @returns {boolean} true if collides, false otherwise
 */
CircleCollider.prototype.collides = function(collider) {

    switch (collider.typeId) {
    
        // To avoid duplicate code, just call the convex method
        case ConvexCollider.typeId:
            return collider.collides(this);
            
        // Simple circle collision
        case CircleCollider.typeId:
            return this.pos.distanceSq(collider.pos) < sq(this.r + collider.r);
    }
};

/**
 * Checks whether or not the point is within the bounds
 *
 * @param {Vector} point - point to check
 * @returns {boolean} true if inside, false otherwise
 */
CircleCollider.prototype.isInside = function(point) {
    return this.pos.distanceSq(point) < sq(this.r);
};