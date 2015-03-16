/**
 * Clamps a value within a given range
 *
 * @param {number} value - the value to clamp
 * @param {number} min   - the lower bound
 * @param {number} max   - the upper bound
 *
 * @returns {number} the clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Randoms an integer within the range [min, max) or within
 * [0, max) if the min is not provided
 *
 * @param {number} [min] - lower bound
 * @param {number} max   - upper bound
 *
 * @returns {number} the random number
 */
function rand(min, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Squares a number
 *
 * @param {number} num - number to square
 *
 * @returns {number} the squared number
 */
function sq(num) {
    return num * num;
}

/**
 * Solves an equation in the form "0 = ax^3 + bx^2 + cx + d" for x
 *
 * @param {number} a - cubic coefficient
 * @param {number} b - quadratic coefficient
 * @param {number} c - linear coefficient
 * @param {number} d - constant
 */
function solveEq(a, b, c, d) {
    var solutions = [];
    var disc;

    // Cubic equations
    if (a !== 0) {

        // Divide by a to simplify math
        b /= a;
        c /= a;
        d /= a;

        // Uses the Cardan formula
        // http://en.wikipedia.org/wiki/Cubic_function#Cardano.27s_method
        var p = c - b * b / 3;
        var q = b * (2 * b * b - 9 * c) / 27 + d;
        var p3 = p * p * p;
        disc = q * q + 4 * p3 / 27;
        var offset = -b / 3;

        var u, v;
        
        // One real root
        if (disc > 0) {
            z = Math.sqrt(disc);
            u = ( -q + z) / 2;
            v = ( -q - z) / 2;
            u = (u >= 0) ? Math.pow(u, 1 / 3) : -Math.pow(-u, 1 / 3);
            v = (v >= 0) ? Math.pow(v, 1 / 3) : -Math.pow(-v, 1 / 3);
            solution.push(u + v + offset);
            return solution;
        }

        // Three real roots
        else if (disc < 0) {
            u = 2 * Math.sqrt(-p / 3);
            v = Math.acos(-Math.sqrt(-27 / p3) * q / 2) / 3;
            solution.push(u * Math.cos(v) + offset);
            solution.push(u * Math.cos(v + 2 * Math.PI / 3) + offset);
            solution.push(u * Math.cos(v + 4 * Math.PI / 3) + offset);
            return solution;
        }

        // Two real roots
        else {
            if (q < 0) u = Math.pow(-q / 2, 1 / 3);
            else u = -Math.pow(q / 2, 1 / 3);
            solution.push(2 * u + offset);
            solution.push(-u + offset);
            return solution;
        }
    }

    // Non-cubics
    else {

        // Linear equation
        if (b === 0) {

            // Horizontal line - no solution
            if (c === 0) return solution;

            // Linear equation
            else {
                solution.push(-d / c);
                return solution;
            }
        }

        // Quadratic equation
        else {

            disc = c * c - 4 * b * d;

            // No real roots
            if (disc < 0) return solution;

            // Multiple real roots
            if (disc > 0) {
                disc = Math.sqrt(disc);
                solution.push((-c - disc) / (2 * b));
                solution.push((-c + disc) / (2 * b));
                return solution;
            }

            // One real root
            else {
                solution.push(-c / (2 * b));
                return solution;
            }
        }
    }
}
