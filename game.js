var canvasBg = document.getElementById('canvasBg');
var ctxBg = canvasBg.getContext('2d');

var canvasEntities = document.getElementById('canvasEntities');
var ctxEngitties = canvasEntities.getContext('2d');

var canvasWidth = canvasBg.width;
var canvasHeight = canvasBg.height;

//var player1 = new Player();

//var enemies = [];
//var numEnemies = 5;

//var obstacles = [];

var isPlaying = false;

var requestAnimFrame = window.requestAnimationFrame ||
						window.webkitRequestAnimationFrame ||
						window.mozRequestAnimationFrame ||
						window.oRequestAnimationFrame ||
						window.msRequestAnimationFrame ||
						function(callback) {
							window.setTimeout(callback, 1000 / 60);
						};

var imgSprite = new Image();

imgSprite.src = 'images/sprite.png';
imgSprite.addEventListener('load', init, false);

function init() {
	//document.addEventListener('keydown', checkKeyDown, false);
	//document.addEventListener('keyup', checkKeyUp, false);

	//defineObstacles();

	//initEnemies();

	begin();
}

function begin() {
	ctxBg.drawImage(imgSprite, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
	isPlaying = true;
	requestAnimFrame(loop);
}

function loop() {
	
}