let board_background = "#191919";
let snake_col = '#ffc080';
let snake_border = 'darkblue';

let snake = [
    { x: 200, y: 200 },
    { x: 190, y: 200 },
    { x: 180, y: 200 },
    { x: 170, y: 200 },
    { x: 160, y: 200 }
]

let score = 0;
let changing_direction = false;
let food_x;
let food_y;
// Horizontal velocity
let dx = 10;
// Vertical velocity
let dy = 0;

let game_over = false;
let game_started = false;


const snakeboard = document.getElementById("snakeboard");
const snakeboard_ctx = snakeboard.getContext("2d");

document.getElementById('startButton').addEventListener('click', function() {
    if(!game_started) {
        game_started = true;
        main();
        gen_food();
    }
    this.remove();
});

document.addEventListener("keydown", startGameByKeyPress);

function startGameByKeyPress(event) {
    if(!game_started) {
        game_started = true;
        document.getElementById('startButton').remove();
        main();
        gen_food();
    }
}


document.addEventListener("keydown", change_direction);
document.addEventListener("keydown", restart_game);

function main() {
    if(!game_started) {
        return;
    }

    if (has_game_ended()) {
        game_over = true;
        snakeboard_ctx.fillStyle = 'rgb(255, 128, 128)';
        snakeboard_ctx.font = '65px VT323';
        snakeboard_ctx.textAlign = 'center';
        snakeboard_ctx.textBaseline = 'middle';
        snakeboard_ctx.fillText('Game Over', snakeboard.width / 2, snakeboard.height / 2);
        snakeboard_ctx.font = '30px VT323';
        snakeboard_ctx.fillText('Press any button to continue', snakeboard.width / 2, snakeboard.height / 2 + 40);        
        return;
    }

    changing_direction = false;
    setTimeout(function onTick() {
        clear_board();
        drawFood();
        move_snake();
        drawSnake();
        // Repeat
        main();
    }, 100)
}

function clear_board() {
    //  Select the colour to fill the drawing
    snakeboard_ctx.fillStyle = board_background;

    // Draw a "filled" rectangle to cover the entire canvas
    snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
}

function drawSnake() {
    snake.forEach(drawSnakePart)
}

let apple_col = 'lightgreen';

function drawFood() {
    snakeboard_ctx.fillStyle = apple_col;
    snakeboard_ctx.strokestyle = 'darkgreen';
    snakeboard_ctx.fillRect(food_x, food_y, 10, 10);
    snakeboard_ctx.strokeRect(food_x, food_y, 10, 10);
}

function drawSnakePart(snakePart) {

    snakeboard_ctx.fillStyle = snake_col;

    snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
    // Draw a border around the snake part
    snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
}

function has_game_ended() {
    for (let i = 4; i < snake.length; i++) {
      if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true
    }
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > snakeboard.width - 10;
    const hitToptWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > snakeboard.height - 10;
    
    if (hitLeftWall || hitRightWall || hitToptWall || hitBottomWall) {
      game_over = true;
      fetch('/api/topScores')
        .then(response => response.json())
        .then(data => {
          const minTopScore = data.length < 5 ? 0 : data[data.length-1].score;
          if (score > minTopScore) {
            // Prompt the user for their name, then post the score
            const username = prompt('Enter your username:');
            postScore(username, score);
          }
          snakeboard_ctx.fillStyle = 'rgb(255, 128, 128)';
          snakeboard_ctx.font = '65px VT323';
          snakeboard_ctx.textAlign = 'center';
          snakeboard_ctx.textBaseline = 'middle';
          snakeboard_ctx.fillText('Game Over', snakeboard.width / 2, snakeboard.height / 2);
          snakeboard_ctx.font = '30px VT323';
          snakeboard_ctx.fillText('Press any button to continue', snakeboard.width / 2, snakeboard.height / 2 + 40);  
        });
      return true;
    }
  
    return false;
  }

function random_food(min, max) {
    return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function gen_food() {
    food_x = random_food(0, snakeboard.width - 10);
    food_y = random_food(0, snakeboard.height - 10);
    snake.forEach(function has_snake_eaten_food(part) {
        const has_eaten = part.x == food_x && part.y == food_y;
        if (has_eaten) gen_food();
    });
}

function change_direction(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const W_KEY = 87;
    const A_KEY = 65;
    const S_KEY = 83;
    const D_KEY = 68;

    // Prevent the snake from reversing

    if (changing_direction) return;
    changing_direction = true;
    const keyPressed = event.keyCode;
    const goingUp = dy === -10;
    const goingDown = dy === 10;
    const goingRight = dx === 10;
    const goingLeft = dx === -10;

    if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingRight) {
        dx = -10;
        dy = 0;
    }
    if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingDown) {
        dx = 0;
        dy = -10;
    }
    if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingLeft) {
        dx = 10;
        dy = 0;
    }
    if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingUp) {
        dx = 0;
        dy = 10;
    }
}

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const touchStartHandler = (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const touchMoveHandler = (e) => {
    e.preventDefault();
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
  };

const touchEndHandler = () => {
  let diffX = touchEndX - touchStartX;
  let diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) { // Horizontal swipe
    if (diffX > 0 && dx !== -10) { // Swipe right
      dx = 10;
      dy = 0;
    } else if (diffX < 0 && dx !== 10) { // Swipe left
      dx = -10;
      dy = 0;
    }
  } else { // Vertical swipe
    if (diffY > 0 && dy !== -10) { // Swipe down
      dx = 0;
      dy = 10;
    } else if (diffY < 0 && dy !== 10) { // Swipe up
      dx = 0;
      dy = -10;
    }
  }
};

document.addEventListener('touchstart', touchStartHandler, false);
document.addEventListener('touchmove', touchMoveHandler, { passive: false });
document.addEventListener('touchend', touchEndHandler, false);


function move_snake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
  const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
  if (has_eaten_food) {
      score += 1;
      document.getElementById('score').innerHTML = score;
      gen_food();
  } else {
      snake.pop();
  }
  drawSnake();  // Redraw the snake after moving
}

function restart_game(event) {
    // Get the element that was touched
    let targetElement = event.target || event.srcElement;
  
    // Check if the touched element is not a button
    if(targetElement.nodeName !== 'BUTTON') {
      if(game_over) {
        snake = [
            { x: 200, y: 200 },
            { x: 190, y: 200 },
            { x: 180, y: 200 },
            { x: 170, y: 200 },
            { x: 160, y: 200 }
        ];
        
        score = 0;
        dx = 10;
        dy = 0;
        
        game_over = false;
        main();
        gen_food();
      }
      else {
        change_direction(event);
      }
    }
  }
  document.addEventListener("touchstart", restart_game);


document.getElementById('scoreboardButton').addEventListener('click', function() {
    var scoreboard = document.getElementById('scoreboard');
    if (scoreboard.classList.contains('active')) {
        scoreboard.classList.remove('active');
    } else {
        scoreboard.classList.add('active');
    }
});

let shopButton = document.getElementById('shopButton');
let shop = document.getElementById('shop');

shopButton.addEventListener('click', function() {
  shop.classList.toggle('active');
});


function postScore(username, score) {
    fetch('/api/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, score }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Score saved: ', data);
      // Update the scoreboard
      updateScoreboard();
    })
    .catch((error) => console.error('Error:', error));
  }


function updateScoreboard() {
    fetch('/api/topScores')
    .then(response => response.json())
    .then(data => {
      const scoreboard = document.getElementById('scores');
      // Clear the current scoreboard
      scoreboard.innerHTML = '';
      // Add each score to the scoreboard
      data.forEach((score, index) => {
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.className = 'player-name';
        nameSpan.textContent = score.username;
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'player-score';
        scoreSpan.textContent = score.score;
        if (index === 0) {
          const crownIcon = document.createElement('i');
          crownIcon.className = 'fa-solid fa-crown';
          li.appendChild(crownIcon);
        }
        li.appendChild(nameSpan);
        li.appendChild(scoreSpan);
        scoreboard.appendChild(li);
      });
    })
    .catch((error) => console.error('Error:', error));
}

updateScoreboard();

let rainbowInterval;
// Colors in RGB
const colors = [
  [255, 0, 0],    // Red
  [255, 165, 0],  // Orange
  [255, 255, 0],  // Yellow
  [0, 128, 0],    // Green
  [0, 0, 255],    // Blue
  [75, 0, 130],   // Indigo
  [238, 130, 238], // Violet
];

let colorIndex = 0;
let increment = 0;
let incrementStep = 0.02;

// Converts an RGB color array to a CSS color string
function rgbToCssColor(rgb) {
  return 'rgb(' + rgb.join(',') + ')';
}

function transitionColor(startColor, endColor, ratio) {
  let [r1, g1, b1] = startColor;
  let [r2, g2, b2] = endColor;
  
  let r = r1 + Math.round((r2 - r1) * ratio);
  let g = g1 + Math.round((g2 - g1) * ratio);
  let b = b1 + Math.round((b2 - b1) * ratio);
  
  return [r, g, b];
}

function changeColor() {
  if (rainbowInterval) {
    clearInterval(rainbowInterval);
  }
  
  rainbowInterval = setInterval(() => {
    let startColor = colors[colorIndex];
    let endColor = colors[(colorIndex + 1) % colors.length];

    let color = transitionColor(startColor, endColor, increment);
    
    snake_col = rgbToCssColor(color);
    apple_col = rgbToCssColor(color); // Change the apple color
    document.documentElement.style.setProperty('--global-theme-accent', rgbToCssColor(color));

    increment += incrementStep;
    if (increment >= 1) {
      increment = 0;
      colorIndex = (colorIndex + 1) % colors.length;
    }
  }, 100);
}

// TODO:
// - add filtering so same score but newer is lower instead of higher
// - add a modal for username input
// - add harder difficulty
// - scoreboard diffrent style a bit for top three
