// Available buff particles
var BUFF = {
	DEF_UP: 0,
	DMG_DOWN: 1,
	HP_UP: 2,
	SHIELD_UP: 3,
	SPEED_DOWN: 4,
	SPEED_UP: 5
};

var BP_ROT = Vector(Math.cos(0.05), Math.sin(0.05));
var TRAIL_LENGTH = 3;

// 6 is the number of buffs
// 4 is the number of trail particles + 1
var BT_ROT = Vector(Math.cos(Math.PI * 2 / (6 * (TRAIL_LENGTH + 1))), -Math.sin(Math.PI * 2 / (6 * (TRAIL_LENGTH + 1))));

/**
 * A manager for buff particles
 * 
 * @constructor
 */
function BuffManager(radius)
{
	this.buffs = [false, false, false, false, false, false];
	this.count = 0;
	this.rotation = Vector(radius, 0);
	this.imgs = [
		'DefUp',
		'DmgDown',
		'HpUp',
		'ShieldUp',
		'SpeedDown',
		'SpeedUp'
	];
}

/**
 * Enables a buff particle effect
 * 
 * @param {Number} buff - buff ID to enable
 */
BuffManager.prototype.enable = function(buff)
{
	if (!this.buffs[buff])
	{
		this.count++;
		this.buffs[buff] = true;
	}
}

/**
 * Disables a buff particle effect
 *
 * @param {Number} buff - buff ID to disable
 */
BuffManager.prototype.disable = function(buff)
{
	if (this.buffs[buff])
	{
		this.count--;
		this.buffs[buff] = false;
	}
}

/**
 * Draws the active buff particles
 */
BuffManager.prototype.draw = function()
{
	// No drawing if none are active
	if (this.count == 0) return;
	
	var angle = Math.PI * 2 / this.count;
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);
	
	var dir = Vector(this.rotation.x, this.rotation.y);
	var trailDir = Vector(0, 0);
	
	// Draw active particles
	for (var i = 0; i < this.buffs.length; i++) 
	{
		if (this.buffs[i])
		{
			var img = GetImage('buff' + this.imgs[i]);
			var trail = GetImage('buff' + this.imgs[i] + 'Trail');
			canvas.drawImage(img, dir.x - img.width / 2, dir.y - img.height / 2);
			
			trailDir.x = dir.x;
			trailDir.y = dir.y;
			for (var j = 0; j < TRAIL_LENGTH; j++)
			{
				canvas.globalAlpha = (TRAIL_LENGTH - j) / (TRAIL_LENGTH + 1);
				trailDir.Rotate(BT_ROT.x, BT_ROT.y);
				canvas.drawImage(trail, trailDir.x - trail.width / 2, trailDir.y - trail.height / 2);
			}
			canvas.globalAlpha = 1;
			
			dir.Rotate(cos, sin);
		}
	}
	
	// Rotate if not paused
	if (!gameScreen.paused)
	{
		this.rotation.Rotate(BP_ROT.x, BP_ROT.y);
	}
}