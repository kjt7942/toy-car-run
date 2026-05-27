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
const touchLeft = document.getElementById('touchLeft');
const touchRight = document.getElementById('touchRight');

// 가상 해상도 설정 (Canvas 내부 조율용 고정 비율)
const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

// 게임 상태 변수
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let highscore = localStorage.getItem('toycar_highscore') || 0;
let lives = 3;
let keys = {};
let touchLeftPressed = false;
let touchRightPressed = false;

// 게임 밸런스 및 물리 상수 (체감 난이도 완화 튜닝)
let gameSpeed = 3.2;
const BASE_SPEED = 3.2;       // 초반 주행 속도 하향 (기존 5 -> 3.2)
const MAX_SPEED = 8.5;        // 최고 주행 속도 하향 (기존 12 -> 8.5)
const SPEED_INC = 0.0002;      // 속도 상승 강도 완만화 (기존 0.0005 -> 0.0002)

// 화면 흔들림(Screen Shake)
let shakeTime = 0;
let shakeAmount = 0;

// 파티클 (충돌 이펙트)
let particles = [];

// 무적 타임 관련
let invincibleTime = 0;
const INVINCIBLE_DURATION = 90; // 프레임 기준 (약 1.5초)

// 플레이어 캐릭터 (자동차)
const car = {
  x: GAME_WIDTH / 2,
  y: GAME_HEIGHT - 120,
  width: 36,
  height: 60,
  vx: 0,
  acc: 0.95,      // 좌우 반응 속도(가속도) 상향 (기존 0.8 -> 0.95)
  friction: 0.80,  // 미끄러지는 마찰 제어력 개선 (기존 0.85 -> 0.80)
  maxVx: 7.2,      // 최대 좌우 조작 속도 증가 (기존 6.5 -> 7.2)
  angle: 0        // 자동차 꺾임 각도
};

// 도로 디자인 변수
const roadWidth = 240;
const roadX = (GAME_WIDTH - roadWidth) / 2;
let roadOffset = 0;

// 도로 사이드 오브젝트 (나무, 꽃 등 데코레이션)
let sceneryObjects = [];
const SCENERY_TYPES = ['tree', 'flower', 'cloud'];

// 장애물 목록
let obstacles = [];
const OBSTACLE_TYPES = ['cone', 'rock'];
let obstacleSpawnTimer = 0;
let obstacleSpawnInterval = 140; // 프레임당 스폰 대기 시간 (초반 여유 주기, 기존 100 -> 140)

// 1. 캔버스 해상도 조절 (레티나 디바이스 대응 및 비율 유지)
function resizeCanvas() {
  const container = document.getElementById('game-container');
  const rect = container.getBoundingClientRect();
  
  // 브라우저 화면 비율에 맞추어 Canvas 실제 픽셀 조정
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
}

// 2. 키보드 입력 핸들링 (PC)
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  // 스페이스바나 위아래 키로 인한 화면 스크롤 방지
  if (['ArrowUp', 'ArrowDown', ' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// 3. 모바일 터치 이벤트 핸들링
// 터치 시작
touchLeft.addEventListener('touchstart', (e) => {
  e.preventDefault();
  touchLeftPressed = true;
}, { passive: false });

touchRight.addEventListener('touchstart', (e) => {
  e.preventDefault();
  touchRightPressed = true;
}, { passive: false });

// 터치 종료
touchLeft.addEventListener('touchend', (e) => {
  e.preventDefault();
  touchLeftPressed = false;
}, { passive: false });

touchRight.addEventListener('touchend', (e) => {
  e.preventDefault();
  touchRightPressed = false;
}, { passive: false });

// 마우스 클릭으로도 테스트할 수 있게 마우스 이벤트 지원
touchLeft.addEventListener('mousedown', () => touchLeftPressed = true);
touchLeft.addEventListener('mouseup', () => touchLeftPressed = false);
touchLeft.addEventListener('mouseleave', () => touchLeftPressed = false);

touchRight.addEventListener('mousedown', () => touchRightPressed = true);
touchRight.addEventListener('mouseup', () => touchRightPressed = false);
touchRight.addEventListener('mouseleave', () => touchRightPressed = false);


// --- [그리기 보조 함수군 - 귀여운 벡터 스타일 벡터 드로잉] ---

// 1) 귀여운 구름 그리기
function drawCloud(ctx, x, y, size) {
  ctx.fillStyle = '#FFFFFF';
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
  // 나무 기둥
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(x - 5, y, 10, 20);
  
  // 나무 나뭇잎 (구름 모양)
  ctx.fillStyle = '#2ECC71';
  ctx.beginPath();
  ctx.arc(x, y - 8, 16, 0, Math.PI * 2);
  ctx.arc(x - 10, y - 16, 12, 0, Math.PI * 2);
  ctx.arc(x + 10, y - 16, 12, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  
  // 볼터치 같은 노란 사과 조그맣게 포인트
  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.arc(x - 5, y - 12, 3, 0, Math.PI * 2);
  ctx.arc(x + 6, y - 6, 3, 0, Math.PI * 2);
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
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 꽃수술 (노란색 센터)
  ctx.fillStyle = '#FED330';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

// 4) 플레이어 자동차 그리기
function drawPlayer() {
  // 무적 모드일 때 깜빡거리게 연출
  if (invincibleTime > 0 && Math.floor(invincibleTime / 4) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(car.x, car.y);
  
  // 부드러운 꺾임 각도 반영
  ctx.rotate(car.angle);

  // 그림자 효과
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 2, -car.height / 2 + 5, car.width + 4, car.height + 2, 10);
  ctx.fill();

  // 1. 바퀴 4개 그리기 (귀엽게 튀어나온 블랙 타이어)
  ctx.fillStyle = '#2F3640';
  // 앞좌측
  ctx.fillRect(-car.width / 2 - 4, -car.height / 2 + 8, 5, 12);
  // 앞우측
  ctx.fillRect(car.width / 2 - 1, -car.height / 2 + 8, 5, 12);
  // 뒤좌측
  ctx.fillRect(-car.width / 2 - 4, car.height / 2 - 20, 5, 12);
  // 뒤우측
  ctx.fillRect(car.width / 2 - 1, car.height / 2 - 20, 5, 12);

  // 2. 메인 바디 (말랑말랑 노란색 장난감 카)
  ctx.fillStyle = '#FFDE59';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 12);
  ctx.fill();
  
  // 바디 외곽선 (손그림 느낌)
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 3. 앞유리창 (하늘색 투명 느낌)
  ctx.fillStyle = '#E8F4F8';
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

  // 4. 귀여운 헤드라이트 (동그란 화이트/옐로우)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-car.width / 3, -car.height / 2 + 1, 4, 0, Math.PI * 2);
  ctx.arc(car.width / 3, -car.height / 2 + 1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2F3640';
  ctx.stroke();

  // 5. 귀여운 리어 범퍼/스포일러 혹은 하이라이트 (바디 위 하이라이트선)
  ctx.fillStyle = '#FFEAA7';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 6, -car.height / 2 + 5, 5, 5, 1);
  ctx.fill();

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

  // 흰색 줄무늬 데코레이션
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

// 6) 귀여운 장애물 돌멩이 그리기
function drawRock(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.arc(0, h / 3, w / 2, 0, Math.PI * 2);
  ctx.fill();

  // 돌 몸체 (보라/분홍빛 귀여운 둥글이 돌)
  ctx.fillStyle = '#A55EEA';
  ctx.beginPath();
  ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 하이라이트 (귀여운 반짝임)
  ctx.fillStyle = '#D6A2E8';
  ctx.beginPath();
  ctx.arc(-w / 6, -h / 6, w / 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}


// --- [게임 생명주기 관련 함수군] ---

// 하트 UI 실시간 갱신
function updateHeartsUI() {
  heartContainer.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = i < lives ? '❤️' : '🖤';
    heartContainer.appendChild(heart);
  }
}

// 게임 시작 초기화
function startGame() {
  gameState = 'PLAYING';
  score = 0;
  lives = 3;
  gameSpeed = BASE_SPEED;
  invincibleTime = 0;
  
  car.x = GAME_WIDTH / 2;
  car.vx = 0;
  car.angle = 0;
  
  obstacles = [];
  particles = [];
  sceneryObjects = [];
  
  // 넉넉하게 배경 나무 스폰해두기
  for (let i = 0; i < 6; i++) {
    sceneryObjects.push({
      x: Math.random() < 0.5 ? Math.random() * (roadX - 30) + 15 : Math.random() * (GAME_WIDTH - roadX - 30) + roadX + roadWidth + 15,
      y: Math.random() * GAME_HEIGHT,
      type: Math.random() < 0.6 ? 'tree' : 'flower'
    });
  }

  scoreVal.textContent = score;
  updateHeartsUI();

  startScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
}

// 게임 오버 처리
function triggerGameOver() {
  gameState = 'GAMEOVER';
  
  // 최고기록 갱신
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('toycar_highscore', highscore);
  }

  finalScore.textContent = score;
  bestScore.textContent = highscore;

  gameOverScreen.classList.add('active');
}

// 충돌 발생 시 화면 흔들림 및 라이프 차감
function handleCollision(obsIndex) {
  obstacles.splice(obsIndex, 1); // 해당 장애물 제거
  
  lives--;
  updateHeartsUI();
  
  // 화면 흔들림 셋업
  shakeTime = 15;
  shakeAmount = 8;
  
  // 충돌 스파크 파티클 생성
  createCrashParticles(car.x, car.y - car.height / 3);

  if (lives <= 0) {
    triggerGameOver();
  } else {
    // 임시 무적 타임 돌입
    invincibleTime = INVINCIBLE_DURATION;
  }
}

// 충돌 파티클 스폰
function createCrashParticles(x, y) {
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // 살짝 위쪽으로 튀김
      size: Math.random() * 5 + 3,
      color: Math.random() < 0.5 ? '#FD9644' : '#FFDE59',
      alpha: 1,
      decay: Math.random() * 0.03 + 0.02
    });
  }
}


// --- [게임 프레임 루프 (Update & Render)] ---

function update() {
  if (gameState !== 'PLAYING') return;

  // 1. 점진적으로 게임 속도 증가
  if (gameSpeed < MAX_SPEED) {
    gameSpeed += SPEED_INC;
  }

  // 2. 점수 증가 (생존 프레임마다 누적)
  score += 1;
  scoreVal.textContent = score;

  // 3. 플레이어 무적 타이머 카운트다운
  if (invincibleTime > 0) {
    invincibleTime--;
  }

  // 4. 좌우 이동 및 피드백 각도 물리 연출
  if (keys['ArrowLeft'] || keys['a'] || keys['A'] || touchLeftPressed) {
    car.vx -= car.acc;
    // 꺾을 때 좌측으로 비주얼 롤링 (부드러운 기울기)
    car.angle = Math.max(car.angle - 0.03, -0.15);
  } else if (keys['ArrowRight'] || keys['d'] || keys['D'] || touchRightPressed) {
    car.vx += car.acc;
    // 꺾을 때 우측으로 비주얼 롤링
    car.angle = Math.min(car.angle + 0.03, 0.15);
  } else {
    // 핸들을 안 잡으면 차가 똑바로 돌아옴
    car.angle *= 0.8;
  }

  // 미끄러지는 물리 마찰 적용
  car.vx *= car.friction;
  
  // 속도 한계 제어
  if (car.vx > car.maxVx) car.vx = car.maxVx;
  if (car.vx < -car.maxVx) car.vx = -car.maxVx;

  car.x += car.vx;

  // 도로 양옆 이탈 가드라인 (도로 밖으로 너무 나가지 않게)
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

  // 5. 도로 스크롤 처리
  roadOffset = (roadOffset + gameSpeed) % 40;

  // 6. 도로 데코레이션(나무, 꽃) 업데이트 및 스폰
  sceneryObjects.forEach(obj => {
    obj.y += gameSpeed;
  });
  
  // 화면을 완전히 내려간 요소는 위쪽으로 재배치
  sceneryObjects.forEach(obj => {
    if (obj.y > GAME_HEIGHT + 30) {
      obj.y = -40;
      obj.x = Math.random() < 0.5 
        ? Math.random() * (roadX - 30) + 15 
        : Math.random() * (GAME_WIDTH - roadX - 30) + roadX + roadWidth + 15;
      obj.type = Math.random() < 0.5 ? 'tree' : (Math.random() < 0.8 ? 'flower' : 'cloud');
    }
  });

  // 7. 장애물 스폰 로직
  obstacleSpawnTimer++;
  if (obstacleSpawnTimer > obstacleSpawnInterval) {
    obstacleSpawnTimer = 0;
    // 속도가 빨라질 수록 장애물 생성도 빈번해짐 (난이도 완화 밸런싱)
    obstacleSpawnInterval = Math.max(75, 140 - (gameSpeed * 8));

    const type = Math.random() < 0.6 ? 'cone' : 'rock';
    // 도로 폭 범위 내에서 랜덤 좌우 슬롯 설정 (3개 가상 레인 개념)
    const lane = Math.floor(Math.random() * 3);
    const laneWidth = roadWidth / 3;
    const spawnX = roadX + (lane * laneWidth) + (laneWidth / 2);

    obstacles.push({
      x: spawnX,
      y: -30,
      width: type === 'cone' ? 24 : 28,
      height: type === 'cone' ? 32 : 28,
      type: type
    });
  }

  // 8. 장애물 이동 및 충돌 감지
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.y += gameSpeed;

    // 화면 밑으로 나간 장애물 삭제
    if (obs.y > GAME_HEIGHT + 30) {
      obstacles.splice(i, 1);
      continue;
    }

    // 충돌 박스 검증 (AABB 방식)
    // 억울하게 스치며 터지는 문제를 막기 위해 히트박스를 스프라이트의 60% 수준으로 훨씬 더 타이트하게 완화 (기존 75% -> 60%)
    const hitBoxScale = 0.60;
    const carLeft = car.x - (car.width * hitBoxScale) / 2;
    const carRight = car.x + (car.width * hitBoxScale) / 2;
    const carTop = car.y - (car.height * hitBoxScale) / 2;
    const carBottom = car.y + (car.height * hitBoxScale) / 2;

    const obsLeft = obs.x - (obs.width * hitBoxScale) / 2;
    const obsRight = obs.x + (obs.width * hitBoxScale) / 2;
    const obsTop = obs.y - (obs.height * hitBoxScale) / 2;
    const obsBottom = obs.y + (obs.height * hitBoxScale) / 2;

    if (
      carRight > obsLeft &&
      carLeft < obsRight &&
      carBottom > obsTop &&
      carTop < obsBottom
    ) {
      // 충돌 발생! (플레이어가 무적 아닐 때만)
      if (invincibleTime === 0) {
        handleCollision(i);
      }
    }
  }

  // 9. 충돌 스파크 파티클 업데이트
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  // 10. 화면 흔들림(Screen Shake) 감쇠
  if (shakeTime > 0) {
    shakeTime--;
  }
}

function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.save();
  // 화면 흔들림 연출 적용
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
  ctx.fillRect(roadX - 4, 0, 4, GAME_HEIGHT); // 왼쪽 가드라인
  ctx.fillRect(roadX + roadWidth, 0, 4, GAME_HEIGHT); // 오른쪽 가드라인

  // 4. 가운데 움직이는 흰색 중앙 차선(점선)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]); // 20px선, 20px빈칸
  ctx.lineDashOffset = -roadOffset; // 스크롤
  ctx.beginPath();
  ctx.moveTo(GAME_WIDTH / 2, 0);
  ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]); // 대시 설정 초기화

  // 5. 도로 사이드 데코레이션(나무, 꽃, 구름) 그리기
  sceneryObjects.forEach(obj => {
    if (obj.type === 'tree') {
      drawTree(ctx, obj.x, obj.y);
    } else if (obj.type === 'flower') {
      drawFlower(ctx, obj.x, obj.y);
    } else if (obj.type === 'cloud') {
      drawCloud(ctx, obj.x, obj.y, 14);
    }
  });

  // 6. 장애물 그리기
  obstacles.forEach(obs => {
    if (obs.type === 'cone') {
      drawCone(ctx, obs.x, obs.y, obs.width, obs.height);
    } else if (obs.type === 'rock') {
      drawRock(ctx, obs.x, obs.y, obs.width, obs.height);
    }
  });

  // 7. 플레이어 장난감 자동차 그리기
  drawPlayer();

  // 8. 충돌 파티클 그리기
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  ctx.restore();
}

// 60FPS 브라우저 루프
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// --- [버튼 이벤트 및 리스너 등록] ---

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// 터치 스크롤이나 바운스 제스처 원천 방지
document.addEventListener('touchmove', (e) => {
  if (e.scale !== 1) {
    e.preventDefault();
  }
}, { passive: false });

// 앱 실행 초기화
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
loop();
