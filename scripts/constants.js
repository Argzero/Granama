var

// Sizes
WINDOW_WIDTH = 800,
WINDOW_HEIGHT = 800,
SIDEBAR_WIDTH = 200,
UI_WIDTH = 80,
GAME_WIDTH = 3000,
GAME_HEIGHT = 3000,

// Movement
BULLET_SPEED = 10,
PLAYER_SPEED = 3,

// Health
PLAYER_HEALTH = 20,

// Attacks
GUN_CD = 10,
GUN_DAMAGE = 1,
GUN_RANGE = 400,
LASER_APS = 5,
LASER_DAMAGE = 0.5,
LASER_RANGE = 499,
FIRE_CD = 2,
FIRE_DAMAGE = 0.1,
FIRE_RANGE = 100,
MINE_DURATION = 1200,
MINE_RADIUS = 50,
TURRET_HEALTH = 0.2,
TURRET_RATE = 15,
TURRET_RANGE = 500,

// Ability names
BLINK = 'Blink',
OVERDRIVE = 'Overdrive',
TELEPORT = 'Teleport',
WAVEBURST = 'Wave Burst',
BREAKERBLASTER = 'KO Cannon',
DECIMATION = 'Decimation',
STASIS = 'Stasis',
REFLECTOR = 'Reflector',
RECHARGER = 'Recharger',

//Ability Cooldowns
//Speed
BLINK_CD = 300,
OVERDRIVE_CD = 600,
TELEPORT_CD = 600,
//Power
WAVEBURST_CD = 600,
BREAKERBLASTER_CD = 600,
DECIMATION_CD = 1500,
//Defense
STASIS_CD = 1200,
REFLECTOR_CD = 900,
RECHARGER_CD = 1500,

//Ability Durations (where applicable)
OVERDRIVE_DURATION = 300,
BREAKERBLASTER_DURATION = 120,
DECIMATION_DURATION = 420,
WAVEBURST_DURATION = 120,
STASIS_DURATION = 180,
REFLECTOR_DURATION = 240,
TELEPORT_DURATION = 1800,
BREAKERBLASTER_DURATION = 120,

// Other ability values
BLINK_DISTANCE = 300,
STASIS_REGEN = 0.5,
STASIS_REDUCTION = 0.1,
REFLECT_AMOUNT = 1,

// Animation
GAME_FPS = 60,
DAMAGE_ALPHA = 0.3,
DAMAGE_ALPHA_DECAY = 0.02,

// Scaling
DAMAGE_DIVISOR = 500,

// Attack types
ATTACK_BULLET = 0,
ATTACK_MINES = 1,
ATTACK_MELEE = 2,
ATTACK_HAMMER = 3,
ATTACK_TURRET = 4,
ATTACK_RAIL = 5,

// Spawning
// Normal base rate
BOSS_SPAWN_BASE = 50,
BOSS_SPAWN_SCALE = 25,
// Testing base rate
//BOSS_SPAWN_BASE = 1,
//BOSS_SPAWN_SCALE = 0,
SPAWN_RATE = 180,
SPAWN_SCALE = 0.3,
MAX_ENEMIES = 30,
MINIBOSS_START = 8,
ENEMY_VALUE_COUNT = 9,
ENEMY_TYPE = 0,
ENEMY_DAMAGE = 1,
ENEMY_RANGE = 2,
ENEMY_ATTACK_RATE = 3,
ENEMY_HEALTH = 4,
ENEMY_CHANCE = 5,
ENEMY_ATTACK = 6,
ENEMY_SPEED = 7,
ENEMY_SPEED_SCALE = 8,
ENEMY_DATA = new Array(
//  Name            | Dmg | Range | Atk Rate | HP | Chance | Attack Type    | Speed | Speed Scale
    "LightRanged",    1,    200,    20,        20,  90,      ATTACK_BULLET,   2.5,    0.4,
    "LightArtillery", 1,    400,    45,        10,  60,      ATTACK_BULLET,   2,      0.3,
    "LightBomber",    3,    400,    90,        15,  30,      ATTACK_MINES,    2.5,    0.5,
    "LightMelee",     2,    50,     30,        35,  15,      ATTACK_MELEE,    3.5,    0.7,
    "HeavyRanged",    1,    250,    15,        30,  45,      ATTACK_BULLET,   2,      0.4,
    "HeavyArtillery", 2,    400,    35,        20,  30,      ATTACK_BULLET,   1.5,    0.3,
    "HeavyBomber",    5,    500,    90,        20,  15,      ATTACK_MINES,    2.5,    0.5,
    "HeavyMelee",     3,    50,     40,        45,  15,      ATTACK_MELEE,    3,      0.6,
// [-- Mini Bosses -------------------------------------------------------------------------------] 
    "Turret",         1,    550,    600,       120, 1,       ATTACK_TURRET,   2,      0.3,
    "Railer",         0.1,  550,    60,        80,  1,       ATTACK_RAIL,     2,      0.4,
    "Paladin",        4,    300,    60,        100, 1,       ATTACK_HAMMER,   3,      0.5
),

BOSS_SPEED_SCALE = 0.4;
BOSS_HEAVY = 0,
BOSS_FIRE = 1,
BOSS_PUNCH = 2,
BOSS_DRAGON = 999,
BOSS_COUNT = 3,
BOSS_RUSH_DRAGON = 3,
BOSS_DATA = new Array(

// Heavy Boss
//         | Gun                                | Rocket                             | Mines                             |
//  HP (0) | Range (1) | Atk Rate (2) | Dmg (3) | Range (4) | Atk Rate (5) | Dmg (6) | Rate (7) | Dmg (8) | Lifespan (9) | Speed (10) 
	150,     350,        5,             0.5,      500,        60,            4,        30,        8,        2700,          3,

// Fire Boss
//          | Flamethrower                     | Rocket                                               |            | Tail           
//  HP (11) | Range (12) | Rate (13) | Dmg(14) | Range (15) | Rate (16) | Round Delay (17) | Dmg (18) | Speed (19) | Offset (20) | length (21) | Base (22)
    120,      200,         3,          0.02,     500,         180,        20,                4,         3,           15,           5,            25,
    
// Punch Boss
//                       | Punches                                                        | Laser
//  HP (23) | Speed (24) | Range (25) | Rate (26) | Dmg (27) | Velocity (28) | Delay (29) | Range (30) | Rate (31) | Round (32) | Dmg (33)
    150,      3,           400,         300,        1,         15,             120,         500,         150,        60,          0.05,
    
// Dragon Boss
//                       | Tail                                              | Wing Gun                             | Tail Turrets
//  HP (34) | Speed (35) | Length (36) | Offset (37) | Space (38) | End (39) | Rate (40) | Damage (41) | Range (42) | Rate (43) | Damage (44) | Range (45) 
    250,      5,           5,            30,           40,          10,        15,         1,            1000,        20,         0.1,          1000
),

// Drop names (Do not modify these values)
LASER = "Laser",
SHIELD = "Shield",
FLAMETHROWER = "Flamethrower",
SPREAD_SHOT = "Spread",
HEALTH = "Health",
DAMAGE = "Damage",
HEAL = "Heal",
SPEED = "Speed",

// Drop IDs
LASER_ID = 0,
SHIELD_ID = 1,
FLAME_ID = 2,
SPREAD_ID = 3,
HEALTH_ID = 4,
DAMAGE_ID = 5,
HEAL_ID = 6,
SPEED_ID = 7,

// Drop data
DROP_COUNT = 8,
BOSS_DROPS = 6,
DROP_VALUE_COUNT = 2,
DROP_CHANCE = 0,
DROP_TYPE = 1,
DROP_LASER = 0,
DROP_SPREAD = 1,
DROP_FLAMETHROWER = 2,
DROP_SHIELD = 3,
DROP_HEALTH = 4,
DROP_DAMAGE = 5,
DROP_SPEED = 6,
DROP_HEAL = 7,
DROPS = new Array (
//  Drop Chance | Drop Type
    10,           LASER,
    5,            SPREAD_SHOT,
    10,           FLAMETHROWER,
    10,            SHIELD,
	10,           HEALTH,
	10,           DAMAGE,
	10,           SPEED,
	10,           HEAL
),

// Drop values
MAX_DROPS = 50,
FLAME_UP = 4,
LASER_UP = 0.5,
DAMAGE_UP = 0.1,
SPEED_UP = 0.04,
MAX_SPEED = PLAYER_SPEED + SPEED_UP * MAX_DROPS,
HEALTH_UP = 5,
HEAL_PERCENT = 20,
SHIELD_MAX = 0.2,
SHIELD_GAIN = 0.01,
SHIELD_RATE = 850,
SHIELD_SCALE = 15,

// Input (Do not modify these values)
KEY_UNUSED = -1,
KEY_W = 0,
KEY_A = 1,
KEY_S = 2,
KEY_D = 3,
KEY_ESC = 4,
KEY_LMB = 5,
KEY_SPACE = 6;

// Menu IDs (Do not modify these values)
TITLE_SCREEN = 0,
CHARACTER_SELECT = 1,
CONTROLS = 2,
CREDITS = 3,
GAME = 4,

// Menu color codes
BUTTON_BORDER = "#484848",
BUTTON_HOVER = "#383838",
BUTTON_BG = "#000000",

// Default drop rates for drops (do not change this)
DEFAULT_DROPS = new Array(
    DROPS[0],
    DROPS[2],
    DROPS[4],
    DROPS[6],
    DROPS[8],
    DROPS[10],
    DROPS[12],
    DROPS[14]
),

// Math (Do not modify these values)
COS_1 = Math.cos(Math.PI / 180),
SIN_1 = Math.sin(Math.PI / 180),
COS_3 = Math.cos(Math.PI / 60),
SIN_3 = Math.sin(Math.PI / 60),
COS_5 = Math.cos(Math.PI / 36),
SIN_5 = Math.sin(Math.PI / 36),
COS_10 = Math.cos(Math.PI / 18),
SIN_10 = Math.sin(Math.PI / 18),
COS_15 = Math.cos(Math.PI / 12),
SIN_15 = Math.sin(Math.PI / 12),
HALF_PI = Math.PI / 2,
QUARTER_PI = Math.PI / 4,
THREEQUARTERS_PI = 3 * Math.PI / 4,
HALF_RT_2 = Math.sqrt(2) / 2;