function PlayerDefenseType() {
    var p = BasePlayer(
        GetImage('pPowerBody'),
        [ // Drop Chance | Drop type | Max | Backup Drop
            6,             MINIGUN,    50,   5,
            6,             EXPLOSION,  50,   5,
            6,             KNOCKBACK,  50,   5,
            6,             SHIELD,     50,   6,
            6,             SPEED,      50,   6,
            10,            DAMAGE,     -1,   5,
            10,            HEALTH,     -1,   6,
            10,            HEAL,       -1,   7
        ]
    );
    
    return p;
}