const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const C=require('../assets/core.js');
const scope={window:{}};
for(const file of ['nte-legacy-data.js','data.js'])vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets',file),'utf8'),scope);
const D=scope.window.GameNoteData;
const at=s=>Date.parse(s);
const task=(game,cycle,target=1)=>({id:game+'-'+cycle,game,cycle,target});

test('Asia reset at 05:00 KST changes daily only; Monday changes weekly',()=>{
 const s=C.createState(),daily=task('wuwa','daily'),weekly=task('wuwa','weekly',3);
 const before=at('2026-10-19T04:59:59+09:00'),after=at('2026-10-19T05:00:00+09:00');
 C.setTaskValue(s,daily,1,before);C.setTaskValue(s,weekly,2,before);
 assert.equal(C.taskValue(s,daily,before),1);assert.equal(C.taskValue(s,weekly,before),2);
 assert.equal(C.taskValue(s,daily,after),0);assert.equal(C.taskValue(s,weekly,after),0);
 C.setTaskValue(s,daily,1,after);C.setTaskValue(s,weekly,1,after);
 assert.equal(C.taskValue(s,daily,at('2026-10-20T05:00:00+09:00')),0);
 assert.equal(C.taskValue(s,weekly,at('2026-10-20T05:00:00+09:00')),1);
 assert.equal(C.nextReset(s,'wuwa','weekly',before),after);
 assert.equal(C.nextReset(s,'wuwa','weekly',after),at('2026-10-26T05:00:00+09:00'));
});

test('server offsets are explicit and do not follow device timezone or DST',()=>{
 const s=C.createState(),instant=at('2026-11-01T00:00:00Z');
 s.settings.resets.zzz.offset=-5;
 assert.equal(C.nextReset(s,'zzz','daily',instant),at('2026-11-01T09:00:00Z'));
 s.settings.resets.zzz.offset=1;
 assert.equal(C.nextReset(s,'zzz','daily',instant),at('2026-11-01T03:00:00Z'));
 s.settings.resets.zzz.weekday=0;
 assert.equal(C.nextReset(s,'zzz','weekly',instant),at('2026-11-01T03:00:00Z'));
});

test('manual reset only affects its game/cycle and never notes or raid plans',()=>{
 const s=C.createState(),now=at('2026-10-18T12:00:00Z');
 const tasks=[task('nte','daily'),task('nte','weekly'),task('arc','raid'),task('arc','daily'),task('zzz','rotation')];
 tasks.forEach(t=>C.setTaskValue(s,t,1,now));s.raid.map='Keep this map';s.notes.push({id:'note-one',game:'all',kind:'note',title:'Keep',body:'Never reset',pinned:false,updatedAt:''});
 C.resetGroup(s,'arc','raid');
 assert.equal(C.taskValue(s,tasks[2],now),0);for(const t of tasks.filter(t=>t.cycle!=='raid'))assert.equal(C.taskValue(s,t,now),1);
 assert.equal(s.raid.map,'Keep this map');assert.equal(s.notes[0].body,'Never reset');
 assert.equal(C.taskValue(s,tasks[4],now+40*C.DAY),1);assert.equal(C.nextReset(s,'nte','daily'),null);
});

test('changing reset settings preserves valid current values and ignores expired completions',()=>{
 const s=C.createState(),t=task('zzz','weekly',3),old=task('zzz','daily'),now=at('2026-10-18T12:00:00Z');
 C.setTaskValue(s,t,2,now);C.setTaskValue(s,old,1,now-2*C.DAY);
 C.changeReset(s,'zzz',{mode:'manual',offset:9,hour:7,minute:30,weekday:2},[t,old],now);
 assert.equal(C.taskValue(s,t,now),2);assert.equal(C.taskValue(s,old,now),0);
 C.changeReset(s,'zzz',{mode:'auto',offset:-5,hour:4,minute:0,weekday:1},[t,old],now);
 assert.equal(C.taskValue(s,t,now),2);assert.equal(C.taskValue(s,old,now),0);
});

test('NTE legacy migration preserves all old checks and independent timestamps',()=>{
 const done=Object.fromEntries(scope.window.NTE_LEGACY_TASKS.map(t=>[t.id,true]));
 const legacy={schema:2,done,started:{daily:'2026-10-01',weekly:'2026-10-02','optional-daily':'2026-10-03','optional-weekly':'2026-10-04'}};
 const s=C.migrateLegacy(legacy,D.tasks);
 assert.equal(s.migrated,true);assert.equal(s.legacyStarted['optional-weekly'],'2026-10-04');
 assert.equal(D.tasks.filter(t=>t.legacyId).length,19);
 for(const t of D.tasks.filter(t=>t.legacyId))assert.equal(C.taskValue(s,t),t.target);
 assert.equal(C.taskValue(s,D.tasks.find(t=>t.legacyId==='weekly-boss')),3);
});

test('backup roundtrip keeps notes/custom counters/settings; malformed imports are rejected',()=>{
 const s=C.createState();s.notes.push({id:'note-test',game:'zzz',kind:'tip',title:'<script>not markup</script>',body:'Line 1\nLine 2',pinned:true,updatedAt:'2026-10-18'});
 const t={...task('zzz','daily',3),id:'custom-test',title:'Test',detail:'Detail',custom:true,optional:false,sources:[]};s.customTasks.push(t);C.setTaskValue(s,t,2);
 const restored=C.parseBackup(C.exportBackup(s));assert.equal(restored.notes[0].body,s.notes[0].body);assert.equal(C.taskValue(restored,t),2);assert.equal(restored.notes[0].pinned,true);
 for(const text of ['null','{}','[]','no json','{"schema":7}'])assert.throws(()=>C.parseBackup(text));
 for(const corrupt of [x=>x.settings.resets.zzz.hour=24,x=>x.customTasks[0].target=-1,x=>x.notes[0].game='unknown',x=>x.customTasks.push({...x.customTasks[0]}),x=>x.checks.test={value:Infinity,period:'x'}]){const x=C.clone(s);corrupt(x);assert.throws(()=>C.validateState(x));}
 assert.throws(()=>C.parseBackup(C.exportBackup(s).replace('"note-test"','"__proto__"')));
 assert.equal(s.notes.length,1,'validation does not mutate live state');
});

test('hidden tasks do not count as remaining work; partial counters are not complete',()=>{
 const s=C.createState(),a=task('arc','weekly',3),b={...task('arc','weekly'),id:'arc-extra'};
 C.setTaskValue(s,a,2);C.setTaskValue(s,b,1);assert.deepEqual(C.progress(s,[a,b]),{done:1,total:2,percent:50});
 s.hiddenTasks.push(a.id);assert.deepEqual(C.progress(s,[a,b]),{done:1,total:1,percent:100});
 C.setTaskValue(s,a,99);assert.equal(C.taskValue(s,a),3);C.setTaskValue(s,a,-10);assert.equal(C.taskValue(s,a),0);
});

test('catalog IDs, sources, targets and legacy links are consistent',()=>{
 const ids=new Set();for(const t of D.tasks){assert(!ids.has(t.id),t.id);ids.add(t.id);assert(C.GAMES.includes(t.game));assert(C.CYCLES.includes(t.cycle));assert(t.target>0);assert(t.detail);for(const ref of t.sources)assert(D.sources[ref],ref);}
 for(const s of Object.values(D.sources))assert.equal(new URL(s.url).protocol,'https:');
 for(const g of C.GAMES)for(const c of ['daily','weekly'])assert(D.tasks.some(t=>t.game===g&&t.cycle===c));
 assert(D.tasks.filter(t=>t.cycle==='raid').every(t=>t.game==='arc'));
 assert.equal(C.createState().notes.length,0,'no unsolicited tips');
});
