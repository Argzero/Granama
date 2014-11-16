function TankBossHook(boss, root, rot) {
    this.boss = boss;
    this.root = root;
    this.rot = rot;
}

TankBossHook.prototype.update = function() {
    if (!gameScreen.paused && this.active) {
    
        // Movement outwards
        if (this.vel.x || this.vel.y) {
            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;
            if (this.pos.DistanceSq({ x: this.boss.x, y: this.boss.y }) > 250000) {
                this.vel.x = 0;
                this.vel.y = 0;
            }
        }
        
        // Lifespan counter
        else if (this.dur > 0) {
            this.dur--;
        }
        
        // Retreating
        else {
            var rotPos = Vector(-45, 0);
            rotPos.Rotate(this.arot.x, this.arot.y);
            var x = this.boss.x - this.pos.x - rotPos.x;
            var y = this.boss.y - this.pos.y - rotPos.y;
            var dir = Vector(x, y);
            dir.SetLength(30);
        
            this.pos.x += 3 * dir.x / 5;
            this.pos.y += 3 * dir.y / 5;
            
            if (this.pos.DistanceSq({ x: this.boss.x, y: this.boss.y }) < 2500) {
                this.active = false;
            }
        }
        
        // Collision
        for (var i = 0; i < playerManager.players.length; i++) {
            var player = playerManager.players[i].robot;
            var p1 = Vector(this.boss.x, this.boss.y);
            var p2 = Vector(player.x, player.y);
            var r = player.sprite.width / 2 + this.boss.chainFlat.height / 2;
            if (p2.SegmentDistanceSq(p1, this.pos) < r * r) {
                player.Slow(0.2, 60);
                player.Damage(this.boss.hookDmg, this.boss);
            }
        }
    }
}

TankBossHook.prototype.draw = function() {

    canvas.save();
            
    // Active hooks are absolute coordinates
    if (this.active) {
        ResetTransform(canvas);
        canvas.translate(this.pos.x, this.pos.y);
        canvas.transform(this.arot.x, this.arot.y, -this.arot.y, this.arot.x, 0, 0);
    }
    
    // Inactive hooks are relative coordinates
    else {
        canvas.translate(this.root.x, this.root.y);
        canvas.transform(this.rot.x, this.rot.y, -this.rot.y, this.rot.x, 0, 0);
    }
    
    canvas.drawImage(this.boss.hook, -this.boss.hook.width / 2, -this.boss.hook.height / 2);
    canvas.restore();
    
    // Chain drawing
    if (this.active) {
        var rotPos = Vector(-45, 0);
        rotPos.Rotate(this.arot.x, this.arot.y);
        var x = this.boss.x - this.pos.x - rotPos.x;
        var y = this.boss.y - this.pos.y - rotPos.y;
        var dir = Vector(x, y);
        dir.SetLength(30);
        
        canvas.save();
        ResetTransform(canvas);
        canvas.translate(this.pos.x + rotPos.x, this.pos.y + rotPos.y);
        var angle = AngleTo(dir, { x: 0, y: 0 });
        var cos = Math.cos(angle + Math.PI / 2);
        var sin = Math.sin(angle + Math.PI / 2);
        canvas.transform(cos, sin, -sin, cos, 0, 0);
        
        var xo = 0;
        var xt = 0;
        while ((x - xt) * dir.x > 0) {
            canvas.drawImage(this.boss.chainFlat, xo + 30 - this.boss.chainFlat.width / 2, -this.boss.chainFlat.height / 2);
            canvas.drawImage(this.boss.chainUp, xo - this.boss.chainUp.width / 2, -this.boss.chainUp.height / 2);
            xo += 60;
            xt += 2 * dir.x;
        }
        canvas.restore();
    }
}

TankBossHook.prototype.launch = function() {
    
    var root = Vector(this.root.x, this.root.y);
    root.Rotate(this.boss.getHookCos(), this.boss.getHookSin());
    root.Add(this.boss.x, this.boss.y);

    this.active = true;
    this.dur = this.boss.hookDur;
    this.arot = Vector(this.rot.x, this.rot.y);
    this.arot.Rotate(this.boss.getHookCos(), this.boss.getHookSin());
    this.vel = Vector(this.arot.x * 15, this.arot.y * 15);
    this.pos = root;
}