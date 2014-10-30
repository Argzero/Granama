function StatScreen() {
    var obj = {
        
        boxes: [],
        profiles: [],
        index: 0,
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
            canvas.fillRect(0, 0, 300, element.height);
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
            
            // Right panel
            canvas.fillStyle = '#000';
            canvas.fillRect(350, 25, element.width - 400, element.height - 50);
            canvas.fillStyle = '#333';
            canvas.fillRect(360, 35, element.width - 420, element.height - 70);
            
            // Stats
            var data = Profile(this.profiles[this.index]);
            var i = 0;
            canvas.font = '32px Flipbash';
            canvas.textBaseline = 'top';
            for (var stat in STAT) {
                canvas.fillStyle = '#fff';
                canvas.fillText(stat.replace('_', ' ') + ':', 370, 30 + i * 40);
                canvas.fillStyle = '#0f0';
                var value = data.getStat(STAT[stat]);
                if (value.toFixed) {
                    value = value.toFixed(0);
                }
                canvas.fillText(value, 775, 30 + i * 40);
                i++;
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
    
        for (var j = 1; j < obj.profiles.length; j++) {
            
            var value = Profile(obj.profiles[j]).getStat(name);
        
            // "Most" stats
            if (i >= 6 && i < 15) {
                data[name] = Math.max(data[name], value);
            }
            
            // "Total" stats
            else {
                data[name] += value;
            }
        }
        
        i++;
    }
    
    return obj;
}