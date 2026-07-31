// ===========================================================================
//  sprites.js — 스프라이트 드로잉 전용 파일
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
//  대부분의 함수는 (ctx, x, y, w, h, ...)만 받는 순수 함수다.
//  예외는 drawPlayer() 하나로, 플레이어 상태(car, boosterTime 등)를 직접 읽는다.
//  index.html에서 game.js보다 먼저 로드된다.
// ===========================================================================

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
  ctx.rotate(car.angle + (car.spin || 0));

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
// 이름은 puddle이지만 실제로는 바나나 껍질을 그린다. 밟으면 미끄러진다는 규칙(game.js)은
// 그대로고 그림만 바나나로 바꿨다 — 물웅덩이가 함정처럼 안 느껴진다는 피드백 때문.
function drawPuddle(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 바닥 그림자
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.32, w * 0.42, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // 초승달 모양 바나나 몸통
  ctx.fillStyle = '#FFD32A';
  ctx.strokeStyle = '#2F3640';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.46, h * 0.1);
  ctx.quadraticCurveTo(0, -h * 0.62, w * 0.46, h * 0.05);
  ctx.quadraticCurveTo(0, -h * 0.1, -w * 0.46, h * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 양쪽 꼭지 (갈색)
  ctx.fillStyle = '#7C5A3A';
  ctx.beginPath();
  ctx.ellipse(-w * 0.46, h * 0.08, 3.5, 3, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(w * 0.46, h * 0.06, 3.5, 3, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 껍질 능선 하이라이트
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.34, h * 0.02);
  ctx.quadraticCurveTo(0, -h * 0.38, w * 0.32, -h * 0.02);
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