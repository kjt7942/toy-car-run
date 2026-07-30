// game.js를 실제로 로드해 추격전 밸런스를 검증한다.
// DOM/캔버스/오디오는 전부 no-op Proxy로 대체하고, 게임 루프만 수동으로 돌린다.
//
// 검증하려는 것:
//   1) 가만히 있는 플레이어는 반드시 잡힌다 (추격전을 넣은 이유)
//   2) 좌우로 계속 피하는 플레이어는 대체로 살아남는다 (피할 수 없는 죽음이 아니어야 한다)
const fs = require('fs');
const vm = require('vm');

const noop = () => {};
const stub = () => new Proxy(function () {}, {
  get(t, k) {
    if (k === 'style' || k === 'classList' || k === 'dataset') return stub();
    if (k === 'textContent' || k === 'innerHTML' || k === 'value') return '';
    if (k === 'length') return 0;
    if (k === Symbol.iterator) return [][Symbol.iterator].bind([]);
    if (k === 'then') return undefined;
    return stub();
  },
  set() { return true; },
  apply() { return stub(); }
});

const ctx = vm.createContext({
  console,
  Math, Date, JSON, Object, Array, String, Number, Boolean, isNaN, parseInt, parseFloat,
  document: new Proxy({}, {
    get(t, k) {
      if (k === 'querySelectorAll') return () => [];
      if (k === 'getElementById') return () => stub();
      if (k === 'addEventListener') return noop;
      return stub();
    }
  }),
  window: new Proxy({}, {
    get(t, k) {
      if (k === 'performance') return { now: () => Date.now() };
      return stub();
    },
    set: () => true
  }),
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  requestAnimationFrame: noop,
  setTimeout: noop, setInterval: noop, clearInterval: noop, clearTimeout: noop,
  AudioContext: undefined, webkitAudioContext: undefined,
  navigator: { userAgent: 'node' },
  performance: { now: () => Date.now() }
});

vm.runInContext(fs.readFileSync('D:/ai_project/toy-car-run/game.js', 'utf8'), ctx, { filename: 'game.js' });
const run = (code) => vm.runInContext(code, ctx);

// 오디오는 노드에 없으므로 호출만 세고 넘긴다 (사이렌이 실제로 울리는지 확인용)
run(`
  var ALL_CHASE_TYPES = CHASE_TYPES.slice(); // 종류별 강제 지정 후 되돌리기 위한 원본
  var soundLog = [];
  playSound = function (t) { soundLog.push(t); };
  playBgmNote = function () {};

  var ORIG_SPAWN = spawnPattern; // 장애물 상호작용 검증에서 되살려 쓴다

  // 밸런스 측정에서는 장애물을 끄고 추격만 남긴다 (변수를 하나로 줄여야 수치가 읽힌다).
  // withPatterns를 주면 실제 게임처럼 장애물까지 함께 굴린다.
  function setupRun(forcedKind, withPatterns) {
    soundLog = [];
    spawnPattern = withPatterns ? ORIG_SPAWN : function () { spawnTimer = -99999; };
    startGame(false);
    lives = 99;
    distance = CHASE_FIRST_DISTANCE;
    if (forcedKind) {
      var k = CHASE_TYPES.find(function (t) { return t.id === forcedKind; });
      CHASE_TYPES.length = 0;
      CHASE_TYPES.push(k);
    }
  }

  // steer: 매 프레임 호출되어 -1(왼쪽) / 0(정지) / 1(오른쪽)을 돌려주는 조작기.
  // 시뮬레이션이 완전히 결정적이면 몇 번을 돌려도 같은 판이라 표본이 되지 않는다.
  // 그래서 판마다 시작 위치를 흩뜨리고, 조작기에도 사람다운 반응 지연/흔들림을 준다.
  var simFrame = 0, lastDir = 0, reactAt = 0;
  function simulate(steer) {
    var startLives = lives;
    var f = 0;
    while (chaser === null && f < 600) { update(1.0); f++; }
    if (chaser === null) return { spawned: false };

    // 추격 시작 위치를 무작위로 흩뜨린다 (벽에 몰린 채 시작하는 경우까지 포함)
    car.x = roadX + car.width / 2 + Math.random() * (roadWidth - car.width);
    simFrame = 0; lastDir = 0; reactAt = 0;

    for (var i = 0; i < CHASE_DURATION + 200; i++) {
      simFrame++;
      var dir = steer();
      keys['ArrowLeft'] = dir < 0;
      keys['ArrowRight'] = dir > 0;
      update(1.0);
      if (lives < startLives) return { spawned: true, caught: true };
      if (chaser === null) return { spawned: true, escaped: true, coins: runStats.coins };
    }
    return { spawned: true, timeout: true };
  }

  // 사람다운 조작기. 화면에서 실제로 보이는 정보(추격자의 좌우 위치와 뒤쪽 거리)만 쓴다.
  //  - 도망칠 공간이 남아 있으면 계속 멀어진다
  //  - 벽에 몰렸으면 추격자가 뒤로 물러난 틈을 노려 반대편으로 건넌다
  // 약 0.15~0.3초마다 한 번씩만 방향을 다시 판단해 사람의 반응 속도를 흉내낸다.
  function humanDodge() {
    if (!chaser) return 0;
    if (simFrame < reactAt) return lastDir;
    reactAt = simFrame + 9 + Math.floor(Math.random() * 10);

    var away = car.x >= chaser.x ? 1 : -1;
    var roomAway = away > 0
      ? (roadX + roadWidth - car.width / 2) - car.x
      : car.x - (roadX + car.width / 2);

    // "지금 건너도 되나"를 매직 넘버가 아니라 실제 잡힘 판정 거리에서 끌어온다.
    // 그래야 게임 쪽 수치를 손볼 때마다 테스트를 같이 조작하는 일이 없다.
    var catchY = (car.height + chaser.kind.h) * 0.5 * 0.56;
    var safeToCross = (chaser.y - car.y) > catchY + 25;

    if (roomAway > 50) lastDir = away;       // 아직 도망칠 옆 공간이 있다
    else if (safeToCross) lastDir = -away;   // 벽이다. 지금 물러나 있으니 건넌다
    else lastDir = away;                     // 벽이지만 지금 건너면 정면으로 받는다
    return lastDir;
  }

  // 능숙한 조작기: 위와 같지만 달려드는 걸 보면 즉시 옆으로 비킨다(건너던 중이어도 포기).
  // 이 쪽이 훨씬 잘 살아남아야 "실력으로 극복 가능한 장치"라고 말할 수 있다.
  function skilledDodge() {
    if (!chaser) return 0;
    var catchY = (car.height + chaser.kind.h) * 0.5 * 0.56;
    var surging = (chaser.y - car.y) < catchY + 30; // 달려드는 중
    if (surging) {
      // 추격자에게서 멀어지는 쪽으로 비킨다. 그쪽이 벽이면 반대로 뚫는다.
      var away = car.x >= chaser.x ? 1 : -1;
      var roomAway = away > 0
        ? (roadX + roadWidth - car.width / 2) - car.x
        : car.x - (roadX + car.width / 2);
      return roomAway > 30 ? away : -away;
    }
    return humanDodge();
  }
`);

const trial = (kind, steer) => JSON.parse(run(
  `setupRun('${kind}'); JSON.stringify(simulate(${steer}))`
));

const CHASER_IDS = JSON.parse(run(`JSON.stringify(CHASE_TYPES.map(t => t.id))`));
const results = {};

for (const kind of CHASER_IDS) {
  const afk = [];
  const dodge = [];
  const skilled = [];
  for (let i = 0; i < 100; i++) {
    // 원본 CHASE_TYPES가 setupRun에서 잘려나가므로 매 시행마다 파일을 새로 로드하는 대신
    // 강제 지정한 종류만 남긴 상태로 반복한다 (종류별로 따로 측정하므로 문제 없음).
    afk.push(trial(kind, '() => 0'));
    dodge.push(trial(kind, 'humanDodge'));
    skilled.push(trial(kind, 'skilledDodge'));
  }
  results[kind] = {
    afk잡힘: afk.filter(r => r.caught).length + '/' + afk.length,
    회피탈출: dodge.filter(r => r.escaped).length + '/' + dodge.length,
    능숙탈출: skilled.filter(r => r.escaped).length + '/' + skilled.length,
    탈출코인: dodge.find(r => r.escaped) ? dodge.find(r => r.escaped).coins : 0
  };
  // 다음 종류를 시험하려면 원본 목록을 복구해야 한다
  run(`CHASE_TYPES.length = 0; ALL_CHASE_TYPES.forEach(t => CHASE_TYPES.push(t));`);
}

console.log(JSON.stringify(results, null, 2));

let failed = false;
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); failed = true; } };
for (const kind of CHASER_IDS) {
  const r = results[kind];
  const [afkCaught, afkTotal] = r.afk잡힘.split('/').map(Number);
  const [esc, escTotal] = r.회피탈출.split('/').map(Number);
  const [sk, skTotal] = r.능숙탈출.split('/').map(Number);
  // 이 장치가 공정하려면 세 가지가 동시에 성립해야 한다.
  //  - 가만히 있으면 반드시 잡힌다 (추격전을 넣은 이유 자체)
  //  - 어설프게라도 계속 피하면 절반 이상은 산다 (운이 아니라 대응의 문제)
  //  - 달려드는 걸 보고 비키면 거의 다 산다 (실력으로 넘을 수 있는 벽)
  assert(afkCaught === afkTotal, `${kind}: 가만히 있으면 항상 잡혀야 한다 (${r.afk잡힘})`);
  // 실측(각 100회): 방치 0% / 어설픈 회피 73~77% / 달려들 때 비키기 95~96%
  assert(esc / escTotal >= 0.55, `${kind}: 계속 피하면 절반 이상 살아남아야 한다 (${r.회피탈출})`);
  assert(sk / skTotal >= 0.85, `${kind}: 달려들 때 비키면 거의 살아야 한다 (${r.능숙탈출})`);
  assert(sk > esc, `${kind}: 잘 대응할수록 더 살아남아야 한다 (실력이 통해야 한다)`);
  assert(r.탈출코인 >= 25, `${kind}: 탈출 보너스 코인이 지급되어야 한다`);
}
// --- 밸런스 외 동작 검증 ---
const checks = JSON.parse(run(`
  (() => {
    const out = {};

    // 추격이 끝나면 다음 추격이 예약되어 반복 등장한다
    setupRun();
    let chases = 0, seen = false;
    for (let f = 0; f < 6000; f++) {
      update(1.0);
      if (chaser && !seen) { seen = true; chases++; }
      if (!chaser) seen = false;
      if (lives < 90) lives = 99; // 잡혀도 계속 굴려서 반복 등장만 본다
    }
    out.repeatChases = chases;

    // 보호막은 한 번 막아주고 추격은 계속된다
    setupRun();
    while (!chaser) update(1.0);
    activeShield = true;
    let livesBefore = lives;
    while (chaser && activeShield) update(1.0);
    out.shieldBlocked = (lives === livesBefore && chaser !== null);

    // 부스터로 들이받으면 탈출 처리된다
    setupRun();
    while (!chaser) update(1.0);
    const coinsBefore = runStats.coins;
    boosterTime = 600;
    let guard = 0;
    while (chaser && guard++ < 900) update(1.0);
    out.boosterEscape = (chaser === null && runStats.coins > coinsBefore);

    // 마지막 하트일 때 잡히면 정상적으로 게임오버로 이어진다
    setupRun();
    while (!chaser) update(1.0);
    lives = 1;
    guard = 0;
    while (gameState === 'PLAYING' && guard++ < 2000) update(1.0);
    out.gameOverOnCatch = (gameState === 'GAMEOVER' && chaser === null);

    // 추격자가 장애물을 들이받으면 주춤한다 (뒤에서 쫓기는 플레이어의 유일한 반격 수단)
    let stunned = 0, obstaclesHit = 0;
    for (let t = 0; t < 20 && stunned === 0; t++) {
      setupRun('truck', true);
      lives = 999; // 플레이어가 장애물에 먼저 죽어 관측이 끊기지 않게 한다
      let f = 0;
      while (chaser === null && f < 1200) { update(1.0); f++; }
      let wasStunned = false;
      for (let i = 0; i < CHASE_DURATION && chaser; i++) {
        const before = obstacles.length;
        update(1.0);
        if (chaser && chaser.stun > 0 && !wasStunned) { stunned++; wasStunned = true; }
        if (chaser && chaser.stun <= 0) wasStunned = false;
        if (obstacles.length < before) obstaclesHit++;
      }
    }
    out.chaserStunnedByObstacle = stunned > 0;

    // 추격 중에는 옆으로 빠질 길이 없는 패턴을 뽑지 않는다
    setupRun();
    spawnPattern = function () { spawnTimer = -99999; };
    while (!chaser) update(1.0);
    level = 9;
    const picked = new Set();
    for (let i = 0; i < 500; i++) picked.add(pickPattern().name);
    out.bannedDuringChase = CHASE_BANNED_PATTERNS.every(n => !picked.has(n));
    out.pickedCount = picked.size;

    return JSON.stringify(out);
  })()
`));

console.log('\n동작 검증:', JSON.stringify(checks, null, 2));
assert(checks.repeatChases >= 2, '추격은 일정 거리마다 반복 등장해야 한다');
assert(checks.shieldBlocked, '보호막이 한 번 막아주고 추격은 이어져야 한다');
assert(checks.boosterEscape, '부스터로 들이받으면 탈출 처리되어야 한다');
assert(checks.gameOverOnCatch, '마지막 하트에 잡히면 게임오버로 이어져야 한다');
assert(checks.bannedDuringChase && checks.pickedCount > 1, '추격 중에는 막다른 패턴이 제외되어야 한다');
assert(checks.chaserStunnedByObstacle, '추격자도 장애물에 부딪혀 주춤해야 한다');

console.log(failed ? '\n실패' : '\nALL OK');
process.exitCode = failed ? 1 : 0;
