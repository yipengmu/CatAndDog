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
        { name: "波斯猫", icon: "🐱", role: "快攻", species: "persian", cost: 2, hp: 5, atk: 1, speed: 1.62 },
        { name: "加菲猫", icon: "😺", role: "防御", species: "garfield", cost: 3, hp: 10, atk: 1, speed: 0.78 },
        { name: "短耳猫", icon: "😸", role: "均衡", species: "shortEar", cost: 3, hp: 7, atk: 2, speed: 1.18 },
      ],
    },
    right: {
      name: "狗狗队",
      base: "狗狗城堡",
      face: "ᴥ",
      className: "dog",
      units: [
        { name: "斗牛犬", icon: "🐶", role: "强攻", species: "bulldog", cost: 4, hp: 7, atk: 3, speed: 0.95 },
        { name: "金毛犬", icon: "🐕", role: "防御", species: "golden", cost: 3, hp: 10, atk: 1, speed: 0.86 },
        { name: "泰迪", icon: "🐩", role: "均衡", species: "teddy", cost: 2, hp: 6, atk: 2, speed: 1.22 },
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
        { name: "三角龙", icon: "🦕", role: "冲锋", species: "triceratops", cost: 2, hp: 7, atk: 1, speed: 1.18 },
        { name: "剑龙", icon: "🦕", role: "守线", species: "stegosaurus", cost: 3, hp: 9, atk: 2, speed: 0.88 },
        { name: "甲龙", icon: "🦕", role: "重甲", species: "ankylosaurus", cost: 4, hp: 11, atk: 2, speed: 0.72 },
      ],
    },
    right: {
      name: "霸王龙队",
      base: "火山堡垒",
      face: "▴",
      className: "dinoRight",
      units: [
        { name: "霸王龙", icon: "🦖", role: "强攻", species: "trex", cost: 2, hp: 6, atk: 2, speed: 1.08 },
        { name: "迅猛龙", icon: "🦖", role: "猛冲", species: "giga", cost: 3, hp: 8, atk: 2, speed: 1.02 },
        { name: "食肉牛龙", icon: "🦖", role: "王牌", species: "indominus", cost: 4, hp: 9, atk: 3, speed: 0.92 },
      ],
    },
  },
};

const state = {
  themeId: "catsDogs",
  environment: "garden",
  running: false,
  maxEnergy: 10,
  scoreTarget: 10,
  baseMaxHp: 10,
  winnerSide: null,
  sides: {
    left: { energy: 6, baseHp: 10, score: 0, lane: 1, cardKey: "" },
    right: { energy: 6, baseHp: 10, score: 0, lane: 1, cardKey: "" },
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
  quickSwitch: document.querySelector("#quickSwitch"),
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
  leftBase: document.querySelector("#leftBase"),
  rightBase: document.querySelector("#rightBase"),
  leftBaseFace: document.querySelector("#leftBaseFace"),
  rightBaseFace: document.querySelector("#rightBaseFace"),
  leftBaseName: document.querySelector("#leftBaseName"),
  rightBaseName: document.querySelector("#rightBaseName"),
  leftPanelName: document.querySelector("#leftPanelName"),
  rightPanelName: document.querySelector("#rightPanelName"),
  leftPanel: document.querySelector("#leftPanel"),
  rightPanel: document.querySelector("#rightPanel"),
  leftEnergyText: document.querySelector("#leftEnergyText"),
  rightEnergyText: document.querySelector("#rightEnergyText"),
  leftEnergyFill: document.querySelector("#leftEnergyFill"),
  rightEnergyFill: document.querySelector("#rightEnergyFill"),
  leftLanePicker: document.querySelector("#leftLanePicker"),
  rightLanePicker: document.querySelector("#rightLanePicker"),
  leftStrategyGrid: document.querySelector("#leftStrategyGrid"),
  rightStrategyGrid: document.querySelector("#rightStrategyGrid"),
  rewardModal: document.querySelector("#rewardModal"),
  rewardAvatar: document.querySelector("#rewardAvatar"),
  rewardKicker: document.querySelector("#rewardKicker"),
  rewardTitle: document.querySelector("#rewardTitle"),
  rewardMessage: document.querySelector("#rewardMessage"),
  rewardRestartButton: document.querySelector("#rewardRestartButton"),
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

function renderQuickSwitch() {
  const options = [
    { type: "theme", id: "catsDogs", label: "猫狗大战" },
    { type: "theme", id: "dinos", label: "恐龙大作战" },
    { type: "environment", id: "garden", label: "彩虹花园" },
    { type: "environment", id: "beach", label: "泡泡海滩" },
  ];

  dom.quickSwitch.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    const isActive =
      (option.type === "theme" && option.id === state.themeId) ||
      (option.type === "environment" && option.id === state.environment);
    button.className = `quick-button ${isActive ? "active" : ""}`;
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      if (option.type === "theme") switchTheme(option.id);
      if (option.type === "environment") switchEnvironment(option.id);
    });
    dom.quickSwitch.appendChild(button);
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
    card.className = `strategy-card ${side} ${themeSide.className} ${unit.species || ""}`;
    card.type = "button";
    card.disabled = !state.running || sideState.energy < unit.cost;
    card.innerHTML = `
      <div class="pet-avatar">${renderAnimalIcon(unit)}</div>
      <div>
        <span class="key-badge">${controls[side].units[index]}</span>
        <span class="pet-name">${unit.name}</span>
        <div class="pet-meta">
          <span class="cost-badge">★ ${unit.cost}</span>
          <span>${unit.role}</span>
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
  dom.leftBase.className = `base base-left ${theme.left.className}`;
  dom.rightBase.className = `base base-right ${theme.right.className}`;
  dom.leftPanel.className = `player-panel left-player ${theme.left.className}`;
  dom.rightPanel.className = `player-panel right-player ${theme.right.className}`;

  dom.leftScore.textContent = state.sides.left.score;
  dom.rightScore.textContent = state.sides.right.score;
  dom.leftBaseHp.textContent = state.sides.left.baseHp;
  dom.rightBaseHp.textContent = state.sides.right.baseHp;
  dom.leftEnergyText.textContent = `${Math.floor(state.sides.left.energy)} / ${state.maxEnergy}`;
  dom.rightEnergyText.textContent = `${Math.floor(state.sides.right.energy)} / ${state.maxEnergy}`;
  dom.leftEnergyFill.style.width = `${(state.sides.left.energy / state.maxEnergy) * 100}%`;
  dom.rightEnergyFill.style.width = `${(state.sides.right.energy / state.maxEnergy) * 100}%`;

  if (state.winnerSide) {
    dom.roundState.textContent = `${theme[state.winnerSide].name}赢`;
  } else {
    dom.roundState.textContent = state.running ? "冲呀" : "准备";
  }

  dom.startButton.textContent = state.winnerSide ? "再来一局" : state.running ? "对战中" : "开始对战";
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
    maxHp: unitConfig.hp,
    atk: unitConfig.atk,
    speed: unitConfig.speed,
    x: side === "left" ? 8 : 92,
    cooldown: 0,
    element: document.createElement("div"),
  };

  unit.element.className = `pet-unit ${side} ${themeSide.className} ${unitConfig.species || ""}`;
  unit.element.innerHTML = `
    <div class="unit-health" aria-hidden="true"><div class="unit-health-fill"></div></div>
    ${renderAnimalIcon(unitConfig)}
  `;
  unit.element.style.top = `${lanePositions[lane]}%`;
  unit.element.style.left = `${unit.x}%`;
  updateUnitHealth(unit);
  dom.lanes.appendChild(unit.element);
  state.units.push(unit);
}

function renderAnimalIcon(unitConfig) {
  const asset = getAnimalAsset(unitConfig);
  const useImage = asset.imageUrl && asset.renderMode !== "fallback";
  const image = useImage
    ? `<img class="animal-image" src="${asset.imageUrl}" alt="${unitConfig.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.animal-icon').classList.add('use-fallback')" />`
    : "";
  return `
    <div class="animal-icon ${asset.fallbackClass || unitConfig.species || ""} ${useImage ? "has-image" : "use-fallback"}" role="img" aria-label="${unitConfig.name}">
      ${image}
      <i class="body"></i>
      <i class="head"></i>
      <i class="ear ear-left"></i>
      <i class="ear ear-right"></i>
      <i class="snout"></i>
      <i class="eye eye-left"></i>
      <i class="eye eye-right"></i>
      <i class="tail"></i>
      <i class="detail detail-one"></i>
      <i class="detail detail-two"></i>
      <i class="detail detail-three"></i>
    </div>
  `;
}

function getAnimalAsset(unitConfig) {
  const registry = window.animalAssets?.species || {};
  return registry[unitConfig.species] || {
    imageUrl: "",
    fallbackClass: unitConfig.species || "",
  };
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
        updateUnitHealth(target);
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

function updateUnitHealth(unit) {
  const ratio = Math.max(0, unit.hp / unit.maxHp);
  const fill = unit.element.querySelector(".unit-health-fill");
  if (fill) fill.style.width = `${ratio * 100}%`;
  unit.element.classList.toggle("low-health", ratio <= 0.35);
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
  state.sides[attackerSide].score = Math.min(state.scoreTarget, state.sides[attackerSide].score + amount);
  defender.baseHp = Math.max(0, state.scoreTarget - state.sides[attackerSide].score);
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
  if (state.winnerSide) return;
  const winnerSide = sideOrder.find((side) => state.sides[side].score >= state.scoreTarget);
  if (!winnerSide) return;
  state.running = false;
  state.winnerSide = winnerSide;
  [...state.units].forEach((unit) => removeUnit(unit));
  invalidatePanels();
  updateHud();
  showReward(winnerSide);
}

function showReward(winnerSide) {
  const theme = getTheme();
  const winner = theme[winnerSide];
  const hero = winner.units[Math.floor(Math.random() * winner.units.length)];
  dom.rewardAvatar.className = `reward-avatar ${hero.species || ""}`;
  dom.rewardAvatar.innerHTML = renderAnimalIcon(hero);
  dom.rewardKicker.textContent = `${winner.name} 达到 ${state.scoreTarget} 分`;
  dom.rewardTitle.textContent = "Congratulations!";
  dom.rewardMessage.textContent = `${hero.name} 送来祝贺，${winner.name}赢得了比赛！`;
  dom.rewardModal.classList.remove("hidden");
}

function hideReward() {
  dom.rewardModal.classList.add("hidden");
}

function resetGame(keepTheme = true) {
  state.running = false;
  if (!keepTheme) state.themeId = "catsDogs";
  state.winnerSide = null;
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
  hideReward();
  setupLanes();
  renderQuickSwitch();
  updateHud();
}

function switchTheme(themeId) {
  if (themeId === state.themeId) return;
  state.themeId = themeId;
  resetGame(true);
}

function switchEnvironment(environment) {
  state.environment = environment;
  dom.stage.className = `battle-stage ${environment}`;
  renderQuickSwitch();
}

function invalidatePanels() {
  sideOrder.forEach((side) => {
    state.sides[side].cardKey = "";
  });
}

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
  if (state.winnerSide) resetGame(true);
  state.running = true;
  invalidatePanels();
  updateHud();
});

dom.resetButton.addEventListener("click", () => resetGame(true));
dom.rewardRestartButton.addEventListener("click", () => resetGame(true));

setupLanes();
renderQuickSwitch();
updateHud();
requestAnimationFrame(step);
