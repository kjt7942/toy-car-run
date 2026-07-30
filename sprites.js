// ===========================================================================
//  sprites.js — 스프라이트 드로잉 전용 파일 (고도화 그래픽 버전)
// ===========================================================================
//  이 파일은 "그림 그리는 코드"만 모아둔 곳이다. 게임 규칙·물리·점수 계산은
//  전부 game.js에 있으므로, 비주얼을 손볼 때는 이 파일만 고치면 된다.
//
//  [작업 시 지켜야 할 것]
//  1. game.js의 OBSTACLE_SPECS에 있는 w/h 값은 충돌 판정 박스다. 난이도와
//     직결되므로 절대 바꾸지 말 것. 그림이 그 박스보다 크거나 작아도 상관없다.
//  2. 함수 이름과 인자 순서를 바꾸지 말 것. game.js가 이 이름으로 호출한다.
//  3. 외부 이미지·폰트·CDN을 쓰지 말 것. 전부 Canvas2D로 직접 그리는 구조다.
//  4. 좌표계는 360x640 고정이다 (game.js의 GAME_WIDTH / GAME_HEIGHT).
//
//  미술 스타일: 말랑말랑 장난감 감성 (둥근 모서리, 굵은 진회색 외곽선 #2F3640,
//             비비드 팝 컬러, 하이라이트 & 3D 입체 음영)
// ===========================================================================

// --- [공통 드로잉 헬퍼] ---
const OUTLINE_COLOR = '#2F3640';
const OUTLINE_WIDTH = 3;

// 1) 귀여운 장난감 구름 그리기
function drawCloud(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  // 구름 밑 부드러운 장난감 그림자
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.ellipse(size * 0.7, size * 0.4, size * 1.1, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 구름 메인 몽실몽실 셰이프
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
  ctx.arc(size * 0.6, -size * 0.25, size * 0.65, 0, Math.PI * 2);
  ctx.arc(size * 1.2, 0, size * 0.55, 0, Math.PI * 2);
  ctx.arc(size * 0.6, size * 0.2, size * 0.6, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 구름 상단 말랑한 하이라이트
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(size * 0.55, -size * 0.35, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 2) 귀여운 둥글둥글 장난감 나무 그리기
function drawTree(ctx, x, y) {
  ctx.save();

  // 나무 접지 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y + 20, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 나무 기둥 (입체 장난감 통나무)
  const trunkGrad = ctx.createLinearGradient(x - 6, y, x + 6, y);
  trunkGrad.addColorStop(0, '#6D4C41');
  trunkGrad.addColorStop(0.5, '#8D6E63');
  trunkGrad.addColorStop(1, '#5D4037');
  ctx.fillStyle = trunkGrad;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 2, 12, 22, 4);
  ctx.fill();
  ctx.stroke();

  // 나뭇잎 (풍성한 3D 장난감 둥근 잎)
  // 하단 어두운 잎 음영
  ctx.fillStyle = '#1E824C';
  ctx.beginPath();
  ctx.arc(x, y - 8, 19, 0, Math.PI * 2);
  ctx.arc(x - 11, y - 16, 15, 0, Math.PI * 2);
  ctx.arc(x + 11, y - 16, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 중간 기본 잎
  ctx.fillStyle = '#2ECC71';
  ctx.beginPath();
  ctx.arc(x, y - 10, 16, 0, Math.PI * 2);
  ctx.arc(x - 9, y - 17, 13, 0, Math.PI * 2);
  ctx.arc(x + 9, y - 17, 13, 0, Math.PI * 2);
  ctx.fill();

  // 상단 볼륨 하이라이트 잎
  ctx.fillStyle = '#78E08F';
  ctx.beginPath();
  ctx.arc(x - 2, y - 17, 10, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 20, 8, 0, Math.PI * 2);
  ctx.fill();

  // 빨간 미니 사과 열매 포인트
  ctx.fillStyle = '#FF4757';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.5;

  const apples = [
    { ax: x - 8, ay: y - 10, r: 3.5 },
    { ax: x + 8, ay: y - 6, r: 3.5 },
    { ax: x + 1, ay: y - 21, r: 4 }
  ];
  apples.forEach(ap => {
    ctx.beginPath();
    ctx.arc(ap.ax, ap.ay, ap.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 사과 하이라이트
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ap.ax - 1, ap.ay - 1, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF4757';
  });

  ctx.restore();
}

// 3) 귀여운 장난감 꽃 그리기
function drawFlower(ctx, x, y) {
  ctx.save();

  // 꽃대
  ctx.strokeStyle = '#20BF6B';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 12);
  ctx.stroke();

  // 잎사귀 하나
  ctx.fillStyle = '#26DE81';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 6, 4, 2, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 꽃잎 5개 (알록달록 캔디 핑크)
  ctx.fillStyle = '#FF6B81';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;

  const petalCount = 5;
  const radius = 5.5;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 2 * Math.PI) / petalCount;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 꽃수술 (노란 둥근 센터 + 하이라이트)
  ctx.fillStyle = '#FECA57';
  ctx.beginPath();
  ctx.arc(x, y, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x - 1.2, y - 1.2, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 4) 장난감 풍차 데코레이션 그리기
function drawWindmill(ctx, x, y, rot) {
  ctx.save();

  // 지지대 접지 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(x, y + 32, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 풍차 탑 지지대
  ctx.fillStyle = '#F1F2F6';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 30);
  ctx.lineTo(x - 5, y - 10);
  ctx.lineTo(x + 5, y - 10);
  ctx.lineTo(x + 14, y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 풍차 탑 빨간 지붕
  ctx.fillStyle = '#FF4757';
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 10);
  ctx.lineTo(0, y - 20);
  ctx.lineTo(x + 7, y - 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 회전 중심축
  ctx.fillStyle = '#747D8C';
  ctx.beginPath();
  ctx.arc(x, y - 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 회전하는 4개 캔디 날개
  ctx.save();
  ctx.translate(x, y - 8);
  ctx.rotate(rot);

  const bladeColors = ['#FF4757', '#2ED573', '#1E90FF', '#FFA502'];
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = bladeColors[i];
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, 28, 3.5);
    ctx.fill();
    ctx.stroke();

    // 날개 패턴 선
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2, 8, 4, 12);
  }
  ctx.restore();

  ctx.restore();
}

// 5) 플레이어 자동차 그리기 (토이 레이싱카)
function drawPlayer() {
  if (invincibleTime > 0 && Math.floor(invincibleTime / 4) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  // 1. 차량 바닥 그림자 (부스터 시 네온 글로우)
  if (boosterTime > 0) {
    ctx.shadowColor = '#00DEC9';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(0, 222, 201, 0.45)';
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  }
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 2, -car.height / 2 + 6, car.width + 4, car.height + 2, 11);
  ctx.fill();
  ctx.shadowBlur = 0; // 리셋

  // 2. 부스터 엔진 화염 이펙트 (부스터 모드일 때 뒤에서 불꽃 유출)
  if (boosterTime > 0) {
    ctx.save();
    const flameH = 15 + Math.random() * 10;
    const flameGrad = ctx.createLinearGradient(0, car.height / 2, 0, car.height / 2 + flameH);
    flameGrad.addColorStop(0, '#00DEC9');
    flameGrad.addColorStop(0.5, '#FF7675');
    flameGrad.addColorStop(1, 'rgba(255, 234, 167, 0)');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-car.width / 4, car.height / 2);
    ctx.lineTo(0, car.height / 2 + flameH);
    ctx.lineTo(car.width / 4, car.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 3. 디테일 장난감 바퀴 (4개)
  const drawToyWheel = (wx, wy) => {
    ctx.save();
    ctx.translate(wx, wy);

    // 타이어 검은색
    ctx.fillStyle = OUTLINE_COLOR;
    ctx.beginPath();
    ctx.roundRect(-3, -7, 6, 14, 3);
    ctx.fill();

    // 휠 림 (은색/노란색 회전 디테일)
    const rot = Math.sin(car.wheelRotation) * 3;
    ctx.fillStyle = boosterTime > 0 ? '#FFEAA7' : '#DFE6E9';
    ctx.fillRect(-2, rot - 2, 4, 4);

    ctx.restore();
  };

  drawToyWheel(-car.width / 2 - 2, -car.height / 2 + 11);
  drawToyWheel(car.width / 2 + 2, -car.height / 2 + 11);
  drawToyWheel(-car.width / 2 - 2, car.height / 2 - 13);
  drawToyWheel(car.width / 2 + 2, car.height / 2 - 13);

  // 4. 메인 차체 (차고 선택 스킨 컬러 / 부스터 시 네온 팝 컬러)
  const skin = getSelectedCar();
  const mainColor = boosterTime > 0 ? '#00DEC9' : carBodyColor();

  ctx.fillStyle = mainColor;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 12);
  ctx.fill();
  ctx.stroke();

  // 차체 입체 하이라이트 (좌측 상단 은은한 3D 빛 광택)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 3, -car.height / 2 + 3, car.width / 3, car.height - 6, 6);
  ctx.fill();

  // 중앙 스트라이프 레이싱 데칼
  ctx.fillStyle = boosterTime > 0 ? '#FFFFFF' : (skin.stripe || '#FFFFFF');
  ctx.fillRect(-4, -car.height / 2 + 4, 8, car.height - 8);

  // 5. 앞/뒤 윈드실드 유리창
  const glassGrad = ctx.createLinearGradient(0, -car.height / 4, 0, 2);
  glassGrad.addColorStop(0, '#E8F4F8');
  glassGrad.addColorStop(1, '#74B9FF');
  ctx.fillStyle = glassGrad;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;

  // 전면 유리창
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 4, -car.height / 4, car.width - 8, 14, 5);
  ctx.fill();
  ctx.stroke();

  // 전면 유리 반사광
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.moveTo(-car.width / 2 + 8, -car.height / 4 + 3);
  ctx.lineTo(-car.width / 2 + 13, -car.height / 4 + 3);
  ctx.lineTo(-car.width / 2 + 8, -car.height / 4 + 11);
  ctx.closePath();
  ctx.fill();

  // 후면 유리창
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 5, car.height / 4 - 2, car.width - 10, 8, 3.5);
  ctx.fill();
  ctx.stroke();

  // 6. 장난감 헤드라이트 (동글동글 황금빛/백색)
  ctx.fillStyle = boosterTime > 0 ? '#FFEAA7' : '#FFFFFF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-car.width / 3, -car.height / 2 + 2, 4.5, 0, Math.PI * 2);
  ctx.arc(car.width / 3, -car.height / 2 + 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 7. 리어 스포일러 (스포츠카 감성 날개)
  ctx.fillStyle = boosterTime > 0 ? '#FF7675' : (skin.spoiler || '#FF4757');
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 3, car.height / 2 - 4, car.width + 6, 6, 3);
  ctx.fill();
  ctx.stroke();

  // --- [액티브 시각효과: 배리어 보호막] ---
  if (activeShield) {
    ctx.save();
    const pulseScale = 1.25 + Math.sin(Date.now() / 90) * 0.04;
    ctx.strokeStyle = '#00CEC9';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#81ECEC';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.arc(0, 0, car.height * 0.62 * pulseScale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(129, 236, 236, 0.16)';
    ctx.fill();

    // 쉴드 빛나는 육각형/보호 링 포인트
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, car.height * 0.52 * pulseScale, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
    ctx.restore();
  }

  // --- [액티브 시각효과: 자석 영역] ---
  if (magnetTime > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 118, 117, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -Date.now() / 40;
    const magScale = 1.35 + Math.sin(Date.now() / 110) * 0.05;

    ctx.beginPath();
    ctx.arc(0, 0, 105 * magScale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// 6) 고깔 트래픽 콘 그리기 (경고 장애물)
function drawCone(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 1, w * 0.65, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 콘 사각 고무 받침
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, h / 2 - 5, w + 4, 6, 2);
  ctx.fill();

  ctx.fillStyle = '#FFA502';
  ctx.beginPath();
  ctx.roundRect(-w / 2, h / 2 - 7, w, 4, 2);
  ctx.fill();

  // 오렌지 빛깔 삼각 콘 바디
  ctx.fillStyle = '#FF6B81';
  const coneGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  coneGrad.addColorStop(0, '#FF4757');
  coneGrad.addColorStop(0.4, '#FFA502');
  coneGrad.addColorStop(1, '#FF4757');
  ctx.fillStyle = coneGrad;

  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(-w / 2.3, h / 2 - 6);
  ctx.lineTo(w / 2.3, h / 2 - 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.stroke();

  // 반사 선명한 흰 줄무늬 2개
  ctx.fillStyle = '#FFFFFF';

  // 상단 줄
  ctx.beginPath();
  ctx.moveTo(-w / 7, -h / 6);
  ctx.lineTo(w / 7, -h / 6);
  ctx.lineTo(w / 4.5, 0);
  ctx.lineTo(-w / 4.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 하단 줄
  ctx.beginPath();
  ctx.moveTo(-w / 3.8, h / 8);
  ctx.lineTo(w / 3.8, h / 8);
  ctx.lineTo(w / 2.8, h / 3);
  ctx.lineTo(-w / 2.8, h / 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 7) 3D 다각형 장난감 바위 그리기 (각진 입체 바위)
function drawRock(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.35, w * 0.58, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';

  // 1. 좌측 어두운 면
  ctx.fillStyle = '#57606F';
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 4);
  ctx.lineTo(-w / 3, -h / 3);
  ctx.lineTo(0, -h / 2);
  ctx.lineTo(-w / 7, h / 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. 우측 중앙 면
  ctx.fillStyle = '#747D8C';
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2.3, -h / 4);
  ctx.lineTo(w / 2, h / 3);
  ctx.lineTo(w / 6, h / 2);
  ctx.lineTo(-w / 7, h / 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. 상단 하이라이트 평면
  ctx.fillStyle = '#A4B0BE';
  ctx.beginPath();
  ctx.moveTo(-w / 3, -h / 3);
  ctx.lineTo(0, -h / 2);
  ctx.lineTo(w / 2.3, -h / 4);
  ctx.lineTo(0, -h / 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. 하단 베이스 면
  ctx.fillStyle = '#4B6584';
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 4);
  ctx.lineTo(-w / 7, h / 6);
  ctx.lineTo(w / 6, h / 2);
  ctx.lineTo(-w / 3, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 디테일 균열 선
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -h / 6);
  ctx.lineTo(-w / 5, -h / 20);
  ctx.lineTo(-w / 7, h / 8);
  ctx.stroke();

  ctx.restore();
}

// 8) 공사중 안전 바리케이드 그리기 (경고 장애물)
function drawBarrier(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 양쪽 지지대 다리
  ctx.fillStyle = '#4B6584';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;

  ctx.fillRect(-w / 2 + 2, -h / 2, 6, h);
  ctx.strokeRect(-w / 2 + 2, -h / 2, 6, h);

  ctx.fillRect(w / 2 - 8, -h / 2, 6, h);
  ctx.strokeRect(w / 2 - 8, -h / 2, 6, h);

  // 메인 옐로우 빗금 보드
  ctx.fillStyle = '#FED330';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 3, w, h * 0.62, 5);
  ctx.fill();
  ctx.stroke();

  // 검은색 스트라이프 빗금
  ctx.fillStyle = OUTLINE_COLOR;
  for (let offset = -w / 2 + 8; offset < w / 2; offset += 20) {
    ctx.beginPath();
    ctx.moveTo(offset, -h / 3);
    ctx.lineTo(offset + 9, -h / 3);
    ctx.lineTo(offset - 3, h / 3 - 4);
    ctx.lineTo(offset - 12, h / 3 - 4);
    ctx.closePath();
    ctx.fill();
  }

  // 상단 빨간 경고 램프 2개
  const drawLamp = (lx) => {
    ctx.fillStyle = '#FF4757';
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(lx, -h / 3 - 4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(lx - 1, -h / 3 - 5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  };

  drawLamp(-w / 3);
  drawLamp(w / 3);

  ctx.restore();
}

// 9) 오일 드럼통 그리기 (위험 장애물)
function drawOilDrum(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 1, w * 0.55, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 바디 금속 그래디언트
  const drumGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  drumGrad.addColorStop(0, '#2F3640');
  drumGrad.addColorStop(0.45, '#718093');
  drumGrad.addColorStop(1, '#2F3640');

  ctx.fillStyle = drumGrad;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;

  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 6);
  ctx.fill();
  ctx.stroke();

  // 깡통 리벳 띠선 2개
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 6);
  ctx.lineTo(w / 2, -h / 6);
  ctx.moveTo(-w / 2, h / 6);
  ctx.lineTo(w / 2, h / 6);
  ctx.stroke();

  // 해골 대신 시선 강탈 경고 오일 방울 비주얼 마크
  ctx.fillStyle = '#FF4757';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 3, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 10) 물웅덩이 그리기 (미끄러짐 함정)
function drawPuddle(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 웅덩이 바닥 반투명 블루
  ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 물웅덩이 테두리 (미끄러움 느낌)
  ctx.strokeStyle = '#74B9FF';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 찰랑거리는 빛 물결 곡선
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-w * 0.14, -h * 0.14, w * 0.24, h * 0.18, 0, Math.PI * 0.8, Math.PI * 1.9);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(w * 0.18, h * 0.12, w * 0.15, h * 0.12, 0, Math.PI * 0.8, Math.PI * 1.9);
  ctx.stroke();

  ctx.restore();
}

// 11) 마주 오는 교통차 (이동형 방해 차량)
function drawTrafficCar(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 바닥 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, -h / 2 + 6, w + 4, h, 10);
  ctx.fill();

  // 검은 장난감 타이어
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.fillRect(-w / 2 - 3, -h / 2 + 9, 5, 12);
  ctx.fillRect(w / 2 - 2, -h / 2 + 9, 5, 12);
  ctx.fillRect(-w / 2 - 3, h / 2 - 21, 5, 12);
  ctx.fillRect(w / 2 - 2, h / 2 - 21, 5, 12);

  // 퍼플 팝 바디컬러 (플레이어 노랑과 확연한 대비)
  ctx.fillStyle = '#9B59B6';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 11);
  ctx.fill();
  ctx.stroke();

  // 차체 하이라이트
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w / 4, h - 6);

  // 유리창 (플레이어를 향함)
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
  ctx.roundRect(-w / 2 + 5, -h / 3, w - 10, 8, 3.5);
  ctx.fill();
  ctx.stroke();

  // 플레이어를 향해 덤비는 마주보는 헤드라이트
  ctx.fillStyle = '#F1C40F';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-w / 3.2, h / 2 - 1, 4, 0, Math.PI * 2);
  ctx.arc(w / 3.2, h / 2 - 1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 12) 길 건너는 보행자 & 동물 (치면 안 되는 대상)
function drawCrosser(ctx, obs) {
  const w = obs.width;
  const h = obs.height;
  const dir = obs.vx >= 0 ? 1 : -1;
  const swing = Math.sin(obs.step) * 3.2;

  ctx.save();
  ctx.translate(obs.x, obs.y);

  // 접지 그림자
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

  // 머리 위 시선강탈 경고 방울 (노란 원 안의 빨간 !)
  ctx.fillStyle = '#FECA57';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -h / 2 - 11, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FF4757';
  ctx.beginPath();
  ctx.roundRect(-1.5, -h / 2 - 16, 3, 6, 1.5);
  ctx.arc(0, -h / 2 - 7.5, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 보행자: 아기자기한 레고 사람 피규어
function drawWalkerBody(ctx, w, h, dir, swing, tone) {
  const headR = 7.5;
  const headY = -h / 2 + headR + 1;
  const bodyTop = headY + headR - 1;
  const bodyH = h / 2 + 1;

  // 뒤쪽 다리
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-2, bodyTop + bodyH - 3);
  ctx.lineTo(-2 - swing, h / 2 - 1);
  ctx.stroke();

  // 티셔츠 몸통
  ctx.fillStyle = tone || '#54A0FF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 3, bodyTop, w - 6, bodyH, 5);
  ctx.fill();
  ctx.stroke();

  // 흔들리는 팔
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(dir * (w / 2 - 4), bodyTop + 4);
  ctx.lineTo(dir * (w / 2 - 4) + swing * 0.8, bodyTop + 12);
  ctx.stroke();

  // 앞쪽 다리 & 신발
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(3, bodyTop + bodyH - 3);
  ctx.lineTo(3 + swing, h / 2 - 1);
  ctx.stroke();

  ctx.fillStyle = '#2E86DE';
  ctx.beginPath();
  ctx.ellipse(3 + swing + dir * 1.2, h / 2, 2.8, 1.8, 0, 0, Math.PI * 2);
  ctx.ellipse(-2 - swing + dir * 1.2, h / 2, 2.8, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 피부 톤 머리
  ctx.fillStyle = '#FFE0BD';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 앙증맞은 갈색 머리카락
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.arc(0, headY, headR, Math.PI * 1.05, Math.PI * 2.05);
  ctx.fill();

  // 눈
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.arc(dir * 2.6, headY + 1.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

// 동물: 앙증맞은 통통 아기 강아지/고양이 토이
function drawCritterBody(ctx, w, h, dir, swing, tone) {
  const fur = tone || '#FF9F43';
  const headX = dir * (w / 2 - 6);

  // 살랑거리는 꼬리
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-dir * (w / 2 - 5), -1);
  ctx.quadraticCurveTo(
    -dir * (w / 2 + 1), -4 + swing * 0.6,
    -dir * (w / 2 - 1), -10 + swing * 0.6
  );
  ctx.stroke();

  // 짧고 귀여운 다리
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-4, h / 2 - 7); ctx.lineTo(-4 - swing * 0.5, h / 2 - 1);
  ctx.moveTo(4, h / 2 - 7);  ctx.lineTo(4 + swing * 0.5, h / 2 - 1);
  ctx.stroke();

  // 통통한 털 몸통
  ctx.fillStyle = fur;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(-dir * 2, 0, w / 2 - 3, h / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 둥근 머리
  ctx.beginPath();
  ctx.arc(headX, -2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 쫑긋 귀 2개
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

  // 눈 코
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.arc(headX + dir * 1.5, -3.5, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + dir * 5.5, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

// 13) 경찰 추격차 (Chaser)
function drawChaser(ctx, c) {
  const w = c.kind.w;
  const h = c.kind.h;
  const blink = Math.floor(Date.now() / 120) % 2 === 0;

  ctx.save();
  ctx.translate(c.x, c.y);

  if (c.stun > 0) {
    ctx.rotate(Math.sin(Date.now() / 45) * 0.14);
  }

  // 바닥 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, -h / 2 + 6, w + 4, h, 11);
  ctx.fill();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;

  // 흑백 패트롤카 투톤 바디
  ctx.fillStyle = '#F5F6FA';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 11);
  ctx.fill();
  ctx.stroke();

  // 측면/중앙 검은 도어 패널
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 6, w, h / 3, 3);
  ctx.fill();

  // 전면 민트 유리창
  ctx.fillStyle = '#81ECEC';
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 5, h / 5, w - 10, 13, 4);
  ctx.fill();
  ctx.stroke();

  // 붉은색 / 푸른색 번쩍이는 상단 경광등
  const beacon = blink ? '#FF4757' : '#2ED573';
  ctx.fillStyle = beacon;
  ctx.beginPath();
  ctx.roundRect(-11, -h / 2 - 6, 22, 9, 4.5);
  ctx.fill();
  ctx.stroke();

  // 경광등 퍼지는 빛 아우라
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = beacon;
  ctx.beginPath();
  ctx.arc(blink ? -8 : 8, -h / 2 - 2, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // 추격 헤드라이트
  ctx.fillStyle = '#FFEAA7';
  ctx.beginPath();
  ctx.arc(-w / 3.2, h / 2 - 2, 4, 0, Math.PI * 2);
  ctx.arc(w / 3.2, h / 2 - 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// --- [먹어야 하는 아이템 6종 (즉시 식별 가능한 팝 광원)] ---

// 1) 황금 코인 (Coin)
function drawCoinItem(ctx, x, y, size, risky) {
  ctx.save();
  ctx.translate(x, y);

  const pulse = Math.sin(Date.now() / 110) * 1.5;
  const radius = size / 2 + pulse;

  // 고위험 코인은 붉은 링 아우라
  if (risky) {
    ctx.strokeStyle = 'rgba(255, 71, 87, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -Date.now() / 50;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 7.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 코인 광원 아우라
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 10;

  // 황금 외곽선
  ctx.fillStyle = '#B8860B';
  ctx.beginPath();
  ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
  ctx.fill();

  // 메인 골드 3D 그라데이션
  const goldGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 1, 0, 0, radius);
  goldGrad.addColorStop(0, '#FFF200');
  goldGrad.addColorStop(0.7, '#FFD700');
  goldGrad.addColorStop(1, '#FFA502');

  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0; // 리셋

  // 코인 테두리 파임 음각
  ctx.strokeStyle = '#D4AC0D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  // 별모양 마크
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-radius * 0.3, -radius * 0.3, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 2) 피버 부스터 아이템 (로켓 ⚡)
function drawBoosterItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  const bounce = Math.sin(Date.now() / 90) * 3.5;
  ctx.translate(0, bounce);

  // 민트 글로우 아우라
  ctx.shadowColor = '#00CEC9';
  ctx.shadowBlur = 14;

  // 메인 파란 로켓 바디
  ctx.fillStyle = '#0984E3';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-size / 2.5, -size / 1.8, size * 0.8, size * 1.1, 8);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;

  // 황금 번개 ⚡ 문양
  ctx.fillStyle = '#FECA57';
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

// 3) 보호막 쉴드 🛡️ 아이템
function drawShieldItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  const bounce = Math.sin(Date.now() / 100) * 3.5;
  ctx.translate(0, bounce);

  ctx.shadowColor = '#81ECEC';
  ctx.shadowBlur = 12;

  // 에메랄드 방패
  ctx.fillStyle = '#00CEC9';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -size / 1.8);
  ctx.lineTo(size / 2, -size / 3);
  ctx.lineTo(size / 2.5, size / 4);
  ctx.lineTo(0, size / 1.8);
  ctx.lineTo(-size / 2.5, size / 4);
  ctx.lineTo(-size / 2, -size / 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;

  // 십자 반짝 문양
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -size / 3.2);
  ctx.lineTo(0, size / 3.2);
  ctx.moveTo(-size / 4, 0);
  ctx.lineTo(size / 4, 0);
  ctx.stroke();

  ctx.restore();
}

// 4) 자석 🧲 아이템
function drawMagnetItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  const bounce = Math.sin(Date.now() / 95) * 3;
  ctx.translate(0, bounce);

  ctx.shadowColor = '#FF7675';
  ctx.shadowBlur = 12;

  ctx.strokeStyle = '#FF4757';
  ctx.lineWidth = 7.5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(0, 2, size * 0.35, Math.PI, 0, true);
  ctx.lineTo(size * 0.35, -7);
  ctx.moveTo(-size * 0.35, 2);
  ctx.lineTo(-size * 0.35, -7);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // 자석 은색 팁
  ctx.strokeStyle = '#F1F2F6';
  ctx.lineWidth = 7.5;
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -7);
  ctx.lineTo(-size * 0.35, -11);
  ctx.moveTo(size * 0.35, -7);
  ctx.lineTo(size * 0.35, -11);
  ctx.stroke();

  ctx.restore();
}

// 5) 하트 아이템 ❤️
function drawHeartItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + Math.sin(Date.now() / 105) * 3.5);

  ctx.shadowColor = '#FF4757';
  ctx.shadowBlur = 14;

  const s = size / 22;
  ctx.fillStyle = '#FF4757';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(0, 9 * s);
  ctx.bezierCurveTo(-13 * s, -1 * s, -8 * s, -13 * s, 0, -5 * s);
  ctx.bezierCurveTo(8 * s, -13 * s, 13 * s, -1 * s, 0, 9 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;

  // 하트 하이라이트
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.ellipse(-4 * s, -3 * s, 2.5 * s, 3.5 * s, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 6) 모래시계 ⏳ 아이템
function drawSlowItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + Math.sin(Date.now() / 100) * 3);

  ctx.shadowColor = '#A29BFE';
  ctx.shadowBlur = 12;

  const s = size / 2;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;

  // 위아래 나무 프레임
  ctx.fillStyle = '#DFE6E9';
  ctx.beginPath();
  ctx.roundRect(-s * 0.8, -s, s * 1.6, 5, 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(-s * 0.8, s - 5, s * 1.6, 5, 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;

  // 보라빛 유리 모래관
  ctx.fillStyle = '#6C5CE7';
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, -s + 5);
  ctx.lineTo(s * 0.6, -s + 5);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-s * 0.6, s - 5);
  ctx.lineTo(s * 0.6, s - 5);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 14) 선택 게이트 (Gate)
function drawGate(ctx, x, y, w, h, bonus) {
  ctx.save();
  ctx.translate(x, y);

  const half = w / 2;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3;

  // 기둥
  ctx.fillStyle = bonus ? '#B8860B' : '#26DE81';
  ctx.beginPath();
  ctx.roundRect(-half, -h / 2, 9, h, 3);
  ctx.roundRect(half - 9, -h / 2, 9, h, 3);
  ctx.fill();
  ctx.stroke();

  // 현수막 (황금 게이트 vs 초록 게이트)
  ctx.fillStyle = bonus ? '#FFD700' : '#2ED573';
  if (bonus) {
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 14;
  }
  ctx.beginPath();
  ctx.roundRect(-half + 6, -h / 2, w - 12, h * 0.62, 5);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = OUTLINE_COLOR;
  ctx.font = '900 15px "Jua", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bonus ? '🪙 x2 위험' : '✅ 안전', 0, -h / 2 + h * 0.31);

  ctx.restore();
}