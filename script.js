var $canvas = $("#canvas"),
    canvas = $canvas[0],
    ctx = canvas.getContext("2d"),
    $btn = $("#actionBtn"),
    $score = $("#score"),
    $hiddenScore = $("#tocke"),
    $time = $("#cas"),
    $level = $("#level");

var x = 150,
    y = 200,
    dx = 2.8,
    dy = -2.8,
    r = 12,
    WIDTH = canvas.width,
    HEIGHT = canvas.height,
    paddlex = 0,
    paddleh = 28,
    paddlew = 140,
    rightDown = false,
    leftDown = false,
    bricks = [],
    NROWS = 3,
    NCOLS = 4,
    BRICKWIDTH = 0,
    BRICKHEIGHT = 24,
    PADDING = 10,
    BRICKOFFSETLEFT = 18,
    BRICKOFFSETTOP = 42,
    intervalId = null,
    timerId = null,
    level = 1,
    score = 0,
    seconds = 0,
    started = false,
    paused = false,
    won = false;

var paddleImg = new Image(),
    puckImg = new Image(),
    loaded = 0;

paddleImg.src = "paddle.png";
puckImg.src = "puck.png";
paddleImg.onload = puckImg.onload = function () {
    loaded++;
    if (loaded === 2) resetBoard();
};

function alertBox(title, text, buttonText) {
    return Swal.fire({
        title: title,
        text: text,
        icon: "success",
        confirmButtonText: buttonText,
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

function fmt(sec) {
    var m = String(Math.floor(sec / 60)).padStart(2, "0"),
        s = String(sec % 60).padStart(2, "0");
    return m + ":" + s;
}

function ui() {
    $score.html(score);
    $hiddenScore.html(score);
    $time.html(fmt(seconds));
    $level.html(level);
    $btn.html(!started ? "Start Game" : paused ? "Resume" : "Pause");
}

function stopLoops() {
    clearInterval(intervalId);
    clearInterval(timerId);
    intervalId = timerId = null;
}

function startLoops() {
    stopLoops();
    intervalId = setInterval(draw, 10);
    timerId = setInterval(function () {
        if (!paused) {
            seconds++;
            $time.html(fmt(seconds));
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
        NROWS = 3; NCOLS = 4;
    } else if (level == 2) {
        NROWS = 4; NCOLS = 6;
    } else {
        NROWS = 5; NCOLS = 8;
    }

    BRICKWIDTH = Math.floor((WIDTH - BRICKOFFSETLEFT * 2 - (NCOLS - 1) * PADDING) / NCOLS);
    bricks = [];

    for (var i = 0; i < NROWS; i++) {
        bricks[i] = [];
        for (var j = 0; j < NCOLS; j++) bricks[i][j] = 1;
    }
}

function allBricksGone() {
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] > 0) return false;
        }
    }
    return true;
}

function nextLevel() {
    if (!allBricksGone() || won) return;

    won = true;
    stopLoops();

    if (level < 3) {
        alertBox("Nice!", "You completed level " + level + ".", "Continue").then(function () {
            level++;
            won = false;
            paused = false;
            resetBall();
            initPaddle();
            initBricks();
            ui();
            draw();
            startLoops();
        });
    } else {
        alertBox("Champion!", "You completed all levels.", "Play Again").then(function () {
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
            if (!bricks[i][j]) continue;

            var bx = j * (BRICKWIDTH + PADDING) + BRICKOFFSETLEFT,
                by = i * (BRICKHEIGHT + PADDING) + BRICKOFFSETTOP,
                g = ctx.createLinearGradient(bx, by, bx, by + BRICKHEIGHT);

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
            if (!bricks[i][j]) continue;

            var bx = j * (BRICKWIDTH + PADDING) + BRICKOFFSETLEFT,
                by = i * (BRICKHEIGHT + PADDING) + BRICKOFFSETTOP;

            if (x + r > bx && x - r < bx + BRICKWIDTH && y + r > by && y - r < by + BRICKHEIGHT) {
                dy = -dy;
                bricks[i][j] = 0;
                score++;
                ui();
                nextLevel();
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

    if (y + dy < r) dy = -dy;
    else {
        var top = HEIGHT - paddleh - 10;

        if (y + r + dy >= top && y - r < top + paddleh && x >= paddlex && x <= paddlex + paddlew) {
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

function init() {
    stopLoops();
    resetBall();
    initPaddle();
    initBricks();
    seconds = 0;
    score = 0;
    won = false;
    paused = false;
    started = true;
    ui();
    draw();
    startLoops();
}

function resetBoard() {
    stopLoops();
    level = 1;
    score = 0;
    seconds = 0;
    won = false;
    paused = false;
    started = false;
    resetBall();
    initPaddle();
    initBricks();
    ui();
    draw();
}

function clickAction() {
    if (!started) init();
    else if (paused) {
        paused = false;
        ui();
        startLoops();
    } else {
        paused = true;
        stopLoops();
        ui();
    }
}

$(document).on("keydown", function (e) {
    if (e.key === "ArrowRight") { rightDown = true; e.preventDefault(); }
    if (e.key === "ArrowLeft") { leftDown = true; e.preventDefault(); }
});

$(document).on("keyup", function (e) {
    if (e.key === "ArrowRight") { rightDown = false; e.preventDefault(); }
    if (e.key === "ArrowLeft") { leftDown = false; e.preventDefault(); }
});

$btn.on("click", function () {
    clickAction();
    $(this).blur();
});

drawArena();
ui();
