const gameBoard = document.getElementById("gameBoard");
const ctx = gameBoard.getContext("2d");
const score = document.getElementById("score");
const resetBtn = document.getElementById("resetBtn");
const playBtn = document.getElementById("beginGame");
const cellSize = 26; //размер одного квадратика поля
const validKeys = [
  "a",
  "s",
  "d",
  "w",
  "ф",
  "ы",
  "в",
  "ц",
  "ArrowUp",
  "ArrowRight",
  "ArrowDown",
  "ArrowLeft",
];

class cells {
  //даёт каждому объекту координаты Х и Y
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class snake {
  constructor() {
    this.body = [new cells(2, 0), new cells(1, 0), new cells(0, 0)];
    this.direction = null;
  }

  static bodyColor = "red";
  static headColor = "black";

  foodConsuming(food) {
    let head = this.body[0];
    if (
      food.position &&
      food.position.x != undefined &&
      food.position.y != undefined &&
      head.x == food.position.x &&
      head.y == food.position.y
    ) {
      return true;
    } else {
      return false;
    }
  }

  moves(direction) {
    let head = this.body[0];
    let newHead;
    switch (direction) {
      case "ArrowUp":
      case "w":
      case "ц":
        newHead = new cells(head.x, head.y - 1);
        this.body.unshift(newHead);
        break;
      case "ArrowRight":
      case "d":
      case "в":
        newHead = new cells(head.x + 1, head.y);
        this.body.unshift(newHead);
        break;
      case "ArrowDown":
      case "s":
      case "ы":
        newHead = new cells(head.x, head.y + 1);
        this.body.unshift(newHead);
        break;
      case "ArrowLeft":
      case "a":
      case "ф":
        newHead = new cells(head.x - 1, head.y);
        this.body.unshift(newHead);
        break;
      default:
        break;
    }
  }
}

class food {
  constructor() {
    this.position = new cells(
      Math.floor(Math.random() * 22) + 3,
      Math.floor(Math.random() * 22) + 3
    );
  }
  static color = "purple";

  spawn(snake, foodConsumed) {
    if (foodConsumed) {
      let isOccupied = true;
      while (isOccupied) {
        isOccupied = false;
        let foodX = Math.floor(Math.random() * 25);
        let foodY = Math.floor(Math.random() * 25);
        for (let i = 0; i < snake.body.length - 1; i++) {
          if (!(snake.body[i].x == foodX) || snake.body[i].y == foodY) {
            this.position.x = foodX;
            this.position.y = foodY;
          } else {
            isOccupied = true;
          }
        }
      }
    }
  }
}

const drawing = {
  //объект дающий методы отрисовки для объектов созданных по классам змеи и еды
  draw(ctx, foodObj, snakeObj, object) {
    if (object instanceof food) {
      foodObj.spawn(snakeObj);
      ctx.fillStyle = food.color;
      ctx.fillRect(
        foodObj.position.x * cellSize,
        foodObj.position.y * cellSize,
        cellSize,
        cellSize
      );
    } else if (object instanceof snake) {
      for (let i = 0; i < snakeObj.body.length; i++) {
        if (i == 0) {
          ctx.fillStyle = snake.headColor;
        } else {
          ctx.fillStyle = snake.bodyColor;
        }

        ctx.fillRect(
          snakeObj.body[i].x * cellSize,
          snakeObj.body[i].y * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  },
};

Object.assign(snake.prototype, drawing);
Object.assign(food.prototype, drawing);

function legalMoves(snake, direction) {
  // проверка в каком направлении может быть следующее движение змейки например если двежится в право то не может повернуть на лево
  switch (snake.direction) {
    case "ArrowUp":
    case "w":
    case "ц":
      if (direction == "s" || direction == "ArrowDown" || direction == "ы") {
        break;
      } else {
        snake.direction = direction;
      }
      break;
    case "ArrowRight":
    case "d":
    case "в":
      if (direction == "a" || direction == "ArrowLeft" || direction == "ф") {
        break;
      } else {
        snake.direction = direction;
      }
      break;
    case "ArrowDown":
    case "s":
    case "ы":
      if (direction == "w" || direction == "ArrowUp" || direction == "ц") {
        break;
      } else {
        snake.direction = direction;
      }
      break;
    case "ArrowLeft":
    case "a":
    case "ф":
      if (direction == "d" || direction == "ArrowRight" || direction == "в") {
        break;
      } else {
        snake.direction = direction;
      }
      break;
    default:
      snake.direction = direction;
  }
}

function border(snake) {
  //границы поля и проверка не ударилась ли змея в себя
  let head = snake.body[0];
  for (let i = 1; i < snake.body.length - 1; i++) {
    if (head.x == snake.body[i].x && head.y == snake.body[i].y) {
      gameIsRunning = false;
      console.log("Game over");
    } else if (head.x < 0 || head.y < 0) {
      gameIsRunning = false;
      console.log("Game over");
    } else if (
      head.x > gameBoard.width / cellSize - 1 ||
      head.y > gameBoard.height / cellSize - 1
    ) {
      gameIsRunning = false;
      console.log("Game over");
    }
  }
}

function drawGame(ctx, snake, food) {
  ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);
  snake.draw(ctx, food, snake, snake);
  food.draw(ctx, food, snake, food);
}

let frames;
let counter = 0;

function animation(ctx, snake, food, direction) {
  //анимация
  clearInterval(frames);
  frames = setInterval(() => {
    if (!gameIsRunning) {
      clearInterval(frames);
      gameBoard.style.display = "none";
      document.getElementById("gameOver").style.display = "block";
      return;
    }

    drawGame(ctx, snake, food);
    border(snake);
    snake.moves(direction);

    if (snake.foodConsuming(food)) {
      counter += 1;
      score.innerHTML = counter;
      ctx.clearRect(
        food.position.x * cellSize,
        food.position.y * cellSize,
        cellSize,
        cellSize
      );
      food.spawn(snake, snake.foodConsuming(food));
    } else {
      snake.body.pop();
    }
  }, 40);
}

let python = new snake();
let apple = new food();
apple.spawn(python, python.foodConsuming(apple));

let gameIsRunning = false;

playBtn.addEventListener("click", () => {
  playBtn.classList.add("hideElement");
  resetBtn.classList.remove("hideElement");
  drawGame(ctx, python, apple);
  window.addEventListener("keydown", (e) => {
    //проверка не зажата ли клавиша
    if (!e.repeat) {
      for (let i = 0; i < validKeys.length - 1; i++) {
        if (e.key == validKeys[i]) {
          gameIsRunning = true;
          legalMoves(python, e.key);
          animation(ctx, python, apple, python.direction);
          break;
        }
      }
    }
  });
});

resetBtn.addEventListener("click", () => {
  location.reload();
});
