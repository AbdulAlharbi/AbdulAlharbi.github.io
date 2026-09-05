/** Snake: grid-based canvas game. Arrow keys or the on-screen buttons steer. */

type Point = { x: number; y: number };

const GRID = 20;
const TICK_MS = 200;

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d');
if (!canvas || !ctx) throw new Error('Missing game canvas');
const cols = canvas.width / GRID;
const rows = canvas.height / GRID;

const overlay = document.getElementById('gameOverOverlay') as HTMLElement;
const gameOverText = document.getElementById('gameOverText') as HTMLElement;

let snake: Point[] = [{ x: 10, y: 10 }];
let direction: Point = { x: 1, y: 0 };
const food: Point = { x: 5, y: 5 };
let score = 0;
let gameInterval: number | undefined;

function startGame(): void {
  score = 0;
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  placeFood();
  window.clearInterval(gameInterval);
  gameInterval = window.setInterval(gameLoop, TICK_MS);
  overlay.style.display = 'none';
}

function gameLoop(): void {
  update();
  draw();
}

function update(): void {
  const head = { x: snake[0]!.x + direction.x, y: snake[0]!.y + direction.y };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    placeFood();
  } else {
    snake.pop();
  }

  const hitWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
  const hitSelf = snake.slice(1).some((p) => p.x === head.x && p.y === head.y);
  if (hitWall || hitSelf) endGame();
}

function draw(): void {
  ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
  ctx!.fillStyle = 'lime';
  for (const part of snake) ctx!.fillRect(part.x * GRID, part.y * GRID, GRID, GRID);
  ctx!.fillStyle = 'red';
  ctx!.fillRect(food.x * GRID, food.y * GRID, GRID, GRID);
  ctx!.fillStyle = '#fff';
  ctx!.font = '16px monospace';
  ctx!.fillText(`Score: ${score}`, 10, 20);
}

function placeFood(): void {
  food.x = Math.floor(Math.random() * cols);
  food.y = Math.floor(Math.random() * rows);
}

function endGame(): void {
  window.clearInterval(gameInterval);
  gameOverText.textContent = `Game Over Loser! Your Score: ${score}`;
  overlay.style.display = 'flex';
}

/** Turn unless it would reverse straight into the body. */
function steer(next: Point): void {
  if (next.x !== 0 && direction.x === -next.x) return;
  if (next.y !== 0 && direction.y === -next.y) return;
  direction = next;
}

const KEYS: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowRight: { x: 1, y: 0 },
  ArrowDown: { x: 0, y: 1 },
};
document.addEventListener('keydown', (e) => {
  const next = KEYS[e.key];
  if (next) steer(next);
});
document.getElementById('leftBtn')!.addEventListener('click', () => steer(KEYS.ArrowLeft!));
document.getElementById('upBtn')!.addEventListener('click', () => steer(KEYS.ArrowUp!));
document.getElementById('rightBtn')!.addEventListener('click', () => steer(KEYS.ArrowRight!));
document.getElementById('downBtn')!.addEventListener('click', () => steer(KEYS.ArrowDown!));
document.getElementById('playAgainBtn')!.addEventListener('click', startGame);

startGame();
