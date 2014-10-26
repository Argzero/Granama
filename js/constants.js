var

EXPLOSION_IMGS = new Array(
	GetImage("EX1"), 
	GetImage("EX2"),
	GetImage("EX3"),
	GetImage("EX4"),
	GetImage("EX5"),
	GetImage("EX6"),
	GetImage("EX7"),
	GetImage("EX8"),
	GetImage("EX9"),
	GetImage("EX10"),
	GetImage("PEX1"), 
	GetImage("PEX2"),
	GetImage("PEX3"),
	GetImage("PEX4"),
	GetImage("PEX5"),
	GetImage("PEX6"),
	GetImage("PEX7"),
	GetImage("PEX8"),
	GetImage("PEX9"),
	GetImage("PEX10")
),

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

// Skill Data
PLAYER_DATA = [
	{
		player: PlayerDefenseType,
		preview: 'pDefense',
		name: 'Guardian',
		ups: ['MinigunAttackSpeed', 'BlastRadius', 'Knockback', 'ShieldRecharge', 'MovementSpeed'],
		icons: ['Minigun', 'Explosion', 'Knockback', 'Shield', 'Speed'],
        color: '#d0d',
		weapons: [ 'Rocket Launcher', 'Minigun' ],
		skills: [
			//{ name: 'Recharger', callback: SkillRecharger },
			{ name: 'Perfect Shield', callback: SkillPerfectShield },
			{ name: 'Reflector', callback: SkillReflector },
			{ name: 'Stasis', callback: SkillStasis }
		]
	},
	{
		player: PlayerSpeedType,
		preview: 'pSpeed',
		name: 'Blitz',
		ups: ['CooldownReduction', 'ShotgunProjectiles', 'SlowingDuration', 'ShieldRecharge', 'MovementSpeed'],
		icons: ['Cooldown', 'Shotgun', 'Slow', 'Shield', 'Speed'],
        color: '#06f',
		weapons: [ 'Static Gun', 'Shotgun' ],
		skills: [
			{ name: 'Blink', callback: SkillBlink },
			{ name: 'Critical Blast', callback: SkillCriticalBlast },
			{ name: 'Overdrive', callback: SkillOverdrive }
		]
	},
	{
		player: PlayerPowerType,
		preview: 'pPower',
		name: 'Slayer',
		ups: ['AttackSpeed', 'LaserSpread', 'FlamethrowerRange', 'ShieldRecharge', 'MovementSpeed'],
		icons: ['Laser', 'Spread', 'Flamethrower', 'Shield', 'Speed'],
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
		ups: ['ArrowVolleyCount', 'SwordSwingArc', 'SwordLifeSteal', 'ShieldRecharge', 'MovementSpeed'],
		icons: ['Arrow', 'Slash', 'Lifesteal', 'Shield', 'Speed'],
        color: '#fcf',
		weapons: [ 'Quiver Gun', 'Sword' ],
		skills: [
			{ name: 'Piercing Arrow', callback: SkillPiercingArrow },
			{ name: 'Gyro Slash', callback: SkillGyroSlash },
			{ name: 'Sweeping Blade', callback: SkillSweepingBlade }
		]
	},
    {
        player: PlayerValkyrieType,
        preview: 'pValkyrie',
        name: 'Valkyrie',
        ups: ['ChargeSpeed', 'RailGunRange', 'DualShot', 'ShieldRecharge', 'MovementSpeed'],
        icons: ['Charge', 'Range', 'Dual', 'Shield', 'Speed'],
        color: '#0ff',
        weapons: [ 'Rail Gun', 'Double Shot' ],
        skills: [
            { name: 'Ionic Thunder', callback: SkillIonicThunder },
			{ name: 'Lock Down', callback: SkillLockdown },
			{ name: 'Artillery', callback: SkillArtillery }
        ]
    }
],

// Animation
GAME_FPS = 60,
DAMAGE_ALPHA = 0.3,
DAMAGE_ALPHA_DECAY = 0.02,

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
    90, 0, LightRangedEnemy,
    45, 1, HeavyRangedEnemy,
    60, 0, LightArtilleryEnemy,
    30, 1, HeavyArtilleryEnemy,
    25, 0, LightMeleeEnemy,
    15, 1, HeavyMeleeEnemy,
    30, 0, LightBomberEnemy,
    15, 1, HeavyBomberEnemy,
	20, 0, LightOrbiterEnemy,
	10, 1, HeavyOrbiterEnemy,
	15, 0, LightBouncerEnemy,
	10, 1, HeavyBouncerEnemy,
    15, 5, LightMedicEnemy,
    10, 5, HeavyMedicEnemy,
	30, 0, LightGrabberEnemy,
	20, 1, HeavyGrabberEnemy,
    1,  3, TurretEnemy,
    1,  3, RailerEnemy,
    1,  3, PaladinEnemy,
	1,  3, HunterEnemy,
	1,  3, SolarEnemy,
	1,  3, SnatcherEnemy,
	2,  6, TurretEnemy,
    2,  6, RailerEnemy,
    2,  6, PaladinEnemy,
	2,  6, HunterEnemy,
	2,  6, SolarEnemy,
	2,  6, SnatcherEnemy
],
BOSS_SPAWNS = [
	HeavyBoss,
	FireBoss,
    PunchBoss,
	QueenBoss,
    DragonBoss
],
DRAGON_SPAWNS = [
    1, 0, HunterEnemy
],
HEAVY_SPAWNS = [
    1, 0, SolarEnemy
],
HEAVY_EASY_SPAWNS = [
	1, 0, LightBomberEnemy,
    1, 0, HeavyBomberEnemy
],
PUNCH_SPAWNS = [
    1, 0, PaladinEnemy
],
FIRE_SPAWNS = [
	10, 0, HeavyGrabberEnemy,
	1, 0, SnatcherEnemy
],
QUEEN_SPAWNS = [
	1, 0, HiveDroneEnemy,
	1, 0, HiveDefenderEnemy
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
CHARGE_ID = 0,
SPREAD_ID = 1,
SHOTGUN_ID = 1,
EXPLOSION_ID = 1,
SLASH_ID = 1,
RAIL_ID = 1,
FLAME_ID = 2,
SLOW_ID = 2,
KNOCKBACK_ID = 2,
LIFESTEAL_ID = 2,
DUAL_ID = 2,
SHIELD_ID = 3,
SPEED_ID = 4,
DAMAGE_ID = 5,
HEALTH_ID = 6,
HEAL_ID = 7,

// Drop data
BOSS_DROPS = 7,
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
KEY_SPACE = 6,
KEY_UP = 7,
KEY_DOWN = 8,
KEY_LEFT = 9,
KEY_RIGHT = 10,
KEY_ENTER = 11,

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