var images = {};
var iCount = 0;

// Retrieves an image by name
// name - name of the image
function GetImage(name) {
    if (name in images) {
        return images[name];
    }
    else {
        var img = new Image();
        img.src = "images/" + name + ".png";
        images[name] = img;
        return img;
    }
}