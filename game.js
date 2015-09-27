var canvasBg = document.getElementById("canvasBg");
var ctxBg = canvasBg.getContext("2d");

var canvasEntities = document.getElementById("canvasEntities");
var ctxEntities = canvasEntities.getContext("2d");

var canvasWidth = canvasBg.width;
var canvasHeight = canvasBg.height;

var player1 = new Player();

var enemies = [];
var numEnemies = 5;

var obstacles = [];

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

    defineObstacles();

    initEnemies();

    begin();
}

function begin() {
    ctxBg.drawImage(imgSprite, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
    isPlaying = true;
    requestAnimFrame(loop);
}

function update() {
    clearCtx(ctxEntities);
    updateAllEnemies();
    player1.update();
}

function draw() {
    drawAllEnemies();
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

    this.isShooting = false;

    var numBullets = 10;
    this.bullets = [];
    this.currentBullet = 0;

    for (var i = 0; i < numBullets; i++) {
        this.bullets[this.bullets.length] = new Bullet();
    }
}

Player.prototype.update = function() {
    this.centerX = this.drawX + (this.width / 2);
    this.centerY = this.drawY + (this.height / 2);

    this.checkDirection();

    this.checkShooting();
    this.updateAllBullets();
};

Player.prototype.draw = function() {
    this.drawAllBullets();
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

    obstacleCollision = this.checkObstacleCollide(newDrawX, newDrawY);

    if (!obstacleCollision && !outOfBounds(this, newDrawX, newDrawY)) {
        this.drawX = newDrawX;
        this.drawY = newDrawY;
    }
};

Player.prototype.checkObstacleCollide = function(newDrawX, newDrawY) {
    var obstacleCounter = 0;
    var newCenterX = newDrawX + (this.width / 2);
    var newCenterY = newDrawY + (this.height / 2);

    for (var i = 0; i < obstacles.length; i++) {
        if (obstacles[i].leftX < newCenterX && newCenterX < obstacles[i].rightX && obstacles[i].topY - 20 <
            newCenterY && newCenterY < obstacles[i].bottomY - 20) {
            obstacleCounter = 0;
        } else {
            obstacleCounter++;
        }
    }

    if (obstacleCounter === obstacles.length) {
        return false;
    } else {
        return true;
    }
};

Player.prototype.checkShooting = function() {
    if (this.isSpacebar && !this.isShooting) {
        this.isShooting = true;

        this.bullets[this.currentBullet].fire(this.centerX, this.centerY);
        this.currentBullet++;

        if (this.currentBullet >= this.bullets.length) {
            this.currentBullet = 0;
        }
    } else if  (!this.isSpacebar) {
        this.isShooting = false;
    }
};

Player.prototype.updateAllBullets = function() {
    for (var i = 0; i < this.bullets.length; i++) {
        if (this.bullets[i].isFlying) {
            this.bullets[i].update();
        }
    }
};

Player.prototype.drawAllBullets = function() {
    for (var i = 0; i < this.bullets.length; i++) {
        if (this.bullets[i].isFlying) {
            this.bullets[i].draw();
        }
    }
};

function Bullet() {
    this.radius = 2;
    this.width = this.radius * 2;
    this.height = this.radius * 2;

    // Center coords of circle shape for bullet
    this.drawX = 0;
    this.drawY = 0;

    this.isFlying = false;

    this.xVel = 0;
    this.yVel = 0;
    this.speed = 6;
}

Bullet.prototype.update = function() {
    this.drawX += this.xVel;
    this.drawY += this.yVel;

    this.checkHitEnemy();
    this.checkHitObstacle();
    this.checkOutOfBounds();
};

Bullet.prototype.draw = function() {
    ctxEntities.fillStyle = "white";

    ctxEntities.beginPath();
    ctxEntities.arc(this.drawX, this.drawY, this.radius, 0, Math.PI * 2, false);
    ctxEntities.closePath();

    ctxEntities.fill();
};

Bullet.prototype.fire = function(startX, startY) {
    var soundEffect = new Audio("audio/shooting.wav");
    soundEffect.play();

    this.drawX = startX;
    this.drawY = startY;

    if (player1.srcX === 0) { // Facing South
        this.xVel = 0;
        this.yVel = this.speed;
    } else if (player1.srcX === 35) { // Facing North
        this.xVel = 0;
        this.yVel = -this.speed;
    } else if (player1.srcX === 70) { // Facing West
        this.xVel = -this.speed;
        this.yVel = 0;
    } else { // Facing East
        this.xVel = this.speed;
        this.yVel = 0;
    }

    this.isFlying = true;
};

Bullet.prototype.recycle = function() {
    this.isFlying = false;
};

Bullet.prototype.checkHitEnemy = function() {
    for (var i = 0; i < enemies.length; i++) {
        if (collision(this, enemies[i]) && !enemies[i].isDead) {
            this.recycle;
            enemies[i].die();
        }
    }
};

Bullet.prototype.checkHitObstacle = function() {
    for (var i = 0; i < obstacles.length; i++) {
        if (collision(this, obstacles[i])) {
            this.recycle();
        }
    }
};

Bullet.prototype.checkOutOfBounds = function() {
    if (outOfBounds(this, this.drawX, this.drawY)) {
        this.recycle();
    }
};

function Obstacle(x, y, w, h) {
    this.drawX = x;
    this.drawY = y;
    this.width = w;
    this.height = h;

    this.leftX = this.drawX;
    this.rightX = this.drawX + this.width;
    this.topY = this.drawY;
    this.bottomY = this.drawY + this.height;
}

function defineObstacles() {
    var treeWidth = 65;
    var treeHeight = 90;
    var rockDimensions = 30;
    var bushHeight = 28;

    obstacles = [new Obstacle(78, 360, treeWidth, treeHeight),
        new Obstacle(390, 395, treeWidth, treeHeight),
        new Obstacle(415, 102, treeWidth, treeHeight),
        new Obstacle(619, 184, treeWidth, treeHeight),
        new Obstacle(97, 63, rockDimensions, rockDimensions),
        new Obstacle(296, 379, rockDimensions, rockDimensions),
        new Obstacle(295, 25, 150, bushHeight),
        new Obstacle(570, 138, 150, bushHeight),
        new Obstacle(605, 492, 90, bushHeight)
    ];
}

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

function collision(a, b) {
    return a.drawX <= b.drawX + b.width && a.drawX >= b.drawX && a.drawY <= b.drawY + b.height && a.drawY >= b.drawY;
}

function Enemy() {
    // src coords of Enemy image in sprite file
    this.srcX = 140;
    this.srcY = 600;

    // dimension of Enemy image in sprite
    this.width = 45;
    this.height = 54;

    // coords for the location of the Enemy
    this.drawX = randomRange(0, canvasWidth - this.width);
    this.drawY = randomRange(0, canvasHeight - this.height);

    // coords for the center of the Enemy in its current location
    this.centerX = this.drawX + (this.width / 2);
    this.cernerY = this.drawY + (this.height / 2);

    // target coords for where the Enemy will move next
    this.targetX = this.centerX;
    this.targetY = this.centerY;

    // time interval between enemy movements
    this.randomMoveTime = randomRange(4000, 10000);

    this.speed = 1;

    var that = this;
    this.moveInterval = setInterval(function() {
        that.setTargetLocation();
    }, that.randomMoveTime);

    this.isDead = false;
}

Enemy.prototype.update = function() {
    this.centerX = this.drawX + (this.width / 2);
    this.centerY = this.drawY + (this.height / 2);
    this.checkDirection();
};

Enemy.prototype.draw = function() {
    ctxEntities.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width,
        this.height);
};

Enemy.prototype.setTargetLocation = function() {
    this.randomMoveTime = randomRange(4000, 10000);
    var minX = this.centerX - 50;
    var maxX = this.centerX + 50;
    var minY = this.centerY - 50;
    var maxY = this.centerY + 50;

    if (minX < 0) {
        minX = 0;
    }

    if (maxX > canvasWidth) {
        maxX = canvasWidth;
    }

    if (minY < 0) {
        minY = 0;
    }

    if (maxY > canvasHeight) {
        maxY = canvasHeight;
    }

    this.targetX = randomRange(minX, maxX);
    this.targetY = randomRange(minY, maxY);
};

Enemy.prototype.checkDirection = function() {
    if (this.centerX < this.targetX) {
        this.drawX += this.speed;
    } else if (this.centerX > this.targetX) {
        this.drawX -= this.speed;
    }

    if (this.centerY < this.targetY) {
        this.drawY += this.speed;
    } else if (this.cetnerY > this.targetY) {
        this.drawY -= this.speed;
    }
};

Enemy.prototype.die = function() {
    var soundEffect = new Audio("audio/dying.wav");
    soundEffect.play();

    clearInterval(this.moveInterval);

    this.srcX = 185;
    this.isDead = true;
};

function initEnemies() {
    for (var i = 0; i < numEnemies; i++) {
        enemies[enemies.length] = new Enemy();
    }
}

function updateAllEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
}

function drawAllEnemies() {
    for (var i = 0; i < numEnemies; i++) {
        enemies[i].draw();
    }
}