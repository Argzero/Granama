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
    },
    {
        player : PlayerKnight,
        preview: 'pKnight',
        name   : 'Knight',
        ups    : ['GrappleStun', 'SwordSwingArc', 'SwordLifeSteal', 'ShieldRecharge', 'MovementSpeed'],
        icons  : ['Grapple', 'Slash', 'Lifesteal', 'Shield', 'Speed'],
        color  : '#fcf',
        weapons: ['Grappling Hook', 'Sword'],
        skills : [
            {name: 'Piercing Arrow', callback: skillPiercingArrow},
            {name: 'Gyro Slash', callback: skillGyroSlash},
            {name: 'Sweeping Blade', callback: skillSweepingBlade}
        ]
    },
    {
        player : PlayerValkyrie,
        preview: 'pValkyrie',
        name   : 'Valkyrie',
        ups    : ['ChargeSpeed', 'RailGunRange', 'DualShot', 'ShieldRecharge', 'MovementSpeed'],
        icons  : ['Charge', 'Range', 'Dual', 'Shield', 'Speed'],
        color  : '#0ff',
        weapons: ['Rail Gun', 'Double Shot'],
        skills : [
            {name: 'Ionic Thunder', callback: skillIonicThunder},
            {name: 'Lock Down', callback: skillLockdown},
            {name: 'Artillery', callback: skillArtillery}
        ]
    },
    {
        player : PlayerCommando,
        preview: 'pCommando',
        name   : 'Commando',
        ups    : ['DroneRange', 'DroneShots', 'LMGBaseDamage', 'ShieldRecharge', 'MovementSpeed'],
        icons  : ['DroneRange', 'DroneShots', 'LMGDamage', 'Shield', 'Speed'],
        color  : '#070',
        weapons: ['Drone Kit', 'Light Machine Gun'],
        skills : [
            {name: 'Missile Barrage', callback: skillMissileBarrage},
            {name: 'Targeter', callback: skillTargeter},
            {name: 'Laser Bomb', callback: skillLaserBomb}
        ]
    },
    {
        player : PlayerAngel,
        preview: 'pAngel',
        name   : 'Angel',
        ups    : ['StaticAura', 'PowerAura', 'PrismBeamPower', 'ShieldRecharge', 'MovementSpeed'],
        icons  : ['DroneRange', 'DroneShots', 'LMGDamage', 'Shield', 'Speed'],
        color  : '#fff',
        weapons: ['Prism Beam', 'Healing Kit'],
        skills : [
            {name: 'Angelic Assault', callback: skillAngelicAssault},
            {name: 'Aura Blast', callback: skillAuraBlast},
            {name: 'Repulsar', callback: skillRepulse}
        ]
    },
    {
        player : PlayerBeta,
        preview: 'pBeta',
        name   : 'Beta',
        ups    : ['ShurikenPierce', 'StealthDuration', 'ChargeSpeed', 'ShieldRecharge', 'MovementSpeed'],
        icons  : ['ShurikenPierce', 'StealthDuration', 'ChargeSpeed', 'Shield', 'Speed'],
        color  : '#727',
        weapons: ['Shuriken', 'Beta Blade'],
        skills : [
            {name: 'Piercing Arrow', callback: skillPiercingArrow},
            {name: 'Stealth', callback: skillStealth},
            {name: 'Sweeping Blade', callback: skillSweepingBlade}
        ]
    },
    {
        player : PlayerMeteor,
        preview: 'pMeteor',
        name   : 'Meteor',
        ups    : ['AbilityStrength', 'PunchSpeed', 'PunchStun', 'ShieldRecharge', 'MovementSpeed'],
        icons  : ['AbilityStrength', 'PunchSpeed', 'PunchStun', 'Shield', 'Speed'],
        color  : '#099',
        weapons: ['Punching', 'More Punching'],
        skills : [
            {name: 'Rocket Stance', callback: skillRocketStance},
            {name: 'Hurricane Stance', callback: skillHurricaneStance},
            {name: 'Wave Stance', callback: skillWaveStance}
        ]
    }
],

// Boss statuses
ACTIVE_NONE = 0,
ACTIVE_BOSS = 1,

SPAWN_RATE = 180,
SPAWN_SCALE = 0.3,
SPAWN_DATA = [
    90, 0, LightGunner,
    45, 1, HeavyGunner,
    60, 0, LightArtillery,
    30, 1, HeavyArtillery,
    15, 1, LightMelee,
    10, 2, HeavyMelee,
    30, 0, LightBomber,
    15, 1, HeavyBomber,
    20, 0, LightOrbiter,
    10, 1, HeavyOrbiter,
    15, 0, LightSpinner,
    10, 1, HeavySpinner,
    15, 5, LightMedic,
    10, 5, HeavyMedic,
    30, 2, LightGrabber,
    20, 3, HeavyGrabber,
    30, 1, LightRocketer,
    15, 2, HeavyRocketer,
    15, 1, LightAnt,
    10, 2, HeavyAnt, 
    10000000, 0, LightBird,
    1, 3, Turreter,
    1, 3, Railer,
    1, 3, Paladin,
    1, 3, Hunter,
    1, 3, Solar,
    1, 3, Snatcher,
	1, 3, Harrier,
    1, 3, Goliath,
    2, 6, Turreter,
    2, 6, Railer,
    2, 6, Paladin,
    2, 6, Hunter,
    2, 6, Solar,
    2, 6, Snatcher,
	2, 6, Harrier,
    2, 6, Goliath
],
BOSS_SPAWNS = [
    HeavyBoss,
    ScorpionBoss,
    BrawlerBoss,
    HiveQueenBoss,
    FortressBoss
],
DRAGON_SPAWNS = [
    1, 0, Hunter
],
HEAVY_SPAWNS = [
    1, 0, Solar
],
HEAVY_EASY_SPAWNS = [
    1, 0, LightBomber,
    1, 0, HeavyBomber
],
PUNCH_SPAWNS = [
    1, 0, Paladin
],
FIRE_SPAWNS = [
    10, 0, HeavyGrabber,
    1, 0, Snatcher
],
QUEEN_SPAWNS = [
    4, 0, HiveDrone,
    1, 0, HiveDefender
],

// Drop IDs
LASER_ID = 0,
COOLDOWN_ID = 0,
MINIGUN_ID = 0,
ARROW_ID = 0,
CHARGE_ID = 0,
DRONE_RANGE_ID = 0,
STATIC_AURA_ID = 0,
SHURIKEN_PIERCE_ID = 0,
METEOR_ABILITY_ID = 0,
SPREAD_ID = 1,
SHOTGUN_ID = 1,
EXPLOSION_ID = 1,
SLASH_ID = 1,
RAIL_ID = 1,
DRONE_SHOTS_ID = 1,
POWER_AURA_ID = 1,
STEALTH_DURATION_ID = 1,
PUNCH_SPEED_ID = 1,
FLAME_ID = 2,
SLOW_ID = 2,
KNOCKBACK_ID = 2,
LIFESTEAL_ID = 2,
DUAL_ID = 2,
LMG_DAMAGE_ID = 2,
PRISM_POWER_ID = 2,
CHARGE_SPEED_ID = 2,
PUNCH_STUN_ID = 2,
SHIELD_ID = 3,
SPEED_ID = 4,
DAMAGE_ID = 5,
HEALTH_ID = 6,
HEAL_ID = 7,

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