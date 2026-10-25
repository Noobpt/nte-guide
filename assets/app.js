(function(){
'use strict';
const C=window.GameNoteCore,D=window.GameNoteData,$=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const game=id=>D.games.find(g=>g.id===id),gameName=id=>game(id)?.name||'공통',cycleName={daily:'일간',weekly:'주간',rotation:'별도 주기',raid:'출격 준비'};
const style=g=>`--game:${g.color};--soft:${g.soft}`,uid=prefix=>prefix+'-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10));
let state,view='routines',selected='all',cycle='daily',query='',noteKind='all',undoState=null,pendingImport=null,storageError='',recoveryRaw=null,writeBlocked=false,migratedOnLoad=false;
let guideRoute=null,guideQuery='',guideSort='gain';
const expanded=new Set();
let activeStoreKey=C.KEY;
try{
 const raw=localStorage.getItem(C.KEY);
 if(raw){try{state=C.parseBackup(raw);}catch(e){recoveryRaw=raw;writeBlocked=true;storageError='저장된 기록을 읽지 못했습니다. 원본은 유지되어 있습니다. 설정에서 원본을 내려받거나 정상 백업을 복원하세요. 현재 변경은 임시 보관됩니다.';state=C.createState();}}
 else{const legacy=localStorage.getItem(C.LEGACY_KEY);if(legacy){try{state=C.migrateLegacy(JSON.parse(legacy),D.tasks);migratedOnLoad=state.migrated;}catch{state=C.createState();storageError='이전 이환 체크 기록을 읽지 못했습니다. 기존 기록은 그대로 보존했습니다.';}}else state=C.createState();}
}catch{state=C.createState();storageError='브라우저 저장소를 사용할 수 없습니다. 기록은 현재 화면에서만 유지됩니다. 나가기 전에 JSON 백업을 내려받으세요.';}
const allTasks=()=>[...D.tasks,...state.customTasks];
const getTask=id=>allTasks().find(t=>t.id===id);
const activeTasks=(g,c)=>allTasks().filter(t=>t.game===g&&t.cycle===c&&!state.hiddenTasks.includes(t.id)&&(state.settings.showOptional||!t.optional));
const matches=t=>!query||[t.title,t.detail,t.where,gameName(t.game)].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase());
function save(sync=true,overrides={}){state.updatedAt=new Date().toISOString();if(!writeBlocked){try{localStorage.setItem(activeStoreKey,JSON.stringify(state));storageError='';}catch{storageError='저장 공간이 부족하거나 저장이 차단되었습니다. 현재 기록은 화면에 남아 있습니다. JSON 백업으로 보관하세요.';}}if(sync)window.GameNoteCloud?.record(state,overrides);storageStatus();}
function storageStatus(){
 $('storage-state').textContent=storageError?'저장 상태 확인 필요':(window.GameNoteCloud?.label()||'이 브라우저에 저장');
 $('storage-warning').hidden=!storageError;$('storage-warning').textContent=storageError;
}
function toast(message,undo=false){$('toast-text').textContent=message;$('undo-button').hidden=!undo;$('toast').hidden=false;if($('editor').open){let feedback=$('dialog-content').querySelector('.dialog-feedback');if(!feedback){feedback=document.createElement('p');feedback.className='dialog-feedback';feedback.setAttribute('role','status');$('dialog-content').querySelector('.dialog-head').after(feedback);}feedback.textContent=message;}}
function change(fn,message='',canUndo=false,overrides={}){undoState=canUndo?C.clone(state):null;fn();save(true,overrides);render();if(message)toast(message,canUndo);else if(!$('toast').hidden)$('undo-button').hidden=true;}
function route(nextView,nextGame='all'){if(nextView==='raid')nextGame='arc';location.hash=nextView+'/'+nextGame;}
function readRoute(event){
 const [v,g]=(location.hash.slice(1)||'routines/all').split('/');
 guideRoute=window.GameGuideCore.parseGuideRoute(location.hash);
 view=guideRoute?'guides':['routines','raid','notes','sources'].includes(v)?v:'routines';
 selected=guideRoute?guideRoute.game:C.GAMES.includes(g)?g:'all';
 if(view==='raid')selected='arc';query='';guideQuery='';guideSort='gain';render();
 if(event?.type==='hashchange'){$('main').focus({preventScroll:true});window.scrollTo(0,0);}
}
function dateLabel(){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric',weekday:'short'}).format(new Date());}
function resetLabel(g,c,short=false){const next=C.nextReset(state,g,c);if(next===null)return c==='rotation'?'회차 종료 후 직접 초기화':c==='raid'?'출격마다 직접 초기화':'직접 초기화';const left=Math.max(1,Math.ceil((next-Date.now())/60000)),d=Math.floor(left/1440),h=Math.floor(left%1440/60),m=left%60;const remain=d?`${d}일 ${h}시간`:h?`${h}시간 ${m}분`:`${m}분`;return (short?'':'다음 초기화 ')+remain;}
function taskSources(task){return (task.sources||[]).filter(id=>D.sources[id]).map(id=>{const s=D.sources[id];return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.type)} · ${esc(s.title)} ↗</a>`;}).join('');}
function renderNav(){
 const items=[['routines','▦','숙제 모아보기'],['raid','↗','출격 준비'],['notes','▤','메모 · 팁'],['guides','⊙','공략 · 자료']];
 const activeView=view==='sources'?'guides':view;
 $('main-nav').innerHTML=items.map(([v,icon,title])=>`<button type="button" data-action="navigate" data-view="${v}" class="${activeView===v?'active':''}" ${activeView===v?'aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${icon}</span>${title}${v==='notes'&&state.notes.length?`<span class="nav-count">${state.notes.length}</span>`:''}</button>`).join('');
 $('game-nav').innerHTML=D.games.map(g=>`<button type="button" data-action="game" data-game="${g.id}" class="${selected===g.id?'active':''}" style="${style(g)}" ${selected===g.id?'aria-current="true"':''}><span class="game-dot" aria-hidden="true"></span>${g.name}<span class="nav-arrow" aria-hidden="true">›</span></button>`).join('');
 $('today').textContent=dateLabel()+' · KST';$('breadcrumb').textContent=view==='raid'?'ARC Raiders · 출격 준비':selected==='all'?'전체 게임':gameName(selected);
}
function renderHeading(){
 $('eyebrow').hidden=false;$('add-button').hidden=false;document.title='게임 노트 · 나의 플레이 기록';
 const heading={routines:[selected==='all'?'A LITTLE LESS TO REMEMBER':game(selected).en,selected==='all'?'오늘의 플레이 노트':gameName(selected)+' 플레이 노트',selected==='all'?'할 일은 한곳에, 남은 시간은 게임에.':game(selected).subtitle,'숙제 추가','add-task'],raid:['READY WHEN YOU ARE','출격 전, 한 번 더','이번 판에 필요한 것만 확인하고 출발하세요.','항목 추가','add-task'],notes:['THOUGHTS WORTH KEEPING','기억해 둘 플레이','생각난 팁과 다음 목표를 짧게 적어 두세요.','메모 작성','add-note'],sources:['CHECKED, NOT GUESSED','확인한 자료들','공식 변경 사항을 우선하고, 다른 주기의 콘텐츠는 따로 관리합니다.','설정 · 백업','settings']}[view];
 $('eyebrow').textContent=heading[0];$('page-title').innerHTML=esc(heading[1])+'<span>.</span>';$('page-subtitle').textContent=heading[2];$('add-button').dataset.action=heading[4];$('add-button').innerHTML='<span aria-hidden="true">＋</span>'+esc(heading[3]);
 $('overview').hidden=view!=='routines';
 if(view==='routines')$('overview').innerHTML=D.games.map(g=>{const p=C.progress(state,activeTasks(g.id,cycle));return `<button type="button" class="overview-card ${selected===g.id?'selected':''}" style="${style(g)}" data-action="select-game" data-game="${g.id}" aria-label="${g.name} ${cycleName[cycle]} ${p.done}/${p.total}개 완료" aria-pressed="${selected===g.id}"><div class="card-top"><span class="game-emblem">${g.short}</span><h2>${g.name}</h2><span class="arrow" aria-hidden="true">↗</span></div><div class="card-stats"><strong>${p.done}<small> / ${p.total}</small></strong><span>${cycleName[cycle]} 완료</span></div><div class="progress-track" aria-hidden="true"><i style="width:${p.percent}%"></i></div><div class="card-caption"><span>${p.total&&p.done===p.total?'목록 완료':p.total-p.done+'개 남음'}</span><span data-clock-game="${g.id}" data-clock-cycle="${cycle}">${resetLabel(g.id,cycle,true)}</span></div></button>`;}).join('');
}
function searchBox(placeholder='숙제 검색'){return `<label class="search"><span aria-hidden="true">⌕</span><input type="search" id="search" value="${esc(query)}" placeholder="${placeholder}" aria-label="${placeholder}"></label>`;}
function gameSelect(){return `<select id="game-filter" aria-label="게임 필터" class="button small"><option value="all" ${selected==='all'?'selected':''}>전체 게임</option>${D.games.map(g=>`<option value="${g.id}" ${selected===g.id?'selected':''}>${g.name}</option>`).join('')}</select>`;}
function renderToolbar(){
 if(view==='routines')$('view-toolbar').innerHTML=`<div class="toolbar"><div class="tabs" role="group" aria-label="숙제 주기">${['daily','weekly','rotation'].map(c=>`<button type="button" data-action="cycle" data-cycle="${c}" class="${cycle===c?'active':''}" aria-pressed="${cycle===c}">${cycleName[c]}${c==='rotation'?' · 시즌':''}</button>`).join('')}</div><div class="toolbar-right">${searchBox()}<label class="switch"><input id="show-optional" type="checkbox" ${state.settings.showOptional?'checked':''}> 선택도 보기</label><label class="switch"><input id="hide-done" type="checkbox" ${state.settings.hideDone?'checked':''}> 완료 숨기기</label></div></div>`;
 else if(view==='notes')$('view-toolbar').innerHTML=`<div class="toolbar"><div class="tabs" role="group" aria-label="메모 종류">${[['all','모든 기록'],['note','메모'],['tip','팁']].map(([k,l])=>`<button type="button" data-action="note-kind" data-kind="${k}" class="${noteKind===k?'active':''}" aria-pressed="${noteKind===k}">${l}</button>`).join('')}</div><div class="toolbar-right">${searchBox('메모 검색')}${gameSelect()}</div></div>`;
 else if(view==='sources')$('view-toolbar').innerHTML=`<div class="toolbar">${gameSelect()}${searchBox('자료 검색')}</div>`;
 else $('view-toolbar').innerHTML='';
}
function taskHTML(t){const value=C.taskValue(state,t),done=value>=t.target;return `<article class="task ${done?'done':''}" data-task-id="${t.id}"><div class="task-line"><label class="task-check"><input type="checkbox" id="check-${t.id}" data-task="${t.id}" ${done?'checked':''} aria-label="${esc(t.title)} 완료"></label><div class="task-text"><label class="task-title" for="check-${t.id}">${esc(t.title)}</label><div class="task-meta">${t.optional?'<span class="tag optional">선택</span>':''}${t.custom?'<span class="tag">내 숙제</span>':''}${t.kind&&t.kind!=='게임 과제'?`<span class="tag">${esc(t.kind)}</span>`:''}<span>${esc(t.quota|| (t.target>1?`총 ${t.target}회`:'보상·완료 확인'))}</span></div></div>${t.target>1?`<div class="counter"><button type="button" id="minus-${t.id}" data-action="count" data-id="${t.id}" data-delta="-1" aria-label="${esc(t.title)} 1회 줄이기" ${value===0?'disabled':''}>−</button><span aria-live="polite">${value}/${t.target}</span><button type="button" id="plus-${t.id}" data-action="count" data-id="${t.id}" data-delta="1" aria-label="${esc(t.title)} 1회 추가" ${done?'disabled':''}>＋</button></div>`:''}</div><details class="task-details" data-expand="${t.id}" ${expanded.has(t.id)?'open':''}><summary>상세${t.custom?'':' · 출처'}</summary><p>${esc(t.detail)}</p>${t.where?`<p><b>위치</b> ${esc(t.where)}</p>`:''}<div class="source-chips">${taskSources(t)}</div><div class="task-actions">${t.custom?`<button type="button" data-action="edit-task" data-id="${t.id}">수정</button><button type="button" data-action="delete-task" data-id="${t.id}">삭제</button>`:`<button type="button" data-action="hide-task" data-id="${t.id}">내 목록에서 숨기기</button>`}</div></details></article>`;}
function gamePanel(g,c){const tasks=activeTasks(g.id,c),p=C.progress(state,tasks),visible=tasks.filter(t=>matches(t)&&(!state.settings.hideDone||C.taskValue(state,t)<t.target)),hidden=allTasks().filter(t=>t.game===g.id&&t.cycle===c&&state.hiddenTasks.includes(t.id)).length;return `<section class="game-panel" style="${style(g)}" aria-label="${g.name} ${cycleName[c]}"><div class="panel-head"><div class="panel-identity"><span class="game-emblem">${g.short}</span><div><h2>${g.name}</h2><small>${g.en}</small></div></div><div class="panel-total"><span class="count-pill">${p.done} / ${p.total}</span></div></div><div class="panel-subhead"><strong>${cycleName[c]} 체크리스트</strong><button type="button" class="panel-reset" data-action="reset" data-game="${g.id}" data-cycle="${c}" aria-label="${g.name} ${cycleName[c]} 새로 시작">↻ 새로 시작</button></div><div class="task-list">${visible.length?visible.map(taskHTML).join(''):`<div class="empty">${query?'검색 결과가 없습니다.':p.total&&p.done===p.total?'목록의 모든 체크를 마쳤습니다.':'표시할 항목이 없습니다. 필요한 숙제를 추가하세요.'}</div>`}</div><div class="panel-foot"><span data-clock-game="${g.id}" data-clock-cycle="${c}">${resetLabel(g.id,c)}</span><button type="button" data-action="add-task" data-game="${g.id}" data-cycle="${c}">＋ 내 숙제</button>${hidden?`<button type="button" data-action="settings">숨긴 항목 ${hidden}</button>`:''}</div></section>`;}
function renderRoutines(){const gs=selected==='all'?D.games:[game(selected)];return `${selected!=='all'?`<div class="single-intro"><span class="intro-mark" aria-hidden="true">↳</span><p>${esc(game(selected).notice)}</p>${selected==='nte'?'<a href="#guides/nte/gifts">캐릭터별 상시선물 보기 ↗</a>':''}${selected==='arc'?'<a href="#raid/arc">출격 준비 열기 ↗</a>':''}</div>`:''}${cycle==='rotation'?'<p class="rotation-note">이 목록은 월간·격주·시즌 등 서로 다른 주기를 모아 둔 곳입니다. 자동 초기화하지 않으며, 새 회차가 시작된 항목만 체크를 해제하세요. 전체 회차를 비울 때만 ‘새로 시작’을 사용하세요.</p>':''}<div class="list-grid" ${selected!=='all'?'style="grid-template-columns:1fr"':''}>${gs.map(g=>gamePanel(g,cycle)).join('')}</div><div class="quick-note"><span class="note-icon" aria-hidden="true">▤</span><div><p>다음에 할 일, 잊기 전에.</p><small>장비 목표부터 생각난 팁까지, 짧게 남겨 두세요.</small></div><button type="button" class="button small" data-action="add-note">메모 남기기 ↗</button></div>`;}
function renderRaid(){const ts=activeTasks('arc','raid'),p=C.progress(state,ts);return `<div class="raid-banner"><div><p class="eyebrow">ARC RAIDERS / PRE-FLIGHT</p><h2>${p.total&&p.done===p.total?'준비 확인 완료.':'챙길 것부터, 하나씩.'}</h2><p>새 출격 버튼은 체크만 비웁니다. 아래 준비 메모는 유지됩니다.</p></div><div class="raid-score">${p.done}<small> / ${p.total}</small></div></div><div class="raid-layout"><div>${gamePanel(game('arc'),'raid')}<div class="dialog-hint" style="margin-top:12px">출격 준비는 장비·탈출 규칙을 바탕으로 만든 개인 점검 목록입니다. 게임의 일일 보상 조건이 아닙니다.</div></div><form id="raid-form" class="form-panel"><h2>이번 출격 메모</h2><p class="help">맵과 목표, 가져올 물건을 정해 두세요.</p>${[['map','목적지 · 맵','예: 댐 전장'],['objective','이번 판 목표','예: 퀘스트 진행 / 필요한 재료'],['loadout','장비 · 챙길 도구','무기, 탄약, 카메라, 열쇠…'],['exit','탈출 계획','주 경로와 대안 경로']].map(([k,l,h])=>`<label class="field"><span>${l}</span><input name="${k}" maxlength="2000" placeholder="${h}" value="${esc(state.raid[k])}"></label>`).join('')}<label class="field"><span>추가 메모</span><textarea name="memo" maxlength="2000" placeholder="남겨 둘 내용을 적어 주세요.">${esc(state.raid.memo)}</textarea></label><div class="backup-actions"><button type="submit" class="button primary">출격 메모 저장</button><button type="button" class="button" data-action="new-raid">↻ 새 출격</button></div></form></div>`;}
function renderNotes(){const notes=state.notes.filter(n=>(selected==='all'||n.game===selected)&&(noteKind==='all'||n.kind===noteKind)&&(!query||(n.title+' '+n.body).toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.updatedAt.localeCompare(a.updatedAt));
if(!notes.length)return `<div class="empty note-empty"><span class="empty-icon" aria-hidden="true">▤</span><h2>${query?'찾는 기록이 없습니다.':'아직 비어 있는 노트입니다.'}</h2><p>${query?'다른 검색어로 찾아보세요.':'팁은 필요할 때 하나씩.<br>다음 육성 목표나 기억할 내용을 먼저 적어 보세요.'}</p><button type="button" class="button primary" data-action="add-note">첫 기록 남기기</button></div>`;
return `<div class="note-grid">${notes.map(n=>{const g=game(n.game)||{color:'#64795b',soft:'#edf2e6'};return `<article class="note-card" style="${style(g)}"><div class="note-labels"><span class="game-tag">${gameName(n.game)}</span><span>${n.kind==='tip'?'팁':'메모'}</span>${n.pinned?'<span>· 고정됨</span>':''}</div><h2>${esc(n.title)}</h2><p class="note-body">${esc(n.body)}</p><div class="note-actions"><small>${esc(n.updatedAt.slice(0,10))}</small><button type="button" class="${n.pinned?'pinned':''}" data-action="pin-note" data-id="${n.id}" aria-label="${esc(n.title)} ${n.pinned?'고정 해제':'고정'}">${n.pinned?'◆':'◇'}</button><button type="button" data-action="edit-note" data-id="${n.id}" aria-label="${esc(n.title)} 열기와 수정">열기</button><button type="button" data-action="delete-note" data-id="${n.id}" aria-label="${esc(n.title)} 삭제">삭제</button></div></article>`;}).join('')}</div>`;}
function renderSources(){const used=new Set(D.tasks.filter(t=>selected==='all'||t.game===selected).flatMap(t=>t.sources));for(const id of Object.keys(D.sources))if(selected==='all'||id.startsWith(selected+'-'))used.add(id);let entries=Object.entries(D.sources).filter(([id,s])=>used.has(id)&&(!query||(s.title+' '+s.note).toLowerCase().includes(query.toLowerCase())));
const card=([id,s])=>`<article class="source-card ${id.includes('-legacy-')?'legacy-source':''}"><div class="source-type"><span>${esc(s.type)}</span><span>${esc(s.date)} 확인</span></div><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><p>${esc(s.note)}</p></article>`;
return `<p class="source-intro"><a href="#guides/all">공략 · 자료 목록</a> · <a href="#guides/nte/gifts">이환 캐릭터별 상시선물</a></p><p class="source-intro">2026년 10월 18일에 확인한 자료를 바탕으로 반복 과제를 정리했습니다. 공식 패치에서 변경된 규칙을 먼저 적용했고, 상설 시스템은 공략·위키와 대조했습니다. 이 목록은 실시간 연동되지 않으므로 실제 잔여 횟수·보상·마감은 게임 화면이 기준입니다.</p><div class="research-alert"><b>확인해서 반영한 차이</b><br>ARC Raiders: 기존 Cred 기준 대신 2.0의 Reward Points와 주간 달성 3단계.<br>명조: 강화 흡수 횟수를 무조건 15회로 고정하지 않음. Lv.30 변경과 무료 보상 2회를 구별.<br>젠존제: 커피별 회복량 구별, 시유·위험한 강습전을 주간 자동 초기화에서 제외.<br>이환: 누적 수익과 초기화 보상을 구별하고 타이쿤 지원금을 공용 회차로 관리.</div><div class="source-grid">${entries.filter(([id])=>!id.includes('-legacy-')).map(card).join('')}</div><details class="section-caption" style="display:block"><summary>보존한 이환 기존 자료 · 세부 출처</summary><p class="dialog-hint" style="margin-top:12px"><a href="nte-routines-legacy.html">기존 이환 숙제·팁 원문</a> · <a href="이환_상시_호감도_선물.html">호감도 선물표</a> — 기존 페이지의 체크는 새 노트와 별도로 저장됩니다.</p><div class="source-grid">${entries.filter(([id])=>id.includes('-legacy-')).map(card).join('')}</div></details>`;}
function renderContent(){const oldFocus=document.activeElement?.id,selection=document.activeElement?.selectionStart;
// Preserve the unsaved raid memo across checklist updates.
const raidBase=$('raid-form')?._syncBase;let raidDraft=null;if(view==='raid'&&$('raid-form'))raidDraft=Object.fromEntries(new FormData($('raid-form')));
$('view-content').innerHTML=view==='routines'?renderRoutines():view==='raid'?renderRaid():view==='notes'?renderNotes():renderSources();
if($('raid-form'))$('raid-form')._syncBase=raidBase||window.GameNoteCloud?.capture()||{};
if(raidDraft&&$('raid-form'))for(const [key,value]of Object.entries(raidDraft))$('raid-form').elements[key].value=value;
if(oldFocus&&$(oldFocus)){try{$(oldFocus).focus({preventScroll:true});if(typeof selection==='number')$(oldFocus).setSelectionRange(selection,selection);}catch{}}
}
function renderGuidePage(){
 const focus=document.activeElement,focusId=focus?.id,start=focus?.selectionStart,end=focus?.selectionEnd;
 const page=window.GameGuidesUI.render({...guideRoute,query:guideQuery,sort:guideSort});
 $('eyebrow').hidden=true;$('page-title').textContent=page.title;$('page-subtitle').textContent=page.subtitle;
 $('breadcrumb').textContent=page.breadcrumb;$('add-button').hidden=true;$('overview').hidden=true;
 $('view-toolbar').innerHTML=page.toolbar;$('view-content').innerHTML=page.content;
 document.title=page.title+' · 게임 노트';
 document.querySelectorAll('[data-guide-portrait]').forEach(img=>{if(img.complete&&!img.naturalWidth)img.hidden=true;});
 if(focusId&&$(focusId)){const next=$(focusId);next.focus({preventScroll:true});if(typeof start==='number'&&typeof next.setSelectionRange==='function')next.setSelectionRange(start,end);}
}
function render(){const focusId=document.activeElement?.id;renderNav();
 document.body.classList.toggle('guide-view',view==='guides');$('cloud-panel').hidden=view==='guides';
 if(view==='guides')renderGuidePage();else{renderHeading();renderToolbar();renderContent();}
 storageStatus();if(focusId&&$(focusId)&&!$(focusId).disabled)$(focusId).focus({preventScroll:true});}
function dialog(title,subtitle,body){$('dialog-content').innerHTML=`<div class="dialog-head"><div><h2 id="dialog-title">${esc(title)}</h2><p>${esc(subtitle)}</p></div><button type="button" class="dialog-close" data-action="close-dialog" aria-label="닫기">×</button></div>${body}`;if(!$('editor').open)$('editor').showModal();}
function gameOptions(value,common=false){return `${common?`<option value="all" ${value==='all'?'selected':''}>공통 메모</option>`:''}${D.games.map(g=>`<option value="${g.id}" ${g.id===value?'selected':''}>${g.name}</option>`).join('')}`;}
function taskEditor(task=null,presetGame=null,presetCycle=null){const t=task||{id:'',game:presetGame||(selected==='all'?'nte':selected),cycle:presetCycle||(view==='raid'?'raid':cycle),title:'',detail:'',target:1,optional:false};
dialog(task?'내 숙제 수정':'내 숙제 추가','직접 추가한 항목도 같은 게임의 초기화 규칙을 따릅니다.',`<form id="task-form" data-id="${t.id}"><div class="field-row"><label class="field"><span>게임</span><select name="game">${gameOptions(t.game)}</select></label><label class="field"><span>주기</span><select name="cycle">${Object.entries(cycleName).map(([id,l])=>`<option value="${id}" ${t.cycle===id?'selected':''}>${l}</option>`).join('')}</select></label></div><label class="field"><span>숙제 이름</span><input name="title" required maxlength="120" value="${esc(t.title)}" placeholder="예: 이번 주 목표 재료 모으기"></label><label class="field"><span>상세 메모</span><textarea name="detail" maxlength="2000" placeholder="목표와 필요한 내용을 적어 주세요.">${esc(t.detail)}</textarea></label><div class="field-row"><label class="field"><span>완료까지 필요한 횟수</span><input name="target" type="number" min="1" max="10000" required value="${t.target}"></label><label class="switch"><input name="optional" type="checkbox" ${t.optional?'checked':''}> 선택 과제로 추가</label></div><p class="dialog-hint">출격 준비는 ARC Raiders 전용입니다. 별도 주기는 자동 초기화하지 않습니다.</p><div class="dialog-actions"><button type="button" class="button" data-action="close-dialog">취소</button><button type="submit" class="button primary">저장</button></div></form>`);$('task-form')._syncBase=window.GameNoteCloud?.capture()||{};$('task-form').elements.title.focus();}
function noteEditor(note=null){const n=note||{id:'',game:selected,kind:noteKind==='tip'?'tip':'note',title:'',body:'',pinned:false};dialog(note?'기록 열기 · 수정':'새 기록 남기기','메모와 팁은 체크 초기화와 관계없이 보관됩니다.',`<form id="note-form" data-id="${n.id}"><div class="field-row"><label class="field"><span>게임</span><select name="game">${gameOptions(n.game,true)}</select></label><label class="field"><span>기록 종류</span><select name="kind"><option value="note" ${n.kind==='note'?'selected':''}>메모</option><option value="tip" ${n.kind==='tip'?'selected':''}>팁</option></select></label></div><label class="field"><span>제목</span><input name="title" maxlength="120" required value="${esc(n.title)}" placeholder="무엇을 기억해 둘까요?"></label><label class="field"><span>내용</span><textarea name="body" class="note-editor" maxlength="20000" placeholder="목표, 파밍 위치, 링크, 다음에 확인할 것…">${esc(n.body)}</textarea></label><label class="switch"><input name="pinned" type="checkbox" ${n.pinned?'checked':''}> 위에 고정하기</label><div class="dialog-actions"><button type="button" class="button" data-action="close-dialog">취소</button><button type="submit" class="button primary">기록 저장</button></div></form>`);$('note-form')._syncBase=window.GameNoteCloud?.capture()||{};$('note-form').elements.title.focus();}
function settings(){dialog('설정 · 기록 보관','로그인하면 기기 간 기록을 동기화합니다. JSON 백업으로 별도 사본을 보관할 수도 있습니다.',`<section class="settings-section"><h3>백업과 복원</h3><p>로그인 전에는 이 브라우저에만 저장됩니다. 로그인 후에는 클라우드 동기화 상태를 확인하세요. 전송 대기 중인 기록은 이 기기에 있으므로 브라우저 데이터를 지우기 전에 백업하세요.</p><div class="backup-actions"><button type="button" class="button" data-action="export">↓ JSON 백업</button><button type="button" class="button" data-action="import">↑ 백업 복원</button>${recoveryRaw?'<button type="button" class="button" data-action="export-recovery">읽지 못한 원본 저장</button>':''}</div></section><form id="settings-form"><section class="settings-section"><h3>초기화 기준</h3><p>자동 초기화는 일간·주간 체크에만 적용됩니다. 서버 시간대로 계산하며 화면 시간은 KST입니다. 설정을 바꿔도 현재 체크는 유지됩니다.</p><div class="settings-grid">${D.games.map(g=>{const r=state.settings.resets[g.id];return `<div class="reset-setting"><h3>${g.name}</h3><p>${esc(g.resetNote)}</p><div class="reset-fields"><label class="mode"><input type="checkbox" name="${g.id}-auto" ${r.mode==='auto'?'checked':''}> 설정 시각에 체크 자동 초기화</label><label>서버 UTC 오프셋<input type="number" name="${g.id}-offset" value="${r.offset}" min="-12" max="14" step="0.25" required></label><label>서버 초기화 시각<input type="time" name="${g.id}-time" value="${String(r.hour).padStart(2,'0')}:${String(r.minute).padStart(2,'0')}" required></label><label>주간 초기화 요일<select name="${g.id}-weekday">${['일','월','화','수','목','금','토'].map((d,i)=>`<option value="${i}" ${r.weekday===i?'selected':''}>${d}요일</option>`).join('')}</select></label></div></div>`;}).join('')}</div></section><section class="settings-section"><h3 id="hidden-count">숨긴 기본 항목 ${state.hiddenTasks.length}개</h3><div class="hidden-list">${state.hiddenTasks.map(id=>{const t=getTask(id);return t?`<div><span>${gameName(t.game)} · ${esc(t.title)}</span><button type="button" data-action="unhide-task" data-id="${id}">다시 표시</button></div>`:'';}).join('')||'<p class="dialog-hint">숙제의 ‘상세 · 출처’를 열면 항목을 숨길 수 있습니다.</p>'}</div></section>${state.migrated?'<p class="dialog-hint">기존 이환 체크를 한 번 가져왔습니다. 이전 저장 키와 원본 페이지는 보존했습니다.</p>':''}<div class="dialog-actions"><button type="button" class="button" data-action="close-dialog">닫기</button><button type="submit" class="button primary">초기화 설정 저장</button></div></form>`);$('settings-form')._syncBase=window.GameNoteCloud?.capture()||{};}
function download(content,name){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type:'application/json;charset=utf-8'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function importPreview(next){pendingImport=next;dialog('백업 복원 확인','아래 백업으로 현재 기록을 교체합니다. 필요하다면 먼저 현재 기록을 백업하세요.',`<div class="backup-preview"><span>메모 · 팁 <b>${next.notes.length}개</b></span><span>직접 만든 숙제 <b>${next.customTasks.length}개</b></span><span>체크 기록 <b>${Object.keys(next.checks).length}개</b></span><span>숨긴 항목 <b>${next.hiddenTasks.length}개</b></span></div><p class="dialog-hint" style="margin-top:15px">이미 지난 자동 초기화 주기의 체크는 완료로 표시되지 않습니다. 메모와 사용자 숙제는 유지됩니다.</p><div class="dialog-actions"><button type="button" class="button" data-action="export">현재 기록 백업</button><button type="button" class="button" data-action="close-dialog">취소</button><button type="button" class="button primary" data-action="confirm-import">이 백업으로 복원</button></div>`);}
function act(button){const a=button.dataset.action,id=button.dataset.id;
if(a==='navigate')route(button.dataset.view);
else if(a==='game')route('routines',button.dataset.game);
else if(a==='select-game')route('routines',selected===button.dataset.game?'all':button.dataset.game);
else if(a==='cycle'){cycle=button.dataset.cycle;render();}
else if(a==='note-kind'){noteKind=button.dataset.kind;render();}
else if(a==='settings')settings();
else if(a==='add-task')taskEditor(null,button.dataset.game,button.dataset.cycle);
else if(a==='edit-task')taskEditor(getTask(id));
else if(a==='add-note')noteEditor();
else if(a==='edit-note')noteEditor(state.notes.find(n=>n.id===id));
else if(a==='close-dialog')$('editor').close();
else if(a==='count'){const t=getTask(id);if(t)change(()=>C.setTaskValue(state,t,C.taskValue(state,t)+Number(button.dataset.delta)));}
else if(a==='reset')change(()=>C.resetGroup(state,button.dataset.game,button.dataset.cycle),gameName(button.dataset.game)+' '+cycleName[button.dataset.cycle]+' 체크를 비웠습니다.',true);
else if(a==='new-raid')change(()=>C.resetGroup(state,'arc','raid'),'새 출격을 준비합니다. 출격 메모는 유지됩니다.',true);
else if(a==='hide-task')change(()=>state.hiddenTasks.push(id),'목록에서 숨겼습니다. 설정에서 다시 표시할 수 있습니다.',true);
else if(a==='unhide-task'){change(()=>state.hiddenTasks=state.hiddenTasks.filter(x=>x!==id),'다시 표시했습니다.');button.closest('.hidden-list')?.querySelector(`[data-id="${id}"]`)?.parentElement.remove();if($('hidden-count'))$('hidden-count').textContent='숨긴 기본 항목 '+state.hiddenTasks.length+'개';}
else if(a==='delete-task')change(()=>{state.customTasks=state.customTasks.filter(t=>t.id!==id);delete state.checks[id];state.hiddenTasks=state.hiddenTasks.filter(x=>x!==id);},'내 숙제를 삭제했습니다.',true);
else if(a==='delete-note')change(()=>state.notes=state.notes.filter(n=>n.id!==id),'기록을 삭제했습니다.',true);
else if(a==='pin-note')change(()=>{const n=state.notes.find(n=>n.id===id);if(n)n.pinned=!n.pinned;});
else if(a==='undo'&&undoState){state=undoState;undoState=null;save();render();toast('이전 상태로 되돌렸습니다.');}
else if(a==='dismiss-toast')$('toast').hidden=true;
else if(a==='export'){download(C.exportBackup(state),'game-note-'+new Date().toISOString().slice(0,10)+'.json');toast('현재 기록을 JSON으로 내보냈습니다.');}
else if(a==='export-recovery'&&recoveryRaw)download(recoveryRaw,'game-note-recovery.json');
else if(a==='import'){$('import-file').value='';$('import-file').click();}
else if(a==='confirm-import'&&pendingImport){const next=pendingImport;pendingImport=null;try{localStorage.setItem(activeStoreKey+'-before-import',recoveryRaw||JSON.stringify(state));}catch{}writeBlocked=false;change(()=>state=next,'백업을 복원했습니다.',true);$('editor').close();}
}
document.addEventListener('click',e=>{
 if(e.target.closest('a.skip')){e.preventDefault();$('main').focus({preventScroll:true});$('main').scrollIntoView({block:'start'});return;}
 const button=e.target.closest('[data-action]');if(button&&!button.disabled)act(button);
});
document.addEventListener('click',async e=>{
 const button=e.target.closest('[data-guide-action]');if(!button||button.disabled||view!=='guides')return;
 if(button.dataset.guideAction==='clear-search'){guideQuery='';renderGuidePage();document.querySelector('[data-guide-input="query"]')?.focus();}
 else if(button.dataset.guideAction==='copy-link'){
  const url=location.href;
  try{if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');await navigator.clipboard.writeText(url);toast('캐릭터 페이지 링크를 복사했습니다.');}
  catch{dialog('페이지 링크 복사','아래 주소를 선택해 복사하세요.',`<label class="field"><span>페이지 주소</span><input id="guide-copy-url" readonly value="${esc(url)}"></label><div class="dialog-actions"><button type="button" class="button" data-action="close-dialog">닫기</button></div>`);$('guide-copy-url').focus();$('guide-copy-url').select();}
 }
});
document.addEventListener('error',e=>{if(e.target.matches?.('img[data-guide-portrait]'))e.target.hidden=true;},true);
function guideSearch(el){if(view==='guides'&&el.dataset.guideInput==='query'){guideQuery=el.value;renderGuidePage();}}
document.addEventListener('input',e=>{if(!e.isComposing)guideSearch(e.target);});
document.addEventListener('compositionend',e=>guideSearch(e.target));
document.addEventListener('toggle',e=>{if(e.target.matches('details[data-expand]')){if(e.target.open)expanded.add(e.target.dataset.expand);else expanded.delete(e.target.dataset.expand);}},true);
document.addEventListener('input',e=>{if(e.target.id==='search'){query=e.target.value;renderContent();}});
document.addEventListener('change',e=>{const el=e.target;
if(view==='guides'&&el.dataset.guideInput==='sort'){guideSort=['gain','price','value'].includes(el.value)?el.value:'gain';renderGuidePage();}
else if(view==='guides'&&el.dataset.guideInput==='game')route('guides',el.value);
else if(el.dataset.task){const t=getTask(el.dataset.task);if(t)change(()=>C.setTaskValue(state,t,el.checked?t.target:0));}
else if(el.id==='show-optional')change(()=>state.settings.showOptional=el.checked);
else if(el.id==='hide-done')change(()=>state.settings.hideDone=el.checked);
else if(el.id==='game-filter')route(view,el.value);
});
document.addEventListener('submit',e=>{
 const form=e.target;if(!['task-form','note-form','settings-form','raid-form'].includes(form.id))return;e.preventDefault();const f=new FormData(form);
 if(form.id==='task-form'){
  if(!String(f.get('title')).trim()){form.elements.title.setCustomValidity('숙제 이름을 입력하세요.');form.elements.title.reportValidity();form.elements.title.setCustomValidity('');return;}
  if(f.get('cycle')==='raid'&&f.get('game')!=='arc'){toast('출격 준비는 ARC Raiders에서만 사용할 수 있습니다.');return;}
  if(!form.dataset.id&&state.customTasks.length>=500){toast('사용자 숙제는 최대 500개까지 저장할 수 있습니다.');return;}
  const old=form.dataset.id?getTask(form.dataset.id):null,t={id:form.dataset.id||uid('custom'),game:f.get('game'),cycle:f.get('cycle'),title:String(f.get('title')).trim(),detail:f.get('detail'),target:Number(f.get('target')),optional:f.has('optional'),custom:true,sources:[]};
  change(()=>{const value=old?C.taskValue(state,old):0;state.customTasks=state.customTasks.filter(x=>x.id!==t.id);state.customTasks.push(t);if(old)C.setTaskValue(state,t,value);},'내 숙제를 저장했습니다.',false,form._syncBase||{});$('editor').close();
 }else if(form.id==='note-form'){
  if(!String(f.get('title')).trim()){toast('메모 제목을 입력하세요.');return;}
  if(!form.dataset.id&&state.notes.length>=500){toast('메모는 최대 500개까지 저장할 수 있습니다.');return;}
  const n={id:form.dataset.id||uid('note'),game:f.get('game'),kind:f.get('kind'),title:String(f.get('title')).trim(),body:f.get('body'),pinned:f.has('pinned'),updatedAt:new Date().toISOString()};change(()=>{state.notes=state.notes.filter(x=>x.id!==n.id);state.notes.push(n);},'기록을 저장했습니다.',false,form._syncBase||{});$('editor').close();
 }else if(form.id==='settings-form'){
  const resets={};for(const g of D.games){const [hour,minute]=String(f.get(g.id+'-time')).split(':').map(Number);resets[g.id]={mode:f.has(g.id+'-auto')?'auto':'manual',offset:Number(f.get(g.id+'-offset')),hour,minute,weekday:Number(f.get(g.id+'-weekday'))};}
  const trial=C.clone(state);trial.settings.resets=resets;try{C.validateState(trial);}catch(err){toast(err.message);return;}
  change(()=>{for(const g of D.games)C.changeReset(state,g.id,resets[g.id],allTasks());},'초기화 설정을 저장했습니다. 현재 체크는 유지됩니다.',false,form._syncBase||{});$('editor').close();
 }else if(form.id==='raid-form'){change(()=>{for(const key of Object.keys(state.raid))state.raid[key]=f.get(key)||'';},'출격 메모를 저장했습니다.',false,form._syncBase||{});}
});
$('import-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>5000000)throw new Error('백업 파일은 5 MB 이하여야 합니다.');importPreview(C.parseBackup(await file.text()));}catch(err){toast(err.message);}});
$('editor').addEventListener('click',e=>{if(e.target===$('editor')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
window.addEventListener('hashchange',readRoute);
window.addEventListener('storage',e=>{if(e.key===activeStoreKey&&e.newValue){try{state=C.parseBackup(e.newValue);undoState=null;render();toast('다른 탭의 변경을 반영했습니다.');}catch{toast('다른 탭의 기록을 읽지 못했습니다. 현재 기록을 유지합니다.');}}});
let clockSignature='';function tick(){const sig=D.games.map(g=>['daily','weekly'].map(c=>C.periodKey(state,g.id,c)).join('|')).join('|');if(clockSignature&&sig!==clockSignature)render();else document.querySelectorAll('[data-clock-game]').forEach(el=>el.textContent=resetLabel(el.dataset.clockGame,el.dataset.clockCycle,el.closest('.card-caption')!==null));clockSignature=sig;$('today').textContent=dateLabel()+' · KST';}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});

window.GameNoteBridge={escape:esc,dialog,toast,storageStatus,getState:()=>C.clone(state),replace(next,key,accountChange=false){
 state=C.validateState(next);activeStoreKey=key;undoState=null;pendingImport=null;
 if(accountChange){$('editor').close();$('view-content').innerHTML='';writeBlocked=false;storageError='';
  if(key===C.KEY){try{const raw=localStorage.getItem(C.KEY);if(raw)C.parseBackup(raw);}catch{writeBlocked=true;storageError='이전 기기 기록 원본을 보존했습니다. 설정에서 JSON 백업으로 복구하세요.';}}
 }
 save(false);render();
}};

readRoute();tick();setInterval(tick,30000);if(migratedOnLoad&&!writeBlocked){save();toast('이전 이환 체크 기록을 가져왔습니다.');}else storageStatus();
})();
