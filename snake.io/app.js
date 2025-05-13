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

let gameIsRunning = true;

class Cells {
  //даёт каждому объекту координаты Х и Y
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Snake {
  constructor() {
    this.body = [new Cells(2, 0), new Cells(1, 0), new Cells(0, 0)];
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
          newHead = new Cells(head.x, head.y + 1);
          this.body.unshift(newHead);
        } else {
          newHead = new Cells(head.x, head.y - 1);
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
          newHead = new Cells(head.x - 1, head.y);
          this.body.unshift(newHead);
        } else {
          newHead = new Cells(head.x + 1, head.y);
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
          newHead = new Cells(head.x, head.y - 1);
          this.body.unshift(newHead);
        } else {
          newHead = new Cells(head.x, head.y + 1);
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
          newHead = new Cells(head.x + 1, head.y);
          this.body.unshift(newHead);
        } else {
          newHead = new Cells(head.x - 1, head.y);
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
        }
      }

      // проверка не ударилась ли змея в себя
      for (let i = 1; i < this.body.length; i++) {
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

class Food {
  constructor() {
    this.position = new Cells(
      Math.floor(Math.random() * 22) + 3, //случайно выбирает клетку кроме первый трех где спавнится змея
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
    if (object instanceof Food) {
      foodObj.spawn(snakeObj);
      ctx.fillStyle = Food.color;
      ctx.fillRect(
        foodObj.position.x * cellSize,
        foodObj.position.y * cellSize,
        cellSize,
        cellSize
      );
    } else if (object instanceof Snake) {
      for (let i = 0; i < snakeObj.body.length; i++) {
        if (i == 0) {
          ctx.fillStyle = Snake.headColor;
        } else {
          ctx.fillStyle = Snake.bodyColor;
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

Object.assign(Snake.prototype, drawing);
Object.assign(Food.prototype, drawing);

class Animation {
  constructor(snake, food, ctx) {
    this.snake = snake;
    this.food = food;
    this.ctx = ctx;
    this.frames = null;
    this.currentKey = null;
  }

  update(key) {
    this.currentKey = key;
  }

  draw() {
    this.ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);
    this.snake.draw(this.ctx, this.food, this.snake, this.snake);
    this.food.draw(this.ctx, this.food, this.snake, this.food);
  }

  start() {
    frames = setInterval(() => {
      if (!gameIsRunning) {
        clearInterval(frames);
        gameBoard.style.display = "none";
        document.getElementById("gameOver").style.display = "block";
        return;
      }

      this.ctx.clearRect(
        this.food.position.x * cellSize,
        this.food.position.y * cellSize,
        cellSize,
        cellSize
      );

      this.draw();
      this.snake.moves(this.currentKey, this.food);
    }, 150);
  }
}

class StartGame {
  constructor(snake, food, animation) {
    this.snake = snake;
    this.food = food;
    this.animation = animation;
  }

  static validKeys = [
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

  begin() {
    playBtn.classList.add("hideElement");
    resetBtn.classList.remove("hideElement");

    this.food.spawn(this.snake, this.snake.foodConsuming(this.food));
    this.animation.start();

    window.addEventListener("keydown", (e) => {
      //проверка не зажата ли клавиша
      if (!e.repeat) {
        for (let i = 0; i < validKeys.length - 1; i++) {
          if (e.key == validKeys[i]) {
            animation.update(e.key);
            break;
          }
        }
      }
    });
  }
}

let python = new Snake();
let apple = new Food();
let animation = new Animation(python, apple, ctx);
let game = new StartGame(python, apple, animation);

playBtn.addEventListener("click", () => {
  game.begin();
});

resetBtn.addEventListener("click", () => {
  location.reload();
});
