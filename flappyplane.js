document.getElementById("clickme").addEventListener("click", function() {
    document.body.classList.add("newBackgroundColor");
    document.getElementById("warningScreen").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
    backgroundMusic.play();
    console.log("Hra byla spuštěna.");
});

document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";
    resetGame();
    console.log("Hra začíná.");
});

document.getElementById("settingsButton").addEventListener("click", function() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("settingsMenu").style.display = "block";
    console.log("Nastavení bylo otevřeno.");
});

document.getElementById("instructionsButton").addEventListener("click", function() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("instructionsMenu").style.display = "block";
    console.log("Instrukce byly otevřeny.");
});

document.getElementById("backButton").addEventListener("click", function() {
    document.getElementById("settingsMenu").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
    console.log("Návrat z nastavení do hlavního menu.");
});

document.getElementById("backButton2").addEventListener("click", function() {
    document.getElementById("instructionsMenu").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
    console.log("Návrat z instrukcí do hlavního menu.");
});

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const planeImg = new Image();
planeImg.src = 'img/plane.png';
const pipeImg = new Image();
pipeImg.src = 'img/building.jpg';

const PLANE_WIDTH = 100;
const PLANE_HEIGHT = 37;

const GRAVITY = 0.5;
const FLAP = -10;
let PIPE_WIDTH = 50;
let PIPE_HEIGHT = 400;
let PIPE_GAP = 240;
let PIPE_DISTANCE = 450;

let planeY = canvas.height / 2;
let planeX = canvas.width / 2;
let planeVelocity = 0;
let planeAngle = 0;
let score = 0;
let bestScore = 0;
let pipes = [];
let gameOver = false;

const hitSound = document.getElementById('hitSound');
const backgroundMusic = document.getElementById('backgroundMusic');

document.getElementById("sfxVolumeSlider").addEventListener("input", function() {
    hitSound.volume = this.value / 100;
    console.log("Hlasitost zvukových efektů byla změněna na: " + this.value);
});

document.getElementById("musicVolumeSlider").addEventListener("input", function() {
    backgroundMusic.volume = this.value / 100;
    console.log("Hlasitost hudby byla změněna na: " + this.value);
});

document.getElementById("difficultySelect").addEventListener("change", function() {
    const selectedDifficulty = this.value;
    switch(selectedDifficulty) {
        case "easy":
            PIPE_DISTANCE = 550;
            PIPE_GAP = 240;
            console.log("Obtížnost nastavena na: Lehká");
            break;
        case "medium":
            PIPE_DISTANCE = 500;
            PIPE_GAP = 190;
            console.log("Obtížnost nastavena na: Střední");
            break;
        case "hard":
            PIPE_DISTANCE = 400;
            PIPE_GAP = 150;
            console.log("Obtížnost nastavena na: Těžká");
            break;
        default:
            break;
    }
});

function drawPlane() {
    ctx.save();
    ctx.translate(planeX, planeY);
    ctx.rotate(planeAngle);
    ctx.drawImage(planeImg, -PLANE_WIDTH / 2, -PLANE_HEIGHT / 2, PLANE_WIDTH, PLANE_HEIGHT);
    ctx.restore();
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImg, pipe.x, 0, PIPE_WIDTH, pipe.top);
        ctx.drawImage(pipeImg, pipe.x, pipe.bottom, PIPE_WIDTH, canvas.height - pipe.bottom);
    });
}

function drawScore() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(`Skóre: ${score}`, 20, 50);
}

function drawBestScore() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(`Nejlepší skóre: ${bestScore}`, 20, 90);
}

function updatePipes() {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - PIPE_DISTANCE) {
        const top = Math.random() * (canvas.height - PIPE_GAP - 50) + 50;
        pipes.push({
            x: canvas.width,
            top: top,
            bottom: top + PIPE_GAP,
            counted: false
        });
    }

    pipes.forEach(pipe => {
        pipe.x -= 5;
    });

    pipes.forEach(pipe => {
        if (!pipe.counted && pipe.x + PIPE_WIDTH < planeX - (PLANE_WIDTH / 2)) {
            score++;
            pipe.counted = true;
        }
    });

    if (pipes.length > 0 && pipes[0].x < -PIPE_WIDTH) {
        pipes.shift();
    }
}

function checkCollision() {
    if (planeY >= canvas.height || planeY <= 0) {
        gameOver = true;
        hitSound.play();
        console.log("Došlo ke kolizi s okrajem obrazovky.");
    }

    pipes.forEach(pipe => {
        if (
            planeX + (PLANE_WIDTH / 2) > pipe.x && planeX - (PLANE_WIDTH / 2) < pipe.x + PIPE_WIDTH &&
            (planeY - (PLANE_HEIGHT / 2) < pipe.top || planeY + (PLANE_HEIGHT / 2) > pipe.bottom)
        ) {
            gameOver = true;
            hitSound.play();
            console.log("Došlo ke kolizi s trubkou.");
        }
    });
}

function resetGame() {
    planeY = canvas.height / 2;
    planeVelocity = 0;
    planeAngle = 0;
    document.getElementById("gameOverText").style.display = "none";
    if (score > bestScore) {
        bestScore = score;
    }
    score = 0;
    pipes = [];
    gameOver = false;
    startGame();
    console.log("Hra byla restartována.");
}

let lastTime = 0;
const fps = 60;
const fpsInterval = 1000 / fps;

function gameLoop(timestamp) {
    if (gameOver) {
        document.getElementById("gameOverText").
        style.display = "block";
        document.getElementById("scoreText2").textContent = `Skóre: ${score}`;
        document.getElementById("bestScoreText2").textContent = `Nejlepší skóre: ${bestScore}`;
        document.getElementById("restartButton").addEventListener("click", resetGame, { once: true });
        document.getElementById("menuButton").addEventListener("click", function() {
            document.getElementById("gameOverText").style.display = "none";
            document.getElementById("mainMenu").style.display = "block";
            console.log("Přechod z herní obrazovky zpět do hlavního menu.");
        }, { once: true });
        console.log("Hra skončila.");
        return;
    }

    const now = timestamp;
    const elapsed = now - lastTime;

    if (elapsed > fpsInterval) {
        lastTime = now - (elapsed % fpsInterval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        planeVelocity += GRAVITY;
        planeY += planeVelocity;

        planeAngle = planeVelocity * 0.03;

        drawPlane();
        drawPipes();
        drawScore();
        drawBestScore();

        updatePipes();
        checkCollision();
    }

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", function() {
    planeVelocity = FLAP;
});

document.addEventListener("keydown", (space) => {
    if (space.code === "Space") {
        planeVelocity = FLAP;
    }
});

function startGame() {
    lastTime = window.performance.now();
    requestAnimationFrame(gameLoop);
}
