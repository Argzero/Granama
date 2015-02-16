/**
 * An enemy that orbits players while shooting bullets sideways
 *
 * @param {string} name         - name of the enemy sprite image
 * @param {number} x            - initial horizontal position
 * @param {number} y            - initial vertical position
 * @param {number} type         - Robot type ID of the enemy (should be Robot.MOB)
 * @param {number} health       - max health
 * @param {number} speed        - movement speed
 * @param {number} range        - attack range
 * @param {number} exp          - experience yield
 * @param {string} rank         - difficulty rank
 * @param {number} patternMin   - minimum time between switching attack patterns
 * @param {number} patternMax   - maximum time between switching attack patterns
 * @param {number} mDamage      - damage dealt by melee attacks
 * @param {number} mRate        - rate of melee attacks
 * @param {number} mSlow        - slow amount of melee attacks
 * @param {number} gDamage      - damage of grapple
 * @param {number} gRange       - range of the grapple
 * @param {number} gRate        - rate of the grapple
 * @param {number} gSelf        - whether or not the grapple pulls in the user
 * @param {string} leftClaw     - the image name for the left claw
 * @param {string} rightClaw    - the image name for the right claw
 * @param {number} dx           - horizontal offset for the claw images
 * @param {number} dy           - vertical offset for the claw images
 *
 * @constructor
 */
extend('Grabber', 'Enemy');
function Grabber(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax, mDamage, mRate, mSlow, gDamage, gRange, gRate, gSelf, leftClaw, rightClaw, dx, dy) {
    this.super(name, x, y, type, health, speed, range, exp, rank, patternMin, patternMax);
    this.movement = movement.basic;

    // Melee weapon
    this.addWeapon(weapon.melee, {
        damage  : mDamage * Enemy.sum(),
        range   : 100,
        rate    : mRate,
        slow    : mSlow,
        duration: 60
    });

    // Grapple weapon
    this.addWeapon(weapon.gun, {
        sprite   : leftClaw,
        damage   : gDamage * Enemy.sum(),
        range    : gRange,
        rate     : gRate,
        templates: [{ name: 'setupGrapple', args: [1, gSelf] }]
    });

    // Claw sprites
    this.leftClaw = new Sprite(leftClaw, dx, dy, this, false, true);
    this.rightClaw = new Sprite(rightClaw, -dx, dy, this, false, true);
    this.postChildren.push(this.leftClaw.child(this, true), this.rightClaw.child(this, true));
    this.grapple = false;
}

/**
 * Sets the visibility of the left claw before being drawn
 *
 * @param {Camera} camera - camera to draw to
 */
Grabber.prototype.onPreDraw = function(camera) {
    this.leftClaw.setVisible(!this.grapple);
};

/**
 * A light grabber enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('LightGrabber', 'Grabber');
function LightGrabber(x, y) {
    this.super(
        /* sprite name */ 'enemyLightGrabber',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 40 * Enemy.pow(0.9),
        /* speed       */ 3 + 0.3 * gameScreen.bossCount,
        /* range       */ 75,
        /* exp         */ Enemy.LIGHT_EXP,
        /* rank        */ Enemy.LIGHT_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* mDamage     */ 1,
        /* mRate       */ 60,
        /* mSlow       */ 0.75,
        /* gDamage     */ 1,
        /* gRange      */ 600,
        /* gRate       */ 120,
        /* gSelf       */ true,
        /* leftClaw    */ 'enemyLightGrabberArm',
        /* rightClaw   */ 'enemyLightGrabberArm',
        /* claw dx     */ 30,
        /* claw dy     */ 0
    );
}

/**
 * A heavy grabber enemy
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('HeavyGrabber', 'Grabber');
function HeavyGrabber(x, y) {
    this.super(
        /* sprite name */ 'enemyHeavyGrabber',
        /* x position  */ x,
        /* y position  */ y,
        /* enemy type  */ Robot.MOB,
        /* health      */ 60 * Enemy.pow(0.9),
        /* speed       */ 3 + 0.3 * gameScreen.bossCount,
        /* range       */ 75,
        /* exp         */ Enemy.HEAVY_EXP,
        /* rank        */ Enemy.HEAVY_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* mDamage     */ 1,
        /* mRate       */ 60,
        /* mSlow       */ 0.5,
        /* gDamage     */ 1,
        /* gRange      */ 600,
        /* gRate       */ 120,
        /* gSelf       */ true,
        /* leftClaw    */ 'enemyHeavyGrabberArmLeft',
        /* rightClaw   */ 'enemyHeavyGrabberArmRight',
        /* claw dx     */ 40,
        /* claw dy     */ 0
    );
}

/**
 * A snatcher miniboss that pulls the player to them
 *
 * @param {number} x - horizontal position
 * @param {number} y - vertical position
 *
 * @constructor
 */
extend('Snatcher', 'Grabber');
function Snatcher(x, y) {
    this.super(
        /* sprite name */ 'enemySnatcher',
        /* x position  */ x,
        /* y position  */ y,
        /* health      */ 60 * Enemy.pow(0.9),
        /* speed       */ 3 + 0.3 * gameScreen.bossCount,
        /* range       */ 500,
        /* exp         */ Enemy.MINIBOSS_EXP,
        /* rank        */ Enemy.MINIBOSS_ENEMY,
        /* pattern min */ 0,
        /* pattern max */ 0,
        /* mDamage     */ 3,
        /* mRate       */ 60,
        /* mSlow       */ 0.5,
        /* gDamage     */ 5,
        /* gRange      */ 600,
        /* gRate       */ 180,
        /* gSelf       */ false,
        /* leftClaw    */ 'enemySnatcherArmLeft',
        /* rightClaw   */ 'enemySnatcherArmRight',
        /* claw dx     */ 50,
        /* claw dy     */ 0
    );
}