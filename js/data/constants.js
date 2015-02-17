var

// Images used by death explosions
EXPLOSION_IMGS = new Array(
	new Sprite("EX1", 0, 0),
	new Sprite("EX2", 0, 0),
	new Sprite("EX3", 0, 0),
	new Sprite("EX4", 0, 0),
	new Sprite("EX5", 0, 0),
	new Sprite("EX6", 0, 0),
	new Sprite("EX7", 0, 0),
	new Sprite("EX8", 0, 0),
	new Sprite("EX9", 0, 0),
	new Sprite("EX10", 0, 0),
	new Sprite("PEX1", 0, 0),
	new Sprite("PEX2", 0, 0),
	new Sprite("PEX3", 0, 0),
	new Sprite("PEX4", 0, 0),
	new Sprite("PEX5", 0, 0),
	new Sprite("PEX6", 0, 0),
	new Sprite("PEX7", 0, 0),
	new Sprite("PEX8", 0, 0),
	new Sprite("PEX9", 0, 0),
	new Sprite("PEX10", 0, 0)
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
		player : PlayerGuardian,
		preview: 'pDefense',
		name   : 'Guardian',
		ups    : ['MinigunAttackSpeed', 'BlastRadius', 'Knockback', 'ShieldRecharge', 'MovementSpeed'],
		icons  : ['Minigun', 'Explosion', 'Knockback', 'Shield', 'Speed'],
		color  : '#d0d',
		weapons: ['Rocket Launcher', 'Minigun'],
		skills : [
			//{ name: 'Recharger', callback: SkillRecharger },
			{name: 'Perfect Shield', callback: skillPerfectShield},
			{name: 'Reflector', callback: skillReflector},
			{name: 'Stasis', callback: skillStasis}
		]
	},
	{
		player : PlayerBlitz,
		preview: 'pSpeed',
		name   : 'Blitz',
		ups    : ['CooldownReduction', 'ShotgunProjectiles', 'SlowingDuration', 'ShieldRecharge', 'MovementSpeed'],
		icons  : ['Cooldown', 'Shotgun', 'Slow', 'Shield', 'Speed'],
		color  : '#06f',
		weapons: ['Static Gun', 'Shotgun'],
		skills : [
			{name: 'Blink', callback: skillBlink},
			{name: 'Critical Blast', callback: skillCriticalBlast},
			{name: 'Overdrive', callback: skillOverdrive}
		]
	},
	{
		player : PlayerSlayer,
		preview: 'pPower',
		name   : 'Slayer',
		ups    : ['AttackSpeed', 'LaserSpread', 'FlamethrowerRange', 'ShieldRecharge', 'MovementSpeed'],
		icons  : ['Laser', 'Spread', 'Flamethrower', 'Shield', 'Speed'],
		color  : '#0f0',
		weapons: ['Laser Gun', 'Flamethrower'],
		skills : [
			{ name: 'KO Cannon', callback: skillKOCannon },
			{ name: 'Decimation', callback: skillDecimation },
			{ name: 'Wave Burst', callback: skillWaveburst } 
		]
	}
    /*
	{
		player : PlayerKnightType,
		preview: 'pKnight',
		name   : 'Knight',
		ups    : ['GrappleStun', 'SwordSwingArc', 'SwordLifeSteal', 'ShieldRecharge', 'MovementSpeed'],
		icons  : ['Grapple', 'Slash', 'Lifesteal', 'Shield', 'Speed'],
		color  : '#fcf',
		weapons: ['Grappling Hook', 'Sword'],
		skills : [
			{name: 'Piercing Arrow', callback: SkillPiercingArrow},
			{name: 'Gyro Slash', callback: SkillGyroSlash},
			{name: 'Sweeping Blade', callback: SkillSweepingBlade}
		]
	},
	{
		player : PlayerValkyrieType,
		preview: 'pValkyrie',
		name   : 'Valkyrie',
		ups    : ['ChargeSpeed', 'RailGunRange', 'DualShot', 'ShieldRecharge', 'MovementSpeed'],
		icons  : ['Charge', 'Range', 'Dual', 'Shield', 'Speed'],
		color  : '#0ff',
		weapons: ['Rail Gun', 'Double Shot'],
		skills : [
			{name: 'Ionic Thunder', callback: SkillIonicThunder},
			{name: 'Lock Down', callback: SkillLockdown},
			{name: 'Artillery', callback: SkillArtillery}
		]
	},
	{
		player : PlayerCommandoType,
		preview: 'pCommando',
		name   : 'Commando',
		ups    : ['DroneRange', 'DroneShots', 'LMGBaseDamage', 'ShieldRecharge', 'MovementSpeed'],
		icons  : ['DroneRange', 'DroneShots', 'LMGDamage', 'Shield', 'Speed'],
		color  : '#070',
		weapons: ['Drone Kit', 'Light Machine Gun'],
		skills : [
			{name: 'Missile Barrage', callback: SkillMissileBarrage},
			{name: 'Targeter', callback: SkillTargeter},
			{name: 'Laser Bomb', callback: SkillLaserBomb}
		]
	},
	{
		player : PlayerAngelType,
		preview: 'pAngel',
		name   : 'Angel',
		ups    : ['StaticAura', 'PowerAura', 'PrismBeamPower', 'ShieldRecharge', 'MovementSpeed'],
		icons  : ['DroneRange', 'DroneShots', 'LMGDamage', 'Shield', 'Speed'],
		color  : '#fff',
		weapons: ['Prism Beam', 'Healing Kit'],
		skills : [
			{name: 'Angelic Assault', callback: SkillAngelicAssault},
			{name: 'Aura Blast', callback: SkillAuraBlast},
			{name: 'Medic', callback: SkillMedic}
		]
	}
    */
],

// Animation
GAME_FPS = 60,
DAMAGE_ALPHA = 0.3,
DAMAGE_ALPHA_DECAY = 0.02,

// Boss statuses
ACTIVE_NONE = 0,
ACTIVE_BOSS = 1,

SPAWN_RATE = 180,
SPAWN_SCALE = 0.3,
MAX_ENEMIES = 30,
MINIBOSS_START = 8,
SPAWN_DATA = [
	90, 0, LightGunner,
	45, 1, HeavyGunner,
	60, 0, LightArtillery,
	30, 1, HeavyArtillery,
	15, 0, LightMelee,
	10, 1, HeavyMelee,
	30, 0, LightBomber,
	15, 1, HeavyBomber,
	20, 0, LightOrbiter,
	10, 1, HeavyOrbiter,
	15, 0, LightSpinner,
	10, 1, HeavySpinner,
	15, 5, LightMedic,
	10, 5, HeavyMedic,
	30, 0, LightGrabber,
	20, 1, HeavyGrabber,
	1, 3, Turreter,
	1, 3, Railer,
	1, 3, Paladin,
	1, 3, Hunter,
	1, 3, Solar,
	1, 3, Snatcher,
	2, 6, Turreter,
	2, 6, Railer,
	2, 6, Paladin,
	2, 6, Hunter,
	2, 6, Solar,
	2, 6, Snatcher
],
/*
BOSS_SPAWNS = [
	HeavyBoss,
	FireBoss,
	PunchBoss,
	QueenBoss,
	TankBoss,
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
	4, 0, HiveDroneEnemy,
	1, 0, HiveDefenderEnemy
],
*/

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
DRONE_RANGE_ID = 0,
STATIC_AURA_ID = 0,
SPREAD_ID = 1,
SHOTGUN_ID = 1,
EXPLOSION_ID = 1,
SLASH_ID = 1,
RAIL_ID = 1,
DRONE_SHOTS_ID = 1,
POWER_AURA_ID = 1,
FLAME_ID = 2,
SLOW_ID = 2,
KNOCKBACK_ID = 2,
LIFESTEAL_ID = 2,
DUAL_ID = 2,
LMG_DAMAGE_ID = 2,
PRISM_POWER_ID = 2,
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
COS_30 = Math.cos(Math.PI / 6),
SIN_30 = Math.sin(Math.PI / 6),
COS_45 = Math.cos(Math.PI / 4),
SIN_45 = Math.sin(Math.PI / 4),
COS_60 = Math.cos(Math.PI / 3),
SIN_60 = Math.sin(Math.PI / 3),
HALF_PI = Math.PI / 2,
QUARTER_PI = Math.PI / 4,
THREEQUARTERS_PI = 3 * Math.PI / 4,
HALF_RT_2 = Math.sqrt(2) / 2;