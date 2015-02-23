var HEALING_CAPACITY = 100;
var RECHARGE_RATE = 0.01;
var HEAL_RATE = 0.25;

/**
 * Represents a healing pad that heals players standing on it
 *
 * @param {Number} x - the horizontal coordinate of the center of the pad
 * @param {Number} y - the vertical coordinate of the center of the pad
 *
 * @constructor
 */
extend('HealingPad', 'Sprite');
function HealingPad(x, y) {
    this.super('healingPad', x, y);
    
    this.charge = HEALING_CAPACITY;
}

/**
 * Updates the healing pad, healing players standing on the pad
 */
HealingPad.prototype.update = function() {
    
    this.charge = Math.min(this.charge + RECHARGE_RATE, HEALING_CAPACITY);

    // Get the list of players on the pad
    var list = [];
    for (var i = 0; i < players.length; i++) {
        var robot = players[i];
        if (robot.health > 0 && robot.health < robot.maxHealth && this.charge > 0 && robot.pos.distanceSq(this.pos) < sq(this.sprite.width / 2)) {
            list.push(robot);
        }
    }
    
    // Split up the charge between the players up to the max rate per player
    var amount = Math.min(HEAL_RATE * list.length, this.charge);
    this.charge -= amount;
    amount /= list.length;
    for (var i = 0; i < list.length; i++) {
        list[i].health += list[i].maxHealth * amount / 100;
        if (list[i].health > list[i].maxHealth) {
            list[i].health = list[i].maxHealth;
        }
    }
};

/**
 * Draws the charge bar for the pad
 */
HealingPad.prototype.onPreDraw = function() {
    if (!this.sprite.width) return;
    camera.ctx.strokeStyle = '#0ff';
    camera.ctx.lineWidth = 30;
    camera.ctx.beginPath();
    camera.ctx.arc(0, 0, this.sprite.width / 2 - 30, -Math.PI / 2, Math.PI * 2 * this.charge / HEALING_CAPACITY - Math.PI / 2);
    camera.ctx.stroke();
};