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

// 게임 밸런스 및 물리 상수 (초반 난이도를 쫄깃하게 4.8로 상향, 가속 및 최고속도 버프)
let gameSpeed = 4.8;
const BASE_SPEED = 4.8;       
const MAX_SPEED = 11.0;        
const SPEED_INC = 0.0005;      

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

// --- [Web Audio API 효과음 플레이어] ---
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    } catch (e) {
      console.log("AudioContext 초기화 에러:", e);
      audioCtx = null; // 오디오 미지원 디바이스 완벽 폴백
    }
  }
}

function playSound(type) {
  try {
    initAudio();
    if (!audioCtx) return;
    
    // 브라우저 자동재생 제한 우회
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;

    if (type === 'coin') {
      // 높은 톤의 "띠링♪" 소리
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } 
    else if (type === 'item') {
      // "뾰로롱↑" 주파수 상승
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, now); // E4
      osc.frequency.exponentialRampToValueAtTime(990, now + 0.35);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.start(now);
      osc.stop(now + 0.38);
    } 
    else if (type === 'booster') {
      // 제트기 가속 사운드!
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.8);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc.start(now);
      osc.stop(now + 0.85);
    } 
    else if (type === 'crash') {
      // 폭발음 "쾅!" (노이즈 필터 또는 삼각파 디케이)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.4);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } 
    else if (type === 'gameover') {
      // 하강하는 레트로 아케이드 패배음
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(349.23, now + 0.15); // F4
      osc.frequency.setValueAtTime(293.66, now + 0.3);  // D4
      osc.frequency.linearRampToValueAtTime(110, now + 0.8);
      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc.start(now);
      osc.stop(now + 0.85);
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
  if (['ArrowUp', 'ArrowDown', ' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
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

touchRight.addEventListener('touchend', (e) => {
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

  // 3. 메인 바디 (기본: 노란색 장난감 카, 부스터: 스포티한 블루/네온 카)
  ctx.fillStyle = boosterTime > 0 ? '#00DEC9' : '#FFDE59';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 12);
  ctx.fill();
  
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 스포티 스트라이프 데칼 라인 추가
  ctx.fillStyle = boosterTime > 0 ? '#FFFFFF' : '#FF5757';
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
  ctx.fillStyle = boosterTime > 0 ? '#FF7675' : '#2F3640';
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

// --- [아이템 드로잉 함수군] ---

// 1) 코인 렌더링 (빛나는 둥근 금화)
function drawCoinItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  // 공전 반짝임 펄스 크기 계산
  const pulse = Math.sin(Date.now() / 120) * 1.5;
  const radius = size / 2 + pulse;

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


// --- [게임 시스템 및 라이프사이클 관리] ---

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
  initAudio();
  playSound('item'); // 게임 시작 뾰로롱
  gameState = 'PLAYING';
  score = 0;
  lives = 3;
  gameSpeed = BASE_SPEED;
  invincibleTime = 0;
  activeShield = false;
  boosterTime = 0;
  magnetTime = 0;
  
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

  startScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
}

// 게임 오버
function triggerGameOver() {
  playSound('gameover'); // 패배 하강 멜로디
  gameState = 'GAMEOVER';
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('toycar_highscore', highscore);
  }
  finalScore.textContent = score;
  bestScore.textContent = highscore;
  gameOverScreen.classList.add('active');
}

// 충돌 처리 (보호막 유무 판정)
function handleCollision(obsIndex) {
  const obs = obstacles[obsIndex];
  
  // 오일 드럼통일 때는 하트 감소가 아닌 화면 방해 기믹만 작동!
  if (obs.type === 'oildrum') {
    obstacles.splice(obsIndex, 1);
    playSound('crash');
    createCrashParticles(obs.x, obs.y, '#2F3640');
    // 화면에 물감/오일 튀김 생성
    triggerScreenOil();
    addFloatingText(car.x, car.y - 40, "미끌미끌!", "#718093");
    shakeTime = 8;
    shakeAmount = 4;
    return;
  }

  // 부스터 피버 모드일 땐 부딪혀도 장애물이 그냥 터져서 날아감
  if (boosterTime > 0) {
    obstacles.splice(obsIndex, 1);
    playSound('crash');
    createCrashParticles(obs.x, obs.y, '#FFD700');
    addFloatingText(obs.x, obs.y, "파괴!!", "#00DEC9");
    shakeTime = 6;
    shakeAmount = 5;
    score += 150; // 파괴 보너스 점수!
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
  playSound('crash');
  lives--;
  updateHeartsUI();
  
  shakeTime = 20;
  shakeAmount = 10;
  createCrashParticles(car.x, car.y - 10, '#FF7675');
  addFloatingText(car.x, car.y - 40, "앗!!", "#FF5757");

  if (lives <= 0) {
    triggerGameOver();
  } else {
    invincibleTime = INVINCIBLE_DURATION;
  }
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


// --- [게임 프레임 루프 (Update & Render)] ---

function update(dt = 1.0) {
  if (gameState !== 'PLAYING') return;

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

  // 2. 스크롤 누적 점수 증가 (부스터 중일 땐 점수 누적 대폭 증가)
  score += (boosterTime > 0 ? 3 : 1) * (dt / 16.6);
  scoreVal.textContent = Math.floor(score);

  // 3. 타이머 제어
  if (invincibleTime > 0) invincibleTime -= dt;
  if (magnetTime > 0) magnetTime -= dt;

  // 바퀴 회전 애니용 각도 증가
  car.wheelRotation += targetSpeed * 0.15 * (dt / 16.6);

  // 4. 좌우 조작 물리 적용 (deltaTime 연동 보정)
  const moveSpeedModifier = dt;
  if (keys['ArrowLeft'] || keys['a'] || keys['A'] || touchLeftPressed) {
    car.vx -= car.acc * moveSpeedModifier;
    car.angle = Math.max(car.angle - 0.035 * moveSpeedModifier, -0.16);
  } else if (keys['ArrowRight'] || keys['d'] || keys['D'] || touchRightPressed) {
    car.vx += car.acc * moveSpeedModifier;
    car.angle = Math.min(car.angle + 0.035 * moveSpeedModifier, 0.16);
  } else {
    car.angle *= Math.pow(0.8, moveSpeedModifier);
  }

  car.vx *= Math.pow(car.friction, moveSpeedModifier);
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

  // 7. 장애물 및 아이템 주기적 통합 스폰 로직 (dt 반영)
  spawnTimer += dt;
  if (spawnTimer > spawnInterval) {
    spawnTimer = 0;
    // 게임 진행 속도에 따라 서서히 빨라짐
    spawnInterval = Math.max(38, 75 - (targetSpeed * 4.5));

    const rng = Math.random();

    if (rng < 0.65) {
      // --- [장애물 스폰] ---
      const typeRoll = Math.random();
      let type = 'cone';
      let w = 24, h = 32;

      if (typeRoll < 0.45) {
        type = 'cone'; w = 24; h = 32;
      } else if (typeRoll < 0.75) {
        type = 'rock'; w = 28; h = 28;
      } else if (typeRoll < 0.90) {
        type = 'barrier'; w = 62; h = 34; // 2레인 덮는 넓은 바리케이드
      } else {
        type = 'oildrum'; w = 26; h = 38; // 오일 스크린 방해형
      }

      // [핵심 버그 수정 및 안전지대 타파]:
      // 기존 3개 레인 정가운데 스폰에서 탈피하여 좌우 미세 오프셋 무작위 추가, 
      // 최좌측 및 최우측 도로 가장자리까지 커버되도록 넓고 정교한 타겟 스폰 실시!
      let spawnX;
      if (type === 'barrier') {
        // 넓은 바리케이드는 도로 내부 무작위 중심부에 정밀 배치
        spawnX = Math.random() * (roadWidth - w) + roadX + w/2;
      } else {
        // 일반 장애물: 도로의 최좌측 경계(roadX)부터 최우측 경계(roadX + roadWidth)까지 
        // 꼼수가 완전히 없도록 완전 무작위 촘촘 스폰 설계!
        spawnX = Math.random() * (roadWidth - w - 8) + roadX + w/2 + 4;
      }

      obstacles.push({
        x: spawnX,
        y: -40,
        width: w,
        height: h,
        type: type
      });

    } else {
      // --- [아이템 스폰] ---
      const itemRoll = Math.random();
      let itype = 'coin';
      if (itemRoll < 0.70) {
        itype = 'coin';
      } else if (itemRoll < 0.82) {
        itype = 'shield';
      } else if (itemRoll < 0.92) {
        itype = 'magnet';
      } else {
        itype = 'booster';
      }

      // 아이템 역시 도로 위 다양한 영역에 무작위 배치
      const spawnX = Math.random() * (roadWidth - 30) + roadX + 15;
      gameItems.push({
        x: spawnX,
        y: -30,
        width: itype === 'coin' ? 20 : 25,
        height: itype === 'coin' ? 20 : 25,
        type: itype
      });
    }
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
        score += 150;
        playSound('coin');
        addFloatingText(it.x, it.y, "+150 COIN!", "#FED330");
        createCrashParticles(it.x, it.y, '#FFD700');
      } else if (it.type === 'shield') {
        activeShield = true;
        playSound('item');
        addFloatingText(car.x, car.y - 45, "보호막 장착 🛡️", "#00CEC9");
        createCrashParticles(it.x, it.y, '#81ECEC');
      } else if (it.type === 'magnet') {
        magnetTime = MAGNET_DURATION;
        playSound('item');
        addFloatingText(car.x, car.y - 45, "코인 자석 활성 🧲", "#FF7675");
        createCrashParticles(it.x, it.y, '#FF7675');
      } else if (it.type === 'booster') {
        boosterTime = BOOSTER_DURATION;
        invincibleTime = BOOSTER_DURATION + 30; // 부스터 중에는 완벽 무적 제공!
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
    obs.y += targetSpeed * dt;

    if (obs.y > GAME_HEIGHT + 30) {
      obstacles.splice(i, 1);
      continue;
    }

    // 타이트한 히트박스 판정
    const hitBoxScale = 0.65;
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
      // 부스터 중이 아니고 일반 무적 타이밍 아닐 때 충돌
      if (invincibleTime === 0 || boosterTime > 0) {
        handleCollision(i);
      }
    }
  }

  // 10. 충돌 스파크 파티클 업데이트
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  // 11. 화면 방해 오일 효과 감쇠
  for (let i = screenOils.length - 1; i >= 0; i--) {
    const oil = screenOils[i];
    oil.life--;
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
    ft.y += ft.vy;
    ft.alpha -= 0.016;
    ft.scale += 0.005;
    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
    }
  }

  // 13. 화면 흔들림(Screen Shake) 감쇠
  if (shakeTime > 0) {
    shakeTime--;
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

  // 6. 아이템 그리기
  gameItems.forEach(it => {
    if (it.type === 'coin') {
      drawCoinItem(ctx, it.x, it.y, it.width);
    } else if (it.type === 'shield') {
      drawShieldItem(ctx, it.x, it.y, it.width);
    } else if (it.type === 'magnet') {
      drawMagnetItem(ctx, it.x, it.y, it.width);
    } else if (it.type === 'booster') {
      drawBoosterItem(ctx, it.x, it.y, it.width);
    }
  });

  // 7. 장애물 그리기
  obstacles.forEach(obs => {
    if (obs.type === 'cone') {
      drawCone(ctx, obs.x, obs.y, obs.width, obs.height);
    } else if (obs.type === 'rock') {
      drawRock(ctx, obs.x, obs.y, obs.width, obs.height);
    } else if (obs.type === 'barrier') {
      drawBarrier(ctx, obs.x, obs.y, obs.width, obs.height);
    } else if (obs.type === 'oildrum') {
      drawOilDrum(ctx, obs.x, obs.y, obs.width, obs.height);
    }
  });

  // 8. 플레이어 배기가스 먼지 그리기
  dustParticles.forEach(d => {
    ctx.save();
    ctx.globalAlpha = d.alpha;
    ctx.fillStyle = '#E4F1FE'; // 뭉게뭉게 구름같은 장난감 연기 색상
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 9. 플레이어 장난감 자동차 그리기
  drawPlayer();

  // 10. 충돌 파티클 그리기
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 11. 고속 스피드라인 그리기
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

  // 12. 통통 뜨는 텍스트 그리기
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

  // 13. 피버 모드일 때 화면 가장자리 네온 아우라 광원 연출
  if (boosterTime > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 222, 201, 0.45)';
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.restore();
  }

  // 14. 오일 스크린 번짐 연출 그리기 (가장 위에 덧칠)
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
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// 스마트폰 모바일 터치 대응 (click 이벤트가 간헐적으로 안 받는 브라우저 완벽 보호)
startBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startGame();
}, { passive: false });

restartBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startGame();
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (e.scale !== 1) {
    e.preventDefault();
  }
}, { passive: false });

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
loop((window.performance && window.performance.now) ? window.performance.now() : Date.now());
