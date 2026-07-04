const themes = {
  catsDogs: {
    title: "猫狗大作战",
    subtitle: "双人同屏宠物冲冲冲",
    badge: "CD",
    left: {
      name: "猫猫队",
      base: "猫猫城堡",
      face: "ฅ",
      className: "cat",
      units: [
        { name: "闪电咪咪", icon: "🐱", cost: 2, hp: 4, atk: 1, speed: 1.55 },
        { name: "布丁小猫", icon: "😺", cost: 3, hp: 7, atk: 2, speed: 1.05 },
        { name: "飞跳猫", icon: "😸", cost: 4, hp: 5, atk: 3, speed: 1.35 },
      ],
    },
    right: {
      name: "狗狗队",
      base: "狗狗城堡",
      face: "ᴥ",
      className: "dog",
      units: [
        { name: "冲刺可可", icon: "🐶", cost: 2, hp: 5, atk: 1, speed: 1.35 },
        { name: "泡泡小狗", icon: "🐕", cost: 3, hp: 8, atk: 2, speed: 0.95 },
        { name: "勇气汪汪", icon: "🦮", cost: 4, hp: 6, atk: 3, speed: 1.1 },
      ],
    },
  },
  dinos: {
    title: "恐龙大作战",
    subtitle: "小恐龙守住自己的乐园",
    badge: "DR",
    left: {
      name: "三角龙队",
      base: "叶子堡垒",
      face: "△",
      className: "dinoLeft",
      units: [
        { name: "小角冲锋", icon: "🦕", cost: 2, hp: 5, atk: 1, speed: 1.25 },
        { name: "圆盾三角龙", icon: "🦕", cost: 3, hp: 9, atk: 2, speed: 0.82 },
        { name: "彩冠队长", icon: "🦖", cost: 4, hp: 6, atk: 3, speed: 1.08 },
      ],
    },
    right: {
      name: "霸王龙队",
      base: "火山堡垒",
      face: "▴",
      className: "dinoRight",
      units: [
        { name: "小霸王", icon: "🦖", cost: 2, hp: 4, atk: 2, speed: 1.15 },
        { name: "重脚霸王", icon: "🦖", cost: 3, hp: 8, atk: 2, speed: 0.9 },
        { name: "吼吼队长", icon: "🦖", cost: 4, hp: 7, atk: 3, speed: 1.0 },
      ],
    },
  },
  lizards: {
    title: "蜥蜴大作战",
    subtitle: "敏捷小队抢占三条甬道",
    badge: "LZ",
    left: {
      name: "绿蜥队",
      base: "树叶营地",
      face: "◇",
      className: "lizardLeft",
      units: [
        { name: "绿闪闪", icon: "🦎", cost: 2, hp: 4, atk: 1, speed: 1.65 },
        { name: "圆眼蜥", icon: "🦎", cost: 3, hp: 7, atk: 2, speed: 1.08 },
        { name: "长尾队长", icon: "🦎", cost: 4, hp: 5, atk: 3, speed: 1.45 },
      ],
    },
    right: {
      name: "蓝蜥队",
      base: "水晶营地",
      face: "◆",
      className: "lizardRight",
      units: [
        { name: "蓝点点", icon: "🦎", cost: 2, hp: 5, atk: 1, speed: 1.45 },
        { name: "厚背蜥", icon: "🦎", cost: 3, hp: 8, atk: 2, speed: 0.95 },
        { name: "冰尾队长", icon: "🦎", cost: 4, hp: 6, atk: 3, speed: 1.18 },
      ],
    },
  },
};

const state = {
  themeId: "catsDogs",
  running: false,
  maxEnergy: 10,
  baseMaxHp: 14,
  sides: {
    left: { energy: 6, baseHp: 14, score: 0, lane: 1, cardKey: "" },
    right: { energy: 6, baseHp: 14, score: 0, lane: 1, cardKey: "" },
  },
  units: [],
  lastFrame: 0,
  lastEnergyTick: 0,
  nextUnitId: 1,
};

const lanePositions = [24, 50, 76];
const laneNames = ["上路", "中路", "下路"];
const sideOrder = ["left", "right"];
const controls = {
  left: {
    lanes: ["Q", "W", "E"],
    units: ["A", "S", "D"],
  },
  right: {
    lanes: ["U", "I", "O"],
    units: ["J", "K", "L"],
  },
};

const dom = {
  stage: document.querySelector("#battleStage"),
  lanes: document.querySelector("#battleLanes"),
  themeButtons: document.querySelector("#themeButtons"),
  gameTitle: document.querySelector("#gameTitle"),
  gameSubtitle: document.querySelector("#gameSubtitle"),
  themeBadge: document.querySelector("#themeBadge"),
  roundState: document.querySelector("#roundState"),
  startButton: document.querySelector("#startButton"),
  resetButton: document.querySelector("#resetButton"),
  leftScore: document.querySelector("#leftScore"),
  rightScore: document.querySelector("#rightScore"),
  leftScoreLabel: document.querySelector("#leftScoreLabel"),
  rightScoreLabel: document.querySelector("#rightScoreLabel"),
  leftBaseHp: document.querySelector("#leftBaseHp"),
  rightBaseHp: document.querySelector("#rightBaseHp"),
  leftBaseFace: document.querySelector("#leftBaseFace"),
  rightBaseFace: document.querySelector("#rightBaseFace"),
  leftBaseName: document.querySelector("#leftBaseName"),
  rightBaseName: document.querySelector("#rightBaseName"),
  leftPanelName: document.querySelector("#leftPanelName"),
  rightPanelName: document.querySelector("#rightPanelName"),
  leftEnergyText: document.querySelector("#leftEnergyText"),
  rightEnergyText: document.querySelector("#rightEnergyText"),
  leftEnergyFill: document.querySelector("#leftEnergyFill"),
  rightEnergyFill: document.querySelector("#rightEnergyFill"),
  leftLanePicker: document.querySelector("#leftLanePicker"),
  rightLanePicker: document.querySelector("#rightLanePicker"),
  leftStrategyGrid: document.querySelector("#leftStrategyGrid"),
  rightStrategyGrid: document.querySelector("#rightStrategyGrid"),
};

function getTheme() {
  return themes[state.themeId];
}

function setupLanes() {
  dom.lanes.innerHTML = "";
  lanePositions.forEach((top, index) => {
    const lane = document.createElement("button");
    lane.className = "lane-line";
    lane.type = "button";
    lane.dataset.lane = index;
    lane.style.top = `${top}%`;
    lane.setAttribute("aria-label", laneNames[index]);
    lane.addEventListener("click", () => {
      state.sides.left.lane = index;
      state.sides.right.lane = index;
      invalidatePanels();
      updateHud();
    });
    dom.lanes.appendChild(lane);
  });
}

function renderThemeButtons() {
  dom.themeButtons.innerHTML = "";
  Object.entries(themes).forEach(([themeId, theme]) => {
    const button = document.createElement("button");
    button.className = `theme-button ${themeId === state.themeId ? "active" : ""}`;
    button.type = "button";
    button.dataset.theme = themeId;
    button.textContent = theme.title;
    button.addEventListener("click", () => switchTheme(themeId));
    dom.themeButtons.appendChild(button);
  });
}

function renderLanePicker(side) {
  const picker = dom[`${side}LanePicker`];
  picker.innerHTML = "";
  laneNames.forEach((name, laneIndex) => {
    const button = document.createElement("button");
    button.className = `lane-button ${state.sides[side].lane === laneIndex ? "active" : ""}`;
    button.type = "button";
    button.innerHTML = `<span>${controls[side].lanes[laneIndex]}</span>${name}`;
    button.addEventListener("click", () => {
      state.sides[side].lane = laneIndex;
      invalidatePanels();
      updateHud();
    });
    picker.appendChild(button);
  });
}

function renderStrategyCards(side) {
  const themeSide = getTheme()[side];
  const sideState = state.sides[side];
  const cardKey = `${state.themeId}:${side}:${state.running}:${Math.floor(sideState.energy)}:${sideState.lane}`;
  if (sideState.cardKey === cardKey) return;
  sideState.cardKey = cardKey;

  const grid = dom[`${side}StrategyGrid`];
  grid.innerHTML = "";

  themeSide.units.forEach((unit, index) => {
    const card = document.createElement("button");
    card.className = `strategy-card ${side}`;
    card.type = "button";
    card.disabled = !state.running || sideState.energy < unit.cost;
    card.innerHTML = `
      <div class="pet-avatar">${unit.icon}</div>
      <div>
        <span class="key-badge">${controls[side].units[index]}</span>
        <span class="pet-name">${unit.name}</span>
        <div class="pet-meta">
          <span>${unit.cost} 星</span>
          <span>${unit.atk} 攻</span>
          <span>${unit.hp} 心</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => deployUnit(side, index));
    grid.appendChild(card);
  });
}

function updateHud() {
  const theme = getTheme();
  dom.gameTitle.textContent = theme.title;
  dom.gameSubtitle.textContent = theme.subtitle;
  dom.themeBadge.textContent = theme.badge;
  dom.leftScoreLabel.textContent = theme.left.name;
  dom.rightScoreLabel.textContent = theme.right.name;
  dom.leftPanelName.textContent = theme.left.name;
  dom.rightPanelName.textContent = theme.right.name;
  dom.leftBaseName.textContent = theme.left.base;
  dom.rightBaseName.textContent = theme.right.base;
  dom.leftBaseFace.textContent = theme.left.face;
  dom.rightBaseFace.textContent = theme.right.face;

  dom.leftScore.textContent = state.sides.left.score;
  dom.rightScore.textContent = state.sides.right.score;
  dom.leftBaseHp.textContent = state.sides.left.baseHp;
  dom.rightBaseHp.textContent = state.sides.right.baseHp;
  dom.leftEnergyText.textContent = `${Math.floor(state.sides.left.energy)} / ${state.maxEnergy}`;
  dom.rightEnergyText.textContent = `${Math.floor(state.sides.right.energy)} / ${state.maxEnergy}`;
  dom.leftEnergyFill.style.width = `${(state.sides.left.energy / state.maxEnergy) * 100}%`;
  dom.rightEnergyFill.style.width = `${(state.sides.right.energy / state.maxEnergy) * 100}%`;

  if (state.sides.left.baseHp <= 0 || state.sides.right.baseHp <= 0) {
    dom.roundState.textContent = state.sides.left.baseHp <= 0 ? `${theme.right.name}赢` : `${theme.left.name}赢`;
  } else {
    dom.roundState.textContent = state.running ? "冲呀" : "准备";
  }

  dom.startButton.textContent = state.running ? "对战中" : "开始对战";
  sideOrder.forEach((side) => {
    renderLanePicker(side);
    renderStrategyCards(side);
  });
}

function deployUnit(side, unitIndex) {
  const sideState = state.sides[side];
  const unitConfig = getTheme()[side].units[unitIndex];
  if (!state.running || sideState.energy < unitConfig.cost) return;

  sideState.energy -= unitConfig.cost;
  createUnit(side, unitConfig, sideState.lane);
  invalidatePanels();
  updateHud();
}

function createUnit(side, unitConfig, lane) {
  const themeSide = getTheme()[side];
  const unit = {
    id: state.nextUnitId++,
    side,
    lane,
    hp: unitConfig.hp,
    atk: unitConfig.atk,
    speed: unitConfig.speed,
    x: side === "left" ? 8 : 92,
    cooldown: 0,
    element: document.createElement("div"),
  };

  unit.element.className = `pet-unit ${side} ${themeSide.className}`;
  unit.element.innerHTML = `<span>${unitConfig.icon}</span>`;
  unit.element.style.top = `${lanePositions[lane]}%`;
  unit.element.style.left = `${unit.x}%`;
  if (side === "right") unit.element.style.scale = "-1 1";
  dom.lanes.appendChild(unit.element);
  state.units.push(unit);
}

function step(timestamp) {
  if (!state.lastFrame) state.lastFrame = timestamp;
  const delta = Math.min((timestamp - state.lastFrame) / 16.67, 2);
  state.lastFrame = timestamp;

  if (state.running) {
    updateEnergy(timestamp);
    updateUnits(delta);
    checkWinner();
  }

  requestAnimationFrame(step);
}

function updateEnergy(timestamp) {
  if (timestamp - state.lastEnergyTick <= 760) return;
  state.lastEnergyTick = timestamp;
  sideOrder.forEach((side) => {
    state.sides[side].energy = Math.min(state.maxEnergy, state.sides[side].energy + 1);
  });
  invalidatePanels();
  updateHud();
}

function updateUnits(delta) {
  [...state.units].forEach((unit) => {
    const target = findTarget(unit);

    if (target) {
      unit.cooldown -= delta;
      if (unit.cooldown <= 0) {
        target.hp -= unit.atk;
        unit.cooldown = 25;
        target.element.classList.add("hit");
        setTimeout(() => target.element.classList.remove("hit"), 140);
        popDamage(target, unit.atk);
      }
    } else {
      const direction = unit.side === "left" ? 1 : -1;
      unit.x += direction * unit.speed * delta * 0.13;
      unit.element.style.left = `${unit.x}%`;
    }

    if (unit.side === "left" && unit.x >= 96) {
      hitBase("right", unit.atk);
      removeUnit(unit);
    }

    if (unit.side === "right" && unit.x <= 4) {
      hitBase("left", unit.atk);
      removeUnit(unit);
    }

    if (unit.hp <= 0) removeUnit(unit);
  });

  updateHud();
}

function findTarget(unit) {
  return state.units.find((other) => {
    if (other.side === unit.side || other.lane !== unit.lane) return false;
    return Math.abs(other.x - unit.x) < 8;
  });
}

function hitBase(side, amount) {
  const defender = state.sides[side];
  const attackerSide = side === "left" ? "right" : "left";
  defender.baseHp = Math.max(0, defender.baseHp - amount);
  state.sides[attackerSide].score += amount;
}

function removeUnit(unit) {
  if (!state.units.includes(unit)) return;
  unit.element.classList.add("faint");
  setTimeout(() => unit.element.remove(), 260);
  state.units = state.units.filter((item) => item !== unit);
}

function popDamage(unit, amount) {
  const pop = document.createElement("div");
  pop.className = "damage-pop";
  pop.textContent = `-${amount}`;
  pop.style.left = `${unit.x}%`;
  pop.style.top = `${lanePositions[unit.lane] - 8}%`;
  dom.lanes.appendChild(pop);
  setTimeout(() => pop.remove(), 760);
}

function checkWinner() {
  if (state.sides.left.baseHp > 0 && state.sides.right.baseHp > 0) return;
  state.running = false;
  invalidatePanels();
  updateHud();
}

function resetGame(keepTheme = true) {
  state.running = false;
  if (!keepTheme) state.themeId = "catsDogs";
  sideOrder.forEach((side) => {
    state.sides[side].energy = 6;
    state.sides[side].baseHp = state.baseMaxHp;
    state.sides[side].score = 0;
    state.sides[side].lane = 1;
    state.sides[side].cardKey = "";
  });
  state.units.forEach((unit) => unit.element.remove());
  state.units = [];
  state.lastFrame = 0;
  state.lastEnergyTick = 0;
  setupLanes();
  renderThemeButtons();
  updateHud();
}

function switchTheme(themeId) {
  if (themeId === state.themeId) return;
  state.themeId = themeId;
  resetGame(true);
}

function invalidatePanels() {
  sideOrder.forEach((side) => {
    state.sides[side].cardKey = "";
  });
}

document.querySelectorAll(".environment-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".environment-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    dom.stage.className = `battle-stage ${button.dataset.env}`;
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const leftLanes = { q: 0, w: 1, e: 2 };
  const leftUnits = { a: 0, s: 1, d: 2 };
  const rightLanes = { u: 0, i: 1, o: 2 };
  const rightUnits = { j: 0, k: 1, l: 2 };

  if (key in leftLanes) {
    state.sides.left.lane = leftLanes[key];
    invalidatePanels();
    updateHud();
  }
  if (key in rightLanes) {
    state.sides.right.lane = rightLanes[key];
    invalidatePanels();
    updateHud();
  }
  if (key in leftUnits) deployUnit("left", leftUnits[key]);
  if (key in rightUnits) deployUnit("right", rightUnits[key]);
});

dom.startButton.addEventListener("click", () => {
  if (state.sides.left.baseHp <= 0 || state.sides.right.baseHp <= 0) resetGame(true);
  state.running = true;
  invalidatePanels();
  updateHud();
});

dom.resetButton.addEventListener("click", () => resetGame(true));

setupLanes();
renderThemeButtons();
updateHud();
requestAnimationFrame(step);
