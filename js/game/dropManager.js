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
            if (BulletCollides(this.drops[i], this.drops[i].player)) {
                var player = this.drops[i].player;
                
                // Health pack special case
                if (this.drops[i].type == HEAL) {
                    player.health += HEAL_PERCENT * player.maxHealth / 100;
                    if (player.health > player.maxHealth) {
                        player.health = player.maxHealth;
                    }
                }
                
                // Increment the upgrade
                var id = this.drops[i].id;
                var dataId = id * DROP_VALUES;
                var max = player.drops[dataId + DROP_MAX];
                if (max == -1 || player.upgrades[id] < max) {
                    player.upgrades[id]++;
                }
                
                // Switch to the backup upgrade when maxed out
                if (max > 0 && player.upgrades[id] >= max) {
                    var backupId = player.drops[dataId + DROP_BACKUP] * DROP_VALUES;
                    player.drops[backupId + DROP_CHANCE] += player.drops[dataId + DROP_CHANCE];
                    player.drops[dataId + DROP_CHANCE] = 0;
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
        var ox = 0;
        for (var i = 0; i < playerManager.players.length; i++) {
            var total = 0;
            var player = playerManager.players[i].robot;
            if (player.health <= 0) continue;
            var drops = player.drops;
            for (var k = 0; k < DROP_COUNT; k++) {
                total += drops[k * DROP_VALUES + DROP_CHANCE];
                if (total > rand) {
                    this.drops.push(new Drop(x + ox, y, drops[k * DROP_VALUES + DROP_TYPE], k, player));
                    ox += 15;
                    break;
                }
            }
        }
        return ox > 0;
    }
}