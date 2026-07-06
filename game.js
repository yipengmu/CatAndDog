const balancedUnitPresets = {
  striker: { cost: 2, hp: 6, atk: 2, speed: 1.24 },
  tank: { cost: 3, hp: 10, atk: 1, speed: 0.86 },
  bruiser: { cost: 4, hp: 8, atk: 3, speed: 0.95 },
};

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
        { name: "波斯猫", icon: "🐱", role: "快攻", species: "persian", ...balancedUnitPresets.striker },
        { name: "加菲猫", icon: "😺", role: "防御", species: "garfield", ...balancedUnitPresets.tank },
        { name: "短耳猫", icon: "😸", role: "强攻", species: "shortEar", ...balancedUnitPresets.bruiser },
      ],
    },
    right: {
      name: "狗狗队",
      base: "狗狗城堡",
      face: "ᴥ",
      className: "dog",
      units: [
        { name: "泰迪", icon: "🐩", role: "快攻", species: "teddy", ...balancedUnitPresets.striker },
        { name: "金毛犬", icon: "🐕", role: "防御", species: "golden", ...balancedUnitPresets.tank },
        { name: "斗牛犬", icon: "🐶", role: "强攻", species: "bulldog", ...balancedUnitPresets.bruiser },
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
        { name: "三角龙", icon: "🦕", role: "冲锋", species: "triceratops", ...balancedUnitPresets.striker },
        { name: "剑龙", icon: "🦕", role: "守线", species: "stegosaurus", ...balancedUnitPresets.tank },
        { name: "甲龙", icon: "🦕", role: "重击", species: "ankylosaurus", ...balancedUnitPresets.bruiser },
      ],
    },
    right: {
      name: "霸王龙队",
      base: "火山堡垒",
      face: "▴",
      className: "dinoRight",
      units: [
        { name: "霸王龙", icon: "🦖", role: "猛冲", species: "trex", ...balancedUnitPresets.striker },
        { name: "迅猛龙", icon: "🦖", role: "守线", species: "giga", ...balancedUnitPresets.tank },
        { name: "食肉牛龙", icon: "🦖", role: "强攻", species: "indominus", ...balancedUnitPresets.bruiser },
      ],
    },
  },
};

const state = {
  themeId: "catsDogs",
  environment: "garden",
  mode: "duo",
  running: false,
  maxEnergy: 10,
  scoreTarget: 10,
  baseMaxHp: 10,
  winnerSide: null,
  isNarrowViewport: false,
  orientation: "landscape",
  orientationOverride: "",
  sides: {
    left: { energy: 6, baseHp: 10, score: 0, lane: 1, cardKey: "" },
    right: { energy: 6, baseHp: 10, score: 0, lane: 1, cardKey: "" },
  },
  units: [],
  lastFrame: 0,
  lastEnergyTick: 0,
  nextUnitId: 1,
  ai: {
    nextActionAt: 0,
  },
};

const audioState = {
  context: null,
  masterGain: null,
  musicGain: null,
  started: false,
  currentTheme: "",
  bgm: null,
  defeatClips: {},
};

const themeAudio = {
  catsDogs: {
    bgm: "./assets/audio/cats-dogs-bgm.mp3",
  },
  dinos: {
    bgm: "./assets/audio/dinos-bgm.mp3",
  },
};

const unitDefeatAudio = {
  catsDogs: {
    left: "./assets/audio/cat-defeat.mp3",
    right: "./assets/audio/dog-defeat.mp3",
  },
  dinos: {
    shared: "./assets/audio/shirou.m4a",
  },
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
const modeOptions = [
  { id: "solo", label: "单人闯关", subtitle: "竖屏更顺手" },
  { id: "duo", label: "双人对战", subtitle: "横屏一起玩" },
];

const dom = {
  stage: document.querySelector("#battleStage"),
  lanes: document.querySelector("#battleLanes"),
  modeSwitch: document.querySelector("#modeSwitch"),
  quickSwitch: document.querySelector("#quickSwitch"),
  gameTitle: document.querySelector("#gameTitle"),
  gameSubtitle: document.querySelector("#gameSubtitle"),
  themeBadge: document.querySelector("#themeBadge"),
  roundState: document.querySelector("#roundState"),
  startButton: document.querySelector("#startButton"),
  resetButton: document.querySelector("#resetButton"),
  orientationBanner: document.querySelector("#orientationBanner"),
  orientationTitle: document.querySelector("#orientationTitle"),
  orientationText: document.querySelector("#orientationText"),
  orientationToggle: document.querySelector("#orientationToggle"),
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
  soloSidekick: document.querySelector("#soloSidekick"),
  soloSidekickName: document.querySelector("#soloSidekickName"),
  soloSidekickText: document.querySelector("#soloSidekickText"),
  soloSidekickCard: document.querySelector("#soloSidekickCard"),
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

function isSoloMode() {
  return state.mode === "solo";
}

function getModeSubtitle() {
  return isSoloMode() ? "单人竖屏闯关，右侧交给 AI" : "双人同屏宠物冲冲冲";
}

function getLayoutOrientation() {
  return state.orientationOverride || state.orientation;
}

function stopThemeMusic() {
  if (!audioState.bgm) return;
  audioState.bgm.pause();
  audioState.bgm.currentTime = 0;
}

function getDefeatAudioSrc(side) {
  if (state.themeId === "dinos") return unitDefeatAudio.dinos.shared;
  return unitDefeatAudio.catsDogs[side];
}

function getDefeatAudioKey(side) {
  return state.themeId === "dinos" ? "dinos-shared" : `catsDogs-${side}`;
}

function getOrCreateDefeatClip(side) {
  const clipKey = getDefeatAudioKey(side);
  if (!audioState.defeatClips[clipKey]) {
    const clip = new Audio(getDefeatAudioSrc(side));
    clip.preload = "auto";
    audioState.defeatClips[clipKey] = clip;
  }
  return audioState.defeatClips[clipKey];
}

function playDefeatClip(side) {
  if (!audioState.started) return;
  const volume = state.themeId === "catsDogs" ? 0.75 : 0.55;
  if (state.themeId === "dinos") {
    const clip = new Audio(unitDefeatAudio.dinos.shared);
    clip.preload = "auto";
    clip.volume = volume;
    clip.play().catch(() => {});
    return;
  }
  const source = getOrCreateDefeatClip(side);
  try {
    const clip = source.cloneNode();
    clip.volume = volume;
    clip.play().catch(() => {});
  } catch {
    source.currentTime = 0;
    source.volume = volume;
    source.play().catch(() => {});
  }
}

function ensureAudio() {
  if (audioState.context) return audioState.context;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  const context = new AudioCtx();
  const masterGain = context.createGain();
  const musicGain = context.createGain();
  masterGain.gain.value = 0.65;
  musicGain.gain.value = 0.8;
  musicGain.connect(masterGain);
  masterGain.connect(context.destination);
  audioState.context = context;
  audioState.masterGain = masterGain;
  audioState.musicGain = musicGain;
  return context;
}

async function unlockAudio() {
  const context = ensureAudio();
  if (!context) return;
  if (context.state === "suspended") await context.resume();
  if (!audioState.started) {
    audioState.started = true;
    ["left", "right"].forEach((side) => getOrCreateDefeatClip(side).load());
    const dinoDefeatClip = new Audio(unitDefeatAudio.dinos.shared);
    dinoDefeatClip.preload = "auto";
    dinoDefeatClip.load();
    startThemeMusic();
  }
}

function playTone({
  frequency = 440,
  type = "sine",
  duration = 0.2,
  volume = 0.08,
  when,
  slideTo = null,
  gainNode = null,
}) {
  const context = ensureAudio();
  if (!context) return;
  const start = when ?? context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(gainNode || audioState.masterGain);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function playNoiseBurst({ duration = 0.12, volume = 0.03, highpass = 900, when }) {
  const context = ensureAudio();
  if (!context) return;
  const start = when ?? context.currentTime;
  const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = highpass;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioState.masterGain);
  source.start(start);
}

function playCatVictory() {
  const now = ensureAudio()?.currentTime;
  if (now == null) return;
  playTone({ frequency: 680, type: "triangle", duration: 0.14, volume: 0.06, when: now, slideTo: 760 });
  playTone({ frequency: 760, type: "triangle", duration: 0.18, volume: 0.05, when: now + 0.11, slideTo: 920 });
}

function playDogVictory() {
  const now = ensureAudio()?.currentTime;
  if (now == null) return;
  playTone({ frequency: 240, type: "square", duration: 0.12, volume: 0.06, when: now, slideTo: 180 });
  playNoiseBurst({ duration: 0.08, volume: 0.02, highpass: 700, when: now + 0.02 });
  playTone({ frequency: 210, type: "square", duration: 0.15, volume: 0.05, when: now + 0.12, slideTo: 160 });
}

function playDinoRoar() {
  const now = ensureAudio()?.currentTime;
  if (now == null) return;
  playTone({ frequency: 160, type: "sawtooth", duration: 0.26, volume: 0.08, when: now, slideTo: 110 });
  playTone({ frequency: 120, type: "square", duration: 0.22, volume: 0.05, when: now + 0.05, slideTo: 90 });
  playNoiseBurst({ duration: 0.15, volume: 0.018, highpass: 500, when: now + 0.03 });
}

function playDinoWail() {
  const now = ensureAudio()?.currentTime;
  if (now == null) return;
  playTone({ frequency: 420, type: "triangle", duration: 0.24, volume: 0.055, when: now, slideTo: 180 });
  playTone({ frequency: 310, type: "sine", duration: 0.26, volume: 0.04, when: now + 0.05, slideTo: 140 });
}

function playDeploySound(side, unitConfig) {
  if (!audioState.started) return;
  const now = ensureAudio()?.currentTime;
  if (now == null) return;
  const sideShift = side === "left" ? 1 : 0.84;
  const costLift = unitConfig.cost * 18;
  const baseFrequency = state.themeId === "dinos" ? 210 : 420;
  playTone({
    frequency: (baseFrequency + costLift) * sideShift,
    type: state.themeId === "dinos" ? "sawtooth" : "triangle",
    duration: 0.11,
    volume: 0.11,
    when: now,
    slideTo: (baseFrequency + costLift + 90) * sideShift,
  });
  playTone({
    frequency: (baseFrequency + costLift + 130) * sideShift,
    type: "sine",
    duration: 0.12,
    volume: 0.065,
    when: now + 0.07,
    slideTo: (baseFrequency + costLift + 60) * sideShift,
  });
}

function playAttackSound(unit) {
  if (!audioState.started) return;
  const now = ensureAudio()?.currentTime;
  if (now == null) return;
  const isDino = state.themeId === "dinos";
  const sideShift = unit.side === "left" ? 1 : 0.78;
  if (isDino) {
    playTone({
      frequency: 132 * sideShift,
      type: "sawtooth",
      duration: 0.1,
      volume: 0.07,
      when: now,
      slideTo: 82 * sideShift,
    });
    playTone({
      frequency: 96 * sideShift,
      type: "square",
      duration: 0.08,
      volume: 0.05,
      when: now + 0.02,
      slideTo: 68 * sideShift,
    });
    playNoiseBurst({
      duration: 0.08,
      volume: 0.038,
      highpass: 420,
      when: now + 0.01,
    });
    return;
  }
  playTone({
    frequency: 360 * sideShift,
    type: "triangle",
    duration: 0.07,
    volume: 0.055,
    when: now,
    slideTo: 520 * sideShift,
  });
  playNoiseBurst({
    duration: 0.055,
    volume: 0.026,
    highpass: 1100,
    when: now + 0.01,
  });
}

function playBaseHitSound(attackerSide) {
  if (!audioState.started) return;
  const now = ensureAudio()?.currentTime;
  if (now == null) return;
  const sideShift = attackerSide === "left" ? 1 : 0.82;
  playTone({ frequency: 150 * sideShift, type: "square", duration: 0.16, volume: 0.095, when: now, slideTo: 92 * sideShift });
  playNoiseBurst({ duration: 0.13, volume: 0.042, highpass: 420, when: now + 0.02 });
}

function playDefeatSounds(unit, actor) {
  if (!audioState.started) return;
  if (!actor?.side) return;
  if (state.themeId === "catsDogs") {
    playDefeatClip(actor.side);
    if (actor.side === "left" && unit.side === "right") playCatVictory();
    if (actor.side === "right" && unit.side === "left") playDogVictory();
    return;
  }
  playDefeatClip(actor.side);
}

function startThemeMusic() {
  if (!audioState.started) return;
  const nextTheme = state.themeId;
  const nextSrc = themeAudio[nextTheme]?.bgm;
  if (!nextSrc) return;
  if (audioState.bgm && audioState.currentTheme === nextTheme) {
    audioState.bgm.play().catch(() => {});
    return;
  }
  stopThemeMusic();
  const bgm = new Audio(nextSrc);
  bgm.loop = true;
  bgm.preload = "auto";
  bgm.volume = nextTheme === "catsDogs" ? 0.32 : 0.28;
  audioState.bgm = bgm;
  audioState.currentTheme = state.themeId;
  bgm.play().catch(() => {});
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

function renderModeSwitch() {
  const renderKey = `${state.mode}:${state.isNarrowViewport}:${state.orientationOverride}`;
  if (dom.modeSwitch.dataset.renderKey === renderKey) return;
  dom.modeSwitch.dataset.renderKey = renderKey;
  dom.modeSwitch.innerHTML = "";
  modeOptions.forEach((option) => {
    const button = document.createElement("button");
    button.className = `mode-button ${state.mode === option.id ? "active" : ""}`;
    button.type = "button";
    button.innerHTML = `<strong>${option.label}</strong><span>${option.subtitle}</span>`;
    button.addEventListener("click", () => switchMode(option.id));
    dom.modeSwitch.appendChild(button);
  });
}

function renderLanePicker(side) {
  const picker = dom[`${side}LanePicker`];
  const isAiSide = isSoloMode() && side === "right";
  picker.innerHTML = "";
  picker.classList.toggle("ai-lane-picker", isAiSide);
  laneNames.forEach((name, laneIndex) => {
    const button = document.createElement("button");
    button.className = `lane-button ${state.sides[side].lane === laneIndex ? "active" : ""}`;
    button.type = "button";
    button.disabled = isAiSide;
    const keyHint = state.isNarrowViewport ? ["1", "2", "3"][laneIndex] : controls[side].lanes[laneIndex];
    button.innerHTML = `<span>${keyHint}</span>${name}`;
    button.addEventListener("click", () => {
      if (isAiSide) return;
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
  const isAiSide = isSoloMode() && side === "right";
  const cardKey = `${state.themeId}:${state.mode}:${side}:${state.running}:${Math.floor(sideState.energy)}:${sideState.lane}:${state.isNarrowViewport}`;
  if (sideState.cardKey === cardKey) return;
  sideState.cardKey = cardKey;

  const grid = dom[`${side}StrategyGrid`];
  grid.innerHTML = "";

  if (isAiSide) return;

  themeSide.units.forEach((unit, index) => {
    const card = document.createElement("button");
    card.className = `strategy-card ${side} ${themeSide.className} ${unit.species || ""}`;
    card.type = "button";
    card.disabled = !state.running || sideState.energy < unit.cost;
    const keyHint = state.isNarrowViewport ? "点按出兵" : controls[side].units[index];
    card.innerHTML = `
      <div class="pet-avatar">${renderAnimalIcon(unit)}</div>
      <div>
        <span class="key-badge">${keyHint}</span>
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
  const solo = isSoloMode();
  const layoutOrientation = getLayoutOrientation();
  const rightName = solo ? `${theme.right.name} AI` : theme.right.name;
  dom.gameTitle.textContent = theme.title;
  dom.gameSubtitle.textContent = getModeSubtitle();
  dom.themeBadge.textContent = theme.badge;
  dom.leftScoreLabel.textContent = theme.left.name;
  dom.rightScoreLabel.textContent = rightName;
  dom.leftPanelName.textContent = theme.left.name;
  dom.rightPanelName.textContent = rightName;
  dom.leftBaseName.textContent = theme.left.base;
  dom.rightBaseName.textContent = theme.right.base;
  dom.leftBaseFace.textContent = theme.left.face;
  dom.rightBaseFace.textContent = theme.right.face;
  dom.leftBase.className = `base base-left ${theme.left.className}`;
  dom.rightBase.className = `base base-right ${theme.right.className}`;
  dom.leftPanel.className = `player-panel left-player ${theme.left.className}`;
  dom.rightPanel.className = `player-panel right-player ${theme.right.className} ${solo ? "ai-panel" : ""}`;
  dom.rightPanel.classList.toggle("hidden", solo && state.isNarrowViewport);
  dom.modeSwitch.setAttribute("aria-label", `当前模式：${solo ? "单人闯关" : "双人对战"}`);
  dom.soloSidekick.classList.toggle("hidden", !solo);
  dom.soloSidekickName.textContent = rightName;
  dom.soloSidekickText.textContent = solo
    ? `AI 会自动安排${theme.right.name}出兵，你只要点自己喜欢的小动物。`
    : "";

  dom.leftScore.textContent = state.sides.left.score;
  dom.rightScore.textContent = state.sides.right.score;
  dom.leftBaseHp.textContent = state.sides.left.baseHp;
  dom.rightBaseHp.textContent = state.sides.right.baseHp;
  dom.leftEnergyText.textContent = `${Math.floor(state.sides.left.energy)} / ${state.maxEnergy}`;
  dom.rightEnergyText.textContent = `${Math.floor(state.sides.right.energy)} / ${state.maxEnergy}`;
  dom.leftEnergyFill.style.width = `${(state.sides.left.energy / state.maxEnergy) * 100}%`;
  dom.rightEnergyFill.style.width = `${(state.sides.right.energy / state.maxEnergy) * 100}%`;
  dom.soloSidekickCard.innerHTML = `
    <div class="solo-sidekick-avatar">${renderAnimalIcon(theme.right.units[state.sides.right.lane] || theme.right.units[0])}</div>
    <div>
      <strong>${rightName}</strong>
      <p>${laneNames[state.sides.right.lane]} · 能量 ${Math.floor(state.sides.right.energy)} / ${state.maxEnergy}</p>
    </div>
  `;

  if (state.winnerSide) {
    dom.roundState.textContent = `${theme[state.winnerSide].name}赢`;
  } else {
    dom.roundState.textContent = state.running ? "冲呀" : "准备";
  }

  dom.startButton.textContent = state.winnerSide ? "再来一局" : state.running ? "对战中" : "开始对战";
  renderModeSwitch();
  dom.stage.dataset.mode = state.mode;
  dom.stage.dataset.orientation = layoutOrientation;
  document.body.dataset.mode = state.mode;
  document.body.dataset.orientation = layoutOrientation;
  document.body.dataset.deviceOrientation = state.orientation;
  document.body.dataset.orientationOverride = state.orientationOverride || "auto";
  document.body.dataset.mobile = String(state.isNarrowViewport);
  syncOrientationBanner();
  sideOrder.forEach((side) => {
    renderLanePicker(side);
    renderStrategyCards(side);
  });
}

function deployUnit(side, unitIndex) {
  const sideState = state.sides[side];
  const unitConfig = getTheme()[side].units[unitIndex];
  if (!state.running || sideState.energy < unitConfig.cost) return;
  void unlockAudio().then(() => playDeploySound(side, unitConfig));

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
    updateAi(timestamp);
    updateUnits(delta);
    checkWinner();
  }

  requestAnimationFrame(step);
}

function updateAi(timestamp) {
  if (!isSoloMode() || !state.running || state.winnerSide) return;
  if (timestamp < state.ai.nextActionAt) return;

  const sideState = state.sides.right;
  const units = getTheme().right.units;
  const affordableUnits = units
    .map((unit, index) => ({ unit, index }))
    .filter(({ unit }) => sideState.energy >= unit.cost);

  sideState.lane = Math.random() < 0.55 ? state.sides.left.lane : Math.floor(Math.random() * laneNames.length);
  if (affordableUnits.length) {
    const choice = affordableUnits[Math.floor(Math.random() * affordableUnits.length)];
    deployUnit("right", choice.index);
  }
  state.ai.nextActionAt = timestamp + 650 + Math.random() * 850;
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
        playAttackSound(unit);
        if (target.hp <= 0) {
          removeUnit(target, { cause: "defeated", actor: unit });
        }
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
    if (unit.hp <= 0) removeUnit(unit, { cause: "defeated", actor: target });
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
  playBaseHitSound(attackerSide);
}

function removeUnit(unit, meta = {}) {
  if (!state.units.includes(unit)) return;
  if (meta.cause === "defeated") playDefeatSounds(unit, meta.actor);
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
  state.ai.nextActionAt = 0;
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
  if (audioState.started) startThemeMusic();
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

function switchMode(mode) {
  if (mode === state.mode) return;
  state.mode = mode;
  state.orientationOverride = "";
  resetGame(true);
}

function invalidatePanels() {
  sideOrder.forEach((side) => {
    state.sides[side].cardKey = "";
  });
}

function syncViewportState() {
  state.isNarrowViewport = window.matchMedia("(max-width: 820px), (orientation: landscape) and (max-height: 520px)").matches;
  state.orientation = window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  if (!state.isNarrowViewport) state.orientationOverride = "";
  invalidatePanels();
  updateHud();
}

function syncOrientationBanner() {
  const layoutOrientation = getLayoutOrientation();
  const needsPortrait = isSoloMode();
  const expectedOrientation = needsPortrait ? "portrait" : "landscape";
  const showBanner = state.isNarrowViewport && (layoutOrientation !== expectedOrientation || state.orientationOverride === "landscape");
  dom.orientationBanner.classList.toggle("hidden", !showBanner);
  dom.orientationTitle.textContent = needsPortrait ? "单人模式更适合竖屏" : "双人模式更适合横屏";
  dom.orientationText.textContent = needsPortrait
    ? "把手机竖起来，自己的出兵卡会更大；也可以点按钮恢复竖屏布局。"
    : state.orientationOverride === "landscape"
      ? "现在已经是横屏布局了，不转手机也能双人对战。"
      : "如果系统横屏没生效，可以直接点按钮切到横屏对战布局。";
  const showToggle = state.isNarrowViewport && (!needsPortrait || state.orientationOverride === "landscape");
  dom.orientationToggle.classList.toggle("hidden", !showToggle);
  dom.orientationToggle.textContent = layoutOrientation === "landscape" ? "恢复自动方向" : "切换横屏布局";
}

function toggleOrientationOverride() {
  const layoutOrientation = getLayoutOrientation();
  if (layoutOrientation === "landscape") {
    state.orientationOverride = "";
  } else {
    state.orientationOverride = "landscape";
  }
  invalidatePanels();
  updateHud();
}

document.addEventListener("keydown", (event) => {
  if (isSoloMode() && ["u", "i", "o", "j", "k", "l"].includes(event.key.toLowerCase())) return;
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
  unlockAudio();
  if (state.winnerSide) resetGame(true);
  state.running = true;
  invalidatePanels();
  updateHud();
});

dom.resetButton.addEventListener("click", () => resetGame(true));
dom.rewardRestartButton.addEventListener("click", () => {
  unlockAudio();
  resetGame(true);
});
dom.orientationToggle.addEventListener("click", toggleOrientationOverride);

window.addEventListener("resize", syncViewportState);
window.addEventListener("orientationchange", syncViewportState);

setupLanes();
renderModeSwitch();
renderQuickSwitch();
syncViewportState();
requestAnimationFrame(step);
