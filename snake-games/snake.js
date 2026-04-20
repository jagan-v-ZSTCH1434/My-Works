/* ============================================================
   SNAKE 3D — Game Logic
   Features: 3D canvas rendering, levels, special food,
   combo streak, particle explosions, screen shake,
   background particles, touch/swipe support, local storage
============================================================ */
'use strict';

// ─── Canvas & Context ─────────────────────────────────────
const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
const W       = canvas.width;
const H       = canvas.height;
const COLS    = 20;
const ROWS    = 20;
const CELL    = W / COLS;   // 24px

// ─── Game State ───────────────────────────────────────────
let snake, dir, nextDir, food, specialFood;
let score, highScore, level, combo;
let gameLoop, gameRunning, gamePaused;
let frameCount, specialTimer;
let shake = 0;
let tiltX = 0, tiltY = 0;

// ─── Settings ─────────────────────────────────────────────
const THEMES = {
  neon:   { head1: '#80ffb0', head2: '#00ff88', glow: '#00ff88',  body1: [0,207,255],   body2: [0,100,255] },
  cyan:   { head1: '#88eeff', head2: '#00cfff', glow: '#00cfff',  body1: [0,150,255],   body2: [0,50,200]  },
  purple: { head1: '#d4aaff', head2: '#bf7fff', glow: '#a855f7',  body1: [180,100,255], body2: [100,0,200] },
  orange: { head1: '#ffee88', head2: '#ffaa00', glow: '#ffaa00',  body1: [255,140,0],   body2: [200,60,0]  },
  red:    { head1: '#ff9999', head2: '#ff4466', glow: '#ff4466',  body1: [255,80,80],   body2: [160,0,30]  },
  pink:   { head1: '#ffbbee', head2: '#ff88cc', glow: '#ff44aa',  body1: [255,100,200], body2: [180,0,120] },
};

let settings = {
  theme:       'neon',
  soundOn:     true,
  volume:      0.7,
};

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('snakeSettings') || '{}');
    if (s.theme   && THEMES[s.theme]) settings.theme   = s.theme;
    if (typeof s.soundOn  === 'boolean')  settings.soundOn  = s.soundOn;
    if (typeof s.volume   === 'number')   settings.volume   = s.volume;
  } catch(e) {}
}

function saveSettings() {
  localStorage.setItem('snakeSettings', JSON.stringify(settings));
}

loadSettings();

// ─── DOM refs ─────────────────────────────────────────────
const scoreEl     = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const levelEl     = document.getElementById('level');
const speedEl     = document.getElementById('speedLabel');
const streakFill  = document.getElementById('streakFill');
const comboCount  = document.getElementById('comboCount');
const finalScore  = document.getElementById('finalScore');
const finalLength = document.getElementById('finalLength');
const finalLevel  = document.getElementById('finalLevel');
const newHighMsg  = document.getElementById('newHighMsg');
const toastEl     = document.getElementById('toast');
const arenaScene  = document.getElementById('arenaScene');
const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

// ─── Particles (DOM score pops and explosions) ────────────
function spawnScorePop(x, y, text, color = '#00ff88') {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.textContent = text;
  el.style.left  = (x * CELL + CELL / 2) + 'px';
  el.style.top   = (y * CELL) + 'px';
  el.style.color = color;
  el.style.textShadow = `0 0 10px ${color}`;
  arenaScene.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function spawnExplosion(x, y, color = '#ff4466') {
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('div');
    el.className = 'explode-particle';
    const angle = (i / 10) * Math.PI * 2;
    const dist  = 30 + Math.random() * 30;
    const tx    = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
    el.style.left  = cx + 'px';
    el.style.top   = cy + 'px';
    el.style.background = color;
    el.style.boxShadow  = `0 0 8px ${color}`;
    el.style.setProperty('--tx', tx);
    arenaScene.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ─── Toast ────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

// ─── Screen Shake ─────────────────────────────────────────
function triggerShake(intensity = 8, duration = 300) {
  shake = intensity;
  setTimeout(() => shake = 0, duration);
}

// ─── Random food position (not on snake) ─────────────────
function randomPos(excludes = []) {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (excludes.some(e => e.x === pos.x && e.y === pos.y));
  return pos;
}

// ─── Speed by level ──────────────────────────────────────
function getSpeed(lvl) {
  // ms per frame: starts at 150ms, decreases per level
  return Math.max(70, 150 - (lvl - 1) * 12);
}

// ─── Init / Reset ─────────────────────────────────────────
function initGame() {
  snake     = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir       = { x: 1, y: 0 };
  nextDir   = { x: 1, y: 0 };
  score     = 0;
  level     = 1;
  combo     = 0;
  frameCount    = 0;
  specialFood   = null;
  specialTimer  = 0;
  food = randomPos(snake);

  highScore = parseInt(localStorage.getItem('snakeHigh') || '0');

  updateHUD();
  updateStreak();
  updateFoodPreview(false);
}

// ─── HUD update ──────────────────────────────────────────
function updateHUD() {
  scoreEl.textContent     = score;
  highScoreEl.textContent = Math.max(score, highScore);
  levelEl.textContent     = level;
  speedEl.textContent     = level + 'x';
}

function bumpStat(el) {
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 200);
}

function updateStreak() {
  const pct = Math.min((combo / 10) * 100, 100);
  streakFill.style.width = pct + '%';
  comboCount.textContent = combo;
}

function updateFoodPreview(isSpecial) {
  // food-dot element removed — no-op
}

// ─── Draw Helpers ─────────────────────────────────────────
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Draw Snake ───────────────────────────────────────────
function drawSnake() {
  const theme = THEMES[settings.theme];
  snake.forEach((seg, i) => {
    const px = seg.x * CELL;
    const py = seg.y * CELL;
    const pad = 2;
    const size = CELL - pad * 2;
    const progress = i / snake.length;

    if (i === 0) {
      // Head
      const grd = ctx.createLinearGradient(px, py, px + CELL, py + CELL);
      grd.addColorStop(0, theme.head1);
      grd.addColorStop(1, theme.head2);
      ctx.save();
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur  = 18;
      ctx.fillStyle   = grd;
      roundRect(px + pad, py + pad, size, size, 6);
      ctx.fill();

      // Eyes
      ctx.shadowBlur = 0;
      ctx.fillStyle  = '#000';
      const ew = 4, eh = 4;
      if (dir.x === 1) {
        ctx.fillRect(px + CELL - 8, py + 5, ew, eh);
        ctx.fillRect(px + CELL - 8, py + CELL - 9, ew, eh);
      } else if (dir.x === -1) {
        ctx.fillRect(px + 4, py + 5, ew, eh);
        ctx.fillRect(px + 4, py + CELL - 9, ew, eh);
      } else if (dir.y === -1) {
        ctx.fillRect(px + 5, py + 4, ew, eh);
        ctx.fillRect(px + CELL - 9, py + 4, ew, eh);
      } else {
        ctx.fillRect(px + 5, py + CELL - 8, ew, eh);
        ctx.fillRect(px + CELL - 9, py + CELL - 8, ew, eh);
      }
      ctx.restore();

    } else {
      // Body — gradient using theme colors
      const t = progress;
      const [r1, g1, b1] = theme.body1;
      const [r2, g2, b2] = theme.body2;
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);
      const alpha = 1 - t * 0.4;

      const grd = ctx.createLinearGradient(px, py, px + CELL, py + CELL);
      grd.addColorStop(0, `rgba(${Math.min(r+20,255)},${Math.min(g+20,255)},${Math.min(b+20,255)},${alpha})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},${alpha})`);

      ctx.save();
      ctx.shadowColor = `rgba(${r1},${g1},${b1},${0.4 - t * 0.3})`;
      ctx.shadowBlur  = 10;
      ctx.fillStyle   = grd;
      roundRect(px + pad + 1, py + pad + 1, size - 2, size - 2, 5);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle  = `rgba(255,255,255,${0.15 - t * 0.1})`;
      ctx.fillRect(px + pad + 2, py + pad + 1, size - 4, 3);
      ctx.restore();
    }
  });
}

// ─── Draw Food ────────────────────────────────────────────
function drawFood() {
  const px = food.x * CELL + CELL / 2;
  const py = food.y * CELL + CELL / 2;
  const pulse = Math.sin(frameCount * 0.12) * 2;
  const r = CELL / 2 - 3 + pulse;

  ctx.save();
  ctx.shadowColor = '#ff4466';
  ctx.shadowBlur  = 20 + pulse * 3;

  // Sphere gradient
  const grd = ctx.createRadialGradient(px - 3, py - 3, 1, px, py, r);
  grd.addColorStop(0, '#ff99aa');
  grd.addColorStop(0.6, '#ff4466');
  grd.addColorStop(1, '#990022');

  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();

  // 3D shine
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(px - r * 0.3, py - r * 0.35, r * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fill();
  ctx.restore();
}

// ─── Draw Special Food ────────────────────────────────────
function drawSpecialFood() {
  if (!specialFood) return;
  const px = specialFood.x * CELL + CELL / 2;
  const py = specialFood.y * CELL + CELL / 2;
  const pulse = Math.sin(frameCount * 0.18) * 2.5;
  const r = CELL / 2 - 2 + pulse;
  const timeLeft = specialTimer / 120; // fade out as timer drops

  ctx.save();
  ctx.globalAlpha = Math.max(0.3, timeLeft);
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur  = 25 + pulse * 4;

  const grd = ctx.createRadialGradient(px - 3, py - 3, 1, px, py, r);
  grd.addColorStop(0, '#ffee88');
  grd.addColorStop(0.6, '#ffaa00');
  grd.addColorStop(1, '#cc5500');

  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();

  // Star sparkle
  ctx.strokeStyle = 'rgba(255,220,50,0.6)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + frameCount * 0.05;
    const len = r * 1.4;
    ctx.beginPath();
    ctx.moveTo(px + Math.cos(angle) * r, py + Math.sin(angle) * r);
    ctx.lineTo(px + Math.cos(angle) * len, py + Math.sin(angle) * len);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(px - r * 0.3, py - r * 0.35, r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fill();
  ctx.restore();
}

// ─── Draw Grid ────────────────────────────────────────────
function drawGrid() {
  ctx.strokeStyle = 'rgba(0,255,136,0.04)';
  ctx.lineWidth   = 0.5;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, H);
    ctx.stroke();
  }
  for (let j = 0; j <= ROWS; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * CELL);
    ctx.lineTo(W, j * CELL);
    ctx.stroke();
  }
}

// ─── 3D Tilt (arena perspective) ─────────────────────────
function update3DTilt() {
  const head   = snake[0];
  const targetX = ((head.y / ROWS) - 0.5) * 6;
  const targetY = ((head.x / COLS) - 0.5) * -6;
  tiltX += (targetX - tiltX) * 0.05;
  tiltY += (targetY - tiltY) * 0.05;
  const floor = arenaScene.querySelector('.arena-floor');
  const tform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  floor.style.transform  = tform;
  canvas.style.transform = tform;
}

// ─── Main Render Frame ───────────────────────────────────
function render() {
  // Apply shake
  let sx = 0, sy = 0;
  if (shake > 0) {
    sx = (Math.random() - 0.5) * shake;
    sy = (Math.random() - 0.5) * shake;
  }
  ctx.save();
  ctx.translate(sx, sy);

  // Clear
  ctx.clearRect(-10, -10, W + 20, H + 20);

  drawGrid();
  drawFood();
  drawSpecialFood();
  drawSnake();

  ctx.restore();
  frameCount++;
}

// ─── Game Tick (movement + collision) ────────────────────
function tick() {
  dir = { ...nextDir };

  const head   = snake[0];
  const newHead = { x: head.x + dir.x, y: head.y + dir.y };

  // Wall collision
  if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
    return endGame();
  }

  // Self collision
  if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
    return endGame();
  }

  snake.unshift(newHead);

  // Check food
  let ate = false;
  let ateSpecial = false;

  if (newHead.x === food.x && newHead.y === food.y) {
    ate = true;
    combo++;
    const pts = 10 * level * (combo >= 5 ? 2 : 1);
    score += pts;
    playSound('eat');
    spawnScorePop(newHead.x, newHead.y, '+' + pts, '#00ff88');
    spawnExplosion(newHead.x, newHead.y, '#00ff88');
    food = randomPos(snake);

    // Level up every 5 foods
    if (snake.length % 5 === 0) {
      level++;
      playSound('levelup');
      showToast('⬆ LEVEL ' + level + '!');
      triggerShake(6, 200);
      clearInterval(gameLoop);
      gameLoop = setInterval(gameTick, getSpeed(level));
    }

    // Spawn special food every 8 eats
    if (snake.length % 8 === 3 && !specialFood) {
      specialFood  = randomPos([...snake, food]);
      specialTimer = 120; // ~12 seconds of ticks
      updateFoodPreview(true);
      showToast('⭐ BONUS FOOD!');
    }

    updateHUD();
    updateStreak();
    bumpStat(scoreEl);
  } else {
    // NOTE: combo is NOT reset here — it persists until death
    snake.pop();
  }

  // Check special food
  if (specialFood && newHead.x === specialFood.x && newHead.y === specialFood.y) {
    ateSpecial = true;
    const pts = 50 * level;
    score += pts;
    playSound('special');
    spawnScorePop(newHead.x, newHead.y, '+' + pts, '#ffaa00');
    spawnExplosion(newHead.x, newHead.y, '#ffaa00');
    specialFood = null;
    updateFoodPreview(false);
    updateHUD();
    bumpStat(scoreEl);
    showToast('💰 BONUS +' + pts + '!');
  }

  // Special food timer
  if (specialFood) {
    specialTimer--;
    if (specialTimer <= 0) {
      specialFood = null;
      updateFoodPreview(false);
    }
  }

  update3DTilt();
}

// ─── Game Tick (combined tick + render) ──────────────────
function gameTick() {
  if (!gameRunning || gamePaused) return;
  tick();
  render();
}

// ─── End Game ────────────────────────────────────────────
function endGame() {
  gameRunning = false;
  clearInterval(gameLoop);
  playSound('death');
  triggerShake(15, 500);
  spawnExplosion(snake[0].x, snake[0].y, '#ff4466');

  // Save high score
  const isNew = score > highScore;
  if (isNew) {
    highScore = score;
    localStorage.setItem('snakeHigh', highScore);
  }
  combo = 0;
  updateStreak();

  setTimeout(() => {
    finalScore.textContent  = score;
    finalLength.textContent = snake.length;
    finalLevel.textContent  = level;
    newHighMsg.style.display = isNew ? 'block' : 'none';
    gameOverScreen.style.display = 'flex';
  }, 600);
}

// ─── Controls ────────────────────────────────────────────
const DIR_MAP = {
  ArrowUp:    { x: 0,  y: -1 },
  ArrowDown:  { x: 0,  y:  1 },
  ArrowLeft:  { x: -1, y:  0 },
  ArrowRight: { x: 1,  y:  0 },
  w: { x: 0,  y: -1 },
  s: { x: 0,  y:  1 },
  a: { x: -1, y:  0 },
  d: { x: 1,  y:  0 },
  W: { x: 0,  y: -1 },
  S: { x: 0,  y:  1 },
  A: { x: -1, y:  0 },
  D: { x: 1,  y:  0 },
};

document.addEventListener('keydown', (e) => {
  const newDir = DIR_MAP[e.key];
  if (newDir) {
    e.preventDefault();
    // Prevent 180° reversal
    if (newDir.x !== -dir.x || newDir.y !== -dir.y) {
      nextDir = newDir;
    }
    highlightCtrlKey(e.key);
    return;
  }
  if (e.key === 'p' || e.key === 'P') togglePause();
  if (e.key === 'Escape') togglePause();
});

// ─── D-Pad buttons ───────────────────────────────────────
function setDir(dx, dy) {
  if (dx !== -dir.x || dy !== -dir.y) nextDir = { x: dx, y: dy };
}

document.getElementById('ctrlUp').addEventListener('click',    () => setDir(0, -1));
document.getElementById('ctrlDown').addEventListener('click',  () => setDir(0, 1));
document.getElementById('ctrlLeft').addEventListener('click',  () => setDir(-1, 0));
document.getElementById('ctrlRight').addEventListener('click', () => setDir(1, 0));

function highlightCtrlKey(key) {
  const map = {
    ArrowUp: 'ctrlUp', w: 'ctrlUp', W: 'ctrlUp',
    ArrowDown: 'ctrlDown', s: 'ctrlDown', S: 'ctrlDown',
    ArrowLeft: 'ctrlLeft', a: 'ctrlLeft', A: 'ctrlLeft',
    ArrowRight: 'ctrlRight', d: 'ctrlRight', D: 'ctrlRight',
  };
  const id = map[key];
  if (!id) return;
  const el = document.getElementById(id);
  el.classList.add('pressed');
  setTimeout(() => el.classList.remove('pressed'), 150);
}

// ─── Touch / Swipe ────────────────────────────────────────
let touchStartX = 0, touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    setDir(dx > 0 ? 1 : -1, 0);
  } else {
    setDir(0, dy > 0 ? 1 : -1);
  }
}, { passive: true });

// ─── Pause ───────────────────────────────────────────────
function togglePause() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
  pauseScreen.style.display = gamePaused ? 'flex' : 'none';
}

document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resumeBtn').addEventListener('click', togglePause);

// ─── Start / Restart ─────────────────────────────────────
function startGame() {
  initGame();
  gameRunning = true;
  gamePaused  = false;
  startScreen.style.display    = 'none';
  gameOverScreen.style.display = 'none';
  pauseScreen.style.display    = 'none';
  clearInterval(gameLoop);
  gameLoop = setInterval(gameTick, getSpeed(level));
  render();
}

document.getElementById('startBtn').addEventListener('click',   startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// ─── Web Audio Sound System ──────────────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playSound(type) {
  if (!settings.soundOn) return;
  try {
    const ac  = getAudioCtx();
    const vol = settings.volume;
    const now = ac.currentTime;

    const gain = ac.createGain();
    gain.connect(ac.destination);

    if (type === 'eat') {
      // Quick ascending blip
      const osc = ac.createOscillator();
      osc.type = 'square';
      osc.connect(gain);
      gain.gain.setValueAtTime(0.18 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.12);

    } else if (type === 'special') {
      // Longer sparkle sound
      [440, 550, 660, 880].forEach((freq, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = 'sine';
        o.connect(g); g.connect(ac.destination);
        const t = now + i * 0.05;
        g.gain.setValueAtTime(0.15 * vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.frequency.value = freq;
        o.start(t); o.stop(t + 0.12);
      });

    } else if (type === 'levelup') {
      // Ascending fanfare
      [261, 329, 392, 523].forEach((freq, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = 'triangle';
        o.connect(g); g.connect(ac.destination);
        const t = now + i * 0.1;
        g.gain.setValueAtTime(0.22 * vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.frequency.value = freq;
        o.start(t); o.stop(t + 0.18);
      });

    } else if (type === 'death') {
      // Descending glitchy noise
      const noise = ac.createOscillator();
      const ng = ac.createGain();
      noise.type = 'sawtooth';
      noise.connect(ng); ng.connect(ac.destination);
      ng.gain.setValueAtTime(0.3 * vol, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      noise.frequency.setValueAtTime(220, now);
      noise.frequency.exponentialRampToValueAtTime(40, now + 0.6);
      noise.start(now); noise.stop(now + 0.6);

    } else if (type === 'move') {
      // Very subtle tick
      const o = ac.createOscillator();
      o.type = 'sine';
      o.connect(gain);
      gain.gain.setValueAtTime(0.04 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      o.frequency.value = 200;
      o.start(now); o.stop(now + 0.03);
    }
  } catch(e) {}
}

// ─── Settings Modal ──────────────────────────────────────
const settingsBackdrop = document.getElementById('settingsBackdrop');
const soundToggle      = document.getElementById('soundToggle');
const volumeSlider     = document.getElementById('volumeSlider');
const volumeVal        = document.getElementById('volumeVal');
const colorGrid        = document.getElementById('colorGrid');
const previewCanvas    = document.getElementById('previewCanvas');
const pCtx             = previewCanvas.getContext('2d');

function openSettings() {
  // Sync UI to current settings
  soundToggle.checked    = settings.soundOn;
  volumeSlider.value     = Math.round(settings.volume * 100);
  volumeVal.textContent  = Math.round(settings.volume * 100) + '%';
  document.querySelectorAll('.color-swatch').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === settings.theme);
  });
  drawPreview();
  settingsBackdrop.classList.add('open');
  if (gameRunning && !gamePaused) togglePause();
}

function closeSettings() {
  settingsBackdrop.classList.remove('open');
}

function drawPreview() {
  const t  = THEMES[settings.theme];
  const pw = previewCanvas.width;
  const ph = previewCanvas.height;
  pCtx.clearRect(0, 0, pw, ph);

  // Background
  pCtx.fillStyle = '#12122a';
  pCtx.fillRect(0, 0, pw, ph);

  // Grid
  pCtx.strokeStyle = 'rgba(0,255,136,0.06)';
  pCtx.lineWidth = 0.5;
  for (let i = 0; i < pw; i += 10) { pCtx.beginPath(); pCtx.moveTo(i,0); pCtx.lineTo(i,ph); pCtx.stroke(); }
  for (let j = 0; j < ph; j += 10) { pCtx.beginPath(); pCtx.moveTo(0,j); pCtx.lineTo(pw,j); pCtx.stroke(); }

  // Draw a mini snake (5 segments)
  const segs = [{x:8,y:2},{x:7,y:2},{x:6,y:2},{x:5,y:2},{x:4,y:2}];
  const cell = 10;
  segs.forEach((seg, i) => {
    const px = seg.x * cell;
    const py = seg.y * cell;
    if (i === 0) {
      const grd = pCtx.createLinearGradient(px, py, px+cell, py+cell);
      grd.addColorStop(0, t.head1);
      grd.addColorStop(1, t.head2);
      pCtx.save();
      pCtx.shadowColor = t.glow;
      pCtx.shadowBlur  = 8;
      pCtx.fillStyle   = grd;
      pCtx.fillRect(px+1, py+1, cell-2, cell-2);
      pCtx.restore();
    } else {
      const progress = i / segs.length;
      const [r1,g1,b1] = t.body1;
      const [r2,g2,b2] = t.body2;
      const r = Math.round(r1+(r2-r1)*progress);
      const g = Math.round(g1+(g2-g1)*progress);
      const b = Math.round(b1+(b2-b1)*progress);
      pCtx.fillStyle = `rgba(${r},${g},${b},${1-progress*0.4})`;
      pCtx.fillRect(px+2, py+2, cell-4, cell-4);
    }
  });

  // Food
  const fx = 11*cell + cell/2, fy = 2*cell + cell/2;
  const grd = pCtx.createRadialGradient(fx-1,fy-1,1,fx,fy,4);
  grd.addColorStop(0,'#ff99aa'); grd.addColorStop(1,'#ff4466');
  pCtx.save();
  pCtx.shadowColor = '#ff4466'; pCtx.shadowBlur = 8;
  pCtx.beginPath(); pCtx.arc(fx,fy,4,0,Math.PI*2);
  pCtx.fillStyle = grd; pCtx.fill();
  pCtx.restore();
}

// Color swatches
colorGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.color-swatch');
  if (!btn) return;
  document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  settings.theme = btn.dataset.theme;
  drawPreview();
});

// Sound toggle
soundToggle.addEventListener('change', () => {
  settings.soundOn = soundToggle.checked;
});

// Volume
volumeSlider.addEventListener('input', () => {
  settings.volume = parseInt(volumeSlider.value) / 100;
  volumeVal.textContent = volumeSlider.value + '%';
});

// Open/close
document.getElementById('settingsBtn').addEventListener('click', openSettings);
document.getElementById('settingsClose').addEventListener('click', closeSettings);
document.getElementById('saveSettings').addEventListener('click', () => {
  saveSettings();
  closeSettings();
  showToast('✅ Settings saved!');
});

// Close on backdrop click
settingsBackdrop.addEventListener('click', (e) => {
  if (e.target === settingsBackdrop) closeSettings();
});

// ─── Background Particle Canvas ──────────────────────────
(function initBgParticles() {
  const bgCanvas = document.getElementById('bgCanvas');
  const bCtx     = bgCanvas.getContext('2d');

  function resize() {
    bgCanvas.width  = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const PCOUNT = 80;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * bgCanvas.width;
      this.y  = init ? Math.random() * bgCanvas.height : bgCanvas.height + 10;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(0.2 + Math.random() * 0.5);
      this.size  = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.4 + 0.05;
      const colors = ['0,255,136', '0,207,255', '124,58,237', '255,68,102'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10) this.reset();
    }
    draw() {
      bCtx.beginPath();
      bCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      bCtx.fillStyle = `rgba(${this.color},${this.alpha})`;
      bCtx.fill();
    }
  }

  for (let i = 0; i < PCOUNT; i++) particles.push(new Particle());

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          bCtx.beginPath();
          bCtx.strokeStyle = `rgba(0,255,136,${0.06 * (1 - dist / 100)})`;
          bCtx.lineWidth   = 0.5;
          bCtx.moveTo(particles[i].x, particles[i].y);
          bCtx.lineTo(particles[j].x, particles[j].y);
          bCtx.stroke();
        }
      }
    }
  }

  function animateBg() {
    bCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    requestAnimationFrame(animateBg);
  }
  animateBg();
})();

// ─── Continuous render loop ───────────────────────────────
function renderLoop() {
  if (!gameRunning || gamePaused) render();
  requestAnimationFrame(renderLoop);
}

// ─── Boot ─────────────────────────────────────────────────
initGame();
renderLoop();
highScoreEl.textContent = parseInt(localStorage.getItem('snakeHigh') || '0');
