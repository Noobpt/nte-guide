(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./core.js'):root.GameNoteCore);if(typeof module==='object'&&module.exports)module.exports=api;else root.GameNoteSyncCore=api;})(globalThis,function(C){
'use strict';
const clone=C.clone, own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const equal=(a,b)=>JSON.stringify(canonical(a??null))===JSON.stringify(canonical(b??null));
const keyOK=k=>/^(check|note|task|hidden|reset|period|raid|meta)--[a-z][a-z0-9:-]{0,90}$/.test(k);
function flatten(input){
 const s=C.validateState(input),out={};
 for(const [id,v] of Object.entries(s.checks))out['check--'+id]=v;
 for(const n of s.notes)out['note--'+n.id]=n;
 for(const t of s.customTasks)out['task--'+t.id]=t;
 for(const id of s.hiddenTasks)out['hidden--'+id]=true;
 for(const g of C.GAMES)out['reset--'+g]=s.settings.resets[g];
 for(const [k,v] of Object.entries(s.manualPeriods))out['period--'+k]=v;
 for(const [k,v] of Object.entries(s.raid))out['raid--'+k]=v;
 out['meta--view']={hideDone:s.settings.hideDone,showOptional:s.settings.showOptional};
 out['meta--legacy']={migrated:s.migrated,legacyStarted:s.legacyStarted};
 return out;
}
function inflate(values){
 const s=C.createState();
 for(const [key,v] of Object.entries(values)){
  if(!keyOK(key))throw Error('동기화 항목 이름이 올바르지 않습니다.');
  if(v===null)continue;
  const cut=key.indexOf('--'),kind=key.slice(0,cut),id=key.slice(cut+2);
  if(kind==='check')s.checks[id]=v;
  else if(kind==='note'){if(v.id!==id)throw Error('메모 ID가 일치하지 않습니다.');s.notes.push(v);}
  else if(kind==='task'){if(v.id!==id)throw Error('숙제 ID가 일치하지 않습니다.');s.customTasks.push(v);}
  else if(kind==='hidden'){if(v!==true)throw Error('숨김 값이 올바르지 않습니다.');s.hiddenTasks.push(id);}
  else if(kind==='reset'){if(!C.GAMES.includes(id))throw Error('초기화 게임이 올바르지 않습니다.');s.settings.resets[id]=v;}
  else if(kind==='period')s.manualPeriods[id]=v;
  else if(kind==='raid'){if(!own(s.raid,id))throw Error('출격 필드가 올바르지 않습니다.');s.raid[id]=v;}
  else if(id==='view'){s.settings.hideDone=v.hideDone;s.settings.showOptional=v.showOptional;}
  else if(id==='legacy'){s.migrated=v.migrated;s.legacyStarted=v.legacyStarted;}
  else throw Error('알 수 없는 동기화 항목입니다.');
 }
 return C.validateState(s);
}
const valueOf=r=>!r||r.deleted?null:r.value;
function empty(uid){return {schema:1,uid,remote:{},pending:{},conflicts:{},initialized:false};}
function recordOK(r){return r&&r.schema===1&&Number.isInteger(r.rev)&&r.rev>0&&r.rev<=1000000000&&typeof r.op==='string'&&r.op.length<=100&&typeof r.deleted==='boolean'&&own(r,'value')&&(!r.deleted||r.value===null);}
function validate(cache,uid){
 if(!cache||cache.schema!==1||cache.uid!==uid||!cache.remote||!cache.pending||!cache.conflicts)throw Error('계정별 동기화 보관함을 읽을 수 없습니다.');
 for(const [k,r]of Object.entries(cache.remote))if(!keyOK(k)||!recordOK(r))throw Error('동기화 기록이 손상되었습니다.');
 for(const [k,p]of Object.entries(cache.pending))if(!keyOK(k)||!p||!Number.isInteger(p.baseRev)||p.baseRev<0||typeof p.op!=='string'||!Array.isArray(p.parents)||p.parents.length>100||!own(p,'value'))throw Error('전송 대기 기록이 손상되었습니다.');
 project(cache);return cache;
}
function project(cache){const values={};for(const[k,r]of Object.entries(cache.remote))values[k]=valueOf(r);for(const[k,p]of Object.entries(cache.pending))values[k]=p.value;return inflate(values);}
function queue(cache,before,after,makeId,overrides={}){
 const a=flatten(before),b=flatten(after);
 for(const key of new Set([...Object.keys(a),...Object.keys(b)])){
  if(equal(a[key],b[key]))continue;
  const old=cache.pending[key];
  cache.pending[key]={value:own(b,key)?clone(b[key]):null,baseRev:old?old.baseRev:(own(overrides,key)?overrides[key]:cache.remote[key]?.rev||0),op:makeId(),parents:old?[...old.parents,old.op].slice(-100):[]};
 }
 return cache;
}
function receive(cache,records){
 for(const[k,r]of Object.entries(records)){
  if(!keyOK(k)||!recordOK(r))throw Error('클라우드 기록 형식이 올바르지 않습니다.');
  if((cache.remote[k]?.rev||0)<=r.rev)cache.remote[k]=clone(r);
 }
 for(const[k,p]of Object.entries(cache.pending)){
  const r=cache.remote[k];if(!r)continue;
  if(r.op===p.op||equal(valueOf(r),p.value)){delete cache.pending[k];delete cache.conflicts[k];}
  else if(p.parents.includes(r.op)){p.baseRev=r.rev;p.parents=[];delete cache.conflicts[k];}
  else if(r.rev!==p.baseRev)cache.conflicts[k]=true;
 }
 return cache;
}
function decide(p,r){
 if(r&&(r.op===p.op||equal(valueOf(r),p.value)))return 'ack';
 return (r?.rev||0)===p.baseRev?'write':'conflict';
}
function resolve(cache,key,choice,makeId){
 const p=cache.pending[key];if(!p)return;
 if(choice==='remote'){delete cache.pending[key];delete cache.conflicts[key];return;}
 if(choice==='both'&&key.startsWith('note--')&&p.value){
  const n=clone(p.value);n.id='note-'+makeId();n.title=(n.title+' · 다른 기기 사본').slice(0,120);
  cache.pending['note--'+n.id]={value:n,baseRev:0,op:makeId(),parents:[]};
  delete cache.pending[key];delete cache.conflicts[key];return;
 }
 p.baseRev=cache.remote[key]?.rev||0;p.op=makeId();p.parents=[];delete cache.conflicts[key];
}
function importGuest(cache,state,makeId){
 const defaults=flatten(C.createState());
 for(const[k,v]of Object.entries(flatten(state))){
  if(equal(v,defaults[k])||equal(v,valueOf(cache.remote[k]))||cache.pending[k])continue;
  cache.pending[k]={value:clone(v),baseRev:0,op:makeId(),parents:[]};
 }
 receive(cache,{});cache.initialized=true;return cache;
}
return {equal,keyOK,flatten,inflate,empty,validate,project,queue,receive,decide,resolve,importGuest,valueOf,recordOK};
});
