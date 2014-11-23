function SkillPiercingArrow(player) {
    player.onMove = function() {

        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillCd = 360;
            var arrow = SlowProjectile(
                GetImage('abilityArrow'),
                this,
                0,
                40,
                this.cos * 15,
                this.sin * 15,
                this.angle,
                this.GetDamageMultiplier() * 20,
                1249,
                true,
                true,
                0.5,
                300
            );
            arrow.updateBase = arrow.Update;
            arrow.drawBase = arrow.Draw;
            arrow.Update = piercingArrowUpdate;
            arrow.Draw = piercingArrowDraw;
            arrow.n1 = Vector(-this.sin * COS_60 - this.cos * SIN_60, -this.sin * SIN_60 + this.cos * COS_60);
            arrow.n2 = Vector(this.sin * COS_60 - this.cos * SIN_60, -this.sin * SIN_60 - this.cos * COS_60);
            arrow.n3 = Vector(-this.sin, this.cos);
            this.bullets.push(arrow);
        }
    }
}

var PA_KNOCKBACK = 200;

function piercingArrowUpdate() {
    for (var i = 0; i < gameScreen.enemyManager.enemies.length; i++) {
        var target = gameScreen.enemyManager.enemies[i];
        if (target.Knockback && DistanceSq(target.x, target.y, this.x, this.y) < 90000) {
            var rel = Vector(target.x - this.x + this.velX * 5, target.y - this.y + this.velY * 5);
            if (rel.Dot(this.n1) > 0 && rel.Dot(this.n2) > 0) {
                if (rel.Dot(this.n3) > 0) {
                    target.Knockback(-PA_KNOCKBACK * this.n1.x, -PA_KNOCKBACK * this.n1.y);
                }
                else {
                    target.Knockback(-PA_KNOCKBACK * this.n2.x, -PA_KNOCKBACK * this.n2.y);
                }
            }
        }
    }
    this.updateBase();
}

function piercingArrowDraw() {
    this.drawBase();
    canvas.strokeStyle = 'red';
    canvas.lineWidth = 3;
    canvas.beginPath();
    canvas.moveTo(this.x - this.velX * 5, this.y - this.velY * 5);
    canvas.lineTo(this.x - this.velX * 5 - this.n1.x * 50, this.y - this.velY * 5 - this.n1.y * 50);
    canvas.stroke();
    canvas.strokeStyle = 'blue';
    canvas.beginPath();
    canvas.moveTo(this.x - this.velX * 5, this.y - this.velY * 5);
    canvas.lineTo(this.x - this.velX * 5 - this.n2.x * 50, this.y - this.velY * 5 - this.n2.y * 50);
    canvas.stroke();
}