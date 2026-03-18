const hiraganaMap = [
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

const katakanaMap = [
  { kana: 'ア', romaji: 'a' }, { kana: 'イ', romaji: 'i' }, { kana: 'ウ', romaji: 'u' }, { kana: 'エ', romaji: 'e' }, { kana: 'オ', romaji: 'o' },
  { kana: 'カ', romaji: 'ka' }, { kana: 'キ', romaji: 'ki' }, { kana: 'ク', romaji: 'ku' }, { kana: 'ケ', romaji: 'ke' }, { kana: 'コ', romaji: 'ko' },
  { kana: 'サ', romaji: 'sa' }, { kana: 'シ', romaji: 'shi' }, { kana: 'ス', romaji: 'su' }, { kana: 'セ', romaji: 'se' }, { kana: 'ソ', romaji: 'so' },
  { kana: 'タ', romaji: 'ta' }, { kana: 'チ', romaji: 'chi' }, { kana: 'ツ', romaji: 'tsu' }, { kana: 'テ', romaji: 'te' }, { kana: 'ト', romaji: 'to' },
  { kana: 'ナ', romaji: 'na' }, { kana: 'ニ', romaji: 'ni' }, { kana: 'ヌ', romaji: 'nu' }, { kana: 'ネ', romaji: 'ne' }, { kana: 'ノ', romaji: 'no' },
  { kana: 'ハ', romaji: 'ha' }, { kana: 'ヒ', romaji: 'hi' }, { kana: 'フ', romaji: 'fu' }, { kana: 'ヘ', romaji: 'he' }, { kana: 'ホ', romaji: 'ho' },
  { kana: 'マ', romaji: 'ma' }, { kana: 'ミ', romaji: 'mi' }, { kana: 'ム', romaji: 'mu' }, { kana: 'メ', romaji: 'me' }, { kana: 'モ', romaji: 'mo' },
  { kana: 'ヤ', romaji: 'ya' }, { kana: 'ユ', romaji: 'yu' }, { kana: 'ヨ', romaji: 'yo' },
  { kana: 'ラ', romaji: 'ra' }, { kana: 'リ', romaji: 'ri' }, { kana: 'ル', romaji: 'ru' }, { kana: 'レ', romaji: 're' }, { kana: 'ロ', romaji: 'ro' },
  { kana: 'ワ', romaji: 'wa' }, { kana: 'ヲ', romaji: 'wo' }, { kana: 'ン', romaji: 'n' }
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
let lastFailedLevel = 1;
let currentMode = localStorage.getItem('kanaGameMode') || 'hiragana';
let weakMap = loadWeakMap();

const defenseHeight = 40;

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const typedEl = document.getElementById('typed');
const weakCountEl = document.getElementById('weakCount');
const modeTextEl = document.getElementById('modeText');
const menu = document.getElementById('menu');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const keyboardEl = document.getElementById('keyboard');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const spicyButton = document.getElementById('spicyButton');
const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));

function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  startButton.addEventListener('click', () => startGame(1));
  restartButton.addEventListener('click', () => startGame(1));
  spicyButton.addEventListener('click', spicyRestart);
  document.addEventListener('keydown', handlePhysicalKey);

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentMode = btn.dataset.mode;
      localStorage.setItem('kanaGameMode', currentMode);
      updateModeUI();
    });
  });

  createVirtualKeyboard();
  updateModeUI();
  updateTypedDisplay();
  updateWeakCount();
  preloadVoices();
  drawIdleScreen();
}

function preloadVoices() {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
}

function loadWeakMap() {
  try {
    const raw = localStorage.getItem('kanaGameWeakMap');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

function saveWeakMap() {
  localStorage.setItem('kanaGameWeakMap', JSON.stringify(weakMap));
  updateWeakCount();
}

function updateWeakCount() {
  weakCountEl.textContent = Object.keys(weakMap).length;
}

function updateModeUI() {
  const modeText = currentMode === 'hiragana' ? '平假名' : currentMode === 'katakana' ? '片假名' : '混合模式';
  modeTextEl.textContent = modeText;
  modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === currentMode));
}

function getKanaMap() {
  if (currentMode === 'katakana') return katakanaMap;
  if (currentMode === 'mixed') return [...hiraganaMap, ...katakanaMap];
  return hiraganaMap;
}

function createVirtualKeyboard() {
  keyboardEl.innerHTML = '';
  keyboardLayout.forEach((row, index) => {
    const rowEl = document.createElement('div');
    rowEl.className = `keyboard-row row-${row.length}`;
    row.forEach(key => rowEl.appendChild(makeKeyButton(key, key)));
    if (index === keyboardLayout.length - 1) {
      const backspaceBtn = makeKeyButton('⌫', 'backspace', true);
      backspaceBtn.classList.add('keyboard-wide');
      rowEl.appendChild(backspaceBtn);
    }
    keyboardEl.appendChild(rowEl);
  });

  const controlRow = document.createElement('div');
  controlRow.className = 'keyboard-row row-8';
  const clearBtn = makeKeyButton('清除', 'clear', true);
  clearBtn.classList.add('keyboard-wide');
  const restartBtn = makeKeyButton('重開', 'restart', true);
  restartBtn.classList.add('keyboard-wide');
  const menuBtn = makeKeyButton('選模式', 'menu', true);
  menuBtn.classList.add('keyboard-wide');
  controlRow.appendChild(clearBtn);
  controlRow.appendChild(restartBtn);
  controlRow.appendChild(menuBtn);
  keyboardEl.appendChild(controlRow);
}

function makeKeyButton(label, value, isSpecial = false) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'keyboard-key';
  if (isSpecial) btn.classList.add('special');
  btn.textContent = label;
  btn.addEventListener('click', () => handleVirtualInput(value));
  return btn;
}

function handleVirtualInput(value) {
  if (value === 'restart') { startGame(1); return; }
  if (value === 'menu') {
    running = false;
    gameOverEl.style.display = 'none';
    menu.style.display = 'flex';
    drawIdleScreen();
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
  if (/^[a-z]$/.test(key)) handleVirtualInput(key);
}

function levelToSpawnInterval(targetLevel) {
  return Math.max(650, 1800 - (targetLevel - 1) * 140);
}

function levelToSpeedMultiplier(targetLevel) {
  return 1 + (targetLevel - 1) * 0.12;
}

function startGame(startLevel = 1) {
  falling = [];
  score = 0;
  level = Math.max(1, startLevel);
  spawnInterval = levelToSpawnInterval(level);
  speedMultiplier = levelToSpeedMultiplier(level);
  typedBuffer = '';
  lastSpawn = 0;
  lastTime = 0;
  lastFailedKana = null;
  running = true;

  scoreEl.textContent = score;
  levelEl.textContent = level;
  updateModeUI();
  updateTypedDisplay();
  menu.style.display = 'none';
  gameOverEl.style.display = 'none';

  requestAnimationFrame(gameLoop);
}

function spicyRestart() {
  startGame(Math.max(1, lastFailedLevel - 1));
}

function getWeightedKana(map) {
  const pool = [];
  for (const item of map) {
    let weight = 1;
    const weakCount = weakMap[item.kana] || 0;
    weight += Math.min(weakCount * 2, 8);
    for (let i = 0; i < weight; i++) pool.push(item);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function spawnKana() {
  const item = getWeightedKana(getKanaMap());
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
      lastFailedLevel = level;
      weakMap[obj.kana] = (weakMap[obj.kana] || 0) + 1;
      saveWeakMap();
      running = false;
      showGameOver();
      return;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffe7e7';
  ctx.fillRect(0, canvas.height - defenseHeight, canvas.width, defenseHeight);
  ctx.fillStyle = '#ff3434';
  ctx.fillRect(0, canvas.height - defenseHeight, canvas.width, 2);

  for (const obj of falling) {
    ctx.font = `${obj.size}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#2b3138';
    ctx.fillText(obj.kana, obj.x, obj.y);
  }
}

function drawIdleScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fafcff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffe7e7';
  ctx.fillRect(0, canvas.height - defenseHeight, canvas.width, defenseHeight);
  ctx.fillStyle = '#ff3434';
  ctx.fillRect(0, canvas.height - defenseHeight, canvas.width, 2);

  ctx.fillStyle = '#758292';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('先選模式，再按「開始遊戲」', canvas.width / 2, canvas.height / 2 - 20);
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
      speakKana(foundExact.kana);
      falling.splice(index, 1);
      score += 1;
      scoreEl.textContent = score;

      if (score % 10 === 0) {
        level += 1;
        levelEl.textContent = level;
        speedMultiplier = levelToSpeedMultiplier(level);
        spawnInterval = Math.max(650, spawnInterval * 0.92);
      }
    }
    typedBuffer = '';
    updateTypedDisplay();
  } else if (!foundPrefix) {
    typedBuffer = '';
    updateTypedDisplay();
  }
}

function updateTypedDisplay() {
  typedEl.textContent = typedBuffer || '\u00a0';
}

function showGameOver() {
  if (lastFailedKana) {
    finalScoreEl.innerHTML = `
      您的分數：${score}<br>
      死亡難度：${lastFailedLevel}<br><br>
      ❌ 擊中你的假名是：<br>
      <span class="bigKana">${lastFailedKana.kana}</span><br>
      羅馬字拼音：<b>${lastFailedKana.romaji}</b><br>
      已記錄為弱點字，之後會較常出現。
    `;
    speakKana(lastFailedKana.kana);
  } else {
    finalScoreEl.textContent = `您的分數：${score}`;
  }
  gameOverEl.style.display = 'flex';
}

function speakKana(kana) {
  try {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(kana);
    utter.lang = 'ja-JP';
    utter.rate = 0.95;
    utter.pitch = 1.0;

    const voices = synth.getVoices();
    const jaVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ja'));
    if (jaVoice) utter.voice = jaVoice;

    synth.speak(utter);
  } catch (e) {
    console.log('speech error', e);
  }
}

window.addEventListener('load', init);
