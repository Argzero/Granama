var connection = new Connection();
var io = io || undefined;

/**
 * Reprsents the socket.io connection to the server. Use
 * connect() to set up the connection before trying to 
 * send/receive messages.
 *
 * @constructor
 */
function Connection() {
    this.socket = undefined;
    this.connected = false;
    this.callback = undefined;
    this.gameIndex = 0;
    this.localPlayers = 0;
    this.inRoom = false;
    this.room = undefined;
    this.isHost = true;
    this.timeOffset = 0;
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
    this.socket.on('addPlayers', this.onAddPlayers.bind(this));
    this.socket.on('buff', this.onBuff.bind(this));
    this.socket.on('changePattern', this.onChangePattern.bind(this));
    this.socket.on('damage', this.onDamage.bind(this));
    this.socket.on('destroy', this.onDestroy.bind(this));
    this.socket.on('doneUpgrades', this.onDoneUpgrades.bind(this));
    this.socket.on('downgrade', this.onDowngrade.bind(this));
    this.socket.on('general', this.onGeneral.bind(this));
    this.socket.on('getTime', this.onGetTime.bind(this));
    this.socket.on('giveExp', this.onGiveExp.bind(this));
    this.socket.on('joinRoom', this.onJoinRoom.bind(this));
    this.socket.on('kick', this.onKick.bind(this));
    this.socket.on('knockback', this.onKnockback.bind(this));
    this.socket.on('removePlayer', this.onRemovePlayer.bind(this));
    this.socket.on('setPaused', this.onSetPaused.bind(this));
    this.socket.on('spawn', this.onSpawn.bind(this));
    this.socket.on('startGame', this.onStartGame.bind(this));
    this.socket.on('updatePlayer', this.onUpdatePlayer.bind(this));
    this.socket.on('updateRobots', this.onUpdateRobots.bind(this));
    this.socket.on('updateRooms', this.onUpdateRooms.bind(this));
    this.socket.on('updateSelection', this.onUpdateSelection.bind(this));
    this.socket.on('upgrade', this.onUpgrade.bind(this));
    this.socket.on('upgradeSelection', this.onUpgradeSelection.bind(this));
    
    this.socket.emit('getTime', { localTime: performance.now() });
    
    this.connected = true;
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
 * Buffs a robot
 *
 * @param {number} robot      - the ID of the robot being buffed
 * @param {string} stat       - the stat being buffed
 * @param {number} multiplier - the buff multiplier
 * @param {number} duration   - the duration of the buff
 */
Connection.prototype.buff = function(robot, stat, multiplier, duration) {
    if (!this.connected || !this.inRoom) return;
    this.socket.emit('buff', {
        robot: robot,
        stat: stat,
        multiplier: multiplier,
        duration: duration,
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
    this.socket.emit('changePattern', {
        robot: robot,
        pattern: pattern,
        time: this.getServerTime()
    });
};

/**
 * Attempts to create a room on the server
 *
 * @param {string} name - name of the room
 */
Connection.prototype.createRoom = function(name) {
    if (!this.connected || this.inRoom) return;
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
    this.socket.emit('destroy', {
        robot: id,
        exp: exp,
        score: gameScreen.score,
        time: this.getServerTime()
    });
};

/**
 * Tells other players that all players are ready to start the next round
 */
Connection.prototype.doneUpgrades = function() {
    if (!this.connected || !this.inRoom) return;
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
    this.socket.emit('fetchRooms', { players: players.length });
};

/**
 * Tells other clients of the experience acquired by a player.
 * 
 * @param {number} index  - the index of the player receiving the exp
 * @param {number} amount - the amount of experience received
 */
Connection.prototype.giveExp = function(index, amount) {
    if (!this.connected || !this.inRoom) return;
    this.socket.emit('giveExp', {
        player: index,
        exp: amount,
        time: this.getServerTime()
    });
};

/**
 * Requests to join a game room using the given room name. If there
 * are no players, this will assume that it is for spectating.
 */
Connection.prototype.joinRoom = function(name) {
    if (!this.connected || this.inRoom) return;
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
    if (!connected || this.callback) return;
    
    this.callback = callback;
    this.socket.emit('login', { username: username, password: password });
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
    if (!connected || this.callback) return;
    
    this.callback = callback;
    this.socket.emit('signup', { username: username, password: password });
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
    
    this.inRoom = false;
    players = players.slice(this.gameIndex, this.gameIndex + this.localPlayers);
    gameScreen = new RoomScreen();
};

/**
 * Sends a request to tart the game
 */
Connection.prototype.requestStart = function(playerIndex) {
    if (!this.connected || !this.inRoom) return;
    this.socket.emit('requestStart', { 
        room: this.room
    });
};

/**
 * Sets the paused state of the game
 *
 * @param {number} id - the index of the player who paused the game or -1 if not paused
 */
Connection.prototype.setPaused = function(id) {
    if (!this.connected || !this.inRoom) return;
    this.socket.emit('setPaused', {
        player: id,
        time: this.getServerTime()
    });
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
 * Sends out the update for non-player robots
 *
 * @param {Object} data - the robot data
 */
Connection.prototype.updateRobots = function(data) {
    if (!this.connected || !this.inRoom) return;
    data.time = this.getServerTime();
    this.socket.emit('updateRobots', data);
};

/**
 * Sends an update for the player's current selection in the 
 * lobby screen so other players can see it.
 */
Connection.prototype.updateSelection = function(playerIndex) {
    if (!this.connected || !this.inRoom) return;
    this.socket.emit('updateSelection', { 
        selection: players[playerIndex].settings, 
        index: playerIndex, 
        time: this.getServerTime() 
    });
};

/**
 * Sends an update for the player's current position
 * as well as orientation
 */
Connection.prototype.updatePlayer = function(playerIndex) {
    if (!this.connected || !this.inRoom) return;
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
 * Message from the server about players joining the game 
 * from another computer. The data should include the values:
 *
 *   selections = [ { playerName, robot, ability, team, ready } ]
 *   index = the starting index to place the players
 *
 * @param {Object} data - the data for the joining players
 */
Connection.prototype.onAddPlayers = function(data) {
    if (!this.inRoom) return;
    for (var i = 0; i < data.selections.length; i++) {
        players[i + data.index].settings = data.selections[i]; 
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
    var r = gameScreen.getRobotById(data.robot);
    if (r) {
        r.buff(data.stat, data.multiplier, data.duration);
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
    var target = gameScreen.getRobotById(data.robot);
    var damager = gameScreen.getRobotById(data.damager);
    
    if (!target || !damager) return;
    
    // Grab values before applying damage
    var dead = target.dead;
    var prevHp = target.health;
    var prevSp = target.shield;
    
    // Apply damage to register stats
    target.damage(data.amount, damager);
    target.dead = dead;
    
    // Update remaining health/shield based on time stamps
    if (target.lastDamage > data.time) {
        target.health = prevHp;
        target.mana = prevSp;
    }
    else {
        target.health = data.healthLeft;
        target.shield = data.shieldLeft;
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
    var r = gameScreen.getRobotById(data.robot);
    if (r) {
        r.destroy();
    }
    gameScreen.score = data.score;
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
    ui.hovered[data.player] = data.upgrade;
    players[data.player].upgrades[data.upgrade]--;
    players[data.player].points++;
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
    if (this.callback) {
        this.callback(data);
        delete this.callback;
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
    players[data.player].giveExp(data.exp);
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
    if (this.inRoom) return;
    
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
    var r = gameScreen.getRobotById(data.robot);
    if (r) {
        r.knockback(new Vector(data.knockback.x, data.knockback.y));
    }
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
    players.splice(data.index, data.amount);
    appendPlayers(5);
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
    if (data.player == -1) gameScreen.paused = false;
    else gameScreen.paused = players[data.player];
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
    var selections = data.selections;
    
    players = players.slice(0, selections.length);
    
    for (i = 0; i < selections.length; i++) 
    {
        var selection = selections[i];
        var robot = PLAYER_DATA[selection.robot];
        var player = new robot.player();
        player.color = robot.color;
        player.name = robot.name;
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
    ui.ready[data.player] = data.ready;
    ui.hovered[data.player] = data.id;
    if (data.ready) ui.checkAllReady();
};
