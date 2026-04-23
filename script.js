var $canvas = $("#canvas"),
    canvas = $canvas[0],
    ctx = canvas.getContext("2d"),
    $btn = $("#actionBtn"),
    $score = $("#score"),
    $hiddenScore = $("#tocke"),
    $time = $("#cas"),
    $level = $("#level");

var x = 0,
    y = 0,
    dx = -2.8,
    dy = 2.8,
    r = 12,
    WIDTH = canvas.width,
    HEIGHT = canvas.height,
    paddley = 0,
    paddleh = 140,
    paddlew = 28,
    upDown = false,
    downDown = false,
    bricks = [],
    NROWS = 6,
    NCOLS = 3,
    BRICKWIDTH = 44,
    BRICKHEIGHT = 0,
    PADDING = 6,
    BRICKOFFSETLEFT = 42,
    BRICKOFFSETTOP = 10,
    intervalId = null,
    timerId = null,
    level = 2,
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
    x = WIDTH - 100;
    y = HEIGHT / 2;
    dx = -2.8;
    dy = 2.8;
}

function initPaddle() {
    paddley = HEIGHT / 2 - paddleh / 2;
    paddleh = 140;
    paddlew = 28;
}

function initBricks() {
    if (level == 1) {
        NROWS = 6; NCOLS = 3;
    } else if (level == 2) {
        NROWS = 8; NCOLS = 4;
    } else {
        NROWS = 10; NCOLS = 5;
    }

    BRICKHEIGHT = Math.floor((HEIGHT - BRICKOFFSETTOP * 2 - (NROWS - 1) * PADDING) / NROWS);
    bricks = [];

    for (var i = 0; i < NROWS; i++) {
        bricks[i] = [];
        for (var j = 0; j < NCOLS; j++) bricks[i][j] = 1;
    }
}

function scoreGoal() {
    if (won) return;

    won = true;
    score++;
    ui();
    stopLoops();

    if (level < 3) {
        alertBox("GOAL!", "You scored! Level " + level + " complete.", "Continue").then(function () {
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
        alertBox("Champion!", "Hat-trick! You completed all levels.", "Play Again").then(function () {
            resetBoard();
        });
    }
}

function drawArena() {
    var ice = ctx.createLinearGradient(0, 0, WIDTH, 0);
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

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(220,40,40,0.4)";

    ctx.beginPath();
    ctx.arc(150, 115, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(150, HEIGHT - 115, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(WIDTH - 150, 115, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(WIDTH - 150, HEIGHT - 115, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, HEIGHT / 2, 70, -Math.PI / 2, Math.PI / 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(40,110,220,0.55)";
    ctx.stroke();
    ctx.fillStyle = "rgba(40,110,220,0.10)";
    ctx.fill();

    var goalH = 120, goalD = 22;
    var goalY = (HEIGHT - goalH) / 2;
    ctx.strokeStyle = "rgba(220,40,40,0.95)";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, goalY, goalD, goalH);
    ctx.fillStyle = "rgba(220,40,40,0.18)";
    ctx.fillRect(0, goalY, goalD, goalH);
}

function drawPaddle() {
    ctx.save();
    var px = WIDTH - paddlew - 10;
    var py = paddley;
    ctx.translate(px + paddlew / 2, py + paddleh / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(paddleImg, -paddleh / 2, -paddlew / 2, paddleh, paddlew);
    ctx.restore();
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
                g = ctx.createLinearGradient(bx, by, bx + BRICKWIDTH, by);

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
            ctx.fillRect(bx + 4, by + BRICKHEIGHT / 2 - 1, BRICKWIDTH - 8, 2);
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
                dx = -dx;
                bricks[i][j] = 0;
                ui();
                return;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawArena();

    if (upDown) paddley = Math.max(0, paddley - 7);
    if (downDown) paddley = Math.min(HEIGHT - paddleh, paddley + 7);

    drawBricks();
    drawPaddle();
    drawPuck();
    hitBrick();
	
    if (y + dy < r || y + dy > HEIGHT - r) dy = -dy;

    if (x + dx < r) {
        var goalH = 120;
        var goalY = (HEIGHT - goalH) / 2;
        if (y >= goalY && y <= goalY + goalH) {
            scoreGoal();
            return;
        } else {
            dx = -dx;
        }
    }

    var px = WIDTH - paddlew - 10;
    if (x + r + dx >= px && x - r < px + paddlew && y + r >= paddley && y - r <= paddley + paddleh) {
        dx = -Math.abs(dx);
        dy = 8 * ((y - (paddley + paddleh / 2)) / paddleh);
    } else if (x + dx > WIDTH - r) {
        // Ball went past the paddle — reset
        resetBoard();
        return;
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
    if (e.key === "ArrowUp") { upDown = true; e.preventDefault(); }
    if (e.key === "ArrowDown") { downDown = true; e.preventDefault(); }
});

$(document).on("keyup", function (e) {
    if (e.key === "ArrowUp") { upDown = false; e.preventDefault(); }
    if (e.key === "ArrowDown") { downDown = false; e.preventDefault(); }
});

$btn.on("click", function () {
    clickAction();
    $(this).blur();
});

drawArena();
ui();
