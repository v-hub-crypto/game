/* ---------- SDK init ---------- */
const sdk = new OpenGameSDK({ ui: { usePointsWidget: true } });

(async () => {
  try {
    await sdk.init();
    console.log('SDK initialized');
  } catch (e) {
    console.error('SDK init error:', e);
  }
})();

/* ---------- Game state ---------- */
let points = 0;
let boostActive = false;
let boostMultiplier = 1;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const pointsEl = document.getElementById('pointsCount');

canvas.width = 500;
canvas.height = 700;

const frog = { x: 250, y: 550, size: 50 };

function drawFrog() {
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.arc(frog.x, frog.y, frog.size, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(frog.x - 15, frog.y - 25, 12, 0, Math.PI * 2);
  ctx.arc(frog.x + 15, frog.y - 25, 12, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(frog.x - 15, frog.y - 25, 6, 0, Math.PI * 2);
  ctx.arc(frog.x + 15, frog.y - 25, 6, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFrog();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  
  const dist = Math.hypot(x - frog.x, y - frog.y);
  if (dist < frog.size + 10) {
    const earned = 10 * boostMultiplier;
    points += earned;
    pointsEl.textContent = points;
    if (sdk && sdk.addPoints) sdk.addPoints(earned);
    
    if (!boostActive && Math.random() < 0.1) {
      boostActive = true;
      boostMultiplier = 2;
      document.getElementById('boost').classList.remove('hidden');
      setTimeout(() => {
        boostActive = false;
        boostMultiplier = 1;
        document.getElementById('boost').classList.add('hidden');
      }, 5000);
    }
  }
});

document.getElementById('claimBtn').addEventListener('click', async () => {
  if (sdk && sdk.endGame) await sdk.endGame({ score: points });
  alert(`Claimed ${points} points!`);
  points = 0;
  pointsEl.textContent = '0';
});

gameLoop();
