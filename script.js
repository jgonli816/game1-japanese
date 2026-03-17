// Hiragana falling game for Japanese learning.
// Inspired by the user's description: characters fall from the top of the screen and
// players type the romaji (latin reading) to destroy them before they reach the bottom.

// Mapping of hiragana to romaji. Only basic gojūon (five rows) included. Feel free to extend.
const kanaMap = [
  { kana: 'あ', romaji: 'a' },
  { kana: 'い', romaji: 'i' },
  { kana: 'う', romaji: 'u' },
  { kana: 'え', romaji: 'e' },
  { kana: 'お', romaji: 'o' },
  { kana: 'か', romaji: 'ka' },
  { kana: 'き', romaji: 'ki' },
  { kana: 'く', romaji: 'ku' },
  { kana: 'け', romaji: 'ke' },
  { kana: 'こ', romaji: 'ko' },
  { kana: 'さ', romaji: 'sa' },
  { kana: 'し', romaji: 'shi' },
  { kana: 'す', romaji: 'su' },
  { kana: 'せ', romaji: 'se' },
  { kana: 'そ', romaji: 'so' },
  { kana: 'た', romaji: 'ta' },
  { kana: 'ち', romaji: 'chi' },
  { kana: 'つ', romaji: 'tsu' },
  { kana: 'て', romaji: 'te' },
  { kana: 'と', romaji: 'to' },
  { kana: 'な', romaji: 'na' },
  { kana: 'に', romaji: 'ni' },
  { kana: 'ぬ', romaji: 'nu' },
  { kana: 'ね', romaji: 'ne' },
  { kana: 'の', romaji: 'no' },
  { kana: 'は', romaji: 'ha' },
  { kana: 'ひ', romaji: 'hi' },
  { kana: 'ふ', romaji: 'fu' },
  { kana: 'へ', romaji: 'he' },
  { kana: 'ほ', romaji: 'ho' },
  { kana: 'ま', romaji: 'ma' },
  { kana: 'み', romaji: 'mi' },
  { kana: 'む', romaji: 'mu' },
  { kana: 'め', romaji: 'me' },
  { kana: 'も', romaji: 'mo' },
  { kana: 'や', romaji: 'ya' },
  { kana: 'ゆ', romaji: 'yu' },
  { kana: 'よ', romaji: 'yo' },
  { kana: 'ら', romaji: 'ra' },
  { kana: 'り', romaji: 'ri' },
  { kana: 'る', romaji: 'ru' },
  { kana: 'れ', romaji: 're' },
  { kana: 'ろ', romaji: 'ro' },
  { kana: 'わ', romaji: 'wa' },
  { kana: 'を', romaji: 'wo' },
  { kana: 'ん', romaji: 'n' }
];

// Game state variables
let canvas, ctx;
let falling = [];
let spawnInterval = 2000; // time between spawns (ms)
let lastSpawn = 0;
let lastTime = 0;
let score = 0;
let level = 1;
let speedMultiplier = 1;
let typedBuffer = '';
let running = false;

// UI Elements
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const typedEl = document.getElementById('typed');
const menu = document.getElementById('menu');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');

function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  document.getElementById('startButton').addEventListener('click', startGame);
  document.getElementById('restartButton').addEventListener('click', startGame);
  // Listen to keyboard events at document level
  document.addEventListener('keydown', handleKey);
}

// Function to start or restart the game
function startGame() {
  // Reset state
  falling = [];
  score = 0;
  level = 1;
  spawnInterval = 2000;
  speedMultiplier = 1;
  typedBuffer = '';
  lastSpawn = 0;
  lastTime = 0;
  running = true;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  typedEl.textContent = '\u00a0';
  menu.style.display = 'none';
  gameOverEl.style.display = 'none';
  // Start loop
  requestAnimationFrame(gameLoop);
}

// Spawns a new kana object at random x position
function spawnKana() {
  const item = kanaMap[Math.floor(Math.random() * kanaMap.length)];
  const x = Math.random() * (canvas.width - 50) + 10;
  const obj = {
    kana: item.kana,
    romaji: item.romaji,
    x: x,
    y: -30,
    speed: 30 + Math.random() * 20, // base speed (will be scaled)
    size: 32
  };
  falling.push(obj);
}

// Game loop executed with requestAnimationFrame for efficiency
function gameLoop(timestamp) {
  if (!running) return;
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  // Update spawn based on interval
  if (timestamp - lastSpawn > spawnInterval) {
    spawnKana();
    lastSpawn = timestamp;
    // Increase difficulty gradually by reducing spawn interval
    if (spawnInterval > 500) {
      spawnInterval *= 0.99; // 1% faster each spawn
    }
  }

  updateObjects(delta);
  draw();
  requestAnimationFrame(gameLoop);
}

// Update positions and sizes
function updateObjects(delta) {
  const dyFactor = (delta / 1000) * speedMultiplier;
  for (let i = 0; i < falling.length; i++) {
    const obj = falling[i];
    obj.y += obj.speed * dyFactor;
    obj.size += 0.02 * delta; // slowly increase font size
    // Check if object reached bottom (defense line is canvas.height)
    if (obj.y > canvas.height - 40) {
      // Game over
      running = false;
      showGameOver();
      return;
    }
  }
  // Remove objects that were marked for deletion (if any)
}

// Render game objects
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw defense line
  ctx.fillStyle = '#ffe5e5';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 2);

  // Draw falling kana
  for (const obj of falling) {
    ctx.font = `${obj.size}px sans-serif`;
    ctx.fillStyle = '#333';
    ctx.fillText(obj.kana, obj.x, obj.y);
  }
}

// Handle keyboard input
function handleKey(e) {
  if (!running) return;
  const key = e.key.toLowerCase();
  // Append to typed buffer if letter
  if (/^[a-z]$/.test(key)) {
    typedBuffer += key;
    typedEl.textContent = typedBuffer;
    checkTypedBuffer();
  } else if (key === 'backspace') {
    typedBuffer = typedBuffer.slice(0, -1);
    typedEl.textContent = typedBuffer || '\u00a0';
  }
}

// Check typed buffer against falling objects
function checkTypedBuffer() {
  // Find candidate objects whose romaji starts with typedBuffer
  let foundExact = null;
  let foundPrefix = false;
  for (const obj of falling) {
    if (obj.romaji.startsWith(typedBuffer)) {
      foundPrefix = true;
      if (obj.romaji === typedBuffer) {
        foundExact = obj;
        break;
      }
    }
  }
  if (foundExact) {
    // Remove object and update score
    const index = falling.indexOf(foundExact);
    if (index !== -1) {
      falling.splice(index, 1);
      score += 1;
      scoreEl.textContent = score;
      // Increase speed and level every few points
      if (score % 10 === 0) {
        level += 1;
        levelEl.textContent = level;
        speedMultiplier *= 1.1;
      }
    }
    // Reset typed buffer
    typedBuffer = '';
    typedEl.textContent = '\u00a0';
  } else if (!foundPrefix) {
    // Reset if typed string doesn't match any prefix
    typedBuffer = '';
    typedEl.textContent = '\u00a0';
  }
}

function showGameOver() {
  finalScoreEl.textContent = `您的分數：${score}`;
  gameOverEl.style.display = 'flex';
}

window.addEventListener('load', init);