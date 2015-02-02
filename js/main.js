depend('draw/camera');
depend('robot/player/playerManager');
depend('screen/gameScreen');

var camera = undefined;
onLoaderDone = function() {
	camera = new Camera('granama');
}