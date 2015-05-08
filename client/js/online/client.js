var io = io || undefined;

/**
 * Reprsents the socket.io connection to the server.
 * Use the "connection" object to access the methods
 * of this as it is set up on load.
 *
 * @constructor
 */
function Connection() {
    this.socket = undefined;
    this.connected = false;
    this.callback = undefined;
    this.errCallback = undefined;
    this.gameIndex = 0;
    this.localPlayers = 0;
    this.inRoom = false;
    this.room = undefined;
    this.isHost = true;
    this.timeOffset = 0;
    
    // Debug data
    this.outCount = 0;
    this.inCount = 0;
    this.pops = 0;
    this.pips = 0;
    this.maxPops = 0;
    this.maxPips = 0;
    this.lastTime = performance.now();
    
    this.connect();
}

/**
 * Attempts to connect to the server. When successful, this
 * will set up the handlers for receiving messages.
 */
Connection.prototype.connect = function() {
    if (this.connected || !io || !io.connect) return;

    // Join the server
    this.socket = io.connect();
    
    // Set up message handlers
    this.socket.on('ability', this.onAbility.bind(this));
    this.socket.on('addPlayers', this.onAddPlayers.bind(this));
    this.socket.on('blockProjectile', this.onBlockProjectile.bind(this));
    this.socket.on('buff', this.onBuff.bind(this));
    this.socket.on('burrow', this.onBurrow.bind(this));
    this.socket.on('changePattern', this.onChangePattern.bind(this));
    this.socket.on('damage', this.onDamage.bind(this));
    this.socket.on('destroy', this.onDestroy.bind(this));
    this.socket.on('destroyProjectile', this.onDestroyProjectile.bind(this));
    this.socket.on('doneUpgrades', this.onDoneUpgrades.bind(this));
    this.socket.on('downgrade', this.onDowngrade.bind(this));
    this.socket.on('fireProjectile', this.onFireProjectile.bind(this));
    this.socket.on('gameOver', this.onGameOver.bind(this));
    this.socket.on('general', this.onGeneral.bind(this));
    this.socket.on('getTime', this.onGetTime.bind(this));
    this.socket.on('giveExp', this.onGiveExp.bind(this));
    this.socket.on('grapple', this.onGrapple.bind(this));
	this.socket.on('heal', this.onHeal.bind(this));
    this.socket.on('joinRoom', this.onJoinRoom.bind(this));
    this.socket.on('kick', this.onKick.bind(this));
    this.socket.on('knockback', this.onKnockback.bind(this));
    this.socket.on('message', this.onMessage.bind(this));
    this.socket.on('mine', this.onMine.bind(this));
    this.socket.on('removePlayer', this.onRemovePlayer.bind(this));
    this.socket.on('revive', this.onRevive.bind(this));
    this.socket.on('setPaused', this.onSetPaused.bind(this));
    this.socket.on('shockwave', this.onShockwave.bind(this));
    this.socket.on('spawn', this.onSpawn.bind(this));
    this.socket.on('startGame', this.onStartGame.bind(this));
    this.socket.on('turret', this.onTurret.bind(this));
    this.socket.on('updatePlayer', this.onUpdatePlayer.bind(this));
    this.socket.on('updateRobots', this.onUpdateRobots.bind(this));
    this.socket.on('updateRooms', this.onUpdateRooms.bind(this));
    this.socket.on('updateSelection', this.onUpdateSelection.bind(this));
    this.socket.on('upgrade', this.onUpgrade.bind(this));
    this.socket.on('upgradeSelection', this.onUpgradeSelection.bind(this));
    
    // Start synchronizing time with the server
    this.socket.emit('getTime', { localTime: performance.now() });
    
    this.connected = true;
};

/**
 * Updates the POPS/PIPS values (packets out/in per second)
 */
Connection.prototype.update = function() {
    if (performance.now() - this.lastTime >= 1000) {
        this.pops = this.outCount;
        this.pips = this.inCount;
        this.maxPops = Math.max(this.pops, this.maxPops);
        this.maxPips = Math.max(this.pips, this.maxPips);
        this.outCount = 0;
        this.inCount = 0;
        this.lastTime += 1000;
    }
};

/**
 * Disconnects from the server, cleaning up any attachments to the server
 * such as the game the player was in or related activities.
 */
Connection.prototype.disconnect = function() {
    if (!this.connected) return;
    
    // TODO quit game if in one
    
    this.socket.disconnect();
    this.connected = false;
};

/**
 * Gets the current time in relation to the server's time
 */
Connection.prototype.getServerTime = function() {
    return this.timeOffset + performance.now();
};

/**
 * Converts a time back to local time from the server time
 * 
 * @param {number} time - the server time stamp
 */
Connection.prototype.fromServerTime = function(time) {
    return time - this.timeOffset;
};


// ------------------------------------------------------------------------------ //
//                                  Client -> Server                              //
// ------------------------------------------------------------------------------ //

/**
 * Tells other players about an activated ability
 *
 * @param {Player} player - the player who activated their ability
 */
Connection.prototype.ability = function(player) {
    if (!this.connected || !this.inRoom || player.isRemote()) return;
    this.outCount++;
    this.socket.emit('ability', {
        player: player.playerIndex,
        time: this.getServerTime()
    });
};

/**
 * Sends bullet data to the server
 *
 * @param {projectile} proj - the projectile to be sent over
 */
Connection.prototype.blockProjectile = function(proj) {
	if (!this.connected || !this.inRoom) return;
    this.outCount++;
	this.socket.emit('blockProjectile', {
		id: proj.id,
        clientID: proj.clientID,
        pos: proj.pos,
		time: this.getServerTime()
	});
};

/**
 * Buffs a robot
 *
 * @param {number} robot      - the ID of the robot being buffed
 * @param {string} stat       - the stat being buffed
 * @param {number} multiplier - the buff multiplier
 * @param {number} duration   - the duration of the buff
 */
Connection.prototype.buff = function(robot, stat, multiplier, duration) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('buff', {
        robot: robot,
        stat: stat,
        multiplier: multiplier,
        duration: duration,
        time: this.getServerTime()
    });
};

/**
 * Shares a burrowing enemy's target offset.
 * 
 * @param {Robot} robot - the enemy that burrowed
 */
Connection.prototype.burrow = function(robot) {
	if (!this.connected || !this.inRoom) return;
    this.outCount++;
	this.socket.emit('burrow', {
		robot: robot.id,
		pos: robot.pos,
		offset: robot.tOffset,
		time: this.getServerTime()
	});
};

/**
 * Sends a pattern change for a robot across the network
 *
 * @param {number} robot   - the ID of the robot changing patterns
 * @param {number} pattern - the new pattern of the robot 
 */
Connection.prototype.changePattern = function(robot, pattern) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('changePattern', {
        robot: robot,
        pattern: pattern,
        time: this.getServerTime()
    });
};

/**
 * Attempts to create a room on the server
 *
 * @param {string}   name     - name of the room
 * @param {function} callback - callback in case the creation fails
 */
Connection.prototype.createRoom = function(name, callback) {
    if (!this.connected || this.inRoom) return;
    this.outCount++;
    this.errCallback = callback;
    var users = [];
    for (var i = 0; i < players.length; i++) {
        players[i].settings.part = 1;
        users.push(players[i].settings);
    }
    this.socket.emit('createRoom', { 
        room: {
            name: name,
            numPlayers: players.length,
            maxPlayers: 5,
            gameType: 'Arcade',
            inProgress: false
        },
        users: users
    });
};

/**
 * Sends a damage event over the network
 *
 * @param {number} id         - the unique ID of the damaged robot
 * @param {number} damager    - the unique ID of the robot dealing the damage
 * @param {number} amount     - the amount of damage that was dealt
 * @param {number} healthLeft - the remaining health of the robot
 * @param {number} shieldLeft - the remaining shield of the robot
 */
Connection.prototype.damage = function(id, damager, amount, healthLeft, shieldLeft) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('damage', {
        robot: id,
        damager: damager,
        amount: amount,
        healthLeft: healthLeft,
        shieldLeft: shieldLeft,
        time: this.getServerTime()
    });
};

/**
 * Destroys the robot with the given ID, yielding the given exp
 *
 * @param {number} id  - the unique ID of the robot
 * @param {number} exp - the amount of exp to give to each player
 */
Connection.prototype.destroy = function(id, exp) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('destroy', {
        robot: id,
        exp: exp,
        score: gameScreen.score,
        time: this.getServerTime()
    });
};

/**
 * Sends bullet data to the server
 *
 * @param {projectile} proj - the projectile to be sent over
 */
Connection.prototype.destroyProjectile = function(proj) {
	if (!this.connected || !this.inRoom) return;
    this.outCount++;
	this.socket.emit('destroyProjectile', {
		id: proj.id,
        clientID: proj.clientID,
        pos: proj.pos,
		time: this.getServerTime()
	});
};

/**
 * Tells other players that all players are ready to start the next round
 */
Connection.prototype.doneUpgrades = function() {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('doneUpgrades', {
        time: this.getServerTime()
    });
};

/**
 * Sends a downgrade event across the network
 *
 * @param {number} player  - index of the player to apply the downgrade for
 * @param {number} upgrade - the index of the upgrade to...well...downgrade
 */
Connection.prototype.downgrade = function(player, upgrade) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('downgrade', {
        player: player,
        upgrade: upgrade,
        time: this.getServerTime()
    });
};

/**
 * Attempts to fetch the live rooms from the server that have 
 * room for the given number of players. When there's 0 players,
 * it will be assumed that it is for spectating.
 */
Connection.prototype.fetchRooms = function() {
    if (!this.connected || this.inRoom) return;
    this.outCount++;
    this.socket.emit('fetchRooms', { players: players.length });
};

/**
 * Sends bullet data to the server
 *
 * @param {projectile} proj - the projectile to be sent over
 */
Connection.prototype.fireProjectile = function(proj) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('fireProjectile', {
        sprite: proj.sprite.name,
		pos: proj.pos,
		vel: proj.vel,
		size: proj.size.x,
		dmg: proj.damage,
		id: proj.id,
        clientID: proj.clientID,
		pierce: proj.pierce,
		spread: proj.split,
		range: proj.range,
		buffs: proj.buffs,
		update: proj.updateName,
		collide: proj.collideName,
		hit: proj.hitName,
		expire: proj.expireName,
		block: proj.blockedName,
		group: proj.group,
		shooter: proj.shooter.id,
        extra: proj.extra,
        time: this.getServerTime()
    });
};

/**
 * Tells other players about the end of the game
 */
Connection.prototype.gameOver = function() {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.inRoom = false;
    var stats = new Array(players.length);
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        stats[i] = {
            damageDealt: player.damageDealt,
            damageTaken: player.damageTaken,
            damageAbsorbed: player.damageAbsorbed,
            kills: player.skills,
            deaths: player.deaths
        };
    }
    this.socket.emit('gameOver', { 
        stats: stats,
        time: this.getServerTime() 
    });
};

/**
 * Tells other clients of the experience acquired by a player.
 * 
 * @param {number} index  - the index of the player receiving the exp
 * @param {number} amount - the amount of experience received
 */
Connection.prototype.giveExp = function(index, amount) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('giveExp', {
        player: index,
        exp: amount,
        time: this.getServerTime()
    });
};

/**
 * Makrs a grapple as striking the given target
 *
 * @param {Projectile} grapple - the grapple hook that connected
 * @param {Robot}      target  - the robot that was hit by the grapple
 */
Connection.prototype.grapple = function(grapple, target) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('grapple', {
        projID: grapple.id,
        projClientID: grapple.clientID,
        targetID: target.id,
        pos: grapple.pos,
        time: this.getServerTime()
    });
};

/**
 * Sends an update for a robot's health when it is healed.
 *
 * @param {Robot} robot - the robot to heal
 */
Connection.prototype.heal = function(robot) {
	if (!this.connected || !this.inRoom) return;
    this.outCount++;
	this.socket.emit('heal', {
		robot: robot.id,
		health: robot.health,
		time: this.getServerTime()
	});
};

/**
 * Requests to join a game room using the given room name. If there
 * are no players, this will assume that it is for spectating.
 */
Connection.prototype.joinRoom = function(name) {
    if (!this.connected || this.inRoom) return;
    this.outCount++;
    var users = [];
    for (var i = 0; i < players.length; i++) {
        players[i].settings.part = 1;
        users.push(players[i].settings);
    }
    this.socket.emit('requestJoin', { users: users, room: name });
};

/**
 * Applies knockback to the robot
 *
 * @param {number} robot     - the ID of the robot to knock back
 * @param {Vector} knockback - the unmitigated knockback applied
 */
Connection.prototype.knockback = function(robot, knockback) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('knockback', {
        robot: robot,
        knockback: knockback,
        time: this.getServerTime()
    });
};

/**
 * Attempts to log the user in, responding to the callback
 * with the result. If another login attempt is already being
 * processed or there is no connection, this will do nothing instead.
 *
 * @param {string}   username - the player's username
 * @param {string}   password - the player's password
 * @param {function} callback - the method to use when a response is received
 */ 
Connection.prototype.login = function(username, password, callback) {
    if (!this.connected || this.callback) return;
    this.outCount++;
    this.callback = callback;
    this.socket.emit('login', { username: username, password: password });
};

/**
 * Sends a chat message over the server.
 *
 * @param {string} message - the message to send
 */
Connection.prototype.message = function(message) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('message', { user: players[this.gameIndex].settings.profile, message: message });
};

/**
 * Shares a mine placed by an enemy with other clients
 *
 * @param {Mine} mine - the mine that was placed
 */
Connection.prototype.mine = function(mine) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('mine', {
        sprite: mine.sprite.name,
        pos: mine.pos,
        dmg: mine.power,
        id: mine.id,
        lifespan: mine.lifespan,
        target: mine.target,
        shooter: mine.shooter.id,
        time: this.getServerTime()
    });
};

/**
 * Removes all local players from the current game for some
 * reason, whether it's quitting from the lobby, closing the
 * window, or losing connection.
 *
 * @param {string} reason - the reason for quitting the game (e.g. closed browser)
 */ 
Connection.prototype.quitGame = function(reason) {
    if (!this.connected || !this.inRoom) return;
    
    // Host leaving takes the room down with them 
    if (this.gameIndex === 0) {
        this.socket.emit('destroyRoom', {
            reason: reason
        });
    }
    
    // Normal players just remove themselves
    else {
        this.socket.emit('removePlayer', {
            room: this.room.name,
            index: this.gameIndex,
            amount: this.localPlayers,
            time: this.getServerTime()
        });
    }
    
    this.outCount++;
    this.inRoom = false;
    players = players.slice(this.gameIndex, this.gameIndex + this.localPlayers);
    gameScreen = new RoomScreen();
    document.getElementById('chat').style.display = 'none';
};

/**
 * Sends a request to tart the game
 */
Connection.prototype.requestStart = function() {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('requestStart', { 
        room: this.room
    });
};

/**
 * Marks a player as revived
 *
 * @param {Player} player - the player that was revived
 */
Connection.prototype.revive = function(player) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('revive', {
        player: player.playerIndex,
        position: player.pos,
        time: this.getServerTime()
    });
};

/**
 * Sets the paused state of the game
 *
 * @param {number} id - the index of the player who paused the game or -1 if not paused
 */
Connection.prototype.setPaused = function(id) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('setPaused', {
        player: id,
        time: this.getServerTime()
    });
};

/**
 * Sends an emitted shockwave over the network.
 *
 * @param {Shockwave} shockwave - the shockwave to emit
 */
Connection.prototype.shockwave = function(shockwave) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('shockwave', {
        source: shockwave.source.id, 
        color1: shockwave.color1, 
        color2: shockwave.color2, 
        pos: shockwave.arc.pos,
        speed: shockwave.speed, 
        min: shockwave.arc.start, 
        max: shockwave.arc.end, 
        radius: shockwave.arc.radius, 
        thickness: shockwave.arc.thickness, 
        damage: shockwave.damage, 
        range: shockwave.range, 
        knockback: shockwave.knockback, 
        target: shockwave.target
    });
};

/**
 * Attempts to sign the user up with a new account, responding to the 
 * callback with the result. If another login attempt is already being
 * processed or there is no connection, this will do nothing instead.
 *
 * @param {string}   username - the player's username
 * @param {string}   password - the player's password
 * @param {function} callback - the method to use when a response is received
 */ 
Connection.prototype.signup = function(username, password, callback) {
    if (!this.connected || this.callback) return;
    this.outCount++;
    this.callback = callback;
    this.socket.emit('signup', { username: username, password: password });
};

/**
 * Tells other players in the game to spawn an enemy at the given coordinates
 * 
 * @param {number}  construct - the name of the constructor function
 * @param {Vector}  pos       - the spawn location
 * @param {number}  id        - the unique ID of the robot to spawn
 * @param {boolean} bossSpawn - whether or not it is a boss being spawned
 * @param {Object}  [extra]   - any extra data to include
 */
Connection.prototype.spawn = function(construct, pos, id, bossSpawn, extra) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('spawn', {
        construct: construct,
        pos: pos,
        id: id,
        bossSpawn: bossSpawn,
        extra: extra,
        time: this.getServerTime()
    });
};

/**
 * Submits profile stats to the server to store in the database
 *
 * @param {Profile} profile - the profile data to submit
 */
Connection.prototype.submitStats = function(profile) {
    if (!this.connected) return;
    this.outCount++;
    this.socket.emit('stats', profile);
};

/**
 * Shares a turret placement with other players
 *
 * @param {Turret} turret - the turret that was placed
 */
Connection.prototype.turret = function(turret) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('turret', {
        sprite: turret.sprite.name,
        base: turret.preChildren[0].sprite.name,
        pos: turret.pos,
        health: turret.health,
        dmg: turret.gunData.damage,
        id: turret.id,
        shooter: turret.gunData.shooter.id,
        time: this.getServerTime()
    });
};

/**
 * Sends out the update for non-player robots
 *
 * @param {Object} data - the robot data
 */
Connection.prototype.updateRobots = function(data) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    data.time = this.getServerTime();
    this.socket.emit('updateRobots', data);
};

/**
 * Sends an update for the player's current selection in the 
 * lobby screen so other players can see it.
 *
 * @param {Number} playerIndex - the index of the player to update
 */
Connection.prototype.updateSelection = function(playerIndex) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('updateSelection', { 
        selection: players[playerIndex].settings, 
        index: playerIndex, 
        time: this.getServerTime() 
    });
};

/**
 * Sends an update for the player's current position
 * as well as orientation
 *
 * @param {Number} playerIndex - the index of the player to update
 */
Connection.prototype.updatePlayer = function(playerIndex) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('updatePlayer', { 
        rot: players[playerIndex].rotation, 
        robot: playerIndex,
        dir: players[playerIndex].input.direction(MOVE, players[playerIndex]),
        pos: players[playerIndex].pos,
        time: this.getServerTime()
    });
};

/**
 * Sends an upgrade event across the network
 *
 * @param {number} player  - index of the player to apply the upgrade for
 * @param {number} upgrade - the index of the upgrade to...well...upgrade
 */
Connection.prototype.upgrade = function(player, upgrade) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('upgrade', {
        player: player,
        upgrade: upgrade,
        time: this.getServerTime()
    });
};

/**
 * Sends an upgrade screen selection across the network
 *
 * @param {number}  player - the index of the player changing their selection
 * @param {number}  id     - the new ID of their selection
 * @param {boolean} ready  - whether or not the player is ready
 */
Connection.prototype.upgradeSelection = function(player, id, ready) {
    if (!this.connected || !this.inRoom) return;
    this.outCount++;
    this.socket.emit('upgradeSelection', {
        player: player,
        id: id,
        ready: ready,
        time: this.getServerTime()
    });
};

// ------------------------------------------------------------------------------ //
//                                  Server -> Client                              //
// ------------------------------------------------------------------------------ //

/**
 * Handles applying ability activation for remote players. The
 * data should include the values:
 *
 *   player = the ID of the player who activated their ability
 *   time = the time the ability was activated
 *
 * @param {Object} data - the data from the server
 */
Connection.prototype.onAbility = function(data) {
    this.inCount++;
    players[data.player].input.applyAbility();
};

/**
 * Message from the server about players joining the game 
 * from another computer. The data should include the values:
 *
 *   selections = [ { playerName, robot, ability, team, ready } ]
 *   index = the starting index to place the players
 *
 * @param {Object} data - the data for the joining players
 */
Connection.prototype.onAddPlayers = function(data) {
    this.inCount++;
    if (!this.inRoom) return;
    for (var i = 0; i < data.selections.length; i++) {
        players[i + data.index].settings = data.selections[i]; 
    }
};

/**
 * Blocks a projectile in the game if it isn't already.
 * The data should include the values:
 *
 *    id = the ID of the projectile to block
 *    pos = the position the bullet was blocked at
 *    time = the time the bullet was blocked
 *    
 * @param {Object} data - the data from the server
 */
Connection.prototype.onBlockProjectile = function(data) {
    this.inCount++;
	var bullet = gameScreen.getBulletById(data.id, data.clientID);
	if(bullet)
	{
        bullet.pos = new Vector(data.pos.x, data.pos.y);
        bullet.block();
	}
};

/**
 * Buffs a robot. The data should include the values:
 *
 *   robot = the ID of the robot to buff
 *   stat = the name of the stat to buff
 *   multiplier = the buff multiplier to apply
 *   duration = how long to apply the buff for
 *   time = when the buff was applied
 * 
 * @param {Object} object - the server data
 */ 
Connection.prototype.onBuff = function(data) { 
    this.inCount++; 
    var r = gameScreen.getRobotById(data.robot);
    if (r) {
        r.buff(data.stat, data.multiplier, data.duration);
    }
};

/**
 * Tells a robot to burrow with a specified offset.
 * The data should include the values:
 *
 *   robot = the ID of the burrowing robot
 *   pos = the position the robot burrowed at
 *   offset = the offset of the burrow target
 *   time = the time the robot burrowed
 *
 * @param {Object} data - the data from the server
 */
Connection.prototype.onBurrow = function(data) {
    this.inCount++;
	var robot = gameScreen.getRobotById(data.robot);
	if (robot) {
		robot.burrowing = true;
		robot.hidden = true;
		robot.tOffset = new Vector(data.offset.x, data.offset.y);
	}
};

/**
 * Handles updating the attack pattern of a robot
 *
 *   robot = the ID of the robot changing patterns
 *   pattern = the new pattern of the robot
 *   time = the time when the robot changed patterns
 *
 * @param {Object} data - the pattern change data
 */
Connection.prototype.onChangePattern = function(data) {
    this.inCount++;
    var r = gameScreen.getRobotById(data.robot);
    if (r) {
        r.setPattern(data.pattern);
    }
};

/**
 * Applies damage dealt to a robot. The data should include
 * the values:
 *
 *   robot = the unique ID of the damaged robot
 *   damager = the unique ID of the robot dealing damage
 *   amount = the amount of damage dealt
 *   healthLeft = the amount of health the robot has left
 *   shieldLeft = the amount of shield the robot has left
 *   time = the timestamp for when the damage occurred
 *
 * @param {Object} the data
 */
Connection.prototype.onDamage = function(data) {
    this.inCount++;
    var target = gameScreen.getRobotById(data.robot);
    var damager = gameScreen.getRobotById(data.damager);
    
    if (!target || !damager) return;
    
    var wasDead = target.dead;
    
    // Grab values before applying damage
    var prevHp = target.health;
    var prevSp = target.shield;
    
    // Apply damage to register stats
    target.damage(data.amount, damager);
    
    // Update remaining health/shield based on time stamps
    if (target.lastDamage > data.time) {
        target.health = prevHp;
        target.mana = prevSp;
        target.dead = wasDead;
    }
    else {
        target.health = data.healthLeft;
        target.shield = data.shieldLeft;
        target.dead = data.healthLeft <= 0;
    }
    
    // Update the time stamp
    target.lastDamage = data.time;
};

/**
 * Destroys a robot and drops experience for local players.
 * The data should include the values:
 *
 *   robot = the unique ID of the destroyed enemy
 *   exp = the amount of exp to drop per player
 *   score = the new score for the game
 *   time = the time stamp for when the enemy died
 *
 * @param {Object} data - response data from the server
 */
Connection.prototype.onDestroy = function(data) {
    this.inCount++;
    var r = gameScreen.getRobotById(data.robot);
    if (r) {
        r.destroy();
    }
    gameScreen.score = data.score;
};

/**
 * Removes a projectile from the game if it isn't already.
 * The data should include the values:
 *
 *    id = the ID of the projectile to destroy
 *    pos = the position the bullet expired
 *    time = the time the bullet expired
 *    
 * @param {Object} data - the data from the server
 */
Connection.prototype.onDestroyProjectile = function(data) {
    this.inCount++;
	var bullet = gameScreen.getBulletById(data.id, data.clientID);
	if(bullet)
	{
        bullet.pos = new Vector(data.pos.x, data.pos.y);
		bullet.expired = true;
        if (bullet.onExpire) bullet.onExpire();
	}
};

/**
 * Starts the next round of the game. The data should
 * include the values:
 *
 *   time = the time when the round started
 *
 * @param {Object} data - the data from the server
 */ 
Connection.prototype.onDoneUpgrades = function(data) {
    this.inCount++;
    gameScreen.startNextRound();
};

/**
 * Applies a downgrade for a player. The data should include the values:
 *
 *   player = the index of the player downgrading a stat
 *   upgrade = the index of the downgraded stat
 *   time = when the upgrade took place 
 *
 * @param {Object} data - the data for the downgrade
 */ 
Connection.prototype.onDowngrade = function(data) {
    this.inCount++;
    ui.hovered[data.player] = data.upgrade;
    players[data.player].upgrades[data.upgrade]--;
    players[data.player].points++;
};

/**
 * Receives bullet data, then makes it. The data
 * should include the values:
 *
 *  sprite = the name of the sprite of the projectile
 *	pos = the position of the projectile
 *	vel = the velocity of the projectile
 *	size = the size of the projectile
 *	dmg = how much damage the projectile will do to a target
 *	id = the id of the bullet
 *  clientID = the ID of the player that created the bullet
 *	pierce = does the bullet pierce?
 *	range = the max distance the bullet will travel
 *	temps = what templates the projectile follows
 * 	buffs = any buffs the projectile has
 * 	update = update method for the projectile
 *	collide = check method for the projectile
 *	hit = method for the projectile when it hits a target
 *	expire = method for what the bullet does when it expires
 *	block = method for what happens to a projectile when it is blocked
 * 	group = what group the projectile is in
 *	shooter = the id of who shot the projectile
 *  time = when the change took place
 *
 * @param {Object} data - the projectile data
 */
Connection.prototype.onFireProjectile = function(data) {
    this.inCount++;
	var result = new Vector(data.pos.x, data.pos.y);
	data.pos = result;
	
	var resultVel = new Vector(data.vel.x, data.vel.y);
	
    // Create the projectile
	var shooter = gameScreen.getRobotById(data.shooter);
    var projectile = new Projectile(
        data.sprite,
        0, 0,
        shooter, shooter,
        resultVel.length(),
        0,
        data.dmg,
        data.range,
        data.pierce,
        data.group
    );
    Projectile.ID--;
    
    projectile.origin = result.clone();
    projectile.pos = result;
    projectile.vel = resultVel.clone();
    projectile.rotation = resultVel.normalize().rotate(0,-1);
    projectile.angle = projectile.getAngle();
    projectile.id = data.id;
    projectile.clientID = data.clientID;
    
    // Size scaling
    if (data.size) {
        projectile.scale(data.size, data.size);
    }
    
    // Copy over provided buffs
    if (data.buffs) {
        projectile.buffs = data.buffs;
    }
    
    // Copy over event handlers
    projectile.onUpdate = projEvents[data.update];
    projectile.onCollideCheck = projEvents[data.collide];
    projectile.onHit = projEvents[data.hit];
    projectile.onBlocked = projEvents[data.blocked];
    projectile.onExpire = projEvents[data.expire];
    
    // Apply extra data
    if (data.extra) {
        var x;
        for (x in data.extra) {
            if (data.extra[x].x !== undefined) {
                projectile.extra[x] = new Vector(data.extra[x].x, data.extra[x].y);
            }
            else projectile.extra[x] = data.extra[x];
        }
    }
    
    gameScreen.bullets.push(projectile);
    
    // Spread the bullet if applicable
    if (data.spread > 0) {
        projectile.spread(data.spread);
    }
};

/**
 * Handles starting the game over timer when all players are dead.
 * The data should contain the values:
 *
 *   time = the time when the game ended
 *
 * @param {Object} data - the data from the server
 */
Connection.prototype.onGameOver = function(data) {
    this.inCount++;
    gameScreen.gameOver = 300 - (performance.now - this.fromServerTime(data.time)) * 0.06;  
    this.inRoom = false;
};

/**
 * Receives a general response from the server containing whether
 * or not an action worked or not. If a callback was provided, this
 * will pass the result on to the callback. The data should include
 * the values:
 *
 *   success = true or false, depending on if it succeeded or not
 *   error = the error message if it did not succeed
 *
 * @param {Object} data - response data from the server
 */
Connection.prototype.onGeneral = function(data) {
    this.inCount++;
    if (this.callback) {
        this.callback(data);
        delete this.callback;
    }
    if (this.errCallback) {
        this.errCallback(data);
        delete this.errCallback;
    }
};

/**
 *  It gets the time difference between the server and the client
 * 
 *   localTime = time packet was sent
 *   serverTime = time the packet was recieved by server
 *
 * @param {Object} data - the time data
 */
Connection.prototype.onGetTime = function(data) {
    this.inCount++;
    var firstLocalTime = data.localTime;
    var secondLocalTime = performance.now();
    var serverTime = data.serverTime;
    
    var localDif = secondLocalTime - firstLocalTime;
    
    this.timeOffset = serverTime - (firstLocalTime + (localDif/2));
};

/**
 * Gives experience to a player. The data should include the values:
 *
 *   player = the index of the player receiving exp
 *   exp = the amount of received experience
 *   time = the time stamp for when the experience was received
 *
 * @param {Object} data - the data from the server
 */
Connection.prototype.onGiveExp = function(data) {
    this.inCount++;
    players[data.player].giveExp(data.exp);
};

/**
 * Handles applying a grapple hit. The data should contain:
 *
 *   projID = the ID of the projectile
 *   projClientID = the ID of the client who fired the projectile
 *   targetID = the ID of the hit target
 *   pos = the position of the grapple on impact
 *   time = the time the grapple hit
 *
 * @param {Object} data - the data to relay
 */
Connection.prototype.onGrapple = function(data) {
    var grapple = gameScreen.getBulletById(data.projID, data.projClientID);
    var target = gameScreen.getRobotById(data.targetID);
    if (grapple && target) {
        grapple.pos.x = data.pos.x;
        grapple.pos.y = data.pos.y;
        if (target.attachedGrapple) 
        {
            target.attachedGrapple.target = undefined;
        }
        target.attachedGrapple = grapple;
        grapple.returning = true;
        grapple.target = target;
        grapple.offset = target.pos.clone().subtractv(grapple.pos);
    }
};

/**
 * Heals a robot. The data should include the values:
 *
 *   robot = the ID of the healed robot
 *   health = the new health of the robot
 *   time = the time the robot was healed
 *
 * @param {Object} data - the data from the server
 */
Connection.prototype.onHeal = function(data) {
    this.inCount++;
	var robot = gameScreen.getRobotById(data.robot);
	if (robot) {
		robot.health = data.health;
	}
};

/**
 * Receives a response from the server when the players are able to
 * join a room that was requested. The data should include the values:
 *
 *   room = { roomName, numPlayers, maxPlayers, gameType, inProgress }
 *   selections = [ { playerName, robot, ability, team, ready } ]
 *   index = the starting index for the local players
 *
 * @param {Object} data - the response from the server
 */
Connection.prototype.onJoinRoom = function(data) {
    this.inCount++;
    if (this.inRoom) return;
    
    delete this.errCallback;
    this.inRoom = true;
    this.localPlayers = players.length;
    this.gameIndex = data.index;
    this.room = data.room;
    this.isHost = data.index === 0;
    
	var i;
    for (i = 0; i < data.index; i++) {
        players.unshift({ settings: data.selections[i] });
    }
    for (i = players.length; i < data.selections.length; i++) {
        players.push({ settings: data.selections[i] });
    }
    appendPlayers(5);
    gameScreen = new LobbyScreen();
    
    var chat = document.getElementById('chat');
    if (chat.style.width != '0px') chat.style.display = 'block';
    chatText.innerHTML = 'Joined the room "' + data.room.name + '"';
};

/**
 * Message from the server for when the user is kicked
 * from their current game. The data should include the values:
 *
 *   reason = the message stating the reason why the user was kicked
 *
 * @param {Object} data - message from the server
 */
Connection.prototype.onKick = function(data) {
    this.inCount++;
    if (!this.inRoom) return;
    
    this.inRoom = false;
    players = players.slice(this.gameIndex, this.gameIndex + this.localPlayers);
    gameScreen = new RoomScreen();
};

/**
 * Applies knockback to a robot. The data should include the values:
 *
 *   robot = the ID of the robot being knocked back
 *   knockback = the knockback to apply
 *   time = the time when the knockback was applied
 *
 * @param {Object} data - the data received from the server
 */
Connection.prototype.onKnockback = function(data) {
    this.inCount++;
    var r = gameScreen.getRobotById(data.robot);
    if (r) {
        r.knockback(new Vector(data.knockback.x, data.knockback.y));
    }
};

/**
 * Handles receiving a message from the server and applying it.
 * The data should include the values:
 *
 *   user = the user sending the message
 *   message = the contents of the message
 *
 * @param {Object} data - the data for the message
 */
Connection.prototype.onMessage = function(data) {
    this.inCount++;
    chatText.innerHTML += '<br/><span class="user">' + data.user + '</span>: ' + data.message;
    chatText.scrollTop = chatText.scrollHeight;
};

/**
 * Handles adding mines to the environment via data received from
 * the server. The data should include the values:
 *
 *   sprite = the name of the image used by the mine
 *   pos = the position of the mine
 *   dmg = the amount of damage the mine will deal
 *   id = the ID of the mine
 *   lifespan = how long the mine will last
 *   target = the target group of the mine
 *   shooter = the ID of the robot that placed the mine
 *   time = the time the mine was placed
 *
 * @parm {Object} data - the data received from the server
 */
Connection.prototype.onMine = function(data) {
    this.inCount++;
    var mine = new Mine(this, new Vector(0, 0), 0, 'LightBomber', 0);
    mine.sprite = images.get(data.sprite);
    mine.pos.x = data.pos.x;
    mine.pos.y = data.pos.y;
    mine.power = data.dmg;
    mine.id = data.id;
    mine.lifespan = data.lifespan;
    mine.target = data.target;
    mine.shooter = gameScreen.getRobotById(data.shooter);
    gameScreen.robots.push(mine);
};

/**
 * Message for when players leave the current game. The
 * data should include the values:
 *
 *   index = the starting index of the client who left
 *   amount = the amount of players playing on the client's machine
 *   time = the time the client disconnected
 *
 * @param {Object} data - information about the players who left
 */
Connection.prototype.onRemovePlayer = function(data) {
    this.inCount++;
    players.splice(data.index, data.amount);
    appendPlayers(5);
};

/**
 * Handles reviving a player. The data should
 * include the values:
 *
 *   player = the index of the player who was revived
 *   position = the position they were at while revived
 *   time = the time the player was revived
 *
 * @param {Object} data - the data from the server
 */
Connection.prototype.onRevive = function(data) {
    this.inCount++;
    players[data.player].revive();
};

/**
 * Sets the paused state of the game. The data should include the values:
 *
 *   player = the index of the player who paused the game or -1 if not paused
 *   time = the time in which the game was paused/unpaused
 * 
 * @param {Object} data - the pause data
 */
Connection.prototype.onSetPaused = function(data) {
    this.inCount++;
    if (data.player == -1) gameScreen.paused = false;
    else gameScreen.paused = players[data.player];
};

/**
 * Handles a shockwave received from the server. The
 * data should contain the values:
 *
 *   source = the ID of the emitting robot
 *   color1 = the primary color of the shockwave
 *   color2 = the secondary color of the shockwave
 *   pos = the position of the center of the shockwave
 *   speed = the speed of the shockwave
 *   min = the min angle of the shockwave
 *   max = the max angle of the shockwave
 *   radius = the radius of the shockwave
 *   thickness = how thick the shockwave is
 *   damage = the damage dealt by the shockwave
 *   range = the range of the shockwave
 *   knockback = the shockwave's knockback
 *   target = the target robot group
 *
 * @param {Object} data - the data from the server
 */
Connection.prototype.onShockwave = function(data) {
    this.inCount++;
    var robot = gameScreen.getRobotById(data.source);
    if (robot) {
        var angle = robot.getAngle();
        var shockwave = new Shockwave(
            robot, 
            data.color1, 
            data.color2, 
            data.pos.x, 
            data.pos.y, 
            data.speed, 
            data.min - angle, 
            data.max - angle, 
            data.radius, 
            data.thickness, 
            data.damage, 
            data.range, 
            data.knockback, 
            data.target,
            true
        );
        gameScreen.bullets.push(shockwave);
    }
};

/**
 * Handles spawning a new robot. The data should include the values:
 *
 *   construct - the name of the function to create the enemy
 *   pos       - the position to create the enemy
 *   id        - the unique ID of the spawned robot
 *   bossSpawn - whether or not the spawn is for a boss spawn
 *   extra     - extra data to apply to the enemy
 *   time      - the time the enemy was created
 *
 * @param {Object} data - the spawn data to relay
 */
Connection.prototype.onSpawn = function(data) {
    this.inCount++;
    var enemy = new window[data.construct](0, 0);
    enemy.pos.x = data.pos.x;
    enemy.pos.y = data.pos.y;
    enemy.id = data.id;
    
    gameScreen.robots.unshift(enemy);
    gameScreen.enemyCount++;
    
    if (data.extra) {
        var keys = Object.keys(data.extra);
        var key;
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            if (enemy[key] instanceof Vector) {
                enemy[key].x = data.extra[key].x;
                enemy[key].y = data.extra[key].y;
            }
            else {
                enemy[key] = data.extra[key];
            }
        }
    }
    
    if (data.bossSpawn) {
        enemy.exp = 0;
        enemy.points = 0;
    }
    
    if (enemy.type == Robot.BOSS) {
        gameScreen.boss = enemy;
        gameScreen.bossStatus = ACTIVE_BOSS;
        gameScreen.bossTimer = 300 - (this.getServerTime() - data.time) * 3 / 50;
        gameScreen.bossCount++;
    }
};

/**
 * Starts the game. The data should include the values:
 * 
 *   selection = selection data
 * 
 * @param {Object} data - selection data that was sent
 */
Connection.prototype.onStartGame = function(data) {
    this.inCount++;
    var selections = data.selections;
    
    players = players.slice(0, selections.length);
    
    for (i = 0; i < selections.length; i++) 
    {
        var selection = selections[i];
        var robot = PLAYER_DATA[selection.robot];
        var player = new robot.player();
        player.color = robot.color;
        player.name = robot.name;
        player.profile = selection.profile;
        var skill = robot.skills[selection.ability];
        player.ability = skill.name;
        player.input = players[i].input || new NetworkInput();
        player.ups = robot.ups;
        player.icons = robot.icons;
        player.playerIndex = i;
        player.id = -i;
        skill.callback(player);
        players[i] = player;
    }
    
    gameScreen = new GameScreen(false);
    document.getElementById('chat').style.display = 'none';
};

/**
 * Handles adding turrets to the environment via data received from
 * the server. The data should include the values:
 *
 *   sprite = the name of the image used by the gun of the turret
 *   base = the name of the image used by the base of the turret
 *   pos = the position of the mine
 *   health = the amount of health that the turret has
 *   dmg = the amount of damage the bullets will deal
 *   id = the ID of the turret
 *   shooter = the ID of the robot that placed the turret
 *   time = the time the turret was placed
 *
 * @parm {Object} data - the data received from the server
 */
Connection.prototype.onTurret = function(data) {
    this.inCount++;
    var turret = new Turret(this, 'turretGun', 'turretBase', 0, 0, 0, 1);
    turret.sprite = images.get(data.sprite);
    turret.preChildren[0].sprite = images.get(data.base);
    turret.pos.x = data.pos.x;
    turret.pos.y = data.pos.y;
    turret.health = turret.maxHealth = data.health;
    turret.gunData.damage = data.damage;
    turret.id = data.id;
    turret.shooter = gameScreen.getRobotById(data.shooter);
    gameScreen.robots.push(turret);
};


/**
 * Sends an update for the player's current position
 * as well as orientation
 * 
 *   robot = player index
 *   pos = position of the player
 *   rot = orientation of the player
 *   dir = movement direction of the player
 *   time = timestamp of when the message was sent
 * 
 * @param {Object} data - the data that was sent
 */
Connection.prototype.onUpdatePlayer = function(data) {
    this.inCount++;
    var robot = data.robot;
    var player = players[robot];
    if(player.lastUpdate < data.time)
    {
        player.input.look.x = data.rot.x;
        player.input.look.y = data.rot.y;
        
        var time = performance.now() - this.fromServerTime(data.time);
        time *= 6 / 100;
        var x = data.pos.x + data.dir.x * time;
        var y = data.pos.y + data.dir.y * time;
        
        player.targetPos.x = x;
        player.targetPos.y = y;
        
        player.input.dir.x = data.dir.x;
        player.input.dir.y = data.dir.y;
    }
};

/**
 * Updates non-player robots in the game. The data should
 * include these values:
 *
 *   <id> = the position and rotation data for the robot with the ID (one for each robot)
 *   time = the time stamp from when the data was sent
 *
 * @param {Object} data - robot data
 */
Connection.prototype.onUpdateRobots = function(data) {
    this.inCount++;
    for (var i = 0; i < gameScreen.robots.length; i++) {
        var r = gameScreen.robots[i];
        var d = data[r.id];
        if (d) {
            r.pos.x = d.pos.x;
            r.pos.y = d.pos.y;
            r.rotation.x = d.rot.x;
            r.rotation.y = d.rot.y;
        }
    }
};

/**
 * Retrieves the list of active rooms from the server and 
 * passes it along to the RoomScreen if still on that screen.
 * The data should contain the values:
 *
 *   rooms [ { name, numPlayers, maxPlayers, gameType, inProgress } ]
 *
 * @param {Object} data - the room data retrieved from the server
 */
Connection.prototype.onUpdateRooms = function(data) {
    this.inCount++;
    if (gameScreen.updateRooms) {
        gameScreen.updateRooms(data);
    }
};

/**
 * Receives a player selection update from the server.
 * The data should include the values:
 *
 *   selection = { playerName, robot, ability, team, ready }
 *   index = the index of the player who sent the update
 *   time = the time that the update was sent
 *
 * @param {Object} data - the selection update data
 */ 
Connection.prototype.onUpdateSelection = function(data) {
    this.inCount++;
    if (!this.inRoom) return;
    
    // Ignore old updates
    if (players[data.index].lastUpdate && players.lastUpdate > data.time) return;
    
    // Apply the update
    players[data.index].settings = data.selection;
    players[data.index].lastUpdate = data.time;
    if (gameScreen.updateOpenList) {
        gameScreen.updateOpenList();
    }
};

/**
 * Applies an upgrade for a player. The data should include the values:
 *
 *   player = the index of the player upgrading a stat
 *   upgrade = the index of the upgraded stat
 *   time = when the upgrade took place 
 *
 * @param {Object} data - the data for the upgrade
 */ 
Connection.prototype.onUpgrade = function(data) {
    this.inCount++;
    ui.hovered[data.player] = data.upgrade;
    players[data.player].upgrades[data.upgrade]++;
    players[data.player].points--;
};

/**
 * Updates a selection for the upgrade screen. The data
 * should include the values:
 *
 *   player = the index of the player to update for
 *   id = the index of the stat the player is now hovered over
 *   ready = whether or not the player is ready
 *   time = when the change took place
 *
 * @param {Object} data - the new selection data
 */
Connection.prototype.onUpgradeSelection = function(data) {
    this.inCount++;
    ui.ready[data.player] = data.ready;
    ui.hovered[data.player] = data.id;
    if (data.ready) ui.checkAllReady();
};

var connection = new Connection();
