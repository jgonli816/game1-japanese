const API_BASE = "https://api.tj220728.icu";

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

let canvas, ctx, falling = [];
let spawnInterval = 1800, lastSpawn = 0, lastTime = 0, score = 0, level = 1, speedMultiplier = 1;
let typedBuffer = '', running = false, lastFailedKana = null, lastFailedLevel = 1;
let currentMode = localStorage.getItem('kanaGameMode') || 'hiragana';
let weakMap = loadWeakMap();
let inputType = 'unknown', currentPlayerName = '', gameOverLock = false;
const defenseHeight = 40;

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const typedEl = document.getElementById('typed');
const weakCountEl = document.getElementById('weakCount');
const modeTextEl = document.getElementById('modeText');
const inputTypeTextEl = document.getElementById('inputTypeText');
const playerNameTextEl = document.getElementById('playerNameText');
const playerNameInput = document.getElementById('playerName');
const menu = document.getElementById('menu');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const gameOverHintEl = document.getElementById('gameOverHint');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const spicyButton = document.getElementById('spicyButton');
const submitScoreButton = document.getElementById('submitScoreButton');
const backToMenuButton = document.getElementById('backToMenuButton');
const refreshLeaderboardButton = document.getElementById('refreshLeaderboardButton');
const loadLeaderboardButton = document.getElementById('loadLeaderboardButton');
const leaderboardModeEl = document.getElementById('leaderboardMode');
const leaderboardInputTypeEl = document.getElementById('leaderboardInputType');
const leaderboardStatusEl = document.getElementById('leaderboardStatus');
const leaderboardBodyEl = document.getElementById('leaderboardBody');
const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));

function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  const savedPlayerName = localStorage.getItem('kanaGamePlayerName') || '';
  playerNameInput.value = savedPlayerName;
  playerNameTextEl.textContent = savedPlayerName || '-';

  leaderboardModeEl.value = currentMode;

  startButton.addEventListener('click', () => startGame(1));
  restartButton.addEventListener('click', () => { if (!gameOverLock) startGame(1); });
  spicyButton.addEventListener('click', () => { if (!gameOverLock) spicyRestart(); });
  submitScoreButton.addEventListener('click', () => { if (!gameOverLock) submitScore(); });
  backToMenuButton.addEventListener('click', () => { if (!gameOverLock) backToMenu(); });
  refreshLeaderboardButton.addEventListener('click', () => loadLeaderboard());
  loadLeaderboardButton.addEventListener('click', () => loadLeaderboard());

  document.addEventListener('keydown', handlePhysicalKey);
  modeButtons.forEach(btn => btn.addEventListener('click', () => {
    currentMode = btn.dataset.mode;
    localStorage.setItem('kanaGameMode', currentMode);
    leaderboardModeEl.value = currentMode;
    updateModeUI();
  }));

  createVirtualKeyboard();
  updateModeUI();
  updateTypedDisplay();
  updateWeakCount();
  updateInputTypeUI();
  preloadVoices();
  drawIdleScreen();
  loadLeaderboard();
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
  } catch (e) { return {}; }
}
function saveWeakMap() {
  localStorage.setItem('kanaGameWeakMap', JSON.stringify(weakMap));
  updateWeakCount();
}
function updateWeakCount() { weakCountEl.textContent = Object.keys(weakMap).length; }
function updateModeUI() {
  const modeText = currentMode === 'hiragana' ? '平假名' : currentMode === 'katakana' ? '片假名' : '混合模式';
  modeTextEl.textContent = modeText;
  modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === currentMode));
}
function updateInputTypeUI() {
  inputTypeTextEl.textContent = inputType === 'unknown' ? '未判定' : inputType;
}
function getKanaMap() {
  if (currentMode === 'katakana') return katakanaMap;
  if (currentMode === 'mixed') return [...hiraganaMap, ...katakanaMap];
  return hiraganaMap;
}
function appendKey(parentId, label, value, className = '') {
  const parent = document.getElementById(parentId);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `keyboard-key ${className}`.trim();
  btn.textContent = label;
  btn.addEventListener('click', () => handleVirtualInput(value, true));
  parent.appendChild(btn);
}
function createVirtualKeyboard() {
  ['q','w','e','r','t','y','u','i','o','p'].forEach(k => appendKey('row1', k, k));
  ['a','s','d','f','g','h','j','k','l'].forEach(k => appendKey('row2', k, k));
  appendKey('row3', '⌫', 'backspace', 'special wide-15');
  ['z','x','c','v','b','n','m'].forEach(k => appendKey('row3', k, k));
  appendKey('row3', '清除', 'clear', 'special wide-15');
  appendKey('row4', '提交分數', 'submit', 'special');
  appendKey('row4', '重開', 'restart', 'special');
  appendKey('row4', '選模式', 'menu', 'special');
}
function markInputType(type) {
  if (inputType === 'unknown') {
    inputType = type;
    updateInputTypeUI();
  }
}
function handleVirtualInput(value, fromVirtual = false) {
  if (fromVirtual && /^[a-z]$/.test(value)) markInputType('virtual');
  if (value === 'submit') { if (!running && !gameOverLock) submitScore(); return; }
  if (value === 'restart') { if (!gameOverLock) startGame(1); return; }
  if (value === 'menu') { if (!gameOverLock) backToMenu(); return; }
  if (value === 'clear') { typedBuffer = ''; updateTypedDisplay(); return; }
  if (!running) return;
  if (value === 'backspace') { typedBuffer = typedBuffer.slice(0, -1); updateTypedDisplay(); return; }
  if (/^[a-z]$/.test(value)) { typedBuffer += value; updateTypedDisplay(); checkTypedBuffer(); }
}
function handlePhysicalKey(e) {
  const key = e.key.toLowerCase();
  if (!running) return;
  if (key === 'backspace') { e.preventDefault(); handleVirtualInput('backspace'); return; }
  if (/^[a-z]$/.test(key)) { markInputType('physical'); handleVirtualInput(key); }
}
function levelToSpawnInterval(targetLevel) { return Math.max(650, 1800 - (targetLevel - 1) * 140); }
function levelToSpeedMultiplier(targetLevel) { return 1 + (targetLevel - 1) * 0.12; }
function startGame(startLevel = 1) {
  currentPlayerName = (playerNameInput.value.trim() || 'Player').slice(0, 20);
  localStorage.setItem('kanaGamePlayerName', currentPlayerName);
  playerNameInput.value = currentPlayerName;
  playerNameTextEl.textContent = currentPlayerName;
  inputType = 'unknown';
  updateInputTypeUI();
  gameOverLock = false;
  unlockGameOverButtons();
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
function spicyRestart() { startGame(Math.max(1, lastFailedLevel - 1)); }
function backToMenu() {
  running = false;
  gameOverEl.style.display = 'none';
  menu.style.display = 'flex';
  drawIdleScreen();
}
async function submitScore() {
  const entry = {
    name: currentPlayerName || 'Player',
    score, mode: currentMode, level: lastFailedLevel,
    inputType, failedKana: lastFailedKana ? lastFailedKana.kana : '',
    failedRomaji: lastFailedKana ? lastFailedKana.romaji : ''
  };
  try {
    submitScoreButton.disabled = true;
    const res = await fetch(`${API_BASE}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "提交失敗");
    alert(`已提交分數\n玩家：${entry.name}\n分數：${entry.score}\n輸入方式：${entry.inputType}`);
    await loadLeaderboard(currentMode, inputType === 'unknown' ? 'virtual' : inputType);
  } catch (e) {
    alert(`提交失敗：${e.message}`);
  } finally {
    submitScoreButton.disabled = false;
  }
}
async function loadLeaderboard(mode = leaderboardModeEl.value, inputType = leaderboardInputTypeEl.value) {
  leaderboardStatusEl.textContent = "載入排行榜中…";
  leaderboardBodyEl.innerHTML = `<tr><td colspan="6">載入中…</td></tr>`;
  try {
    const res = await fetch(`${API_BASE}/leaderboard?mode=${encodeURIComponent(mode)}&inputType=${encodeURIComponent(inputType)}&limit=10`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("排行榜格式錯誤");

    leaderboardModeEl.value = mode;
    leaderboardInputTypeEl.value = inputType;

    if (data.length === 0) {
      leaderboardBodyEl.innerHTML = `<tr><td colspan="6">暫無資料</td></tr>`;
      leaderboardStatusEl.textContent = `排行榜已載入：${mode} / ${inputType}（暫無資料）`;
      return;
    }

    leaderboardBodyEl.innerHTML = data.map((row, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(row.name || "-")}</td>
        <td>${row.score ?? "-"}</td>
        <td>${row.level ?? "-"}</td>
        <td>${escapeHtml(row.input_type || "-")}</td>
        <td>${formatTime(row.created_at)}</td>
      </tr>
    `).join("");

    leaderboardStatusEl.textContent = `排行榜已載入：${mode} / ${inputType}`;
  } catch (e) {
    leaderboardBodyEl.innerHTML = `<tr><td colspan="6">讀取失敗</td></tr>`;
    leaderboardStatusEl.textContent = `排行榜載入失敗：${e.message}`;
  }
}
function getWeightedKana(map) {
  const pool = [];
  for (const item of map) {
    let weight = 1 + Math.min((weakMap[item.kana] || 0) * 2, 8);
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
  falling.push({ kana: item.kana, romaji: item.romaji, x: randomBetween(minX, maxX), y: -initialSize, speed: randomBetween(28, 44), size: initialSize });
}
function randomBetween(min, max) { return Math.random() * (max - min) + min; }
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
    if (obj.x + textWidth > canvas.width - margin) obj.x = Math.max(margin, canvas.width - textWidth - margin);
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
  ctx.fillText('先輸入名稱、選模式，再按「開始遊戲」', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '18px sans-serif';
  ctx.fillText('輸入方式會自動判定為 physical 或 virtual', canvas.width / 2, canvas.height / 2 + 20);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}
function checkTypedBuffer() {
  let foundExact = null, foundPrefix = false;
  for (const obj of falling) {
    if (obj.romaji.startsWith(typedBuffer)) {
      foundPrefix = true;
      if (obj.romaji === typedBuffer) { foundExact = obj; break; }
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
function updateTypedDisplay() { typedEl.textContent = typedBuffer || '\u00a0'; }
function lockGameOverButtons() {
  restartButton.disabled = true; spicyButton.disabled = true; submitScoreButton.disabled = true; backToMenuButton.disabled = true;
}
function unlockGameOverButtons() {
  restartButton.disabled = false; spicyButton.disabled = false; submitScoreButton.disabled = false; backToMenuButton.disabled = false;
}
function showGameOver() {
  if (lastFailedKana) {
    finalScoreEl.innerHTML = `玩家：${currentPlayerName || 'Player'}<br>分數：${score}<br>死亡難度：${lastFailedLevel}<br>輸入方式：${inputType}<br><br>❌ 擊中你的假名是：<br><span class="bigKana">${lastFailedKana.kana}</span><br>羅馬字拼音：<b>${lastFailedKana.romaji}</b><br>已記錄為弱點字，之後會較常出現。`;
    speakKana(lastFailedKana.kana);
  } else {
    finalScoreEl.textContent = `您的分數：${score}`;
  }
  gameOverLock = true;
  gameOverHintEl.textContent = '請先查看成績與致死假名…';
  lockGameOverButtons();
  gameOverEl.style.display = 'flex';
  setTimeout(() => {
    unlockGameOverButtons();
    gameOverLock = false;
    gameOverHintEl.textContent = '現在可提交分數、重新開始、加辣或返回主畫面。';
  }, 1500);
}
function speakKana(kana) {
  try {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(kana);
    utter.lang = 'ja-JP'; utter.rate = 0.95; utter.pitch = 1.0;
    const voices = synth.getVoices();
    const jaVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ja'));
    if (jaVoice) utter.voice = jaVoice;
    synth.speak(utter);
  } catch (e) {
    console.log('speech error', e);
  }
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function formatTime(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
window.addEventListener('load', init);
