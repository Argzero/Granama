var HEALING_CAPACITY = 100;
var RECHARGE_RATE = 0.01;
var HEAL_RATE = 0.25;
var INFECT_CAPACITY = 10000;
var INFECT_RATE = 1;
var UNINFECT_RATE = 0.75;
var INFECT_RADIUS = 4000;

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
    this.heal = 0;
    this.uninfectRate = UNINFECT_RATE;
}

/**
 * Infects the healing pad over time by deducting regular
 * charge and adding infected charge.
 */
HealingPad.prototype.infect = function(heal) {
    this.heal = Math.max(this.heal, heal);
    this.charge = Math.max(this.charge - INFECT_RATE, -INFECT_CAPACITY);
    this.uninfectRate = 0;
};

/**
 * Updates the healing pad, healing players standing on the pad
 */
HealingPad.prototype.update = function() {

    // Uninfected pads use charge to heal players
    var i;
    if (this.charge > 0) {
        this.charge = Math.min(this.charge + RECHARGE_RATE, HEALING_CAPACITY);

        // Get the list of players on the pad
        var list = [];
        for (i = 0; i < players.length; i++) {
            var robot = players[i];
            if (robot.health > 0 && robot.health < robot.maxHealth && this.charge > 0 && robot.pos.distanceSq(this.pos) < sq(this.sprite.width / 2)) {
                list.push(robot);
            }
        }
        
        // Split up the charge between the players up to the max rate per player
        var amount = Math.min(HEAL_RATE * list.length, this.charge);
        this.charge -= amount;
        amount /= list.length;
        for (i = 0; i < list.length; i++) {
            list[i].health += list[i].maxHealth * amount / 100;
            if (list[i].health > list[i].maxHealth) {
                list[i].health = list[i].maxHealth;
            }
        }
    }
    
    // Infected pads heal enemies in a large radius
    else {
        this.charge += this.uninfectRate;
        this.uninfectRate = UNINFECT_RATE;
        
        var radius = -INFECT_RADIUS * this.charge / INFECT_CAPACITY;
        radius *= radius;
        for (i = 0; i < gameScreen.robots.length; i++) {
            var r = gameScreen.robots[i];
            if ((r.type & Robot.MOBILE) && (!r.healAmount) && r.pos.distanceSq(this.pos) < radius) {
                r.buff('flatHBuff', this.heal, 20);
            }
        }
    }
};

/**
 * Draws the charge bar for the pad
 */
HealingPad.prototype.onPreDraw = function() {
    if (!this.sprite.width) return;
    
    if (this.charge > 0) {
        camera.ctx.strokeStyle = '#0ff';
        camera.ctx.lineWidth = 30;
        camera.ctx.beginPath();
        camera.ctx.arc(0, 0, this.sprite.width / 2 - 30, -Math.PI / 2, Math.PI * 2 * this.charge / HEALING_CAPACITY - Math.PI / 2);
        camera.ctx.stroke();
    }
    else {
        camera.ctx.strokeStyle = '#f70';
        camera.ctx.fillStyle = '#f93';
        camera.ctx.lineWidth = 30;
        camera.ctx.beginPath();
        camera.ctx.arc(0, 0, this.sprite.width / 2 - 30, -Math.PI / 2, -Math.PI * 2 * this.charge / INFECT_CAPACITY - Math.PI / 2);
        camera.ctx.stroke();
        camera.ctx.globalAlpha = 0.5;
        camera.ctx.beginPath();
        camera.ctx.arc(0, 0, -INFECT_RADIUS * this.charge / INFECT_CAPACITY, 0, Math.PI * 2);
        camera.ctx.fill();
        camera.ctx.globalAlpha = 1;
    }
};