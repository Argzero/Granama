function SkillOverdrive(player) {

    // List of player copies when running fast
    player.copies = [];

    player.onMove = function(speed) {

        // Activating the ability
        if (this.IsSkillCast()) {
            this.skillDuration = 300;
            this.skillCd = 960 * this.cdm;
            this.rm = 0.75;
        }
        if (this.skillDuration <= 0) {
            this.rm = 1;
        }

        // Update the alphas of copies and remove them when fully transparent
        for (var i = 0; i < this.copies.length; i++) {
            var copy = this.copies[i];

            // Update the alpha
            copy.alpha -= 0.01;
            if (copy.alpha <= 0) {
                this.copies.splice(i, 1);
                i--;
            }
        }

        // Effects while active
        if (this.skillDuration > 0) {

            // Make a new copy every 5 frames
            if (this.skillDuration % 5 == 0) {
                this.copies.push({x: this.x, y: this.y, cos: this.cos, sin: this.sin, alpha: 0.9});
            }

            // Double the speed
            return speed * 1.5;
        }
    };

    // Draw the copies while active
    player.onPreDraw = function() {

        for (var i = 0; i < this.copies.length; i++) {
            var copy = this.copies[i];

            // Draw the copy
            canvas.translate(copy.x, copy.y);
            canvas.transform(copy.sin, -copy.cos, copy.cos, copy.sin, 0, 0);
            canvas.globalAlpha = copy.alpha;
            this.drawParts();
            ResetTransform(canvas);
        }
        canvas.globalAlpha = 1;
    };
}