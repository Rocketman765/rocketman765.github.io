let balance = 1000;
let activeRocketBet = 0;

function updateBalance(amount) {
  balance += amount;
  document.getElementById("balance").innerText = Math.floor(balance);
}

function showGame(gameId) {
  const sections = document.querySelectorAll(".game-section");
  sections.forEach((sec) => sec.classList.remove("active"));
  document.getElementById(gameId).classList.add("active");
}

function getValidBet() {
  const betInput = document.getElementById("bet-amount").value;
  const bet = parseFloat(betInput);

  if (isNaN(bet) || bet <= 0) {
    alert("Будь ласка, введіть коректну суму ставки.");
    return 0;
  }

  if (bet > balance) {
    alert("Не можливо поставити ставку перевищуючи баланс!");
    return 0;
  }

  return bet;
}

// СЛОТИ 5x3
// СЛОТИ 5x3 з СУПЕР ГРОЮ
const baseSymbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "BAR", "⭐"]; // ⭐ - бонусний символ
const superSymbols = ["♦️", "💎", "🔮", "👑", "✨"]; // Рубіни та кристали для супер гри

let isSuperGameActive = false;
let superSpinsLeft = 0;
let accumulatedMultiplier = 0;
let initialBetForSuperGame = 0;

const gridElement = document.getElementById("slot-grid");
let cells = [];

// Ініціалізація початкової сітки
for (let i = 0; i < 15; i++) {
  const cell = document.createElement("div");
  cell.classList.add("slot-cell");
  cell.innerText = baseSymbols[Math.floor(Math.random() * baseSymbols.length)];
  gridElement.appendChild(cell);
  cells.push(cell);
}

function playSlots() {
  let currentBet = 0;

  // Перевірка ставки: якщо звичайна гра - знімаємо гроші, якщо Супер Гра - крутимо безкоштовно
  if (!isSuperGameActive) {
    currentBet = getValidBet();
    if (currentBet === 0) return;
    updateBalance(-currentBet);
  } else {
    currentBet = initialBetForSuperGame;
  }

  const btn = document.getElementById("spin-btn");
  btn.disabled = true;
  gridElement.classList.add("spinning");

  document.getElementById("slot-message").innerText = isSuperGameActive
    ? "Супер крутка..."
    : "Крутимо...";

  const currentSymbols = isSuperGameActive ? superSymbols : baseSymbols;

  let spinInterval = setInterval(() => {
    cells.forEach((cell) => {
      cell.innerText =
        currentSymbols[Math.floor(Math.random() * currentSymbols.length)];
    });
  }, 50);

  setTimeout(() => {
    clearInterval(spinInterval);
    gridElement.classList.remove("spinning");

    let finalGrid = [];
    cells.forEach((cell) => {
      const sym =
        currentSymbols[Math.floor(Math.random() * currentSymbols.length)];
      cell.innerText = sym;
      finalGrid.push(sym);
    });

    if (isSuperGameActive) {
      checkSuperWin(finalGrid, currentBet);
    } else {
      checkSlotWin(finalGrid, currentBet);
    }
  }, 2000);
}

function checkSlotWin(grid, bet) {
  let multiplier = 0;
  let bonusCount = 0;

  // Рахуємо кількість бонусних символів
  grid.forEach((sym) => {
    if (sym === "⭐") bonusCount++;
  });

  for (let row = 0; row < 3; row++) {
    const rStart = row * 5;
    const s1 = grid[rStart],
      s2 = grid[rStart + 1],
      s3 = grid[rStart + 2],
      s4 = grid[rStart + 3],
      s5 = grid[rStart + 4];
    if (s1 === s2 && s2 === s3 && s3 === s4 && s4 === s5) multiplier += 10;
    else if (s1 === s2 && s2 === s3 && s3 === s4) multiplier += 3;
    else if (s1 === s2 && s2 === s3) multiplier += 1;
  }

  const msg = document.getElementById("slot-message");
  const btn = document.getElementById("spin-btn");

  if (bonusCount >= 3) {
    msg.innerText =
      "⭐ БОНУС! Випало " + bonusCount + " символи! Запуск Супер Гри!";
    btn.disabled = true;
    // Даємо 5 спінів за 3 символи, 7 за 4 символи, 10 за 5 символів
    let spinsAwarded = bonusCount === 3 ? 5 : bonusCount === 4 ? 7 : 10;
    setTimeout(() => startSuperGame(bet, spinsAwarded), 2000);
  } else {
    const win = bet * multiplier;
    if (win > 0) {
      msg.innerText = "Виграш: " + win.toFixed(2) + " $!";
      updateBalance(win);
    } else {
      msg.innerText = "Спробуйте ще раз!";
    }
    btn.disabled = false;
  }
}

function startSuperGame(bet, spins) {
  isSuperGameActive = true;
  initialBetForSuperGame = bet;
  superSpinsLeft = spins;
  accumulatedMultiplier = 0;

  document.getElementById("super-game-info").classList.remove("hidden");
  document.getElementById("super-game-info").classList.add("active");
  document
    .getElementById("slot-grid")
    .parentElement.classList.add("super-mode");
  updateSuperUI();

  const btn = document.getElementById("spin-btn");
  btn.innerText = "Супер Спін";
  btn.disabled = false;
  document.getElementById("slot-message").innerText =
    "Супер гра почалась! Тисни кнопку.";
}

function updateSuperUI() {
  document.getElementById("super-spins-left").innerText = superSpinsLeft;
  document.getElementById("super-multiplier").innerText =
    "x" + accumulatedMultiplier;
}

function checkSuperWin(grid, bet) {
  let spinMultiplier = 0;

  for (let row = 0; row < 3; row++) {
    const rStart = row * 5;
    const s1 = grid[rStart],
      s2 = grid[rStart + 1],
      s3 = grid[rStart + 2],
      s4 = grid[rStart + 3],
      s5 = grid[rStart + 4];
    // У супер грі комбінації дають більші множники
    if (s1 === s2 && s2 === s3 && s3 === s4 && s4 === s5) spinMultiplier += 20;
    else if (s1 === s2 && s2 === s3 && s3 === s4) spinMultiplier += 8;
    else if (s1 === s2 && s2 === s3) spinMultiplier += 3;
  }

  if (spinMultiplier > 0) {
    accumulatedMultiplier += spinMultiplier;
    document.getElementById("slot-message").innerText =
      "🔥 Множник зріс на +" + spinMultiplier + "!";
  } else {
    document.getElementById("slot-message").innerText =
      "Немає збігів. Крути далі!";
  }

  superSpinsLeft--;
  updateSuperUI();

  if (superSpinsLeft <= 0) {
    document.getElementById("spin-btn").disabled = true;
    setTimeout(endSuperGame, 2000);
  } else {
    document.getElementById("spin-btn").disabled = false;
  }
}

function endSuperGame() {
  isSuperGameActive = false;
  document.getElementById("super-game-info").classList.add("hidden");
  document.getElementById("super-game-info").classList.remove("active");
  document
    .getElementById("slot-grid")
    .parentElement.classList.remove("super-mode");

  const totalWin = initialBetForSuperGame * accumulatedMultiplier;

  if (totalWin > 0) {
    updateBalance(totalWin);
    document.getElementById("slot-message").innerText =
      "💎 МЕГА ВИГРАШ: " + totalWin.toFixed(2) + " $! 💎";
  } else {
    document.getElementById("slot-message").innerText =
      "Супер гра завершена без виграшу :(";
  }

  const btn = document.getElementById("spin-btn");
  btn.innerText = "Крутити";
  btn.disabled = false;
}
// РАКЕТА (КРАШ)
let rocketInterval;
let currentMultiplier = 1.0;
let isFlying = false;

function startRocket() {
  if (isFlying) return;

  const bet = getValidBet();
  if (bet === 0) return;

  activeRocketBet = bet;
  updateBalance(-activeRocketBet);

  isFlying = true;
  currentMultiplier = 1.0;
  document.getElementById("start-rocket-btn").disabled = true;
  document.getElementById("cashout-btn").disabled = false;
  document.getElementById("rocket-message").innerText = "Ракета летить!";
  document.getElementById("rocket-ship").style.bottom = "10px";

  const crashPoint = (Math.random() * 4 + 1.1).toFixed(2);

  rocketInterval = setInterval(() => {
    currentMultiplier += 0.02;
    document.getElementById("multiplier-display").innerText =
      currentMultiplier.toFixed(2) + "x";
    document.getElementById("rocket-ship").style.bottom =
      currentMultiplier * 20 + "px";

    if (currentMultiplier >= crashPoint) {
      clearInterval(rocketInterval);
      isFlying = false;
      document.getElementById("rocket-message").innerText =
        "КРАШ! на " + currentMultiplier.toFixed(2) + "x";
      document.getElementById("multiplier-display").style.color = "#e74c3c";
      resetRocketControls();
    }
  }, 50);
}

function cashOutRocket() {
  if (!isFlying) return;
  clearInterval(rocketInterval);
  isFlying = false;
  const winAmount = activeRocketBet * currentMultiplier;
  updateBalance(winAmount);
  document.getElementById("rocket-message").innerText =
    "Ви забрали " + winAmount.toFixed(2) + " $!";
  resetRocketControls();
}

function resetRocketControls() {
  document.getElementById("start-rocket-btn").disabled = false;
  document.getElementById("cashout-btn").disabled = true;
  setTimeout(() => {
    document.getElementById("multiplier-display").style.color = "#ffb3d9";
    document.getElementById("rocket-ship").style.bottom = "10px";
  }, 2000);
}

// PLINKO ФІЗИКА НА CANVAS
const canvas = document.getElementById("plinko-canvas");
const ctx = canvas.getContext("2d");

const pegs = [];
const rows = 9;
const spacingX = 45;
const spacingY = 40;
const startY = 60;

for (let row = 0; row < rows; row++) {
  const cols = row + 4;
  const startX = canvas.width / 2 - ((cols - 1) * spacingX) / 2;
  for (let col = 0; col < cols; col++) {
    pegs.push({ x: startX + col * spacingX, y: startY + row * spacingY, r: 5 });
  }
}

const multipliers = [0, 0.5, 1.5, 3, 5, 3, 1.5, 0.5, 0];
const sectorWidth = canvas.width / multipliers.length;

let ball = null;
let plinkoAnimation;
let activePlinkoBet = 0;

function drawPlinko() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.shadowBlur = 8;
  ctx.shadowColor = "#ff69b4";
  ctx.fillStyle = "#ffe6f2";
  pegs.forEach((peg) => {
    ctx.beginPath();
    ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  for (let i = 0; i < multipliers.length; i++) {
    ctx.fillStyle =
      multipliers[i] > 1
        ? "#ff1493"
        : multipliers[i] === 0
          ? "#4a142c"
          : "#b0005a";
    ctx.fillRect(i * sectorWidth, canvas.height - 30, sectorWidth, 30);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#000000";
    ctx.fillText(
      multipliers[i] + "x",
      i * sectorWidth + sectorWidth / 2,
      canvas.height - 10,
    );
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#2b0f1a";
    ctx.strokeRect(i * sectorWidth, canvas.height - 30, sectorWidth, 30);
  }

  if (ball) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ffb3d9";
    ctx.fillStyle = "#ff69b4";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function updatePhysics() {
  if (!ball) return;

  ball.vy += ball.gravity;
  ball.x += ball.vx;
  ball.y += ball.vy;

  pegs.forEach((peg) => {
    const dx = ball.x - peg.x;
    const dy = ball.y - peg.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ball.r + peg.r) {
      const angle = Math.atan2(dy, dx);
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

      ball.vx =
        Math.cos(angle) * speed * ball.bounce + (Math.random() - 0.5) * 2;
      ball.vy = Math.sin(angle) * speed * ball.bounce;

      const overlap = ball.r + peg.r - distance;
      ball.x += Math.cos(angle) * overlap;
      ball.y += Math.sin(angle) * overlap;
    }
  });

  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.vx *= -1;
  }
  if (ball.x + ball.r > canvas.width) {
    ball.x = canvas.width - ball.r;
    ball.vx *= -1;
  }

  if (ball.y > canvas.height - 30) {
    cancelAnimationFrame(plinkoAnimation);
    const sectorIndex = Math.floor(ball.x / sectorWidth);
    const mult = multipliers[Math.min(sectorIndex, multipliers.length - 1)];
    const winAmount = activePlinkoBet * mult;
    updateBalance(winAmount);
    document.getElementById("plinko-message").innerText =
      "Множник: " + mult + "x! Виграш: " + winAmount.toFixed(2) + " $";
    document.getElementById("drop-btn").disabled = false;
    setTimeout(() => {
      ball = null;
      drawPlinko();
    }, 2000);
    return;
  }

  drawPlinko();
  plinkoAnimation = requestAnimationFrame(updatePhysics);
}

function playPlinko() {
  if (ball) return;

  const bet = getValidBet();
  if (bet === 0) return;

  activePlinkoBet = bet;
  updateBalance(-activePlinkoBet);

  document.getElementById("drop-btn").disabled = true;
  document.getElementById("plinko-message").innerText = "Кулька падає...";

  ball = {
    x: canvas.width / 2 + (Math.random() * 10 - 5),
    y: 10,
    vx: 0,
    vy: 0,
    r: 8,
    gravity: 0.07,
    bounce: 0.6,
  };

  updatePhysics();
}

drawPlinko();
