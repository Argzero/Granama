function DropManager(screen) {
    this.drops = new Array();
    
    // Draws the drops on the screen
    this.Draw = function() {
        for (var i = 0; i < this.drops.length; i++) {
            this.drops[i].Draw(canvas);
        }
    };
    
    // Updates the drops
    this.Update = function() {
        for (var i = 0; i < this.drops.length; i++) {
            if (BulletCollides(this.drops[i], screen.player)) {
            
                // Health pack special case
                if (this.drops[i].type == HEAL) {
                    screen.player.health += HEAL_PERCENT * screen.player.maxHealth / 100;
                    if (screen.player.health > screen.player.maxHealth) {
                        screen.player.health = screen.player.maxHealth;
                    }
                }
                
                // Increment the upgrade
                var id = this.drops[i].id;
                var dataId = id * DROP_VALUES;
                var max = screen.player.drops[dataId + DROP_MAX];
                if (max == -1 || screen.player.upgrades[id] < max) {
                    screen.player.upgrades[id]++;
                }
                
                // Switch to the backup upgrade when maxed out
                if (max > 0 && screen.player.upgrades[id] >= max) {
                    var backupId = screen.player.drops[dataId + DROP_BACKUP] * DROP_VALUES;
                    screen.player.drops[backupId + DROP_CHANCE] += screen.player.drops[dataId + DROP_CHANCE];
                    screen.player.drops[dataId + DROP_CHANCE] = 0;
                }
                
                // Remove the drop
                this.drops.splice(i, 1);
                
                // Since the drop is removed, stay on the same index
                i--;
            }
        }
    };
    
    // Drops an item at the given point
    this.Drop = function(x, y) {
        var rand = Rand(100);
        var total = 0;
        var drops = screen.player.drops;
        for (var k = 0; k < DROP_COUNT; k++) {
            total += drops[k * DROP_VALUES + DROP_CHANCE];
            if (total > rand) {
                this.drops.push(new Drop(x, y, drops[k * DROP_VALUES + DROP_TYPE], k));
                return true;
            }
        }
        return false;
    }
}