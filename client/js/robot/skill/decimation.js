/**
 * Sets up the decimation skill for the slayer that
 * doubles the damage of slayer's normal attacks for a duration
 *
 * @param {Player} player - player to set up for
 */
function skillDecimation(player) {

    /**
     * Activates the skill and applies a damage
     * buff when applicable
     */
    player.onUpdate = function() {
        if (this.isSkillCast()) {
            connection.ability(this);
            this.skillDuration = 420;
            this.skillCd = 300;
        }
        if (this.skillDuration > 0) {
            this.buff('power', 2, 2);
            this.fireData.sprite = 'abilityFire';
            this.laserData.sprite = 'abilityLaser';
        }
        else {
            this.fireData.sprite = 'fire';
            this.laserData.sprite = 'laser';
        }
    };
}