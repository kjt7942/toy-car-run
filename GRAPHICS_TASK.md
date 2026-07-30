# 그래픽 개선 작업 지시서

## 지금 있는 곳

당신은 `D:\ai_project\toy-car-run-gfx` 폴더에서 작업합니다. (`gfx` 브랜치)

이 폴더는 게임 로직 담당자가 쓰는 `D:\ai_project\toy-car-run`(main 브랜치)과 **완전히 분리된 별도 작업 공간**입니다. 두 사람이 동시에 작업하다 서로의 코드를 덮어쓰는 일을 막기 위한 구조입니다.

**절대 `D:\ai_project\toy-car-run` 폴더는 건드리지 마세요.** 다른 사람이 지금 그 폴더에서 작업 중입니다.

---

## 무엇을 하는 게임인가

세로 화면 자동차 장애물 회피 게임입니다. 차가 화면 아래쪽에 고정되어 있고 도로가 위에서 아래로 흐릅니다. 플레이어는 **좌우로만** 움직여 장애물을 피하고 코인을 먹습니다.

- 캔버스 좌표계는 **360 x 640 고정**입니다 (`GAME_WIDTH` / `GAME_HEIGHT`)
- 도로는 가운데 240px 폭, 양옆은 잔디밭입니다 (`roadX`, `roadWidth`)
- 미술 스타일: **말랑한 장난감 느낌**. 둥근 모서리, 굵은 진회색 외곽선(`#2F3640`), 밝고 채도 높은 색

---

## 담당 범위

### 고쳐도 되는 파일

| 파일 | 내용 |
|---|---|
| `sprites.js` | **주 작업 대상.** 게임 안 그림 전부 (차, 장애물, 아이템, 사람, 동물, 배경) |
| `style.css` | 메뉴·버튼·HUD 등 화면 UI 스타일 |

### 절대 고치면 안 되는 파일

| 파일 | 이유 |
|---|---|
| `game.js` | 게임 규칙·물리·점수. **다른 담당자가 지금 수정 중**이라 건드리면 합칠 때 충돌합니다 |
| `index.html` | HTML 구조가 `game.js`의 요소 ID와 묶여 있습니다 |
| `test_chase.js` | 게임 밸런스 검증용 테스트 |

---

## 지켜야 할 규칙 (중요)

### 1. 충돌 판정 박스 크기를 바꾸지 마세요

`game.js`의 `OBSTACLE_SPECS`에 있는 `w`/`h` 값은 **충돌 판정 크기**이고, 게임 난이도와 직결됩니다. 특히 보행자·동물은 "피할 수 있는가"를 수치로 검증해 맞춰 놓은 값입니다.

```js
walker:  { w: 22, h: 30 },
critter: { w: 26, h: 22 },
```

**그림이 이 박스보다 크거나 작게 삐져나오는 건 괜찮습니다.** 박스 값 자체만 건드리지 마세요. (애초에 `game.js`는 수정 금지이므로, 이 규칙은 "그림을 키우고 싶으니 박스도 키워달라"는 요청을 하지 말라는 뜻입니다.)

### 2. 함수 이름과 인자 순서를 유지하세요

`game.js`가 이 이름 그대로 호출합니다. 바꾸면 게임이 실행되자마자 죽습니다.

```js
drawCone(ctx, x, y, w, h)
drawCrosser(ctx, obs)          // obs.type, obs.tone, obs.step, obs.vx 사용
drawChaser(ctx, c)             // c.kind, c.stun 사용
drawPlayer()                   // 인자 없음. 전역 car 상태를 직접 읽음
```

함수 **안쪽**은 얼마든지 새로 써도 됩니다. 내부 보조 함수를 추가하는 것도 자유입니다.

### 3. 외부 리소스를 쓰지 마세요

이미지 파일, 아이콘 폰트, CDN 링크 전부 금지입니다. 이 게임은 **Canvas2D 명령으로 직접 그리는** 구조이고 오프라인에서 동작해야 합니다. 그라디언트, 그림자, 곡선 등 Canvas API는 자유롭게 쓰세요.

### 4. 60fps를 유지하세요

매 프레임 수십 개가 그려집니다. 프레임마다 무거운 연산(큰 blur, 대량 그림자, 픽셀 조작)은 피하세요.

---

## 그릴 대상 목록 (`sprites.js`)

| 함수 | 대상 | 비고 |
|---|---|---|
| `drawPlayer` | 플레이어 자동차 | 차고에서 고른 색 사용. 부스터·보호막 상태 반영 |
| `drawTrafficCar` | 방해 차량 | 플레이어와 확실히 구분되어야 함 |
| `drawChaser` | 경찰차 | 빨강/파랑 경광등. 화면 아래 어두운 곳에서도 눈에 띄어야 함 |
| `drawCrosser` → `drawWalkerBody` / `drawCritterBody` | 길 건너는 사람 / 동물 | **치면 안 되는 대상**이라 장애물과 확연히 달라 보여야 함 |
| `drawCone` `drawRock` `drawBarrier` `drawOilDrum` `drawPuddle` | 장애물 5종 | 피해야 할 것으로 즉시 읽혀야 함 |
| `drawCoinItem` `drawBoosterItem` `drawShieldItem` `drawMagnetItem` `drawHeartItem` `drawSlowItem` | 아이템 6종 | 먹어야 할 것으로 즉시 읽혀야 함 |
| `drawGate` | 선택 게이트 | 황금(코인 2배) / 초록(안전) |
| `drawCloud` `drawTree` `drawFlower` `drawWindmill` | 배경 장식 | 도로 양옆 잔디밭 |

### 가장 중요한 원칙

**"먹어야 하는 것"과 "피해야 하는 것"이 0.5초 안에 구분되어야 합니다.** 고속으로 스크롤되는 화면이라, 예쁜 것보다 이게 우선입니다. 색·형태·외곽선으로 확실히 갈라주세요.

---

## 확인 방법

### 1. 눈으로 보기

```
cd D:\ai_project\toy-car-run-gfx
python -m http.server 8792
```
브라우저에서 `http://localhost:8792` 접속.

> 스타일이나 스크립트가 바뀌었는데 화면에 반영이 안 되면 **Ctrl+Shift+R**(강력 새로고침)을 누르세요. 브라우저가 예전 파일을 캐시합니다. 실제로 이것 때문에 한참 헤맨 적이 있습니다.

### 2. 게임이 깨지지 않았는지 검사

```
cd D:\ai_project\toy-car-run-gfx
node test_chase.js
```

마지막 줄에 **`ALL OK`** 가 나와야 합니다. 이 테스트는 게임 로직을 실제로 돌려보므로, 함수 이름을 잘못 바꿨거나 문법이 깨졌으면 여기서 걸립니다.

**작업을 끝내기 전에 반드시 한 번 돌려보세요.**

---

## 작업이 끝나면

커밋만 해두면 됩니다. main에 합치는 건 로직 담당자가 처리합니다.

```
cd D:\ai_project\toy-car-run-gfx
git add -A
git commit -m "그래픽 개선: (무엇을 바꿨는지)"
```

`git merge`나 `git push`는 하지 마세요. 합치는 시점은 따로 조율합니다.

---

## 요약

- 작업 폴더: `D:\ai_project\toy-car-run-gfx` (여기서만)
- 고칠 파일: `sprites.js`, `style.css`
- 손대지 말 것: `game.js`, `index.html`, `test_chase.js`, 그리고 옆 폴더 전체
- 끝나기 전에: `node test_chase.js` → `ALL OK` 확인
- 최우선 목표: 먹을 것과 피할 것이 한눈에 구분되는 것
