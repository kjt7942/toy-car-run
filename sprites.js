// ===========================================================================
//  sprites.js — 스프라이트 드로잉 전용 파일 (화사한 비비드 팝 토이 스타일)
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
//  미술 스타일: 맑고 쨍하며 화사한 비비드 팝 토이 (밝고 채도 높은 팝 컬러, 
//             산뜻한 파스텔 톤, 귀여운 하이라이트)
// ===========================================================================

const OUTLINE_COLOR = '#2C3E50'; // 또렷하지만 무겁지 않은 산뜻한 다크 네이비 외곽선
const OUTLINE_WIDTH = 2.5;

// 1) 푹신하고 화사한 장난감 구름 그리기
function drawCloud(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  // 구름 밑 맑고 투명한 그림자
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(size * 0.7, size * 0.4, size * 1.1, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 구름 몽실몽실 순백 바디
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
  ctx.arc(size * 0.6, -size * 0.25, size * 0.65, 0, Math.PI * 2);
  ctx.arc(size * 1.2, 0, size * 0.55, 0, Math.PI * 2);
  ctx.arc(size * 0.6, size * 0.2, size * 0.6, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 상단 볼륨 하이라이트
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(size * 0.55, -size * 0.35, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 2) 화사한 캔디 그린 장난감 나무 그리기
function drawTree(ctx, x, y) {
  ctx.save();

  // 나무 접지 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(x, y + 20, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 통나무 기둥 (따뜻한 밝은 밀크 브라운)
  ctx.fillStyle = '#A0522D';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 2, 12, 22, 4);
  ctx.fill();
  ctx.stroke();

  // 풍성하고 쨍한 파스텔 나뭇잎
  ctx.fillStyle = '#10AC84'; // 바탕 녹색
  ctx.beginPath();
  ctx.arc(x, y - 8, 19, 0, Math.PI * 2);
  ctx.arc(x - 11, y - 16, 15, 0, Math.PI * 2);
  ctx.arc(x + 11, y - 16, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1DD1A1'; // 쨍하고 산뜻한 비비드 에메랄드
  ctx.beginPath();
  ctx.arc(x, y - 10, 16, 0, Math.PI * 2);
  ctx.arc(x - 9, y - 17, 13, 0, Math.PI * 2);
  ctx.arc(x + 9, y - 17, 13, 0, Math.PI * 2);
  ctx.fill();

  // 상단 하이라이트 잎
  ctx.fillStyle = '#55E6C1';
  ctx.beginPath();
  ctx.arc(x - 2, y - 17, 10, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 20, 8, 0, Math.PI * 2);
  ctx.fill();

  // 쨍한 빨간 사과 포인트
  ctx.fillStyle = '#FF6B6B';
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
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ap.ax - 1, ap.ay - 1, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF6B6B';
  });

  ctx.restore();
}

// 3) 알록달록 캔디 꽃 그리기
function drawFlower(ctx, x, y) {
  ctx.save();

  // 줄기
  ctx.strokeStyle = '#1DD1A1';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 12);
  ctx.stroke();

  // 꽃잎 5개 (화사한 핫핑크)
  ctx.fillStyle = '#FF6B6B';
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

  // 센터 노란 꽃수술
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

// 4) 알록달록 비비드 풍차 그리기
function drawWindmill(ctx, x, y, rot) {
  ctx.save();

  // 지지대 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(x, y + 32, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 맑고 화사한 풍차 탑
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 30);
  ctx.lineTo(x - 5, y - 10);
  ctx.lineTo(x + 5, y - 10);
  ctx.lineTo(x + 14, y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 지붕 (쨍한 레몬)
  ctx.fillStyle = '#FECA57';
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 10);
  ctx.lineTo(0, y - 20);
  ctx.lineTo(x + 7, y - 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 중심축
  ctx.fillStyle = '#54A0FF';
  ctx.beginPath();
  ctx.arc(x, y - 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 회전하는 4색 비비드 날개
  ctx.save();
  ctx.translate(x, y - 8);
  ctx.rotate(rot);

  const bladeColors = ['#FF6B6B', '#1DD1A1', '#54A0FF', '#FECA57'];
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = bladeColors[i];
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, 28, 3.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2, 8, 4, 12);
  }
  ctx.restore();

  ctx.restore();
}

// 5) 플레이어 자동차 그리기 (밝고 쨍한 비비드 토이 레이서)
function drawPlayer() {
  if (invincibleTime > 0 && Math.floor(invincibleTime / 4) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  // 1. 차량 투명 그림자
  if (boosterTime > 0) {
    ctx.shadowColor = '#48DBFB';
    ctx.shadowBlur = 16;
    ctx.fillStyle = 'rgba(72, 219, 251, 0.5)';
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  }
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 2, -car.height / 2 + 6, car.width + 4, car.height + 2, 11);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 2. 부스터 모드 화려한 무지개 불꽃 파티클
  if (boosterTime > 0) {
    ctx.save();
    const flameH = 16 + Math.random() * 10;
    const flameGrad = ctx.createLinearGradient(0, car.height / 2, 0, car.height / 2 + flameH);
    flameGrad.addColorStop(0, '#48DBFB');
    flameGrad.addColorStop(0.5, '#FF6B6B');
    flameGrad.addColorStop(1, 'rgba(254, 202, 87, 0)');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-car.width / 4, car.height / 2);
    ctx.lineTo(0, car.height / 2 + flameH);
    ctx.lineTo(car.width / 4, car.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 3. 앙증맞은 장난감 타이어
  const drawToyWheel = (wx, wy) => {
    ctx.save();
    ctx.translate(wx, wy);

    ctx.fillStyle = OUTLINE_COLOR;
    ctx.beginPath();
    ctx.roundRect(-3, -7, 6, 14, 3);
    ctx.fill();

    const rot = Math.sin(car.wheelRotation) * 3;
    ctx.fillStyle = boosterTime > 0 ? '#FECA57' : '#FFFFFF';
    ctx.fillRect(-2, rot - 2, 4, 4);

    ctx.restore();
  };

  drawToyWheel(-car.width / 2 - 2, -car.height / 2 + 11);
  drawToyWheel(car.width / 2 + 2, -car.height / 2 + 11);
  drawToyWheel(-car.width / 2 - 2, car.height / 2 - 13);
  drawToyWheel(car.width / 2 + 2, car.height / 2 - 13);

  // 4. 메인 차체 (맑고 쨍한 파스텔 & 팝 컬러)
  const skin = getSelectedCar();
  const mainColor = boosterTime > 0 ? '#48DBFB' : carBodyColor();

  ctx.fillStyle = mainColor;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 12);
  ctx.fill();
  ctx.stroke();

  // 상단 반짝임 하이라이트 (투명 맑은 백색)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 3, -car.height / 2 + 3, car.width / 3, car.height - 6, 6);
  ctx.fill();

  // 중앙 흰 레이싱 데칼 스트라이프
  ctx.fillStyle = boosterTime > 0 ? '#FFFFFF' : (skin.stripe || '#FFFFFF');
  ctx.fillRect(-4, -car.height / 2 + 4, 8, car.height - 8);

  // 5. 맑은 하늘색 윈드실드 유리창
  ctx.fillStyle = '#C8D6E5';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;

  // 전면 유리
  ctx.fillStyle = '#48DBFB';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 4, -car.height / 4, car.width - 8, 14, 5);
  ctx.fill();
  ctx.stroke();

  // 유리창 반사광
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-car.width / 2 + 7, -car.height / 4 + 3);
  ctx.lineTo(-car.width / 2 + 12, -car.height / 4 + 3);
  ctx.lineTo(-car.width / 2 + 7, -car.height / 4 + 11);
  ctx.closePath();
  ctx.fill();

  // 후면 유리창
  ctx.fillStyle = '#48DBFB';
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 + 5, car.height / 4 - 2, car.width - 10, 8, 3.5);
  ctx.fill();
  ctx.stroke();

  // 6. 반짝이는 백색/황금 헤드라이트
  ctx.fillStyle = boosterTime > 0 ? '#FECA57' : '#FFFFFF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-car.width / 3, -car.height / 2 + 2, 4.5, 0, Math.PI * 2);
  ctx.arc(car.width / 3, -car.height / 2 + 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 7. 쨍한 리어 스포일러
  ctx.fillStyle = boosterTime > 0 ? '#FF6B6B' : (skin.spoiler || '#FF4757');
  ctx.beginPath();
  ctx.roundRect(-car.width / 2 - 3, car.height / 2 - 4, car.width + 6, 6, 3);
  ctx.fill();
  ctx.stroke();

  // --- [액티브 시각효과: 에메랄드 쉴드] ---
  if (activeShield) {
    ctx.save();
    const pulseScale = 1.25 + Math.sin(Date.now() / 90) * 0.04;
    ctx.strokeStyle = '#1DD1A1';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#55E6C1';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.arc(0, 0, car.height * 0.62 * pulseScale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(85, 230, 193, 0.2)';
    ctx.fill();
    ctx.restore();
  }

  // --- [액티브 시각효과: 자석 파장] ---
  if (magnetTime > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.8)';
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

// 6) 쨍한 오렌지 트래픽 고깔 콘 (위험 경고)
function drawCone(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 1, w * 0.65, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 고무 받침
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, h / 2 - 5, w + 4, 6, 2);
  ctx.fill();

  // 쨍한 당근 오렌지 삼각 콘
  ctx.fillStyle = '#FF9F43';
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(-w / 2.3, h / 2 - 6);
  ctx.lineTo(w / 2.3, h / 2 - 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.stroke();

  // 선명한 순백 띠 2개
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

// 7) 맑고 아기자기한 연회색 다각형 장난감 바위 (더 이상 어둡지 않음!)
function drawRock(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.35, w * 0.58, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.lineJoin = 'round';

  // 1. 좌측 부드러운 회색면
  ctx.fillStyle = '#CAD3C8';
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 4);
  ctx.lineTo(-w / 3, -h / 3);
  ctx.lineTo(0, -h / 2);
  ctx.lineTo(-w / 7, h / 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. 우측 중앙 맑은 베이지 회색면
  ctx.fillStyle = '#DFE4EA';
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2.3, -h / 4);
  ctx.lineTo(w / 2, h / 3);
  ctx.lineTo(w / 6, h / 2);
  ctx.lineTo(-w / 7, h / 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. 상단 순백 하이라이트 면
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-w / 3, -h / 3);
  ctx.lineTo(0, -h / 2);
  ctx.lineTo(w / 2.3, -h / 4);
  ctx.lineTo(0, -h / 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. 하단 받침 면
  ctx.fillStyle = '#B2BEC3';
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

// 8) 쨍한 바나나 옐로우 공사중 바리케이드
function drawBarrier(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 다리
  ctx.fillStyle = '#54A0FF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;

  ctx.fillRect(-w / 2 + 2, -h / 2, 6, h);
  ctx.strokeRect(-w / 2 + 2, -h / 2, 6, h);

  ctx.fillRect(w / 2 - 8, -h / 2, 6, h);
  ctx.strokeRect(w / 2 - 8, -h / 2, 6, h);

  // 쨍한 레몬 옐로우 보드
  ctx.fillStyle = '#FECA57';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 3, w, h * 0.62, 5);
  ctx.fill();
  ctx.stroke();

  // 빗금
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

  // 상단 쨍한 붉은 램프
  const drawLamp = (lx) => {
    ctx.fillStyle = '#FF6B6B';
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 1.5;
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

// 9) 쨍한 비비드 캔디 오렌지 오일 드럼통
function drawOilDrum(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 1, w * 0.55, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 쨍한 코랄 레드 드럼통
  ctx.fillStyle = '#FF6B6B';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;

  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 6);
  ctx.fill();
  ctx.stroke();

  // 상단 하이라이트 띠
  ctx.fillStyle = '#FF8E8E';
  ctx.fillRect(-w / 2 + 2, -h / 2 + 3, w / 3, h - 6);

  // 리벳 띠선
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 6);
  ctx.lineTo(w / 2, -h / 6);
  ctx.moveTo(-w / 2, h / 6);
  ctx.lineTo(w / 2, h / 6);
  ctx.stroke();

  // 경고 오일 방울 마크
  ctx.fillStyle = '#FECA57';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 10) 맑은 아쿠아 스카이 물웅덩이 (미끄러짐 함정)
function drawPuddle(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 반투명 맑은 스카이블루
  ctx.fillStyle = 'rgba(72, 219, 251, 0.65)';
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#48DBFB';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 찰랑이는 순백 물결 하이라이트
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-w * 0.14, -h * 0.14, w * 0.24, h * 0.18, 0, Math.PI * 0.8, Math.PI * 1.9);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(w * 0.18, h * 0.12, w * 0.15, h * 0.12, 0, Math.PI * 0.8, Math.PI * 1.9);
  ctx.stroke();

  ctx.restore();
}

// 11) 마주 오는 교통차 (쨍한 비비드 퍼플 팝 토이 세단)
function drawTrafficCar(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, -h / 2 + 6, w + 4, h, 10);
  ctx.fill();

  // 검은 타이어
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.fillRect(-w / 2 - 3, -h / 2 + 9, 5, 12);
  ctx.fillRect(w / 2 - 2, -h / 2 + 9, 5, 12);
  ctx.fillRect(-w / 2 - 3, h / 2 - 21, 5, 12);
  ctx.fillRect(w / 2 - 2, h / 2 - 21, 5, 12);

  // 쨍한 퍼플 바디
  ctx.fillStyle = '#9C88FF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 11);
  ctx.fill();
  ctx.stroke();

  // 하이라이트
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w / 4, h - 6);

  // 맑은 하늘색 윈드실드
  ctx.fillStyle = '#48DBFB';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect(-w / 2 + 4, h / 8, w - 8, 13, 4);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(-w / 2 + 5, -h / 3, w - 10, 8, 3.5);
  ctx.fill();
  ctx.stroke();

  // 마주보는 쨍한 노란 헤드라이트
  ctx.fillStyle = '#FECA57';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-w / 3.2, h / 2 - 1, 4, 0, Math.PI * 2);
  ctx.arc(w / 3.2, h / 2 - 1, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// 12) 길 건너는 보행자 & 동물 (아기자기하고 화사함)
function drawCrosser(ctx, obs) {
  const w = obs.width;
  const h = obs.height;
  const dir = obs.vx >= 0 ? 1 : -1;
  const swing = Math.sin(obs.step) * 3.2;

  ctx.save();
  ctx.translate(obs.x, obs.y);

  // 접지 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
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
  ctx.fillStyle = '#FECA57';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -h / 2 - 11, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FF6B6B';
  ctx.beginPath();
  ctx.roundRect(-1.5, -h / 2 - 16, 3, 6, 1.5);
  ctx.arc(0, -h / 2 - 7.5, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 보행자: 파스텔 레고 인형
function drawWalkerBody(ctx, w, h, dir, swing, tone) {
  const headR = 7.5;
  const headY = -h / 2 + headR + 1;
  const bodyTop = headY + headR - 1;
  const bodyH = h / 2 + 1;

  // 뒤쪽 다리
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-2, bodyTop + bodyH - 3);
  ctx.lineTo(-2 - swing, h / 2 - 1);
  ctx.stroke();

  // 쨍한 파스텔 셔츠
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

  // 앞쪽 다리
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(3, bodyTop + bodyH - 3);
  ctx.lineTo(3 + swing, h / 2 - 1);
  ctx.stroke();

  ctx.fillStyle = '#54A0FF';
  ctx.beginPath();
  ctx.ellipse(3 + swing + dir * 1.2, h / 2, 2.8, 1.8, 0, 0, Math.PI * 2);
  ctx.ellipse(-2 - swing + dir * 1.2, h / 2, 2.8, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 뽀얀 얼굴
  ctx.fillStyle = '#FFEAA7';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 갈색 머리
  ctx.fillStyle = '#8395A7';
  ctx.beginPath();
  ctx.arc(0, headY, headR, Math.PI * 1.05, Math.PI * 2.05);
  ctx.fill();

  // 눈
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.arc(dir * 2.6, headY + 1.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

// 동물: 앙증맞은 노란 아기 곰/강아지
function drawCritterBody(ctx, w, h, dir, swing, tone) {
  const fur = tone || '#FECA57';
  const headX = dir * (w / 2 - 6);

  // 꼬리
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-dir * (w / 2 - 5), -1);
  ctx.quadraticCurveTo(
    -dir * (w / 2 + 1), -4 + swing * 0.6,
    -dir * (w / 2 - 1), -10 + swing * 0.6
  );
  ctx.stroke();

  // 다리
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-4, h / 2 - 7); ctx.lineTo(-4 - swing * 0.5, h / 2 - 1);
  ctx.moveTo(4, h / 2 - 7);  ctx.lineTo(4 + swing * 0.5, h / 2 - 1);
  ctx.stroke();

  // 통통 털 몸통
  ctx.fillStyle = fur;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-dir * 2, 0, w / 2 - 3, h / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 머리
  ctx.beginPath();
  ctx.arc(headX, -2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 귀 2개
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

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 2, -h / 2 + 6, w + 4, h, 11);
  ctx.fill();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;

  // 맑은 순백 패트롤카
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 11);
  ctx.fill();
  ctx.stroke();

  // 중앙 흑색 도어 패널
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 6, w, h / 3, 3);
  ctx.fill();

  // 맑은 민트 윈드실드
  ctx.fillStyle = '#55E6C1';
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 5, h / 5, w - 10, 13, 4);
  ctx.fill();
  ctx.stroke();

  // 쨍한 경광등 (레드 / 블루)
  const beacon = blink ? '#FF6B6B' : '#54A0FF';
  ctx.fillStyle = beacon;
  ctx.beginPath();
  ctx.roundRect(-11, -h / 2 - 6, 22, 9, 4.5);
  ctx.fill();
  ctx.stroke();

  // 경광등 빛무리
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = beacon;
  ctx.beginPath();
  ctx.arc(blink ? -8 : 8, -h / 2 - 2, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // 헤드라이트
  ctx.fillStyle = '#FECA57';
  ctx.beginPath();
  ctx.arc(-w / 3.2, h / 2 - 2, 4, 0, Math.PI * 2);
  ctx.arc(w / 3.2, h / 2 - 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// --- [먹어야 하는 아이템 6종 (쨍하고 반짝이는 캔디 팝 컬러)] ---

// 1) 쨍한 황금 코인 (Coin)
function drawCoinItem(ctx, x, y, size, risky) {
  ctx.save();
  ctx.translate(x, y);

  const pulse = Math.sin(Date.now() / 110) * 1.5;
  const radius = size / 2 + pulse;

  if (risky) {
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -Date.now() / 50;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 7.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 쨍한 골드 바디
  ctx.fillStyle = '#FFB8B8';
  ctx.fillStyle = '#FFDD59';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3D 음각 링
  ctx.strokeStyle = '#FFA801';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
  ctx.stroke();

  // 반짝임
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-radius * 0.3, -radius * 0.3, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 2) 피버 부스터 (로켓 ⚡)
function drawBoosterItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  const bounce = Math.sin(Date.now() / 90) * 3.5;
  ctx.translate(0, bounce);

  // 쨍한 파란 로켓
  ctx.fillStyle = '#54A0FF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-size / 2.5, -size / 1.8, size * 0.8, size * 1.1, 8);
  ctx.fill();
  ctx.stroke();

  // 황금 번개 ⚡
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

// 3) 보호막 쉴드 🛡️
function drawShieldItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  const bounce = Math.sin(Date.now() / 100) * 3.5;
  ctx.translate(0, bounce);

  // 쨍한 에메랄드 방패
  ctx.fillStyle = '#1DD1A1';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
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

  // 십자 문양
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

  ctx.strokeStyle = '#FF6B6B';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(0, 2, size * 0.35, Math.PI, 0, true);
  ctx.lineTo(size * 0.35, -7);
  ctx.moveTo(-size * 0.35, 2);
  ctx.lineTo(-size * 0.35, -7);
  ctx.stroke();

  // 은색 팁
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

// 5) 하트 아이템 ❤️
function drawHeartItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + Math.sin(Date.now() / 105) * 3.5);

  const s = size / 22;
  ctx.fillStyle = '#FF6B6B';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;

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
  ctx.ellipse(-4 * s, -3 * s, 2.5 * s, 3.5 * s, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 6) 모래시계 ⏳ 아이템
function drawSlowItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + Math.sin(Date.now() / 100) * 3);

  const s = size / 2;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;

  // 위아래 프레임
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(-s * 0.8, -s, s * 1.6, 5, 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(-s * 0.8, s - 5, s * 1.6, 5, 2);
  ctx.fill();
  ctx.stroke();

  // 쨍한 퍼플 모래
  ctx.fillStyle = '#9C88FF';
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
  ctx.lineWidth = 2.5;

  // 기둥
  ctx.fillStyle = bonus ? '#FFB8B8' : '#1DD1A1';
  ctx.beginPath();
  ctx.roundRect(-half, -h / 2, 9, h, 3);
  ctx.roundRect(half - 9, -h / 2, 9, h, 3);
  ctx.fill();
  ctx.stroke();

  // 현수막 (황금 게이트 vs 초록 게이트)
  ctx.fillStyle = bonus ? '#FECA57' : '#1DD1A1';
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