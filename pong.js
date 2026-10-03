window.onload = () => {
  document.body.style.overflow = "hidden"; // scherm kan niet scrollen
  startGame();
};

// AnimationFrame fallback
var animate =
  window.requestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };

// Canvas setup
var canvas = document.querySelector("canvas");
var width = 1200;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext("2d");

// Game objects
let gameRunning = false;

const paddleWidth = 10;
const paddleHeight = 90;

let leftPaddle = {
  x: 20,
  y: height / 2 - paddleHeight / 2,
  speed: 8,
};

let rightPaddle = {
  x: width - 40,
  y: height / 2 - paddleHeight / 2,
  speed: 8,
};

let ball = {
  x: width / 2,
  y: height / 2,
  radius: 15,
  dx: 6,
  dy: 6,
};

let scoreLeft = 0;
let scoreRight = 0;

// Input states
let keys = {};

// Timer variabelen
let ballPaused = false;
let pauseTimer = 0; // 180 frames = 3 seconden

// Start game
const startGame = () => {
  console.log("Game script loaded");
  startScreen();

  document.addEventListener("keydown", (e) => (keys[e.code] = true));
  document.addEventListener("keyup", (e) => (keys[e.code] = false));

  // Press Space to start
  onkeyup = (e) => {
    if (!gameRunning && e.code === "Space") {
      scoreLeft = 0;
      scoreRight = 0;
      gameRunning = true;
      resetBall();
      gameLoop();
    }
  };
};

// Start screen
function startScreen() {
  // Background
  context.fillStyle = "#000000";
  context.fillRect(0, 0, width, height);

  // Center net
  context.beginPath();
  context.setLineDash([7, 20]);
  context.moveTo(width / 2, 0);
  context.lineTo(width / 2, height);
  context.lineWidth = 5;
  context.strokeStyle = "#ffffff";
  context.stroke();

  // Text
  context.font = "70px Arial";
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.fillText("Press SPACE to Start", width / 2, height / 2);
}

// Reset ball + pauze
function resetBall() {
  ballPaused = true; // bal pauzeren
  pauseTimer = 180; // 3 sec bij 60 fps

  ball.x = width / 2;
  ball.y = height / 2;
  ball.dx = 0;
  ball.dy = 0;
}

// Game loop
function gameLoop() {
  update();
  draw();
  if (gameRunning) animate(gameLoop);
}

// Update game state
function update() {
  // Als de bal gepauzeerd is → timer aftellen
  if (ballPaused) {
    pauseTimer--;

    if (pauseTimer <= 0) {
      ballPaused = false;

      // bal opnieuw afschieten
      ball.dx = Math.random() > 0.5 ? 5.5 : -6;
      ball.dy = Math.random() > 0.5 ? 5.5 : -6;
    }
    return; // rest van update overslaan tijdens pauze
  }

  // Paddle movement
  if (keys["KeyW"]) leftPaddle.y -= leftPaddle.speed;
  if (keys["KeyS"]) leftPaddle.y += leftPaddle.speed;
  if (keys["ArrowUp"]) rightPaddle.y -= rightPaddle.speed;
  if (keys["ArrowDown"]) rightPaddle.y += rightPaddle.speed;

  // Clamp paddles
  leftPaddle.y = Math.max(0, Math.min(height - paddleHeight, leftPaddle.y));
  rightPaddle.y = Math.max(0, Math.min(height - paddleHeight, rightPaddle.y));

  // Ball movement
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision top/bottom
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > height) {
    ball.dy *= -1;
  }

  // Left paddle collision
  if (
    ball.x - ball.radius <= leftPaddle.x + paddleWidth &&
    ball.y >= leftPaddle.y &&
    ball.y <= leftPaddle.y + paddleHeight
  ) {
    ball.dx *= -1;
  }

  // Right paddle collision
  if (
    ball.x + ball.radius >= rightPaddle.x &&
    ball.y >= rightPaddle.y &&
    ball.y <= rightPaddle.y + paddleHeight
  ) {
    ball.dx *= -1;
  }

  // Score right
  if (ball.x < 0) {
    scoreRight++;
    resetBall();
  }

  // Score left
  if (ball.x > width) {
    scoreLeft++;
    resetBall();
  }

  // Check for winning score
  if (scoreLeft >= 7 || scoreRight >= 7) {
    gameRunning = false;
    showEndScreen();
  }
}

// Draw everything
function draw() {
  // Background
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);

  // Net
  context.beginPath();
  context.setLineDash([7, 20]);
  context.moveTo(width / 2, 0);
  context.lineTo(width / 2, height);
  context.lineWidth = 5;
  context.strokeStyle = "#fff";
  context.stroke();

  // Paddles
  context.fillStyle = "#fff";
  context.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
  context.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);

  // Ball
  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fill();

  // Score
  context.font = "60px Arial";
  context.fillText(scoreLeft, width / 2 - 100, 80);
  context.fillText(scoreRight, width / 2 + 100, 80);

  // Countdown tekst tijdens pauze
  if (ballPaused) {
    const seconds = Math.ceil(pauseTimer / 60);

    context.font = "80px Arial";
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.fillText(seconds, width / 2, height / 2);
  }
}

// End screen met paddle-explosie
function showEndScreen() {
  let animationFrames = 0;
  const maxFrames = 180; // 3 seconden animatie
  const confetti = [];

  // Functie om confetti te maken op de winnende paddle
  function createConfetti() {
    let paddle = scoreLeft >= 7 ? leftPaddle : rightPaddle;
    for (let i = 0; i < 100; i++) {
      confetti.push({
        x: paddle.x + paddleWidth / 2,
        y: paddle.y + paddleHeight / 2,
        dx: (Math.random() - 0.5) * 10,
        dy: (Math.random() - 1.5) * 10,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        size: Math.random() * 5 + 2,
        gravity: 0.2 + Math.random() * 0.3,
      });
    }
  }

  createConfetti();

  function endLoop() {
    // Achtergrond
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);

    // Net
    context.beginPath();
    context.setLineDash([7, 20]);
    context.moveTo(width / 2, 0);
    context.lineTo(width / 2, height);
    context.lineWidth = 5;
    context.strokeStyle = "#fff";
    context.stroke();

    // Confetti animatie
    confetti.forEach((p) => {
      context.fillStyle = p.color;
      context.beginPath();
      context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      context.fill();

      p.x += p.dx;
      p.y += p.dy;
      p.dy += p.gravity; // gravity effect

      // Laat confetti langzaam uit het scherm vallen
      if (p.y > height) {
        p.y = -p.size;
        p.x = Math.random() * width;
        p.dy = Math.random() * 5 - 2;
      }
    });

    // Winnende paddle puls effect
    const pulse = Math.sin(animationFrames * 0.1) * 20;
    context.fillStyle = "#fff";

    if (scoreLeft >= 7) {
      context.fillRect(
        leftPaddle.x,
        leftPaddle.y - pulse / 2,
        paddleWidth,
        paddleHeight + pulse,
      );
    } else {
      context.fillRect(
        rightPaddle.x,
        rightPaddle.y - pulse / 2,
        paddleWidth,
        paddleHeight + pulse,
      );
    }

    // Winnende tekst
    context.font = "70px Arial";
    context.fillStyle = "#fff";
    context.textAlign = "center";
    if (scoreLeft >= 7) {
      context.fillText("Left Player Wins!", width / 2, height / 2);
    } else {
      context.fillText("Right Player Wins!", width / 2, height / 2);
    }

    context.font = "50px Arial";
    context.fillText("Press SPACE to Restart", width / 2, height / 2 + 100);

    animationFrames++;
    if (animationFrames < maxFrames) {
      animate(endLoop);
    } else {
      // Reset scores bij restart
      onkeyup = (e) => {
        if (e.code === "Space") {
          scoreLeft = 0;
          scoreRight = 0;
          gameRunning = true;
          resetBall();
          gameLoop();
        }
      };
    }
  }

  endLoop();
}
