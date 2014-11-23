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
        var p = 0;
        for (var i = 0; i < this.drops.length; i++) {
            for (var p = 0; p < playerManager.players.length; p++) {
                var player = playerManager.players[p].robot;
                if (BulletCollides(this.drops[i], player)) {

                    // Heal the player
                    player.health += HEAL_PERCENT * player.maxHealth / 100;
                    if (player.health > player.maxHealth) {
                        player.health = player.maxHealth;
                    }

                    // Remove the drop
                    this.drops.splice(i, 1);

                    // Since the drop is removed, stay on the same index
                    i--;
                }
            }
            /*
             var player = this.drops[i].player;
             if (!player) {
             player = playerManager.players[p++].robot;
             if (p % playerManager.players.length == 0) {
             p = 0;
             }
             }
             if (BulletCollides(this.drops[i], player)) {

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
             else if (!player && p != 0) i--;
             */
        }
    };

    // Drops an item at the given point
    this.Drop = function(x, y, num) {
        var count = 0;
        var offset = Vector(0, 0);
        var ringCount = 1;
        var radius = 0;
        for (var j = 0; j < num; j++) {
            /*
             for (var i = 0; i < playerManager.players.length; i++) {
             var rand = Rand(100);
             var total = 0;
             var player = playerManager.players[i].robot;
             if (player.health <= 0) continue;
             var drops = player.drops;
             for (var k = 0; k < DROP_COUNT; k++) {
             total += drops[k * DROP_VALUES + DROP_CHANCE];
             if (total > rand) {
             this.drops.push(new Drop(x + offset.x, y + offset.y, drops[k * DROP_VALUES + DROP_TYPE], k, player));
             count++;
             if (count >= ringCount) {
             count = 0;
             offset.x = 0;
             radius += 40;
             offset.y = radius;
             ringCount += 6;
             }
             else {
             offset.Rotate(Math.PI * 2 / ringCount);
             }
             break;
             }
             }
             }
             */
            // Health packs
            if (Rand(100) < 10) {
                this.drops.push(new Drop(x + offset.x, y + offset.y, HEAL, HEAL_ID));
                count++;
                if (count >= ringCount) {
                    count = 0;
                    offset.x = 0;
                    radius += 40;
                    offset.y = radius;
                    ringCount += 6;
                }
                else {
                    offset.Rotate(Math.PI * 2 / ringCount);
                }
            }
        }

        return ringCount > 1;
    }
}