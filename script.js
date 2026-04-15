var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var actionBtn = document.getElementById("actionBtn");
var scoreEl = document.getElementById("score");
var hiddenScoreEl = document.getElementById("tocke");
var timeEl = document.getElementById("cas");
var levelEl = document.getElementById("level");

var x = 150, y = 200, dx = 2.8, dy = -2.8;
var WIDTH = canvas.width, HEIGHT = canvas.height, r = 12;

var intervalId = null, timerId = null;
var level = 1, score = 0, seconds = 0;
var paddlex = 0, paddleh = 28, paddlew = 140;
var rightDown = false, leftDown = false;
var bricks = [], NROWS = 3, NCOLS = 4, BRICKWIDTH = 0, BRICKHEIGHT = 24, PADDING = 10;
var BRICKOFFSETLEFT = 18, BRICKOFFSETTOP = 42;
var gameWon = false, isPaused = false, gameStarted = false, assetsReady = 0;

var paddleImg = new Image();
var puckImg = new Image();
paddleImg.src = "paddle.png";
puckImg.src = "puck.png";

paddleImg.onload = assetLoaded;
puckImg.onload = assetLoaded;

function assetLoaded() {
    assetsReady++;
    if (assetsReady >= 2) resetBoard();
}

function showGameAlert(title, text, icon, confirmButtonText) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: confirmButtonText,
        background: "#091729",
        color: "#eef8ff",
        confirmButtonColor: "#ffffff",
        backdrop: "rgba(4, 10, 20, 0.72)",
        customClass: {
            popup: "swal-popup",
            title: "swal-title",
            htmlContainer: "swal-text",
            confirmButton: "swal-confirm"
        },
        buttonsStyling: true
    });
}

function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    return m + ":" + s;
}

function updateUI() {
    scoreEl.textContent = score;
    hiddenScoreEl.textContent = score;
    timeEl.textContent = formatTime(seconds);
    levelEl.textContent = level;

    if (!gameStarted) actionBtn.textContent = "Start Game";
    else if (isPaused) actionBtn.textContent = "Resume";
    else actionBtn.textContent = "Pause";
}

function stopLoops() {
    clearInterval(intervalId);
    clearInterval(timerId);
    intervalId = null;
    timerId = null;
}

function startLoops() {
    stopLoops();
    intervalId = setInterval(draw, 10);
    timerId = setInterval(function () {
        if (!isPaused) {
            seconds++;
            timeEl.textContent = formatTime(seconds);
        }
    }, 1000);
}

function resetBall() {
    x = WIDTH / 2;
    y = HEIGHT - 75;
    dx = 2.8;
    dy = -2.8;
}

function initPaddle() {
    paddlex = WIDTH / 2.5;
    paddlew = 140;
}

function initBricks() {
    if (level == 1) {
        NROWS = 3;
        NCOLS = 4;
    } else if (level == 2) {
        NROWS = 4;
        NCOLS = 6;
    } else {
        NROWS = 5;
        NCOLS = 8;
    }

    BRICKWIDTH = Math.floor((WIDTH - (BRICKOFFSETLEFT * 2) - ((NCOLS - 1) * PADDING)) / NCOLS);
    bricks = [];

    for (var i = 0; i < NROWS; i++) {
        bricks[i] = [];
        for (var j = 0; j < NCOLS; j++) {
            bricks[i][j] = 1;
        }
    }
}

function allBricksDestroyed() {
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] > 0) return false;
        }
    }
    return true;
}

function nextLevelCheck() {
    if (!allBricksDestroyed() || gameWon) return;

    gameWon = true;
    stopLoops();

    if (level < 3) {
        showGameAlert("Nice!", "You completed level " + level + ".", "success", "Continue")
            .then(function () {
                level++;
                gameWon = false;
                isPaused = false;
                resetBall();
                initPaddle();
                initBricks();
                updateUI();
                draw();
                startLoops();
            });
    } else {
        showGameAlert("Champion!", "You completed all levels.", "success", "Play Again")
            .then(function () {
                resetBoard();
            });
    }
}

function drawArena() {
    var ice = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    ice.addColorStop(0, "#eefbff");
    ice.addColorStop(0.5, "#dff4ff");
    ice.addColorStop(1, "#cdeaff");
    ctx.fillStyle = ice;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, WIDTH - 6, HEIGHT - 6);

    ctx.fillStyle = "rgba(220,40,40,0.9)";
    ctx.fillRect(WIDTH / 2 - 3, 0, 6, HEIGHT);

    ctx.fillStyle = "rgba(40,110,220,0.85)";
    ctx.fillRect(WIDTH * 0.25 - 3, 0, 6, HEIGHT);
    ctx.fillRect(WIDTH * 0.75 - 3, 0, 6, HEIGHT);

    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT / 2, 65, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(220,40,40,0.6)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT / 2, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(220,40,40,0.9)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(150, 115, 40, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(220,40,40,0.4)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(WIDTH - 150, 115, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT - 20, 70, Math.PI, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(40,110,220,0.45)";
    ctx.stroke();
}

function drawPaddle() {
    ctx.drawImage(paddleImg, paddlex, HEIGHT - paddleh - 10, paddlew, paddleh);
}

function drawPuck() {
    ctx.drawImage(puckImg, x - r, y - r, r * 2, r * 2);
}

function drawBricks() {
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] <= 0) continue;

            var bx = (j * (BRICKWIDTH + PADDING)) + BRICKOFFSETLEFT;
            var by = (i * (BRICKHEIGHT + PADDING)) + BRICKOFFSETTOP;

            var g = ctx.createLinearGradient(bx, by, bx, by + BRICKHEIGHT);
            g.addColorStop(0, "#274b74");
            g.addColorStop(1, "#173150");

            ctx.fillStyle = g;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(bx, by, BRICKWIDTH, BRICKHEIGHT, 6);
            else ctx.rect(bx, by, BRICKWIDTH, BRICKHEIGHT);
            ctx.closePath();
            ctx.fill();

            ctx.lineWidth = 2;
            ctx.strokeStyle = "#d9f3ff";
            ctx.strokeRect(bx, by, BRICKWIDTH, BRICKHEIGHT);

            ctx.fillStyle = "rgba(255,255,255,0.30)";
            ctx.fillRect(bx + 8, by + BRICKHEIGHT / 2 - 1, BRICKWIDTH - 16, 2);
        }
    }
}

function hitBrick() {
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] <= 0) continue;

            var bx = (j * (BRICKWIDTH + PADDING)) + BRICKOFFSETLEFT;
            var by = (i * (BRICKHEIGHT + PADDING)) + BRICKOFFSETTOP;

            if (x + r > bx && x - r < bx + BRICKWIDTH && y + r > by && y - r < by + BRICKHEIGHT) {
                dy = -dy;
                bricks[i][j] = 0;
                score++;
                updateUI();
                nextLevelCheck();
                return;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawArena();

    if (rightDown) paddlex = Math.min(WIDTH - paddlew, paddlex + 7);
    if (leftDown) paddlex = Math.max(0, paddlex - 7);

    drawBricks();
    drawPaddle();
    drawPuck();
    hitBrick();

    if (x + dx > WIDTH - r || x + dx < r) dx = -dx;

    if (y + dy < r) {
        dy = -dy;
    } else {
        var paddleTop = HEIGHT - paddleh - 10;

        if (
            y + r + dy >= paddleTop &&
            y - r < paddleTop + paddleh &&
            x >= paddlex &&
            x <= paddlex + paddlew
        ) {
            dy = -Math.abs(dy);
            dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
        } else if (y + dy > HEIGHT - r) {
            resetBoard();
            return;
        }
    }

    x += dx;
    y += dy;
}

function pauseGame() {
    if (!gameStarted || gameWon || isPaused) return;
    isPaused = true;
    stopLoops();
    updateUI();
}

function resumeGame() {
    if (!gameStarted || gameWon || !isPaused) return;
    isPaused = false;
    updateUI();
    startLoops();
}

function actionButtonClick() {
    if (!gameStarted) startNewGame();
    else if (isPaused) resumeGame();
    else pauseGame();
}

function init() {
    stopLoops();
    resetBall();
    initPaddle();
    initBricks();
    seconds = 0;
    score = 0;
    gameWon = false;
    isPaused = false;
    gameStarted = true;
    updateUI();
    draw();
    startLoops();
}

function startNewGame() {
    level = 1;
    init();
}

function resetBoard() {
    stopLoops();
    seconds = 0;
    score = 0;
    level = 1;
    gameWon = false;
    isPaused = false;
    gameStarted = false;
    resetBall();
    initPaddle();
    initBricks();
    updateUI();
    draw();
}

document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
        rightDown = true;
        e.preventDefault();
    }
    if (e.key === "ArrowLeft") {
        leftDown = true;
        e.preventDefault();
    }
});

document.addEventListener("keyup", function (e) {
    if (e.key === "ArrowRight") {
        rightDown = false;
        e.preventDefault();
    }
    if (e.key === "ArrowLeft") {
        leftDown = false;
        e.preventDefault();
    }
});

actionBtn.addEventListener("click", function () {
    actionButtonClick();
    this.blur();
});

drawArena();
updateUI();