/**
 * Manges playing music for the game
 */
function MusicManager() {
    this.music = undefined;
    this.current = undefined;
    this.files = {};
}

/**
 * Updates the music of the game, playing the given song
 */
MusicManager.prototype.updateMusic = function(song) {

    // Player must be alive for the music to play
    if (song) {

        // Initially load the music if it isn't already
        if (!this.files[song]) {
            this.files[song] = new Audio("sound/" + song + ".mp3");
            this.music.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
            this.music.volume = 0;
        }
        
        // Transition to the new song 
        if (this.current != song) {
            if (this.music && this.music.volume) {
                this.music.volume = Math.max(0, this.music.volume - 0.005);
                if (this.music.volume == 0) this.music.pause();
            }
            else {
                this.current = song;
                this.music = this.files[song];
                this.music.play();
            }
        }

        // Gradually get louder after loading
        else if (this.music.volume < 1) {
            var newVolume = this.music.volume + 0.005;
            if (newVolume > 1) {
                newVolume = 1;
            }
            this.music.volume = newVolume;
        }
    }

    // Fade out and then stop when the player dies
    else if (this.music) {
        var newVolume = this.music.volume - 0.002;
        if (newVolume <= 0) {
            this.music.pause();
            this.music = false;
            this.current = undefined;
        }
        else {
            this.music.volume = newVolume;
        }
    }
};

/**
 * Checks whether or not music is playing
 *
 * @returns {boolean} true if playing, false otherwise
 */
MusicManager.prototype.isMusicPlaying = function() {
    return this.music !== undefined;
}

/*
// Move to the end screen
endScreen.setup(gameScreen);
gameScreen = endScreen;
*/