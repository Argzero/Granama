/**
 * Sets up the Overdrive skill for the player which
 * gives them a speed and attack rate buff while
 * leaving behind ghost images of themselves
 *
 * @param {Player} player - player to set up for
 */
function skillOverdrive(player) {

    // List of player copies when running fast
    player.copies = [];

    /**
     * Applies casting the ability, applying buffs,
     * and creating ghost images each frame
     */
    player.onUpdate = function() {

        // Activating the ability
        if (this.isSkillCast()) {
            this.skillDuration = 300;
            this.skillCd = 960 * this.cdm;
            this.rm = 0.75;
            this.buff('speed', 1.5, this.skillDuration);
        }
        if (this.skillDuration <= 0) {
            this.rm = 1;
        }

        // Update the alphas of copies and remove them when fully transparent
        var copy;
        for (var i = 0; i < this.copies.length; i++) {
            copy = this.copies[i];

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
            if (this.skillDuration % 10 === 0) {
                copy = new Sprite('pSpeedBody', this.pos.x, this.pos.y);
                copy.rotation = this.rotation.clone();
                copy.alpha = 0.9;
                copy.postChildren = this.postChildren;
                this.copies.push(copy);
            }
        }
    };

    /**
     * Draws the ghost images before the player is drawn
     */
    player.onPreDraw = function() {
        for (var i = 0; i < this.copies.length; i++) {
            var copy = this.copies[i];
            copy.move(-this.pos.x, -this.pos.y);
            copy.draw(camera);
            copy.move(this.pos.x, this.pos.y);
        }
    };
}