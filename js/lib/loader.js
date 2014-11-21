
// The table of loaded scripts
var SCRIPT_TAGS = {
    scriptCount: 0,
    onload: function(e) {
        SCRIPT_TAGS[e.target.id].loaded = true;
        SCRIPT_TAGS.scriptCount--;
        if (SCRIPT_TAGS.scriptCount == 0) {
            updateLoader();
        }
    }
};

// The pending extensions
var EXTENSIONS = [];

// The pending implements
var IMPLEMENTS = [];

/**
 * Makes the subclass extend the base class by copying
 * prototype methods over. Also provides a superconstructor
 * using "this.super(<params>)" which is overwritten when
 * extending multiple classes. Use implement instead if
 * not wanting the superconstructor.
 *
 * @param {string} sub  - the sub class doing the extending
 * @param {string} base - the base class being extended
 */
function extend(sub, base) {
    EXTENSIONS.push(sub, base);
}

/**
 * Makes the subclass implement the base class by copying
 * prototype methods over. This does not provide a
 * superconstructor. If you need one, use extend instead.
 *
 * @param {string} sub  - the sub class doing the implementing
 * @param {string} base - the base class being implemented
 */
function implement(sub, base) {
    IMPLEMENTS.push(sub, base);
}

/**
 * Updates the loader, launching an event when done
 */
function updateLoader() {

    var i, x, sub, base;

    // Extensions
    for (i = 0; i < EXTENSIONS.length; i += 2) {
        sub = window[EXTENSIONS[i]];
        base = window[EXTENSIONS[i + 1]];
        if (base && sub) {
            sub.prototype.super = base;
            for (x in base.prototype) {
                sub.prototype[x] = base.prototype[x];
            }
        }
    }

    // Implements
    for (i = 0; i < IMPLEMENTS.length; i += 2) {
        sub = window[EXTENSIONS[i]];
        base = window[EXTENSIONS[i + 1]];
        if (base && sub) {
            for (x in base.prototype) {
                sub.prototype[x] = base.prototype[x];
            }
        }
    }

    // Done event
    if (window['onLoaderDone']) {
        window['onLoaderDone']();
    }
}

/**
 * Loads a script asynchronously, launching the callback
 * when the script is loaded or immediately if it is
 * already loaded.
 *
 * @param {string}   script   - name of the script to load
 * @param {function} [callback] - callback for when it's done loading
 */
function depend(script, callback) {

    var tag;

    // If already loaded, run the callback
    if (SCRIPT_TAGS[script]) {
        var data = SCRIPT_TAGS[script];
        if (data.loaded) {
            if (callback) callback();
        }
        else data.tag.addEventListener('load', callback);
    }
    
    // See if any scripts already have the source
    else if (tag = document.querySelector('script[src="js/' + script + '.js')) {
        SCRIPT_TAGS[script] = { tag: tag, loaded: true };
        if (callback) callback();
    }
    
    // Set up the script
    else {
        var scriptTag = document.createElement('script');
        scriptTag.id = script;
        scriptTag.type = 'text/javascript';
        if (callback) scriptTag.addEventListener('load', callback);
        scriptTag.addEventListener('load', SCRIPT_TAGS.onload);
        SCRIPT_TAGS[script] = { tag: scriptTag, loaded: false };
        scriptTag.src = 'js/' + script + '.js';
        document.querySelector('head').appendChild(scriptTag);
    }
}