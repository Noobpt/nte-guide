(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GameNoteCore=api;})(globalThis,function(){
'use strict';
const KEY='game-note-v1',LEGACY_KEY='nte-guide-routines-v1',GAMES=['nte','arc','wuwa','zzz'],CYCLES=['daily','weekly','rotation','raid'],DAY=86400000;
const clone=v=>JSON.parse(JSON.stringify(v)),obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),idOK=v=>typeof v==='string'&&/^[a-z][a-z0-9-]{0,90}$/.test(v),str=(v,n)=>typeof v==='string'&&v.length<=n,num=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
function createState(){return {schema:1,checks:{},customTasks:[],hiddenTasks:[],notes:[],manualPeriods:{},settings:{hideDone:false,showOptional:false,resets:{nte:{mode:'manual',offset:9,hour:5,minute:0,weekday:1},arc:{mode:'manual',offset:0,hour:0,minute:0,weekday:1},wuwa:{mode:'auto',offset:8,hour:4,minute:0,weekday:1},zzz:{mode:'auto',offset:8,hour:4,minute:0,weekday:1}}},raid:{map:'',objective:'',loadout:'',exit:'',memo:''},legacyStarted:{},migrated:false,updatedAt:''};}
function periodKey(state,game,cycle,now=Date.now()){
const serial=state.manualPeriods[game+':'+cycle]||0,r=state.settings.resets[game];
if(cycle==='rotation'||cycle==='raid'||r.mode==='manual')return 'manual:'+serial;
const shift=r.offset*3600000-(r.hour*60+r.minute)*60000,day=Math.floor((Number(now)+shift)/DAY);
const bucket=cycle==='weekly'?day-((day+4-r.weekday)%7+7)%7:day;
return [cycle,r.offset,r.hour,r.minute,r.weekday,bucket,serial].join(':');}
function nextReset(state,game,cycle,now=Date.now()){
const r=state.settings.resets[game];if(!['daily','weekly'].includes(cycle)||r.mode!=='auto')return null;
const shift=r.offset*3600000-(r.hour*60+r.minute)*60000;let day=Math.floor((Number(now)+shift)/DAY)+1;
if(cycle==='weekly')day+=((r.weekday-((day+4)%7))%7+7)%7;return day*DAY-shift;}
function taskValue(state,task,now=Date.now()){const v=state.checks[task.id];return !v||v.period!==periodKey(state,task.game,task.cycle,now)?0:Math.max(0,Math.min(task.target||1,v.value));}
function setTaskValue(state,task,value,now=Date.now()){state.checks[task.id]={value:Math.max(0,Math.min(task.target||1,Math.trunc(value))),period:periodKey(state,task.game,task.cycle,now)};}
function resetGroup(state,game,cycle){const k=game+':'+cycle;state.manualPeriods[k]=(state.manualPeriods[k]||0)+1;}
function progress(state,tasks,now=Date.now()){const active=tasks.filter(t=>!state.hiddenTasks.includes(t.id)),done=active.filter(t=>taskValue(state,t,now)>=(t.target||1)).length;return {done,total:active.length,percent:active.length?Math.round(done/active.length*100):0};}
function changeReset(state,game,reset,tasks,now=Date.now()){const values=tasks.filter(t=>t.game===game).map(t=>[t,taskValue(state,t,now)]);state.settings.resets[game]=clone(reset);for(const [t,v]of values)setTaskValue(state,t,v,now);}
function migrateLegacy(legacy,tasks,now=Date.now()){
const s=createState();if(!obj(legacy)||!obj(legacy.done))return s;
for(const t of tasks.filter(t=>t.game==='nte'&&t.legacyId))if(legacy.done[t.legacyId]===true)setTaskValue(s,t,t.target||1,now);
if(obj(legacy.started))for(const k of ['daily','weekly','optional-daily','optional-weekly'])if(str(legacy.started[k],100))s.legacyStarted[k]=legacy.started[k];s.migrated=true;return s;}
function validateState(raw){
if(!obj(raw)||raw.schema!==1||!obj(raw.checks)||!Array.isArray(raw.notes)||!Array.isArray(raw.customTasks)||!obj(raw.settings)||!obj(raw.settings.resets)||!Array.isArray(raw.hiddenTasks)||!obj(raw.manualPeriods)||!obj(raw.raid))throw new Error('게임 노트 백업 형식이 아닙니다. schema 1 JSON 파일을 선택하세요.');
const s=createState();if(raw.notes.length>500||raw.customTasks.length>500||Object.keys(raw.checks).length>2000)throw new Error('백업 항목 수가 지원 범위를 초과합니다.');
for(const game of GAMES){const r=raw.settings.resets[game];if(!obj(r)||!['auto','manual'].includes(r.mode)||typeof r.offset!=='number'||!Number.isFinite(r.offset)||r.offset<-12||r.offset>14||!num(r.hour,0,23)||!num(r.minute,0,59)||!num(r.weekday,0,6))throw new Error('초기화 설정이 올바르지 않습니다: '+game);s.settings.resets[game]={mode:r.mode,offset:r.offset,hour:r.hour,minute:r.minute,weekday:r.weekday};}
s.settings.hideDone=raw.settings.hideDone===true;s.settings.showOptional=raw.settings.showOptional===true;
for(const [id,r]of Object.entries(raw.checks)){if(!idOK(id)||!obj(r)||!num(r.value,0,10000)||!str(r.period,150))throw new Error('체크 기록이 올바르지 않습니다.');s.checks[id]={value:r.value,period:r.period};}
for(const [key,value]of Object.entries(raw.manualPeriods)){const [game,cycle]=key.split(':');if(!GAMES.includes(game)||!CYCLES.includes(cycle)||key!==game+':'+cycle||!num(value,0,10000000))throw new Error('초기화 기록이 올바르지 않습니다.');s.manualPeriods[key]=value;}
const seen=new Set();for(const t of raw.customTasks){if(!obj(t)||!idOK(t.id)||!t.id.startsWith('custom-')||seen.has(t.id)||!GAMES.includes(t.game)||!CYCLES.includes(t.cycle)||(t.cycle==='raid'&&t.game!=='arc')||!str(t.title,120)||!t.title.trim()||!str(t.detail,2000)||!num(t.target,1,10000))throw new Error('사용자 숙제 형식이 올바르지 않습니다.');seen.add(t.id);s.customTasks.push({id:t.id,game:t.game,cycle:t.cycle,title:t.title,detail:t.detail,target:t.target,optional:t.optional===true,custom:true,sources:[]});}
const noteIds=new Set();for(const n of raw.notes){if(!obj(n)||!idOK(n.id)||noteIds.has(n.id)||![...GAMES,'all'].includes(n.game)||!['note','tip'].includes(n.kind)||!str(n.title,120)||!n.title.trim()||!str(n.body,20000)||!str(n.updatedAt,100))throw new Error('메모 형식이 올바르지 않습니다.');noteIds.add(n.id);s.notes.push({id:n.id,game:n.game,kind:n.kind,title:n.title,body:n.body,pinned:n.pinned===true,updatedAt:n.updatedAt});}
if(raw.hiddenTasks.length>1000||raw.hiddenTasks.some(id=>!idOK(id)))throw new Error('숨긴 항목이 올바르지 않습니다.');s.hiddenTasks=[...new Set(raw.hiddenTasks)];
for(const k of ['map','objective','loadout','exit','memo']){if(!str(raw.raid[k],2000))throw new Error('출격 메모 형식이 올바르지 않습니다.');s.raid[k]=raw.raid[k];}
if(obj(raw.legacyStarted))for(const k of ['daily','weekly','optional-daily','optional-weekly'])if(str(raw.legacyStarted[k],100))s.legacyStarted[k]=raw.legacyStarted[k];s.migrated=raw.migrated===true;s.updatedAt=str(raw.updatedAt,100)?raw.updatedAt:'';return s;}
function parseBackup(text){if(typeof text!=='string'||text.length>5000000)throw new Error('백업 파일은 5 MB 이하여야 합니다.');let raw;try{raw=JSON.parse(text);}catch{throw new Error('JSON 파일을 읽을 수 없습니다. 원본 백업 파일을 선택하세요.');}return validateState(raw&&raw.app==='game-note'?raw.state:raw);}
function exportBackup(state,now=new Date()){return JSON.stringify({app:'game-note',exportedAt:now.toISOString(),state:validateState(state)},null,2);}
return {KEY,LEGACY_KEY,GAMES,CYCLES,DAY,clone,createState,periodKey,nextReset,taskValue,setTaskValue,resetGroup,progress,changeReset,migrateLegacy,validateState,parseBackup,exportBackup};
});
