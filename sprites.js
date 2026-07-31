// ===========================================================================
//  sprites.js — 스프라이트 드로잉 전용 파일 (선명하고 쨍한 아케이드 팝 스타일)
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
//  미술 스타일: 쨍하고 선명한 세련된 아케이드 (닌텐도/카트라이더 감성의 
//             맑고 깨끗한 팝 컬러, 앙증맞은 캐릭터, 네온 블루 쉴드 이펙트)
// ===========================================================================

const OUTLINE_COLOR = '#1E272E'; // 쨍하고 또렷한 아케이드 다크 네이비 외곽선
const OUTLINE_WIDTH = 2.5;

// 1) 맑고 쨍한 아케이드 구름
function drawCloud(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  // 구름 투명 그림자
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.ellipse(size * 0.7, size * 0.4, size * 1.1, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // 구름 바디 (깨끗한 순백)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
  ctx.arc(size * 0.6, -size * 0.28, size * 0.65, 0, Math.PI * 2);
  ctx.arc(size * 1.25, 0, size * 0.55, 0, Math.PI * 2);
  ctx.arc(size * 0.6, size * 0.22, size * 0.6, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 2) 쨍하고 선명한 파스텔 에메랄드 나무
function drawTree(ctx, x, y) {
  ctx.save();

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 13, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 통나무
  ctx.fillStyle = '#8D6E63';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.roundRect(x - 5, y - 1, 10, 21, 3);
  ctx.fill();
  ctx.stroke();

  // 나뭇잎 (쨍한 2중 비비드 잎)
  ctx.fillStyle = '#05C46B'; // 바탕 쨍한 녹색
  ctx.beginPath();
  ctx.arc(x, y - 8, 18, 0, Math.PI * 2);
  ctx.arc(x - 10, y - 16, 14, 0, Math.PI * 2);
  ctx.arc(x + 10, y - 16, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#2ED573'; // 상단 맑은 라임 그린
  ctx.beginPath();
  ctx.arc(x, y - 10, 14, 0, Math.PI * 2);
  ctx.arc(x - 8, y - 16, 11, 0, Math.PI * 2);
  ctx.arc(x + 8, y - 16, 11, 0, Math.PI * 2);
  ctx.fill();

  // 쨍한 빨간 미니 사과 3개
  ctx.fillStyle = '#FF3838';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.5;

  const apples = [
    { ax: x - 7, ay: y - 10, r: 3.5 },
    { ax: x + 7, ay: y - 6, r: 3.5 },
    { ax: x + 1, ay: y - 20, r: 4 }
  ];
  apples.forEach(ap => {
    ctx.beginPath();
    ctx.arc(ap.ax, ap.ay, ap.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

// 3) 쨍한 핫핑크 꽃
function drawFlower(ctx, x, y) {
  ctx.save();

  // 꽃대
  ctx.strokeStyle = '#2ED573';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 10);
  ctx.stroke();

  // 꽃잎 5개
  ctx.fillStyle = '#FF3838';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;

  const petalCount = 5;
  const radius = 5;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 2 * Math.PI) / petalCount;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 노란 꽃수술
  ctx.fillStyle = '#FFD32A';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 4) 쨍하고 선명한 풍차
function drawWindmill(ctx, x, y, rot) {
  ctx.save();

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(x, y + 30, 13, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 백색 풍차 탑
  ctx.fillStyle = '#F5F6FA';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(x - 13, y + 28);
  ctx.lineTo(x - 4, y - 9);
  ctx.lineTo(x + 4, y - 9);
  ctx.lineTo(x + 13, y + 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 쨍한 노란 지붕
  ctx.fillStyle = '#FFD32A';
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 9);
  ctx.lineTo(0, y - 18);
  ctx.lineTo(x + 6, y - 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 중심축
  ctx.fillStyle = '#17E9E0';
  ctx.beginPath();
  ctx.arc(x, y - 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4색 비비드 날개
  ctx.save();
  ctx.translate(x, y - 8);
  ctx.rotate(rot);

  const bladeColors = ['#FF3838', '#2ED573', '#1E90FF', '#FFD32A'];
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = bladeColors[i];
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-3, 0, 6, 26, 3);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

// 5) 플레이어 자동차 (선명하고 쨍한 아케이드 핫 휠 레이서)
function drawPlayer() {
  if (invincibleTime > 0 && Math.floor(invincibleTime / 4) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(car.x, car.y);

  // 바나나를 밟았을 때 빙글빙글 도는 회전은 game.js의 update()가 car.spin에
  // 누적/감쇠시켜 준다 (car.slipTime은 존재한 적 없는 필드라 항상 false였다).
  ctx.rotate(car.angle + (car.spin || 0));

  // 1. 그림자 효과 (부스터 시 쨍한 미니멀 글로우)
  if (boosterTime > 0) {
    ctx.fillStyle = 'rgba(23, 233, 224, 0.4)';
    ctx.shadowColor = '#17E9E0';
    ctx.shadowBlur = 14;
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
  }
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 2, -car.height / 2 + 5, car.width + 4, car.height + 2, 10);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 2. 부스터 샤프 이펙트 (간결하고 강력한 부스터 스파크 라이닝)
  if (boosterTime > 0) {
    ctx.save();
    ctx.fillStyle = '#FFD32A';
    ctx.beginPath();
    ctx.moveTo(-car.width / 3, car.height / 2 + 2);
    ctx.lineTo(0, car.height / 2 + 15 + Math.random() * 6);
    ctx.lineTo(car.width / 3, car.height / 2 + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, car.height / 2 + 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. 디테일 타이어 (4개)
  ctx.fillStyle = OUTLINE_COLOR;
  const drawWheel = (wx, wy) => {
    ctx.save();
    ctx.translate(wx, wy);

    ctx.fillRect(-2.5, -6, 5, 12);

    const rotSize = Math.sin(car.wheelRotation) * 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2.5, rotSize - 2, 5, 3);
    ctx.restore();
  };

  drawWheel(-car.width / 2 - 2, -car.height / 2 + 10);
  drawWheel(car.width / 2 + 2, -car.height / 2 + 10);
  drawWheel(-car.width / 2 - 2, car.height / 2 - 14);
  drawWheel(car.width / 2 + 2, car.height / 2 - 14);

  // 4. 메인 차체 (선명하고 쨍한 비비드 바디)
  const skin = getSelectedCar();
  ctx.fillStyle = boosterTime > 0 ? '#17E9E0' : carBodyColor();
  ctx.beginPath();
  ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 11);
  ctx.fill();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.stroke();

  // 중앙 스트라이프 레이싱 데칼
  ctx.fillStyle = boosterTime > 0 ? '#FFFFFF' : (skin.stripe || '#FFFFFF');
  ctx.fillRect(-4, -car.height / 2 + 4, 8, car.height - 8);

  // 5. 윈드실드 (쨍하고 맑은 민트 시안 블루)
  const glassGrad = ctx.createLinearGradient(0, -car.height / 4, 0, 0);
  glassGrad.addColorStop(0, '#E0F7FA');
  glassGrad.addColorStop(1, '#00D8D6');
  ctx.fillStyle = glassGrad;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 4, -car.height / 4, car.width - 8, 14, 4);
  ctx.fill();
  ctx.stroke();

  // 뒷유리창
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 5, car.height / 4, car.width - 10, 8, 3);
  ctx.fill();
  ctx.stroke();

  // 6. 쨍한 헤드라이트
  ctx.fillStyle = boosterTime > 0 ? '#FFD32A' : '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-car.width / 3, -car.height / 2 + 1, 4, 0, Math.PI * 2);
  ctx.arc(car.width / 3, -car.height / 2 + 1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 7. 리어 스포일러
  ctx.fillStyle = boosterTime > 0 ? '#FF3838' : (skin.spoiler || '#FF3838');
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 4, car.height / 2 - 4, car.width + 8, 5, 2);
  ctx.fill();
  ctx.stroke();

  // --- [액티브 시각효과: 선명한 파랑 계열 네온 쉴드 이펙트] ---
  if (activeShield) {
    ctx.save();
    const shieldScale = 1.25 + Math.sin(Date.now() / 80) * 0.04;
    // 쨍하고 영롱한 로얄 블루 / 시안 네온 링
    ctx.strokeStyle = '#00A8FF';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#00CEC9';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(0, 0, car.height * 0.65 * shieldScale, 0, Math.PI * 2);
    ctx.stroke();

    // 안쪽 파란 네온 은은한 광채
    ctx.fillStyle = 'rgba(0, 168, 255, 0.16)';
    ctx.fill();

    // 안쪽 보조 하이라이트 링
    ctx.strokeStyle = '#74B9FF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, car.height * 0.54 * shieldScale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // --- [액티브 시각효과: 자석 파장] ---
  if (magnetTime > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 56, 56, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -Date.now() / 40;

    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// 6) 참고 이미지(orca-paste) 기반의 3D 아이소메트릭 트래픽 고깔 콘
function drawCone(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 1. 바닥 입체 그림자
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 1, w * 0.62, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.lineJoin = 'round';

  // 2. 도톰한 아이소메트릭 둥근 사각 주황 밑받침 (Isometric Square Base)
  const bw = w * 0.92;
  const bh = 9;
  const baseY = h / 2 - 5;

  // 받침 두께 옆면
  ctx.fillStyle = '#E65100';
  ctx.beginPath();
  ctx.moveTo(-bw / 2, baseY);
  ctx.lineTo(0, baseY + bh / 2 + 3);
  ctx.lineTo(bw / 2, baseY);
  ctx.lineTo(bw / 2, baseY + 4);
  ctx.lineTo(0, baseY + bh / 2 + 7);
  ctx.lineTo(-bw / 2, baseY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 받침 윗면
  ctx.fillStyle = '#F57C00';
  ctx.beginPath();
  ctx.moveTo(0, baseY - bh / 2);
  ctx.lineTo(bw / 2, baseY);
  ctx.lineTo(0, baseY + bh / 2 + 3);
  ctx.lineTo(-bw / 2, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. 원뿔 바디 (위가 뚫린 오렌지 Frustum Cone)
  const topW = w * 0.28;
  const botW = w * 0.72;
  const topY = -h / 2 + 4;
  const botY = baseY - 2;

  // 메인 주황 몸통
  ctx.fillStyle = '#FF7043';
  ctx.beginPath();
  ctx.moveTo(-topW / 2, topY);
  ctx.lineTo(-botW / 2, botY);
  ctx.ellipse(0, botY, botW / 2, 3.5, 0, Math.PI, 0, true);
  ctx.lineTo(topW / 2, topY);
  ctx.ellipse(0, topY, topW / 2, 2, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 오른쪽 음영 셰이딩 (Cell Shading)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.moveTo(0, topY);
  ctx.lineTo(0, botY + 3.5);
  ctx.ellipse(0, botY, botW / 2, 3.5, 0, 0, Math.PI / 2);
  ctx.lineTo(topW / 2, topY);
  ctx.ellipse(0, topY, topW / 2, 2, 0, Math.PI / 2, 0, true);
  ctx.closePath();
  ctx.fill();

  // 4. 선명한 2개의 곡선 흰색 반사 띠 (Curved White Bands)
  const drawBand = (y1, y2, tw1, tw2) => {
    ctx.fillStyle = '#F5F6FA';
    ctx.beginPath();
    ctx.moveTo(-tw1 / 2, y1);
    ctx.lineTo(-tw2 / 2, y2);
    ctx.ellipse(0, y2, tw2 / 2, 2.5, 0, Math.PI, 0, true);
    ctx.lineTo(tw1 / 2, y1);
    ctx.ellipse(0, y1, tw1 / 2, 2, 0, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 띠 오른쪽 음영
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.lineTo(0, y2 + 2.5);
    ctx.ellipse(0, y2, tw2 / 2, 2.5, 0, 0, Math.PI / 2);
    ctx.lineTo(tw1 / 2, y1);
    ctx.ellipse(0, y1, tw1 / 2, 2, 0, Math.PI / 2, 0, true);
    ctx.closePath();
    ctx.fill();
  };

  const hStep = (botY - topY) / 4;
  drawBand(topY + hStep * 0.6, topY + hStep * 1.6, topW + (botW - topW) * 0.15, topW + (botW - topW) * 0.4);
  drawBand(topY + hStep * 2.2, topY + hStep * 3.2, topW + (botW - topW) * 0.55, topW + (botW - topW) * 0.8);

  // 5. 상단 뚫린 구멍 (Hollow Top Opening)
  ctx.fillStyle = '#D84315';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.ellipse(0, topY, topW / 2, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 구멍 안쪽
  ctx.fillStyle = '#3E2723';
  ctx.beginPath();
  ctx.ellipse(0, topY + 0.5, topW / 3, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 7) 3D 입체 다각형 회색 바위
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

// 8) 쨍한 바나나 옐로우 바리케이드
function drawBarrier(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 다리
  ctx.fillStyle = '#718093';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;

  ctx.fillRect(-w / 2 + 2, -h / 2, 6, h);
  ctx.strokeRect(-w / 2 + 2, -h / 2, 6, h);

  ctx.fillRect(w / 2 - 8, -h / 2, 6, h);
  ctx.strokeRect(w / 2 - 8, -h / 2, 6, h);

  // 노란 보드
  ctx.fillStyle = '#FFD32A';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 3, w, h * 0.6, 4);
  ctx.fill();
  ctx.stroke();

  // 검은 빗금
  ctx.fillStyle = OUTLINE_COLOR;
  for (let offset = -w / 2 + 8; offset < w / 2; offset += 20) {
    ctx.beginPath();
    ctx.moveTo(offset, -h / 3);
    ctx.lineTo(offset + 8, -h / 3);
    ctx.lineTo(offset - 4, h / 3 - 4);
    ctx.lineTo(offset - 12, h / 3 - 4);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// 9) 참고 이미지(orca-paste) 기반의 3D 스틸 차콜 메탈 드럼통 (자연스러운 융기 링)
function drawOilDrum(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 바닥 그림자
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 1, w * 0.52, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const rx = w / 2;
  const ry = 4; // 타원 곡률

  // 1. 하단 입체 림 (Bottom Rim)
  ctx.fillStyle = '#2B2E34';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.ellipse(0, h / 2 - ry, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. 메인 드럼통 스틸 수직 바디 (수직 메탈 광택 그라데이션)
  const bodyGrad = ctx.createLinearGradient(-rx, 0, rx, 0);
  bodyGrad.addColorStop(0, '#22252A');
  bodyGrad.addColorStop(0.25, '#3A3F47');
  bodyGrad.addColorStop(0.62, '#718093'); // 선명한 은빛 금속 반사 하이라이트
  bodyGrad.addColorStop(0.85, '#3A3F47');
  bodyGrad.addColorStop(1, '#1C1E22');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-rx, -h / 2 + ry);
  ctx.lineTo(-rx, h / 2 - ry);
  ctx.ellipse(0, h / 2 - ry, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(rx, -h / 2 + ry);
  ctx.ellipse(0, -h / 2 + ry, rx, ry, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. 어색함 없는 자연스러운 전면 볼록 입체 융기 링 (Rib Rings / Ridges)
  const drawRibRing = (ryPos) => {
    ctx.save();

    // 링 베이스 호
    ctx.strokeStyle = '#2B2E34';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, ryPos, rx + 0.5, ry, 0, 0, Math.PI);
    ctx.stroke();

    // 링 상단 밝은 하이라이트 라인
    ctx.strokeStyle = '#8895A7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, ryPos - 0.8, rx + 0.3, ry, 0, 0, Math.PI);
    ctx.stroke();

    // 링 하단 그림자 라인
    ctx.strokeStyle = '#1C1E22';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, ryPos + 1, rx + 0.3, ry, 0, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  };

  drawRibRing(-h / 6); // 상단 리브 링
  drawRibRing(h / 6);  // 하단 리브 링

  // 4. 상단 뚜껑 테두리 & 패인 뚜껑 (Top Rim & Lid)
  ctx.fillStyle = '#2B2E34';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.ellipse(0, -h / 2 + ry, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 뚜껑 안쪽 오목 패널
  ctx.fillStyle = '#3A3F47';
  ctx.beginPath();
  ctx.ellipse(0, -h / 2 + ry, rx - 2.5, ry - 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5. 우측 상단 은색 금속 주유 마개 캡 (Silver Cap / Bung)
  const capX = rx * 0.55;
  const capY = -h / 2 + ry - 0.5;

  ctx.fillStyle = '#F5F6FA';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(capX, capY - 1.5, 3.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 10) 길바닥에 부드럽고 도톰하게 누워있는 3D 미끄러운 바나나 껍질 (표창 느낌 완전 제거!)
// 여러 겹 껍질 자락으로 그렸던 이전 버전이 작은 크기에서 뭉개져 알아보기 어렵다는
// 피드백으로, 누운 초승달 모양 통바나나 한 덩어리로 단순화했다. 실루엣 하나 + 양끝
// 꼭지 + 광택 줄기만으로 고속 스크롤 중에도 즉시 "바나나"로 읽히는 걸 목표로 했다.
function drawPuddle(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 바닥 그림자
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.36, w * 0.44, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.lineJoin = 'round';

  // 몸통: 위쪽은 크게 휘고 아래쪽은 완만한 초승달. 두 곡선만으로 깔끔하게.
  ctx.fillStyle = '#FFD000';
  ctx.beginPath();
  ctx.moveTo(-w * 0.47, h * 0.14);
  ctx.quadraticCurveTo(0, -h * 0.62, w * 0.47, h * 0.06);
  ctx.quadraticCurveTo(w * 0.2, h * 0.32, -w * 0.1, h * 0.28);
  ctx.quadraticCurveTo(-w * 0.32, h * 0.26, -w * 0.47, h * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 광택 하이라이트 (윗변을 따라가는 옅은 줄기)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-w * 0.32, h * 0.04);
  ctx.quadraticCurveTo(0, -h * 0.4, w * 0.3, -h * 0.02);
  ctx.stroke();

  // 양쪽 꼭지
  ctx.fillStyle = '#5E2605';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.ellipse(-w * 0.46, h * 0.13, 3.6, 2.6, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(w * 0.46, h * 0.05, 3.6, 2.6, -Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 11) 마주 오는 교통차 (쨍한 퍼플 아케이드 미니 세단)
function drawTrafficCar(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, -h / 2 + 5, w + 4, h, 10);
  ctx.fill();

  // 바퀴
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.fillRect(-w / 2 - 3, -h / 2 + 9, 5, 12);
  ctx.fillRect(w / 2 - 2, -h / 2 + 9, 5, 12);
  ctx.fillRect(-w / 2 - 3, h / 2 - 21, 5, 12);
  ctx.fillRect(w / 2 - 2, h / 2 - 21, 5, 12);

  // 쨍한 비비드 퍼플 바디
  ctx.fillStyle = '#8854D0';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 11);
  ctx.fill();
  ctx.stroke();

  // 유리창
  const glass = ctx.createLinearGradient(0, 0, 0, h / 4);
  glass.addColorStop(0, '#E0F7FA');
  glass.addColorStop(1, '#00D8D6');
  ctx.fillStyle = glass;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect(-w / 2 + 4, h / 8, w - 8, 13, 4);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(-w / 2 + 5, -h / 3, w - 10, 8, 3);
  ctx.fill();
  ctx.stroke();

  // 마주보는 헤드라이트
  ctx.fillStyle = '#FFD32A';
  ctx.beginPath();
  ctx.arc(-w / 3, h / 2 - 1, 4, 0, Math.PI * 2);
  ctx.arc(w / 3, h / 2 - 1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 12) 길 건너는 보행자 & 동물 (귀엽고 앙증맞게 개선됨)
function drawCrosser(ctx, obs) {
  const w = obs.width;
  const h = obs.height;
  const dir = obs.vx >= 0 ? 1 : -1;
  const swing = Math.sin(obs.step) * 3.2;

  ctx.save();
  ctx.translate(obs.x, obs.y);

  // 그림자
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

  // 머리 위 쨍한 옐로우 경고 방울
  ctx.fillStyle = '#FFD32A';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -h / 2 - 11, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FF3838';
  ctx.beginPath();
  ctx.roundRect(-1.5, -h / 2 - 16, 3, 6, 1.5);
  ctx.arc(0, -h / 2 - 7.5, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 앙증맞고 귀여운 레고 팝 피규어 보행자
function drawWalkerBody(ctx, w, h, dir, swing, tone) {
  const headR = 8;
  const headY = -h / 2 + headR;
  const bodyTop = headY + headR - 1;
  const bodyH = h / 2;

  // 뒤쪽/앞쪽 다리 & 귀여운 운동화
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-2, bodyTop + bodyH - 3);
  ctx.lineTo(-2 - swing, h / 2 - 1);
  ctx.moveTo(3, bodyTop + bodyH - 3);
  ctx.lineTo(3 + swing, h / 2 - 1);
  ctx.stroke();

  // 앙증맞은 미니 스니커즈
  ctx.fillStyle = '#FF3838';
  ctx.beginPath();
  ctx.ellipse(3 + swing + dir * 1.2, h / 2, 2.8, 1.8, 0, 0, Math.PI * 2);
  ctx.ellipse(-2 - swing + dir * 1.2, h / 2, 2.8, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 몸통 (파스텔 셔츠)
  ctx.fillStyle = tone || '#54A0FF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 3, bodyTop, w - 6, bodyH, 5);
  ctx.fill();
  ctx.stroke();

  // 팔
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(dir * (w / 2 - 4), bodyTop + 4);
  ctx.lineTo(dir * (w / 2 - 4) + swing * 0.8, bodyTop + 12);
  ctx.stroke();

  // 뽀얀 둥근 얼굴
  ctx.fillStyle = '#FFE0BD';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 앙증맞은 볼터치 (핑크 뺨)
  ctx.fillStyle = 'rgba(255, 118, 117, 0.6)';
  ctx.beginPath();
  ctx.arc(dir * 3.5, headY + 3.5, 2, 0, Math.PI * 2);
  ctx.fill();

  // 깔끔한 머리카락 (모자/헤어)
  ctx.fillStyle = '#57606F';
  ctx.beginPath();
  ctx.arc(0, headY, headR, Math.PI * 1.1, Math.PI * 1.95);
  ctx.fill();

  // 또렷하고 앙증맞은 눈
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.arc(dir * 2.8, headY + 1.2, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

// 앙증맞고 통통한 아기 강아지/고양이
function drawCritterBody(ctx, w, h, dir, swing, tone) {
  const fur = tone || '#FFD32A';
  const headX = dir * (w / 2 - 5);

  // 살랑거리는 꼬리
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-dir * (w / 2 - 5), -1);
  ctx.quadraticCurveTo(
    -dir * (w / 2 + 2), -5 + swing * 0.6,
    -dir * (w / 2 - 1), -10 + swing * 0.6
  );
  ctx.stroke();

  // 짧고 앙증맞은 다리
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-4, h / 2 - 6); ctx.lineTo(-4 - swing * 0.5, h / 2 - 1);
  ctx.moveTo(4, h / 2 - 6);  ctx.lineTo(4 + swing * 0.5, h / 2 - 1);
  ctx.stroke();

  // 통통 털 몸통
  ctx.fillStyle = fur;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-dir * 2, 0, w / 2 - 3, h / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 둥근 머리
  ctx.beginPath();
  ctx.arc(headX, -2, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 쫑긋 귀 2개 (귀 안쪽 핑크 포인트!)
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.arc(headX - 4.5, -9, 3.5, 0, Math.PI * 2);
  ctx.arc(headX + 4.5, -9, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.arc(headX - 4.5, -9, 2, 0, Math.PI * 2);
  ctx.arc(headX + 4.5, -9, 2, 0, Math.PI * 2);
  ctx.fill();

  // 앙증맞은 눈 코
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.arc(headX + dir * 2, -3.5, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + dir * 5.8, -0.5, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

// 13) 경찰 추격차 (Chaser)
function drawChaser(ctx, c) {
  const w = c.kind.w;
  const h = c.kind.h;
  const blink = Math.floor(Date.now() / 130) % 2 === 0;

  ctx.save();
  ctx.translate(c.x, c.y);

  if (c.stun > 0) ctx.rotate(Math.sin(Date.now() / 45) * 0.13);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, -h / 2 + 6, w + 4, h, 11);
  ctx.fill();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;

  // 흑백 투톤 패트롤카
  ctx.fillStyle = '#F5F6FA';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 11);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 6, w, h / 3, 3);
  ctx.fill();

  // 윈드실드
  ctx.fillStyle = '#00D8D6';
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 5, h / 5, w - 10, 13, 4);
  ctx.fill();
  ctx.stroke();

  // 경광등 (쨍한 네온 레드 & 블루)
  const beacon = blink ? '#FF3838' : '#1E90FF';
  ctx.fillStyle = beacon;
  ctx.beginPath();
  ctx.roundRect(-11, -h / 2 - 6, 22, 9, 4);
  ctx.fill();
  ctx.stroke();

  // 샤프한 경광등 빛무리
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = beacon;
  ctx.beginPath();
  ctx.arc(blink ? -8 : 8, -h / 2 - 2, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // 헤드라이트
  ctx.fillStyle = '#FFD32A';
  ctx.beginPath();
  ctx.arc(-w / 3.2, h / 2 - 2, 4, 0, Math.PI * 2);
  ctx.arc(w / 3.2, h / 2 - 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// --- [먹어야 하는 아이템 6종 (쨍하고 명확한 아케이드 팝 스타일)] ---

// 1) 황금 코인 (Coin)
function drawCoinItem(ctx, x, y, size, risky) {
  ctx.save();
  ctx.translate(x, y);

  const pulse = Math.sin(Date.now() / 120) * 1.5;
  const radius = size / 2 + pulse;

  if (risky) {
    ctx.strokeStyle = '#FF3838';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([3, 3]);
    ctx.lineDashOffset = -Date.now() / 60;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 쨍한 테두리
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
  ctx.fill();

  // 쨍한 퓨어 황금 골드
  ctx.fillStyle = '#FFD32A';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // 음각 링
  ctx.strokeStyle = '#FF9F1A';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// 2) 번개 아우라 효과가 가미된 쨍한 빨간색 캔 부스터 ⚡
function drawBoosterItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  const bounce = Math.sin(Date.now() / 100) * 3;
  ctx.translate(0, bounce);

  // 1. 번개 모양 네온 아우라 광채 & 스파크 (Lightning Energy Aura)
  const auraPulse = 0.85 + Math.sin(Date.now() / 90) * 0.25;
  ctx.shadowColor = '#FFD32A';
  ctx.shadowBlur = 15 * auraPulse;

  // 아우라 배경 펄스 링
  ctx.fillStyle = 'rgba(255, 211, 42, 0.22)';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.75 * auraPulse, 0, Math.PI * 2);
  ctx.fill();

  // 사방으로 튀는 앙증맞은 미니 번개 스파크 4개 (Aura Lightning Rays)
  ctx.strokeStyle = '#FFD32A';
  ctx.lineWidth = 1.8;
  const sparkRot = (Date.now() / 180) % (Math.PI * 2);
  for (let i = 0; i < 4; i++) {
    const angle = sparkRot + (i * Math.PI / 2);
    const r1 = size * 0.52;
    const r2 = size * 0.78;
    const sx = Math.cos(angle) * r1;
    const sy = Math.sin(angle) * r1;
    const ex = Math.cos(angle + 0.2) * r2;
    const ey = Math.sin(angle + 0.2) * r2;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo((sx + ex) / 2 + (i % 2 === 0 ? 3 : -3), (sy + ey) / 2);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // 2. 쨍한 붉은색 에너지 캔 바디 (Can Body)
  ctx.fillStyle = '#FF3838';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-size / 2.4, -size / 1.8, size * 0.83, size * 1.1, 7);
  ctx.fill();
  ctx.stroke();

  // 캔 상단 실버 림 (Can Lid Rim)
  ctx.fillStyle = '#F5F6FA';
  ctx.beginPath();
  ctx.roundRect(-size / 2.4 + 1.5, -size / 1.8 - 2, size * 0.83 - 3, 4, 2);
  ctx.fill();
  ctx.stroke();

  // 캔 좌측 광택 하이라이트
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.roundRect(-size / 2.4 + 3, -size / 1.8 + 3, 3.5, size * 1.1 - 6, 2);
  ctx.fill();

  // 3. 선명한 황금 ⚡ 번개 마크 (Golden Lightning Icon)
  ctx.fillStyle = '#FFD32A';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-2, -9);
  ctx.lineTo(7, -2);
  ctx.lineTo(1, 0);
  ctx.lineTo(6, 8);
  ctx.lineTo(-5, 1);
  ctx.lineTo(1, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 3) 파랑 계열 보호막 쉴드 🛡️ (블루/시안 팝 톤)
function drawShieldItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  const bounce = Math.sin(Date.now() / 110) * 3.5;
  ctx.translate(0, bounce);

  // 쨍하고 영롱한 로얄 아쿠아 블루
  ctx.fillStyle = '#00A8FF';
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

  // 십자 반짝이 하이라이트
  ctx.strokeStyle = '#E0F7FA';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -size / 3);
  ctx.lineTo(0, size / 3);
  ctx.moveTo(-size / 4, 0);
  ctx.lineTo(size / 4, 0);
  ctx.stroke();

  ctx.restore();
}

// 4) 자석 🧲
function drawMagnetItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  const bounce = Math.sin(Date.now() / 95) * 3;
  ctx.translate(0, bounce);

  ctx.strokeStyle = '#FF3838';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(0, 2, size * 0.35, Math.PI, 0, true);
  ctx.lineTo(size * 0.35, -7);
  ctx.moveTo(-size * 0.35, 2);
  ctx.lineTo(-size * 0.35, -7);
  ctx.stroke();

  // 쇠받이
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 7;
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
  ctx.translate(x, y + Math.sin(Date.now() / 110) * 3);

  const s = size / 22;
  ctx.fillStyle = '#FF4D4D';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(0, 9 * s);
  ctx.bezierCurveTo(-13 * s, -1 * s, -8 * s, -13 * s, 0, -5 * s);
  ctx.bezierCurveTo(8 * s, -13 * s, 13 * s, -1 * s, 0, 9 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 하이라이트
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-4 * s, -3 * s, 2.6 * s, 3.4 * s, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 6) 모래시계 ⏳
function drawSlowItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + Math.sin(Date.now() / 105) * 3);

  const s = size / 2;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(-s * 0.78, -s, s * 1.56, 4.5, 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(-s * 0.78, s - 4.5, s * 1.56, 4.5, 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#7579E7';
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

// 14) 선택 게이트 (Gate)
function drawGate(ctx, x, y, w, h, bonus) {
  ctx.save();
  ctx.translate(x, y);

  const half = w / 2;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3;

  // 기둥
  ctx.fillStyle = bonus ? '#FF9F1A' : '#05C46B';
  ctx.beginPath();
  ctx.roundRect(-half, -h / 2, 9, h, 3);
  ctx.roundRect(half - 9, -h / 2, 9, h, 3);
  ctx.fill();
  ctx.stroke();

  // 현수막
  ctx.fillStyle = bonus ? '#FFD700' : '#2ED573';
  ctx.beginPath();
  ctx.roundRect(-half + 6, -h / 2, w - 12, h * 0.62, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = OUTLINE_COLOR;
  ctx.font = '900 15px "Jua", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bonus ? '🪙 x2 위험' : '✅ 안전', 0, -h / 2 + h * 0.31);

  ctx.restore();
}