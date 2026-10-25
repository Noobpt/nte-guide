# 상시선물 가이드의 공식 캐릭터 이미지

확인일: 2026-10-25. 제공 주체: 이환 공식 사이트 / Hotta Studio·Perfect World Games.

## 확보 방법

[공식 한국어 메인 페이지](https://nte.perfectworld.com/kr/main.html)의 캐릭터 소개 순서와 한국어 이름 이미지를 대조하고, 해당 페이지가 사용하는 [공식 CSS](https://nte.perfectworld.com/public/style/public_main261021.css)의 `role-tab-*` 이미지 주소를 추출했다. 작은 캐릭터 선택용 PNG 원본을 내려받았으며 재생성·합성·파일 크롭·리사이즈하지 않았다.

18개 파일, 총 1,166,678바이트(약 1.11 MiB). 원본은 138×278픽셀로 위·아래 두 선택 상태가 있는 세로 스프라이트다. UI의 정사각형 프레임에서 `object-fit: cover; object-position: center top`으로 위쪽 상태를 표시한다. 파일 경로·원본 주소·표시 위치는 `assets/nte-gift-portraits.js` 한 곳에서 관리한다.

## 확보 목록

원본 주소의 공통 접두사: `https://nte.perfectworld.com/public/images/`

| 캐릭터 | 고정 ID | 원본 경로 |
| --- | --- | --- |
| 구원 | guwon | main260402/role-tab-jiuyuan.png |
| 나나리 | nanally | main260402/role-tab-nanally.png |
| 다포딜 | daffodill | main260402/role-tab-dfde.png |
| 라크리모사 | lacrimosa | main260603/role-tab-an.png |
| 레이븐 | raven | main260930/role-tab-heiyu.png |
| 링코 | linko | main260909/role-tab-lingke.png |
| 민트 | mint | main260402/role-tab-mint.png |
| 백장 | baicang | main260402/role-tab-baicang.png |
| 사키리 | sakiri | main260402/role-tab-zaowu.png |
| 신쿠 | xinku | main260708/role-tab-zhen.png |
| 일로이 | iloy | main260729/role-tab-yi.png |
| 잔홍 | zhanhong | main260819/role-tab-canhong.png |
| 치즈 | chiz | main260402/role-tab-xiaozhi.png |
| 카오스 | chaos | main260618/role-tab-ka.png |
| 파디아 | fadia | main260402/role-tab-fadiya.png |
| 하토르 | hathor | main260402/role-tab-hasuoer.png |
| 호토리 | hotori | main260513/role-tab-xun.png |
| 아카네 린 | akane-rin | main261021/role-tab-mingyin.png |

## 미확보와 대체 표시

아들러(adler), 에드가(edgar), 우미츠키(umitsuki), 스키아(skia), 하니엘(haniel)은 확인한 공식 메인 캐릭터 소개 목록에 작은 썸네일이 없다. 공식 공지에는 캐릭터명이 확인되지만, 이름과 일대일로 검증할 수 있는 소형 초상화 원본은 이번 조사에서 확보하지 못했다. 확인되지 않은 이미지를 추정하여 배정하지 않고 이름 대체 표시를 사용한다. 확보한 이미지의 로딩 실패도 같은 대체 표시를 사용한다.

## 검증

- 공식 페이지의 캐릭터 소개·한국어 이름과 썸네일 클래스를 연결했다. 다포딜·카오스·일로이·잔홍은 이름 PNG도 직접 열어 확인했다.
- PNG 파일 시그니처와 크기, 매핑의 로컬 파일 존재를 검사한다.
- 캐릭터 전체 출시 여부나 선물 정보의 정확성 검증과 이미지 매핑 검증은 별개다.
- 이 문서는 공식 출처 기록이며 이미지에 대한 별도 재배포 라이선스 허가를 주장하지 않는다.
