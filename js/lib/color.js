depend('lib/math');

/**
 * Represents a color with a few helper functions
 *
 * @constructor
 *
 * @param {number} r - Red component
 * @param {number} g - Green component
 * @param {number} b - Blue component
 * @param {number} a - Alpha component
 */
function Color(r, g, b, a) {
    this.r = clamp(r, 0, 255);
    this.g = clamp(g, 0, 255);
    this.b = clamp(b, 0, 255);
    this.a = clamp(a, 0, 255);
}

/**
 * Converts an integer to a color
 *
 * @param {number} num - the integer to convert to a color
 *
 * @returns {Color} the resulting color
 */
Color.fromRGBInt = function(num) {
    return new Color((num & (255 << 16)) >> 16, (num & (255 << 8)) >> 8, (num & 255), 1);
};

/**
 * Converts an integer to a color
 *
 * @param {number} num - the integer to convert to a color
 *
 * @returns {Color} the resulting color
 */
Color.fromRGBAInt = function(num) {
    return new Color((num & (255 << 24)) >> 24, (num & (255 << 16)) >> 16, (num & (255 << 8)) >> 8, (num & 255));
};

/**
 * Converts a 3 or 6 length hex string to a color
 *
 * @param {string} hex - the hex string to convert to a color
 *
 * @returns {Color} the resulting color
 */
Color.fromRGBHex = function(hex) {
    if (hex.length == 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return Color.fromRGBInt(parseInt(hex, 16));
};

/**
 * Converts a 4 or 8 length hex string to a color
 *
 * @param {string} hex - the hex string to convert to a color
 *
 * @returns {Color} the resulting color
 */
Color.fromRGBAHex = function(hex) {
    if (hex.length == 4) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    return Color.fromRGBAInt(parseInt(hex, 16));
};

/**
 * Converts the color to grayscale using luminosity
 *
 * @returns {Color} the modified color
 */
Color.prototype.toGrayscale = function() {
    var value = Math.floor(0.21 * this.r + 0.72 * this.g + 0.07 * this.b);
    this.r = value;
    this.g = value;
    this.b = value;

    return this;
};

/**
 * Inverts the color
 *
 * @returns {Color} the modified color
 */
Color.prototype.invert = function() {
    this.r = 255 - this.r;
    this.g = 255 - this.g;
    this.b = 255 - this.b;

    return this;
};

/**
 * Adds the color by the given color
 *
 * @param {Color} color - the color to add
 *
 * @returns {Color} the modified color
 */
Color.prototype.add = function(color) {
    this.r = clamp(this.r + color.r, 0, 255);
    this.g = clamp(this.g + color.g, 0, 255);
    this.b = clamp(this.b + color.b, 0, 255);
    this.a = clamp(this.a + color.a, 0, 255);

    return this;
};

/**
 * Multiplies the color by the given color
 *
 * @param {Color} color - the color to multiply by
 *
 * @returns {Color} the modified color
 */
Color.prototype.multiply = function(color) {
    this.r = Math.floor(this.r * color.r / 255);
    this.g = Math.floor(this.g * color.g / 255);
    this.b = Math.floor(this.b * color.b / 255);
    this.a = Math.floor(this.a * color.a / 255);

    return this;
};

/**
 * Lightens the color by the given color
 *
 * @param {Color} color - the color to lighten with
 *
 * @returns {Color} the modified color
 */
Color.prototype.lighten = function(color) {
    this.r = Math.max(this.r, color.r);
    this.g = Math.max(this.g, color.g);
    this.b = Math.max(this.b, color.b);
    this.a = Math.max(this.a, color.a);

    return this;
};

/**
 * Darkens the color by the given color
 *
 * @param {Color} color - the color to darken with
 *
 * @returns {Color} the modified color
 */
Color.prototype.darken = function(color) {
    this.r = Math.min(this.r, color.r);
    this.g = Math.min(this.g, color.g);
    this.b = Math.min(this.b, color.b);
    this.a = Math.min(this.a, color.a);

    return this;
};

/**
 * Returns a hexadecimal expression of the RGB color
 *
 * @returns {string} the CSS rgba string for the color
 */
Color.prototype.rgba = function() {
    return 'rgba(' + Math.floor(this.r * 255) + ',' + Math.floor(this.g * 255) + ',' + Math.floor(this.b * 255) + ',' + Math.floor(this.a * 255) + ')';
};