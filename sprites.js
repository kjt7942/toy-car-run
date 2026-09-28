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
  ctx.lineTo(x, y - 18);
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









// ===========================================================================
//  장난감 자동차 공통 몸체 — 태엽 장난감 컨셉
// ===========================================================================
//  플레이어·방해 차량·경찰차가 모두 같은 "말랑한 태엽 장난감" 가족이다.
//  구분은 표정과 색으로 한다:
//    - 플레이어: 웃는 눈 + 등 뒤의 태엽 열쇠 (내 차)
//    - 방해 차량: 찌푸린 눈썹 + 칙칙한 보라/회청색 (피할 것)
//    - 경찰차: 흑백 + 경광등 + 화난 눈, 들이받아 기절하면 뱅글 눈
//  모든 좌표는 차 중심 기준이며, 앞쪽이 -y(위)다.

// 통통한 바퀴 (측면에 살짝 튀어나온 알약 모양 + 굴러가는 트레드)
function drawToyWheel(ctx, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#2F3640';
  ctx.beginPath();
  ctx.roundRect(-5, -8.5, 10, 17, 5);
  ctx.fill();
  // 바깥쪽 고무 테 하이라이트 (어두운 도로 위에서도 바퀴가 보이게)
  ctx.strokeStyle = '#8395A7';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // 트레드 줄이 도는 방향으로 흘러간다
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1.6;
  const off = ((rot * 4) % 5 + 5) % 5;
  ctx.beginPath();
  for (let ty = -8 + off; ty < 8; ty += 5) {
    ctx.moveTo(-3, ty);
    ctx.lineTo(3, ty);
  }
  ctx.stroke();
  ctx.restore();
}

// 눈 한 쌍. look: 동공이 쏠리는 방향(-1~1), mood: 'happy' | 'angry' | 'dizzy'
function drawToyEyes(ctx, w, h, look, mood, blink) {
  const ey = -h / 2 + h * 0.17;
  const ex = w * 0.2;
  const r = Math.min(5.2, w * 0.15);
  for (const side of [-1, 1]) {
    const cx = side * ex;
    ctx.save();
    ctx.translate(cx, ey);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 1.8;
    if (blink && mood !== 'dizzy') {
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.quadraticCurveTo(0, r * 0.7, r, 0);
      ctx.stroke();
      ctx.restore();
      continue;
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 1.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (mood === 'dizzy') {
      // 기절: 뱅글뱅글 눈
      ctx.strokeStyle = OUTLINE_COLOR;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const spin = Date.now() / 90 * side;
      for (let a = 0; a < Math.PI * 4; a += 0.4) {
        const rr = (a / (Math.PI * 4)) * r * 0.85;
        const px = Math.cos(a + spin) * rr, py = Math.sin(a + spin) * rr;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else {
      // 동공 (앞쪽+핸들 방향으로 쏠림)
      ctx.fillStyle = OUTLINE_COLOR;
      ctx.beginPath();
      ctx.arc(look * r * 0.35, -r * 0.3, r * 0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(look * r * 0.35 - r * 0.18, -r * 0.5, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    if (mood === 'angry') {
      // 안쪽으로 내려앉은 눈썹
      ctx.strokeStyle = OUTLINE_COLOR;
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(side * r * 1.1, -r * 1.45);
      ctx.lineTo(-side * r * 0.5, -r * 0.85);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// 몸체 공통. opts: { body, stripe, accent, mood, look, wheelRot, windKey, police, stripeOn }
function drawToyCar(ctx, w, h, opts) {
  const body = opts.body;
  const rad = Math.min(w, h) * 0.44;

  // 바닥 그림자
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(2, 6, w / 2 + 5, h / 2 + 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // 바퀴 4개 (몸체 밖으로 살짝)
  const wr = opts.wheelRot || 0;
  drawToyWheel(ctx, -w / 2 - 1.5, -h * 0.27, wr);
  drawToyWheel(ctx, w / 2 + 1.5, -h * 0.27, wr);
  drawToyWheel(ctx, -w / 2 - 1.5, h * 0.29, wr);
  drawToyWheel(ctx, w / 2 + 1.5, h * 0.29, wr);

  // 몸체
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, rad);
  ctx.fillStyle = body;
  ctx.fill();

  // 말랑한 입체감: 양 옆과 아래를 어둡게, 가운데 위를 밝게 (몸체 안쪽만)
  ctx.save();
  ctx.clip();
  const side = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  side.addColorStop(0, 'rgba(0,0,0,0.18)');
  side.addColorStop(0.22, 'rgba(0,0,0,0)');
  side.addColorStop(0.78, 'rgba(0,0,0,0)');
  side.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = side;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  ctx.fillRect(-w / 2, h / 2 - 7, w, 7);

  if (opts.police) {
    // 흑백 경찰차: 앞뒤 흰색, 가운데 문짝 검정
    ctx.fillStyle = '#2F3640';
    ctx.fillRect(-w / 2, -h * 0.14, w, h * 0.34);
  } else if (opts.stripeOn !== false) {
    // 레이싱 줄무늬 2줄
    ctx.fillStyle = opts.stripe;
    ctx.fillRect(-6, -h / 2, 4, h);
    ctx.fillRect(2, -h / 2, 4, h);
  }
  // 비닐 장난감 광택
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 4, -h / 2 + 5, 5, h * 0.55, 3);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, rad);
  ctx.stroke();

  // 버블 캐노피 (둥근 유리 지붕)
  const cw = w * 0.72, ch = h * 0.3, cy = h * 0.06;
  const glass = ctx.createLinearGradient(0, cy - ch / 2, 0, cy + ch / 2);
  glass.addColorStop(0, opts.police ? '#B8E4FF' : '#D9FBFF');
  glass.addColorStop(1, opts.police ? '#4A90D9' : '#35D0E0');
  ctx.fillStyle = glass;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(-cw / 2, cy - ch / 2, cw, ch, cw * 0.45);
  ctx.fill();
  ctx.stroke();
  // 유리 반사광
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, cy + 2, cw * 0.32, Math.PI * 1.15, Math.PI * 1.45);
  ctx.stroke();

  // 캐노피 가운데 칸막이 (앞유리/뒷유리)
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-cw / 2 + 1, cy + ch * 0.12);
  ctx.lineTo(cw / 2 - 1, cy + ch * 0.12);
  ctx.stroke();

  // 얼굴 (보닛에 달린 눈 + 범퍼 입)
  drawToyEyes(ctx, w, h, opts.look || 0, opts.mood || 'happy', opts.blink);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (opts.mood === 'happy') {
    ctx.arc(0, -h / 2 + 3, 4.5, Math.PI * 0.15, Math.PI * 0.85);
  } else {
    ctx.moveTo(-4, -h / 2 + 5);
    ctx.lineTo(4, -h / 2 + 5);
  }
  ctx.stroke();
}

// 등 뒤 태엽 열쇠 — 금빛 나비 모양, 도는 것처럼 폭이 줄었다 늘었다 한다
function drawWindKey(ctx, h, color, rot) {
  const sx = Math.max(0.3, Math.abs(Math.cos(rot)));
  ctx.save();
  ctx.translate(0, h / 2 + 2);
  ctx.strokeStyle = OUTLINE_COLOR;
  // 축
  ctx.fillStyle = '#B2BEC3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-2.5, -4, 5, 9, 1.5);
  ctx.fill();
  ctx.stroke();
  // 나비 날개
  ctx.translate(0, 9);
  ctx.scale(sx, 1);
  ctx.fillStyle = color;
  ctx.lineWidth = 2.3 / sx;
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.bezierCurveTo(-5, -9, -15, -7, -14, 0);
  ctx.bezierCurveTo(-15, 7, -5, 9, 0, 2);
  ctx.bezierCurveTo(5, 9, 15, 7, 14, 0);
  ctx.bezierCurveTo(15, -7, 5, -9, 0, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.ellipse(-8, -2, 3.2, 1.6, -0.3, 0, Math.PI * 2);
  ctx.ellipse(8, -2, 3.2, 1.6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 판마다 한 번씩만 눈을 깜빡인다 (약 3.5초 주기, 0.12초)
function toyBlink(seed) {
  return ((Date.now() + seed * 997) % 3500) < 120;
}

// 5) 플레이어 자동차 — 웃는 태엽 장난감 레이서
function drawPlayer() {
  if (invincibleTime > 0 && Math.floor(invincibleTime / 4) % 2 === 0) {
    return;
  }
  const w = car.width, h = car.height;
  const skin = getSelectedCar();
  const booster = boosterTime > 0;

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle + (car.spin || 0));

  // 부스터: 태엽 양옆에서 뿜는 통통한 불꽃 + 청록 광채
  if (booster) {
    const flick = Math.random() * 6;
    for (const sx of [-w * 0.26, w * 0.26]) {
      ctx.fillStyle = '#FF9F1A';
      ctx.beginPath();
      ctx.moveTo(sx - 5, h / 2 - 2);
      ctx.quadraticCurveTo(sx, h / 2 + 22 + flick, sx + 5, h / 2 - 2);
      ctx.fill();
      ctx.fillStyle = '#FFE66D';
      ctx.beginPath();
      ctx.moveTo(sx - 2.5, h / 2 - 2);
      ctx.quadraticCurveTo(sx, h / 2 + 12 + flick * 0.6, sx + 2.5, h / 2 - 2);
      ctx.fill();
    }
    const glow = ctx.createRadialGradient(0, 0, w * 0.3, 0, 0, h * 0.75);
    glow.addColorStop(0, 'rgba(23, 233, 224, 0.35)');
    glow.addColorStop(1, 'rgba(23, 233, 224, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, h * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWindKey(ctx, h, skin.id === 'gold' ? '#DFE6E9' : '#FFC312', (car.wheelRotation || 0) * 0.35);

  // 핸들 꺾는 방향으로 눈이 쏠린다
  const look = Math.max(-1, Math.min(1, (car.vx || 0) / 5));
  drawToyCar(ctx, w, h, {
    body: booster ? '#17E9E0' : carBodyColor(),
    stripe: booster ? '#FFFFFF' : (skin.stripe || '#FFFFFF'),
    accent: booster ? '#FFD32A' : (skin.stripe || '#FF5757'),
    mood: 'happy',
    look,
    blink: toyBlink(1),
    wheelRot: car.wheelRotation || 0
  });

  // 보호막: 말랑한 비눗방울
  if (activeShield) {
    ctx.save();
    const wob = Math.sin(Date.now() / 140);
    const rx = h * 0.62 * (1 + wob * 0.03), ry = h * 0.66 * (1 - wob * 0.03);
    const bub = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, 2, 0, 0, ry);
    bub.addColorStop(0, 'rgba(255,255,255,0.35)');
    bub.addColorStop(0.7, 'rgba(116,185,255,0.12)');
    bub.addColorStop(1, 'rgba(0,168,255,0.35)');
    ctx.fillStyle = bub;
    ctx.strokeStyle = '#00A8FF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 무지갯빛 반사
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.82, ry * 0.84, 0, Math.PI * 1.1, Math.PI * 1.38);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(253,121,168,0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.9, ry * 0.92, 0, Math.PI * 0.1, Math.PI * 0.3);
    ctx.stroke();
    ctx.restore();
  }

  // 자석: 빨강-흰 점선 파장 (끌어당기는 범위)
  if (magnetTime > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 56, 56, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = Date.now() / 30;
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineDashOffset = Date.now() / 30 + 6;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// 방해 차량: 찌푸린 장난감 차. x 위치로 색을 고정해 한 대가 달리는 동안 색이 바뀌지 않는다.
const TRAFFIC_TONES = [
  { body: '#8854D0', stripe: '#C8A8F0', accent: '#5B2E9E' },
  { body: '#6C7A89', stripe: '#AEB9C4', accent: '#3D4654' },
  { body: '#B3563A', stripe: '#E8A48E', accent: '#6E2E1C' }
];
function drawTrafficCar(ctx, x, y, w, h) {
  const tone = TRAFFIC_TONES[Math.abs(Math.round(x / 7)) % TRAFFIC_TONES.length];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI); // 마주 오는 차: 얼굴이 아래(플레이어 쪽)를 본다
  drawToyCar(ctx, w, h, {
    body: tone.body,
    stripe: tone.stripe,
    accent: tone.accent,
    mood: 'angry',
    look: 0,
    blink: false,
    wheelRot: Date.now() / 60
  });
  ctx.restore();
}

// 경찰차: 흑백 장난감 + 경광등. 들이받아 기절하면 흔들리며 눈이 뱅글뱅글.
function drawChaser(ctx, c) {
  const w = c.kind.w;
  const h = c.kind.h;
  const blink = Math.floor(Date.now() / 130) % 2 === 0;
  const stunned = c.stun > 0;

  ctx.save();
  ctx.translate(c.x, c.y);
  if (stunned) ctx.rotate(Math.sin(Date.now() / 45) * 0.13);

  // 경광등 빛무리 (어두운 화면 아래쪽에서도 눈에 띄도록 넓게)
  const beacon = blink ? '#FF3838' : '#1E90FF';
  const halo = ctx.createRadialGradient(blink ? -8 : 8, -h * 0.05, 2, blink ? -8 : 8, -h * 0.05, 42);
  halo.addColorStop(0, blink ? 'rgba(255,56,56,0.5)' : 'rgba(30,144,255,0.5)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(-50, -h * 0.05 - 45, 100, 90);

  drawToyCar(ctx, w, h, {
    body: '#F5F6FA',
    police: true,
    accent: null,
    mood: stunned ? 'dizzy' : 'angry',
    look: Math.max(-1, Math.min(1, (car.x - c.x) / 60)),
    wheelRot: Date.now() / 50
  });

  // 캐노피 위 경광등 (빨강·파랑 번갈아)
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.fillStyle = blink ? '#FF3838' : '#8B1E1E';
  ctx.beginPath();
  ctx.roundRect(-11, -h * 0.07 - 4, 11, 8, [4, 0, 0, 4]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = blink ? '#0B3D91' : '#1E90FF';
  ctx.beginPath();
  ctx.roundRect(0, -h * 0.07 - 4, 11, 8, [0, 4, 4, 0]);
  ctx.fill();
  ctx.stroke();

  // 기절 중엔 머리 위로 별이 돈다
  if (stunned) {
    ctx.fillStyle = '#FFD32A';
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const a = Date.now() / 200 + i * (Math.PI * 2 / 3);
      toyStar(ctx, Math.cos(a) * 16, -h / 2 - 8 + Math.sin(a) * 5, 5, 2.2);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();
}

// 차고 미리보기용: 임의 캔버스에 스킨을 그려 준다 (game.js의 renderGarage가 부른다)
function drawCarPreview(pctx, skin, cw, chh) {
  pctx.clearRect(0, 0, cw, chh);
  pctx.save();
  pctx.translate(cw / 2, chh / 2 - 6);
  pctx.scale(0.8, 0.8);
  const w = 36, h = 60;
  drawWindKey(pctx, h, skin.id === 'gold' ? '#DFE6E9' : '#FFC312', 0.2);
  drawToyCar(pctx, w, h, {
    body: skin.body || `hsl(${Math.floor(Date.now() / 12) % 360}, 85%, 62%)`,
    stripe: skin.stripe || '#FFFFFF',
    accent: skin.stripe || '#FF5757',
    mood: 'happy',
    look: 0,
    wheelRot: 0
  });
  pctx.restore();
}

// ===========================================================================
//  먹어야 하는 아이템 6종 — "반짝이는 장난감 보물"
// ===========================================================================
//  피할 것(장애물)과 0.5초 안에 갈리도록, 아이템에만 공통 문법을 입힌다:
//    ① 은은한 빛무리  ② 주위를 도는 반짝 별  ③ 통통 튀는 움직임
//  장애물에는 이 셋이 하나도 없다.

function toyStar(ctx, x, y, R, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r : R;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

function drawTwinkle(ctx, x, y, s, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.fill();
  ctx.restore();
}

// 아이템 공통 빛무리 + 반짝이
function drawPickupAura(ctx, r, rgb, seed) {
  const t = Date.now() / 1000 + seed;
  const pulse = 0.85 + Math.sin(t * 5) * 0.15;
  const g = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.7 * pulse);
  g.addColorStop(0, `rgba(${rgb}, 0.5)`);
  g.addColorStop(0.6, `rgba(${rgb}, 0.18)`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.7 * pulse, 0, Math.PI * 2);
  ctx.fill();
  const a = t * 2.2;
  drawTwinkle(ctx, Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25, 3.6, 0.55 + Math.sin(t * 7) * 0.45);
  drawTwinkle(ctx, Math.cos(a + 2.6) * r * 1.15, Math.sin(a + 2.6) * r * 1.15, 2.6, 0.55 + Math.cos(t * 6) * 0.45);
}

function itemBob(x, y, speed) {
  return Math.sin(Date.now() / speed + x * 0.05) * 3;
}

// 1) 코인 — 빙글 도는 두툼한 금화 (별 각인)
function drawCoinItem(ctx, x, y, size, risky) {
  ctx.save();
  ctx.translate(x, y + itemBob(x, y, 150) * 0.6);
  const r = size / 2 + 1;

  if (risky) {
    ctx.strokeStyle = '#FF3838';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([3, 3]);
    ctx.lineDashOffset = -Date.now() / 60;
    ctx.beginPath();
    ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawPickupAura(ctx, r, '255, 211, 42', x * 0.01);

  // 회전: 가로 폭이 줄었다 늘었다 (완전히 납작해지진 않게)
  const spin = Math.cos(Date.now() / 260 + x * 0.1);
  const sx = 0.35 + Math.abs(spin) * 0.65;
  ctx.scale(sx, 1);
  const lw = 2.4 / sx;

  // 두께 (아래로 비친 옆면)
  ctx.fillStyle = '#E08E00';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(0, 2.5, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 앞면
  const face = ctx.createRadialGradient(-r * 0.3, -r * 0.4, 1, 0, 0, r);
  face.addColorStop(0, '#FFF3A0');
  face.addColorStop(0.6, '#FFD32A');
  face.addColorStop(1, '#F5B700');
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 별 각인
  ctx.fillStyle = '#FF9F1A';
  ctx.lineWidth = 1.2 / sx;
  toyStar(ctx, 0, 0.5, r * 0.5, r * 0.22);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.42, -r * 0.4, r * 0.2, r * 0.11, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 2) 부스터 — 태엽차에 끼우는 번개 건전지
function drawBoosterItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + itemBob(x, y, 100));
  drawPickupAura(ctx, size / 2, '23, 233, 224', 1.3);
  ctx.rotate(Math.sin(Date.now() / 180) * 0.12);

  const bw = size * 0.62, bh = size * 1.05;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  // + 단자
  ctx.fillStyle = '#DFE6E9';
  ctx.beginPath();
  ctx.roundRect(-bw * 0.22, -bh / 2 - 4, bw * 0.44, 6, 2);
  ctx.fill();
  ctx.stroke();
  // 몸통 (위 청록 / 아래 노랑)
  ctx.beginPath();
  ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 6);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#17E9E0';
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh * 0.55);
  ctx.fillStyle = '#FFD32A';
  ctx.fillRect(-bw / 2, -bh / 2 + bh * 0.55, bw, bh * 0.45);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(-bw / 2 + 3, -bh / 2 + 3, 3.5, bh - 6);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(bw / 2 - 5, -bh / 2, 5, bh);
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 6);
  ctx.stroke();
  // 번개
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(1.5, -bh * 0.36);
  ctx.lineTo(-5, 1);
  ctx.lineTo(-0.5, 1);
  ctx.lineTo(-2.5, bh * 0.36);
  ctx.lineTo(5, -2.5);
  ctx.lineTo(0.5, -2.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// 3) 보호막 — 별이 박힌 말랑 방패
function drawShieldItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + itemBob(x, y, 110));
  const s = size / 2;
  drawPickupAura(ctx, s, '0, 168, 255', 2.1);

  const path = () => {
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.05);
    ctx.quadraticCurveTo(s * 0.55, -s * 0.72, s * 1.02, -s * 0.8);
    ctx.quadraticCurveTo(s * 1.08, s * 0.35, 0, s * 1.08);
    ctx.quadraticCurveTo(-s * 1.08, s * 0.35, -s * 1.02, -s * 0.8);
    ctx.quadraticCurveTo(-s * 0.55, -s * 0.72, 0, -s * 1.05);
    ctx.closePath();
  };
  path();
  const g = ctx.createLinearGradient(0, -s, 0, s);
  g.addColorStop(0, '#74C8FF');
  g.addColorStop(1, '#0984E3');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // 안쪽 흰 테두리
  ctx.save();
  ctx.scale(0.72, 0.72);
  path();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
  // 별
  ctx.fillStyle = '#FFD32A';
  ctx.lineWidth = 1.5;
  toyStar(ctx, 0, 0, s * 0.46, s * 0.2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// 4) 자석 — 통통한 말굽 자석 (은색 끝)
function drawMagnetItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + itemBob(x, y, 95));
  drawPickupAura(ctx, size / 2, '255, 56, 56', 3.7);
  ctx.rotate(Math.sin(Date.now() / 160) * 0.18);

  const R = size * 0.36, t = 7.5;
  const u = () => {
    ctx.beginPath();
    ctx.moveTo(-R, -R * 0.55);
    ctx.lineTo(-R, 0);
    ctx.arc(0, 0, R, Math.PI, 0, true);
    ctx.lineTo(R, -R * 0.55);
  };
  ctx.lineCap = 'butt';
  // 외곽선
  u();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = t + 4.5;
  ctx.stroke();
  // 빨강 몸통
  u();
  ctx.strokeStyle = '#FF3838';
  ctx.lineWidth = t;
  ctx.stroke();
  // 광택
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, R - 1.5, Math.PI * 0.95, Math.PI * 0.62, true);
  ctx.stroke();
  // 은색 끝 (N/S)
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = OUTLINE_COLOR;
  for (const sx of [-R, R]) {
    ctx.fillStyle = '#F5F6FA';
    ctx.beginPath();
    ctx.roundRect(sx - (t + 2) / 2, -R * 0.55 - 7, t + 2, 8, 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

// 5) 하트 — 바느질 자국이 있는 말랑 인형 하트
function drawHeartItem(ctx, x, y, size) {
  ctx.save();
  const beat = 1 + Math.max(0, Math.sin(Date.now() / 140)) * 0.08;
  ctx.translate(x, y + itemBob(x, y, 110));
  drawPickupAura(ctx, size / 2, '255, 77, 109', 4.4);
  ctx.scale(beat, beat);

  const s = size / 22;
  const heart = (k) => {
    ctx.beginPath();
    ctx.moveTo(0, 10 * s * k);
    ctx.bezierCurveTo(-15 * s * k, 0, -10 * s * k, -14 * s * k, 0, -5.5 * s * k);
    ctx.bezierCurveTo(10 * s * k, -14 * s * k, 15 * s * k, 0, 0, 10 * s * k);
    ctx.closePath();
  };
  heart(1);
  const g = ctx.createRadialGradient(-4 * s, -5 * s, 1, 0, 0, 13 * s);
  g.addColorStop(0, '#FF8FA3');
  g.addColorStop(1, '#FF3D6B');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // 바느질 점선
  heart(0.72);
  ctx.setLineDash([2.2, 2.2]);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.ellipse(-5 * s, -4 * s, 2.2 * s, 3 * s, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 6) 슬로우 — 나무 받침 모래시계, 보라 모래가 실제로 흘러내린다
function drawSlowItem(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y + itemBob(x, y, 105));
  const s = size / 2 + 1;
  drawPickupAura(ctx, s, '162, 155, 254', 5.9);
  ctx.rotate(Math.sin(Date.now() / 200) * 0.1);

  const k = (Date.now() / 2400) % 1; // 모래가 떨어진 비율
  const gx = s * 0.72, top = -s + 3, bot = s - 3;
  const glassPath = () => {
    ctx.beginPath();
    ctx.moveTo(-gx, top);
    ctx.bezierCurveTo(-gx, -s * 0.35, -2, -2, -2, 0);
    ctx.bezierCurveTo(-2, 2, -gx, s * 0.35, -gx, bot);
    ctx.lineTo(gx, bot);
    ctx.bezierCurveTo(gx, s * 0.35, 2, 2, 2, 0);
    ctx.bezierCurveTo(2, -2, gx, -s * 0.35, gx, top);
    ctx.closePath();
  };
  glassPath();
  ctx.fillStyle = '#EFFBFF';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#6C5CE7';
  // 위 모래 (줄어듦) — 아래(목) 쪽에 고여 있다
  const topH = (-top) * (1 - k) * 0.9;
  ctx.fillRect(-gx, -topH, gx * 2, topH);
  // 아래 모래 (쌓임)
  const botH = bot * (0.15 + k * 0.75);
  ctx.beginPath();
  ctx.moveTo(-gx, bot);
  ctx.lineTo(-gx, bot - botH * 0.55);
  ctx.quadraticCurveTo(0, bot - botH * 1.5, gx, bot - botH * 0.55);
  ctx.lineTo(gx, bot);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-1, -1, 2, bot);
  ctx.restore();
  glassPath();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(-gx * 0.55, top + 4, 1.3, 2.6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // 나무 받침 (유리를 덮지 않도록 바깥쪽에 얇게)
  ctx.fillStyle = '#C8875A';
  for (const yy of [-s - 1.5, s - 2.5]) {
    ctx.beginPath();
    ctx.roundRect(-s * 0.95, yy, s * 1.9, 4.5, 2.2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

// 14) 선택 게이트 — 장난감 아치 (황금 = 코인 2배/위험, 초록 = 안전)
function drawGate(ctx, x, y, w, h, bonus) {
  ctx.save();
  ctx.translate(x, y);
  const half = w / 2;
  const main = bonus ? '#FFD32A' : '#2ED573';
  const dark = bonus ? '#E08E00' : '#05A857';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3;

  // 기둥 (줄무늬 막대사탕 기둥)
  for (const px of [-half, half - 10]) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(px, -h / 2, 10, h + 4, 4);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = dark;
    for (let yy = -h / 2 - 10; yy < h / 2 + 10; yy += 8) {
      ctx.beginPath();
      ctx.moveTo(px, yy); ctx.lineTo(px + 10, yy - 5); ctx.lineTo(px + 10, yy - 1); ctx.lineTo(px, yy + 4);
      ctx.fill();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.roundRect(px, -h / 2, 10, h + 4, 4);
    ctx.stroke();
    // 기둥 꼭대기 공
    ctx.fillStyle = main;
    ctx.beginPath();
    ctx.arc(px + 5, -h / 2 - 3, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 현수막
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.roundRect(-half + 7, -h / 2 + 1, w - 14, h * 0.66, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.roundRect(-half + 12, -h / 2 + 4, w - 24, 3, 2);
  ctx.fill();

  ctx.fillStyle = OUTLINE_COLOR;
  ctx.font = '900 15px "Jua", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bonus ? '🪙 x2 위험' : '✅ 안전', 0, -h / 2 + 1 + h * 0.33);

  // 황금 게이트는 반짝이
  if (bonus) {
    const t = Date.now() / 1000;
    drawTwinkle(ctx, -half + 20 + ((t * 40) % (w - 40)), -h / 2 + 5, 3.5, 0.9);
  }
  ctx.restore();
}



// ===========================================================================
//  월드(구간) 시스템 그림 — 레벨이 오를 때마다 풍경이 바뀐다
// ===========================================================================
//  게임 규칙(장애물·아이템)은 구간과 무관하게 똑같다. 바뀌는 건 배경뿐이라
//  "먹을 것 / 피할 것" 구분 원칙은 어느 구간에서도 그대로 지켜진다.
//  밤 구간의 어둠도 배경 층에만 깔고, 장애물·아이템은 그 위에 원래 색으로 그린다.

const BIOMES = [
  { id: 'spring', name: '봄 들판',   icon: '🌼', grass: '#7ED957', grass2: '#72CC4C', road: '#4B5563', edge: '#FFFFFF',
    scenery: ['tree', 'tree', 'flower', 'flower', 'flower', 'windmill'], weather: 'petal', night: 0 },
  { id: 'vineyard', name: '샤인머스켓 포도밭', icon: '🍇', grass: '#A8D672', grass2: '#98C865', road: '#52525B', edge: '#FFFFFF',
    scenery: ['vine', 'vine', 'vine', 'crate', 'flower'], weather: null, night: 0 },
  { id: 'autumn', name: '단풍길',    icon: '🍁', grass: '#E3B558', grass2: '#D6A74C', road: '#57534E', edge: '#FFF3D6',
    scenery: ['maple', 'maple', 'maple', 'haystack', 'flower'], weather: 'leaf', night: 0 },
  { id: 'beach', name: '바닷가 도로', icon: '🏖️', grass: '#F3D9A4', grass2: '#EACB8E', road: '#5B6470', edge: '#FFFFFF',
    scenery: ['palm', 'palm', 'parasol', 'shell'], weather: null, night: 0, sea: true },
  { id: 'night', name: '반짝 밤거리', icon: '🌙', grass: '#35604A', grass2: '#2C543F', road: '#3A4250', edge: '#FFE08A',
    scenery: ['lamp', 'lamp', 'tree', 'flower'], weather: 'firefly', night: 0.55 },
  { id: 'snow', name: '눈꽃 설원',   icon: '⛄', grass: '#EEF6FC', grass2: '#DDEBF6', road: '#5A6573', edge: '#BFE3FF',
    scenery: ['pine', 'pine', 'pine', 'snowman'], weather: 'snow', night: 0 }
];

function biomeForLevel(lv) {
  return BIOMES[(Math.max(1, lv) - 1) % BIOMES.length];
}

// '#RRGGBB' 두 색을 t(0~1)로 섞는다. 구간이 바뀔 때 땅 색이 서서히 번지게 하는 데 쓴다.
function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * t);
  const g = Math.round(((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * t);
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * t);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

// 땅 + 도로 + 차선. roadOffset에 맞춰 잔디 줄무늬도 같이 흘러가 속도감이 산다.
function drawWorldGround(ctx, from, to, t, roadX, roadWidth, roadOffset, W, H) {
  const grass = mixHex(from.grass, to.grass, t);
  const grass2 = mixHex(from.grass2, to.grass2, t);
  const road = mixHex(from.road, to.road, t);
  const edge = mixHex(from.edge, to.edge, t);

  ctx.fillStyle = grass;
  ctx.fillRect(0, 0, W, H);

  // 잔디 깎은 줄무늬 (도로와 같이 흐른다)
  ctx.fillStyle = grass2;
  const band = 80;
  const off = roadOffset % (band * 2);
  for (let y = -band * 2 + off; y < H; y += band * 2) {
    ctx.fillRect(0, y, roadX - 4, band);
    ctx.fillRect(roadX + roadWidth + 4, y, W - roadX - roadWidth - 4, band);
  }

  // 바닷가 구간: 오른쪽 바깥에 파도가 넘실대는 바다 띠
  const seaA = (from.sea ? 1 - t : 0) + (to.sea ? t : 0);
  if (seaA > 0.01) {
    ctx.save();
    ctx.globalAlpha = seaA;
    const sx = W - 34;
    ctx.fillStyle = '#4FC3F7';
    ctx.fillRect(sx, 0, 34, H);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let y = -20; y <= H + 20; y += 10) {
      const wx = sx + Math.sin((y + roadOffset) / 22) * 4;
      if (y === -20) ctx.moveTo(wx, y); else ctx.lineTo(wx, y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let y = (roadOffset * 0.8) % 60 - 60; y < H; y += 60) {
      ctx.beginPath();
      ctx.ellipse(sx + 18, y, 7, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 도로
  ctx.fillStyle = road;
  ctx.fillRect(roadX, 0, roadWidth, H);

  // 연석 (빨강/흰 줄무늬) — 도로 경계가 어느 구간에서도 또렷하게
  const curb = 24;
  const coff = roadOffset % (curb * 2);
  for (let y = -curb * 2 + coff; y < H; y += curb * 2) {
    ctx.fillStyle = edge;
    ctx.fillRect(roadX - 6, y, 6, curb);
    ctx.fillRect(roadX + roadWidth, y, 6, curb);
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(roadX - 6, y + curb, 6, curb);
    ctx.fillRect(roadX + roadWidth, y + curb, 6, curb);
  }

  // 중앙 점선
  ctx.strokeStyle = edge;
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]);
  ctx.lineDashOffset = -roadOffset;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);
}

// 풍경 오브젝트 하나 그리기 (종류별 분기)
function drawSceneryObj(ctx, obj) {
  switch (obj.type) {
    case 'tree': drawTree(ctx, obj.x, obj.y); break;
    case 'flower': drawFlower(ctx, obj.x, obj.y); break;
    case 'windmill': drawWindmill(ctx, obj.x, obj.y, obj.rot); break;
    case 'vine': drawGrapeVine(ctx, obj.x, obj.y); break;
    case 'crate': drawGrapeCrate(ctx, obj.x, obj.y); break;
    case 'maple': drawMaple(ctx, obj.x, obj.y); break;
    case 'haystack': drawHaystack(ctx, obj.x, obj.y); break;
    case 'palm': drawPalm(ctx, obj.x, obj.y, obj.rot); break;
    case 'parasol': drawParasol(ctx, obj.x, obj.y); break;
    case 'shell': drawShell(ctx, obj.x, obj.y); break;
    case 'lamp': drawLamp(ctx, obj.x, obj.y); break;
    case 'pine': drawPine(ctx, obj.x, obj.y); break;
    case 'snowman': drawSnowman(ctx, obj.x, obj.y); break;
  }
}

function sceneryShadow(ctx, x, y, rx) {
  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, rx * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
}

// 샤인머스켓 덕장: 나무 기둥 + 초록 잎 + 연두빛 포도송이
function drawGrapeVine(ctx, x, y) {
  ctx.save();
  sceneryShadow(ctx, x, y + 20, 15);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.fillStyle = '#A1887F';
  ctx.beginPath(); ctx.roundRect(x - 3, y - 6, 6, 26, 2); ctx.fill(); ctx.stroke();
  // 잎 지붕
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.arc(x - 11, y - 10, 10, 0, Math.PI * 2);
  ctx.arc(x + 11, y - 10, 10, 0, Math.PI * 2);
  ctx.arc(x, y - 16, 11, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#81C784';
  ctx.beginPath();
  ctx.arc(x - 9, y - 13, 5, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 19, 5, 0, Math.PI * 2);
  ctx.fill();
  // 포도송이 (역삼각 알 배치)
  const rows = [[-4, 0, 4], [-2, 2], [0]];
  ctx.lineWidth = 1.3;
  rows.forEach((row, ri) => {
    row.forEach(dx => {
      ctx.fillStyle = '#C5E86C';
      ctx.beginPath();
      ctx.arc(x + dx + 3, y - 3 + ri * 3.6, 2.4, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    });
  });
  ctx.restore();
}

function drawGrapeCrate(ctx, x, y) {
  ctx.save();
  sceneryShadow(ctx, x, y + 9, 13);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.fillStyle = '#C5E86C';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) ctx.arc(x - 8 + i * 4, y - 4 - (i % 2) * 2, 3.2, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#D7A86E';
  ctx.beginPath(); ctx.roundRect(x - 12, y - 3, 24, 12, 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 12, y + 3); ctx.lineTo(x + 12, y + 3); ctx.stroke();
  ctx.restore();
}


function drawHaystack(ctx, x, y) {
  ctx.save();
  sceneryShadow(ctx, x, y + 10, 14);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.fillStyle = '#FFD166';
  ctx.beginPath(); ctx.ellipse(x, y, 14, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#C9962B';
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.ellipse(x, y, 14, 4 + Math.abs(i) * 2, 0, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
  }
  ctx.restore();
}

function drawPalm(ctx, x, y, rot) {
  ctx.save();
  sceneryShadow(ctx, x + 4, y + 22, 13);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  // 살짝 휜 줄기
  ctx.fillStyle = '#B08968';
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 22); ctx.quadraticCurveTo(x - 6, y + 4, x - 1, y - 10);
  ctx.lineTo(x + 4, y - 9); ctx.quadraticCurveTo(x + 1, y + 4, x + 4, y + 22);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 잎 5장 (바람에 살랑)
  const sway = Math.sin((rot || 0) * 2) * 0.12;
  ctx.fillStyle = '#20BF6B';
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.72 + sway;
    ctx.save();
    ctx.translate(x + 1, y - 10);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(12, 0, 13, 4.5, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath(); ctx.arc(x - 2, y - 7, 3, 0, Math.PI * 2); ctx.arc(x + 3, y - 6, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawParasol(ctx, x, y) {
  ctx.save();
  sceneryShadow(ctx, x + 6, y + 14, 16);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 16); ctx.stroke();
  const cols = ['#FF6B6B', '#FFFFFF', '#FF6B6B', '#FFFFFF', '#FF6B6B', '#FFFFFF'];
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = cols[i];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, 15, (i / 6) * Math.PI * 2, ((i + 1) / 6) * Math.PI * 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawShell(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;
  ctx.fillStyle = '#FFB8C8';
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  ctx.arc(x, y + 1, 7, Math.PI * 1.05, Math.PI * 1.95);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  for (let i = -2; i <= 2; i++) { ctx.moveTo(x, y + 6); ctx.lineTo(x + i * 2.6, y - 4); }
  ctx.stroke();
  ctx.restore();
}

function drawLamp(ctx, x, y) {
  ctx.save();
  sceneryShadow(ctx, x, y + 24, 8);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.fillStyle = '#636E72';
  ctx.beginPath(); ctx.roundRect(x - 2.5, y - 14, 5, 38, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFE08A';
  ctx.beginPath(); ctx.arc(x, y - 18, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(x - 2, y - 20, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawPine(ctx, x, y) {
  ctx.save();
  sceneryShadow(ctx, x, y + 20, 13);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.fillStyle = '#795548';
  ctx.beginPath(); ctx.roundRect(x - 3.5, y + 8, 7, 12, 2); ctx.fill(); ctx.stroke();
  const tiers = [[y + 10, 16], [y - 2, 13], [y - 13, 9.5]];
  tiers.forEach(([ty, w]) => {
    ctx.fillStyle = '#1E8449';
    ctx.beginPath();
    ctx.moveTo(x - w, ty); ctx.lineTo(x, ty - 16); ctx.lineTo(x + w, ty); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // 눈 모자
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.45, ty - 9); ctx.lineTo(x, ty - 16); ctx.lineTo(x + w * 0.45, ty - 9);
    ctx.quadraticCurveTo(x, ty - 6, x - w * 0.45, ty - 9);
    ctx.fill();
  });
  ctx.restore();
}

function drawSnowman(ctx, x, y) {
  ctx.save();
  sceneryShadow(ctx, x, y + 14, 11);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(x, y + 5, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y - 9, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FF6B6B';
  ctx.fillRect(x - 7, y - 4, 14, 3);
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath(); ctx.arc(x - 2.5, y - 10, 1.2, 0, Math.PI * 2); ctx.arc(x + 2.5, y - 10, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FF9F43';
  ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 6, y - 7); ctx.lineTo(x, y - 6); ctx.fill();
  ctx.restore();
}

// 밤 구간: 배경 층만 어둡게 덮고, 가로등·헤드라이트 빛은 'lighter'로 되살린다.
// 장애물·아이템은 이 다음에 그리므로 밤에도 원래 색 그대로 또렷하다.
function drawNightLayer(ctx, amount, carX, carY, scenery, W, H, t) {
  if (amount <= 0.01) return;
  ctx.save();
  ctx.fillStyle = `rgba(12, 18, 44, ${amount})`;
  ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = 'lighter';
  // 가로등 빛웅덩이
  scenery.forEach(o => {
    if (o.type !== 'lamp') return;
    const g = ctx.createRadialGradient(o.x, o.y - 18, 2, o.x, o.y - 6, 46);
    g.addColorStop(0, `rgba(255, 214, 120, ${0.55 * amount})`);
    g.addColorStop(1, 'rgba(255, 214, 120, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(o.x - 46, o.y - 64, 92, 100);
  });
  // 헤드라이트 빔 (차 앞쪽으로 퍼지는 사다리꼴)
  const beam = ctx.createLinearGradient(0, carY - 30, 0, carY - 260);
  beam.addColorStop(0, `rgba(255, 244, 200, ${0.42 * amount})`);
  beam.addColorStop(1, 'rgba(255, 244, 200, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(carX - 12, carY - 28);
  ctx.lineTo(carX + 12, carY - 28);
  ctx.lineTo(carX + 70, carY - 260);
  ctx.lineTo(carX - 70, carY - 260);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 날씨 파티클 (꽃잎 / 낙엽 / 눈 / 반딧불). 가벼운 원·타원만 써서 60fps 부담이 없다.
function drawWeather(ctx, parts) {
  for (const p of parts) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    if (p.kind === 'snow') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
    } else if (p.kind === 'leaf') {
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    } else if (p.kind === 'petal') {
      ctx.rotate(p.rot);
      ctx.fillStyle = '#FFC8DD';
      ctx.beginPath(); ctx.ellipse(0, 0, p.size * 1.3, p.size * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    } else if (p.kind === 'firefly') {
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 4);
      g.addColorStop(0, 'rgba(230, 255, 140, 0.9)');
      g.addColorStop(1, 'rgba(230, 255, 140, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(-p.size * 4, -p.size * 4, p.size * 8, p.size * 8);
    }
    ctx.restore();
  }
}

// 이전 최고 거리 지점에 깔리는 체크무늬 결승선
function drawBestLine(ctx, y, roadX, roadWidth, passed) {
  ctx.save();
  const sq = 10;
  for (let i = 0; i * sq < roadWidth; i++) {
    for (let j = 0; j < 2; j++) {
      ctx.fillStyle = (i + j) % 2 ? '#FFFFFF' : '#2F3640';
      ctx.fillRect(roadX + i * sq, y + j * sq, sq, sq);
    }
  }
  if (!passed) {
    ctx.font = '900 15px "Jua", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2F3640';
    ctx.strokeText('🏁 내 최고 기록', roadX + roadWidth / 2, y - 8);
    ctx.fillStyle = '#FFDE59';
    ctx.fillText('🏁 내 최고 기록', roadX + roadWidth / 2, y - 8);
  }
  ctx.restore();
}

// 출발 카운트다운 (3·2·1·출발!)
function drawCountdown(ctx, label, frac, W, H) {
  ctx.save();
  ctx.fillStyle = 'rgba(30, 39, 46, 0.25)';
  ctx.fillRect(0, 0, W, H);
  const s = 1 + (1 - frac) * 0.6;
  ctx.globalAlpha = Math.min(1, frac * 2.2);
  ctx.translate(W / 2, H / 2 - 30);
  ctx.scale(s, s);
  ctx.font = `900 ${label.length > 1 ? 54 : 84}px "Jua", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#2F3640';
  ctx.strokeText(label, 0, 0);
  ctx.fillStyle = label.length > 1 ? '#2ED573' : '#FFDE59';
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

// ===========================================================================
//  피해야 하는 것들 — "길 위에 흩어진 장난감"
// ===========================================================================
//  아이템(빛무리·반짝이·통통)과 반대 문법을 쓴다:
//    진하고 짧은 바닥 그림자, 움직이지 않음, 주황/빨강 경고 포인트.

// x 좌표로 고른 결정적 난수 — 같은 장애물은 스크롤되는 동안 모양이 바뀌지 않는다
function _objHash(x, salt) {
  const s = Math.sin(Math.round(x) * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function obstacleShadow(ctx, cx, cy, rx, ry) {
  ctx.fillStyle = 'rgba(20, 24, 32, 0.32)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// 6) 고깔 — 말랑한 비닐 장난감 콘 (둥근 끝 + 흰 띠 2줄 + 네모 받침)
function drawCone(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  obstacleShadow(ctx, 2, h / 2 - 1, w * 0.62, 5);

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.6;

  // 받침
  const bw = w * 1.02, by = h / 2 - 7;
  ctx.fillStyle = '#E8590C';
  ctx.beginPath();
  ctx.roundRect(-bw / 2, by, bw, 7, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-bw / 2 + 3, by + 1.5, bw - 6, 1.6);

  // 몸통 (위가 둥근 사다리꼴)
  const topY = -h / 2 + 3, botY = by + 1;
  const tw = w * 0.2, bw2 = w * 0.78;
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(-bw2 / 2, botY);
    ctx.lineTo(-tw / 2, topY + 3);
    ctx.quadraticCurveTo(0, topY - 3, tw / 2, topY + 3);
    ctx.lineTo(bw2 / 2, botY);
    ctx.closePath();
  };
  body();
  const g = ctx.createLinearGradient(-bw2 / 2, 0, bw2 / 2, 0);
  g.addColorStop(0, '#FF922B');
  g.addColorStop(0.45, '#FF7A1A');
  g.addColorStop(1, '#E8590C');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // 흰 반사띠 2줄
  ctx.fillStyle = '#FFFFFF';
  const span = botY - topY;
  ctx.fillRect(-w, topY + span * 0.28, w * 2, span * 0.16);
  ctx.fillRect(-w, topY + span * 0.62, w * 2, span * 0.16);
  // 비닐 광택
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.moveTo(-tw / 2 + 1, topY + 5);
  ctx.lineTo(-bw2 / 2 + 5, botY);
  ctx.lineTo(-bw2 / 2 + 9, botY);
  ctx.lineTo(-tw / 2 + 3.5, topY + 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  body();
  ctx.stroke();
  ctx.restore();
}

// 7) 바위 자리 → 장난감 나무 블록 (글자 블록). 색·글자는 위치마다 다르게.
const TOY_BLOCKS = [
  { face: '#FF6B6B', top: '#FFA8A8', side: '#D94848', ch: 'A' },
  { face: '#4DABF7', top: '#A5D8FF', side: '#1C7ED6', ch: 'B' },
  { face: '#51CF66', top: '#B2F2BB', side: '#2F9E44', ch: '가' },
  { face: '#FCC419', top: '#FFE066', side: '#E67700', ch: '나' },
  { face: '#9775FA', top: '#D0BFFF', side: '#6741D9', ch: 'C' }
];
function drawRock(ctx, x, y, w, h) {
  const b = TOY_BLOCKS[Math.floor(_objHash(x, 1) * TOY_BLOCKS.length)];
  const tilt = (_objHash(x, 2) - 0.5) * 0.35;
  ctx.save();
  ctx.translate(x, y);
  obstacleShadow(ctx, 3, h / 2 - 1, w * 0.6, 5);
  ctx.rotate(tilt);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';

  const s = w * 0.82;           // 앞면 한 변
  const d = s * 0.28;           // 윗면 깊이
  const fx = -s / 2, fy = -s / 2 + d / 2;
  // 윗면
  ctx.fillStyle = b.top;
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(fx + d, fy - d);
  ctx.lineTo(fx + s + d, fy - d);
  ctx.lineTo(fx + s, fy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 옆면
  ctx.fillStyle = b.side;
  ctx.beginPath();
  ctx.moveTo(fx + s, fy);
  ctx.lineTo(fx + s + d, fy - d);
  ctx.lineTo(fx + s + d, fy + s - d);
  ctx.lineTo(fx + s, fy + s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 앞면
  ctx.fillStyle = b.face;
  ctx.beginPath();
  ctx.roundRect(fx, fy, s, s, 3);
  ctx.fill();
  ctx.stroke();
  // 앞면 안쪽 테두리 + 글자
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(fx + 3, fy + 3, s - 6, s - 6, 2);
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.2;
  ctx.font = `900 ${Math.round(s * 0.62)}px "Jua", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText(b.ch, fx + s / 2, fy + s / 2 + 1);
  ctx.fillText(b.ch, fx + s / 2, fy + s / 2 + 1);
  ctx.restore();
}

// 8) 바리케이드 — 장난감 공사 표지대 (사선 줄무늬 판 + 다리 + 깜빡이는 경고등)
function drawBarrier(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  obstacleShadow(ctx, 3, h / 2 - 1, w * 0.52, 5);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';

  // 다리 (A자)
  ctx.fillStyle = '#DEE2E6';
  for (const lx of [-w * 0.33, w * 0.33]) {
    ctx.beginPath();
    ctx.moveTo(lx - 6, h / 2 - 2);
    ctx.lineTo(lx - 2, -h * 0.05);
    ctx.lineTo(lx + 2, -h * 0.05);
    ctx.lineTo(lx + 6, h / 2 - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#495057';
    ctx.beginPath();
    ctx.roundRect(lx - 8, h / 2 - 5, 16, 5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#DEE2E6';
  }

  // 판
  const pw = w, ph = h * 0.46, py = -h / 2 + 7;
  ctx.beginPath();
  ctx.roundRect(-pw / 2, py, pw, ph, 5);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-pw / 2, py, pw, ph);
  ctx.fillStyle = '#FF6B1A';
  for (let sx = -pw / 2 - ph; sx < pw / 2 + ph; sx += 14) {
    ctx.beginPath();
    ctx.moveTo(sx, py + ph);
    ctx.lineTo(sx + 7, py + ph);
    ctx.lineTo(sx + 7 + ph, py);
    ctx.lineTo(sx + ph, py);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(-pw / 2, py + 2, pw, 2.5);
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(-pw / 2, py, pw, ph, 5);
  ctx.stroke();

  // 경고등 2개 (번갈아 깜빡)
  const on = Math.floor(Date.now() / 260) % 2;
  [-pw / 2 + 7, pw / 2 - 7].forEach((lx, i) => {
    const lit = (i === on);
    if (lit) {
      const glow = ctx.createRadialGradient(lx, py - 3, 1, lx, py - 3, 13);
      glow.addColorStop(0, 'rgba(255, 190, 40, 0.75)');
      glow.addColorStop(1, 'rgba(255, 190, 40, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(lx - 13, py - 16, 26, 26);
    }
    ctx.fillStyle = lit ? '#FFD43B' : '#C9A227';
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(lx, py - 3, 4.2, Math.PI, 0);
    ctx.lineTo(lx + 4.2, py);
    ctx.lineTo(lx - 4.2, py);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

// 9) 기름통 — 장난감 드럼통 (검정 몸통 + 노란 기름방울 경고 라벨 + 새는 기름)
function drawOilDrum(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  // 발밑에 번진 기름 웅덩이 (반짝이는 무지갯빛 테)
  ctx.fillStyle = '#1B1F27';
  ctx.beginPath();
  ctx.ellipse(4, h / 2 - 1, w * 0.72, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(162, 155, 254, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(6, h / 2 - 2, w * 0.4, 2.2, 0, Math.PI * 1.05, Math.PI * 1.7);
  ctx.stroke();

  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.6;
  const bw = w, top = -h / 2 + 4, bot = h / 2 - 3, er = 4;
  // 몸통
  ctx.beginPath();
  ctx.moveTo(-bw / 2, top);
  ctx.lineTo(-bw / 2, bot);
  ctx.ellipse(0, bot, bw / 2, er, 0, Math.PI, 0, true);
  ctx.lineTo(bw / 2, top);
  ctx.closePath();
  const g = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
  g.addColorStop(0, '#495057');
  g.addColorStop(0.35, '#343A40');
  g.addColorStop(1, '#1B1F27');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.stroke();
  // 테 2줄
  ctx.strokeStyle = '#868E96';
  ctx.lineWidth = 2;
  for (const ry of [top + (bot - top) * 0.22, top + (bot - top) * 0.82]) {
    ctx.beginPath();
    ctx.ellipse(0, ry, bw / 2 - 1, er, 0, 0, Math.PI);
    ctx.stroke();
  }
  // 노란 경고 라벨 + 기름방울
  const ly = top + (bot - top) * 0.5;
  ctx.fillStyle = '#FFD43B';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, ly - 7.5);
  ctx.lineTo(7.5, ly);
  ctx.lineTo(0, ly + 7.5);
  ctx.lineTo(-7.5, ly);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.moveTo(0, ly - 4.2);
  ctx.quadraticCurveTo(3.2, ly + 0.5, 0, ly + 3.2);
  ctx.quadraticCurveTo(-3.2, ly + 0.5, 0, ly - 4.2);
  ctx.fill();
  // 옆으로 흘러내리는 기름 한 줄기 (천천히 늘어났다 줄었다)
  const drip = 4 + (Math.sin(Date.now() / 500 + x) * 0.5 + 0.5) * 6;
  ctx.fillStyle = '#12151B';
  ctx.beginPath();
  ctx.roundRect(bw / 2 - 4, top + 1, 3.4, drip + 4, 1.6);
  ctx.arc(bw / 2 - 2.3, top + drip + 5, 2.4, 0, Math.PI * 2);
  ctx.fill();
  // 뚜껑
  ctx.fillStyle = '#495057';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, top, bw / 2, er, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ADB5BD';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(bw * 0.2, top, 2.8, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 광택
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.beginPath();
  ctx.roundRect(-bw / 2 + 3, top + 4, 3, bot - top - 8, 1.5);
  ctx.fill();
  ctx.restore();
}

// 10) 바나나 껍질 — 위에서 본 활짝 벗겨진 껍질 (갈색 반점 + 안쪽 크림색)
function drawPuddle(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((_objHash(x, 3) - 0.5) * 0.6);
  obstacleShadow(ctx, 2, 3, w * 0.42, h * 0.36);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.4;
  ctx.lineJoin = 'round';

  const L = Math.min(w * 0.42, 23);
  const flaps = [
    { a: 205, len: L, wd: L * 0.5 },
    { a: 335, len: L * 0.96, wd: L * 0.5 },
    { a: 100, len: L * 0.72, wd: L * 0.46 },
    { a: 60, len: L * 0.66, wd: L * 0.42 }
  ];
  const flap = (f, inner) => {
    const a = f.a * Math.PI / 180;
    const dx = Math.cos(a), dy = Math.sin(a) * 0.8;
    const px = -Math.sin(a), py = Math.cos(a) * 0.8;
    const k = inner ? 0.42 : 1;
    const len = f.len * (inner ? 0.62 : 1), wd = f.wd * k;
    ctx.beginPath();
    ctx.moveTo(px * wd * 0.5, py * wd * 0.5);
    ctx.bezierCurveTo(dx * len * 0.5 + px * wd, dy * len * 0.5 + py * wd,
                      dx * len + px * wd * 0.35, dy * len + py * wd * 0.35,
                      dx * len, dy * len);
    ctx.bezierCurveTo(dx * len - px * wd * 0.35, dy * len - py * wd * 0.35,
                      dx * len * 0.5 - px * wd, dy * len * 0.5 - py * wd,
                      -px * wd * 0.5, -py * wd * 0.5);
    ctx.closePath();
  };
  // 겉껍질
  for (const f of flaps) {
    flap(f, false);
    ctx.fillStyle = '#FFD43B';
    ctx.fill();
    ctx.stroke();
  }
  // 껍질 끝 갈색
  ctx.fillStyle = '#8B5A2B';
  for (const f of flaps) {
    const a = f.a * Math.PI / 180;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * f.len * 0.97, Math.sin(a) * 0.8 * f.len * 0.97, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // 안쪽 크림색
  for (const f of flaps) {
    flap(f, true);
    ctx.fillStyle = '#FFF3BF';
    ctx.fill();
  }
  // 갈색 반점
  ctx.fillStyle = '#8B5A2B';
  [[-L * 0.6, -3], [L * 0.55, -4], [L * 0.2, L * 0.28], [-L * 0.3, 5]].forEach(([sx, sy], i) => {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 1.8 - i * 0.2, 1.2, i, 0, Math.PI * 2);
    ctx.fill();
  });
  // 가운데 꼭지 (위로 솟은 줄기)
  ctx.fillStyle = '#FAB005';
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#6B4226';
  ctx.beginPath();
  ctx.roundRect(-2.2, -9, 4.4, 8, 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3E2A14';
  ctx.beginPath();
  ctx.ellipse(0, -9, 2.8, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 12) 길 건너는 보행자 & 강아지 — 치면 안 되는 대상.
// 장애물과 헷갈리지 않도록 머리 위 "!" 말풍선 + 발밑 초록 안전 원을 단다.
function drawCrosser(ctx, obs) {
  const w = obs.width;
  const h = obs.height;
  const dir = obs.vx >= 0 ? 1 : -1;
  const swing = Math.sin(obs.step) * 3.2;
  const bob = Math.abs(Math.cos(obs.step)) * 1.6;

  ctx.save();
  ctx.translate(obs.x, obs.y);

  // 발밑 초록 안전 원 (보호 대상 표시)
  ctx.strokeStyle = 'rgba(46, 213, 115, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = -Date.now() / 50;
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 1, w * 0.72, 5.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 1, w / 2 - 2, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.save();
  ctx.translate(0, -bob);
  if (obs.type === 'critter') {
    drawCritterBody(ctx, w, h, dir, swing, obs.tone);
  } else {
    drawWalkerBody(ctx, w, h, dir, swing, obs.tone);
  }
  ctx.restore();

  // "!" 말풍선 (살짝 통통 튄다)
  const by = -h / 2 - 13 - Math.abs(Math.sin(Date.now() / 180)) * 3;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(-8, by - 8, 16, 15, 7);
  ctx.moveTo(-2.5, by + 7);
  ctx.lineTo(0, by + 11);
  ctx.lineTo(2.5, by + 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FF3838';
  ctx.beginPath();
  ctx.roundRect(-1.6, by - 5, 3.2, 6.5, 1.6);
  ctx.arc(0, by + 4, 1.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 노란 모자 쓴 꼬마 (옆모습 인형). tone = 옷 색
function drawWalkerBody(ctx, w, h, dir, swing, tone) {
  ctx.save();
  ctx.scale(dir, 1);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;

  const footY = h / 2 - 1;
  // 다리 (뒤 다리 먼저)
  ctx.lineWidth = 4.2;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.moveTo(-1, h * 0.14); ctx.lineTo(-1 - swing, footY - 2);
  ctx.moveTo(2, h * 0.14); ctx.lineTo(2 + swing, footY - 2);
  ctx.stroke();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#495057';
  ctx.beginPath();
  ctx.moveTo(-1, h * 0.14); ctx.lineTo(-1 - swing, footY - 2);
  ctx.moveTo(2, h * 0.14); ctx.lineTo(2 + swing, footY - 2);
  ctx.stroke();
  // 신발
  ctx.fillStyle = '#FF6B6B';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.6;
  for (const fx of [-1 - swing, 2 + swing]) {
    ctx.beginPath();
    ctx.ellipse(fx + 1.5, footY - 1, 3.2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // 책가방
  ctx.fillStyle = '#FF922B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-9, -h * 0.12, 6, 11, 2.5);
  ctx.fill();
  ctx.stroke();
  // 몸통
  ctx.fillStyle = tone;
  ctx.beginPath();
  ctx.roundRect(-5, -h * 0.14, 11, h * 0.34, 4);
  ctx.fill();
  ctx.stroke();
  // 팔
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3.8;
  ctx.beginPath();
  ctx.moveTo(1, -h * 0.06); ctx.lineTo(1 + swing * 0.8, h * 0.1);
  ctx.stroke();
  ctx.strokeStyle = '#FFD8B5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1, -h * 0.06); ctx.lineTo(1 + swing * 0.8, h * 0.1);
  ctx.stroke();
  // 머리
  const hy = -h * 0.3;
  ctx.fillStyle = '#FFD8B5';
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1, hy, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 노란 안전모자
  ctx.fillStyle = '#FFD43B';
  ctx.beginPath();
  ctx.arc(1, hy - 1, 7.4, Math.PI * 1.02, Math.PI * 1.98);
  ctx.lineTo(10, hy - 1);
  ctx.lineTo(8, hy - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 눈 + 볼터치
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.ellipse(4.5, hy + 1.5, 1.2, 1.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 107, 107, 0.55)';
  ctx.beginPath();
  ctx.arc(3.5, hy + 4.5, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 꼬리 흔드는 강아지 (옆모습). tone = 털 색
function drawCritterBody(ctx, w, h, dir, swing, tone) {
  ctx.save();
  ctx.scale(dir, 1);
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 2;
  const ear = toneDarken(tone);

  const footY = h / 2 - 1;
  // 다리 4개
  ctx.fillStyle = tone;
  [[-7, swing], [-3, -swing], [4, -swing], [8, swing]].forEach(([lx, s]) => {
    ctx.beginPath();
    ctx.roundRect(lx - 2 + s * 0.4, 0, 4, footY - 1, 2);
    ctx.fill();
    ctx.stroke();
  });
  // 꼬리 (살랑살랑)
  const wag = Math.sin(Date.now() / 70) * 0.6;
  ctx.save();
  ctx.translate(-10, -3);
  ctx.rotate(-0.9 + wag);
  ctx.fillStyle = tone;
  ctx.beginPath();
  ctx.roundRect(-2, -9, 4, 10, 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  // 몸통
  ctx.fillStyle = tone;
  ctx.beginPath();
  ctx.ellipse(-1, 0, 11, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 빨간 목걸이 + 금 방울
  ctx.fillStyle = '#FF3838';
  ctx.beginPath();
  ctx.roundRect(6, -5, 3, 9, 1.5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFD43B';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(8.5, 4.5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 머리
  ctx.lineWidth = 2;
  ctx.fillStyle = tone;
  ctx.beginPath();
  ctx.arc(10, -6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 주둥이
  ctx.fillStyle = '#FFF5E6';
  ctx.beginPath();
  ctx.ellipse(15.5, -4, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.arc(18.6, -5, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // 늘어진 귀 (걸을 때 팔랑)
  ctx.fillStyle = ear;
  ctx.save();
  ctx.translate(7, -11);
  ctx.rotate(0.35 + swing * 0.05);
  ctx.beginPath();
  ctx.ellipse(0, 4, 3, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  // 눈
  ctx.fillStyle = OUTLINE_COLOR;
  ctx.beginPath();
  ctx.arc(12, -8, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(12.5, -8.6, 0.55, 0, Math.PI * 2);
  ctx.fill();
  // 혀
  ctx.fillStyle = '#FF8FA3';
  ctx.beginPath();
  ctx.ellipse(15, -0.5, 1.6, 2.2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function toneDarken(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#8D6E63';
  const n = parseInt(m[1], 16);
  const f = c => Math.round(c * 0.72);
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

// 파티클 하나 그리기 (원 / 별 / 색종이 / 충격파 링)
function drawParticle(ctx, p) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, p.alpha);
  ctx.translate(p.x, p.y);
  if (p.shape === 'ring') {
    ctx.strokeStyle = p.color;
    ctx.lineWidth = Math.max(1, 5 * p.alpha);
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.stroke();
  } else if (p.shape === 'star') {
    ctx.rotate(p.rot || 0);
    ctx.fillStyle = p.color;
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 1.2;
    toyStar(ctx, 0, 0, p.size, p.size * 0.45);
    ctx.fill();
    ctx.stroke();
  } else if (p.shape === 'confetti') {
    ctx.rotate(p.rot || 0);
    ctx.scale(1, Math.cos((p.rot || 0) * 2.2));
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size * 0.6, -p.size * 0.3, p.size * 1.2, p.size * 0.6);
  } else if (p.shape === 'drop') {
    ctx.rotate(Math.atan2(p.vy, p.vx) - Math.PI / 2);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 1.6);
    ctx.quadraticCurveTo(p.size, 0, 0, p.size);
    ctx.quadraticCurveTo(-p.size, 0, 0, -p.size * 1.6);
    ctx.fill();
  } else {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 15) 드럼통 충돌 시 화면(카메라 렌즈)에 튄 기름.
// 방울 배치·수명은 game.js의 triggerScreenOil이 정한다. 여기선
//  ① 철퍽! 하고 커졌다 살짝 줄어드는 착지  ② 아래로 흘러내리는 기름 줄기
//  ③ 무지갯빛 기름 광택  ④ 걷힐 때 와이퍼로 닦인 듯 옅어짐 을 그린다.
function drawScreenOilSplatter(ctx, oil) {
  const LIFE = (typeof OIL_LIFE === 'number') ? OIL_LIFE : 110;
  const age = LIFE - oil.life;
  ctx.save();
  for (const b of oil.blobs) {
    const alpha = Math.min(1, oil.life / b.fade);
    if (alpha <= 0) continue;
    // 착지: 0→1.18→1.0
    const t = Math.min(1, age / 9);
    const pop = t < 1 ? (t < 0.6 ? t / 0.6 * 1.18 : 1.18 - (t - 0.6) / 0.4 * 0.18) : 1;
    const r = b.r * pop;
    ctx.globalAlpha = alpha;

    // 흘러내리는 줄기 2가닥
    const drip = Math.min(b.r * 1.7, Math.max(0, age - 8) * 0.55);
    ctx.fillStyle = '#161A21';
    for (const k of [-0.45, 0.3]) {
      const dx = b.x + Math.cos(b.seed + k * 3) * r * 0.35 + k * r * 0.6;
      const len = drip * (k < 0 ? 1 : 0.65);
      if (len <= 1) continue;
      ctx.beginPath();
      ctx.roundRect(dx - r * 0.12, b.y, r * 0.24, len + r * 0.5, r * 0.12);
      ctx.arc(dx, b.y + len + r * 0.5, r * 0.19, 0, Math.PI * 2);
      ctx.fill();
    }
    // 본 방울 + 튄 위성
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    for (let i = 0; i < 5; i++) {
      const a = b.seed + i * 1.37;
      const d = r * (1.05 + (i % 2) * 0.35);
      ctx.moveTo(b.x + Math.cos(a) * d + r * 0.2, b.y + Math.sin(a) * d);
      ctx.arc(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, r * (0.16 + (i % 3) * 0.06), 0, Math.PI * 2);
    }
    ctx.fill();
    // 무지갯빛 기름 광택
    ctx.strokeStyle = 'rgba(162, 155, 254, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r * 0.72, b.seed, b.seed + 1.4);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(85, 239, 196, 0.35)';
    ctx.beginPath();
    ctx.arc(b.x, b.y, r * 0.55, b.seed + 2.2, b.seed + 3.1);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(b.x - r * 0.32, b.y - r * 0.38, r * 0.3, r * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 장난감 기차 세트풍 막대사탕 나무 (둥근 나무 받침 위에 꽂힌 나무)
function drawToyTree(ctx, x, y, leaf, leafHi, fruit) {
  ctx.save();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = OUTLINE_WIDTH;
  // 받침 원판
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.beginPath();
  ctx.ellipse(x + 3, y + 21, 14, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#C8875A';
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 줄기
  ctx.fillStyle = '#9C6644';
  ctx.beginPath();
  ctx.roundRect(x - 3, y, 6, 19, 2);
  ctx.fill();
  ctx.stroke();
  // 둥근 잎 뭉치
  ctx.fillStyle = leaf;
  ctx.beginPath();
  ctx.arc(x, y - 8, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = leafHi;
  ctx.beginPath();
  ctx.arc(x - 3, y - 11, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(x - 7, y - 16, 4, 2.5, -0.6, 0, Math.PI * 2);
  ctx.fill();
  if (fruit) {
    ctx.fillStyle = fruit;
    ctx.lineWidth = 1.5;
    [[x + 7, y - 5], [x - 6, y - 2], [x + 4, y - 15]].forEach(([fx, fy]) => {
      ctx.beginPath();
      ctx.arc(fx, fy, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
  ctx.restore();
}

function drawTree(ctx, x, y) { drawToyTree(ctx, x, y, '#2ECC71', '#58E08F', '#FF4757'); }
function drawMaple(ctx, x, y) { drawToyTree(ctx, x, y, '#F76707', '#FFA94D', '#FFD43B'); }

// 통통한 데이지 (잎 두 장 + 꽃잎 6장)
function drawFlower(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 1.8;
  const hue = _objHash(x, 5);
  const petal = hue < 0.33 ? '#FF6B9D' : hue < 0.66 ? '#FFFFFF' : '#A29BFE';
  ctx.fillStyle = '#2ECC71';
  ctx.beginPath();
  ctx.ellipse(x - 5, y + 8, 5, 2.5, -0.5, 0, Math.PI * 2);
  ctx.ellipse(x + 5, y + 8, 5, 2.5, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = petal;
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 3.6, 2.6, a, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#FFD43B';
  ctx.beginPath();
  ctx.arc(x, y, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
