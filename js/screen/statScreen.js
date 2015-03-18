/**
 * Represents the screen displaying profile statistics
 */
function StatScreen() {

    PROFILE_DATA.Overall = {};

    this.boxes     = [];
    this.profiles  = [];
    this.most      = [];
    this.total     = [];
    this.index     = 0;
    this.scroll    = 0;
    this.maxScroll = 0;
    this.section   = 0;
    this.sections  = [{text: 'General', color: '#fff'}];
    this.input     = new KeyboardInput();
    
    this.setup();
}

/**
 * Draws the stat screen
 */
StatScreen.prototype.draw = function() {

    // Draw the background
    ui.drawBackground();

    // Left panel
    ui.ctx.fillStyle = '#000';
    ui.ctx.globalAlpha = 0.75;
    ui.ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height);
    ui.ctx.globalAlpha = 1;
    ui.ctx.fillStyle = '#333';
    ui.ctx.fillRect(300, 0, 25, ui.canvas.height);
    ui.ctx.fillStyle = '#878787';
    ui.ctx.fillRect(308, 0, 9, ui.canvas.height);

    // Profile list
    ui.ctx.font = '40px Flipbash';
    ui.ctx.textBaseline = 'middle';
    var i;
    for (i = 0; i < this.profiles.length; i++) {
        this.boxes[i].active = this.index == i;
        this.boxes[i].draw();
        ui.ctx.fillStyle = '#fff';
        ui.ctx.fillText(this.profiles[i], 10, i * 65 + 30);
    }

    // Get the data to show
    var data;
    if (this.section === 0) {
        data = new Profile(this.profiles[this.index]);
    }
    else {
        data = new RobotProfile(this.profiles[this.index], this.sections[this.section].text);
    }

    var yo = -this.scroll;

    // Section title
    ui.ctx.fillStyle = this.sections[this.section].color;
    ui.ctx.textAlign = 'center';
    ui.ctx.textBaseline = 'top';
    ui.ctx.font = '48px Flipbash';
    ui.ctx.fillText(this.sections[this.section].text + ' Stats', (ui.canvas.width + 325) / 2, yo + 10);
    yo += 70;

    // Most stats
    ui.ctx.fillStyle = 'white';
    ui.ctx.font = '40px Flipbash';
    ui.ctx.textAlign = 'left';
    ui.ctx.fillText('Highest Stats', 350, yo);
    yo += 65 + this.drawSection(data, this.most, 325, yo + 60);

    // Total stats
    ui.ctx.fillStyle = 'white';
    ui.ctx.font = '40px Flipbash';
    ui.ctx.textAlign = 'left';
    ui.ctx.textBaseline = 'top';
    ui.ctx.fillText('Totals', 350, yo);
    yo += 65 + this.drawSection(data, this.total, 325, yo + 60);

    // Robot graph
    var drawn = false;
    var r = Math.min(125, (ui.canvas.width - 325) / 8);
    if (this.section === 0) {
        var robotData = [];
        for (i = 0; i < PLAYER_DATA.length; i++) {
            robotData.push({
                text : PLAYER_DATA[i].name,
                color: PLAYER_DATA[i].color,
                value: data.getRobotStat(PLAYER_DATA[i].name, STAT.GAMES)
            });
        }
        drawn = this.drawGraph(345 + r, yo + 20 + r, r, robotData);
    }

    // Ability graph
    else {
        var abilityData = PLAYER_DATA[this.section - 1].skills;
        var graphData = [];
        for (i = 0; i < 3; i++) {
            var color;
            if (i === 0) color = '#0ff';
            if (i == 1) color = '#0f0';
            if (i == 2) color = '#00f';
            graphData.push({
                text : abilityData[i].name,
                color: color,
                value: data.getStat(abilityData[i].name)
            });
        }
        drawn = this.drawGraph(345 + r, yo + 20 + r, r, graphData);
    }
    if (drawn) {
        yo += 2 * r + 40;
    }

    // Update scroll information
    this.maxScroll = yo + this.scroll - ui.canvas.height;
    this.scroll = Math.max(0, Math.min(this.maxScroll, this.scroll));

    // Scroll button
    ui.ctx.fillStyle = '#333';
    ui.ctx.strokeStyle = '#000';
    ui.ctx.lineWidth = 10;
    var ratio = this.scroll / this.maxScroll;
    r = 30;
    var y = (ui.canvas.height - 2 * r) * ratio + r;
    ui.ctx.beginPath();
    ui.ctx.arc(312.5, y, r - 5, 0, Math.PI * 2);
    ui.ctx.fill();
    ui.ctx.stroke();

    // Draw the cursor
    ui.drawCursor();

    this.input.update();
    
    // Scroll using mouse
    if (this.input.button(SHOOT) == 1 && new Vector(312.5, y).distanceSq(new Vector(controls.mouse.x, controls.mouse.y)) <= sq(r)) {
        this.scrolling = true;
    }
    else if (!controls.mouse.left) {
        this.scrolling = false;
    }
    if (this.scrolling) {
        this.scroll = this.maxScroll * (controls.mouse.y - r) / (ui.canvas.height - 2 * r);
        this.scroll = Math.max(0, Math.min(this.maxScroll, this.scroll));
    }

    // Input
    if (this.input.button(CANCEL_1) == 1 || this.input.button(CANCEL_2) == 1) {
        gameScreen = new TitleScreen();
    }
    if (this.input.button(DOWN_1) == 1 || this.input.button(DOWN_2) == 1) {
        this.index = (this.index + 1) % this.profiles.length;
    }
    if (this.input.button(UP_1) == 1 || this.input.button(UP_2) == 1) {
        this.index = (this.index + this.profiles.length - 1) % this.profiles.length;
    }
    if (this.input.button(RIGHT_1) == 1 || this.input.button(RIGHT_2) == 1) {
        this.section = (this.section + 1) % this.sections.length;
    }
    if (this.input.button(LEFT_1) == 1 || this.input.button(LEFT_2) == 1) {
        this.section = (this.section - 1 + this.sections.length) % this.sections.length;
    }
};

/**
 * Draws a list of stats to the screen
 *
 * @param {Object} data - profile data to grab from
 * @param {Array}  list - stat list to include in the section
 * @param {Number} xo   - horizontal offset of the first ui.canvas
 * @param {Number} yo   - vertical offset of the first ui.canvas
 *
 * @returns {Number} the height of the section
 */
StatScreen.prototype.drawSection = function(data, list, xo, yo) {

    var columns = Math.floor((ui.canvas.width - 325) / 225);
    var rows = Math.ceil(list.length / columns);
    var width = (ui.canvas.width - 325) / columns;
    var scale = width / 400;
    var i = 0;

    ui.ctx.font = Math.round(42 * scale) + 'px Flipbash';
    ui.ctx.textBaseline = 'middle';
    ui.ctx.textAlign = 'left';

    for (var j = 0; j < list.length; j++) {
        var stat = list[j].img;
        var key = list[j].stat;

        var img = images.get('stat' + stat);
        var row = Math.floor(i / columns);
        var col = i % columns;
        var x = xo + col * width;
        var y = yo + row * img.height * scale;
        i++;

        // Base image
        ui.ctx.drawImage(img, x, y, width, img.height * scale);

        // Text
        ui.ctx.fillStyle = '#fff';
        ui.ctx.fillText(stat, x + 150 * scale, y + 25 * scale);
        ui.ctx.fillStyle = '#0f0';
        ui.ctx.fillText(this.format(data.getStat(key)), x + 150 * scale, y + 85 * scale);
    }

    return rows * (119 * scale);
};

/**
 * Draws a graph for statistic data
 *
 * @param {Number} x    - The horizontal offset of the graph
 * @param {Number} y    - The vertical offset of the graph
 * @param {Number} r    - The radius of the pie graph
 * @param {Object} data - Data to use in the graph
 *
 * @returns true if the graph was drawn, false otherwise
 */
StatScreen.prototype.drawGraph = function(x, y, r, data) {

    // Get total weight
    var total = 0;
    var i;
    for (i = 0; i < data.length; i++) {
        total += data[i].value;
    }
    if (total === 0) return false;

    // Draw the graph
    var cumulative = 0;
    var spacing = 2 * r / Math.max(3, data.length);
    ui.ctx.font = (spacing * 0.75) + 'px Flipbash';
    ui.ctx.textBaseline = 'middile';
    ui.ctx.textAlign = 'left';
    ui.ctx.lineWidth = 1;
    for (i = 0; i < data.length; i++) {
        var angle = Math.PI * 2 * data[i].value / total;
        var start = cumulative;
        cumulative += angle;
        var end = cumulative;
        ui.ctx.fillStyle = data[i].color;
        data.strokeStyle = '#000';
        ui.ctx.beginPath();
        ui.ctx.arc(x, y, r, start, end);
        ui.ctx.lineTo(x, y);
        ui.ctx.closePath();
        ui.ctx.fill();
        ui.ctx.stroke();

        var keyY = y - r + i * spacing + spacing / 2;
        var squareSize = Math.min(spacing - 10, 25);
        ui.ctx.fillRect(x + r + 20, keyY - squareSize / 2, squareSize, squareSize);
        ui.ctx.fillText(data[i].text, x + r + squareSize + 30, keyY);
    }

    return true;
};

/**
 * Formats a number for the stats, reducing large numbers
 * using suffixes and trimming decimals.
 *
 * @param {Number} num - the number to format
 *
 * @returns {string} formatted number string
 */
StatScreen.prototype.format = function(num) {
    if (num >= 10000000) {
        return (num / 1000000).toFixed(0) + 'M';
    }
    else if (num >= 10000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    else return num.toFixed(0);
};

/**
 * Applies mouse scrolling to the scroll of the page
 *
 * @param {Event} e - event details
 */
StatScreen.prototype.applyScroll = function(e) {
    this.scroll = Math.max(0, Math.min(this.maxScroll, this.scroll + e.deltaY / 4));
    e.preventDefault();
    e.returnValue = false;
    this.scrolling = false;
};

/**
 * Sets up the stat screen
 */
StatScreen.prototype.setup = function() {

    // Initialize UI boxes
    this.profiles.push('Overall');
    this.boxes[0] = new UIBox(false, 0, 250, 300, 60);
    var i = 1;
    for (var profile in PROFILE_DATA) {
        if (profile != 'Overall') {
            this.profiles.push(profile);
            this.boxes[i] = new UIBox(false, i * 65, 250, 300, 60);
            i++;
        }
    }

    // Calculate overall stats
    i = 0;
    var data = PROFILE_DATA.Overall;
    var stat, name, value, j;
    for (stat in STAT) {
        name = STAT[stat];
        
        data[name] = 0;

        if (stat == 'LAST_10') continue;

        var imageName = stat.replace(/[^_]+[_]/g, '');
        imageName = imageName[0] + imageName.substring(1).toLowerCase();
        var statData = {img: imageName, stat: name};
        if (name == STAT.BEST_SCORE || name == STAT.HIGHEST_LEVEL || stat.match(/MOST/g)) {
            if (name != STAT.MOST_KILLS) {
                this.most.push(statData);
            }
        }
        else this.total.push(statData);

        for (j = 1; j < this.profiles.length; j++) {

            value = new Profile(this.profiles[j]).getStat(name);

            // "Most" stats
            if (i >= 6 && i < 14) {
                data[name] = Math.max(data[name], value);
            }

            // "Total" stats
            else {
                data[name] += value;
            }
        }

        i++;
    }
    for (var k = 0; k < PLAYER_DATA.length; k++) {
        var robotName = PLAYER_DATA[k].name;
        data[robotName] = {};

        this.sections.push({text: robotName, color: PLAYER_DATA[k].color});

        i = 0;
        for (stat in STAT) {

            name = STAT[stat];

            data[robotName][name] = 0;

            if (stat == 'LAST_10') continue;

            for (j = 1; j < this.profiles.length; j++) {

                value = new Profile(this.profiles[j]).getRobotStat(robotName, name);

                // "Most" stats
                if (i >= 6 && i < 14) {
                    data[robotName][name] = Math.max(data[robotName][name], value);
                }

                // "Total" stats
                else {
                    data[robotName][name] += value;
                }
            }

            i++;
        }
        for (i = 0; i < 3; i++) {
            var ability = PLAYER_DATA[k].skills[i].name;

            data[robotName][ability] = 0;

            if (stat == 'LAST_10') continue;

            for (j = 1; j < this.profiles.length; j++) {

                value = new Profile(this.profiles[j]).getRobotStat(robotName, ability);
                data[robotName][ability] += value;
            }
        }
    }

    this.wheel = document.onmousewheel;
    document.onmousewheel = this.applyScroll.bind(this);
};