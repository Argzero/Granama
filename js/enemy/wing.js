// A wing/abdomen pair for an enemy (like those used by the Hive Queen boss and her minions
function EnemyWings(source, name, dx, dy) {
    return {

        source : source,
        abdomen: GetImage(name + 'Abdomen'),
        wings  : [GetImage(name + 'WingRight'), GetImage(name + 'WingLeft')],
        dx     : dx,
        dy     : dy,
        frame  : 0,

        // Draws the wings and abdomen of the enemy
        draw   : function() {

            // Abdomen
            canvas.save();
            canvas.translate(this.source.sprite.width / 2, this.source.sprite.height / 2);
            canvas.transform(this.source.sin, -this.source.cos, this.source.cos, this.source.sin, 0, 0);
            canvas.drawImage(this.abdomen, -this.abdomen.width / 2, -this.abdomen.height + dy);

            // Wings
            for (var i = 0; i < 2; i++) {
                var m = 2 * i - 1;
                canvas.save();
                canvas.translate(dx * m, dy);
                var angle = m * (Math.abs(10 - this.frame) - 4) * (Math.PI / 20);
                canvas.rotate(angle);
                canvas.drawImage(this.wings[i], (i - 1) * this.wings[i].width, -this.wings[i].height);
                this.frame = (this.frame + 1) % 20;
                canvas.restore();
            }
            canvas.restore();
        }
    };
}