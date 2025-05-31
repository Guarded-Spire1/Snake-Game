const gameBoard = document.getElementById("gameBoard");
const ctx = gameBoard.getContext("2d");
const resetBtn = document.getElementById("resetBtn");
const playBtn = document.getElementById("beginGame");
const cellSize = 26;
const cellsAmount = 25;
const validKeys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];

function isEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

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
    this.direction = "ArrowRight";
  }
  static bodyColor = "black";
  static headColor = "red";

  move(direction) {
    const head = this.body[0];
    let newHead;
    switch (direction) {
      case "ArrowUp":
        newHead = new Cells(head.x, head.y - 1);
        this.body.unshift(newHead);
        break;

      case "ArrowRight":
        newHead = new Cells(head.x + 1, head.y);
        this.body.unshift(newHead);
        break;

      case "ArrowLeft":
        newHead = new Cells(head.x - 1, head.y);
        this.body.unshift(newHead);
        break;

      case "ArrowDown":
        newHead = new Cells(head.x, head.y + 1);
        this.body.unshift(newHead);
        break;
    }
  }

  cutTail() {
    this.body.pop();
  }

  status() {
    //Проверка врезалась в себя или границы
    const snakeHead = this.body[0];
    if (snakeHead.x < 0 || snakeHead.y < 0) return false;
    if (snakeHead.x >= cellsAmount || snakeHead.y >= cellsAmount) return false;

    for (let i = 1; i < this.body.length; i++) {
      const segment = this.body[i];
      if (snakeHead.x == segment.x && snakeHead.y == segment.y) return false;
    }

    return true;
  }
}

class Apple {
  constructor() {
    this.position = new Cells(
      Math.floor(Math.random() * cellsAmount),
      Math.floor(Math.random() * cellsAmount)
    );
  }

  static color = "purple";
  //рандомный спавнер если попадутся координаты змейки заново выбираются координаты
  spawn(occupiedCells) {
    this.updateCoordinates();
    for (let i = 0; i < occupiedCells.length; i++) {
      if (isEqual(this.position, occupiedCells[i])) this.spawn(occupiedCells);
    }
  }

  updateCoordinates() {
    this.position = new Cells(
      Math.floor(Math.random() * cellsAmount),
      Math.floor(Math.random() * cellsAmount)
    );
  }
}

class Render {
  constructor(ctx, cellSize) {
    this.ctx = ctx;
    this.cellSize = cellSize;
  }

  drawSnake(snake) {
    for (let i = 0; i < snake.body.length; i++) {
      const segment = snake.body[i];

      if (i === 0) {
        this.ctx.fillStyle = Snake.headColor;
        this.ctx.fillRect(
          segment.x * this.cellSize,
          segment.y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
        continue;
      }

      this.ctx.fillStyle = Snake.bodyColor;
      this.ctx.fillRect(
        segment.x * this.cellSize,
        segment.y * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    }
  }

  drawApple(apple) {
    this.ctx.fillStyle = Apple.color;
    this.ctx.fillRect(
      apple.position.x * this.cellSize,
      apple.position.y * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  clear() {
    this.ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);
  }
}

class Game {
  constructor(snake, apple, render) {
    this.snake = snake;
    this.apple = apple;
    this.render = render;
    this.isGameOver = false;
    this.frames = null;
  }
  //проверка логики движений, в каком направлении может быть следующее движение змейки например если двежится в право то не может повернуть на лево
  handleKey(keyPress) {
    if (keyPress === this.snake.direction) return;
    switch (this.snake.direction) {
      case "ArrowUp":
        if (keyPress == "ArrowDown") return;
        this.snake.direction = keyPress;
        break;
      case "ArrowDown":
        if (keyPress == "ArrowUp") return;
        this.snake.direction = keyPress;
        break;
      case "ArrowRight":
        if (keyPress == "ArrowLeft") return;
        this.snake.direction = keyPress;
        break;
      case "ArrowLeft":
        if (keyPress == "ArrowRight") return;
        this.snake.direction = keyPress;
        break;
    }
  }

  update() {
    //обновление состоянии объектов то есть состояния игры
    const snakeHead = this.snake.body[0];
    const applePosition = this.apple.position;

    const snakeAte =
      snakeHead.x === applePosition.x && snakeHead.y === applePosition.y;

    if (!snakeAte) this.snake.cutTail();
    if (snakeAte) {
      this.apple.spawn(snake.body);
    }
    if (!this.snake.status()) this.isGameOver = true;
  }

  animate() {
    this.frames = setInterval(() => {
      if (this.isGameOver) {
        clearInterval(this.frames);
        gameBoard.style.display = "none";
        document.getElementById("gameOver").style.display = "block";
        return;
      }

      this.snake.move(this.snake.direction);
      this.update();
      this.render.clear();
      this.render.drawApple(this.apple);
      this.render.drawSnake(this.snake);
    }, 100);
  }

  begin() {
    this.animate();
  }
}

const snake = new Snake();
const apple = new Apple();
const render = new Render(ctx, cellSize);
const game = new Game(snake, apple, render);

playBtn.addEventListener("click", () => {
  game.begin();
  resetBtn.classList.remove("hideElement");
  window.addEventListener("keydown", (event) => {
    //проверка не зажата ли клавиша
    if (event.repeat) return;
    for (let i = 0; i < validKeys.length; i++) {
      if (event.key == validKeys[i]) {
        game.handleKey(event.key);
        break;
      }
    }
  });
});

resetBtn.addEventListener("click", () => {
  location.reload();
});
