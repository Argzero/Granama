var HEALING_CAPACITY = 100;
var RECHARGE_RATE = 0.01;
var HEAL_RATE = 0.25;

function HealingPad(x, y) {
    return {

        sprite: GetImage('healingPad'),
        x     : x,
        y     : y,
        charge: HEALING_CAPACITY,

        update: function() {

            this.charge = Math.min(this.charge + RECHARGE_RATE, HEALING_CAPACITY);

            var players = [];
            for (var i = 0; i < playerManager.players.length; i++) {
                var robot = playerManager.players[i].robot;
                if (robot.health > 0 && robot.health < robot.maxHealth && this.charge > 0 && DistanceSq(robot.x, robot.y, this.x, this.y) < Sq(this.sprite.width / 2)) {
                    players.push(robot);
                }
            }
            var amount = Math.min(HEAL_RATE * players.length, this.charge);
            this.charge -= amount;
            amount /= players.length;
            for (var i = 0; i < players.length; i++) {
                players[i].health += players[i].maxHealth * amount / 100;
                if (players[i].health > players[i].maxHealth) {
                    players[i].health = players[i].maxHealth;
                }
            }
        },

        draw: function() {
            canvas.strokeStyle = '#0ff';
            canvas.lineWidth = 30;
            canvas.beginPath();
            canvas.arc(this.x, this.y, this.sprite.width / 2 - 30, -Math.PI / 2, Math.PI * 2 * this.charge / HEALING_CAPACITY - Math.PI / 2);
            canvas.stroke();
            canvas.drawImage(this.sprite, this.x - this.sprite.width / 2, y - this.sprite.height / 2);
        }
    };
}