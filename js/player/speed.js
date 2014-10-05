function PlayerSpeedType() {
    var p = BasePlayer(
        GetImage('pPowerBody'),
        [ // Drop Chance | Drop type | Max | Backup Drop
            6,             COOLDOWN,   50,   5,
            6,             SHOTGUN,    50,   5,
            6,             SLOW,       50,   5,
            6,             SHIELD,     50,   6,
            6,             SPEED,      50,   6,
            10,            DAMAGE,     -1,   5,
            10,            HEALTH,     -1,   6,
            10,            HEAL,       -1,   7
        ]
    );
    
    return p;
}