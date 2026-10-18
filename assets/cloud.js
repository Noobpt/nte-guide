(function(){
'use strict';
const C=window.GameNoteCore,S=window.GameNoteSyncCore,B=window.GameNoteBridge;
const $=id=>document.getElementById(id),esc=B.escape,makeId=()=>crypto.randomUUID();
let sdk,auth,db,user=null,cache=null,cacheKey='',lastState=B.getState(),unsub=null,epoch=0,ready=false,busy=false,timer=null,error='',chain=Promise.resolve(),localWrites=0,memoryOnly=false,loginPending=false,loginAttempt=0;
const config={apiKey:"AIzaSyBgtl8HhVjtxLi-GJdzxJbCIkdwHd7Qmes",authDomain:"homeworkgame-5bc9a.firebaseapp.com",projectId:"homeworkgame-5bc9a",appId:"1:221669286956:web:68621864b168e78ed01d89"};
const owner='2u90sdxOrmcm6OxptfDDTLZODKl2';
function pendingCount(){return cache?Object.keys(cache.pending).length:0;}
function conflictCount(){return cache?Object.keys(cache.conflicts).filter(k=>cache.pending[k]).length:0;}
function label(){return !user?'이 브라우저에 저장':error?'동기화 확인 필요':!navigator.onLine?'오프라인 · 기기에 보관':!ready?'클라우드 연결 중':conflictCount()?conflictCount()+'개 변경 확인 필요':pendingCount()||busy?'클라우드 저장 중':'클라우드 동기화 완료';}
function paint(){
 const root=$('cloud-panel');if(!root)return;
 const loginText=loginPending?'구글 로그인 창에서 계정을 선택해 주세요.':'구글 계정으로 로그인하면 PC와 휴대폰의 기록이 이어집니다.';
 root.innerHTML='<div><strong>'+(user?esc(user.displayName||'내 계정')+'의 게임 노트':'어디서든 이어 쓰는 게임 노트')+'</strong><p>'+esc(error|| (user?label():loginText))+'</p></div><button type="button" class="button '+(!user?'primary':'')+'" data-cloud="'+(user?'manage':'login')+'" '+(!sdk||loginPending?'disabled':'')+'>'+(user?'계정 · 동기화':loginPending?'로그인 중…':'Google로 로그인')+'</button>';
 root.classList.toggle('cloud-attention',!!error||conflictCount()>0);
 if(B.storageStatus)B.storageStatus();
}
function fail(err){error=friendly(err);paint();}
function friendly(err){
 const code=err?.code||'';
 if(code.includes('popup-blocked'))return '로그인 팝업이 차단되었습니다. 이 사이트의 팝업을 허용한 뒤 다시 눌러 주세요.';
 if(code.includes('popup-closed')||code.includes('cancelled-popup'))return '로그인을 취소했습니다. 필요할 때 다시 로그인하세요.';
 if(code.includes('unauthorized-domain'))return '현재 주소에서는 로그인을 사용할 수 없습니다. 게시된 게임 노트 주소로 접속하세요.';
 if(code.includes('permission-denied'))return '이 계정의 기록에 접근할 수 없습니다. 메모장 소유자의 구글 계정인지 확인하세요. 기기 기록은 보존됩니다.';
 if(code.includes('resource-exhausted'))return '무료 사용량 한도에 도달했습니다. 변경은 기기에 보관하고 나중에 다시 동기화합니다.';
 if(code.includes('unavailable')||code.includes('network-request-failed'))return '네트워크에 연결할 수 없습니다. 변경은 기기에 보관됩니다. 연결 후 다시 시도하세요.';
 return err?.message||'동기화에 실패했습니다. 기기 기록을 보존했습니다. 다시 시도하거나 JSON 백업을 저장하세요.';
}
function loadCache(uid,key){
 const raw=localStorage.getItem(key);
 return raw?S.validate(JSON.parse(raw),uid):S.empty(uid);
}
function apply(){
 if(!user||!cache||localWrites)return;
 const next=S.project(cache);lastState=C.clone(next);
 B.replace(next,C.KEY+'-account-'+user.uid,false);paint();
}
function mutate(fn,applyView=true){
 const ticket=epoch,uid=user?.uid,key=cacheKey;
 const work=async()=>{
  if(!uid||ticket!==epoch)return;
  const run=async()=>{
   let next=memoryOnly&&cache?C.clone(cache):loadCache(uid,key);
   await fn(next);
   S.validate(next,uid);
   if(ticket!==epoch)return;
   cache=next;
   try{localStorage.setItem(key,JSON.stringify(next));memoryOnly=false;}
   catch{memoryOnly=true;error='기기 저장 공간이 부족합니다. 창을 닫기 전에 JSON 백업을 저장하세요.';}
   if(applyView)apply();else paint();
  };
  if(navigator.locks)await navigator.locks.request('game-note-sync-'+uid,run);else await run();
 };
 const result=chain.then(work);
 chain=result.catch(fail);
 return result;
}
function schedule(){clearTimeout(timer);if(user&&ready&&navigator.onLine&&!memoryOnly)timer=setTimeout(flush,400);}
function record(next,overrides={}){
 if(!user)return;
 const before=lastState;lastState=C.clone(next);localWrites++;
 mutate(c=>S.queue(c,before,next,makeId,overrides),false).catch(fail).finally(()=>{localWrites--;if(!localWrites)apply();schedule();});
}
function capture(){const out={};if(cache)for(const k of new Set([...Object.keys(cache.remote),...Object.keys(S.flatten(B.getState()))]))out[k]=cache.remote[k]?.rev||0;return out;}
function plain(snapshot){const d=snapshot.data();return {schema:d.schema,rev:d.rev,op:d.op,deleted:d.deleted,value:d.value,updatedAt:d.updatedAt?.toMillis?.()||0};}
async function flush(){
 if(busy||!user||!ready||!navigator.onLine||memoryOnly)return;
 const started=epoch;await chain;
 if(started!==epoch||!user||!cache)return;
 const ticket=epoch,uid=user.uid;
 const work=Object.entries(cache.pending).filter(([k])=>!cache.conflicts[k]).slice(0,150).map(([key,p])=>({key,p:C.clone(p)}));
 if(!work.length){paint();return;}
 busy=true;error='';paint();
 let succeeded=false;
 try{
  const result=await sdk.runTransaction(db,async tx=>{
   const refs=work.map(x=>sdk.doc(db,'gameNoteUsers',uid,'entries',x.key));
   const snaps=await Promise.all(refs.map(ref=>tx.get(ref)));
   const records={},conflicts=[];
   for(let i=0;i<work.length;i++){
    const {key,p}=work[i],current=snaps[i].exists()?plain(snaps[i]):null;
    if(current&&!S.recordOK(current))throw Error('클라우드 데이터가 지원 형식과 다릅니다. 원본을 보존했습니다.');
    const decision=S.decide(p,current);
    if(decision==='conflict'){if(current)records[key]=current;conflicts.push(key);continue;}
    if(decision==='ack'){if(current)records[key]=current;continue;}
    const data={schema:1,rev:(current?.rev||0)+1,op:p.op,deleted:p.value===null,value:p.value,updatedAt:sdk.serverTimestamp()};
    tx.set(refs[i],data);
    records[key]={...data,updatedAt:Date.now()};
   }
   return {records,conflicts};
  });
  if(ticket!==epoch)return;
  await mutate(c=>{S.receive(c,result.records);for(const k of result.conflicts)if(c.pending[k])c.conflicts[k]=true;});
  succeeded=true;
 }catch(err){if(ticket===epoch)fail(err);}
 finally{busy=false;paint();if(ticket===epoch&&succeeded&&Object.keys(cache.pending).some(k=>!cache.conflicts[k]))schedule();}
}
function guest(){try{return C.parseBackup(localStorage.getItem(C.KEY)||JSON.stringify(C.createState()));}catch{return C.createState();}}
async function connect(next){
 const ticket=++epoch;unsub?.();unsub=null;clearTimeout(timer);user=null;ready=false;cache=null;cacheKey='';error='';busy=false;
 B.replace(guest(),C.KEY,true);lastState=B.getState();
 if(!next){paint();return;}
 if(next.uid!==owner){const message='이 메모장은 소유자의 구글 계정에서만 동기화할 수 있습니다.';await sdk.signOut(auth);error=message;paint();B.toast(message);return;}
 user=next;cacheKey=C.KEY+'-cloud-'+next.uid;
 try{
  cache=loadCache(next.uid,cacheKey);
  lastState=S.project(cache);B.replace(lastState,C.KEY+'-account-'+next.uid,true);
  ready=cache.initialized;paint();
  unsub=sdk.onSnapshot(sdk.collection(db,'gameNoteUsers',next.uid,'entries'),{includeMetadataChanges:true},snapshot=>{
   if(ticket!==epoch)return;
   // An empty local SDK snapshot is not evidence of an empty cloud account.
   if(snapshot.metadata.fromCache&&!cache.initialized)return;
   const records={};snapshot.forEach(d=>{records[d.id]=plain(d);});
   mutate(c=>{
    S.receive(c,records);
    if(!snapshot.metadata.fromCache){
     if(!c.initialized&&Object.keys(records).length===0)S.importGuest(c,guest(),makeId);
     c.initialized=true;ready=true;
    }
   }).then(()=>{if(ticket===epoch){if(!memoryOnly)error='';paint();schedule();}}).catch(fail);
  },err=>{if(ticket===epoch)fail(err);});
 }catch(err){fail(err);}
}
function preview(v){if(v===null)return '삭제된 항목';if(typeof v==='string')return v;if(v?.title)return v.title+'\n'+(v.body||v.detail||'');return JSON.stringify(v,null,2);}
function manage(){
 if(!user){login();return;}
 const keys=Object.keys(cache?.conflicts||{}).filter(k=>cache.pending[k]);
 B.dialog('계정 · 클라우드 동기화','같은 구글 계정으로 로그인한 기기에서 기록을 이어 씁니다.',
  '<section class="settings-section"><h3>'+esc(user.displayName||'내 계정')+'</h3><p>'+esc(user.email||'')+'</p><p role="status">'+esc(error||label())+'</p><div class="backup-actions"><button type="button" class="button" data-cloud="retry">지금 동기화</button><button type="button" class="button" data-cloud="import">이 브라우저의 이전 기록 가져오기</button><button type="button" class="button" data-action="export">JSON 백업</button></div><p class="dialog-hint">전송 대기 '+pendingCount()+'개. 오프라인 변경은 이 기기에 보관하며 연결 후 다시 전송합니다. 로그아웃해도 전송 대기 기록은 해당 계정용으로 보존됩니다.</p></section>'+
  (keys.length?'<section class="settings-section"><h3>두 기기에서 바뀐 항목 '+keys.length+'개</h3><p>두 내용을 확인하고 남길 기록을 선택하세요. 선택 전까지 기기 기록을 보존합니다.</p>'+keys.map(k=>'<article class="sync-conflict"><h4>'+esc(cache.pending[k].value?.title||cache.remote[k]?.value?.title||k)+'</h4><div class="conflict-versions"><details><summary>이 기기 기록</summary><pre>'+esc(preview(cache.pending[k].value))+'</pre></details><details><summary>클라우드 기록</summary><pre>'+esc(preview(S.valueOf(cache.remote[k])))+'</pre></details></div><div class="backup-actions"><button type="button" class="button" data-cloud="resolve" data-key="'+esc(k)+'" data-choice="local">이 기기 기록 사용</button><button type="button" class="button" data-cloud="resolve" data-key="'+esc(k)+'" data-choice="remote">클라우드 기록 사용</button>'+(k.startsWith('note--')&&cache.pending[k].value?'<button type="button" class="button primary" data-cloud="resolve" data-key="'+esc(k)+'" data-choice="both">두 메모 모두 보관</button>':'')+'</div></article>').join('')+'</section>':'')+
  '<div class="dialog-actions"><button type="button" class="button" data-cloud="logout">로그아웃</button><button type="button" class="button primary" data-action="close-dialog">닫기</button></div>');
}
async function login(){
 if(!sdk||loginPending)return;
 const attempt=++loginAttempt;loginPending=true;error='';paint();
 const hint=setTimeout(()=>{if(attempt===loginAttempt&&!user){loginPending=false;error='로그인 창이 보이지 않으면 Chrome, Edge 또는 Safari에서 이 사이트를 열어 로그인해 주세요.';paint();}},12000);
 try{const provider=new sdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});await sdk.signInWithPopup(auth,provider);}
 catch(err){if(attempt===loginAttempt)fail(err);}
 finally{clearTimeout(hint);if(attempt===loginAttempt){loginPending=false;paint();}}
}
async function boot(){
 try{
  const parts=await Promise.all([
   import('https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js'),
   import('https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js')
  ]);
  sdk=Object.assign({},...parts);const app=sdk.initializeApp(config,'game-note');auth=sdk.getAuth(app);auth.languageCode='ko';db=sdk.getFirestore(app);
  await sdk.setPersistence(auth,sdk.browserLocalPersistence);
  sdk.onAuthStateChanged(auth,connect,fail);paint();
 }catch(err){error='클라우드 연결 기능을 불러오지 못했습니다. 네트워크를 확인하고 새로고침하세요. 현재는 기기에 저장됩니다.';paint();}
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-cloud]');if(!b||b.disabled)return;
 try{
  const a=b.dataset.cloud;
  if(a==='login')await login();
  else if(a==='manage')manage();
  else if(a==='logout'){await chain;await sdk.signOut(auth);$('editor').close();B.toast('로그아웃했습니다. 계정 기록은 클라우드와 이 기기의 계정 보관함에 유지됩니다.');}
  else if(a==='retry'){error='';await flush();manage();}
  else if(a==='import'){await mutate(c=>S.importGuest(c,guest(),makeId));schedule();manage();B.toast('이전 기록을 추가했습니다. 겹치는 항목은 두 내용을 확인할 수 있습니다.');}
  else if(a==='resolve'){await mutate(c=>S.resolve(c,b.dataset.key,b.dataset.choice,makeId));schedule();manage();}
 }catch(err){fail(err);B.toast(friendly(err));}
});
window.addEventListener('online',()=>{error='';paint();schedule();});
window.addEventListener('offline',paint);
window.addEventListener('storage',e=>{if(user&&e.key===cacheKey)mutate(()=>{}).then(schedule).catch(fail);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){paint();schedule();}});
window.GameNoteCloud={record,capture,label,manage};
paint();boot();
})();
