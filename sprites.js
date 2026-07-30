// ===========================================================================
//  sprites.js — 스프라이트 드로잉 전용 파일 (담백하고 깔끔한 미니멀 플랫 토이)
// ===========================================================================
//  이 파일은 "그림 그리는 코드"만 모아둔 곳이다. 게임 규칙·물리·점수 계산은
//  전부 game.js에 있으므로, 비주얼을 손볼 때는 이 파일만 고치면 된다.
//
//  [작업 시 지켜야 할 것]
//  1. game.js의 OBSTACLE_SPECS에 있는 w/h 값은 충돌 판정 박스다.
//  2. 함수 이름과 인자 순서를 바꾸지 말 것.
//  3. 외부 이미지·폰트·CDN을 쓰지 말 것.
//  4. 좌표계는 360x640 고정이다.
//
//  미술 스타일: 담백하고 정갈한 미니멀 플랫 토이 (군더더기 없는 간결한 형태,
//             산뜻하고 깔끔한 컬러, 슬림하고 명확한 2px 테두리)
// ===========================================================================

const OUTLINE_COLOR = '#2C3E50'; // 정갈하고 깔끔한 다크 네이비 외곽선
const OUTLINE_WIDTH = 2;       // 군더더기 없이 슬림한 선 두께

// 1) 정갈하고 군더더기 없는 미니멀 구름
function drawCloud(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  // 얇고 은은한 밑 그림자
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.beginPath();
  ctx.ellipse(size * 0.6, size * 0.35, size * 0.9, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 순백 미니멀 구름
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.65, 0, Math.PI * 2);
  ctx.arc(size * 0.55, -size * 0.2, size * 0.55, 0, Math.PI * 2);
  ctx.arc(size * 1.1, 0, size * 0.5, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 2) 담백하고 깔끔한 미니멀 장난감 나무
function drawTree(ctx, x, y) {
  ctx.save();

  // 깔끔한 접지 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 나무 기둥 (단정한 통나무)
  ctx.fillStyle = '#8D6E63';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.roundRect(x - 5, y, 10, 20, 3);
  ctx.fill();
  ctx.stroke();

  // 깔끔한 2단 나뭇잎
  ctx.fillStyle = '#2ECC71';
  ctx.beginPath();
  ctx.arc(x, y - 8, 17, 0, Math.PI * 2);
  ctx.arc(x - 8, y - 14, 12, 0, Math.PI * 2);
  ctx.arc(x + 8, y - 14, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 상단 은은한 포인트 잎
  ctx.fillStyle = '#58D68D';
  ctx.beginPath();
  ctx.arc(x, y - 12, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 3) 심플하고 정갈한 미니멀 꽃
function drawFlower(ctx, x, y) {
  ctx.save();

  // 줄기
  ctx.strokeStyle = '#2ECC71';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 10);
  ctx.stroke();

  // 심플 5엽 핑크 꽃잎
  ctx.fillStyle = '#FF7675';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.5;

  const petalCount = 5;
  const radius = 5;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 2 * Math.PI) / petalCount;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 센터 노란 꽃수술
  ctx.fillStyle = '#FDCB6E';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 4) 정갈한 미니멀 풍차
function drawWindmill(ctx, x, y, rot) {
  ctx.save();

  // 지지대 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.ellipse(x, y + 30, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 깔끔한 백색 풍차 탑
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 28);
  ctx.lineTo(x - 4, y - 8);
  ctx.lineTo(x + 4, y - 8);
  ctx.lineTo(x + 12, y + 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 노란 민둥 지붕
  ctx.fillStyle = '#FDCB6E';
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 8);
  ctx.lineTo(0, y - 17);
  ctx.lineTo(x + 6, y - 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 회전 중심
  ctx.fillStyle = '#74B9FF';
  ctx.beginPath();
  ctx.arc(x, y - 7, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 회전하는 4색 깔끔한 날개
  ctx.save();
  ctx.translate(x, y - 7);
  ctx.rotate(rot);

  const bladeColors = ['#FF7675', '#2ECC71', '#0984E3', '#FDCB6E'];
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = bladeColors[i];
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-3, 0, 6, 26, 3);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

// 5) 플레이어 자동차 (담백하고 군더더기 없는 미니멀 레이서)
function drawPlayer() {
  if (invincibleTime > 0 && Math.floor(invincibleTime / 4) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  // 1. 차체 얇은 그림자
  ctx.fillStyle = boosterTime > 0 ? 'rgba(0, 206, 201, 0.3)' : 'rgba(0, 0, 0, 0.16)';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 1, -car.height / 2 + 5, car.width + 2, car.height + 2, 10);
  ctx.fill();

  // 2. 바퀴 (심플 4개 타이어)
  const drawToyWheel = (wx, wy) => {
    ctx.save();
    ctx.translate(wx, wy);

    ctx.fillStyle = OUTLINE_COLOR;
    ctx.beginPath();
    ctx.roundRect(-2.5, -6, 5, 12, 2.5);
    ctx.fill();

    const rot = Math.sin(car.wheelRotation) * 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-1.5, rot - 1.5, 3, 3);

    ctx.restore();
  };

  drawToyWheel(-car.width / 2 - 2, -car.height / 2 + 10);
  drawToyWheel(car.width / 2 + 2, -car.height / 2 + 10);
  drawToyWheel(-car.width / 2 - 2, car.height / 2 - 12);
  drawToyWheel(car.width / 2 + 2, car.height / 2 - 12);

  // 3. 메인 차체 (군더더기 없는 산뜻 플랫 바디)
  const skin = getSelectedCar();
  const mainColor = boosterTime > 0 ? '#00CEC9' : carBodyColor();

  ctx.fillStyle = mainColor;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 10);
  ctx.fill();
  ctx.stroke();

  // 깔끔한 윈드실드 유리창
  ctx.fillStyle = '#74B9FF';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 4, -car.height / 4, car.width - 8, 13, 4);
  ctx.fill();
  ctx.stroke();

  // 유리창 심플 반사선
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-car.width / 2 + 7, -car.height / 4 + 3);
  ctx.lineTo(-car.width / 2 + 12, -car.height / 4 + 3);
  ctx.lineTo(-car.width / 2 + 7, -car.height / 4 + 10);
  ctx.closePath();
  ctx.fill();

  // 후면 유리창
  ctx.fillStyle = '#74B9FF';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 5, car.height / 4 - 2, car.width - 10, 7, 3);
  ctx.fill();
  ctx.stroke();

  // 4. 헤드라이트 (둥근 노란 2개)
  ctx.fillStyle = '#FFEAA7';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-car.width / 3, -car.height / 2 + 2, 4, 0, Math.PI * 2);
  ctx.arc(car.width / 3, -car.height / 2 + 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. 스포일러 (심플 미니 날개)
  ctx.fillStyle = boosterTime > 0 ? '#FF7675' : (skin.spoiler || '#FF7675');
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 2, car.height / 2 - 4, car.width + 4, 5, 2.5);
  ctx.fill();
  ctx.stroke();

  // --- [액티브 효과: 쉴드] ---
  if (activeShield) {
    ctx.save();
    ctx.strokeStyle = '#00CEC9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, car.height * 0.64, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 206, 201, 0.12)';
    ctx.fill();
    ctx.restore();
  }

  // --- [액티브 효과: 자석] ---
  if (magnetTime > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 118, 117, 0.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 105, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// 6) 주황 트래픽 콘 (담백한 삼각 콘)
function drawCone(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 1, w * 0.6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 받침
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 1, h / 2 - 5, w + 2, 5, 2);
  ctx.fill();

  // 오렌지 콘
  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(-w / 2.3, h / 2 - 5);
  ctx.lineTo(w / 2.3, h / 2 - 5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.stroke();

  // 흰 띠 2개
  ctx.fillStyle = '#FFFFFF';

  ctx.beginPath();
  ctx.moveTo(-w / 7, -h / 6);
  ctx.lineTo(w / 7, -h / 6);
  ctx.lineTo(w / 4.5, 0);
  ctx.lineTo(-w / 4.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

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

// 7) 담백하고 깔끔한 미니멀 바위
function drawRock(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.35, w * 0.55, h * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.lineJoin = 'round';

  // 1. 좌측 톤
  ctx.fillStyle = '#BDC3C7';
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 4);
  ctx.lineTo(-w / 3, -h / 3);
  ctx.lineTo(0, -h / 2);
  ctx.lineTo(-w / 7, h / 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. 우측 톤
  ctx.fillStyle = '#ECF0F1';
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2.3, -h / 4);
  ctx.lineTo(w / 2, h / 3);
  ctx.lineTo(w / 6, h / 2);
  ctx.lineTo(-w / 7, h / 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. 하단 톤
  ctx.fillStyle = '#95A5A6';
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 4);
  ctx.lineTo(-w / 7, h / 6);
  ctx.lineTo(w / 6, h / 2);
  ctx.lineTo(-w / 3, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 8) 공사중 안전 바리케이드 (담백한 미니멀 빗금)
function drawBarrier(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 다리
  ctx.fillStyle = '#747D8C';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;

  ctx.fillRect(-w / 2 + 2, -h / 2, 5, h);
  ctx.strokeRect(-w / 2 + 2, -h / 2, 5, h);

  ctx.fillRect(w / 2 - 7, -h / 2, 5, h);
  ctx.strokeRect(w / 2 - 7, -h / 2, 5, h);

  // 노란 보드
  ctx.fillStyle = '#FFEAA7';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 3, w, h * 0.6, 4);
  ctx.fill();
  ctx.stroke();

  // 빗금
  ctx.fillStyle = OUTLINE_COLOR;
  for (let offset = -w / 2 + 8; offset < w / 2; offset += 18) {
    ctx.beginPath();
    ctx.moveTo(offset, -h / 3);
    ctx.lineTo(offset + 8, -h / 3);
    ctx.lineTo(offset - 2, h / 3 - 4);
    ctx.lineTo(offset - 10, h / 3 - 4);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// 9) 미니멀 오렌지 드럼통
function drawOilDrum(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 1, w * 0.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 드럼통 바디
  ctx.fillStyle = '#FF7675';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;

  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 5);
  ctx.fill();
  ctx.stroke();

  // 띠선
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 6);
  ctx.lineTo(w / 2, -h / 6);
  ctx.moveTo(-w / 2, h / 6);
  ctx.lineTo(w / 2, h / 6);
  ctx.stroke();

  // 경고 포인트
  ctx.fillStyle = '#FFEAA7';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 10) 맑은 미니멀 물웅덩이
function drawPuddle(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = 'rgba(116, 185, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#74B9FF';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

// 11) 마주 오는 교통차 (담백한 퍼플 미니카)
function drawTrafficCar(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 1, -h / 2 + 5, w + 2, h, 9);
  ctx.fill();

  // 타이어
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.fillRect(-w / 2 - 3, -h / 2 + 8, 5, 11);
  ctx.fillRect(w / 2 - 2, -h / 2 + 8, 5, 11);
  ctx.fillRect(-w / 2 - 3, h / 2 - 19, 5, 11);
  ctx.fillRect(w / 2 - 2, h / 2 - 19, 5, 11);

  // 퍼플 차체
  ctx.fillStyle = '#A29BFE';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 10);
  ctx.fill();
  ctx.stroke();

  // 윈드실드
  ctx.fillStyle = '#74B9FF';
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  ctx.roundRect(-w / 2 + 4, h / 8, w - 8, 12, 3.5);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(-w / 2 + 5, -h / 3, w - 10, 7, 3);
  ctx.fill();
  ctx.stroke();

  // 헤드라이트
  ctx.fillStyle = '#FFEAA7';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-w / 3.2, h / 2 - 1, 3.5, 0, Math.PI * 2);
  ctx.arc(w / 3.2, h / 2 - 1, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 12) 길 건너는 보행자 & 동물 (치면 안 되는 캐릭터)
function drawCrosser(ctx, obs) {
  const w = obs.width;
  const h = obs.height;
  const dir = obs.vx >= 0 ? 1 : -1;
  const swing = Math.sin(obs.step) * 3;

  ctx.save();
  ctx.translate(obs.x, obs.y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 2, w / 2 - 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (obs.type === 'critter') {
    drawCritterBody(ctx, w, h, dir, swing, obs.tone);
  } else {
    drawWalkerBody(ctx, w, h, dir, swing, obs.tone);
  }

  // 머리 위 경고 아이콘 (노란 원 + !)
  ctx.fillStyle = '#FFEAA7';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -h / 2 - 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.roundRect(-1.5, -h / 2 - 14.5, 3, 5.5, 1.2);
  ctx.arc(0, -h / 2 - 7, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 보행자: 미니멀 피규어
function drawWalkerBody(ctx, w, h, dir, swing, tone) {
  const headR = 7;
  const headY = -h / 2 + headR + 1;
  const bodyTop = headY + headR - 1;
  const bodyH = h / 2 + 1;

  // 다리
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-2, bodyTop + bodyH - 3);
  ctx.lineTo(-2 - swing, h / 2 - 1);
  ctx.moveTo(3, bodyTop + bodyH - 3);
  ctx.lineTo(3 + swing, h / 2 - 1);
  ctx.stroke();

  // 신발
  ctx.fillStyle = '#0984E3';
  ctx.beginPath();
  ctx.ellipse(3 + swing + dir * 1, h / 2, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.ellipse(-2 - swing + dir * 1, h / 2, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 몸통
  ctx.fillStyle = tone || '#74B9FF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 3, bodyTop, w - 6, bodyH, 4);
  ctx.fill();
  ctx.stroke();

  // 팔
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(dir * (w / 2 - 4), bodyTop + 4);
  ctx.lineTo(dir * (w / 2 - 4) + swing * 0.7, bodyTop + 11);
  ctx.stroke();

  // 얼굴
  ctx.fillStyle = '#FFEAA7';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 머리
  ctx.fillStyle = '#6C5CE7';
  ctx.beginPath();
  ctx.arc(0, headY, headR, Math.PI * 1.05, Math.PI * 2.05);
  ctx.fill();

  // 눈
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.arc(dir * 2.5, headY + 1, 1.3, 0, Math.PI * 2);
  ctx.fill();
}

// 동물: 미니멀 노란 강아지
function drawCritterBody(ctx, w, h, dir, swing, tone) {
  const fur = tone || '#FFEAA7';
  const headX = dir * (w / 2 - 6);

  // 꼬리
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-dir * (w / 2 - 4), -1);
  ctx.lineTo(-dir * (w / 2), -7 + swing * 0.5);
  ctx.stroke();

  // 다리
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4, h / 2 - 6); ctx.lineTo(-4 - swing * 0.5, h / 2 - 1);
  ctx.moveTo(4, h / 2 - 6);  ctx.lineTo(4 + swing * 0.5, h / 2 - 1);
  ctx.stroke();

  // 몸통
  ctx.fillStyle = fur;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-dir * 2, 0, w / 2 - 3, h / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 머리
  ctx.beginPath();
  ctx.arc(headX, -2, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 귀 2개
  ctx.beginPath();
  ctx.moveTo(headX - 4, -6);
  ctx.lineTo(headX - 5, -12);
  ctx.lineTo(headX - 0.5, -7.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(headX + 4, -6);
  ctx.lineTo(headX + 5, -12);
  ctx.lineTo(headX + 0.5, -7.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 눈 코
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.arc(headX + dir * 1.5, -3, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + dir * 5, 0, 1.6, 0, Math.PI * 2);
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
    ctx.rotate(Math.sin(Date.now() / 45) * 0.12);
  }

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 1, -h / 2 + 5, w + 2, h, 10);
  ctx.fill();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;

  // 백색 바디
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 10);
  ctx.fill();
  ctx.stroke();

  // 흑색 사이드 패널
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 6, w, h / 3, 2);
  ctx.fill();

  // 윈드실드
  ctx.fillStyle = '#81ECEC';
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 5, h / 5, w - 10, 12, 3.5);
  ctx.fill();
  ctx.stroke();

  // 경광등
  const beacon = blink ? '#FF7675' : '#74B9FF';
  ctx.fillStyle = beacon;
  ctx.beginPath();
  ctx.roundRect(-10, -h / 2 - 5, 20, 8, 3.5);
  ctx.fill();
  ctx.stroke();

  // 헤드라이트
  ctx.fillStyle = '#FFEAA7';
  ctx.beginPath();
  ctx.arc(-w / 3.2, h / 2 - 2, 3.5, 0, Math.PI * 2);
  ctx.arc(w / 3.2, h / 2 - 2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// --- [먹어야 하는 아이템 6종 (담백하고 직관적인 플랫 디자인)] ---

// 1) 황금 코인
function drawCoinItem(ctx, x, y, size, risky) {
  ctx.save();
  ctx.translate(x, y);

  const radius = size / 2;

  if (risky) {
    ctx.strokeStyle = '#FF7675';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 동전 바디
  ctx.fillStyle = '#FDCB6E';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 내분 링
  ctx.strokeStyle = '#E1B12C';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// 2) 부스터
function drawBoosterItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#0984E3';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-size / 2.5, -size / 1.8, size * 0.8, size * 1.1, 7);
  ctx.fill();
  ctx.stroke();

  // 번개
  ctx.fillStyle = '#FDCB6E';
  ctx.beginPath();
  ctx.moveTo(-2, -7);
  ctx.lineTo(5, -2);
  ctx.lineTo(1, 0);
  ctx.lineTo(4, 6);
  ctx.lineTo(-4, 0);
  ctx.lineTo(1, -2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// 3) 쉴드 🛡️
function drawShieldItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#00CEC9';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;
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

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -size / 3.5);
  ctx.lineTo(0, size / 3.5);
  ctx.moveTo(-size / 4, 0);
  ctx.lineTo(size / 4, 0);
  ctx.stroke();

  ctx.restore();
}

// 4) 자석 🧲
function drawMagnetItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = '#FF7675';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(0, 2, size * 0.35, Math.PI, 0, true);
  ctx.lineTo(size * 0.35, -7);
  ctx.moveTo(-size * 0.35, 2);
  ctx.lineTo(-size * 0.35, -7);
  ctx.stroke();

  ctx.strokeStyle = '#DFE6E9';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -7);
  ctx.lineTo(-size * 0.35, -11);
  ctx.moveTo(size * 0.35, -7);
  ctx.lineTo(size * 0.35, -11);
  ctx.stroke();

  ctx.restore();
}

// 5) 하트 ❤️
function drawHeartItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  const s = size / 22;
  ctx.fillStyle = '#FF7675';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  ctx.moveTo(0, 9 * s);
  ctx.bezierCurveTo(-13 * s, -1 * s, -8 * s, -13 * s, 0, -5 * s);
  ctx.bezierCurveTo(8 * s, -13 * s, 13 * s, -1 * s, 0, 9 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 6) 모래시계 ⏳
function drawSlowItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  const s = size / 2;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;

  ctx.fillStyle = '#DFE6E9';
  ctx.beginPath();
  ctx.roundRect(-s * 0.8, -s, s * 1.6, 4, 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(-s * 0.8, s - 4, s * 1.6, 4, 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#A29BFE';
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, -s + 4);
  ctx.lineTo(s * 0.6, -s + 4);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-s * 0.6, s - 4);
  ctx.lineTo(s * 0.6, s - 4);
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
  ctx.lineWidth = 2;

  // 기둥
  ctx.fillStyle = bonus ? '#E1B12C' : '#2ECC71';
  ctx.beginPath();
  ctx.roundRect(-half, -h / 2, 8, h, 3);
  ctx.roundRect(half - 8, -h / 2, 8, h, 3);
  ctx.fill();
  ctx.stroke();

  // 현수막
  ctx.fillStyle = bonus ? '#FDCB6E' : '#58D68D';
  ctx.beginPath();
  ctx.roundRect(-half + 5, -h / 2, w - 10, h * 0.62, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = OUTLINE_COLOR;
  ctx.font = '900 15px "Jua", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bonus ? '🪙 x2 위험' : '✅ 안전', 0, -h / 2 + h * 0.31);

  ctx.restore();
}