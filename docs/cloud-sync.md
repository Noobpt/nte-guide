# Firebase 클라우드 동기화

## 운영 구성

- 사이트: https://noobpt.github.io/nte-guide/ (GitHub Pages)
- Firebase: HomeworkGame / homeworkgame-5bc9a, Spark 무료 요금제
- 웹 앱: Game Note · GitHub Pages
- 인증: 기존 Google 제공자, 승인된 도메인 noobpt.github.io 추가
- 데이터: 기존 Standard Firestore, 서울 asia-northeast3
- SDK: Firebase Web 13.0.0, 공식 gstatic CDN에서 지연 로드
- 별도 서버, Cloud Functions, Analytics, 결제 연결 없음

공개 웹 SDK 구성은 클라이언트용 식별자이며 비밀 관리자 키가 아닙니다. 접근 제어는 Firestore 규칙에서 수행합니다. 새 메모장은 프로젝트 소유자의 기존 Firebase UID에 한정됩니다. 다른 Google 계정은 동기화에 사용할 수 없습니다.

## 저장 모델

게임 노트 전용 경로는 gameNoteUsers/{uid}/entries/{entryId}입니다. 기존 games, templates, users 등 다른 앱 데이터와 겹치지 않습니다.

각 숙제 체크, 사용자 숙제, 메모, 숨김 상태, 게임별 초기화 설정, 수동 초기화 번호, 출격 메모 필드, 화면 설정을 별도 문서로 저장합니다. 전체 상태를 한 문서에 덮어쓰지 않습니다.

문서는 schema, rev, op, deleted, value, updatedAt만 가집니다. rev는 트랜잭션에서 1씩 증가하며 updatedAt은 서버 시각입니다. op는 재전송 식별자입니다. 삭제는 value=null인 tombstone으로 남겨 오프라인의 오래된 기록이 다시 생기는 것을 방지합니다.

## 기기 저장·충돌 처리

- 로그인 전 기록: 기존 game-note-v1, 브라우저별 저장
- 로그인 후 보기용 상태: game-note-v1-account-{uid}
- 서버 사본, 전송 대기, 충돌 정보: game-note-v1-cloud-{uid}
- 계정별 저장 공간을 분리하고 로그아웃 시 로그인 전 기록으로 돌아갑니다.
- 클라우드가 처음 비어 있으면 현재 브라우저의 기존 기록을 가져옵니다. 이미 클라우드 기록이 있으면 계정 메뉴에서 이전 기록을 가져올 수 있습니다.
- 클라우드 항목과 겹치는 가져오기는 사용자에게 확인할 충돌로 남깁니다.
- 서로 다른 항목은 병합합니다. 같은 항목의 동시 변경은 이 기기 / 클라우드 선택을 요구하며 메모는 두 사본 모두 보관할 수 있습니다.
- 편집 창을 연 시점의 버전을 기억하므로 편집 중 도착한 다른 기기의 변경도 감지합니다.
- 전송 대기는 localStorage에 먼저 기록합니다. 온라인 복귀·다음 편집·화면 복귀·지금 동기화로 다시 시도합니다.
- 여러 탭은 Web Locks를 지원하면 계정별 잠금으로 대기열을 갱신합니다. 미지원 환경은 탭 내 직렬 처리만 보장합니다.
- 저장 공간이 부족하면 전송을 중단하고 JSON 백업을 안내합니다.
- 오프라인 편집은 이미 열린 페이지에서 가능합니다. 서비스 워커나 오프라인 페이지 설치 기능은 포함하지 않습니다.
- 브라우저 데이터를 지우면 아직 전송하지 않은 기록은 사라질 수 있으므로 먼저 동기화 또는 JSON 백업이 필요합니다.

## 보안 규칙

firestore.rules가 운영 규칙입니다. 익명 및 다른 계정의 notebook 읽기·쓰기는 거부합니다. 소유자만 자기 경로를 읽고 쓸 수 있습니다.

쓰기 시 필드 허용 목록, 유형·길이·범위, 항목 ID와 내용의 일치, 서버 시각, 순차 버전을 검증합니다. 문서 직접 삭제는 허용하지 않습니다. UID나 권한을 문서 데이터에서 신뢰하지 않습니다.

프로젝트의 기존 규칙은 모든 인증 사용자의 접근을 허용하는 구조였습니다. 기존 앱의 동작을 유지하는 예외에서 gameNoteUsers를 명시적으로 제외했습니다. 그 예외가 새 노트 규칙을 우회할 수 없게 했습니다. 이 변경은 기존 앱 전체의 보안 개선을 포함하지 않습니다.

Firebase 콘솔 Rules Playground에서 다음을 확인했습니다.

| 요청 | 결과 |
| --- | --- |
| 비로그인 → 소유자 노트 읽기 | 거부 |
| 소유자 → 본인 노트 읽기 | 허용 |
| 다른 로그인 UID → 소유자 노트 읽기 | 거부 |
| 소유자 → 다른 UID 경로 읽기 | 거부 |

GitHub Pages 배포 성공 및 실제 HTTPS 화면에서 SDK 로딩·로그인 UI를 확인했습니다. 다만 작업 환경의 앱 내 브라우저에서 Google 인증 팝업이 표시되지 않아, 본인 계정 로그인 완료 이후의 실제 쓰기·실시간 수신·로그인 유지 검증은 완료하지 못했습니다. 일반 Chrome·Edge·Safari에서 본인 Google 계정으로 로그인하여 최종 확인해야 합니다. 인증 창이 표시되지 않는 경우의 안내도 앱에 포함했습니다. 로컬 환경은 Firebase CLI 패키지 다운로드와 HTTP 서버 연결을 차단하므로 Emulator 기반 규칙 테스트는 실행하지 못했습니다.

## 구성 파일과 배포

firebase.json / .firebaserc는 규칙 관리를 위한 최소 구성입니다. 사이트 호스팅은 계속 GitHub Pages입니다. 앱 등록과 인증 도메인, 규칙은 Firebase 콘솔에서 적용했습니다.

firestore.indexes.json에는 항목 value의 단일 필드 인덱스 제외 권장 구성이 있습니다. 이 파일은 콘솔에 자동 적용되지 않습니다. 현재 앱은 컬렉션 구독만 사용하며 인덱스 배포 없이 동작합니다. 나중에 CLI를 사용할 경우 현재 프로젝트의 다른 인덱스를 확인한 뒤 필요한 변경만 적용하세요.

검증 명령:

~~~powershell
node --check assets/app.js
node --check assets/cloud.js
node --check assets/sync-core.js
node --test tests/core.test.cjs tests/sync.test.cjs
~~~

테스트는 초기화·가져오기·검증에 더해 독립 변경 병합, 동시 수정, 삭제 충돌, 전송 도중 편집, 재전송, 오래된 스냅샷, 계정 분리, 열린 편집창 충돌을 확인합니다.

배포 시 CSS/JavaScript URL에 버전을 붙여 기존 브라우저 캐시와 새 코드가 섞이는 문제를 방지합니다.
