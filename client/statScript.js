// Available stats
var STAT = {

    TOTAL_KILLS   : 'kills',
    TOTAL_DEATHS  : 'deaths',
    TOTAL_RESCUES : 'rescues',
    TOTAL_DEALT   : 'dealt',
    TOTAL_TAKEN   : 'taken',
    TOTAL_ABSORBED: 'absorbed',
    TOTAL_EXP     : 'exp',

    MOST_KILLS   : 'mKills',
    MOST_DEATHS  : 'mDeaths',
    MOST_RESCUES : 'mRescues',
    MOST_DEALT   : 'mDealt',
    MOST_TAKEN   : 'mTaken',
    MOST_ABSORBED: 'mAbsorbed',

    LAST_10      : 'last',
    BEST_SCORE   : 'score',
    HIGHEST_LEVEL: 'level',
    GAMES        : 'games'
};

var ROBOTS = [
    'Angel',
    'Beta',
    'Blitz',
    'Commando',
    'Guardian',
    'Knight',
    'Meteor',
    'Slayer',
    'Valkyrie'
];

var COLORS = [
    '#fff', // Angel
    '#727', // Beta
    '#00f', // Blitz
    '#070', // Commando
    '#d0d', // Guardian
    '#fcf', // Knight
    '#099', // Meteor
    '#0f0', // Slayer
    '#0ff'  // Valkyrie
];

var REGEX = {
    TOTAL_HINT: new RegExp(/^(TOTAL_)|(GAMES)/),
    RECORD_HINT: new RegExp(/^(MOST_)|(BEST_)|(HIGHEST_)/),
    IMAGE_NAME: new RegExp(/[^_]+[_]/g)
};

var robotSelector;
var compareInput;
var robot;
var data = {};
var selected;
var canvas;
var ctx;
var usage;

/**
 * Handles the resizing of the page by also 
 * resizing the canvas appropriately
 */
function handleResize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    apply(data);
}
window.onresize = handleResize;

/**
 * Set up the page on load
 */
window.addEventListener('load', function() {
    
    // Grab commonly used elements
	robotSelector = document.getElementById('robot');
	compareInput = document.getElementById('compare');
    canvas = document.getElementById('usage');
    ctx = canvas.getContext('2d');
    usage = document.getElementById('usageTitle');
    
    var tools = document.getElementById('tools');
    
    // Add the overall button on the left
    var overall = document.createElement('div');
    selected = overall;
    overall.className = 'robot selected';
    overall.innerHTML = 'Overall';
    overall.style.backgroundImage = 'url("assets/images/bossDragonHead.png")';
    overall.onclick = function(e) {
        if (selected) selected.className = 'robot';
        this.className = 'robot selected';
        selected = this;
        robot = undefined;
        apply(data);
    };
    tools.appendChild(overall);
    
    // Add robot buttons along the left
    var option;
    var clickHandler = function(e) {
        if (selected) selected.className = 'robot';
        this.className = 'robot selected';
        selected = this;
        robot = this.innerHTML;
        apply(data);
    };
    for (var i = 0; i < ROBOTS.length; i++) {
        option = document.createElement('div');
        option.className = 'robot';
        option.innerHTML = ROBOTS[i];
        option.style.backgroundImage = "url('assets/images/p" + ROBOTS[i] + ".png')";
        option.onclick = clickHandler;
        tools.appendChild(option);
    }
    
    // Searching for the stats of another user
    document.getElementById('user').onkeydown = function(e) {
        if (e.keyCode != 13) return; 
        requestData(this.value);
    };
    
    // Logging out of the session
    document.getElementById('logout').onclick = function(e) {
        logout();
    };
    
    // Start of requesting the stats of the signed in user
    requestData('');
    
    // Update the canvas resolution
    handleResize();
});

/**
 * Applies data to the page, replacing displayed stats with the supplied ones
 *
 * @param {Object} data - the data to show
 */ 
function apply(data) {
    
    // If filtered to a specific robot, show those stats instead
	if (robot) {
		data = data[robot] || {};
	}
    
    var keys = Object.keys(STAT);
    
    // Add stat totals
    var target = document.getElementById('totals');
    appendStats(target, data, keys, REGEX.TOTAL_HINT);
    
    // Add stat records
    target = document.getElementById('records');
    appendStats(target, data, keys, REGEX.RECORD_HINT);
    
    // Update the title for the robot being shown
    target = document.getElementById('robot');
    target.innerHTML = robot || 'Overall';
    target.style.color = robot ? COLORS[ROBOTS.indexOf(robot)] : '#f90';
    
    // Robot usage graph
    if (!robot) {
        var robotData = [];
        var games;
        for (i = 0; i < ROBOTS.length; i++) {
            games = (data[ROBOTS[i]] || {}).games || 0;
            if (games > 0) {
                robotData.push({
                    text : ROBOTS[i],
                    color: COLORS[i],
                    value: games
                });
            }
        }
        if (robotData.length > 0) {
            canvas.style.display = 'block';
            usage.style.display = 'block';
            drawGraph(robotData);
        }
        else {
            canvas.style.display = 'none';
            usage.style.display = 'none';
        }
    }
    
    // Ability usage graph
    else {
        var skillColors = [ '#0ff', '#f0f', '#88f' ];
        var skillData = [];
        var skills = data.skills || {};
        var skillKeys = Object.keys(skills);
        if (skillKeys.length > 0) {
            canvas.style.display = 'block';
            usage.style.display = 'block';
            for (i = 0; i < skillKeys.length; i++) {
                skillData.push({
                    text : skillKeys[i],
                    color: skillColors[i],
                    value: skills[skillKeys[i]]
                });
            }
            drawGraph(skillData);
        }
        else {
            canvas.style.display = 'none';
            usage.style.display = 'none';
        }
    }
}

/**
 * Appends a list of stats to a section
 *
 * @param {HTMLElement} target - the section to append the stats to
 * @param {Object}      data   - the data to use
 * @param {Array}       keys   - the list of keys of the data to go through
 * @param {RegExp}      hint   - the pattern the key must match to fit with the group
 */
function appendStats(target, data, keys, hint) {
    target.innerHTML = '';
    var i, stat, title, value, key, imageName;
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        
        // Make sure it's an appropriate stat
        if (key.match(hint)) {
            
            // Create the container for the info
            stat = document.createElement('div');
            stat.className = 'stat';
            
            // Set the background image
            imageName = key.replace(REGEX.IMAGE_NAME, '');
            imageName = imageName[0] + imageName.substring(1).toLowerCase();
            stat.style.backgroundImage = "url('assets/images/stat" + imageName + ".png')";
            
            // Add the title
            title = document.createElement('h4');
            title.innerHTML = imageName;
            stat.appendChild(title);
            
            // Add the value
            value = document.createElement('h5');
            value.innerHTML = formatStat(data[STAT[key]] || 0);
            stat.appendChild(value);
            
            // Append it to the target
            target.appendChild(stat);
        }
    }
}

/**
 * Formats a number for the stats, reducing large numbers
 * using suffixes and trimming decimals.
 *
 * @param {Number} num - the number to format
 *
 * @returns {string} formatted number string
 */
function formatStat(num) {
    if (num >= 1e13) {
        return (num / 1e12).toFixed(0) + 'T';
    }
    else if (num >= 1e10) {
        return (num / 1e9).toFixed(0) + 'G';
    }
    else if (num >= 1e7) {
        return (num / 1e6).toFixed(0) + 'M';
    }
    else if (num >= 1e4) {
        return (num / 1e3).toFixed(0) + 'K';
    }
    else return num.toFixed(0);
}

/**
 * Draws a graph for statistic data
 *
 * @param {Object} data - Data to use in the graph
 *
 * @returns true if the graph was drawn, false otherwise
 */
function drawGraph(data) {
    
    // Clear any previously drawn graphs
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get the dimensions
    var r = Math.min(150, canvas.width / 4);
    var x = r;
    var y = r;
    
    // Update the canvas size if needed
    if (canvas.clientHeight != 2 * r) {
        canvas.style.height = (2 * r) + 'px';
        canvas.height = 2 * r;
    } 
    
    
    // Get total weight
    var total = 0;
    var i;
    for (i = 0; i < data.length; i++) {
        total += data[i].value;
    }
    if (total === 0) return false;

    // Draw the graph
    var cumulative = 0;
    var spacing = 2 * r / Math.max(9, data.length);
    ctx.font = (spacing * 0.75) + 'px Flipbash';
    ctx.textBaseline = 'middile';
    ctx.textAlign = 'left';
    ctx.lineWidth = 1;
    for (i = 0; i < data.length; i++) {
        var angle = Math.PI * 2 * data[i].value / total;
        var start = cumulative;
        cumulative += angle;
        var end = cumulative;
        ctx.fillStyle = data[i].color;
        data.strokeStyle = '#000';
        ctx.beginPath();
        ctx.arc(x, y, r, start, end);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw the legend to the side
        var keyY = y - r + i * spacing + spacing / 2 + 5;
        var squareSize = Math.min(spacing - 10, 25);
        ctx.fillRect(x + r + 20, keyY - squareSize, squareSize, squareSize);
        ctx.fillText(data[i].text, x + r + squareSize + 30, keyY);
    }

    return true;
}

/**
 * Requests account data from the server, applying it to the screen
 * if the request comes back successful
 *
 * @param {string} account - the name of the account to get the stats for (empty for own stats)
 */
function requestData(account) {
    $.ajax({
        cache: false,
        type: "POST",
        url: "/account",
        data: {
            account: account.toUpperCase()
        },
        dataType: "json",
        success: function(result, status, xhr) {
            data = result.profile;
            document.getElementById('title').innerHTML = result.username;
            var input = document.getElementById('user');
            input.value = '';
            input.placeholder = 'Search';
            apply(data);
        },
        error: function(xhr, status, error) {
            var input = document.getElementById('user');
            input.value = '';
            input.placeholder = 'Invalid Username';
        }
    });
}

/**
 * Logs the user out of the session
 */
function logout() {
    $.ajax({
        cache: false,
        type: "POST",
        url: "/logout",
        dataType: "json",
        success: function(result, status, xhr) {
            window.location = result.redirect;
        },
        error: function(xhr, status, error) { 
            console.log(error);
        }
    });
}