depend('draw/camera');
depend('robot/player/playerManager');
depend('robot/player/player');
depend('screen/gameScreen');

var camera = undefined;
onLoaderDone = function() {
	camera = new Camera('granama');
}