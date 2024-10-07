const videoElement = document.getElementById('webcam');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('startButton');
//const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const resultDiv = document.getElementById('result');
const timerElement = document.getElementById('timer');
const easyButton = document.getElementById('easyButton');
const normalButton = document.getElementById('normalButton');
const hardButton = document.getElementById('hardButton');
const timeLimitInput = document.getElementById('timeLimit');
const ballsLimitInput = document.getElementById('ballsLimit');

let model;
let score = 0;
let balls = [];
let gameStarted = false;
let gamePaused = false;
let animationFrameId;
let startTime;
let ballsHit = 0;
let firstBallHit = false;
let timerInterval;
let elapsedTime = 0;
let videoStream;
let difficulty = 'easy';
let ballSpeedMultiplier = 1;
let redBallProbability = 0.2;
let timeLimit = parseInt(timeLimitInput.value); // Default time limit
let ballsLimit = parseInt(ballsLimitInput.value); // Default balls limit

// Load the hand tracking model
async function loadModel() {
    try {
        model = await handPoseDetection.createDetector(handPoseDetection.SupportedModels.MediaPipeHands, {
            runtime: 'tfjs',
        });
        console.log("Model loaded successfully");
    } catch (error) {
        console.error("Error loading the model:", error);
    }
}

// Start the webcam video stream
async function startVideo() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        });
        videoElement.srcObject = videoStream;  // Attach stream to video element
        await videoElement.play();  // Play the video feed
        console.log("Webcam video started");
    } catch (err) {
        console.error("Error accessing the camera: ", err);
        alert('Unable to access the camera. Please ensure camera permissions are granted and try again.');
    }
}

// Stop the webcam video stream
function stopVideo() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }
}

// Detect hands using the model
async function detectHands() {
    if (!model) return [];
    const hands = await model.estimateHands(videoElement);
    return hands;
}

// Generate new falling balls
function generateBall() {
    const ball = {
        x: Math.random() * gameCanvas.width,
        y: 0,
        radius: 20,
        speed: (2 + Math.random() * 3) * ballSpeedMultiplier,
        type: Math.random() < redBallProbability ? 'red' : 'green'
    };
    balls.push(ball);
}

// Game update function
function updateGame() {
    if (gamePaused) return;

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-gameCanvas.width, 0);

    balls.forEach((ball, index) => {
        ball.y += ball.speed;
        if (ball.y > gameCanvas.height) {
            balls.splice(index, 1);
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.type === 'green' ? 'green' : 'red';
        ctx.fill();
        ctx.closePath();
    });

    detectHands().then(hands => {
        if (hands.length > 0) {
            const hand = hands[0].keypoints;
            const indexFingerTip = hand[8];
            // Flip the X-coordinate for correct hit detection in the mirrored view
            const fingerX = gameCanvas.width - indexFingerTip.x; // Mirrored X-coordinate
            const fingerY = indexFingerTip.y;

            balls.forEach((ball, index) => {
                const dist = Math.hypot(ball.x - fingerX, ball.y - fingerY);
                if (dist < ball.radius + 10) {
                    if (!firstBallHit) {
                        startTime = Date.now();
                        firstBallHit = true;
                        startTimer();
                    }

                    ballsHit++;
                    if (ball.type === 'green') {
                        score++;
                    } else if (ball.type === 'red') {
                        score -= 5;
                    }
                    balls.splice(index, 1);
                    scoreElement.textContent = `Score: ${score}`;

                    if (ballsHit >= ballsLimit) {
                        endGame();
                    }
                }
            });
        }
    });

    ctx.restore();

    if (elapsedTime >= timeLimit) {
        endGame();
    }

    animationFrameId = requestAnimationFrame(updateGame);
}

// Initialize the game
async function init() {
    await loadModel();
    startVideo();
    setInterval(generateBall, 1000);
    updateGame();
}

// Start the running timer when the first ball is hit
function startTimer() {
    timerInterval = setInterval(() => {
        elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        timerElement.textContent = `Time: ${elapsedTime}s`;
    }, 100);
}

// Stop and reset the timer
function stopTimer() {
    clearInterval(timerInterval);
    timerElement.textContent = `Time: ${elapsedTime}s`;
    elapsedTime = 0;
}

// End the game if either limit is reached
function endGame() {
    cancelAnimationFrame(animationFrameId);

    balls = [];
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <p>Game Over!</p>
        <p>Final Score: ${score}</p>
        <p>Total Time Played: ${elapsedTime} seconds</p>
        <p>Number of Balls Hit: ${ballsHit}</p>
    `;

    stopVideo();
    stopTimer();

    // Hide game-related elements
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('webcam').style.display = 'none';
    document.getElementById('score').style.display = 'none';
    document.getElementById('timer').style.display = 'none';

    // Display buttons and settings
    startButton.style.display = 'block';
    stopButton.style.display = 'none';
    document.getElementById('settingsContainer').style.display = 'block';
    document.getElementById('difficultySelection').style.display = 'block';
}

// Highlight the selected difficulty button
function highlightButton(selectedButton) {
    easyButton.classList.remove('highlighted');
    normalButton.classList.remove('highlighted');
    hardButton.classList.remove('highlighted');
    selectedButton.classList.add('highlighted');
}

easyButton.addEventListener('click', () => {
    difficulty = 'easy';
    ballSpeedMultiplier = 1;
    redBallProbability = 0.2;
    highlightButton(easyButton);
});

normalButton.addEventListener('click', () => {
    difficulty = 'normal';
    ballSpeedMultiplier = 1.5;
    redBallProbability = 0.4;
    highlightButton(normalButton);
});

hardButton.addEventListener('click', () => {
    difficulty = 'hard';
    ballSpeedMultiplier = 2;
    redBallProbability = 0.6;
    highlightButton(hardButton);
});

highlightButton(easyButton);

// Function to validate input and set a default value if invalid
function validateInput(inputElement, minValue, maxValue, defaultValue) {
    const value = parseInt(inputElement.value, 10);

    // If the input is not a valid number or is out of bounds, use the default value
    if (isNaN(value) || value < minValue || value > maxValue) {
        alert(`Invalid input! Setting to default value: ${defaultValue}`);
        inputElement.value = defaultValue;  // Set to default value
        return defaultValue;
    }
    return value;
}

startButton.addEventListener('click', () => {
    // Display an alert to warn the user
    alert("The game is about to start. Please ensure you have sufficient space around you, remain mindful of your surroundings, and avoid movements that exceed your comfort or physical abilities.");

    // Validate inputs
    timeLimit = validateInput(timeLimitInput, 10, 300, 60);  // Time limit between 10 and 300 seconds, default is 60
    ballsLimit = validateInput(ballsLimitInput, 5, 100, 20); // Balls limit between 5 and 100, default is 20

    gameStarted = true;
    startButton.style.display = 'none';
//    pauseButton.style.display = 'block';
    stopButton.style.display = 'block';
    scoreElement.textContent = 'Score: 0';
    ballsHit = 0;
    score = 0;
    firstBallHit = false;
    stopTimer();

    resultDiv.style.display = 'none';

    timeLimit = parseInt(timeLimitInput.value);
    ballsLimit = parseInt(ballsLimitInput.value);

    // Hide irrelevant elements at the start of the game
    startButton.style.display = 'none';
    stopButton.style.display = 'block';
    resultDiv.style.display = 'none';
    document.getElementById('settingsContainer').style.display = 'none';
    document.getElementById('difficultySelection').style.display = 'none';

    // Show game elements
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('webcam').style.display = 'block';
    document.getElementById('score').style.display = 'block';
    document.getElementById('timer').style.display = 'block';

    init();
});

stopButton.addEventListener('click', endGame);
