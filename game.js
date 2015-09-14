var canvasBg = document.getElementById("canvasBg");
var ctxBg = canvasBg.getContext("2d");

var canvasEntities = document.getElementById("canvasEntities");
var ctxEntities = canvasEntities.getContext("2d");

var canvasWidth = canvasBg.width;
var canvasHeight = canvasBg.height;

var player1 = new Player();

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

imgSprite.src = "images/sprite.png";
imgSprite.addEventListener("load", init, false);

function init() {
    document.addEventListener("keydown", function(e) {
        checkKey(e, true);
    }, false);
    document.addEventListener("keyup", function(e) {
        checkKey(e, false);
    }, false);

    //defineObstacles();

    //initEnemies();

    begin();
}

function begin() {
    ctxBg.drawImage(imgSprite, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
    isPlaying = true;
    requestAnimFrame(loop);
}

function update() {
    clearCtx(ctxEntities);
    //updateAllEnemies();
    player1.update();
}

function draw() {
    //drawAllEnemies();
    player1.draw();
}

function loop() {
    if (isPlaying) {
        update();
        draw();
        requestAnimFrame(loop);
    }
}

function clearCtx(ctx) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

function Player() {
    this.srcX = 0;
    this.srcY = 600;

    this.width = 35;
    this.height = 54;

    this.drawX = 400;
    this.drawY = 300;

    this.centerX = this.drawX + (this.width / 2);
    this.centerY = this.drawY + (this.height / 2);

    this.speed = 2;

    this.isUpKey = false;
    this.isRightKey = false;
    this.isDownKey = false;
    this.isLeftKey = false;
    this.isSpacebar = false;

    // this.isShooting = false;

    // var numBullets = 10;
    // this.bullets = [];
    // this.currentBullet = 0;

    // for (var i = 0; i < numBullets; i++) {
    //  this.bullets[this.bullets.length] = new Bullet();
    // }
}

Player.prototype.update = function() {
    this.centerX = this.drawX + (this.width / 2);
    this.centerY = this.drawY + (this.height / 2);

    this.checkDirection();

    //this.checkShooting();
    //this.updateAllBullets();
};

Player.prototype.draw = function() {
    //this.drawAllBullets();
    ctxEntities.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width,
        this.height);
};

Player.prototype.checkDirection = function() {
    var newDrawX = this.drawX;
    var newDrawY = this.drawY;

    var obstacleCollision = false;

    if (this.isUpKey) {
        newDrawY -= this.speed;
        this.srcX = 35; // Facing North
    } else if (this.isDownKey) {
        newDrawY += this.speed;
        this.srcX = 0; // Facing South
    } else if (this.isRightKey) {
        newDrawX += this.speed;
        this.srcX = 105; // Facing East
    } else if (this.isLeftKey) {
        newDrawX -= this.speed;
        this.srcX = 70; // Facing West
    }

    //obstacleCollision = this.checkObstacleCollide(newDrawX, newDrawY);

    if (!obstacleCollision && !outOfBounds(this, newDrawX, newDrawY)) {
        this.drawX = newDrawX;
        this.drawY = newDrawY;
    }
};

function checkKey(e, value) {
    var keyID = e.keyCode || e.which;
    if (keyID === 38) { // Up arrow
        player1.isUpKey = value;
        e.preventDefault(); // Prevents arrow key from being used to scroll
    }
    if (keyID === 39) { // Right arrow
        player1.isRightKey = value;
        e.preventDefault();
    }
    if (keyID === 40) { // Down arrow
        player1.isDownKey = value;
        e.preventDefault();
    }
    if (keyID === 37) { // Left arrow
        player1.isLeftKey = value;
        e.preventDefault();
    }
    if (keyID === 32) { // Spacebar
        player1.isSpacebar = value;
        e.preventDefault();
    }
}

function outOfBounds(a, x, y) {
    var newBottomY = y + a.height;
    var newTopY = y;
    var newRightX = x + a.width;
    var newLeftX = x;

    treeLineTop = 5;
    treeLineBottom = 570;
    treeLineRight = 750;
    treeLineLeft = 65;

    return newBottomY > treeLineBottom || newTopY < treeLineTop || newRightX > treeLineRight || newLeftX < treeLineLeft;
}