const logEl = document.getElementById("log");
const nodes = document.querySelectorAll(".node");
const progressLine = document.getElementById("progressLine");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const stage = document.getElementById("stage");
const hero = document.getElementById("hero");
const enemy = document.getElementById("enemy");
const gameContainer = document.getElementById("gameContainer");
const flash = document.getElementById("flash");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg, type = "info") {
  const line = document.createElement("div");
  line.className = `log-line ${type}`;
  line.innerHTML = msg;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function setNodeActive(step) {
  nodes.forEach((n, i) => {
    n.classList.remove("active");
    if (i === step) n.classList.add("active");
  });
  const percent = (step / (nodes.length - 1)) * 100;
  progressLine.style.width = `calc(${percent}% - 20px)`;
}

function setNodeDone(step) {
  if (nodes[step]) {
    nodes[step].classList.remove("active");
    nodes[step].classList.add("done");
  }
}

function setNodeFailed(step) {
  if (nodes[step]) {
    nodes[step].classList.remove("active");
    nodes[step].classList.add("failed");
  }
}

function changeBg(themeClass) {
  stage.className = "stage " + themeClass;
}

function resetUI() {
  logEl.innerHTML = "";
  nodes.forEach((n) => n.classList.remove("active", "done", "failed"));
  progressLine.style.width = "0";
  startBtn.disabled = false;

  hero.className = "entity hero";
  enemy.className = "entity enemy";
  hero.style.left = "15%";
  enemy.style.left = "75%";
  changeBg("bg-library");
}

function shakeScreen() {
  gameContainer.classList.add("shake");
  flash.classList.add("active");
  setTimeout(() => {
    gameContainer.classList.remove("shake");
    flash.classList.remove("active");
  }, 400);
}

function showDamage(targetEl, amount) {
  const rect = targetEl.getBoundingClientRect();
  const parentRect = stage.getBoundingClientRect();

  const div = document.createElement("div");
  div.className = "float-text";
  div.textContent = "-" + amount;
  div.style.left = rect.left - parentRect.left + rect.width / 2 - 15 + "px";
  div.style.top = rect.top - parentRect.top + "px";
  stage.appendChild(div);
  setTimeout(() => div.remove(), 800);
}

function explode(targetEl) {
  const rect = targetEl.getBoundingClientRect();
  const parentRect = stage.getBoundingClientRect();
  const cx = rect.left - parentRect.left + rect.width / 2;
  const cy = rect.top - parentRect.top + rect.height / 2;

  const colors = ["#ffd700", "#ff8c00", "#fff", "#4dd2ff", "#ff4d4d"];

  for (let i = 0; i < 40; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = cx + "px";
    p.style.top = cy + "px";

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 200;
    p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    p.style.setProperty("--dy", Math.sin(angle) * dist + "px");

    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.background = color;
    p.style.boxShadow = `0 0 15px ${color}`;

    stage.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

async function fightSequence(enemyEmoji, enemyName, maxHp) {
  enemy.textContent = enemyEmoji;
  enemy.style.opacity = "1";

  let enemyHp = maxHp;
  let heroHp = 100;

  log(`⚔️ 遭遇了 ${enemyName}！战斗开始！`, "event");
  await sleep(1000);

  while (enemyHp > 0) {
    // 骑士攻击
    hero.classList.add("attacking");
    await sleep(300);
    hero.classList.remove("attacking");

    const dmg = Math.floor(Math.random() * 15 + 15);
    enemyHp -= dmg;
    showDamage(enemy, dmg);

    // 怪物受击闪烁
    enemy.classList.add("enemy-hurt");
    setTimeout(() => enemy.classList.remove("enemy-hurt"), 300);

    // 怪物反击
    if (Math.random() < 0.5) {
      await sleep(400);

      enemy.style.transform = "translateX(-40px) scale(1.2)";
      await sleep(200);
      enemy.style.transform = "";

      hero.classList.add("hero-hurt");
      shakeScreen();

      const enemyDmg = Math.floor(Math.random() * 10 + 20);
      heroHp -= enemyDmg;
      showDamage(hero, enemyDmg);
      log(`💥 骑士被 ${enemyName} 击中，损失 ${enemyDmg} 体力。`, "error");

      await sleep(500);
      hero.classList.remove("hero-hurt");

      if (heroHp <= 0) throw new Error("体力耗尽，骑士倒下了...");
    }
    await sleep(600);
  }

  enemy.classList.add("dead");
  log(`🎉 骑士击败了 ${enemyName}！`, "success");
  await sleep(800);

  enemy.style.opacity = "0";
  enemy.className = "entity enemy";
}

async function startGame() {
  startBtn.disabled = true;
  resetUI();

  try {
    setNodeActive(0);
    changeBg("bg-library");
    hero.classList.add("walking");
    await sleep(1000);
    hero.classList.remove("walking");
    log("📜 在古老的图书馆里找到了第一个线索...", "success");
    setNodeDone(0);

    setNodeActive(1);
    log("🔤 正在解码古老文字...", "info");
    await sleep(1000);
    log("🔤 解码成功! 宝藏在一座古老的神庙中...", "success");
    setNodeDone(1);

    changeBg("bg-swamp");
    log("🌿 骑士踏入了危险的沼泽...", "info");
    hero.classList.add("walking");
    hero.style.left = "40%";
    await sleep(1200);

    if (Math.random() < 0.6) {
      shakeScreen();
      hero.classList.add("hero-hurt");
      showDamage(hero, 15);
      log("🌿 糟糕！踩空掉进了沼泽！损失 15 体力。", "error");
      await sleep(800);
      hero.classList.remove("hero-hurt");
    } else {
      log("🌿 有惊无险，成功跨越沼泽。", "success");
    }
    hero.classList.remove("walking");

    changeBg("bg-pirate");
    hero.style.left = "20%";
    await sleep(500);
    await fightSequence("🏴‍☠️", "海盗船长", 50);

    setNodeActive(2);
    changeBg("bg-temple");
    hero.classList.add("walking");
    hero.style.left = "20%";
    await sleep(1000);
    hero.classList.remove("walking");

    await fightSequence("🗿", "神庙守卫", 60);
    setNodeDone(2);

    setNodeActive(3);
    changeBg("bg-treasure");
    enemy.textContent = "🧰";
    enemy.style.opacity = "1";
    enemy.style.left = "60%";
    log("📦 骑士走向古老的宝箱...", "info");
    await sleep(1000);

    enemy.classList.add("treasure-open");
    log("🗝️ 用神圣钥匙打开了宝箱...", "info");
    await sleep(800);
    explode(enemy);
    await sleep(500);
    setNodeDone(3);

    setNodeActive(4);
    enemy.textContent = "💎";
    log("💎 🎉 恭喜！骑士找到了传说中的璀璨宝藏！", "treasure");
    await sleep(1500);
    setNodeDone(4);
    log("🎊 寻宝成功！你成为了传说中的圣骑士！", "treasure");
  } catch (error) {
    log("❌ 寻宝失败: " + error.message, "error");
    nodes.forEach((n) => {
      if (n.classList.contains("active"))
        setNodeFailed(parseInt(n.dataset.step));
    });
  } finally {
    startBtn.disabled = false;
  }
}

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetUI);

resetUI();
