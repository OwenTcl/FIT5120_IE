const videoElement = document.getElementById('webcam');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const scoreElement = document.getElementById('score');

let model;
let score = 0;
let balls = [];

// Load the hand tracking model
async function loadModel() {
    model = await handPoseDetection.createDetector(handPoseDetection.SupportedModels.MediaPipeHands, {
        runtime: 'tfjs',
    });
}

// Start the webcam video stream
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
        });
        videoElement.srcObject = stream;
        videoElement.play();
    } catch (err) {
        console.error("Error accessing the camera: ", err);
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
        speed: 2 + Math.random() * 3,
        type: Math.random() < 0.8 ? 'green' : 'red' // 80% chance for green ball, 20% for red
    };
    balls.push(ball);
}

// Game update function
function updateGame() {
    // Clear canvas
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Apply the flip transformation to match the video feed
    ctx.save();  // Save the current state
    ctx.scale(-1, 1);  // Flip horizontally
    ctx.translate(-gameCanvas.width, 0);  // Move back to the origin

    // Update and draw balls
    balls.forEach((ball, index) => {
        ball.y += ball.speed;

        // Remove ball if it goes off screen
        if (ball.y > gameCanvas.height) {
            balls.splice(index, 1);
        }

        // Draw the ball based on its type
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.type === 'green' ? 'green' : 'red';
        ctx.fill();
        ctx.closePath();
    });

    // Detect hand and check for collisions
    detectHands().then(hands => {
        if (hands.length > 0) {
            const hand = hands[0].keypoints;

            // Consider the wrist and index finger base as a "fist"
            const wrist = hand[0];
            const indexBase = hand[5];

            const fistX = (wrist.x + indexBase.x) / 2;
            const fistY = (wrist.y + indexBase.y) / 2;

            // Draw a red circle to indicate fist
            ctx.beginPath();
            ctx.arc(fistX, fistY, 30, 0, Math.PI * 2);
            ctx.strokeStyle = 'red';
            ctx.stroke();
            ctx.closePath();

            // Check if the fist hits any ball
            balls.forEach((ball, index) => {
                const dist = Math.hypot(ball.x - fistX, ball.y - fistY);
                if (dist < ball.radius + 30) {
                    if (ball.type === 'green') {
                        score++; // Green ball: add 1 point
                    } else if (ball.type === 'red') {
                        score -= 5; // Red ball: subtract 5 points
                    }
                    balls.splice(index, 1); // Remove the ball after being hit
                    scoreElement.textContent = `Score: ${score}`;
                }
            });
        }
    });

    // Restore the canvas state
    ctx.restore();

    requestAnimationFrame(updateGame);
}

// Initialize the game
async function init() {
    await loadModel();
    startVideo();
    setInterval(generateBall, 1000);  // Generate a ball every second
    updateGame();  // Start game loop
}

init();  // Start the game
