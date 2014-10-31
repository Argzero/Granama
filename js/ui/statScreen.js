function StatScreen() {
    
    PROFILE_DATA['Overall'] = {};

    var obj = {
        
        boxes: [],
        profiles: [],
		most: [],
		total: [],
        index: 0,
		scroll: 0,
		maxScroll: 0,
        section: 0,
        sections: [{ text: 'General', color: '#fff' }],
        input: StandardInput(),
        
        Draw: function() {
            
            // Draw the background
            if (tile && tile.width) {
                for (var i = 0; i < element.width / tile.width + 1; i++) {
                    var x = i * tile.width;
                    for (var j = 0; j < element.height / tile.height + 1; j++) {
                        canvas.drawImage(tile, x, j * tile.height);
                    }
                }
            }
            
            // Left panel
            canvas.fillStyle = '#000';
            canvas.globalAlpha = 0.75;
            canvas.fillRect(0, 0, element.width, element.height);
            canvas.globalAlpha = 1;
            canvas.fillStyle = '#333';
            canvas.fillRect(300, 0, 25, element.height);
            canvas.fillStyle = '#878787';
            canvas.fillRect(308, 0, 9, element.height);
            
            // Profile list
            canvas.font = '40px Flipbash';
            canvas.textBaseline = 'middle';
            for (var i = 0; i < this.profiles.length; i++) {
                this.boxes[i].active = this.index == i;
                this.boxes[i].draw();
                canvas.fillStyle = '#fff';
                canvas.fillText(this.profiles[i], 10, i * 65 + 30);
            }
            
            // Get the data to show
            var data;
            if (this.section == 0) {
                data = Profile(this.profiles[this.index]);
            }
            else {
                data = RobotProfile(this.profiles[this.index], this.sections[this.section].text);
            }
            
            var yo = -this.scroll;
            
            // Section title
            canvas.fillStyle = this.sections[this.section].color;
            canvas.textAlign = 'center';
            canvas.textBaseline = 'top';
            canvas.font = '48px Flipbash';
			canvas.fillText(this.sections[this.section].text + ' Stats', (element.width + 325) / 2, yo + 10);
            yo += 70;
            
            // Most stats
			canvas.fillStyle = 'white';
			canvas.font = '40px Flipbash';
			canvas.textAlign = 'left';
			canvas.fillText('Highest Stats', 350, yo);
			yo += 65 + this.drawSection(data, this.most, 325, yo + 60);
			
			// Total stats
			canvas.fillStyle = 'white';
			canvas.font = '40px Flipbash';
			canvas.textAlign = 'left';
			canvas.textBaseline = 'top';
			canvas.fillText('Totals', 350, yo);
			yo += 65 + this.drawSection(data, this.total, 325, yo + 60);
			
			// Robot graph
            var drawn = false;
            var r = Math.min(125, (element.width - 325) / 8);
            if (this.section == 0) {
                var robotData = [];
                for (var i = 0; i < PLAYER_DATA.length; i++) {
                    robotData.push({
                        text: PLAYER_DATA[i].name,
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
                for (var i = 0; i < 3; i++) {
                    var color;
                    if (i == 0) color = '#0ff';
                    if (i == 1) color = '#0f0';
                    if (i == 2) color = '#00f';
                    graphData.push({
                        text: abilityData[i].name,
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
			this.maxScroll = yo + this.scroll - element.height;
			this.scroll = Math.max(0, Math.min(this.maxScroll, this.scroll));
			
            // Scroll button
            canvas.fillStyle = '#333';
            canvas.strokeStyle = '#000';
            canvas.lineWidth = 10;
            var ratio = this.scroll / this.maxScroll
            var r = 30;
            var y = (element.height - 2 * r) * ratio + r;
            canvas.beginPath();
            canvas.arc(312.5, y, r - 5, 0, Math.PI * 2);
            canvas.fill();
            canvas.stroke();
            
            // Draw the cursor
            canvas.drawImage(cursor, mx - cursor.width / 2, my - cursor.height / 2);
            
            // Scroll using mouse
            if (this.input.shoot == 1 && DistanceSq(312.5, y, mx, my) <= Sq(r)) {
                this.scrolling = true;
            }
            else if (this.input.shoot == 0) {
                this.scrolling = false;
            }
            if (this.scrolling) {
                this.scroll = this.maxScroll * (my - r) / (element.height - 2 * r);
                this.scroll = Math.max(0, Math.min(this.maxScroll, this.scroll));
            }
            
            // Input
            this.input.update();
            if (this.input.cancel == 1) {
                gameScreen = new TitleScreen();
            }
            if (this.input.down == 1) {
                this.index = (this.index + 1) % this.profiles.length;
            }
            if (this.input.up == 1) {
                this.index = (this.index + this.profiles.length - 1) % this.profiles.length;
            }
            if (this.input.right == 1) {
                this.section = (this.section + 1) % this.sections.length;
            }
            if (this.input.left == 1) {
                this.section = (this.section - 1 + this.sections.length) % this.sections.length;
            }
        },
		
		drawSection: function(data, list, xo, yo) {
			
			var columns = Math.floor((element.width - 325) / 225);
			var rows = Math.ceil(list.length / columns);
			var width = (element.width - 325) / columns;
			var scale = width / 400;
			var i = 0;
			
			canvas.font = Math.round(42 * scale) + 'px Flipbash';
			canvas.textBaseline = 'middle';
			canvas.textAlign = 'left';
			
			for (var j = 0; j < list.length; j++) {
				var stat = list[j].img;
				var key = list[j].stat;
			
				var img = GetImage('stat' + stat);
				var row = Math.floor(i / columns);
				var col = i % columns;
				var x = xo + col * width;
				var y = yo + row * img.height * scale;
				i++;
			
				// Base image
				canvas.drawImage(img, x, y, width, img.height * scale);
				
				// Text
				canvas.fillStyle = '#fff';
				canvas.fillText(stat, x + 150 * scale, y + 25 * scale);
				canvas.fillStyle = '#0f0';
				canvas.fillText(this.format(data.getStat(key)), x + 150 * scale, y + 85 * scale);
			}
			
			return rows * (119 * scale);
		},
		
		// Draws a graph using the provided data
		drawGraph: function(x, y, r, data) {
			
			// Get total weight
			var total = 0;
			for (var i = 0; i < data.length; i++) {
				total += data[i].value;
			}
			if (total == 0) return false;
			
			// Draw the graph
			var cumulative = 0;
			var spacing = 2 * r / data.length;
			canvas.font = (spacing * 0.75) + 'px Flipbash';
			canvas.textBaseline = 'middile';
			canvas.textAlign = 'left';
            canvas.lineWidth = 1;
			for (var i = 0; i < data.length; i++) {
				var angle = Math.PI * 2 * data[i].value / total;
				var start = cumulative;
				cumulative += angle;
				var end = cumulative;
				canvas.fillStyle = data[i].color;
				data.strokeStyle = '#000';
				canvas.beginPath();
				canvas.arc(x, y, r, start, end);
				canvas.lineTo(x, y);
				canvas.closePath();
				canvas.fill();
				canvas.stroke();
				
				var keyY = y - r + i * spacing + spacing / 2;
				var squareSize = Math.min(spacing - 10, 25);
				canvas.fillRect(x + r + 20, keyY - squareSize / 2, squareSize, squareSize);
				canvas.fillText(data[i].text, x + r + squareSize + 30, keyY);
			}
            
            return true;
		},
        
        format: function(num) {
            if (num >= 10000000) {
                return (num / 1000000).toFixed(0) + 'M';
            }
            else if (num >= 10000) {
                return (num / 1000).toFixed(0) + 'K';
            }
            else return num.toFixed(0);
        },
		
		applyScroll: function(e) {
			this.scroll = Math.max(0, Math.min(this.maxScroll, this.scroll + e.deltaY / 4));
			e.preventDefault();
			e.returnValue = false;
            this.scrolling = false;
		}
    };
    
    // Initialize UI boxes
    obj.profiles.push('Overall');
    obj.boxes[0] = UIBox(false, 0, 250, 300, 60);
    var i = 1;
    for (var profile in PROFILE_DATA) {
        if (profile != 'Overall') {
            obj.profiles.push(profile);
            obj.boxes[i] = UIBox(false, i * 65, 250, 300, 60);
            i++;
        }
    }
    
    // Calculate overall stats
    var i = 0;
    var data = PROFILE_DATA['Overall'];
    for (var stat in STAT) {
    
        var name = STAT[stat];
		
        data[name] = 0;
    
        if (stat == 'LAST_10') continue;
    
		var imageName = stat.replace(/[^_]+[_]/g, '');
		imageName = imageName[0] + imageName.substring(1).toLowerCase();
		var statData = { img: imageName, stat: name };
		if (name == STAT.BEST_SCORE || name == STAT.HIGHEST_LEVEL || stat.match(/MOST/g)) {
            if (name != STAT.MOST_KILLS) {
                obj.most.push(statData);
            }
		}
		else obj.total.push(statData);
	
        for (var j = 1; j < obj.profiles.length; j++) {
            
            var value = Profile(obj.profiles[j]).getStat(name);
        
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
        
        obj.sections.push({ text: robotName, color: PLAYER_DATA[k].color });
		
		var i = 0;
		for (var stat in STAT) {
    
			var name = STAT[stat];
			
			data[robotName][name] = 0;
		
			if (stat == 'LAST_10') continue;
		
			for (var j = 1; j < obj.profiles.length; j++) {
				
				var value = Profile(obj.profiles[j]).getRobotStat(robotName, name);
			
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
        for (var i = 0; i < 3; i++) {
            var ability = PLAYER_DATA[k].skills[i].name;
    
			data[robotName][ability] = 0;
		
			if (stat == 'LAST_10') continue;
		
			for (var j = 1; j < obj.profiles.length; j++) {
				
				var value = Profile(obj.profiles[j]).getRobotStat(robotName, ability);
                data[robotName][ability] += value;
			}
		}
	}
	
	obj.wheel = document.onmousewheel
	document.onmousewheel = obj.applyScroll.bind(obj);
    
    return obj;
}