const kanaMap = [
  { kana: 'あ', romaji: 'a' }, { kana: 'い', romaji: 'i' }, { kana: 'う', romaji: 'u' }, { kana: 'え', romaji: 'e' }, { kana: 'お', romaji: 'o' },
  { kana: 'か', romaji: 'ka' }, { kana: 'き', romaji: 'ki' }, { kana: 'く', romaji: 'ku' }, { kana: 'け', romaji: 'ke' }, { kana: 'こ', romaji: 'ko' },
  { kana: 'さ', romaji: 'sa' }, { kana: 'し', romaji: 'shi' }, { kana: 'す', romaji: 'su' }, { kana: 'せ', romaji: 'se' }, { kana: 'そ', romaji: 'so' },
  { kana: 'た', romaji: 'ta' }, { kana: 'ち', romaji: 'chi' }, { kana: 'つ', romaji: 'tsu' }, { kana: 'て', romaji: 'te' }, { kana: 'と', romaji: 'to' },
  { kana: 'な', romaji: 'na' }, { kana: 'に', romaji: 'ni' }, { kana: 'ぬ', romaji: 'nu' }, { kana: 'ね', romaji: 'ne' }, { kana: 'の', romaji: 'no' },
  { kana: 'は', romaji: 'ha' }, { kana: 'ひ', romaji: 'hi' }, { kana: 'ふ', romaji: 'fu' }, { kana: 'へ', romaji: 'he' }, { kana: 'ほ', romaji: 'ho' },
  { kana: 'ま', romaji: 'ma' }, { kana: 'み', romaji: 'mi' }, { kana: 'む', romaji: 'mu' }, { kana: 'め', romaji: 'me' }, { kana: 'も', romaji: 'mo' },
  { kana: 'や', romaji: 'ya' }, { kana: 'ゆ', romaji: 'yu' }, { kana: 'よ', romaji: 'yo' },
  { kana: 'ら', romaji: 'ra' }, { kana: 'り', romaji: 'ri' }, { kana: 'る', romaji: 'ru' }, { kana: 'れ', romaji: 're' }, { kana: 'ろ', romaji: 'ro' },
  { kana: 'わ', romaji: 'wa' }, { kana: 'を', romaji: 'wo' }, { kana: 'ん', romaji: 'n' }
];

const keyboardLayout = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m']
];

let canvas, ctx;
let falling = [];
let spawnInterval = 1800;
let lastSpawn = 0;
let lastTime = 0;
let score = 0;
let level = 1;
let speedMultiplier = 1;
let typedBuffer = '';
let running = false;
let lastFailedKana = null;
let audioUnlocked = false;
const defenseHeight = 40;

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const typedEl = document.getElementById('typed');
const menu = document.getElementById('menu');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const keyboardEl = document.getElementById('keyboard');

function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  document.getElementById('startButton').addEventListener('click', () => {
    unlockAudio();
    startGame();
  });
  document.getElementById('restartButton').addEventListener('click', () => {
    unlockAudio();
    startGame();
  });
  document.addEventListener('keydown', (e) => {
    unlockAudio();
    handlePhysicalKey(e);
  });
  createVirtualKeyboard();
  drawIdleScreen();
}

function unlockAudio() {
  audioUnlocked = true;
}

function createVirtualKeyboard() {
  keyboardEl.innerHTML = '';

  keyboardLayout.forEach((row) => {
    const rowEl = document.createElement('div');
    rowEl.className = `keyboard-row row-${row.length}`;

    row.forEach((key) => {
      rowEl.appendChild(makeKeyButton(key, key));
    });

    if (row.length === 7) {
      rowEl.appendChild(makeKeyButton('⌫', 'backspace', true));
    }

    keyboardEl.appendChild(rowEl);
  });

  const controlRow = document.createElement('div');
  controlRow.className = 'keyboard-row row-9';
  const clearBtn = makeKeyButton('清除', 'clear', true);
  clearBtn.classList.add('keyboard-wide');
  const restartBtn = makeKeyButton('重開', 'restart', true);
  restartBtn.classList.add('keyboard-wide');

  controlRow.appendChild(clearBtn);
  controlRow.appendChild(restartBtn);
  keyboardEl.appendChild(controlRow);
}

function makeKeyButton(label, value, isSpecial = false) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'keyboard-key';
  if (isSpecial) btn.classList.add('keyboard-wide');
  btn.textContent = label;
  btn.addEventListener('click', () => {
    unlockAudio();
    handleVirtualInput(value);
  });
  return btn;
}

function handleVirtualInput(value) {
  if (value === 'restart') {
    startGame();
    return;
  }
  if (value === 'clear') {
    typedBuffer = '';
    updateTypedDisplay();
    return;
  }
  if (!running) return;

  if (value === 'backspace') {
    typedBuffer = typedBuffer.slice(0, -1);
    updateTypedDisplay();
    return;
  }

  if (/^[a-z]$/.test(value)) {
    typedBuffer += value;
    updateTypedDisplay();
    checkTypedBuffer();
  }
}

function handlePhysicalKey(e) {
  const key = e.key.toLowerCase();

  if (key === 'backspace') {
    e.preventDefault();
    handleVirtualInput('backspace');
    return;
  }

  if (/^[a-z]$/.test(key)) {
    handleVirtualInput(key);
  }
}

function startGame() {
  falling = [];
  score = 0;
  level = 1;
  spawnInterval = 1800;
  speedMultiplier = 1;
  typedBuffer = '';
  lastSpawn = 0;
  lastTime = 0;
  lastFailedKana = null;
  running = true;

  scoreEl.textContent = score;
  levelEl.textContent = level;
  updateTypedDisplay();
  menu.style.display = 'none';
  gameOverEl.style.display = 'none';

  requestAnimationFrame(gameLoop);
}

function spawnKana() {
  const item = kanaMap[Math.floor(Math.random() * kanaMap.length)];
  const initialSize = 36;
  ctx.font = `${initialSize}px sans-serif`;
  const textWidth = ctx.measureText(item.kana).width;

  const margin = 16;
  const minX = margin;
  const maxX = Math.max(minX, canvas.width - textWidth - margin);

  falling.push({
    kana: item.kana,
    romaji: item.romaji,
    x: randomBetween(minX, maxX),
    y: -initialSize,
    speed: randomBetween(28, 44),
    size: initialSize
  });
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function gameLoop(timestamp) {
  if (!running) return;
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  if (timestamp - lastSpawn > spawnInterval) {
    spawnKana();
    lastSpawn = timestamp;
    if (spawnInterval > 650) spawnInterval *= 0.985;
  }

  updateObjects(delta);
  draw();
  if (running) requestAnimationFrame(gameLoop);
}

function updateObjects(delta) {
  const dyFactor = (delta / 1000) * speedMultiplier;

  for (let i = 0; i < falling.length; i++) {
    const obj = falling[i];
    obj.y += obj.speed * dyFactor;
    obj.size = Math.min(obj.size + 0.015 * delta, 86);

    ctx.font = `${obj.size}px sans-serif`;
    const textWidth = ctx.measureText(obj.kana).width;

    const margin = 10;
    if (obj.x < margin) obj.x = margin;
    if (obj.x + textWidth > canvas.width - margin) {
      obj.x = Math.max(margin, canvas.width - textWidth - margin);
    }

    if (obj.y > canvas.height - defenseHeight - 4) {
      lastFailedKana = obj;
      running = false;
      showGameOver();
      return;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffe5e5';
  ctx.fillRect(0, canvas.height - defenseHeight, canvas.width, defenseHeight);

  ctx.fillStyle = '#ff2e2e';
  ctx.fillRect(0, canvas.height - defenseHeight, canvas.width, 2);

  for (const obj of falling) {
    ctx.font = `${obj.size}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#2d3136';
    ctx.fillText(obj.kana, obj.x, obj.y);
  }
}

function drawIdleScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffe5e5';
  ctx.fillRect(0, canvas.height - defenseHeight, canvas.width, defenseHeight);
  ctx.fillStyle = '#ff2e2e';
  ctx.fillRect(0, canvas.height - defenseHeight, canvas.width, 2);

  ctx.fillStyle = '#7a8694';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('按「開始」後開始遊戲', canvas.width / 2, canvas.height / 2 - 18);
  ctx.font = '18px sans-serif';
  ctx.fillText('可用實體鍵盤或下方虛擬鍵盤輸入', canvas.width / 2, canvas.height / 2 + 20);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function checkTypedBuffer() {
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
    const index = falling.indexOf(foundExact);
    if (index !== -1) {
      falling.splice(index, 1);
      score += 1;
      scoreEl.textContent = score;
      speakKana(foundExact.kana);

      if (score % 10 === 0) {
        level += 1;
        levelEl.textContent = level;
        speedMultiplier *= 1.12;
      }
    }
    typedBuffer = '';
    updateTypedDisplay();
  } else if (!foundPrefix) {
    typedBuffer = '';
    updateTypedDisplay();
  }
}

function speakKana(kana) {
  if (!audioUnlocked || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(kana);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}

function updateTypedDisplay() {
  typedEl.textContent = typedBuffer || '\u00a0';
}

function showGameOver() {
  if (lastFailedKana) {
    finalScoreEl.innerHTML = `
      您的分數：${score}<br><br>
      ❌ 你被擊中！<br>
      平假名：<span class="failed-kana">${lastFailedKana.kana}</span><br>
      讀音：<span class="failed-romaji">${lastFailedKana.romaji}</span>
    `;
  } else {
    finalScoreEl.textContent = `您的分數：${score}`;
  }

  gameOverEl.style.display = 'flex';
}

window.addEventListener('load', init);
