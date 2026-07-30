const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI 엘리먼트
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreVal = document.getElementById('scoreVal');
const finalScore = document.getElementById('finalScore');
const bestScore = document.getElementById('bestScore');
const heartContainer = document.getElementById('heartContainer');

// 모바일 터치 엘리먼트
const touchControls = document.getElementById('touchControls');
const touchLeft = document.getElementById('touchLeft');
const touchRight = document.getElementById('touchRight');

// 콤보 및 아이템 상태 표시 엘리먼트
const levelVal = document.getElementById('levelVal');
const comboBox = document.getElementById('comboBox');
const comboMultEl = document.getElementById('comboMult');
const comboGauge = document.getElementById('comboGauge');
const badgeShield = document.getElementById('badgeShield');
const badgeMagnet = document.getElementById('badgeMagnet');
const badgeBooster = document.getElementById('badgeBooster');
const badgeSlow = document.getElementById('badgeSlow');
const badgeSlip = document.getElementById('badgeSlip');
// 기록 / 차고 / 게임오버 요약 엘리먼트
const statsScreen = document.getElementById('statsScreen');
const garageScreen = document.getElementById('garageScreen');
const statsBtn = document.getElementById('statsBtn');
const statsBtn2 = document.getElementById('statsBtn2');
const garageBtn = document.getElementById('garageBtn');
const garageBtn2 = document.getElementById('garageBtn2');
const muteBtn = document.getElementById('muteBtn');
const statRuns = document.getElementById('statRuns');
const statDistance = document.getElementById('statDistance');
const statCoins = document.getElementById('statCoins');
const statCombo = document.getElementById('statCombo');
const rankList = document.getElementById('rankList');
const achList = document.getElementById('achList');
const achProgress = document.getElementById('achProgress');
const garageCoins = document.getElementById('garageCoins');
const carList = document.getElementById('carList');
const saleNote = document.getElementById('saleNote');
const recordBanner = document.getElementById('recordBanner');
const runCoinsVal = document.getElementById('runCoinsVal');
const runComboVal = document.getElementById('runComboVal');
const runDistVal = document.getElementById('runDistVal');
const newAchievements = document.getElementById('newAchievements');
const dailyBtn = document.getElementById('dailyBtn');
const dailyInfo = document.getElementById('dailyInfo');
const dailyStat = document.getElementById('dailyStat');
const reviveBtn = document.getElementById('reviveBtn');
const homeBtn = document.getElementById('homeBtn');

const magnetBar = badgeMagnet.querySelector('.badge-bar > i');
const boosterBar = badgeBooster.querySelector('.badge-bar > i');
const slowBar = badgeSlow.querySelector('.badge-bar > i');
const slipBar = badgeSlip.querySelector('.badge-bar > i');

// 가상 해상도 설정 (Canvas 내부 조율용 고정 비율)
const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

// 게임 상태 변수
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;

// --- [영구 저장 데이터] ---
// 최고 점수 하나만 남기면 다시 플레이할 이유가 없다.
// 누적 코인·도전과제·해금 차량을 함께 저장해 판을 거듭할수록 쌓이는 것이 생기게 한다.
const SAVE_KEY = 'toycar_save';
const LEGACY_KEY = 'toycar_highscore';
const MAX_RANKS = 5;

function defaultSave() {
  return {
    best: 0,
    scores: [],          // TOP 5 기록
    coins: 0,            // 해금에 쓰는 누적 코인
    runs: 0,
    totalDistance: 0,
    bestCombo: 1,
    achievements: {},
    unlocked: ['classic'],
    selected: 'classic',
    muted: false,
    daily: { date: '', best: 0 }   // 오늘의 도전 기록 (날짜가 바뀌면 초기화)
  };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = Object.assign(defaultSave(), parsed);
      // 저장 형식이 깨져 있어도 게임이 멈추지 않도록 형태를 보정한다
      if (!Array.isArray(merged.scores)) merged.scores = [];
      if (!Array.isArray(merged.unlocked) || merged.unlocked.length === 0) merged.unlocked = ['classic'];
      if (!merged.achievements || typeof merged.achievements !== 'object') merged.achievements = {};
      if (!merged.daily || typeof merged.daily !== 'object') merged.daily = { date: '', best: 0 };
      // 드래그 조작을 걷어내면서 쓰지 않게 된 항목. 남아 있어도 무해하지만 저장값을 깨끗이 둔다.
      delete merged.control;
      delete merged.dragSens;
      return merged;
    }
  } catch (e) {
    console.log('세이브 로드 실패, 새로 시작합니다:', e);
  }

  // 최고 점수만 저장하던 이전 버전에서 넘어온 경우 그 기록을 승계한다
  const fresh = defaultSave();
  const legacy = parseInt(localStorage.getItem(LEGACY_KEY), 10);
  if (legacy > 0) {
    fresh.best = legacy;
    fresh.scores = [legacy];
  }
  return fresh;
}

function persistSave() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {
    console.log('세이브 저장 실패:', e);
  }
}

const save = loadSave();
const MAX_LIVES = 3;
let lives = MAX_LIVES;
let keys = {};
let touchLeftPressed = false;
let touchRightPressed = false;

// 게임 밸런스 및 물리 상수 (초반 난이도를 쫄깃하게 4.8로 상향, 가속 및 최고속도 버프)
let gameSpeed = 4.8;
const BASE_SPEED = 4.8;
const MAX_SPEED = 12.0;
// 최고 속도까지 3분 30초가 걸려 초반이 늘어지던 문제를 해결. 약 80초면 최고 속도에 도달한다.
const SPEED_INC = 0.0015;

// --- [점수 및 콤보 밸런스] ---
// 기존에는 이미 60fps로 정규화된 dt를 16.6으로 한 번 더 나눠 주행 점수가 초당 3.6점에 그쳤다.
// 그 탓에 전체 점수의 90% 이상이 코인에서 나와 "멀리 달리는" 재미가 죽어 있었다.
const DISTANCE_SCORE = 1;   // 프레임당 1점 = 초당 60점
// 레벨이 오를수록 1초의 가치가 커진다. 후반일수록 한 순간을 버티기가 훨씬 어려우므로
// 시간 보상도 같이 가팔라져야 "멀리 달린다"는 목표가 코인 줍기에 묻히지 않는다.
const LEVEL_SCORE_BONUS = 0.5;
const COIN_SCORE = 70;
const RISKY_COIN_SCORE = 150; // 장애물 틈에 박아 둔 코인은 위험한 만큼 더 준다
const NEARMISS_SCORE = 60;
const DESTROY_SCORE = 120;
const HEART_FULL_SCORE = 400; // 라이프가 가득 찼을 때 하트를 먹으면 점수로 환산

// 콤보: 코인 획득과 아슬아슬 회피로 쌓이고, 피격하거나 일정 시간 놀면 사라진다.
let combo = 0;
let comboTimer = 0;
const COMBO_DURATION = 240; // 4초 안에 다음 획득이 없으면 콤보 소멸
const COMBO_STEP = 3;       // 3회마다 배수 1단계 상승
const MAX_COMBO_MULT = 8;

// --- [해금 차량 스킨] ---
// 색만 다르면 차고를 두 번 갈 이유가 없다. 차마다 특성을 하나씩 붙여
// "더 센 차"가 아니라 "다르게 노는 차"가 되게 한다. 강화 폭은 서로 비슷하게 맞췄다.
const CARS = [
  { id: 'classic', name: '클래식',   cost: 0,     body: '#FFDE59', stripe: '#FF5757', spoiler: '#2F3640',
    perk: '무난한 기본기' },
  { id: 'ruby',    name: '루비',     cost: 600,   body: '#FF5757', stripe: '#FFFFFF', spoiler: '#2F3640',
    perk: '시작할 때 보호막 1개', startShield: true },
  { id: 'mint',    name: '민트',     cost: 1500,  body: '#00CEC9', stripe: '#FFFFFF', spoiler: '#2F3640',
    perk: '콤보 지속 +50%', comboBonus: 1.5 },
  { id: 'shadow',  name: '섀도',     cost: 3000,  body: '#3D4454', stripe: '#FFDE59', spoiler: '#FFDE59',
    perk: '조향 반응 +25%', handling: 1.25 },
  { id: 'gold',    name: '골드',     cost: 5000,  body: '#FFD700', stripe: '#B8860B', spoiler: '#B8860B',
    perk: '코인 점수 +30%', coinBonus: 1.3 },
  { id: 'rainbow', name: '레인보우', cost: 9000,  body: null,      stripe: '#FFFFFF', spoiler: '#2F3640',
    perk: '아이템 지속 +40%', itemBonus: 1.4 }
];

// 매 프레임 CARS를 뒤지지 않도록 판 시작 때 한 번만 집어 둔다
let carPerk = CARS[0];

// --- [오늘의 도전] ---
// 매일 규칙이 하나씩 바뀐다. 혼자 해도 "오늘 몫의 한 판"이 생기고,
// 규칙이 강제되니 늘 쓰던 안전한 플레이가 통하지 않는다.
const DAILY_MODS = [
  { id: 'oneLife',  name: '한 번의 기회', desc: '하트 1개로 시작 · 점수 2배',    lives: 1, scoreMul: 2 },
  { id: 'sprint',   name: '전력 질주',   desc: '처음부터 고속 주행 · 점수 1.5배', speed: 8.6, scoreMul: 1.5 },
  { id: 'coinRush', name: '코인 러시',   desc: '코인 점수 2배 · 하트 미등장',    coinMul: 2, noHeart: true, scoreMul: 1 },
  { id: 'bare',     name: '맨몸 주행',   desc: '파워업 미등장 · 점수 1.8배',     noPowerup: true, scoreMul: 1.8 }
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 날짜 문자열을 해시로 돌려 규칙을 고른다. 같은 날이면 몇 번을 눌러도 같은 규칙이 나온다.
function todayMod() {
  const key = todayKey();
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return DAILY_MODS[Math.abs(h) % DAILY_MODS.length];
}

let dailyRun = false;
let activeMod = null;
let scoreMul = 1;

// 테스트 이벤트: 모든 차량을 기본 차량과 같은 값으로 할인한다.
// 끄면 원래 가격표로 돌아간다.
const CAR_SALE = true;
function carCost(skin) {
  return CAR_SALE ? CARS[0].cost : skin.cost;
}

function getSelectedCar() {
  return CARS.find(c => c.id === save.selected) || CARS[0];
}

// 레인보우는 body가 없고 매 프레임 색상환을 돈다
function carBodyColor() {
  const skin = getSelectedCar();
  return skin.body || `hsl(${Math.floor(Date.now() / 12) % 360}, 85%, 62%)`;
}

// --- [도전과제] ---
// 한 판이 끝날 때 평가한다. r은 이번 판 기록, s는 누적 세이브.
const ACHIEVEMENTS = [
  { id: 'first',     icon: '🚗', name: '첫 주행',       desc: '게임을 한 판 끝내기',        check: (r, s) => s.runs >= 1 },
  { id: 'combo4',    icon: '🔥', name: '콤보 마스터',   desc: '한 판에서 콤보 x4 달성',     check: (r) => r.maxMult >= 4 },
  { id: 'combo8',    icon: '💥', name: '콤보 지배자',   desc: '한 판에서 콤보 x8 달성',     check: (r) => r.maxMult >= 8 },
  { id: 'coin50',    icon: '🪙', name: '코인 수집가',   desc: '한 판에서 코인 50개 획득',   check: (r) => r.coins >= 50 },
  { id: 'nearmiss20',icon: '😱', name: '아슬아슬',      desc: '한 판에서 20번 스치기',      check: (r) => r.nearMisses >= 20 },
  { id: 'level5',    icon: '⚡', name: '속도광',        desc: 'LV.5 도달',                  check: (r) => r.level >= 5 },
  { id: 'level10',   icon: '🚀', name: '폭주기관차',    desc: 'LV.10 도달',                 check: (r) => r.level >= 10 },
  { id: 'flawless',  icon: '🛡️', name: '무결점',        desc: '피격 없이 LV.4 도달',        check: (r) => r.level >= 4 && r.damage === 0 },
  { id: 'destroy10', icon: '💣', name: '파괴왕',        desc: '한 판에서 장애물 10개 파괴', check: (r) => r.destroyed >= 10 },
  { id: 'score10k',  icon: '🏅', name: '만점 돌파',     desc: '30,000점 달성',              check: (r) => r.score >= 30000 },
  { id: 'score30k',  icon: '👑', name: '전설의 주행',   desc: '80,000점 달성',              check: (r) => r.score >= 80000 },
  { id: 'far3km',    icon: '📏', name: '장거리 주자',   desc: '한 판에 3,000m 주행',        check: (r) => r.distance >= 30000 }
];

// 화면상 10px을 1m로 환산해 표시한다
function toMeters(px) {
  return Math.floor(px / 10);
}

// 이번 판에서만 유효한 기록 (도전과제 판정용)
let runStats = { coins: 0, destroyed: 0, damage: 0, maxMult: 1, nearMisses: 0 };
let recordBeaten = false;

// 레벨 마일스톤.
// 점수에 연동하면 콤보가 잘 터진 판만 난이도가 폭주해 실력이 아닌 운이 난이도를 정해 버린다.
// 그래서 실제로 달린 거리를 기준으로 삼아 누구에게나 같은 속도로 압박이 올라오게 했다.
const LEVEL_DISTANCE = 6500; // 레벨 1 통과에 필요한 주행 거리(px)
const LEVEL_GROWTH = 1.12;   // 레벨이 오를수록 다음 구간이 조금씩 길어진다
let level = 1;
let distance = 0;
let nextLevelDistance = LEVEL_DISTANCE;

// 화면 흔들림(Screen Shake)
let shakeTime = 0;
let shakeAmount = 0;

// 파티클 시스템
let particles = [];
let dustParticles = [];
let speedLines = [];

// 아이템 및 장애물 상태 변수
let invincibleTime = 0;
const INVINCIBLE_DURATION = 90; // 프레임 기준 (약 1.5초)

let activeShield = false; // 보호막 활성화 여부
let boosterTime = 0;      // 부스터 피버 잔여 시간 (프레임)
let magnetTime = 0;       // 자석 활성화 잔여 시간 (프레임)
const BOOSTER_DURATION = 240; // 4초
const MAGNET_DURATION = 360;  // 6초

// 슬로우모션: 난장판 구간을 뚫고 나갈 여지를 주는 구제 아이템
let slowTime = 0;
const SLOW_DURATION = 300;  // 5초
const SLOW_FACTOR = 0.55;

// 웅덩이를 밟으면 잠시 접지력을 잃는다 (라이프는 안 깎이는 조작 방해형 함정)
let slipperyTime = 0;
const SLIPPERY_DURATION = 150; // 2.5초
const SLIPPERY_FRICTION = 0.93; // 잘 안 멈춤 = 미끄러짐
const SLIPPERY_ACC = 0.5;       // 접지력을 잃어 가속도 저하

// 코인 2배 보너스 게이트를 통과했을 때의 잔여 시간
let bonusTime = 0;
const BONUS_DURATION = 480; // 8초

// 마지막 하트가 깎인 직후의 슬로우모션. 죽기 직전이 가장 짜릿한 순간이 되도록
// 시간을 늘려 한 번 더 피할 기회를 주고, 위기라는 걸 몸으로 알게 한다.
let lastStandTime = 0;
const LAST_STAND_DURATION = 55;
const LAST_STAND_FACTOR = 0.4;

// --- [경찰 추격전] ---
// 정해진 거리마다 터지면 "왜 하필 지금"이 없어서 그냥 난이도 스파이크로 느껴진다.
// 그래서 길 건너는 사람이나 동물을 치었을 때만 경찰이 붙는다. 원인이 내 실수라서 납득이 되고,
// 무엇보다 잘 피하면 추격 자체가 일어나지 않는다.
// 15초를 버티면 코인 보너스, 잡히면 하트 1개.
//
// 추격자의 좌우 속도는 플레이어보다 느려야 한다. 여기서 기준은 car.maxVx(7.2)가 아니라
// 마찰까지 반영한 실제 순항 속도다: vx는 (vx + acc) * friction 으로 수렴하므로
// 0.95 * 0.8 / (1 - 0.8) ≈ 3.8px/프레임이 플레이어가 실제로 낼 수 있는 좌우 속도다.
// maxVx를 이 값 밑으로 유지해야 "계속 도망치면 떼어낼 수 있다"가 성립한다. 난이도 조절 지점.
const CHASE_DURATION = 900;  // 15초 (60fps 기준)
const CHASE_ESCAPE_COINS = 25;
const CHASE_ESCAPE_SCORE = 1200;
const CHASE_STUN = 70; // 장애물을 들이받은 추격자가 주춤하는 시간 (약 1.2초)
// maxVx = 좌우 최고 속도(위 3.8보다 낮아야 도망칠 수 있다), grip = 그 속도에 붙는 민첩함
const POLICE = { id: 'police', name: '경찰차', icon: '🚓', maxVx: 2.9, grip: 0.09, w: 38, h: 60 };
let chaser = null;           // 추격 중이 아니면 null
let sirenTimer = 0;

// 화면 방해 오일 효과 리스트
let screenOils = [];

// 통통 튀며 올라가는 플로팅 텍스트 리스트
let floatingTexts = [];

// 플레이어 캐릭터 (자동차)
const car = {
  x: GAME_WIDTH / 2,
  y: GAME_HEIGHT - 120,
  width: 36,
  height: 60,
  vx: 0,
  acc: 0.95,      
  friction: 0.80,  
  maxVx: 7.2,      
  angle: 0,
  wheelRotation: 0 // 바퀴 회전 비주얼 연출용
};

// 도로 디자인 변수
const roadWidth = 240;
const roadX = (GAME_WIDTH - roadWidth) / 2;
let roadOffset = 0;

// 도로 사이드 오브젝트 (나무, 꽃 등 데코레이션)
let sceneryObjects = [];

// 장애물 및 아이템 목록
let obstacles = [];
let gameItems = [];

let spawnTimer = 0;
let spawnInterval = 70; // 프레임당 스폰 주기 (더 촘촘하게 압박!)

// --- [Web Audio API 효과음 & 레트로 BGM 시스템] ---
let audioCtx = null;
let bgmTimer = 0; // dt 기반 BGM 타이머
let bgmSequenceIndex = 0;
let isBgmPlaying = false;
let isSuspendedByVisibility = false; // visibilitychange로 인한 일시중지 여부

// 귀여운 장난감 자동차에 어울리는 통통 튀는 레트로 8비트 베이스라인 멜로디 (도-미-솔-라 리듬)
const BGM_MELODY = [
  261.63, 329.63, 392.00, 440.00, // C4 - E4 - G4 - A4
  349.23, 440.00, 523.25, 587.33, // F4 - A4 - C5 - D5
  392.00, 493.88, 587.33, 659.25, // G4 - B4 - D5 - E5
  261.63, 329.63, 392.00, 523.25  // C4 - E4 - G4 - C5
];

function initAudio() {
  if (!audioCtx) {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    } catch (e) {
      console.log("AudioContext 초기화 에러:", e);
      audioCtx = null;
    }
  }
}

// 모바일 및 데스크톱 브라우저 자동 재생 정책 해제를 위한 오디오 언락 메커니즘
function unlockAudioContext() {
  try {
    initAudio();
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
      // 무음 오디오 버퍼 소스를 생성해서 재생시켜 락 해제
      const buffer = audioCtx.createBuffer(1, 1, 22050);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      
      // play/start 호출 및 state 감지
      if (source.start) {
        source.start(0);
      } else if (source.noteOn) {
        source.noteOn(0);
      }
      
      audioCtx.resume().then(() => {
        console.log("AudioContext 언락 성공: " + audioCtx.state);
        // 성공적으로 언락된 후 터치 이벤트 리스너들 제거
        window.removeEventListener('click', unlockAudioContext);
        window.removeEventListener('touchend', unlockAudioContext);
      }).catch(err => {
        console.log("AudioContext 언락 실패:", err);
      });
    } else {
      // 이미 언락된 상태라면 리스너 제거
      window.removeEventListener('click', unlockAudioContext);
      window.removeEventListener('touchend', unlockAudioContext);
    }
  } catch (e) {
    console.log("오디오 언락 처리 예외 (안전 조치 패스):", e);
  }
}

// 최초 제스처에 오디오 언락 이벤트 등록
window.addEventListener('click', unlockAudioContext);
window.addEventListener('touchend', unlockAudioContext);

// 부드러운 8비트 BGM 한 음 연주 함수
function playBgmNote() {
  if (save.muted) return;
  if (!audioCtx || gameState !== 'PLAYING' || isBgmPlaying === false || isSuspendedByVisibility) return;
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // 장난감 신디사이저 느낌의 부드러운 삼각파 사용
    osc.type = 'triangle';
    const noteFreq = BGM_MELODY[bgmSequenceIndex];
    
    // 고속 질주 피버(부스터) 중일 때는 음악 템포와 피치 1.3배 상승!
    const speedMultiplier = boosterTime > 0 ? 1.3 : 1.0;
    osc.frequency.setValueAtTime(noteFreq * speedMultiplier, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); // 배경음이므로 아주 부드럽고 잔잔하게 4% 볼륨
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
    
    // 다음 음으로 순환
    bgmSequenceIndex = (bgmSequenceIndex + 1) % BGM_MELODY.length;
  } catch (err) {
    console.log("BGM 연주 예외:", err);
  }
}

function startBgm() {
  isBgmPlaying = true;
  bgmSequenceIndex = 0;
  bgmTimer = 0; // 타이머 초기화
}

function stopBgm() {
  isBgmPlaying = false;
}

function playSound(type) {
  if (save.muted) return;
  try {
    initAudio();
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;

    if (type === 'coin') {
      // 맑은 높은 톤의 "띠링♪" 소리
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } 
    else if (type === 'item') {
      // 뾰로롱 상승 효과음
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, now); 
      osc.frequency.exponentialRampToValueAtTime(990, now + 0.35);
      gainNode.gain.setValueAtTime(0.14, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.start(now);
      osc.stop(now + 0.38);
    } 
    else if (type === 'booster') {
      // 제트기 슈우우웅 가속 효과음
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(1300, now + 0.85);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.start(now);
      osc.stop(now + 0.9);
    } 
    else if (type === 'splash') {
      // 웅덩이를 밟았을 때의 첨벙 소리
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.22);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    }
    else if (type === 'heal') {
      // 하트 회복 시의 따뜻한 상승음
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      osc.frequency.setValueAtTime(783.99, now + 0.24);
      gainNode.gain.setValueAtTime(0.14, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
    else if (type === 'slow') {
      // 시간이 늘어지는 듯한 하강음
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.55);
      gainNode.gain.setValueAtTime(0.13, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
    else if (type === 'nearmiss') {
      // 스쳐 지나갈 때의 짧고 산뜻한 "핑!" 신호음
      osc.type = 'square';
      osc.frequency.setValueAtTime(1180, now);
      osc.frequency.exponentialRampToValueAtTime(1720, now + 0.07);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
    else if (type === 'levelup') {
      // 레벨 상승 팡파레 (도-미-솔 상승 아르페지오)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);        // C5
      osc.frequency.setValueAtTime(659.25, now + 0.09); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.18); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.27); // C6
      gainNode.gain.setValueAtTime(0.13, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    }
    else if (type === 'crash') {
      // 쾅! 하는 둔탁한 폭발성 소리
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.4);
      gainNode.gain.setValueAtTime(0.28, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } 
    else if (type === 'siren') {
      // 삐뽀삐뽀 사이렌. 추격 내내 1초마다 다시 울리므로 볼륨은 낮게 잡았다.
      osc.type = 'square';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.setValueAtTime(988, now + 0.22);
      osc.frequency.setValueAtTime(740, now + 0.44);
      osc.frequency.setValueAtTime(988, now + 0.66);
      gainNode.gain.setValueAtTime(0.07, now);
      gainNode.gain.setValueAtTime(0.07, now + 0.82);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.92);
      osc.start(now);
      osc.stop(now + 0.92);
    }
    else if (type === 'gameover') {
      // 멜랑꼴리한 패배 하강 멜로디
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(349.23, now + 0.15); // F4
      osc.frequency.setValueAtTime(293.66, now + 0.3);  // D4
      osc.frequency.linearRampToValueAtTime(110, now + 0.85);
      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.start(now);
      osc.stop(now + 0.9);
    }
  } catch (err) {
    console.log("사운드 재생 제한:", err);
  }
}

// 1. 캔버스 해상도 조절
function resizeCanvas() {
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
}

// 2. 키보드 입력 핸들링
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (['ArrowUp', 'ArrowDown', ' ', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
    e.preventDefault();
  }

  // 러너 장르의 생명은 "한 판만 더"의 마찰이 없는 것.
  // 대기/게임오버 상태에서 Space 또는 Enter로 즉시 재시작한다.
  if (!e.repeat && (e.key === ' ' || e.key === 'Enter') && gameState !== 'PLAYING') {
    // 기록이나 차고를 보고 있는 중이라면 실수로 판이 시작되지 않게 막는다
    if (statsScreen.classList.contains('active') || garageScreen.classList.contains('active')) {
      closeScreen(statsScreen);
      closeScreen(garageScreen);
      return;
    }
    startGame(dailyRun);
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// 3. 모바일 터치 이벤트 핸들링 (touchstart와 mousedown의 스마트폰 중복 트리거 방지)
// 스마트폰에서는 touch와 mouse가 연속 트리거되어 순간 가속도가 2배가 되는 현상이 있었습니다.
// e.stopPropagation() 및 mousedown에서의 터치 디바이스 판별 처리를 추가하여 이를 완벽히 방어합니다.
let isTouchDevice = false;

touchLeft.addEventListener('touchstart', (e) => {
  e.preventDefault();
  e.stopPropagation();
  isTouchDevice = true;
  touchLeftPressed = true;
}, { passive: false });

touchRight.addEventListener('touchstart', (e) => {
  e.preventDefault();
  e.stopPropagation();
  isTouchDevice = true;
  touchRightPressed = true;
}, { passive: false });

touchLeft.addEventListener('touchend', (e) => {
  e.preventDefault();
  e.stopPropagation();
  touchLeftPressed = false;
}, { passive: false });

touchLeft.addEventListener('touchcancel', (e) => {
  e.preventDefault();
  e.stopPropagation();
  touchLeftPressed = false;
}, { passive: false });

touchRight.addEventListener('touchend', (e) => {
  e.preventDefault();
  e.stopPropagation();
  touchRightPressed = false;
}, { passive: false });

touchRight.addEventListener('touchcancel', (e) => {
  e.preventDefault();
  e.stopPropagation();
  touchRightPressed = false;
}, { passive: false });

touchLeft.addEventListener('mousedown', (e) => {
  if (isTouchDevice) return; // 모바일이면 터치가 우선하므로 마우스 리스너 무시
  touchLeftPressed = true;
});
touchLeft.addEventListener('mouseup', () => touchLeftPressed = false);
touchLeft.addEventListener('mouseleave', () => touchLeftPressed = false);

touchRight.addEventListener('mousedown', (e) => {
  if (isTouchDevice) return;
  touchRightPressed = true;
});
touchRight.addEventListener('mouseup', () => touchRightPressed = false);
touchRight.addEventListener('mouseleave', () => touchRightPressed = false);

// 4. 조작 안내 가이드
// 터치 영역은 평소 투명해서 어디를 눌러야 하는지 알 수가 없다.
// 그래서 판이 시작될 때만 좌우 버튼을 잠깐 띄워 알려주고 스르르 사라지게 한다.
const TOUCH_GUIDE_MS = 3200;
let touchGuideTimer = null;

function showTouchGuide() {
  touchControls.classList.add('guide');
  clearTimeout(touchGuideTimer);
  touchGuideTimer = setTimeout(() => touchControls.classList.remove('guide'), TOUCH_GUIDE_MS);
}


// --- [그리기 보조 함수군 - 벡터 그래픽 고도화] ---

// 1) 귀여운 구름 그리기
function drawCloud(ctx, x, y, size) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
  ctx.arc(x + size * 1.5, y, size * 0.7, 0, Math.PI * 2);
  ctx.arc(x + size * 0.8, y + size * 0.3, size * 0.8, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

// 2) 귀여운 둥글둥글 나무 그리기
function drawTree(ctx, x, y) {
  // 나무 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 나무 기둥
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(x - 5, y, 10, 20);
  
  // 나무 나뭇잎 (풍성하게 레이어 추가)
  ctx.fillStyle = '#26AE60';
  ctx.beginPath();
  ctx.arc(x, y - 8, 17, 0, Math.PI * 2);
  ctx.arc(x - 10, y - 16, 13, 0, Math.PI * 2);
  ctx.arc(x + 10, y - 16, 13, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2ECC71';
  ctx.beginPath();
  ctx.arc(x, y - 10, 13, 0, Math.PI * 2);
  ctx.arc(x - 6, y - 16, 10, 0, Math.PI * 2);
  ctx.arc(x + 6, y - 16, 10, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  
  // 빨간 미니 사과 포인트
  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.arc(x - 6, y - 10, 3, 0, Math.PI * 2);
  ctx.arc(x + 7, y - 5, 3, 0, Math.PI * 2);
  ctx.arc(x + 1, y - 18, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

// 3) 귀여운 꽃 그리기
function drawFlower(ctx, x, y) {
  // 꽃대
  ctx.strokeStyle = '#26DE81';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 10);
  ctx.stroke();
  
  // 꽃잎 5개
  ctx.fillStyle = '#FD9644';
  const petalCount = 5;
  const radius = 5;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 2 * Math.PI) / petalCount;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 꽃수술 (노란색 센터)
  ctx.fillStyle = '#FED330';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

// 풍차 데코레이션 그리기
function drawWindmill(ctx, x, y, rot) {
  // 지지대
  ctx.fillStyle = '#ECEFF1';
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 30);
  ctx.lineTo(x - 4, y - 10);
  ctx.lineTo(x + 4, y - 10);
  ctx.lineTo(x + 12, y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 날개 중심
  ctx.fillStyle = '#78909C';
  ctx.beginPath();
  ctx.arc(x, y - 10, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 회전하는 4개 날개
  ctx.save();
  ctx.translate(x, y - 10);
  ctx.rotate(rot);
  ctx.fillStyle = '#FF7675';
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.roundRect(-3, 0, 6, 26, 3);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

// 4) 플레이어 자동차 그리기 (바퀴 굴러감, 스크롤 매칭 배기 가스)
function drawPlayer() {
  if (invincibleTime > 0 && Math.floor(invincibleTime / 4) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  // 1. 그림자 효과 (부스터 상태일 때 파랗게 빛남)
  if (boosterTime > 0) {
    ctx.fillStyle = 'rgba(9, 132, 227, 0.4)';
    ctx.shadowColor = '#00DEC9';
    ctx.shadowBlur = 15;
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
  }
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 2, -car.height / 2 + 5, car.width + 4, car.height + 2, 10);
  ctx.fill();
  ctx.shadowBlur = 0; // 섀도 리셋

  // 2. 바퀴 회전 및 좌우 꺾임 디테일 바퀴
  ctx.fillStyle = '#2F3640';
  const drawWheel = (wx, wy) => {
    ctx.save();
    ctx.translate(wx, wy);
    // 달릴 때 바퀴 회전 무늬 느낌
    const rotSize = Math.sin(car.wheelRotation) * 2;
    ctx.fillRect(-2.5, -6, 5, 12);
    // 바퀴 줄무늬
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2.5, rotSize - 2, 5, 3);
    ctx.restore();
  };

  // 앞좌측
  drawWheel(-car.width / 2 - 2, -car.height / 2 + 10);
  // 앞우측
  drawWheel(car.width / 2 + 2, -car.height / 2 + 10);
  // 뒤좌측
  drawWheel(-car.width / 2 - 2, car.height / 2 - 14);
  // 뒤우측
  drawWheel(car.width / 2 + 2, car.height / 2 - 14);

  // 3. 메인 바디 (차고에서 고른 스킨 색상, 부스터 중에는 네온 블루로 전환)
  const skin = getSelectedCar();
  ctx.fillStyle = boosterTime > 0 ? '#00DEC9' : carBodyColor();
  ctx.beginPath();
  ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 12);
  ctx.fill();
  
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 스포티 스트라이프 데칼 라인 추가
  ctx.fillStyle = boosterTime > 0 ? '#FFFFFF' : skin.stripe;
  ctx.fillRect(-4, -car.height / 2 + 4, 8, car.height - 8);

  // 4. 유리창 (하늘색 그라데이션)
  const glassGrad = ctx.createLinearGradient(0, -car.height/4, 0, 0);
  glassGrad.addColorStop(0, '#E8F4F8');
  glassGrad.addColorStop(1, '#81ECEC');
  ctx.fillStyle = glassGrad;
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 4, -car.height / 4, car.width - 8, 14, 4);
  ctx.fill();
  ctx.stroke();
  
  // 뒷유리창
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 5, car.height / 4, car.width - 10, 8, 3);
  ctx.fill();
  ctx.stroke();

  // 5. 헤드라이트 (둥글동글)
  ctx.fillStyle = boosterTime > 0 ? '#FFEAA7' : '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-car.width / 3, -car.height / 2 + 1, 4, 0, Math.PI * 2);
  ctx.arc(car.width / 3, -car.height / 2 + 1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 6. 리어 윙 스포일러 (스포츠카 느낌 극대화)
  ctx.fillStyle = boosterTime > 0 ? '#FF7675' : skin.spoiler;
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 4, car.height / 2 - 4, car.width + 8, 5, 2);
  ctx.fill();

  // --- [배리어 보호막 시각효과] ---
  if (activeShield) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 206, 201, 0.8)';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00CEC9';
    // 크기가 미세하게 일렁임
    const shieldScale = 1.25 + Math.sin(Date.now() / 80) * 0.05;
    ctx.beginPath();
    ctx.arc(0, 0, car.height * 0.65 * shieldScale, 0, Math.PI * 2);
    ctx.stroke();
    // 은은한 안쪽 채우기
    ctx.fillStyle = 'rgba(129, 236, 236, 0.15)';
    ctx.fill();
    ctx.restore();
  }

  // --- [자석 흡입 영역 효과] ---
  if (magnetTime > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 118, 117, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    const magnetScale = 1.4 + Math.sin(Date.now() / 100) * 0.06;
    ctx.beginPath();
    ctx.arc(0, 0, 110 * magnetScale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// 5) 고깔 콘 그리기
function drawCone(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 콘 밑받침
  ctx.fillStyle = '#2F3640';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, h / 2 - 4, w + 4, 5, 2);
  ctx.fill();

  ctx.fillStyle = '#FD9644';
  ctx.beginPath();
  ctx.roundRect(-w / 2, h / 2 - 6, w, 4, 2);
  ctx.fill();

  // 콘 삼각뿔
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(-w / 2.5, h / 2 - 6);
  ctx.lineTo(w / 2.5, h / 2 - 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 흰색 줄무늬
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-w / 7, -h / 6);
  ctx.lineTo(w / 7, -h / 6);
  ctx.lineTo(w / 4.5, h / 6);
  ctx.lineTo(-w / 4.5, h / 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 6) 귀여운 장애물 진짜 바위 그리기 (동그라미가 아닌 디테일하고 입체적인 각진 다각형 바위)
function drawRock(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, h / 3, w * 0.55, h * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // 각진 입체 다각형 바위 그리기
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';

  // 1. 왼쪽 뒤쪽 음영면 (어두운 회색)
  ctx.fillStyle = '#7F8C8D';
  ctx.beginPath();
  ctx.moveTo(-w/2, h/4);
  ctx.lineTo(-w/3, -h/3);
  ctx.lineTo(0, -h/2);
  ctx.lineTo(-w/8, h/6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. 오른쪽 메인 면 (중간 회색)
  ctx.fillStyle = '#95A5A6';
  ctx.beginPath();
  ctx.moveTo(0, -h/2);
  ctx.lineTo(w/2.5, -h/4);
  ctx.lineTo(w/2, h/3);
  ctx.lineTo(w/6, h/2);
  ctx.lineTo(-w/8, h/6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. 상단 하이라이트 면 (밝은 회색)
  ctx.fillStyle = '#BDC3C7';
  ctx.beginPath();
  ctx.moveTo(-w/3, -h/3);
  ctx.lineTo(0, -h/2);
  ctx.lineTo(w/2.5, -h/4);
  ctx.lineTo(0, -h/6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. 바위 바닥 면
  ctx.fillStyle = '#7F8C8D';
  ctx.beginPath();
  ctx.moveTo(-w/2, h/4);
  ctx.lineTo(-w/8, h/6);
  ctx.lineTo(w/6, h/2);
  ctx.lineTo(-w/3, h/2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 갈라진 틈새 크랙 데코 추가
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -h/6);
  ctx.lineTo(-w/5, -h/25);
  ctx.lineTo(-w/7, h/10);
  ctx.stroke();

  ctx.restore();
}

// 7) 공사중 바리케이드 그리기 (가로가 긴 신규 장애물)
function drawBarrier(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 지지대 (양 끝 다리)
  ctx.fillStyle = '#4B5563';
  ctx.fillRect(-w/2 + 2, -h/2, 6, h);
  ctx.fillRect(w/2 - 8, -h/2, 6, h);
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-w/2 + 2, -h/2, 6, h);
  ctx.strokeRect(w/2 - 8, -h/2, 6, h);

  // 노랑/블랙 빗금 전면 보드
  ctx.fillStyle = '#FED330';
  ctx.beginPath();
  ctx.roundRect(-w/2, -h/3, w, h * 0.6, 4);
  ctx.fill();
  ctx.stroke();

  // 검은색 빗금들
  ctx.fillStyle = '#2F3640';
  for (let offset = -w/2 + 8; offset < w/2; offset += 20) {
    ctx.beginPath();
    ctx.moveTo(offset, -h/3);
    ctx.lineTo(offset + 8, -h/3);
    ctx.lineTo(offset - 4, h/3 - 4);
    ctx.lineTo(offset - 12, h/3 - 4);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// 8) 오일 드럼통 그리기 (트릭 장애물)
function drawOilDrum(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(-w/2 - 2, h/2 - 3, w + 4, 6);

  // 바디 그라데이션 (금속 깡통 광택)
  const drumGrad = ctx.createLinearGradient(-w/2, 0, w/2, 0);
  drumGrad.addColorStop(0, '#2F3640');
  drumGrad.addColorStop(0.5, '#718093');
  drumGrad.addColorStop(1, '#2F3640');
  ctx.fillStyle = drumGrad;
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(-w/2, -h/2, w, h, 6);
  ctx.fill();
  ctx.stroke();

  // 중간 라인 장식
  ctx.beginPath();
  ctx.moveTo(-w/2, -h/6);
  ctx.lineTo(w/2, -h/6);
  ctx.moveTo(-w/2, h/6);
  ctx.lineTo(w/2, h/6);
  ctx.stroke();

  // 해골 마크 대신 주황색 오일 방울 비주얼 포인트
  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.arc(0, 2, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 9) 물웅덩이 그리기 (밟으면 미끄러지는 조작 방해형 함정)
function drawPuddle(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = 'rgba(52, 73, 94, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#74B9FF';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 찰랑이는 물결 하이라이트
  ctx.strokeStyle = 'rgba(223, 249, 251, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-w * 0.12, -h * 0.12, w * 0.22, h * 0.18, 0, Math.PI * 0.9, Math.PI * 1.95);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(w * 0.18, h * 0.1, w * 0.14, h * 0.12, 0, Math.PI * 0.9, Math.PI * 1.95);
  ctx.stroke();

  ctx.restore();
}

// 10) 마주 오는 교통 차량 그리기 (좌우로 움직이는 이동형 장애물)
function drawTrafficCar(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, -h / 2 + 5, w + 4, h, 10);
  ctx.fill();

  // 바퀴
  ctx.fillStyle = '#2F3640';
  ctx.fillRect(-w / 2 - 3, -h / 2 + 9, 5, 12);
  ctx.fillRect(w / 2 - 2, -h / 2 + 9, 5, 12);
  ctx.fillRect(-w / 2 - 3, h / 2 - 21, 5, 12);
  ctx.fillRect(w / 2 - 2, h / 2 - 21, 5, 12);

  // 보라색 바디 (플레이어의 노란 차와 확실히 구분)
  ctx.fillStyle = '#A29BFE';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 11);
  ctx.fill();
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 유리창
  const glass = ctx.createLinearGradient(0, 0, 0, h / 4);
  glass.addColorStop(0, '#81ECEC');
  glass.addColorStop(1, '#E8F4F8');
  ctx.fillStyle = glass;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 4, h / 8, w - 8, 13, 4);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 5, -h / 3, w - 10, 8, 3);
  ctx.fill();
  ctx.stroke();

  // 플레이어를 향한 헤드라이트
  ctx.fillStyle = '#FFEAA7';
  ctx.beginPath();
  ctx.arc(-w / 3, h / 2 - 1, 4, 0, Math.PI * 2);
  ctx.arc(w / 3, h / 2 - 1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 길 건너는 보행자/동물. 치면 안 되는 대상이라 장애물과 확실히 달라 보여야 한다.
// 진행 방향으로 몸을 돌리고 팔다리를 종종거리며, 머리 위 경고 방울로 "건너는 중"을 알린다.
function drawCrosser(ctx, obs) {
  const w = obs.width;
  const h = obs.height;
  const dir = obs.vx >= 0 ? 1 : -1;   // 걸어가는 방향 (스프라이트가 이쪽을 본다)
  const swing = Math.sin(obs.step) * 3.2;

  ctx.save();
  ctx.translate(obs.x, obs.y);

  // 바닥 그림자. 진하면 발과 뭉쳐서 검은 덩어리로 보이므로 옅고 얇게 깐다.
  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 2.5, w / 2 - 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (obs.type === 'critter') {
    drawCritterBody(ctx, w, h, dir, swing, obs.tone);
  } else {
    drawWalkerBody(ctx, w, h, dir, swing, obs.tone);
  }

  // 머리 위 경고 방울
  ctx.fillStyle = '#FFDE59';
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -h / 2 - 11, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#E01E1E';
  ctx.beginPath();
  ctx.roundRect(-1.5, -h / 2 - 16, 3, 6, 1.5);
  ctx.arc(0, -h / 2 - 7.5, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 보행자: 머리 · 몸통 · 흔들리는 팔다리
function drawWalkerBody(ctx, w, h, dir, swing, tone) {
  const outline = '#2F3640';
  const skin = '#FFE0BD';
  const headR = 7.5;
  const headY = -h / 2 + headR + 1;
  const bodyTop = headY + headR - 1;
  const bodyH = h / 2 + 1;

  // 뒤쪽 다리 → 몸통 → 앞쪽 다리 순으로 그려야 겹침이 자연스럽다
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-2, bodyTop + bodyH - 3);
  ctx.lineTo(-2 - swing, h / 2 - 1);
  ctx.stroke();

  // 몸통 (옷)
  ctx.fillStyle = tone || '#74B9FF';
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 3, bodyTop, w - 6, bodyH, 5);
  ctx.fill();
  ctx.stroke();

  // 흔들리는 팔 (다리와 반대 위상)
  ctx.strokeStyle = outline;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(dir * (w / 2 - 4), bodyTop + 4);
  ctx.lineTo(dir * (w / 2 - 4) + swing * 0.8, bodyTop + 12);
  ctx.stroke();

  // 앞쪽 다리 + 신발 (신발이 크면 그림자와 뭉쳐 발이 안 보인다)
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(3, bodyTop + bodyH - 3);
  ctx.lineTo(3 + swing, h / 2 - 1);
  ctx.stroke();
  ctx.fillStyle = '#3D5AFE';
  ctx.beginPath();
  ctx.ellipse(3 + swing + dir * 1.2, h / 2, 2.6, 1.6, 0, 0, Math.PI * 2);
  ctx.ellipse(-2 - swing + dir * 1.2, h / 2, 2.6, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 머리
  ctx.fillStyle = skin;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 머리카락 (윗부분을 덮는 반원)
  ctx.fillStyle = '#4A3728';
  ctx.beginPath();
  ctx.arc(0, headY, headR, Math.PI * 1.08, Math.PI * 2.02);
  ctx.fill();

  // 진행 방향을 보는 눈
  ctx.fillStyle = outline;
  ctx.beginPath();
  ctx.arc(dir * 2.6, headY + 1.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

// 동물: 통통한 몸통 · 쫑긋한 귀 · 살랑이는 꼬리
function drawCritterBody(ctx, w, h, dir, swing, tone) {
  const outline = '#2F3640';
  const fur = tone || '#FDCB6E';
  const headX = dir * (w / 2 - 6);

  // 꼬리 (진행 반대쪽에서 살랑살랑). 굵으면 다리 하나가 더 달린 것처럼 보인다.
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-dir * (w / 2 - 5), -1);
  ctx.quadraticCurveTo(
    -dir * (w / 2 + 1), -4 + swing * 0.6,
    -dir * (w / 2 - 1), -10 + swing * 0.6
  );
  ctx.stroke();

  // 다리. 몸통 밖으로 벌어지면 거미처럼 보이므로 짧고 곧게, 몸통 폭 안쪽에 붙인다.
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-4, h / 2 - 7); ctx.lineTo(-4 - swing * 0.5, h / 2 - 1);
  ctx.moveTo(4, h / 2 - 7);  ctx.lineTo(4 + swing * 0.5, h / 2 - 1);
  ctx.stroke();

  // 몸통
  ctx.fillStyle = fur;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(-dir * 2, 0, w / 2 - 3, h / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 머리
  ctx.beginPath();
  ctx.arc(headX, -2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 쫑긋한 귀 두 개
  ctx.beginPath();
  ctx.moveTo(headX - 4.5, -7);
  ctx.lineTo(headX - 5.5, -14);
  ctx.lineTo(headX - 0.5, -8.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + 4.5, -7);
  ctx.lineTo(headX + 5.5, -14);
  ctx.lineTo(headX + 0.5, -8.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 눈과 코
  ctx.fillStyle = outline;
  ctx.beginPath();
  ctx.arc(headX + dir * 1.5, -3.5, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + dir * 5.5, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

// 추격자 렌더링. 번쩍이는 경광등으로 화면 아래 어두운 쪽에서도 알아볼 수 있게 한다.
function drawChaser(ctx, c) {
  const w = c.kind.w;
  const h = c.kind.h;
  const blink = Math.floor(Date.now() / 130) % 2 === 0;

  ctx.save();
  ctx.translate(c.x, c.y);

  // 장애물을 들이받고 주춤하는 동안에는 좌우로 휘청여서 지금은 못 덤빈다는 걸 알린다
  if (c.stun > 0) ctx.rotate(Math.sin(Date.now() / 45) * 0.13);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, -h / 2 + 6, w + 4, h, 11);
  ctx.fill();

  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3;

  {
    // 경찰차: 흑백 투톤 바디
    ctx.fillStyle = '#F5F6FA';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 11);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2F3640';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 6, w, h / 3, 3);
    ctx.fill();

    ctx.fillStyle = '#81ECEC';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 5, h / 5, w - 10, 13, 4);
    ctx.fill();
    ctx.stroke();
  }

  // 빨강/파랑이 번갈아 번쩍이는 경광등.
  // 화면 아래쪽은 터치 버튼과 겹쳐 어두우므로, 이 불빛이 추격자를 알아보는 주된 단서가 된다.
  const beacon = blink ? '#FF3B3B' : '#3B7BFF';
  ctx.fillStyle = beacon;
  ctx.beginPath();
  ctx.roundRect(-11, -h / 2 - 6, 22, 9, 4);
  ctx.fill();
  ctx.stroke();

  // 번쩍이는 쪽으로 퍼지는 빛무리
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = beacon;
  ctx.beginPath();
  ctx.arc(blink ? -8 : 8, -h / 2 - 2, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // 플레이어를 쫓는 헤드라이트
  ctx.fillStyle = '#FFEAA7';
  ctx.beginPath();
  ctx.arc(-w / 3.2, h / 2 - 2, 4, 0, Math.PI * 2);
  ctx.arc(w / 3.2, h / 2 - 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// --- [아이템 드로잉 함수군] ---

// 1) 코인 렌더링 (빛나는 둥근 금화)
function drawCoinItem(ctx, x, y, size, risky) {
  ctx.save();
  ctx.translate(x, y);

  // 공전 반짝임 펄스 크기 계산
  const pulse = Math.sin(Date.now() / 120) * 1.5;
  const radius = size / 2 + pulse;

  // 위험 지대에 놓인 고배점 코인은 붉은 경고 링으로 구분
  if (risky) {
    ctx.strokeStyle = 'rgba(255, 87, 87, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([3, 3]);
    ctx.lineDashOffset = -Date.now() / 60;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 외곽선/그림자
  ctx.fillStyle = '#D4AF37';
  ctx.beginPath();
  ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
  ctx.fill();

  // 메인 바디
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // 중심 장식 (C자 음각 느낌)
  ctx.strokeStyle = '#F39C12';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// 2) 피버 부스터 렌더링 (로켓 ⚡모양)
function drawBoosterItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  // 위아래 통통 튀는 모션
  const bounce = Math.sin(Date.now() / 100) * 3;
  ctx.translate(0, bounce);

  // 아우라 광원
  ctx.shadowColor = '#00CEC9';
  ctx.shadowBlur = 12;

  // 붉은 메인 로켓 바디
  ctx.fillStyle = '#0984E3';
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-size/2.5, -size/1.8, size * 0.8, size * 1.1, 8);
  ctx.fill();
  ctx.stroke();

  // ⚡ 번개 마크 데코
  ctx.fillStyle = '#FFDE59';
  ctx.beginPath();
  ctx.moveTo(-2, -8);
  ctx.lineTo(6, -2);
  ctx.lineTo(1, 0);
  ctx.lineTo(5, 7);
  ctx.lineTo(-4, 0);
  ctx.lineTo(1, -2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// 3) 보호막 쉴드 렌더링 (하트 또는 방패 🛡️)
function drawShieldItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  const bounce = Math.sin(Date.now() / 110) * 3.5;
  ctx.translate(0, bounce);

  ctx.shadowColor = '#81ECEC';
  ctx.shadowBlur = 10;

  // 방패 플레이트
  ctx.fillStyle = '#00CEC9';
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -size/1.8);
  ctx.lineTo(size/2, -size/3);
  ctx.lineTo(size/2.5, size/4);
  ctx.lineTo(0, size/1.8);
  ctx.lineTo(-size/2.5, size/4);
  ctx.lineTo(-size/2, -size/3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 십자 하이라이트 문양
  ctx.strokeStyle = '#E8F4F8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -size/3);
  ctx.lineTo(0, size/3);
  ctx.moveTo(-size/4, 0);
  ctx.lineTo(size/4, 0);
  ctx.stroke();

  ctx.restore();
}

// 4) 자석 🧲 렌더링
function drawMagnetItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  const bounce = Math.sin(Date.now() / 95) * 3;
  ctx.translate(0, bounce);

  ctx.shadowColor = '#FF7675';
  ctx.shadowBlur = 10;

  ctx.strokeStyle = '#D63031';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';

  // 말굽 자석 렌더링
  ctx.beginPath();
  ctx.arc(0, 2, size * 0.35, Math.PI, 0, true);
  // 양 극 기둥 밑으로 뻗음
  ctx.lineTo(size * 0.35, -7);
  ctx.moveTo(-size * 0.35, 2);
  ctx.lineTo(-size * 0.35, -7);
  ctx.stroke();

  // 철판 쇠받이 (자석 극 끝단 하얀 부분)
  ctx.strokeStyle = '#ECEFF1';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -7);
  ctx.lineTo(-size * 0.35, -11);
  ctx.moveTo(size * 0.35, -7);
  ctx.lineTo(size * 0.35, -11);
  ctx.stroke();

  ctx.restore();
}

// 5) 하트 회복 아이템 ❤️ 렌더링
function drawHeartItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + Math.sin(Date.now() / 110) * 3);

  ctx.shadowColor = '#FF7675';
  ctx.shadowBlur = 12;

  const s = size / 22;
  ctx.fillStyle = '#FF5757';
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 9 * s);
  ctx.bezierCurveTo(-13 * s, -1 * s, -8 * s, -13 * s, 0, -5 * s);
  ctx.bezierCurveTo(8 * s, -13 * s, 13 * s, -1 * s, 0, 9 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 반짝이는 하이라이트
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.ellipse(-4 * s, -3 * s, 2.6 * s, 3.4 * s, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 6) 슬로우모션 모래시계 ⏳ 렌더링
function drawSlowItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + Math.sin(Date.now() / 105) * 3);

  ctx.shadowColor = '#A29BFE';
  ctx.shadowBlur = 10;

  const s = size / 2;
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 2.5;

  // 위아래 나무 프레임
  ctx.fillStyle = '#DFE6E9';
  ctx.beginPath();
  ctx.roundRect(-s * 0.78, -s, s * 1.56, 4.5, 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(-s * 0.78, s - 4.5, s * 1.56, 4.5, 2);
  ctx.fill();
  ctx.stroke();

  // 위아래 유리구 (모래가 담긴 삼각형)
  ctx.fillStyle = '#A29BFE';
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, -s + 4.5);
  ctx.lineTo(s * 0.6, -s + 4.5);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-s * 0.6, s - 4.5);
  ctx.lineTo(s * 0.6, s - 4.5);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}


// 선택 게이트: 어느 문으로 들어갈지 스스로 고르게 만드는 표지판.
// 황금 문은 코인 2배지만 바로 뒤가 장애물 밭이라 대가를 치러야 한다.
function drawGate(ctx, x, y, w, h, bonus) {
  ctx.save();
  ctx.translate(x, y);

  const half = w / 2;
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3;

  // 양쪽 기둥
  ctx.fillStyle = bonus ? '#B8860B' : '#4A934A';
  ctx.beginPath();
  ctx.roundRect(-half, -h / 2, 9, h, 3);
  ctx.roundRect(half - 9, -h / 2, 9, h, 3);
  ctx.fill();
  ctx.stroke();

  // 현수막
  ctx.fillStyle = bonus ? '#FFD700' : '#7ED957';
  if (bonus) {
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 12;
  }
  ctx.beginPath();
  ctx.roundRect(-half + 6, -h / 2, w - 12, h * 0.62, 5);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#2F3640';
  ctx.font = '900 15px "Jua", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bonus ? '🪙 x2 위험' : '✅ 안전', 0, -h / 2 + h * 0.31);

  ctx.restore();
}


// --- [게임 시스템 및 라이프사이클 관리] ---

// 하트 UI 실시간 갱신
function updateHeartsUI() {
  heartContainer.innerHTML = '';
  for (let i = 0; i < MAX_LIVES; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = i < lives ? '❤️' : '🖤';
    heartContainer.appendChild(heart);
  }
}

// --- [콤보 시스템] ---
function getComboMult() {
  return Math.min(MAX_COMBO_MULT, 1 + Math.floor(combo / COMBO_STEP));
}

// 코인 획득/아슬아슬 회피 성공 시 콤보 적립
function addCombo() {
  const prevMult = getComboMult();
  combo++;
  comboTimer = COMBO_DURATION * (carPerk.comboBonus || 1);

  const newMult = getComboMult();
  if (newMult > runStats.maxMult) runStats.maxMult = newMult;
  // 배수가 한 단계 올라간 순간에만 요란하게 알려준다
  if (newMult > prevMult) {
    addFloatingText(car.x, car.y - 62, `COMBO x${newMult}!`, '#FFDE59');
    comboBox.classList.remove('pop');
    void comboBox.offsetWidth; // 애니메이션 재생을 위한 리플로우 강제
    comboBox.classList.add('pop');
  }
}

// 피격 시 콤보 소멸
function resetCombo() {
  if (combo >= COMBO_STEP) {
    addFloatingText(car.x, car.y - 62, 'COMBO BREAK...', '#B2BEC3');
  }
  combo = 0;
  comboTimer = 0;
}

// 점수 획득 통합 처리 (콤보 배수 자동 적용)
function gainScore(baseValue) {
  const gain = Math.round(baseValue * getComboMult() * scoreMul);
  score += gain;
  return gain;
}

// 레벨 마일스톤 도달 연출
function checkLevelUp() {
  if (distance < nextLevelDistance) return;
  level++;
  nextLevelDistance += LEVEL_DISTANCE * Math.pow(LEVEL_GROWTH, level - 1);
  playSound('levelup');
  addFloatingText(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `LEVEL ${level} • SPEED UP!`, '#FF5757');
  shakeTime = 14;
  shakeAmount = 5;
}

// --- [기록 / 차고 화면 렌더링] ---

// 저장된 이름 등을 그대로 innerHTML에 넣지 않도록 최소한의 이스케이프
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

function renderStats() {
  statRuns.textContent = save.runs;
  statDistance.textContent = toMeters(save.totalDistance).toLocaleString() + 'm';
  statCoins.textContent = save.coins.toLocaleString();
  statCombo.textContent = 'x' + save.bestCombo;

  // TOP 5
  rankList.innerHTML = '';
  if (save.scores.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = '아직 기록이 없어요';
    rankList.appendChild(li);
  } else {
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    save.scores.forEach((s, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="rank-num">${medals[i] || (i + 1)}</span>` +
                     `<span>${s.toLocaleString()}점</span>`;
      rankList.appendChild(li);
    });
  }

  updateDailyInfo();

  // 도전과제
  const done = ACHIEVEMENTS.filter(a => save.achievements[a.id]).length;
  achProgress.textContent = `${done} / ${ACHIEVEMENTS.length}`;
  achList.innerHTML = '';
  for (const ach of ACHIEVEMENTS) {
    const unlocked = !!save.achievements[ach.id];
    const li = document.createElement('li');
    li.className = unlocked ? 'done' : '';
    li.innerHTML =
      `<span class="ach-icon">${unlocked ? ach.icon : '🔒'}</span>` +
      `<span class="ach-text"><b>${escapeHtml(ach.name)}</b><span>${escapeHtml(ach.desc)}</span></span>`;
    achList.appendChild(li);
  }
}

function renderGarage() {
  garageCoins.textContent = save.coins.toLocaleString();
  if (saleNote) saleNote.classList.toggle('hidden', !CAR_SALE);
  carList.innerHTML = '';

  for (const skin of CARS) {
    const owned = save.unlocked.includes(skin.id);
    const selected = save.selected === skin.id;
    const cost = carCost(skin);
    const affordable = !owned && save.coins >= cost;

    const card = document.createElement('div');
    card.className = 'car-card' +
      (selected ? ' selected' : '') +
      (owned ? '' : ' locked') +
      (affordable ? ' affordable' : '');

    // 레인보우는 미리보기에서도 색이 도는 것을 보여준다
    const swatchColor = skin.body || 'hsl(300, 85%, 62%)';
    const status = owned
      ? (selected ? '<span class="car-status owned">선택됨</span>' : '<span class="car-status owned">보유</span>')
      : `<span class="car-status${affordable ? ' affordable' : ''}">🪙 ${cost.toLocaleString()}` +
        (CAR_SALE && skin.cost > cost ? ` <s>${skin.cost.toLocaleString()}</s>` : '') + '</span>';

    card.innerHTML =
      `<div class="car-swatch" style="background:${swatchColor}; --stripe:${skin.stripe}"></div>` +
      `<span class="car-name">${escapeHtml(skin.name)}</span>` +
      `<span class="car-perk">${escapeHtml(skin.perk)}</span>` + status;

    card.addEventListener('click', () => selectOrBuyCar(skin));
    carList.appendChild(card);
  }
}

// 보유 중이면 선택, 아니면 코인으로 구매를 시도한다
function selectOrBuyCar(skin) {
  if (save.unlocked.includes(skin.id)) {
    save.selected = skin.id;
    playSound('item');
  } else if (save.coins >= carCost(skin)) {
    save.coins -= carCost(skin);
    save.unlocked.push(skin.id);
    save.selected = skin.id;
    playSound('levelup');
  } else {
    // 코인이 모자라면 아무 일도 일어나지 않는다
    playSound('nearmiss');
    return;
  }
  persistSave();
  renderGarage();
}

function openScreen(screen) {
  if (screen === statsScreen) renderStats();
  if (screen === garageScreen) renderGarage();
  screen.classList.add('active');
}

function closeScreen(screen) {
  screen.classList.remove('active');
}

function updateMuteButton() {
  muteBtn.textContent = save.muted ? '🔇' : '🔊';
}

// 오늘의 규칙과 오늘 기록을 시작 화면과 기록 화면에 함께 보여준다
function updateDailyInfo() {
  const mod = todayMod();
  const todayBest = save.daily.date === todayKey() ? save.daily.best : 0;
  const text = `<b>${escapeHtml(mod.name)}</b> · ${escapeHtml(mod.desc)}` +
    `<br>오늘 최고 ${todayBest.toLocaleString()}점`;
  if (dailyInfo) dailyInfo.innerHTML = text;
  if (dailyStat) dailyStat.innerHTML = text;
}

// --- [콤보/아이템 상태 HUD 갱신] ---
// 매 프레임 DOM을 건드리면 낭비이므로 값이 바뀐 항목만 갱신한다.
let lastComboVisible = null;
let lastComboMult = -1;
let lastLevel = -1;
let lastShieldOn = null;
let lastMagnetOn = null;
let lastBoosterOn = null;
let lastSlowOn = null;
let lastSlipOn = null;

function toggleBadge(el, isOn, lastState) {
  if (isOn !== lastState) {
    el.classList.toggle('visible', isOn);
  }
  return isOn;
}

function updateStatusUI() {
  // 콤보 박스
  const comboVisible = combo > 0;
  if (comboVisible !== lastComboVisible) {
    comboBox.classList.toggle('visible', comboVisible);
    lastComboVisible = comboVisible;
  }
  if (comboVisible) {
    const mult = getComboMult();
    if (mult !== lastComboMult) {
      comboMultEl.textContent = 'x' + mult;
      lastComboMult = mult;
    }
    comboGauge.style.width = Math.max(0, (comboTimer / COMBO_DURATION) * 100) + '%';
  }

  // 레벨 표기
  if (level !== lastLevel) {
    levelVal.textContent = 'LV.' + level;
    lastLevel = level;
  }

  // 아이템 잔여시간 배지
  lastShieldOn = toggleBadge(badgeShield, activeShield, lastShieldOn);

  const magnetOn = magnetTime > 0;
  lastMagnetOn = toggleBadge(badgeMagnet, magnetOn, lastMagnetOn);
  if (magnetOn) {
    magnetBar.style.width = (magnetTime / MAGNET_DURATION) * 100 + '%';
  }

  const boosterOn = boosterTime > 0;
  lastBoosterOn = toggleBadge(badgeBooster, boosterOn, lastBoosterOn);
  if (boosterOn) {
    boosterBar.style.width = (boosterTime / BOOSTER_DURATION) * 100 + '%';
  }

  const slowOn = slowTime > 0;
  lastSlowOn = toggleBadge(badgeSlow, slowOn, lastSlowOn);
  if (slowOn) {
    slowBar.style.width = (slowTime / SLOW_DURATION) * 100 + '%';
  }

  // 웅덩이 디버프도 표시해야 조작이 왜 미끄러운지 납득할 수 있다
  const slipOn = slipperyTime > 0;
  lastSlipOn = toggleBadge(badgeSlip, slipOn, lastSlipOn);
  if (slipOn) {
    slipBar.style.width = (slipperyTime / SLIPPERY_DURATION) * 100 + '%';
  }
}

// 게임 시작 초기화
function startGame(daily = false) {
  initAudio();
  startBgm(); // 레트로 배경음 실행
  playSound('item'); // 게임 시작 뾰로롱
  gameState = 'PLAYING';

  // 판마다 선택된 차와 오늘의 규칙을 한 번만 확정한다
  carPerk = getSelectedCar();
  dailyRun = !!daily;
  activeMod = dailyRun ? todayMod() : null;
  scoreMul = (activeMod && activeMod.scoreMul) || 1;

  score = 0;
  lives = (activeMod && activeMod.lives) || MAX_LIVES;
  gameSpeed = (activeMod && activeMod.speed) || BASE_SPEED;
  invincibleTime = 0;
  activeShield = !!carPerk.startShield;
  boosterTime = 0;
  magnetTime = 0;
  slowTime = 0;
  slipperyTime = 0;
  bonusTime = 0;
  lastStandTime = 0;
  revivedThisRun = false;
  preGameOverSave = null;

  // 이전 판에서 누르고 있던 상태가 남으면 새 판 시작하자마자 차가 그쪽으로 쏠린다
  touchLeftPressed = touchRightPressed = false;

  combo = 0;
  comboTimer = 0;
  level = 1;
  distance = 0;
  nextLevelDistance = LEVEL_DISTANCE;
  spawnTimer = 0;
  spawnInterval = 70;
  chaser = null;

  runStats = { coins: 0, destroyed: 0, damage: 0, maxMult: 1, nearMisses: 0 };
  recordBeaten = false;

  car.x = GAME_WIDTH / 2;
  car.vx = 0;
  car.angle = 0;
  car.wheelRotation = 0;
  
  obstacles = [];
  gameItems = [];
  particles = [];
  dustParticles = [];
  speedLines = [];
  screenOils = [];
  floatingTexts = [];
  sceneryObjects = [];
  
  // 넉넉하게 배경 데코 스폰
  for (let i = 0; i < 8; i++) {
    sceneryObjects.push({
      x: Math.random() < 0.5 ? Math.random() * (roadX - 35) + 15 : Math.random() * (GAME_WIDTH - roadX - 35) + roadX + roadWidth + 20,
      y: Math.random() * GAME_HEIGHT,
      type: Math.random() < 0.4 ? 'tree' : (Math.random() < 0.75 ? 'flower' : 'windmill'),
      rot: Math.random() * Math.PI
    });
  }

  scoreVal.textContent = score;
  updateHeartsUI();
  updateStatusUI();

  startScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');

  // 터치 영역은 평소 보이지 않으므로, 판이 시작될 때만 좌우 버튼을 띄워 조작법을 알려준다
  showTouchGuide();

  // 오늘 어떤 규칙으로 달리는지 판 시작에 한 번 알려 준다
  if (activeMod) {
    addFloatingText(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, `🗓️ ${activeMod.name}`, '#FFDE59');
    addFloatingText(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, activeMod.desc, '#FFFFFF');
  }

  // 버튼에 포커스가 남아 있으면 Space/Enter 재시작이 버튼 클릭과 중복 발동한다
  startBtn.blur();
  restartBtn.blur();
}

// --- [코인 부활] ---
// 잘 달리던 판이 한 번의 실수로 끝나는 게 가장 아깝다. 모아 둔 코인으로 딱 한 번 되산다.
const REVIVE_COST = 300;
// 코인 하나당 실제로 쌓이는 코인 가치. 300코인 모으기가 유독 힘들다는 피드백을 반영해 50% 상향.
const COIN_VALUE_MULT = 1.5;
let revivedThisRun = false;
let preGameOverSave = null;   // 게임오버가 기록에 반영한 내용을 되돌리기 위한 직전 상태

function doRevive() {
  if (revivedThisRun || !preGameOverSave || preGameOverSave.coins < REVIVE_COST) return;

  // 게임오버가 이미 누적 기록에 반영해 버렸으므로 통째로 되돌린 뒤 값만 치른다.
  // 판이 끝날 때 다시 정상적으로 반영된다.
  Object.assign(save, preGameOverSave);
  save.coins -= REVIVE_COST;
  persistSave();
  revivedThisRun = true;

  gameOverScreen.classList.remove('active');
  gameState = 'PLAYING';
  lives = 1;
  invincibleTime = 150;
  lastStandTime = 0;
  combo = 0;
  comboTimer = 0;

  // 부활하자마자 눈앞의 장애물에 그대로 다시 박으면 코인만 날린 셈이 된다
  obstacles = obstacles.filter(o => o.y < car.y - 220);

  // 추격에 잡혀서 끝난 판이라면 살아나자마자 다시 잡히지 않도록 추격을 풀어준다
  chaser = null;

  startBgm();
  playSound('heal');
  updateHeartsUI();
  updateStatusUI();
  addFloatingText(car.x, car.y - 60, '부활! 💖', '#FF5757');
}

// 게임 오버
function triggerGameOver() {
  stopBgm(); // 배경음 중단
  playSound('gameover'); // 패배 하강 멜로디
  gameState = 'GAMEOVER';

  // 게임오버 후에도 콤보/아이템 배지가 화면에 남지 않도록 상태 정리
  combo = 0;
  comboTimer = 0;
  activeShield = false;
  boosterTime = 0;
  magnetTime = 0;
  slowTime = 0;
  slipperyTime = 0;
  bonusTime = 0;
  lastStandTime = 0;
  updateStatusUI();

  // 부활을 고르면 여기서 반영한 기록을 통째로 되돌려야 하므로 직전 상태를 남겨 둔다
  preGameOverSave = JSON.parse(JSON.stringify(save));

  // 실시간 획득 점수가 소수점을 가지므로 정수형으로 소수점 절사 보정
  const roundedScore = Math.floor(score);

  // 오늘의 도전은 규칙이 점수를 부풀리므로 평상시 순위표와 섞지 않는다
  if (save.daily.date !== todayKey()) save.daily = { date: todayKey(), best: 0 };
  const isNewRecord = dailyRun
    ? roundedScore > save.daily.best
    : roundedScore > save.best;

  // 누적 기록 갱신
  save.runs++;
  const earnedCoins = Math.round(runStats.coins * COIN_VALUE_MULT);
  save.coins += earnedCoins;
  save.totalDistance += distance;
  if (runStats.maxMult > save.bestCombo) save.bestCombo = runStats.maxMult;

  if (dailyRun) {
    if (isNewRecord) save.daily.best = roundedScore;
  } else {
    if (isNewRecord) save.best = roundedScore;

    // TOP 5 순위표 갱신
    save.scores.push(roundedScore);
    save.scores.sort((a, b) => b - a);
    save.scores = save.scores.slice(0, MAX_RANKS);
  }

  const newlyUnlocked = evaluateAchievements(roundedScore);
  persistSave();

  finalScore.textContent = roundedScore;
  bestScore.textContent = dailyRun ? save.daily.best : save.best;
  runCoinsVal.textContent = earnedCoins;
  runComboVal.textContent = 'x' + runStats.maxMult;
  runDistVal.textContent = toMeters(distance) + 'm';

  recordBanner.classList.toggle('visible', isNewRecord);

  // 부활은 판당 한 번, 그리고 판 시작 전에 이미 모아 둔 코인으로만 살 수 있다
  if (reviveBtn) {
    const canRevive = !revivedThisRun && preGameOverSave.coins >= REVIVE_COST;
    reviveBtn.classList.toggle('hidden', !canRevive);
    reviveBtn.textContent = `💖 부활하기 (🪙 ${REVIVE_COST})`;
  }

  // 이번 판에 새로 딴 도전과제를 결과 화면에 모아 보여준다
  if (newlyUnlocked.length > 0) {
    newAchievements.innerHTML = '<p><b>🎊 새 도전과제!</b></p>' +
      newlyUnlocked.map(a => `<p>${a.icon} ${escapeHtml(a.name)}</p>`).join('');
    newAchievements.classList.add('visible');
  } else {
    newAchievements.classList.remove('visible');
  }

  gameOverScreen.classList.add('active');
}

// 이번 판 결과로 새로 달성한 도전과제를 가려낸다
function evaluateAchievements(finalScoreValue) {
  const result = {
    score: finalScoreValue,
    level: level,
    distance: distance,
    coins: runStats.coins,
    destroyed: runStats.destroyed,
    damage: runStats.damage,
    maxMult: runStats.maxMult,
    nearMisses: runStats.nearMisses
  };

  const newly = [];
  for (const ach of ACHIEVEMENTS) {
    if (save.achievements[ach.id]) continue;
    let ok = false;
    try {
      ok = ach.check(result, save);
    } catch (e) {
      console.log('도전과제 판정 오류:', ach.id, e);
    }
    if (ok) {
      save.achievements[ach.id] = true;
      newly.push(ach);
    }
  }
  return newly;
}

// 충돌 처리 (보호막 유무 판정)
function handleCollision(obsIndex) {
  const obs = obstacles[obsIndex];

  // 길 건너던 사람/동물을 친 경우. 라이프는 깎이지 않지만 경찰이 붙는다.
  // 부스터나 보호막보다 먼저 판정한다 — 어떤 아이템으로도 그냥 치고 지나갈 수는 없어야 한다.
  if (obs.crossing) {
    obstacles.splice(obsIndex, 1);
    playSound('crash');
    createCrashParticles(obs.x, obs.y, '#FFEAA7');
    addFloatingText(obs.x, obs.y - 20, '앗, 놀랐잖아! 💢', '#FF5757');
    resetCombo();
    shakeTime = 16;
    shakeAmount = 7;
    startChase();
    return;
  }

  // 오일통과 웅덩이는 라이프를 깎지 않는 방해형 함정.
  // 오일은 시야를, 웅덩이는 조작을 망가뜨린다.
  if (obs.type === 'oildrum' || obs.type === 'puddle') {
    obstacles.splice(obsIndex, 1);

    // 부스터로 질주 중일 땐 함정도 그냥 뚫고 지나간다
    if (boosterTime > 0) return;

    if (obs.type === 'oildrum') {
      playSound('crash');
      createCrashParticles(obs.x, obs.y, '#2F3640');
      triggerScreenOil();
      addFloatingText(car.x, car.y - 40, "미끌미끌!", "#718093");
      shakeTime = 8;
      shakeAmount = 4;
    } else {
      playSound('splash');
      createCrashParticles(obs.x, obs.y, '#74B9FF');
      slipperyTime = SLIPPERY_DURATION;
      addFloatingText(car.x, car.y - 40, "미끄덩!", "#74B9FF");
      shakeTime = 6;
      shakeAmount = 3;
    }
    return;
  }

  // 부스터 피버 모드일 땐 부딪혀도 장애물이 그냥 터져서 날아감
  if (boosterTime > 0) {
    obstacles.splice(obsIndex, 1);
    playSound('crash');
    createCrashParticles(obs.x, obs.y, '#FFD700');
    addCombo();
    runStats.destroyed++;
    const gain = gainScore(DESTROY_SCORE);
    addFloatingText(obs.x, obs.y, `파괴!! +${gain}`, "#00DEC9");
    shakeTime = 6;
    shakeAmount = 5;
    return;
  }

  // 보호막이 켜져있을 경우 배리어가 막아주고 종료
  if (activeShield) {
    activeShield = false;
    obstacles.splice(obsIndex, 1);
    playSound('item'); // 가벼운 사운드
    createCrashParticles(obs.x, obs.y, '#81ECEC');
    addFloatingText(car.x, car.y - 40, "SHIELD BLOCK!", "#00CEC9");
    shakeTime = 10;
    shakeAmount = 5;
    invincibleTime = 45; // 짧은 무적 시간 부여
    return;
  }

  // 일반 충돌 시 라이프 차감
  obstacles.splice(obsIndex, 1);
  takeDamage();
}

// 라이프 1 차감 경로. 장애물 충돌과 추격자에게 잡힌 경우가 모두 여기를 지난다.
function takeDamage(label = "앗!!") {
  playSound('crash');
  lives--;
  runStats.damage++;
  updateHeartsUI();
  resetCombo();

  shakeTime = 20;
  shakeAmount = 10;
  createCrashParticles(car.x, car.y - 10, '#FF7675');
  addFloatingText(car.x, car.y - 40, label, "#FF5757");

  if (lives <= 0) {
    triggerGameOver();
    return;
  }

  invincibleTime = INVINCIBLE_DURATION;
  // 하트 하나만 남은 순간, 시간을 늘려 위기라는 걸 몸으로 알린다
  if (lives === 1) {
    lastStandTime = LAST_STAND_DURATION;
    playSound('slow');
    addFloatingText(car.x, car.y - 70, '마지막 하트!', '#FF5757');
  }
}

// --- [경찰 추격전 로직] ---

// 길 건너던 사람이나 동물을 쳤을 때만 호출된다. 이미 쫓기는 중이면 시간이 처음으로 되돌아간다.
function startChase() {
  if (chaser) {
    chaser.time = CHASE_DURATION;
    addFloatingText(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '또 쳤다! 15초 처음부터!', '#FF5757');
    playSound('siren');
    return;
  }

  chaser = {
    kind: POLICE,
    x: car.x,
    y: GAME_HEIGHT + 60, // 화면 아래(플레이어 뒤)에서 밀고 올라온다
    vx: 0,
    time: CHASE_DURATION,
    lungePhase: Math.PI, // 물러나 있는 상태에서 시작해 등장 직후 반응할 틈을 준다
    stun: 0              // 장애물을 들이받아 주춤한 잔여 시간
  };
  sirenTimer = 0;
  playSound('siren');
  shakeTime = 16;
  shakeAmount = 5;
  addFloatingText(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '🚓 경찰 출동!', '#FF5757');
  addFloatingText(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, '15초만 버텨!', '#FFDE59');
}

function endChase(escaped) {
  if (!chaser) return;
  chaser = null;
  if (!escaped) return;

  runStats.coins += CHASE_ESCAPE_COINS;
  const gain = gainScore(CHASE_ESCAPE_SCORE);
  playSound('levelup');
  addFloatingText(car.x, car.y - 62, `따돌렸다! 🪙+${CHASE_ESCAPE_COINS}`, '#FFD700');
  addFloatingText(car.x, car.y - 28, `+${gain}`, '#FFD700');
  createCrashParticles(car.x, car.y, '#FFD700');
  shakeTime = 12;
  shakeAmount = 4;
}

function updateChase(dt) {
  if (!chaser) return; // 추격은 사람/동물을 쳤을 때만 시작된다 (startChase 호출부 참고)

  const c = chaser;
  c.time -= dt;
  if (c.time <= 0) {
    endChase(true);
    return;
  }

  // 사이렌은 1초마다 다시 울려 추격 중이라는 걸 계속 상기시킨다
  sirenTimer -= dt;
  if (sirenTimer <= 0) {
    sirenTimer = 60;
    playSound('siren');
  }

  // 뒤에 계속 붙어 있으면 벽에 몰린 순간 빠져나갈 길이 사라져 "피할 수 없는 죽음"이 된다.
  // 그래서 추격자는 물러나 있다가 짧게 들이받기를 반복한다. 물러난 사이에 반대편으로
  // 건너갈 틈이 생기고, 들이받는 순간이 곧 피해야 할 타이밍이 되어 리듬이 읽힌다.
  const progress = 1 - c.time / CHASE_DURATION;
  if (c.stun > 0) {
    // 주춤하는 동안에는 달려들기가 취소되고, 풀린 뒤 물러난 상태에서 다시 시작한다.
    // 앞으로 갈 수 없는 플레이어에게 "숨 돌릴 틈"을 만들어 주는 보상이다.
    c.stun -= dt;
    c.lungePhase = Math.PI;
  } else {
    c.lungePhase += (0.022 + progress * 0.012) * dt;
  }
  // 지수를 올릴수록 물러나 있는 시간이 길고 들이받는 순간이 짧아진다 = 숨 돌릴 틈
  const lunge = Math.pow(Math.max(0, Math.sin(c.lungePhase)), 5);
  // 조향을 일찍 멈출수록 "덤벼들 자리"가 빨리 고정되어 비킬 시간이 길어진다.
  // 벽에 몰린 채 잡히는 억울한 죽음이 여기서 갈린다.
  const lunging = lunge > 0.04;

  // 좌우 추적. 최고 속도가 플레이어보다 느리므로 계속 움직이면 떼어낼 수 있다.
  // 단, 들이받는 동안에는 조향을 멈추고 달려든 자리에 그대로 꽂힌다. 덤비는 지점이
  // 미리 고정되므로 옆으로 한 걸음만 비켜도 피해진다 = 벽에 몰려도 살길이 남는다.
  if (lunging || c.stun > 0) {
    c.vx *= Math.pow(0.88, dt);
  } else {
    // 목표 속도를 거리에 비례시켜 잡는다. 단순 가속이면 플레이어를 지나쳐 좌우로 출렁이다가
    // 가만히 서 있는 상대조차 놓친다. 이렇게 하면 흔들림 없이 옆 차선에 딱 붙는다.
    const desiredVx = Math.max(-c.kind.maxVx, Math.min(c.kind.maxVx, (car.x - c.x) * 0.12));
    c.vx += (desiredVx - c.vx) * Math.min(1, c.kind.grip * dt);
  }
  c.x += c.vx * dt;

  const minX = roadX + c.kind.w / 2;
  const maxX = roadX + roadWidth - c.kind.w / 2;
  if (c.x < minX) { c.x = minX; c.vx = 0; }
  if (c.x > maxX) { c.x = maxX; c.vx = 0; }

  // 물러난 위치도 화면 안이어야 한다. 플레이어가 y=520이라 간격을 124까지 벌리면 캔버스(640)
  // 밖으로 나가 추격자가 아예 보이지 않고, 그러면 들이받는 리듬을 읽을 수가 없다.
  const targetY = car.y + 92 - lunge * 70;
  c.y += (targetY - c.y) * Math.min(1, 0.12 * dt);

  // 추격자도 도로 위 장애물을 그대로 들이받는다. 뒤에서 쫓아오는 상대를 앞으로는 피할 수 없으니,
  // 장애물이 내려오는 줄에 서 있다가 옆으로 빠져 대신 맞게 하는 것이 유일한 반격 수단이 된다.
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    if (obs.type === 'puddle') continue; // 바닥에 고인 물은 그냥 밟고 지나간다
    if (Math.abs(obs.x - c.x) > (obs.width + c.kind.w) * 0.5 * 0.7) continue;
    if (Math.abs(obs.y - c.y) > (obs.height + c.kind.h) * 0.5 * 0.7) continue;

    obstacles.splice(i, 1);
    c.stun = CHASE_STUN;
    playSound('crash');
    createCrashParticles(obs.x, obs.y, '#FD9644');
    addCombo();
    const gain = gainScore(DESTROY_SCORE);
    addFloatingText(c.x, c.y - 40, `유인 성공! +${gain}`, '#7ED957');
    shakeTime = 10;
    shakeAmount = 4;
  }

  // 잡힘 판정. 추격 중에는 장애물도 같이 피해야 하므로 히트박스를 넉넉하게 잡았다.
  const hitX = Math.abs(car.x - c.x) < (car.width + c.kind.w) * 0.5 * 0.56;
  const hitY = Math.abs(car.y - c.y) < (car.height + c.kind.h) * 0.5 * 0.56;
  if (!hitX || !hitY) return;

  // 피버 중에는 그대로 들이받고 뚫어 버린다 = 탈출 성공
  if (boosterTime > 0) {
    endChase(true);
    return;
  }
  if (invincibleTime > 0) return;

  // 보호막은 한 번 막아주고 추격자를 잠시 밀어낸다. 추격 자체는 계속된다.
  if (activeShield) {
    activeShield = false;
    playSound('item');
    createCrashParticles(car.x, car.y, '#81ECEC');
    addFloatingText(car.x, car.y - 40, 'SHIELD BLOCK!', '#00CEC9');
    invincibleTime = 45;
    c.y += 80;
    return;
  }

  takeDamage('잡혔다!!');
  endChase(false);
}

// 충돌 스파크 파티클
function createCrashParticles(x, y, color = '#FD9644') {
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 3;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, 
      size: Math.random() * 6 + 3,
      color: color === 'random' ? (Math.random() < 0.5 ? '#FFD700' : '#81ECEC') : color,
      alpha: 1,
      decay: Math.random() * 0.035 + 0.02
    });
  }
}

// 배기구 흙먼지 파티클 추가
function spawnDust() {
  if (gameState !== 'PLAYING') return;
  // 바퀴 양쪽 뒤에서 흙먼지가 조금씩 보글보글 일어남
  const rotFactor = car.angle;
  const leftX = car.x - 14 - Math.sin(rotFactor) * 15;
  const rightX = car.x + 14 - Math.sin(rotFactor) * 15;
  const dustY = car.y + car.height / 2;

  const createDustObj = (dx) => {
    dustParticles.push({
      x: dx,
      y: dustY,
      vx: (Math.random() - 0.5) * 1 - car.vx * 0.2,
      vy: gameSpeed * 0.3 + Math.random() * 1.2, // 속도감 비례
      size: Math.random() * 5 + 3,
      alpha: 0.6,
      decay: Math.random() * 0.03 + 0.02
    });
  };

  createDustObj(leftX);
  createDustObj(rightX);
}

// 오일 충돌 시 시각방해 효과 설정
function triggerScreenOil() {
  screenOils.push({
    x: Math.random() * (GAME_WIDTH - 60) + 30,
    y: Math.random() * (GAME_HEIGHT / 2) + 80,
    radius: Math.random() * 25 + 15,
    alpha: 0.9,
    life: 180 // 약 3초 유지
  });
}

// 통통 뜨는 점수/텍스트 팝업 추가
function addFloatingText(x, y, text, color = '#FFD700') {
  floatingTexts.push({
    x: x,
    y: y,
    text: text,
    color: color,
    vy: -1.8,
    alpha: 1.0,
    scale: 1.0
  });
}

// --- [패턴 기반 스폰 시스템] ---
// 장애물을 매번 무작위 위치에 하나씩 떨어뜨리면 죽어도 "운이 나빴다"로만 느껴진다.
// 손으로 설계한 배치를 통째로 내보내야 플레이어가 형태를 읽고 공략을 익히는 재미가 생긴다.

const OBSTACLE_SPECS = {
  cone:    { w: 24, h: 32 },
  rock:    { w: 28, h: 28 },
  barrier: { w: 62, h: 34 },
  oildrum: { w: 26, h: 38 },
  puddle:  { w: 54, h: 26 },
  car:     { w: 34, h: 56 },
  // 길을 건너는 보행자와 동물. 치면 라이프 대신 경찰 추격이 붙는다.
  walker:  { w: 22, h: 30 },
  critter: { w: 26, h: 22 }
};

// 옷·털 색을 몇 가지 돌려써서 매번 같은 사람이 나오는 느낌을 없앤다
const WALKER_TONES = ['#74B9FF', '#FF7675', '#55EFC4', '#FD79A8', '#A29BFE'];
const CRITTER_TONES = ['#FDCB6E', '#E17055', '#DFE6E9', '#B2BEC3'];

// 걷는 속도. 옆으로 움직이는 장애물은 "지금 위치"가 아니라 "부딪힐 때 위치"를 예측해야 해서,
// 빠르면 빈 곳을 보고 꺾은 순간 그리로 걸어와 버린다. 화면 위에서 플레이어 앞까지 내려오는
// 동안의 가로 이동이 한 차선(약 60px)을 넘지 않도록 잡은 값이다. 난이도 조절 지점.
const CROSSER_SPEED_MIN = 0.4;
const CROSSER_SPEED_MAX = 0.75;

// 건너는 대상은 도로 가장자리에서 출발해 반대편으로 걸어간다.
// 다른 장애물과 달리 도로 벽에 튕기지 않고 화면 밖으로 걸어 나가야 하므로 crossing 표식을 단다.
function pushCrosser(type, fromLeft, dy = 0) {
  const spec = OBSTACLE_SPECS[type];
  const tones = type === 'critter' ? CRITTER_TONES : WALKER_TONES;
  const speed = CROSSER_SPEED_MIN + Math.random() * (CROSSER_SPEED_MAX - CROSSER_SPEED_MIN);
  obstacles.push({
    x: fromLeft ? roadX - spec.w : roadX + roadWidth + spec.w,
    y: SPAWN_TOP - dy,
    width: spec.w,
    height: spec.h,
    type: type,
    scored: false,
    speedMul: 1,
    vx: (fromLeft ? 1 : -1) * speed,
    crossing: true,
    step: Math.random() * Math.PI * 2,          // 걷는 애니메이션 위상
    tone: tones[Math.floor(Math.random() * tones.length)]
  });
  if (dy > patternDepth) patternDepth = dy;
}

const SPAWN_TOP = -46;
let patternDepth = 0; // 현재 패턴이 세로로 차지하는 길이 (다음 스폰 간격 계산용)

// t(0~1)를 도로 위 실제 x좌표로 변환. 폭이 있는 오브젝트가 도로 밖으로 새지 않게 보정한다.
function roadPos(t, w) {
  return roadX + w / 2 + Math.min(1, Math.max(0, t)) * (roadWidth - w);
}

function pushObs(type, t, dy = 0, opts = {}) {
  const spec = OBSTACLE_SPECS[type];
  obstacles.push({
    x: roadPos(t, spec.w),
    y: SPAWN_TOP - dy,
    width: spec.w,
    height: spec.h,
    type: type,
    scored: false,
    speedMul: opts.speedMul || 1,
    vx: opts.vx || 0
  });
  if (dy > patternDepth) patternDepth = dy;
}

// 게이트는 도로 절반을 가로막는 넓적한 문이라 다른 아이템과 크기가 다르다
const GATE_W = 112;
const GATE_H = 30;

function pushItem(type, t, dy = 0, risky = false) {
  const isGate = type === 'gateBonus' || type === 'gateSafe';
  const w = isGate ? GATE_W : (type === 'coin' ? 20 : 25);
  const h = isGate ? GATE_H : w;
  gameItems.push({
    x: roadPos(t, w),
    y: SPAWN_TOP - dy,
    width: w,
    height: h,
    type: type,
    risky: risky
  });
  if (dy > patternDepth) patternDepth = dy;
}

function randomObstacleType() {
  const roll = Math.random();
  if (roll < 0.40) return 'cone';
  if (roll < 0.68) return 'rock';
  if (roll < 0.84) return 'barrier';
  return 'oildrum';
}

function randomPowerupType() {
  // 오늘의 도전 규칙에 따라 파워업 자체가 막히거나 하트만 빠진다
  if (activeMod && activeMod.noPowerup) return 'coin';
  const roll = Math.random();
  if (roll < 0.30) return 'shield';
  if (roll < 0.54) return 'magnet';
  if (roll < 0.74) return 'booster';
  if (roll < 0.88) return 'slow';
  return (activeMod && activeMod.noHeart) ? 'shield' : 'heart';
}

// 각 패턴은 minLevel(등장 시작 레벨)과 weight(등장 빈도)를 가진다.
// 레벨이 오를수록 까다로운 패턴이 후보에 추가되어 자연스럽게 난이도가 올라간다.
const PATTERNS = [
  {
    // 기본형: 장애물 하나와 곁들인 코인
    name: 'single', minLevel: 1, weight: 26, growth: -0.06,
    build() {
      const t = Math.random();
      pushObs(randomObstacleType(), t);
      if (Math.random() < 0.55) {
        // 장애물 반대편 안전지대에 코인을 둔다
        pushItem('coin', t < 0.5 ? t + 0.42 : t - 0.42, 70);
      }
    }
  },
  {
    // 코인 트레일: S자로 흐르는 코인 줄기를 따라가면 자연스럽게 장애물을 피하게 된다
    name: 'coinTrail', minLevel: 1, weight: 18, growth: -0.03,
    build() {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const base = 0.5 - dir * 0.32;
      for (let i = 0; i < 6; i++) {
        pushItem('coin', base + dir * (i / 5) * 0.64, i * 46);
      }
      // 트레일 옆구리에 장애물을 하나 붙여 경로를 강제한다
      pushObs(randomObstacleType(), 0.5 + dir * 0.44, 120);
    }
  },
  {
    // 지그재그: 좌우로 번갈아 나오는 벽. 리듬을 타면 뚫린다
    name: 'zigzag', minLevel: 1, weight: 16,
    build() {
      const dir = Math.random() < 0.5 ? 1 : -1;
      for (let i = 0; i < 3; i++) {
        const side = i % 2 === 0 ? dir : -dir;
        pushObs('barrier', 0.5 + side * 0.5, i * 105);
        // 빠져나가는 쪽에 코인을 놓아 최적 경로를 알려준다
        pushItem('coin', 0.5 - side * 0.42, i * 105 + 52);
      }
    }
  },
  {
    // 좁은 틈: 양쪽 벽 사이의 한 칸. 틈에 고배점 코인을 박아 위험을 감수하게 만든다
    name: 'wallGap', minLevel: 2, weight: 14, growth: 0.05,
    build() {
      const gapT = 0.2 + Math.random() * 0.6;
      pushObs('barrier', Math.max(0, gapT - 0.55));
      pushObs('barrier', Math.min(1, gapT + 0.55));
      pushItem('coin', gapT, 6, true);
      pushItem('coin', gapT, 60, true);
    }
  },
  {
    // 웅덩이밭: 밟아도 죽지는 않지만 접지력을 잃어 다음 구간이 위험해진다
    name: 'puddleField', minLevel: 2, weight: 11,
    build() {
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        pushObs('puddle', Math.random(), i * 76);
      }
      pushItem('coin', Math.random(), 40);
    }
  },
  {
    // 깔때기: 양쪽에서 조여들어 중앙으로 몰아넣는다
    name: 'funnel', minLevel: 3, weight: 12, growth: 0.07,
    build() {
      pushObs('cone', 0.0, 0);
      pushObs('cone', 1.0, 0);
      pushObs('cone', 0.18, 88);
      pushObs('cone', 0.82, 88);
      pushObs('rock', 0.34, 176);
      pushObs('rock', 0.66, 176);
      pushItem('coin', 0.5, 176, true);
      pushItem('coin', 0.5, 226);
    }
  },
  {
    // 교통 체증: 좌우로 흔들리며 천천히 내려오는 차량들
    name: 'traffic', minLevel: 3, weight: 12, growth: 0.06,
    build() {
      const count = 1 + (Math.random() < 0.45 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        pushObs('car', 0.25 + Math.random() * 0.5, i * 150, {
          speedMul: 0.72,             // 플레이어보다 느려서 서서히 다가온다
          vx: dir * (0.5 + Math.random() * 0.7)
        });
      }
      pushItem('coin', Math.random(), 90);
    }
  },
  {
    // 시련의 길: 촘촘한 좌우 벽 + 고배점 코인. 고레벨에서만 등장
    // 코인 유도 경로를 반대편 벽까지 완전히 건너야 하는 구조라 고속 구간에서
    // 좌우 이동 속도로는 다음 줄이 오기 전에 도달이 불가능했다. 줄 간격을
    // 늘리고 유도 코인을 콘 옆 좁은 틈(스윙 폭 축소)으로 당겨 통과 가능하게 조정.
    name: 'gauntlet', minLevel: 5, weight: 11, growth: 0.08,
    build() {
      const dir = Math.random() < 0.5 ? 1 : -1;
      for (let i = 0; i < 4; i++) {
        const side = i % 2 === 0 ? dir : -dir;
        pushObs('barrier', 0.5 + side * 0.52, i * 128);
        pushObs('cone', 0.5 - side * 0.14, i * 128 + 46);
        pushItem('coin', 0.5 - side * 0.30, i * 128 + 46, true);
      }
    }
  },
  {
    // 선택 게이트: 길이 두 갈래로 갈린다. 황금 문은 코인 2배지만 바로 뒤가 장애물 밭.
    // 죽어도 "운이 나빴다"가 아니라 "내가 욕심냈다"가 되게 하는 장치.
    name: 'gate', minLevel: 2, weight: 13, growth: 0.04,
    build() {
      const bonusLeft = Math.random() < 0.5;
      pushItem(bonusLeft ? 'gateBonus' : 'gateSafe', 0);
      pushItem(bonusLeft ? 'gateSafe' : 'gateBonus', 1);

      // 욕심낸 쪽에는 대가가 따른다
      const risk = bonusLeft ? 0.08 : 0.92;
      const inward = bonusLeft ? 0.22 : 0.78;
      pushObs('cone', risk, 105);
      pushObs('rock', inward, 175);
      pushObs('cone', risk, 245);
      pushItem('coin', risk, 140, true);
      pushItem('coin', inward, 210, true);

      // 안전한 쪽은 정말 비어 있어야 선택에 의미가 생긴다
      pushItem('coin', bonusLeft ? 0.92 : 0.08, 175);
    }
  },
  {
    // 횡단: 사람이나 동물이 길을 건넌다. 치면 경찰 추격이 시작되므로 반드시 비켜줘야 한다.
    // 부수는 대상이 아니라 "지나갈 때까지 기다리는" 대상이라 다른 패턴과 결이 다르다.
    name: 'crossing', minLevel: 3, weight: 10, growth: 0.03,
    build() {
      const fromLeft = Math.random() < 0.5;
      pushCrosser(Math.random() < 0.5 ? 'walker' : 'critter', fromLeft);
      // 가끔 둘이 나란히 건너 길을 더 넓게 막는다
      if (Math.random() < 0.35) {
        pushCrosser(Math.random() < 0.5 ? 'walker' : 'critter', fromLeft, 40);
      }
    }
  },
  {
    // 보급: 파워업 하나와 코인 몇 개
    name: 'powerup', minLevel: 1, weight: 15, growth: -0.02,
    build() {
      const t = Math.random();
      pushItem(randomPowerupType(), t);
      pushItem('coin', t < 0.5 ? t + 0.3 : t - 0.3, 66);
      if (Math.random() < 0.5) {
        pushObs(randomObstacleType(), Math.random(), 130);
      }
    }
  }
];

// 속도와 스폰 밀도는 LV.6에서 상한에 닿는다. 그 뒤로도 압박이 계속 오르도록
// 레벨이 높아질수록 까다로운 패턴의 가중치를 키우고 순한 패턴은 줄인다.
function patternWeight(p) {
  const bonus = 1 + (level - p.minLevel) * (p.growth || 0);
  return Math.max(1, p.weight * bonus);
}

// 추격 중에는 좌우로 계속 피해 다녀야 하므로, 옆으로 빠질 길이 거의 없는 패턴이 겹치면
// 피할 방법이 없는 죽음이 된다. crossing도 함께 뺀다 — 경찰을 피하느라 정신없는 와중에
// 보행자까지 나오면 실수로 치고 타이머가 처음으로 돌아가는 이중 처벌이 된다.
const CHASE_BANNED_PATTERNS = ['gauntlet', 'funnel', 'crossing'];

// 현재 레벨에서 뽑을 수 있는 패턴 중 가중치에 따라 하나를 고른다
function pickPattern() {
  const usable = PATTERNS.filter(p =>
    p.minLevel <= level && !(chaser && CHASE_BANNED_PATTERNS.includes(p.name))
  );

  let total = 0;
  for (const p of usable) total += patternWeight(p);

  let roll = Math.random() * total;
  for (const p of usable) {
    roll -= patternWeight(p);
    if (roll <= 0) return p;
  }
  return PATTERNS[0];
}

function spawnPattern(targetSpeed) {
  patternDepth = 0;
  pickPattern().build();

  // 패턴 전체가 화면에 진입할 때까지 기다린 뒤 다음 패턴을 내보낸다.
  // 타이머를 음수로 시작시켜 두면 겹침 없이 자연스러운 간격이 유지된다.
  spawnTimer = -(patternDepth / Math.max(1, targetSpeed));
}

function update(dt = 1.0) {
  if (gameState !== 'PLAYING') return;

  // BGM 타이머 업데이트 및 연주 처리
  if (isBgmPlaying && !isSuspendedByVisibility) {
    // 기본 템포 비트를 더욱 빠르고 박진감 있게 상향 (기본 320ms -> 220ms로 속도 대폭 상향!)
    // 부스터 피버 중에는 템포를 1.5배 신속하게 폭발 가속!
    const tempoInterval = boosterTime > 0 ? (220 / 1.5) : 220;
    // dt를 시간(ms, 60fps 기준 프레임당 ~16.67ms)으로 환산하여 누적
    bgmTimer += dt * 16.67;
    if (bgmTimer >= tempoInterval) {
      bgmTimer -= tempoInterval;
      playBgmNote();
    }
  }

  // 1. 부스터 모드 여부에 따른 스피드 가중치
  let targetSpeed = BASE_SPEED;
  if (boosterTime > 0) {
    boosterTime -= dt;
    targetSpeed = MAX_SPEED + 2.0; // 시원한 미친 부스터 속도!
  } else {
    // 서서히 다이내믹하게 빨라짐
    if (gameSpeed < MAX_SPEED) {
      gameSpeed += SPEED_INC * dt;
    }
    targetSpeed = gameSpeed;
  }

  // 슬로우모션이 걸리면 화면 전체가 느려져 난장판 구간을 헤쳐나갈 여유가 생긴다
  if (slowTime > 0) {
    slowTime -= dt;
    targetSpeed *= SLOW_FACTOR;
  }

  // 마지막 하트만 남은 직후에는 시간이 늘어진다
  if (lastStandTime > 0) {
    lastStandTime -= dt;
    targetSpeed *= LAST_STAND_FACTOR;
  }

  // 2. 스크롤 누적 점수 및 주행 거리 증가 (부스터 중일 땐 점수 누적 대폭 증가)
  // 콤보 배수를 주행 점수에도 적용한다. 그래야 콤보가 "먹는 순간의 보너스"에 그치지 않고
  // 유지하는 내내 초당 수입이 불어나는 자원이 되어, 끊기는 순간의 손실이 계속 아프다.
  const distanceRate = DISTANCE_SCORE * (1 + (level - 1) * LEVEL_SCORE_BONUS) * getComboMult() * scoreMul;
  score += distanceRate * (boosterTime > 0 ? 3 : 1) * dt;
  distance += targetSpeed * dt;
  scoreVal.textContent = Math.floor(score);
  checkLevelUp();

  // 자기 최고 기록을 넘어서는 순간을 놓치지 않고 알려준다
  if (!recordBeaten && save.best > 0 && score > save.best) {
    recordBeaten = true;
    playSound('levelup');
    addFloatingText(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, '🎉 신기록 갱신!', '#FFDE59');
    shakeTime = 12;
    shakeAmount = 4;
  }

  // 3. 타이머 제어
  if (invincibleTime > 0) invincibleTime -= dt;
  if (magnetTime > 0) magnetTime -= dt;
  if (bonusTime > 0) bonusTime -= dt;

  // 콤보 지속시간 감소 (제한 시간 안에 다음 획득이 없으면 소멸)
  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) {
      combo = 0;
      comboTimer = 0;
    }
  }

  updateStatusUI();

  // 바퀴 회전 애니용 각도 증가
  car.wheelRotation += targetSpeed * 0.15 * dt;

  // 4. 좌우 조작 물리 적용 (deltaTime 연동 보정)
  // 웅덩이를 밟으면 접지력을 잃어 가속은 둔해지고 관성은 오래 남는다.
  if (slipperyTime > 0) slipperyTime -= dt;
  const isSlippery = slipperyTime > 0;
  const accNow = (isSlippery ? SLIPPERY_ACC : car.acc) * (carPerk.handling || 1);
  const frictionNow = isSlippery ? SLIPPERY_FRICTION : car.friction;

  const moveSpeedModifier = dt;
  if (keys['ArrowLeft'] || keys['a'] || keys['A'] || touchLeftPressed) {
    car.vx -= accNow * moveSpeedModifier;
    car.angle = Math.max(car.angle - 0.035 * moveSpeedModifier, -0.16);
  } else if (keys['ArrowRight'] || keys['d'] || keys['D'] || touchRightPressed) {
    car.vx += accNow * moveSpeedModifier;
    car.angle = Math.min(car.angle + 0.035 * moveSpeedModifier, 0.16);
  } else {
    car.angle *= Math.pow(0.8, moveSpeedModifier);
  }

  car.vx *= Math.pow(frictionNow, moveSpeedModifier);
  const maxVxWithDt = car.maxVx;
  if (car.vx > maxVxWithDt) car.vx = maxVxWithDt;
  if (car.vx < -maxVxWithDt) car.vx = -maxVxWithDt;
  car.x += car.vx * moveSpeedModifier;

  // [버그 수정]: 안전지대 차단을 위한 도로 가장자리 복귀 가드 보강
  const leftLimit = roadX + car.width / 2;
  const rightLimit = roadX + roadWidth - car.width / 2;
  
  if (car.x < leftLimit) {
    car.x = leftLimit;
    car.vx = 0;
  }
  if (car.x > rightLimit) {
    car.x = rightLimit;
    car.vx = 0;
  }

  // 5. 도로 및 고속 스피드라인 업데이트
  roadOffset = (roadOffset + targetSpeed * dt) % 40;

  if (targetSpeed > 7.0 && Math.random() < 0.2) {
    // 속도감이 전면적으로 시원해짐
    speedLines.push({
      x: Math.random() * GAME_WIDTH,
      y: -50,
      len: Math.random() * 40 + 20,
      speed: targetSpeed * 1.5 + Math.random() * 3
    });
  }
  for (let i = speedLines.length - 1; i >= 0; i--) {
    speedLines[i].y += speedLines[i].speed * dt;
    if (speedLines[i].y > GAME_HEIGHT) {
      speedLines.splice(i, 1);
    }
  }

  // 배기가스 먼지 스폰 주기적 생성
  if (Math.random() < 0.4) {
    spawnDust();
  }
  for (let i = dustParticles.length - 1; i >= 0; i--) {
    const d = dustParticles[i];
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    d.alpha -= d.decay * dt;
    if (d.alpha <= 0) {
      dustParticles.splice(i, 1);
    }
  }

  // 6. 도로 주변 풍경 업데이트
  sceneryObjects.forEach(obj => {
    obj.y += targetSpeed * dt;
    if (obj.type === 'windmill') {
      obj.rot += 0.04 * dt; // 풍차 회전 각도 누적
    }
  });
  
  sceneryObjects.forEach(obj => {
    if (obj.y > GAME_HEIGHT + 40) {
      obj.y = -40;
      obj.x = Math.random() < 0.5 
        ? Math.random() * (roadX - 35) + 15 
        : Math.random() * (GAME_WIDTH - roadX - 35) + roadX + roadWidth + 20;
      obj.type = Math.random() < 0.4 ? 'tree' : (Math.random() < 0.75 ? 'flower' : 'windmill');
    }
  });

  // 7. 설계된 패턴 단위로 장애물/아이템을 내보낸다
  spawnTimer += dt;
  if (spawnTimer > spawnInterval) {
    // 패턴과 패턴 사이의 숨 돌릴 틈. 속도와 레벨이 오를수록 짧아진다.
    spawnInterval = Math.max(22, 52 - (targetSpeed * 2.2) - (level - 1) * 1.5);
    spawnPattern(targetSpeed);
  }

  // 8. 아이템 루프 처리 (자석 연출 포함)
  for (let i = gameItems.length - 1; i >= 0; i--) {
    const it = gameItems[i];
    it.y += targetSpeed * dt;

    // 자석이 활성화 상태일 때 코인을 플레이어 차량 방향으로 중력 가속 유도
    if (magnetTime > 0 && it.type === 'coin') {
      const dx = car.x - it.x;
      const dy = car.y - it.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // 약 140px 이내의 코인을 부드럽게 차량에 흡수
      if (dist < 140) {
        const pullForce = (140 - dist) * 0.08 * dt;
        it.x += (dx / dist) * pullForce;
        it.y += (dy / dist) * pullForce - targetSpeed * 0.4 * dt;
      }
    }

    // 화면 아웃 처리
    if (it.y > GAME_HEIGHT + 30) {
      gameItems.splice(i, 1);
      continue;
    }

    // 플레이어 충돌 판정 (아이템)
    const itScale = 0.85;
    if (
      Math.abs(car.x - it.x) < (car.width + it.width) * 0.5 * itScale &&
      Math.abs(car.y - it.y) < (car.height + it.height) * 0.5 * itScale
    ) {
      // 아이템 효과 발현!
      if (it.type === 'coin') {
        addCombo();
        runStats.coins++;
        const base = (it.risky ? RISKY_COIN_SCORE : COIN_SCORE)
          * (carPerk.coinBonus || 1)
          * (bonusTime > 0 ? 2 : 1)
          * ((activeMod && activeMod.coinMul) || 1);
        const gain = gainScore(base);
        playSound('coin');
        addFloatingText(it.x, it.y, `+${gain}`, it.risky ? "#FF5757" : "#FED330");
        createCrashParticles(it.x, it.y, it.risky ? '#FF7675' : '#FFD700');
      } else if (it.type === 'gateBonus' || it.type === 'gateSafe') {
        // 게이트는 지나가는 것 자체가 선택이다. 판정만 하고 차에 붙지 않는다.
        if (it.type === 'gateBonus') {
          bonusTime = BONUS_DURATION * (carPerk.itemBonus || 1);
          playSound('levelup');
          addFloatingText(car.x, car.y - 45, "코인 2배!! 🪙", "#FFD700");
          shakeTime = 10;
          shakeAmount = 4;
        } else {
          playSound('item');
          addFloatingText(car.x, car.y - 45, "안전 통과 ✅", "#7ED957");
        }
        createCrashParticles(it.x, car.y - 20, it.type === 'gateBonus' ? '#FFD700' : '#7ED957');
        // 같은 패턴의 반대편 게이트는 지워서 둘 다 먹는 일이 없게 한다
        for (let j = gameItems.length - 1; j >= 0; j--) {
          if (j !== i && (gameItems[j].type === 'gateBonus' || gameItems[j].type === 'gateSafe')) {
            gameItems.splice(j, 1);
            if (j < i) i--;
          }
        }
      } else if (it.type === 'heart') {
        // 라이프가 가득 찼다면 회복 대신 점수로 환산해 준다
        if (lives < MAX_LIVES) {
          lives++;
          updateHeartsUI();
          playSound('heal');
          addFloatingText(car.x, car.y - 45, "하트 회복 ❤️", "#FF5757");
        } else {
          const gain = gainScore(HEART_FULL_SCORE);
          playSound('coin');
          addFloatingText(car.x, car.y - 45, `가득참! +${gain}`, "#FF5757");
        }
        createCrashParticles(it.x, it.y, '#FF7675');
      } else if (it.type === 'slow') {
        slowTime = SLOW_DURATION * (carPerk.itemBonus || 1);
        playSound('slow');
        addFloatingText(car.x, car.y - 45, "슬로우모션 ⏳", "#A29BFE");
        createCrashParticles(it.x, it.y, '#A29BFE');
      } else if (it.type === 'shield') {
        activeShield = true;
        playSound('item');
        addFloatingText(car.x, car.y - 45, "보호막 장착 🛡️", "#00CEC9");
        createCrashParticles(it.x, it.y, '#81ECEC');
      } else if (it.type === 'magnet') {
        magnetTime = MAGNET_DURATION * (carPerk.itemBonus || 1);
        playSound('item');
        addFloatingText(car.x, car.y - 45, "코인 자석 활성 🧲", "#FF7675");
        createCrashParticles(it.x, it.y, '#FF7675');
      } else if (it.type === 'booster') {
        boosterTime = BOOSTER_DURATION * (carPerk.itemBonus || 1);
        invincibleTime = boosterTime + 30; // 부스터 중에는 완벽 무적 제공!
        playSound('booster');
        addFloatingText(car.x, car.y - 45, "슈퍼 피버 부스터!! ⚡", "#00DEC9");
        createCrashParticles(it.x, it.y, '#FFD700');
        shakeTime = 30;
        shakeAmount = 6;
      }

      gameItems.splice(i, 1);
    }
  }

  // 9. 장애물 업데이트 및 충돌 판단
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    // 교통 차량은 플레이어보다 느리게 내려오며 좌우로 흔들린다
    obs.y += targetSpeed * (obs.speedMul || 1) * dt;

    // 방해차량은 가만히 중앙에 서 있는 플레이어 쪽으로 서서히 쏠려온다.
    // (가운데 고정 회피가 항상 통하지 않도록 만드는 견제 장치. 정적 장애물 배치는 건드리지 않는다.)
    if (obs.type === 'car') {
      obs.vx += Math.sign(car.x - obs.x) * 0.014 * dt;
      obs.vx = Math.max(-2.2, Math.min(2.2, obs.vx));
    }

    if (obs.vx) {
      obs.x += obs.vx * dt;
      if (obs.crossing) {
        // 건너는 중인 사람/동물은 도로 벽에 튕기지 않고 그대로 건너편으로 걸어 나간다
        obs.step += 0.22 * dt;
      } else {
        const minX = roadX + obs.width / 2;
        const maxX = roadX + roadWidth - obs.width / 2;
        if (obs.x < minX) { obs.x = minX; obs.vx *= -1; }
        if (obs.x > maxX) { obs.x = maxX; obs.vx *= -1; }
      }
    }

    if (obs.y > GAME_HEIGHT + 30 ||
        (obs.crossing && (obs.x < -50 || obs.x > GAME_WIDTH + 50))) {
      obstacles.splice(i, 1);
      continue;
    }

    // 고도화된 충돌 판정 박스 (회전 각도 정밀 보정 및 내부 마진 적용)
    // 차량 폭에 각도에 따른 수축 가중치(Math.cos(car.angle))를 적용하고, 억울한 충돌 방지를 위한 마진 패딩 적용
    const angleCos = Math.abs(Math.cos(car.angle));

    // 회전에 의해 실제로 투영되는 가상의 폭과 높이 산출 (회전 각도 보정 가중치와 안전 마진 적용)
    // base hitBoxScale = 0.65. 각도가 0이 아닐 때 Math.cos(car.angle)을 통해 수축 연동.
    const baseScale = 0.65;

    // 폭에는 회전 각도가 있을 때 억울함을 덜 느끼도록 Math.cos(car.angle) 수축 가중치를 추가로 적용 (회전 시 차량의 유효 가로 폭 충돌 감지 축소)
    const carWidthScale = baseScale * angleCos;
    const carHeightScale = baseScale;

    const carLeft = car.x - (car.width * carWidthScale) / 2;
    const carRight = car.x + (car.width * carWidthScale) / 2;
    const carTop = car.y - (car.height * carHeightScale) / 2;
    const carBottom = car.y + (car.height * carHeightScale) / 2;

    const obsLeft = obs.x - (obs.width * 0.6) / 2;
    const obsRight = obs.x + (obs.width * 0.6) / 2;
    const obsTop = obs.y - (obs.height * 0.6) / 2;
    const obsBottom = obs.y + (obs.height * 0.6) / 2;

    if (
      carRight > obsLeft &&
      carLeft < obsRight &&
      carBottom > obsTop &&
      carTop < obsBottom
    ) {
      // 1. 부스터 피버 중에는 장애물을 들이받아 파괴하고, 무적이 아닐 때는 정상적으로 피해를 입습니다.
      // 2. 순수 무적 타이밍(invincibleTime > 0)에는 깜빡이며 그대로 통과합니다.
      //    이때 보호막을 조건에 넣으면 무적 중인데도 배리어가 소모되어 버리므로 제외했습니다.
      if (boosterTime > 0 || invincibleTime <= 0) {
        handleCollision(i);
        continue;
      }
    }

    // 니어미스 판정: 장애물이 차량 옆을 스치듯 지나간 순간 보너스와 콤보를 준다.
    // 위험을 감수하고 아슬아슬하게 붙어서 피할수록 이득이 되는 리스크-리워드 장치.
    if (!obs.scored && obs.y > car.y + car.height / 2) {
      obs.scored = true;
      const gap = Math.abs(car.x - obs.x) - (car.width + obs.width) / 2;
      if (gap >= 0 && gap < 16) {
        addCombo();
        runStats.nearMisses++;
        const gain = gainScore(NEARMISS_SCORE);
        playSound('nearmiss');
        addFloatingText(car.x, car.y - 30, `아슬아슬! +${gain}`, '#FFDE59');
      }
    }
  }

  // 9-b. 돌발 추격전 (차량 위치가 확정된 뒤에 판정해야 추적이 한 프레임 밀리지 않는다)
  updateChase(dt);
  if (gameState !== 'PLAYING') return;

  // 10. 충돌 스파크 파티클 업데이트
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= p.decay * dt;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  // 11. 화면 방해 오일 효과 감쇠
  for (let i = screenOils.length - 1; i >= 0; i--) {
    const oil = screenOils[i];
    oil.life = Math.max(0, oil.life - dt);
    if (oil.life < 40) {
      oil.alpha = oil.life / 40; // 서서히 증발/투명 효과
    }
    if (oil.life <= 0) {
      screenOils.splice(i, 1);
    }
  }

  // 12. 통통 뜨는 텍스트 애니메이션 업데이트
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= 0.016 * dt;
    ft.scale += 0.005 * dt;
    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
    }
  }

  // 13. 화면 흔들림(Screen Shake) 감쇠
  if (shakeTime > 0) {
    shakeTime = Math.max(0, shakeTime - dt);
  }
}

function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.save();
  if (shakeTime > 0) {
    const dx = (Math.random() - 0.5) * shakeAmount;
    const dy = (Math.random() - 0.5) * shakeAmount;
    ctx.translate(dx, dy);
  }

  // 1. 잔디밭 배경 드로잉 (부드러운 연두색)
  ctx.fillStyle = '#7ED957';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // 2. 도로 그리기 (다크 그레이)
  ctx.fillStyle = '#4B5563';
  ctx.fillRect(roadX, 0, roadWidth, GAME_HEIGHT);

  // 3. 차선 가이드 엣지 (도로 테두리 흰색 라인)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(roadX - 4, 0, 4, GAME_HEIGHT); 
  ctx.fillRect(roadX + roadWidth, 0, 4, GAME_HEIGHT); 

  // 4. 가운데 움직이는 흰색 중앙 차선(점선)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]); 
  // 속도에 연동된 스크롤 오프셋
  ctx.lineDashOffset = -roadOffset; 
  ctx.beginPath();
  ctx.moveTo(GAME_WIDTH / 2, 0);
  ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]); // 리셋

  // 5. 도로 주변 데코 (풍차, 나무, 꽃, 구름)
  sceneryObjects.forEach(obj => {
    if (obj.type === 'tree') {
      drawTree(ctx, obj.x, obj.y);
    } else if (obj.type === 'flower') {
      drawFlower(ctx, obj.x, obj.y);
    } else if (obj.type === 'windmill') {
      drawWindmill(ctx, obj.x, obj.y, obj.rot);
    }
  });

  // 6. 웅덩이는 도로에 깔린 함정이므로 아이템/차량보다 먼저 바닥에 깔아준다
  obstacles.forEach(obs => {
    if (obs.type === 'puddle') {
      drawPuddle(ctx, obs.x, obs.y, obs.width, obs.height);
    }
  });

  // 7. 아이템 그리기
  gameItems.forEach(it => {
    if (it.type === 'coin') {
      drawCoinItem(ctx, it.x, it.y, it.width, it.risky);
    } else if (it.type === 'shield') {
      drawShieldItem(ctx, it.x, it.y, it.width);
    } else if (it.type === 'magnet') {
      drawMagnetItem(ctx, it.x, it.y, it.width);
    } else if (it.type === 'booster') {
      drawBoosterItem(ctx, it.x, it.y, it.width);
    } else if (it.type === 'heart') {
      drawHeartItem(ctx, it.x, it.y, it.width);
    } else if (it.type === 'slow') {
      drawSlowItem(ctx, it.x, it.y, it.width);
    } else if (it.type === 'gateBonus' || it.type === 'gateSafe') {
      drawGate(ctx, it.x, it.y, it.width, it.height, it.type === 'gateBonus');
    }
  });

  // 8. 입체 장애물 그리기
  obstacles.forEach(obs => {
    if (obs.type === 'cone') {
      drawCone(ctx, obs.x, obs.y, obs.width, obs.height);
    } else if (obs.type === 'rock') {
      drawRock(ctx, obs.x, obs.y, obs.width, obs.height);
    } else if (obs.type === 'barrier') {
      drawBarrier(ctx, obs.x, obs.y, obs.width, obs.height);
    } else if (obs.type === 'oildrum') {
      drawOilDrum(ctx, obs.x, obs.y, obs.width, obs.height);
    } else if (obs.type === 'car') {
      drawTrafficCar(ctx, obs.x, obs.y, obs.width, obs.height);
    } else if (obs.type === 'walker' || obs.type === 'critter') {
      drawCrosser(ctx, obs);
    }
  });

  // 8-b. 추격자는 플레이어보다 뒤(아래)에 있으므로 플레이어보다 먼저 그린다
  if (chaser) drawChaser(ctx, chaser);

  // 9. 플레이어 배기가스 먼지 그리기
  dustParticles.forEach(d => {
    ctx.save();
    ctx.globalAlpha = d.alpha;
    ctx.fillStyle = '#E4F1FE'; // 뭉게뭉게 구름같은 장난감 연기 색상
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 10. 플레이어 장난감 자동차 그리기
  drawPlayer();

  // 11. 충돌 파티클 그리기
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 12. 고속 스피드라인 그리기
  if (speedLines.length > 0) {
    ctx.save();
    ctx.strokeStyle = boosterTime > 0 ? 'rgba(0, 206, 201, 0.4)' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    speedLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x, line.y + line.len);
      ctx.stroke();
    });
    ctx.restore();
  }

  // 13. 통통 뜨는 텍스트 그리기
  floatingTexts.forEach(ft => {
    ctx.save();
    ctx.globalAlpha = ft.alpha;
    ctx.font = '900 16px "Jua", sans-serif';
    ctx.fillStyle = ft.color;
    ctx.strokeStyle = '#2F3640';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    
    ctx.translate(ft.x, ft.y);
    ctx.scale(ft.scale, ft.scale);
    ctx.strokeText(ft.text, 0, 0);
    ctx.fillText(ft.text, 0, 0);
    ctx.restore();
  });

  // 13-b. 추격 중에는 붉은 경고 테두리와 남은 시간을 띄운다
  if (chaser) {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 87, 87, ${0.35 + Math.abs(Math.sin(Date.now() / 180)) * 0.3})`;
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // DOM HUD(점수/콤보 바)가 차지하는 위쪽을 피해 그 아래에 얹는다
    const label = `${chaser.kind.icon} 탈출까지 ${Math.ceil(chaser.time / 60)}초`;
    ctx.font = '900 21px "Jua", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#2F3640';
    ctx.lineWidth = 5;
    ctx.strokeText(label, GAME_WIDTH / 2, 178);
    ctx.fillStyle = '#FFDE59';
    ctx.fillText(label, GAME_WIDTH / 2, 178);
    ctx.restore();
  }

  // 14. 피버 모드일 때 화면 가장자리 네온 아우라 광원 연출
  if (boosterTime > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 222, 201, 0.45)';
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.restore();
  }

  // 15. 슬로우모션 중에는 보랏빛 테두리로 시간이 늘어졌음을 알린다
  if (slowTime > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(162, 155, 254, 0.5)';
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.restore();
  }

  // 15-b. 코인 2배 보너스는 황금 테두리로 남은 시간을 알린다
  if (bonusTime > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.55)';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.restore();
  }

  // 15-c. 하트가 하나뿐이면 화면 가장자리가 붉게 맥동한다.
  // 피격 직후의 슬로우모션 동안에는 훨씬 짙게 깔아 "죽기 직전"을 각인시킨다.
  if (gameState === 'PLAYING' && lives === 1) {
    const pulse = 0.16 + Math.sin(Date.now() / 260) * 0.06;
    const intensity = lastStandTime > 0 ? 0.55 : pulse;
    const grad = ctx.createRadialGradient(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_HEIGHT * 0.28,
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_HEIGHT * 0.62
    );
    grad.addColorStop(0, 'rgba(255, 87, 87, 0)');
    grad.addColorStop(1, `rgba(214, 48, 49, ${intensity})`);
    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.restore();
  }

  // 16. 오일 스크린 번짐 연출 그리기 (가장 위에 덧칠)
  screenOils.forEach(oil => {
    ctx.save();
    ctx.globalAlpha = oil.alpha;
    ctx.fillStyle = 'rgba(47, 54, 64, 0.95)'; // 새까만 장난감 오일 색
    ctx.beginPath();
    // 둥글고 귀여운 덩어리형 액체 튐 표현
    ctx.arc(oil.x, oil.y, oil.radius, 0, Math.PI * 2);
    ctx.arc(oil.x - oil.radius * 0.4, oil.y + oil.radius * 0.3, oil.radius * 0.6, 0, Math.PI * 2);
    ctx.arc(oil.x + oil.radius * 0.5, oil.y - oil.radius * 0.2, oil.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  ctx.restore();
}

// Delta-Time 시간 동기화 기반 루프 (모니터 주사율 60Hz~144Hz에 관계없이 똑같은 속도 보장 및 잔상 차단)
let lastTime = (window.performance && window.performance.now) ? window.performance.now() : Date.now();

function loop(timestamp) {
  // 모바일 브라우저(Safari 등) 최초 진입 시 timestamp 누락 방어
  const currentTimestamp = timestamp || ((window.performance && window.performance.now) ? window.performance.now() : Date.now());
  
  // 경과 시간 계산
  let elapsed = currentTimestamp - lastTime;
  if (elapsed > 100 || elapsed < 0) elapsed = 16.67; // 포커스 아웃이나 지연 제어
  lastTime = currentTimestamp;

  // 60FPS 기준 표준 프레임 델타값
  const dt = elapsed / 16.666;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// --- [버튼 이벤트 및 리스너 등록] ---
// PC 클릭 연동
// startGame(daily)에 이벤트 객체가 그대로 넘어가면 truthy라 평상시 판이 도전 모드로 시작된다.
// 다시 달리기는 방금 하던 모드를 그대로 이어 준다.
startBtn.addEventListener('click', () => startGame(false));
restartBtn.addEventListener('click', () => startGame(dailyRun));

// 스마트폰 모바일 터치 대응 (click 이벤트가 간헐적으로 안 받는 브라우저 완벽 보호)
// touchstart 대신 touchend를 사용하여 확실한 사용자 제스처 이벤트로 브라우저 사운드 및 상태 변화 락 해제
startBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  e.stopPropagation();
  startGame(false);
}, { passive: false });

restartBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  e.stopPropagation();
  startGame(dailyRun);
}, { passive: false });

// 기록 / 차고 / 음소거 버튼 연결 (터치 기기에서도 확실히 반응하도록 두 이벤트 모두 등록)
function bindTap(el, handler) {
  if (!el) return;
  el.addEventListener('click', handler);
  el.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handler();
  }, { passive: false });
}

bindTap(statsBtn, () => openScreen(statsScreen));
bindTap(statsBtn2, () => openScreen(statsScreen));
bindTap(garageBtn, () => openScreen(garageScreen));
bindTap(garageBtn2, () => openScreen(garageScreen));

bindTap(muteBtn, () => {
  save.muted = !save.muted;
  persistSave();
  updateMuteButton();
  if (!save.muted) playSound('coin'); // 음소거를 풀면 소리가 살아난 걸 바로 확인시켜 준다
});

bindTap(dailyBtn, () => startGame(true));
bindTap(reviveBtn, doRevive);
bindTap(homeBtn, () => {
  gameState = 'START';
  gameOverScreen.classList.remove('active');
  updateDailyInfo();
  startScreen.classList.add('active');
});

document.querySelectorAll('.close-screen').forEach(btn => {
  bindTap(btn, () => {
    closeScreen(statsScreen);
    closeScreen(garageScreen);
  });
});

// e.scale은 사파리 전용 속성이라 크롬/안드로이드에서는 undefined다.
// undefined !== 1 이 항상 참이 되어 모든 touchmove를 막았고, 그 탓에 기록/차고 화면이
// 스크롤되지 않아 아래 내용과 닫기 버튼에 닿을 수 없었다.
// 실제로 막아야 하는 건 손가락 두 개로 하는 핀치 확대뿐이다.
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// 백그라운드 포커스 전환 대응 (visibilitychange 리스너)
document.addEventListener('visibilitychange', () => {
  initAudio();
  if (!audioCtx) return;

  if (document.hidden) {
    isSuspendedByVisibility = true;
    audioCtx.suspend().then(() => {
      console.log("AudioContext 일시중지 완료");
    });
  } else {
    isSuspendedByVisibility = false;
    audioCtx.resume().then(() => {
      console.log("AudioContext 재개 완료");
    });
  }
});

resizeCanvas();
updateMuteButton();
updateDailyInfo();
window.addEventListener('resize', resizeCanvas);
loop((window.performance && window.performance.now) ? window.performance.now() : Date.now());
