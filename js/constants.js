var

// Sizes
WINDOW_WIDTH = 800,
WINDOW_HEIGHT = 800,
SIDEBAR_WIDTH = 200,
GAME_WIDTH = 3000,
GAME_HEIGHT = 3000,

// Movement
BULLET_SPEED = 10,
PLAYER_SPEED = 3,

// Health
PLAYER_HEALTH = 100,

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
BLITZ = 'Blitz',
WAVEBURST = 'Wave Burst',
BREAKERBLASTER = 'KO Cannon',
DECIMATION = 'Decimation',
STASIS = 'Stasis',
REFLECTOR = 'Reflector',
RECHARGER = 'Recharger',

// Ability methods
SKILL_METHODS = {
    BLINK: SkillBlink,
    OVERDRIVE: SkillOverdrive,
    TELEPORT: SkillTeleport,
    BLITZ: SkillBlitz,
    WAVEBURST: SkillWaveburst,
    KOCANNON: SkillBreakerblaster,
    DECIMATION: SkillDecimation,
    STASIS: SkillStasis,
    REFLECTOR: SkillReflector,
    RECHARGER: SkillRecharger
},

// Skill Data
PLAYER_DATA = [
	{
		player: PlayerDefenseType,
		preview: 'pDefense',
		name: 'Guardian',
        color: '#d0d',
		weapons: [ 'Rocket Launcher', 'Minigun' ],
		skills: [
			{ name: 'Recharger', callback: SkillRecharger },
			{ name: 'Reflector', callback: SkillReflector },
			{ name: 'Stasis', callback: SkillStasis }
		]
	},
	{
		player: PlayerSpeedType,
		preview: 'pSpeed',
		name: 'Blitz',
        color: '#06f',
		weapons: [ 'Static Gun', 'Shotgun' ],
		skills: [
			{ name: 'Blink', callback: SkillBlink },
			{ name: 'Overdrive', callback: SkillBlitz },
			{ name: 'Overdrive', callback: SkillOverdrive }
		]
	},
	{
		player: PlayerPowerType,
		preview: 'pPower',
		name: 'Slayer',
        color: '#0f0',
		weapons: [ 'Laser Gun', 'Flamethrower' ],
		skills: [
			{ name: 'KO Cannon', callback: SkillBreakerblaster },
			{ name: 'Decimation', callback: SkillDecimation },
			{ name: 'Wave Burst', callback: SkillWaveburst }
		]
	},
    {
		player: PlayerKnightType,
		preview: 'pKnight',
		name: 'Knight',
        color: '#fcf',
		weapons: [ 'Quiver Gun', 'Sword' ],
		skills: [
			{ name: 'Recharger', callback: SkillPiercingArrow },
			{ name: 'Reflector', callback: SkillReflector },
			{ name: 'Stasis', callback: SkillStasis }
		]
	}
],

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

// Boss statuses
ACTIVE_NONE = 0,
ACTIVE_BOSS = 1,

// Spawning
MAX_BOSS_INTERVAL = 40,
BOSS_SPAWN_INTERVAL = 180,
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
SPAWN_DATA = [
    90, LightRangedEnemy,
    45, HeavyRangedEnemy,
    60, LightArtilleryEnemy,
    30, HeavyArtilleryEnemy,
    15, LightMeleeEnemy,
    15, HeavyMeleeEnemy,
    30, LightBomberEnemy,
    15, HeavyBomberEnemy,
    1, TurretEnemy,
    1, RailerEnemy,
    1, PaladinEnemy
],
BOSS_SPAWNS = [
	HeavyBoss,
	FireBoss,
    PunchBoss
],

// Drop names (Do not modify these values)
// General
SHIELD = "Shield",
HEALTH = "Health",
DAMAGE = "Damage",
HEAL = "Heal",
SPEED = "Speed",
// Speed 
COOLDOWN = "Cooldown",
SHOTGUN = "Shotgun",
SLOW = "Slow",
// Power
LASER = "Laser",
FLAMETHROWER = "Flamethrower",
SPREAD_SHOT = "Spread",
// Defense
MINIGUN = "Minigun",
EXPLOSION = "Explosion",
KNOCKBACK = "Knockback",
// Knight
ARROW = "Arrow",
SLASH_ARC = "Slash",
LIFESTEAL = "Lifesteal",

// Drop IDs
LASER_ID = 0,
COOLDOWN_ID = 0,
MINIGUN_ID = 0,
ARROW_ID = 0,
SPREAD_ID = 1,
SHOTGUN_ID = 1,
EXPLOSION_ID = 1,
SLASH_ID = 1,
FLAME_ID = 2,
SLOW_ID = 2,
KNOCKBACK_ID = 2,
LIFESTEAL_ID = 2,
SHIELD_ID = 3,
SPEED_ID = 4,
DAMAGE_ID = 5,
HEALTH_ID = 6,
HEAL_ID = 7,

// Drop data
BOSS_DROPS = 6,
DROP_COUNT = 8,
DROP_VALUES = 4,
DROP_CHANCE = 0,
DROP_TYPE = 1,
DROP_MAX = 2,
DROP_BACKUP = 3,

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
KNOCKBACK_SCALE = 10,
KNOCKBACK_SPEED = 10,

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

// Math (Do not modify these values)
COS_1 = Math.cos(Math.PI / 180),
SIN_1 = Math.sin(Math.PI / 180),
COS_2 = Math.cos(Math.PI / 90),
SIN_2 = Math.sin(Math.PI / 90),
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