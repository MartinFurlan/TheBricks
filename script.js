var x = 150;
var y = 200;
var dx = 2;
var dy = 4;
var WIDTH;
var HEIGHT;
var r = 12;
var f = 0;
var ctx;
var intervalId;
var timerId;
var level = 1;

var paddlecolor = "#0f2742";
var ballcolor = "#fb8500";
var brickcolors = {
    1: "#7cc576",
    2: "#f5a623",
    3: "#d64541"
};
var start = true;
var tocke;
var sekunde;
var izpisTimer;

var paddlex;
var paddleh;
var paddlew;

var rightDown = false;
var leftDown = false;

var bricks;
var NROWS;
var NCOLS;
var BRICKWIDTH;
var BRICKHEIGHT;
var PADDING;
var gameWon = false;

var lives = 3;
var controlsAdded = false;
var BRICKOFFSETLEFT = 18;
var BRICKOFFSETTOP = 42;

var paddleImg = new Image();
var puckImg = new Image();
var imagesReady = 0;

var isPaused = false;
var gameStarted = false;

paddleImg.onload = imageLoaded;
puckImg.onload = imageLoaded;

paddleImg.onerror = function () {
    console.log("Image not found: paddle.png");
};

puckImg.onerror = function () {
    console.log("Image not found: puck.png");
};

paddleImg.src = "paddle.png";
puckImg.src = "puck.png";

function showGameAlert(title, text, icon, confirmText) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: confirmText,
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

function imageLoaded() {
    imagesReady++;
    if (imagesReady >= 2) {
        resetBoard();
    }
}

function updateLevelDisplay() {
    $("#level").html(level);
}

function updateScoreDisplay() {
    $("#tocke").html(tocke);
    $("#score").html(tocke);
}

function updateLivesDisplay() {
    $("#lives").html(lives);
}

function updateActionButton() {
    var btn = document.getElementById("actionBtn");
    if (!btn) return;

    if (!gameStarted) {
        btn.textContent = "Start Game";
    } else if (isPaused) {
        btn.textContent = "Resume";
    } else {
        btn.textContent = "Pause";
    }
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
    timerId = setInterval(timer, 1000);
}

function resetBall() {
    x = WIDTH / 2;
    y = HEIGHT - 75;
    dx = 2.8;
    dy = -2.8;
    start = true;
}

function init() {
    ctx = $("#canvas")[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();

    stopLoops();

    resetBall();
    init_paddle();
    initbricks();

    sekunde = 0;
    izpisTimer = "00:00";
    tocke = 0;
    lives = 3;
    gameWon = false;
    isPaused = false;
    gameStarted = true;

    updateLevelDisplay();
    $("#cas").html(izpisTimer);
    updateScoreDisplay();
    updateLivesDisplay();
    updateActionButton();

    draw();
    startLoops();
}

function startNewGame() {
    level = 1;
    init();
}

function init_paddle() {
    paddlex = WIDTH / 2.5;
    paddleh = 28;
    paddlew = 140;
}

function initbricks() {
    if (level == 1) {
        NROWS = 3;
        NCOLS = 4;
    } else if (level == 2) {
        NROWS = 4;
        NCOLS = 6;
    } else if (level == 3) {
        NROWS = 5;
        NCOLS = 8;
    } else {
        NROWS = 5;
        NCOLS = 8;
    }

    PADDING = 10;
    BRICKWIDTH = Math.floor((WIDTH - (BRICKOFFSETLEFT * 2) - ((NCOLS - 1) * PADDING)) / NCOLS);
    BRICKHEIGHT = 24;
    bricks = new Array(NROWS);

    for (var i = 0; i < NROWS; i++) {
        bricks[i] = new Array(NCOLS);
        for (var j = 0; j < NCOLS; j++) {
            bricks[i][j] = 1;
        }
    }
}

function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function rect(x, y, w, h) {
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, w, h, 6);
    } else {
        ctx.rect(x, y, w, h);
    }
    ctx.closePath();
    ctx.fill();
}

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function allBricksDestroyed() {
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] > 0) {
                return false;
            }
        }
    }
    return true;
}

function timer() {
    var sekundeI;
    var minuteI;

    if (start == true && !isPaused) {
        sekunde++;
        sekundeI = ((sekundeI = (sekunde % 60)) > 9) ? sekundeI : "0" + sekundeI;
        minuteI = ((minuteI = Math.floor(sekunde / 60)) > 9) ? minuteI : "0" + minuteI;
        izpisTimer = minuteI + ":" + sekundeI;
        $("#cas").html(izpisTimer);
    }
}

function onKeyDown(evt) {
    if (evt.keyCode == 39) {
        rightDown = true;
        evt.preventDefault();
    } else if (evt.keyCode == 37) {
        leftDown = true;
        evt.preventDefault();
    }
}

function onKeyUp(evt) {
    if (evt.keyCode == 39) {
        rightDown = false;
        evt.preventDefault();
    } else if (evt.keyCode == 37) {
        leftDown = false;
        evt.preventDefault();
    }
}

function preveriZmago() {
    if (!gameWon && allBricksDestroyed()) {
        gameWon = true;
        stopLoops();

        if (level < 3) {
            showGameAlert(
                "Nice!",
                "You completed level " + level + ".",
                "success",
                "Continue"
            ).then(function () {
                level++;
                gameWon = false;
                isPaused = false;
                updateLevelDisplay();
                updateActionButton();

                resetBall();
                init_paddle();
                initbricks();
                draw();
                startLoops();
            });
        } else {
            showGameAlert(
                "Champion!",
                "You completed all levels.",
                "success",
                "Play Again"
            ).then(function () {
                resetBoard();
            });
        }
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

function drawPuck() {
    if (puckImg.complete && puckImg.naturalWidth > 0) {
        ctx.drawImage(puckImg, x - r, y - r, r * 2, r * 2);
    }
}

function drawPaddle() {
    if (paddleImg.complete && paddleImg.naturalWidth > 0) {
        var py = HEIGHT - paddleh - 10;
        ctx.drawImage(paddleImg, paddlex, py, paddlew, paddleh);
    }
}

function drawBricks() {
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] > 0) {
                var brickX = (j * (BRICKWIDTH + PADDING)) + BRICKOFFSETLEFT;
                var brickY = (i * (BRICKHEIGHT + PADDING)) + BRICKOFFSETTOP;

                var brickGradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + BRICKHEIGHT);
                brickGradient.addColorStop(0, "#274b74");
                brickGradient.addColorStop(1, "#173150");

                ctx.fillStyle = brickGradient;
                rect(brickX, brickY, BRICKWIDTH, BRICKHEIGHT);

                ctx.lineWidth = 2;
                ctx.strokeStyle = "#d9f3ff";
                ctx.strokeRect(brickX, brickY, BRICKWIDTH, BRICKHEIGHT);

                ctx.fillStyle = "rgba(255,255,255,0.30)";
                ctx.fillRect(brickX + 8, brickY + BRICKHEIGHT / 2 - 1, BRICKWIDTH - 16, 2);
            }
        }
    }
}

function collisionWithBricks() {
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] > 0) {
                var brickX = (j * (BRICKWIDTH + PADDING)) + BRICKOFFSETLEFT;
                var brickY = (i * (BRICKHEIGHT + PADDING)) + BRICKOFFSETTOP;

                if (
                    x + r > brickX &&
                    x - r < brickX + BRICKWIDTH &&
                    y + r > brickY &&
                    y - r < brickY + BRICKHEIGHT
                ) {
                    dy = -dy;
                    bricks[i][j] = 0;
                    tocke++;
                    updateScoreDisplay();
                    preveriZmago();
                    return;
                }
            }
        }
    }
}

function draw() {
    clear();
    drawArena();

    if (rightDown) {
        if ((paddlex + paddlew) < WIDTH) {
            paddlex += 7;
        } else {
            paddlex = WIDTH - paddlew;
        }
    } else if (leftDown) {
        if (paddlex > 0) {
            paddlex -= 7;
        } else {
            paddlex = 0;
        }
    }

    drawBricks();
    drawPaddle();
    drawPuck();
    collisionWithBricks();

    if (x + dx > WIDTH - r || x + dx < 0 + r) {
        dx = -dx;
    }

    if (y + dy < 0 + r) {
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
            start = true;
        } else if (y + dy > HEIGHT - r) {
            lives--;
            updateLivesDisplay();

            if (lives <= 0) {
                stopLoops();

                showGameAlert(
                    "Game Over",
                    "You lost all lives.",
                    "error",
                    "Play Again"
                ).then(function () {
                    resetBoard();
                });

                return;
            }

            resetBall();
            init_paddle();
        }
    }

    x += dx;
    y += dy;
}

function pauseGame() {
    if (!gameStarted || gameWon || isPaused) return;

    isPaused = true;
    stopLoops();
    updateActionButton();
}

function resumeGame() {
    if (!gameStarted || gameWon || !isPaused) return;

    isPaused = false;
    updateActionButton();
    startLoops();
}

function actionButtonClick() {
    if (!gameStarted) {
        startNewGame();
        return;
    }

    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function resetBoard() {
    stopLoops();

    ctx = $("#canvas")[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();

    sekunde = 0;
    izpisTimer = "00:00";
    tocke = 0;
    lives = 3;
    level = 1;
    gameWon = false;
    start = true;
    isPaused = false;
    gameStarted = false;

    $("#cas").html(izpisTimer);
    updateScoreDisplay();
    updateLivesDisplay();
    $("#level").html(level);
    updateActionButton();

    resetBall();
    init_paddle();
    initbricks();
    draw();
}

$(document).ready(function () {
    ctx = $("#canvas")[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();

    if (!controlsAdded) {
        controlsAdded = true;
        $(document).keydown(onKeyDown);
        $(document).keyup(onKeyUp);
    }

    $("#actionBtn").on("click", function () {
        if (paddleImg.complete && paddleImg.naturalWidth > 0 && puckImg.complete && puckImg.naturalWidth > 0) {
            actionButtonClick();
            this.blur();
        } else {
            showGameAlert(
                "Images Not Loaded",
                "Check paddle.png and puck.png.",
                "warning",
                "OK"
            );
        }
    });

    if (imagesReady >= 2) {
        resetBoard();
    } else {
        drawArena();
    }
});