var images = {};

// Retrieves an image by name
//        name - name of the image
// loadHandler - method to handle when the image finishes loading
function GetImage(name, loadHandler) {

    // Image is already loaded
    if (name in images) {

        // Call the handler since the image is already loaded
        if (loadHandler) {
            loadHandler();
        }

        return images[name];
    }

    // Load a new image
    else {
        var img = new Image();

        // Apply the handler
        if (loadHandler) {
            img.onload = loadHandler;
        }

        img.src = "images/" + name + ".png";
        images[name] = img;
        return img;
    }
}