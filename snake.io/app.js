const gameBoard = document.getElementById("gameBoard");
const ctx = gameBoard.getContext("2d");
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

  moves(direction, food) {
    if (!direction) {
      return;
    }

    let head = this.body[0];
    let newHead;

    switch (direction) {
      case "ArrowUp":
      case "w":
      case "ц":
        if (
          // проверка в каком направлении может быть следующее движение змейки например если двежится в право то не может повернуть на лево
          this.direction == "s" ||
          this.direction == "ArrowDown" ||
          this.direction == "ы"
        ) {
          newHead = new cells(head.x, head.y + 1);
          this.body.unshift(newHead);
        } else {
          newHead = new cells(head.x, head.y - 1);
          this.body.unshift(newHead);
          this.direction = direction;
        }
        break;
      case "ArrowRight":
      case "d":
      case "в":
        if (
          this.direction == "a" ||
          this.direction == "ArrowLeft" ||
          this.direction == "ф"
        ) {
          newHead = new cells(head.x - 1, head.y);
          this.body.unshift(newHead);
        } else {
          newHead = new cells(head.x + 1, head.y);
          this.body.unshift(newHead);
          this.direction = direction;
        }
        break;
      case "ArrowDown":
      case "s":
      case "ы":
        if (
          this.direction == "w" ||
          this.direction == "ArrowUp" ||
          this.direction == "ц"
        ) {
          newHead = new cells(head.x, head.y - 1);
          this.body.unshift(newHead);
        } else {
          newHead = new cells(head.x, head.y + 1);
          this.body.unshift(newHead);
          this.direction = direction;
        }
        break;
      case "ArrowLeft":
      case "a":
      case "ф":
        if (
          this.direction == "d" ||
          this.direction == "ArrowRight" ||
          this.direction == "в"
        ) {
          newHead = new cells(head.x + 1, head.y);
          this.body.unshift(newHead);
        } else {
          newHead = new cells(head.x - 1, head.y);
          this.body.unshift(newHead);
          this.direction = direction;
        }
        break;
    }

    //если съел еду и если не съел
    if (this.direction) {
      if (gameIsRunning == true) {
        if (!this.foodConsuming(food)) {
          this.body.pop();
        } else {
          food.spawn(this, true);
          counter++;
        }
      }

      // проверка не ударилась ли змея в себя
      for (let i = 1; i < this.body.length - 1; i++) {
        if (newHead.x == this.body[i].x && newHead.y == this.body[i].y) {
          gameIsRunning = false;
          console.log("Game over");
          return;
        }
      }

      //границы поля
      if (newHead.x < 0 || newHead.y < 0) {
        gameIsRunning = false;
        console.log("Game over");
      } else if (
        newHead.x > gameBoard.width / cellSize - 1 ||
        newHead.y > gameBoard.height / cellSize - 1
      ) {
        gameIsRunning = false;
        console.log("Game over");
      }
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

function drawGame(ctx, snake, food) {
  ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);
  snake.draw(ctx, food, snake, snake);
  food.draw(ctx, food, snake, food);
}

let frames;

function animation(ctx, snake, food) {
  //анимация
  clearInterval(frames);
  frames = setInterval(() => {
    if (!gameIsRunning) {
      clearInterval(frames);
      gameBoard.style.display = "none";
      document.getElementById("gameOver").style.display = "block";
      return;
    }

    ctx.clearRect(
      food.position.x * cellSize,
      food.position.y * cellSize,
      cellSize,
      cellSize
    );
    drawGame(ctx, snake, food);
    python.moves(currentKey, food);
  }, 150);
}

let python = new snake();
let apple = new food();

apple.spawn(python, python.foodConsuming(apple));

let gameIsRunning = false;
let currentKey = null;

playBtn.addEventListener("click", () => {
  playBtn.classList.add("hideElement");
  resetBtn.classList.remove("hideElement");
  gameIsRunning = true;
  animation(ctx, python, apple);

  window.addEventListener("keydown", (e) => {
    //проверка не зажата ли клавиша
    if (!e.repeat) {
      for (let i = 0; i < validKeys.length - 1; i++) {
        if (e.key == validKeys[i]) {
          // python.moves(e.key, apple);
          // animation(ctx, python, apple, python.direction);
          currentKey = e.key;
          break;
        }
      }
    }
  });
});

resetBtn.addEventListener("click", () => {
  location.reload();
});
