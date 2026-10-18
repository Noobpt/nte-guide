/* Research snapshot: 2026-10-18. Sources are explicit; personal routines are labelled. */
(function(){
'use strict';
const sources={
 'nte-daily':{title:'GameWith · 이환 일일·주간 루틴',url:'https://gamewith.jp/nte/554134',type:'공략',date:'2026-10-18',note:'일일 활약도, 이상 순례, 도시 활력, 도시 생활 항목을 교차 확인.'},
 'nte-reset':{title:'GameWith · 이환 날짜 변경',url:'https://gamewith.jp/nte/559197',type:'공략',date:'2026-10-18',note:'일본 가이드의 05시 안내를 한국 계정에 단정 적용하지 않음. 기본은 수동 초기화.'},
 'nte-13':{title:'이환 공식 · 1.3 업데이트',url:'https://nte.perfectworld.com/kr/article/news/gamenews/20260817/263607.html',type:'공식',date:'2026-10-18',note:'타이쿤 프로젝트 지원금 공유 및 이상 가구 일괄 수령. 기존 자료도 함께 보존.'},
 'nte-14':{title:'이환 공식 · 1.4 업데이트',url:'https://nte.perfectworld.com/kr/article/news/gamenews/20260929/264413.html',type:'공식',date:'2026-10-18',note:'1.4 기준 상설 콘텐츠와 기간 이벤트를 구별.'},
 'nte-pass':{title:'GameWith · 헌터 보급',url:'https://gamewith.jp/nte/558622',type:'공략',date:'2026-10-18',note:'일일·주간 임무와 시즌 보상 수령.'},
 'arc-20':{title:'Embark · Frozen Trail 2.0 패치 노트',url:'https://arcraiders.com/news/frozen-trail-2-0-update',type:'공식',date:'2026-10-18',note:'10월 8일 개편: Cred → Reward Points, Feats 3난도, 주간 달성 단계 4/8/12. 탄약 구매 한도와 주간 상인도 확인.'},
 'arc-pass':{title:'Embark · Reward Pass 안내',url:'https://arcraiders.com/news/frozen-trail-reward-pass',type:'공식',date:'2026-10-18',note:'진행할 패스를 활성화하는 구조. 기존 Raider Deck은 Legacy Pass로 이전.'},
 'arc-trials':{title:'Embark · Trials Season 6',url:'https://arcraiders.com/news/trials-season-6',type:'공식',date:'2026-10-18',note:'현재 시즌의 주간 Trials 존재 확인. 매주 바뀌는 목표는 게임 화면을 따름.'},
 'arc-first':{title:'Embark 지원 · 첫 출격',url:'https://id.embark.games/arc-raiders/support/faq/135-your-first-raid-1759328782',type:'공식',date:'2026-10-18',note:'장비 손실, Safe Pocket, 무료 로드아웃의 기본 규칙.'},
 'arc-loadout':{title:'ARC Raiders Wiki · 로드아웃',url:'https://arcraiders.wiki/wiki/Free_Loadout',type:'위키',date:'2026-10-18',note:'무료 로드아웃에는 Safe Pocket이 없다는 점 교차 확인.'},
 'arc-prep':{title:'Epic Games · 출격 장비·생존 가이드',url:'https://store.epicgames.com/news/arc-raiders-guide-12-tips-help-survive-rust-belt?lang=en-US',type:'가이드',date:'2026-10-18',note:'장비·소모품·탈출 구조를 준비 목록으로 재구성. 수량과 조합은 개인 선택.'},
 'arc-21':{title:'Embark · 2.1 패치 노트',url:'https://arcraiders.com/news/store-update-2-1-0',type:'공식',date:'2026-10-18',note:'10월 13일 변경 확인. 기간 한정 PvE 시험을 상설 규칙으로 넣지 않음.'},
 'wuwa-30':{title:'Kuro Games · 명조 3.0 패치 노트',url:'https://wutheringwaves.kurogames.com/en/main/news/detail/3920',type:'공식',date:'2026-10-18',note:'데이터 스테이션 Lv.30의 코스트 4 강화 흡수 주 20회, 주간 콘텐츠 무료 보상 2회 확인.'},
 'wuwa-32':{title:'Kuro Games · 명조 3.2 패치 노트',url:'https://wutheringwaves.kurogames.com/en/main/news/detail/4447',type:'공식',date:'2026-10-18',note:'주간 도전의 잔여 보상 횟수 표시 확인.'},
 'wuwa-modes':{title:'Prydwen · 명조 콘텐츠 구조',url:'https://www.prydwen.gg/wuthering-waves/guides/game-modes',type:'공략',date:'2026-10-18',note:'주간 보스 보상·플레이트 소비와 상설 도전 구조.'},
 'wuwa-beginner':{title:'Prydwen · 명조 기본 시스템',url:'https://www.prydwen.gg/wuthering-waves/guides/beginner-guide',type:'공략',date:'2026-10-18',note:'일일 활약도 100, 별의 소리 60 및 플레이트.'},
 'wuwa-weekly':{title:'Daily Reset · 명조 반복 콘텐츠',url:'https://dailyreset.games/games/wuthering-waves/checklist/',type:'커뮤니티',date:'2026-10-18',note:'주간 활성도 공유 트랙, 선약 방송국, 시즌 콘텐츠를 참고. 에코 15회 고정 안내는 공식 3.0 공지로 보정.'},
 'wuwa-clock':{title:'명조 Wiki · 서버 초기화',url:'https://wutheringwaves.fandom.com/wiki/Reset',type:'위키',date:'2026-10-18',note:'Asia UTC+8, 서버 04시 / 월요일. 한국에서는 05시. 다른 서버는 설정 변경.'},
 'zzz-32':{title:'HoYoverse · 젠존제 3.2 업데이트',url:'https://zenless.hoyoverse.com/en-us/news/166000?catchSpider=1&lang=en-us&page=news',type:'공식',date:'2026-10-18',note:'현재 버전 콘텐츠와 주기성 콘텐츠 구별.'},
 'zzz-ridu':{title:'HoYoverse · Ridu Weekly 갱신 규칙',url:'https://zenless.hoyoverse.com/en-us/news/127445',type:'공식',date:'2026-10-18',note:'주간 일정은 월요일 서버 04시 갱신.'},
 'zzz-routine':{title:'Daily Reset · 젠존제 반복 콘텐츠',url:'https://dailyreset.games/games/zenless-zone-zero/checklist/',type:'커뮤니티',date:'2026-10-18',note:'일일 일정·비디오 가게·신문·배터리·제로 공동. 격주 콘텐츠는 주간에서 분리.'},
 'zzz-coffee':{title:'젠존제 Wiki · Coff Cafe',url:'https://zenless-zone-zero.fandom.com/wiki/Coff_Cafe',type:'위키',date:'2026-10-18',note:'커피별 회복량이 다름. Tin Master Special 80, Espresso 60.'},
 'zzz-boss':{title:'Game8 · 노토리우스 무료 보상',url:'https://game8.co/games/Zenless-Zone-Zero/archives/460224',type:'공략',date:'2026-10-18',note:'주간 무료 보상 3회. 이후 배터리 소비를 무료 횟수와 구별.'},
 'zzz-weekly':{title:'Icy Veins · Ridu Weekly',url:'https://www.icy-veins.com/zenless-zone-zero/ridu-weekly',type:'공략',date:'2026-10-18',note:'주간 일정과 누적 보상 수령.'},
 'zzz-clock':{title:'젠존제 Wiki · 일간·주간 활동',url:'https://zenless-zone-zero.fandom.com/wiki/Activity',type:'위키',date:'2026-10-18',note:'Asia 서버 04시(한국 05시) 기준. 서버별 UTC 오프셋 사용.'}
};
sources['wuwa-gateways']={title:'명조 Wiki · 수많은 문의 환상',url:'https://wutheringwaves.fandom.com/wiki/Fantasies_of_the_Thousand_Gateways',type:'위키',date:'2026-10-18',note:'한국어 콘텐츠명 교차 확인.'};
const games=[
{id:'nte',name:'이환',en:'NEVERNESS TO EVERNESS',short:'NTE',color:'#5479dd',soft:'#edf1ff',subtitle:'도시의 일상, 놓치지 않게.',version:'1.4 자료 대조',notice:'카페·가구는 누적 생산을 점검하는 루틴입니다. 타이쿤 지원금은 핑크퍼스·배구·전시가 공유하며, 주간 숙제와 별도 회차로 관리합니다.',resetNote:'한국 계정의 초기화 시각을 확정할 공식 근거가 부족해 기본은 수동입니다. 게임에서 확인한 시각을 설정하면 자동 체크 초기화를 사용할 수 있습니다.'},
{id:'arc',name:'아크 레이더스',en:'ARC RAIDERS',short:'ARC',color:'#cd602c',soft:'#fff0e6',subtitle:'챙기고, 출격하고, 돌아오기.',version:'2.0 개편 · 2.1 대조',notice:'10월 8일 이후 Feats는 Reward Points를 줍니다. 주간 달성 단계는 4·8·12이며, 주간 Trials와 별개입니다. 출격 준비는 매 판 직접 새로 시작합니다.',resetNote:'Feats·Trials의 최신 한국 기준 초기화 시각은 확인되지 않아 수동입니다. 주간 목표·타이머는 게임 화면을 우선하세요.'},
{id:'wuwa',name:'명조',en:'WUTHERING WAVES',short:'WUWA',color:'#388878',soft:'#e7f4ee',subtitle:'공명자를 위한 작은 루틴.',version:'상설 루틴 · 3.0 변경 반영',notice:'주간 보스는 보상 수령 총 3회입니다. 무료 에코 보상 2회와 데이터 스테이션의 강화 흡수는 서로 다른 제한입니다.',resetNote:'Asia 기준 매일 05:00 KST, 월요일 05:00 KST. 설정에서 서버 시간대와 초기화 시각을 바꿀 수 있습니다.'},
{id:'zzz',name:'젠레스 존 제로',en:'ZENLESS ZONE ZERO',short:'ZZZ',color:'#a18322',soft:'#faf3d8',subtitle:'뉴에리두에 접속하기 전.',version:'3.2 자료 대조',notice:'노토리우스 사냥 무료 보상 3회와 리두 위클리를 챙기세요. 시유 방어전·위험한 강습전은 주간 초기화와 별도로 관리합니다.',resetNote:'Asia 기준 매일 05:00 KST, 월요일 05:00 KST. 다른 서버에서는 설정의 UTC 오프셋을 변경하세요.'}
];
const tasks=[];
function add(game,id,cycle,title,detail,sourcesList=[],extra={}){tasks.push({id:game+'-'+id,game,cycle,title,detail,sources:sourcesList,target:1,optional:false,...extra});}
for(const t of window.NTE_LEGACY_TASKS){
 const extraSources=t.links.map((url,i)=>{const id='nte-legacy-'+t.id+'-'+i;if(!sources[id])sources[id]={title:'이환 기존 자료 · '+t.title,url,type:'기존 공략',date:'2026-10-05',note:'기존 프로젝트의 출처를 보존했습니다. 계정·버전에 따라 달라지는 제한은 게임에서 확인하세요.'};return id;});
 add('nte',t.id,t.cycle,t.title,t.action,['nte-daily',...extraSources],{legacyId:t.id,target:t.id==='weekly-boss'?3:1,optional:t.group.startsWith('optional-'),where:t.where,quota:t.quota,kind:['daily-cafe','daily-home','daily-fish'].includes(t.id)?'점검 루틴':'게임 과제'});
}
const pool=tasks.find(t=>t.legacyId==='daily-pool');pool.detail='소원을 빌어 웅! 코인을 모읍니다. 서버 일일 초기화와 별도로 재이용 시간이 표시될 수 있으므로 연못의 남은 시간을 확인하세요.';pool.kind='개별 재이용';
add('nte','pass-daily','daily','헌터 보급 일일 보상','오늘 자연스럽게 달성한 일일 임무와 보급 보상을 수령합니다. 시즌 최대 레벨을 달성했다면 숨겨도 됩니다.',['nte-pass'],{optional:true});
add('nte','pass-weekly','weekly','헌터 보급 주간 임무·보상','주간 경험치 한도와 아직 받지 않은 보상을 확인합니다. 일일·주간 누적과 시즌 임무를 구별합니다.',['nte-pass'],{optional:true});
add('nte','tycoon','rotation','타이쿤 프로젝트 지원금','핑크퍼스·배구·땅땅땅 전시는 하나의 지원금을 공유합니다. 회차 종료 시각을 확인하고 다음 회차에 직접 체크를 비우세요.',['nte-13','nte-daily'],{quota:'14일 회차 · 공용 한도'});
add('nte','orbit','rotation','궤도 너머 · 진행 중인 회차','현재 회차의 도전과 달성 보상을 확인합니다. 이벤트·회차 종료 시각은 게임 화면을 따릅니다.',['nte-14'],{quota:'게임 내 회차 기준'});
add('nte','shop','rotation','월간 교환·기간 이벤트','월간 교환권과 진행 중인 이벤트 보상을 확인합니다. 이미 끝난 이벤트는 숙제에 넣지 않습니다.',['nte-daily'],{quota:'월간·이벤트별 마감'});
add('arc','feats','daily','오늘의 Feats 진행','오늘 할 수 있는 과제를 선택하고 완료를 확인합니다. Easy / Medium / Hard는 각각 15 / 25 / 50 Reward Points와 주간 진행도 1 / 2 / 3을 줍니다.',['arc-20'],{quota:'가능한 목표부터'});
add('arc','pass','daily','진행할 Reward Pass 확인','Frozen Trail 또는 Legacy 중 진행할 패스를 확인합니다. 획득한 포인트는 현재 활성화한 패스에 적용됩니다.',['arc-pass','arc-20'],{kind:'점검 루틴'});
add('arc','ammo-shop','daily','한정 탄약 재고 확인','Launcher Ammo와 Energy Clips에는 일일 구매 한도가 있습니다. 사용하는 장비의 탄약이 부족할 때만 구매합니다.',['arc-20'],{optional:true,kind:'선택 구매'});
add('arc','milestones','weekly','Feats 주간 달성 보상','주간 진행도 4 → 8 → 12의 세 단계를 확인합니다. 단계마다 250 Reward Points를 받습니다. 완료한 단계 수를 기록하세요.',['arc-20'],{target:3,quota:'3단계 · 4 / 8 / 12'});
add('arc','trials','weekly','주간 Trials 목표·보상','이번 주 교체된 Trials에서 원하는 보상과 랭크 목표를 진행합니다. 실제 점수·달성 조건과 남은 시간은 Trials 화면에서 확인합니다.',['arc-trials'],{quota:'현재 주차 목표 기준'});
add('arc','envoys','weekly','Nomadic Envoys 교환 확인','이번 주 판매·교환 품목 중 필요한 것만 확인합니다. 2.0 이후 일부 무기도 주간 상인 순환에 포함됩니다.',['arc-20'],{optional:true,kind:'선택 구매'});
add('arc','season','rotation','Trials 시즌·Reward Pass 마감','시즌 순위 보상과 현재 패스의 진행 상태를 확인합니다. 시즌 종료와 주간 갱신은 별개입니다.',['arc-trials','arc-pass'],{quota:'시즌별 · 직접 초기화'});
add('arc','goal','raid','이번 판 목적·맵 확인','퀘스트, 재료 수집, Trials 중 이번 출격의 목표를 정하고 대상 맵과 현재 조건을 확인합니다.',['arc-trials','arc-prep'],{kind:'출격 준비'});
add('arc','weapon','raid','무기 상태·탄종·탄약','장착 무기의 내구도와 탄종, 필요한 탄약을 확인합니다. 잃어도 감당할 수 있는 장비를 준비하세요.',['arc-prep','arc-first'],{kind:'출격 준비'});
add('arc','shield','raid','증강 장비·실드 호환','현재 증강 장비에서 사용할 수 있는 실드인지, 실드 상태와 가방 용량이 적절한지 확인합니다.',['arc-prep'],{kind:'출격 준비'});
add('arc','healing','raid','회복·실드 충전·퀵 슬롯','회복 아이템과 실드 충전 수단을 준비하고 사용할 소모품을 퀵 슬롯에 배치합니다. 필요 수량은 출격 목적에 맞춰 조절합니다.',['arc-prep'],{kind:'출격 준비'});
add('arc','safe','raid','Safe Pocket·반입 귀중품','사용 중인 장비의 Safe Pocket 유무를 확인합니다. 무료 로드아웃에는 Safe Pocket이 없습니다. 불필요한 귀중품은 창고에 둡니다.',['arc-first','arc-loadout'],{kind:'출격 준비'});
add('arc','quest-kit','raid','퀘스트 추적·필수 도구','퀘스트를 수락·추적하고 필요한 열쇠·도구를 준비합니다. 촬영을 요구하는 퀘스트라면 실제 카메라를 반입해야 합니다.',['arc-20'],{kind:'출격 준비'});
add('arc','space','raid','가방 무게·빈칸 확보','직전 출격 전리품을 내려놓고 목표 아이템을 담을 여유를 남깁니다.',['arc-prep'],{kind:'개인 준비 루틴'});
add('arc','exit','raid','탈출 계획·필요 열쇠','탈출 지점과 대안 경로를 생각해 두고, 열쇠가 필요한 탈출을 계획했다면 준비 여부를 확인합니다. 실제 이용 가능 여부는 출격 후 다시 확인하세요.',['arc-prep','arc-first'],{kind:'개인 준비 루틴'});
add('arc','squad','raid','파티·매칭·음성 설정','솔로·파티 구성을 확인하고 동료와 목표를 맞춥니다. 매칭 모드와 음성·핑 설정도 출격 전에 점검합니다.',['arc-prep','arc-21'],{kind:'개인 준비 루틴'});
add('wuwa','activity','daily','일일 활약도 100 · 보상 수령','가이드북의 활약도 100을 채우고 별의 소리 60을 포함한 보상을 모두 수령합니다. 필요한 임무를 골라 진행하세요.',['wuwa-beginner'],{quota:'활약도 100'});
add('wuwa','waveplate','daily','결정 웨이브 플레이트 사용','현재 육성에 필요한 재료·돌파·무음 구역 등에 사용합니다. 주간 보스에 쓴 플레이트도 포함하며, 매일 초기화되는 재화는 아닙니다.',['wuwa-modes','wuwa-beginner'],{kind:'점검 루틴'});
add('wuwa','podcast-daily','daily','선약 방송국 일일 임무·보상','평소 플레이로 완료한 일일 임무와 달성 보상을 수령합니다. 방송 레벨이 끝났다면 숨길 수 있습니다.',['wuwa-weekly']);
add('wuwa','subscription','daily','월정액 접속 보상','월정액을 이용 중일 때만 당일 접속 보상을 확인합니다.',['wuwa-weekly'],{optional:true,quota:'구독한 경우만'});
add('wuwa','boss','weekly','주간 도전 보상 3회','필요한 스킬 재료를 주는 보스에서 보상을 받습니다. 보스별 3회가 아닌 주간 총 3회이며, 보상 수령 시 회당 플레이트 60이 필요합니다.',['wuwa-modes','wuwa-32'],{target:3,quota:'총 3회 · 회당 60'});
add('wuwa','activity-weekly','weekly','주간 활성도 · 누적 보상','주간 콘텐츠에서 공유하는 활성도 보상 트랙을 확인합니다. 모든 모드를 각각 완주하기보다 필요한 보상 단계까지 진행하고 수령하세요.',['wuwa-weekly'],{quota:'보상 트랙 기준'});
add('wuwa','free-echo','weekly','수많은 문의 환상 · 무료 보상 2회','수많은 문의 환상(Fantasies of the Thousand Gateways)의 보상 장치에서 제공하는 주간 무료 보상 기회입니다. 수령 화면의 무료 잔여 횟수를 확인하세요.',['wuwa-30','wuwa-gateways'],{target:2,quota:'플레이트 없는 보상 · 총 2회'});
add('wuwa','podcast-weekly','weekly','선약 방송국 주간 임무·보상','플레이트 사용·주간 도전 등 겹치는 목표를 진행하고 주간 경험치와 레벨 보상을 확인합니다.',['wuwa-weekly']);
add('wuwa','echo','weekly','데이터 스테이션 강화 흡수','필요한 코스트 4 에코가 있을 때 사용합니다. 3.0 공식 공지 기준 데이터 스테이션 Lv.30에서는 주간 기회가 20회이며, 계정의 실제 남은 횟수를 따릅니다.',['wuwa-30'],{optional:true,quota:'계정 레벨·잔여 횟수 확인'});
add('wuwa','shops','weekly','주간 상점·재료 교환','육성에 필요한 지역 상점과 한정 교환만 확인합니다. 모든 상점을 구매할 필요는 없습니다.',['wuwa-weekly'],{optional:true});
add('wuwa','tower','rotation','역경의 탑 · 현재 회차','갱신되는 구역의 목표와 보상을 확인합니다. 고정 주간 숙제가 아니므로 게임 내 회차 종료 후 직접 초기화합니다.',['wuwa-weekly','wuwa-modes'],{quota:'회차별 종료 시각 확인'});
add('wuwa','wastes','rotation','기간형 전투 도전·교환','Whimpering Wastes 등 열려 있는 기간형 도전과 잔진의 산호 교환을 확인합니다. 버전·회차 갱신을 달력상 월초와 혼동하지 않도록 합니다.',['wuwa-weekly'],{quota:'버전·콘텐츠별 마감'});
add('zzz','activity','daily','일일 일정 · 보상 수령','활약도를 채우고 폴리크롬 60을 포함한 일일 보상을 받습니다. 달성과 보상 수령을 모두 확인하세요.',['zzz-routine'],{quota:'보상 수령까지'});
add('zzz','coffee','daily','커피 수령','오늘의 커피를 마시고 회복량·이벤트 효과를 확인합니다. Tin Master Special은 배터리 80, Espresso는 60과 추가 효과가 있으므로 메뉴를 구별하세요.',['zzz-coffee']);
add('zzz','battery','daily','배터리 사용','현재 육성 목표에 맞는 모의 실전·정기 소탕·전문가 도전 등에 사용합니다. 배터리는 계속 회복되므로 초기화 임무와 구별합니다.',['zzz-routine'],{kind:'점검 루틴'});
add('zzz','scratch','daily','신문 가판대 스크래치','오늘의 스크래치 보상을 확인합니다.',['zzz-routine']);
add('zzz','video','daily','Random Play 영업·수익','누적 수익을 받고 비디오와 홍보 담당을 확인한 뒤 영업을 진행합니다.',['zzz-routine'],{kind:'점검 루틴'});
add('zzz','membership','daily','인터넷 회원 접속 보상','월정액 이용 중일 때 당일 폴리크롬 보상을 수령합니다.',['zzz-routine'],{optional:true,quota:'구독한 경우만'});
add('zzz','trust','daily','에이전트 신뢰도·초대','육성하려는 에이전트의 대화·초대가 남아 있을 때 진행합니다.',['zzz-32','zzz-routine'],{optional:true});
add('zzz','boss','weekly','노토리우스 사냥 무료 3회','핵심 스킬에 필요한 재료를 골라 주간 무료 보상을 총 3회 받습니다. 무료 횟수 이후의 배터리 소비 도전은 별개입니다.',['zzz-boss'],{target:3,quota:'총 3회 · 무료 보상'});
add('zzz','hollow','weekly','제로 공동 · 주간 보상','현재 이용 가능한 제로 공동 모드에서 주간 현상·조사 목표와 보상 수령을 확인합니다. 모드별로 같은 보상을 중복 계산하지 않습니다.',['zzz-routine'],{quota:'게임 내 주간 목표 기준'});
add('zzz','ridu','weekly','리두 위클리 · 누적 보상','주간 목표로 점수를 채운 뒤 누적 단계 보상까지 수령합니다. 일일 일정·제로 공동과 겹치는 목표를 확인하세요.',['zzz-ridu','zzz-weekly']);
add('zzz','fund','weekly','리두 펀드 주간 임무·보상','주간 경험치 목표와 레벨 보상을 확인합니다. 펀드 시즌 종료 시각은 일반 주간 초기화와 별개입니다.',['zzz-routine']);
add('zzz','store','weekly','141 편의점 재고 확인','필요한 육성 재료만 구매합니다. 재료가 충분하면 이번 주는 생략해도 됩니다.',['zzz-routine'],{optional:true});
add('zzz','shiyu','rotation','시유 방어전 · 격변 구간','현재 격변 구간의 도전·달성 보상을 확인합니다. 회차 종료는 게임 타이머를 따르고, 다음 회차에 직접 체크를 비우세요.',['zzz-routine'],{quota:'주간과 별도 회차'});
add('zzz','assault','rotation','위험한 강습전 · 현재 회차','가능한 점수·별 보상까지 진행합니다. 주간 초기화에 체크를 자동으로 지우지 않습니다.',['zzz-routine'],{quota:'주간과 별도 회차'});
add('zzz','monthly','rotation','월간 신호 상점·교환','월간 테이프·방부 관련 교환과 전초기지 보급의 한정 재고를 확인합니다. 상점별 갱신 주기는 해당 화면을 우선합니다.',['zzz-routine'],{quota:'월간 / 상점별 마감'});
window.GameNoteData={checkedAt:'2026-10-18',games,sources,tasks};
})();
