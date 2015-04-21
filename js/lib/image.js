// Helper for loading images
var images = {

    // List of laded images
    loaded: {},

    /**
     * Loads an image and returns it
     *
     * @param name       - name of the image
     * @param [callback] - callback function
     * @returns {Image} the loaded image
     */
    get: function(name, callback) {

        // Image is already loaded
        if (name in this.loaded) {

            // Call the handler since the image is already loaded
            if (callback) {
                callback();
            }

            return this.loaded[name];
        }

        // Load a new image
        else {
            var img = new Image();

            // Apply the handler
            if (callback) {
                img.onload = callback;
            }

            img.src = "/assets/images/" + name + ".png";
            this.loaded[name] = img;
            return img;
        }
    }
};