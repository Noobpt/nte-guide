/* Original NTE routines retained for migration and reference. */
window.NTE_LEGACY_TASKS = [
  {
    "id": "daily-core",
    "cycle": "daily",
    "priority": "우선",
    "title": "본성 픽셀 소비 + 일일 활약도 보상",
    "where": "탐색 가이드 → 육성 재료·일일 임무",
    "quota": "활약도 100 달성 후 수령",
    "action": "필요한 재료 던전을 돌고, 부족한 활약도만 채워 보상을 받습니다. 본성 픽셀은 6분에 1씩 회복됩니다.",
    "tip": "주간 이상 순례에 쓴 픽셀도 오늘 소비량에 포함합니다. 일일 임무를 별도로 전부 돌 필요는 없습니다.",
    "source": "dailyjp",
    "group": "daily",
    "links": [
      "https://gamewith.jp/nte/554134"
    ]
  },
  {
    "id": "daily-cafe",
    "cycle": "daily",
    "priority": "우선",
    "title": "별미 카페 수익 수령·재고 확인",
    "where": "도시 타이쿤 → 별미 카페 관리",
    "quota": "누적 수익·재고 관리",
    "action": "수익을 받고 다음 접속까지 재료가 충분한지 확인합니다. 자정에 정해진 돈이 생기는 임무와는 다릅니다.",
    "tip": "관리 Lv.40 이후 자동 보충을 이용 중이면 재구매 대신 설정과 잔액을 확인하세요. 낮은 단계에서는 24·72시간 보충으로 방문을 줄일 수 있습니다.",
    "source": "cafe",
    "group": "daily",
    "links": [
      "https://gamewith.jp/nte/552013"
    ]
  },
  {
    "id": "daily-home",
    "cycle": "daily",
    "priority": "우선",
    "title": "이상 가구 보상 한 번에 받기",
    "where": "부동산 → 이상 가구 지원",
    "quota": "해금·생산 완료 가구만",
    "action": "일괄 수령으로 햄스터 볼·나무 상자 등에서 받을 수 있는 보상을 모읍니다. 미니 붐붐 구름도 생산이 끝났을 때 함께 받습니다.",
    "tip": "집을 한 채씩 돌 필요가 없습니다. 구름은 단계별 생산 주기가 달라 ‘매일 몽몽솜 1개’로 고정 계산하지 않습니다.",
    "source": "p13,furniture,cloud",
    "group": "daily",
    "links": [
      "https://nte.perfectworld.com/kr/article/news/gamenews/20260817/263607.html",
      "https://gamewith.net/nte/75412",
      "https://www.kaiden.gg/nte/anomaly-furniture/compressed-boom-boom-cloud/"
    ]
  },
  {
    "id": "daily-pool",
    "cycle": "daily",
    "priority": "추천",
    "title": "나쿠펜다 연못에서 소원 빌기",
    "where": "지도 → 나쿠펜다 연못",
    "quota": "하루 1회",
    "action": "소원 빌기로 웅! 코인을 모읍니다. S급 아크 교환이 목표라면 동전 줍기 선택과 구별하세요.",
    "tip": "웅! 코인 100개 교환을 목표로 꾸준히 방문하고, 원하는 교환을 마친 뒤에는 우선순위를 낮춰도 됩니다.",
    "source": "pool,visit",
    "group": "daily",
    "links": [
      "https://gamewith.net/nte/74174",
      "https://www.inven.co.kr/board/nte/6518/73"
    ]
  },
  {
    "id": "daily-witch",
    "cycle": "daily",
    "priority": "추천",
    "title": "마녀의 집 점술",
    "where": "지도 → 마녀의 집 텔레포트",
    "quota": "일일 이용분",
    "action": "축복·일화·보물찾기 중 필요한 점술을 확인합니다. 이미 끝낸 일회성 탐색 보상을 일일 수익으로 합산하지 않습니다.",
    "tip": "전투할 날에는 점술을 먼저 확인하면 이동 한 번으로 이후 전투에도 활용할 수 있습니다.",
    "source": "witch",
    "group": "daily",
    "links": [
      "https://gamewith.net/nte/74160"
    ]
  },
  {
    "id": "daily-bagel",
    "cycle": "daily",
    "priority": "추천",
    "title": "베이글 교류·좋아요잼 확인",
    "where": "메뉴 → 베이글 → 보상·상점",
    "quota": "일일 교류 보상",
    "action": "조회·좋아요·댓글 등 교류 보상을 챙깁니다. 가이드 기준 조회 5회·좋아요 3회·댓글 3회로 최대 2,000 좋아요잼을 모을 수 있습니다.",
    "tip": "게시물을 직접 올리지 않아도 교류로 획득 가능합니다. 1.3의 우편 보급 56,000개는 일회성으로, 매일 받는 수입이 아닙니다.",
    "source": "bagel,p13",
    "group": "daily",
    "links": [
      "https://gamewith.net/nte/76018",
      "https://nte.perfectworld.com/kr/article/news/gamenews/20260817/263607.html"
    ]
  },
  {
    "id": "daily-bond",
    "cycle": "daily",
    "priority": "선택",
    "title": "육성 중인 캐릭터의 호감도 일과",
    "where": "인연 → 교류·도시 산책·선물하기",
    "quota": "해금·잔여 일일 횟수 확인",
    "action": "일일 도시 산책이 열린 캐릭터부터 진행하고, 선물은 올릴 대상과 예산을 정해 줍니다. 초기 공략의 횟수보다 현재 선물 화면의 제한을 우선하세요.",
    "tip": "1.4 일괄 선물은 편의 기능입니다. 매일 모든 캐릭터에게 최고가 선물을 사 줄 필요는 없습니다. 가격표는 호감도 선물 페이지에만 모았습니다.",
    "source": "date,dailyjp,p14",
    "group": "optional-daily",
    "links": [
      "https://gamewith.net/nte/75410",
      "https://gamewith.jp/nte/554134",
      "https://nte.perfectworld.com/kr/article/news/gamenews/20260929/264413.html"
    ]
  },
  {
    "id": "daily-chiz",
    "cycle": "daily",
    "priority": "선택",
    "title": "치즈의 추가 폰즈 획득",
    "where": "치즈 조작 → 필드 전투",
    "quota": "치즈 보유·당일 획득 한도",
    "action": "치즈의 일반 공격 길게 누르기를 활용해 폰즈를 챙깁니다. 별도 이동보다 필요한 필드 재료를 모으는 중에 병행하세요.",
    "tip": "성장에 필요한 재료·가구 강화 재료가 없다면 긴 필드 순회는 생략해도 됩니다. 한도에 도달한 뒤 수입이 계속 늘 것으로 계산하지 않습니다.",
    "source": "dailyjp",
    "group": "optional-daily",
    "links": [
      "https://gamewith.jp/nte/554134"
    ]
  },
  {
    "id": "daily-animals",
    "cycle": "daily",
    "priority": "선택",
    "title": "일로이로 동물과 교류",
    "where": "일로이 보유 → 필드의 고양이·강아지",
    "quota": "일일 최대 3회 · 누적 상한 있음",
    "action": "일로이의 특성으로 성장 아이템을 받을 수 있는 계정만 진행합니다. 보상에는 누적 999회 상한도 있습니다.",
    "tip": "같은 동물에게 3회 교류할 수 있어 세 곳을 이동할 필요가 없습니다. 출현 시간과 맑은 날씨를 확인하세요.",
    "source": "animals",
    "group": "optional-daily",
    "links": [
      "https://gamewith.net/nte/77231"
    ]
  },
  {
    "id": "daily-fish",
    "cycle": "daily",
    "priority": "선택",
    "title": "낚시하는 날만 어시장 판매",
    "where": "바다 낚시꾼 → 어시장·어류 보관함",
    "quota": "남은 보관시간·매입 수량·도시 활력 확인",
    "action": "낚시할 날에 오늘의 매입 대상을 먼저 확인합니다. 이미 가진 대상 어류는 남은 시간 안에 판매하고, 다음 날 고가 매입을 기대하며 쌓아 두지는 마세요.",
    "tip": "어시장 보너스는 낚시 재화인 비늘 코인 쪽의 이점입니다. 폰즈만 필요하다면 추가 낚시의 이동·미끼·시간을 들이기보다 편한 도시 활력 활동을 고르세요. 판매에 쓴 활력은 주간 잔량에 포함합니다.",
    "source": "fishing,fish-market,city",
    "group": "optional-daily",
    "links": [
      "https://gamewith.net/nte/74127",
      "https://game8.co/games/Neverness-to-Everness/archives/597605",
      "https://gamewith.net/nte/74104"
    ]
  },
  {
    "id": "daily-patrol",
    "cycle": "daily",
    "priority": "선택",
    "title": "치안 활동·분실물 제출",
    "where": "도시의 범칙 행위·시민 → 치안소",
    "quota": "각 활동의 당일 한도 확인",
    "action": "동선에서 만난 범칙 행위를 처리하고 분실물을 제출합니다. 전용 교환 재화가 필요한 동안만 우선하면 됩니다.",
    "tip": "상점의 일회성 환석 교환을 매일 갱신되는 보상으로 보지 마세요. 이동 시간이 길어지면 후순위입니다.",
    "source": "dailyjp",
    "group": "optional-daily",
    "links": [
      "https://gamewith.jp/nte/554134"
    ]
  },
  {
    "id": "weekly-boss",
    "cycle": "weekly",
    "priority": "우선",
    "title": "이상 순례 보상 3회",
    "where": "탐색 가이드 → 이상 순례",
    "quota": "주간 보상 수령 총 3회",
    "action": "육성할 캐릭터의 이능 강화 재료를 확인하고 맞는 보스를 선택합니다. 횟수는 보스마다 3회가 아니라 주간 보상 한도를 기준으로 관리합니다.",
    "tip": "본성 픽셀을 소비하므로 일일 던전 대신 진행해도 됩니다. 보상 난이도를 올릴 수 있는 주에는 성장 후 도전하되 초기화 직전까지 미루지 마세요.",
    "source": "daily",
    "group": "weekly",
    "links": [
      "https://gamewith.net/nte/74144"
    ]
  },
  {
    "id": "weekly-city",
    "cycle": "weekly",
    "priority": "우선",
    "title": "남은 도시 활력 소비",
    "where": "도시 일상 → 시내 배송·낚시·미니게임 등",
    "quota": "주간 충전되는 하나의 공용 잔량",
    "action": "월요일 갱신 전 잔량을 사용합니다. 낚시·배송·리듬게임 등을 전부 할 필요는 없고, 자신에게 편한 방식으로 같은 잔량을 소모하면 됩니다.",
    "tip": "처음에는 우편함을 성장시키는 일반 배송, 이후에는 조작이 익숙하고 한 번에 많이 소모되는 활동을 고르세요. 농작물 판매도 이 잔량을 씁니다.",
    "source": "city,farm",
    "group": "weekly",
    "links": [
      "https://gamewith.net/nte/74104",
      "https://gamewith.net/nte/77471"
    ]
  },
  {
    "id": "weekly-mammon",
    "cycle": "weekly",
    "priority": "추천",
    "title": "주택 마몬의 주간 폰즈 보상",
    "where": "부동산 → 마몬 이상 가구",
    "quota": "주간 보상 상한까지",
    "action": "해금한 마몬에 도전해 이번 주 보상을 챙깁니다. 주택의 마몬 보상과 별도 전투 콘텐츠를 구별하세요.",
    "tip": "재도전으로 기록이 좋아지면 차액 보상을 받을 수 있습니다. 최고 보상을 이미 받았다면 반복 처치할 필요가 없습니다.",
    "source": "mammon",
    "group": "weekly",
    "links": [
      "https://gamewith.jp/nte/560066"
    ]
  },
  {
    "id": "weekly-delivery",
    "cycle": "weekly",
    "priority": "추천",
    "title": "오래된 우편함의 특별 시내 배송",
    "where": "주택 오래된 우편함 / 시내 배송 화면",
    "quota": "주 1회",
    "action": "우편함을 통해 특별 의뢰를 완료합니다. 도시 활력을 쓰는 일반 배송과 별도 보상입니다.",
    "tip": "이번 주에 우편함을 더 강화할 계획이면 강화 후 특별 의뢰를 진행하세요. 이 의뢰는 도시 활력을 소비하지 않습니다.",
    "source": "delivery",
    "group": "weekly",
    "links": [
      "https://gamewith.jp/nte/555621"
    ]
  },
  {
    "id": "weekly-volley",
    "cycle": "weekly",
    "priority": "선택",
    "title": "배구 스타 주간 리그 확인",
    "where": "도시 일상 → 배구 스타 → 주간 리그",
    "quota": "주간 리그 · 지원금은 공유",
    "action": "진행할 리그 목표가 있거나 지원금이 남았을 때 플레이합니다. 이벤트 전용 보상과 상설 콘텐츠의 수익을 구분하세요.",
    "tip": "여기서 받는 폰즈는 핑크퍼스·땅땅땅 전시와 같은 타이쿤 프로젝트 지원금에서 나옵니다. 남은 지원금부터 확인하세요.",
    "source": "p13,p14",
    "group": "optional-weekly",
    "links": [
      "https://nte.perfectworld.com/kr/article/news/gamenews/20260817/263607.html",
      "https://nte.perfectworld.com/kr/article/news/gamenews/20260929/264413.html"
    ]
  },
  {
    "id": "weekly-auction",
    "cycle": "weekly",
    "priority": "선택",
    "title": "에비스 경매 갱신 품목 확인",
    "where": "메인 3장 이후 → 에비스 경매",
    "quota": "주간 판매 품목 갱신",
    "action": "가구 강화·수집 목표가 있다면 판매품을 확인합니다. 구경과 구매는 다른 선택이므로 무조건 구매하지 않아도 됩니다.",
    "tip": "마몬 강화처럼 이후 반복 보상을 늘리는 품목을 우선 검토하세요. 도시 타이쿤용 자금을 전부 소진하지는 마세요.",
    "source": "daily,mammon",
    "group": "optional-weekly",
    "links": [
      "https://gamewith.net/nte/74144",
      "https://gamewith.jp/nte/560066"
    ]
  },
  {
    "id": "weekly-safes",
    "cycle": "weekly",
    "priority": "선택",
    "title": "주간 재생성 금고 수거",
    "where": "필드 → 주간 갱신 대상 금고",
    "quota": "주간 재생성 대상만",
    "action": "위치를 아는 반복 금고를 가까운 동선에서 수거합니다. 탐색 중 여는 모든 보물상자가 주간 재생성되는 것은 아닙니다.",
    "tip": "보상보다 이동 시간이 큰 곳은 생략해도 됩니다. 고정 수입 총액을 단정하지 않고 이번 주 열린 금고만 확인하세요.",
    "source": "daily",
    "group": "optional-weekly",
    "links": [
      "https://gamewith.net/nte/74144"
    ]
  },
  {
    "id": "weekly-shed",
    "cycle": "weekly",
    "priority": "선택",
    "title": "에이본 창고 보급 수령",
    "where": "에이본 숙소 근처 도구 창고",
    "quota": "해금 후 주간 보급",
    "action": "관련 일화로 창고를 해금한 계정에서 전투 지원 아이템을 받습니다. 잠겨 있다면 일화 진행이 먼저입니다.",
    "tip": "에이본 방문 동선에 묶으면 됩니다. 해당 아이템이 충분하면 우선순위를 낮춰도 됩니다.",
    "source": "daily",
    "group": "optional-weekly",
    "links": [
      "https://gamewith.net/nte/74144"
    ]
  }
];
