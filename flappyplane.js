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

// Show leaderboard
document.getElementById("leaderboardButton").addEventListener("click", function() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("leaderboardMenu").style.display = "block";
    loadLeaderboard();
});

document.getElementById("backButton3").addEventListener("click", function() {
    document.getElementById("leaderboardMenu").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
});

function loadLeaderboard() {
    ['easy', 'medium', 'hard'].forEach(difficulty => {
        getLeaderboard(difficulty, scores => {
            const listElement = document.getElementById(`leaderboard${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}List`);
            listElement.innerHTML = '';
            scores.forEach(score => {
                const listItem = document.createElement('li');
                listItem.textContent = `${score.name}: ${score.score}`;
                listElement.appendChild(listItem);
            });
        });
    });
}

function gameOverActions() {
    if (gameOver) {
        const playerName = prompt("Enter your name:");
        const difficulty = document.getElementById("difficultySelect").value;
        saveScore(difficulty, playerName, score);
        
        document.getElementById("gameOverText").style.display = "block";
        document.getElementById("scoreText2").textContent = `Score: ${score}`;
        document.getElementById("bestScoreText2").textContent = `Best Score: ${bestScore}`;
        document.getElementById("restartButton").addEventListener("click", resetGame, { once: true });
        document.getElementById("menuButton").addEventListener("click", function() {
            document.getElementById("gameOverText").style.display = "none";
            document.getElementById("mainMenu").style.display = "block";
        });
        return;
    }
}

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAS-HEnUhRXRd0fv67Bpvy3xNWajY1AEKc",
  authDomain: "flappy-plane-fcae7.firebaseapp.com",
  projectId: "flappy-plane-fcae7",
  storageBucket: "flappy-plane-fcae7.appspot.com",
  messagingSenderId: "239062289511",
  appId: "1:239062289511:web:ec12332ecb52e056c2d8c2",
  measurementId: "G-ZXXT8GNJG8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load images
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
    ctx.drawImage(planeImg, planeX - (PLANE_WIDTH / 2), planeY - (PLANE_HEIGHT / 2), PLANE_WIDTH, PLANE_HEIGHT);
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
    ctx.fillText(`Score: ${score}`, 20, 50);
}

function drawBestScore() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(`Best Score: ${bestScore}`, 20, 90);
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

function saveScore(difficulty, playerName, score) {
    const newScoreKey = firebase.database().ref().child(`leaderboard/${difficulty}`).push().key;
    firebase.database().ref(`leaderboard/${difficulty}/${newScoreKey}`).set({
        name: playerName,
        score: score
    });
}

function getLeaderboard(difficulty, callback) {
    firebase.database().ref(`leaderboard/${difficulty}`).orderByChild('score').limitToLast(10).once('value', snapshot => {
        const scores = [];
        snapshot.forEach(childSnapshot => {
            scores.push(childSnapshot.val());
        });
        callback(scores.reverse());
    });
}

function resetGame() {
    planeY = canvas.height / 2;
    planeVelocity = 0;
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
        document.getElementById("scoreText2").textContent = `Score: ${score}`;
        document.getElementById("bestScoreText2").textContent = `Best Score: ${bestScore}`;
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

        drawPlane();
        drawPipes();
        drawScore();
        drawBestScore();
        updatePipes();
        checkCollision();
    }

    requestAnimationFrame(gameLoop);
}

function startGame() {
    lastTime = window.performance.now();
    gameLoop(lastTime);
    console.log("Hra byla spuštěna.");
}

canvas.addEventListener("click", () => {
    planeVelocity = FLAP;
    console.log("Kliknutí na plátno pro let.");
});

document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        planeVelocity = FLAP;
        console.log("Stisknutí mezerníku pro let.");
    }
});
