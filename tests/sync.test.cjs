const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../assets/core.js'),S=require('../assets/sync-core.js');
let seq=0;const id=()=> 'op-'+(++seq);
const record=(value,rev=1,op=id())=>({schema:1,value,deleted:value===null,rev,op,updatedAt:0});
const note=(key='note-one',body='original')=>({id:key,game:'all',kind:'note',title:'메모',body,pinned:false,updatedAt:'2026-10-18'});
test('roundtrip preserves every state field and imported IDs containing double hyphens',()=>{
 const s=C.createState();s.notes=[note('note--import')];s.customTasks=[{id:'custom-a',game:'arc',cycle:'raid',title:'test',detail:'',target:2,optional:false,custom:true,sources:[]}];s.checks['custom-a']={value:1,period:'manual:0'};s.hiddenTasks=['nte-daily-core'];s.manualPeriods['arc:raid']=3;s.raid.memo='출격';s.settings.hideDone=true;s.migrated=true;s.legacyStarted.daily='2026-10-18';
 assert.deepEqual(S.inflate(S.flatten(s)),s);
});
test('Firestore object field ordering does not produce false changes or conflicts',()=>{
 assert.equal(S.equal({a:1,b:{c:2,d:3}},{b:{d:3,c:2},a:1}),true);
 const c=S.empty('a');c.pending['check--nte-test']={value:{value:1,period:'manual:0'},baseRev:0,op:id(),parents:[]};
 S.receive(c,{'check--nte-test':record({period:'manual:0',value:1})});assert.equal(Object.keys(c.pending).length,0);
});
test('independent edits from two devices are merged without overwriting notes',()=>{
 const a=S.empty('a'),b=S.empty('a'),start=C.createState(),sa=C.clone(start),sb=C.clone(start);
 sa.notes=[note('note-a','PC')];sb.notes=[note('note-b','phone')];
 S.queue(a,start,sa,id);S.queue(b,start,sb,id);
 const ra=record(a.pending['note--note-a'].value,1,a.pending['note--note-a'].op);
 S.receive(b,{'note--note-a':ra});
 assert.deepEqual(S.project(b).notes.map(n=>n.body).sort(),['PC','phone']);
 assert.equal(S.decide(b.pending['note--note-b'],null),'write');
});
test('same-note conflicts retain both versions and can save a separate copy',()=>{
 const c=S.empty('a'),original=note();S.receive(c,{'note--note-one':record(original)});
 const before=S.project(c),after=C.clone(before);after.notes[0].body='offline PC';
 S.queue(c,before,after,id);S.receive(c,{'note--note-one':record(note('note-one','phone'),2)});
 assert.equal(c.conflicts['note--note-one'],true);assert.equal(S.project(c).notes[0].body,'offline PC');
 S.resolve(c,'note--note-one','both',id);
 assert.deepEqual(S.project(c).notes.map(n=>n.body).sort(),['offline PC','phone']);
});
test('a delete cannot silently erase a concurrently edited note',()=>{
 const c=S.empty('a');S.receive(c,{'note--note-one':record(note())});const before=S.project(c),after=C.createState();
 S.queue(c,before,after,id);const newer=record(note('note-one','updated elsewhere'),2);
 assert.equal(S.decide(c.pending['note--note-one'],newer),'conflict');
 S.receive(c,{'note--note-one':newer});S.resolve(c,'note--note-one','remote',id);
 assert.equal(S.project(c).notes[0].body,'updated elsewhere');
});
test('editing during an in-flight commit rebases the subsequent edit safely',()=>{
 const c=S.empty('a'),before=C.createState(),first=C.createState();first.notes=[note()];
 S.queue(c,before,first,id);const sending=C.clone(c.pending['note--note-one']),second=C.clone(first);second.notes[0].body='second edit';
 S.queue(c,first,second,id);S.receive(c,{'note--note-one':record(sending.value,1,sending.op)});
 assert.equal(c.pending['note--note-one'].baseRev,1);assert.equal(c.conflicts['note--note-one'],undefined);
 assert.equal(S.project(c).notes[0].body,'second edit');
});
test('offline queue survives serialization and rejects a different account',()=>{
 const c=S.empty('owner'),s=C.createState();s.notes=[note()];S.queue(c,C.createState(),s,id);
 const restored=S.validate(JSON.parse(JSON.stringify(c)),'owner');assert.equal(S.project(restored).notes.length,1);
 assert.throws(()=>S.validate(restored,'someone-else'));
});
test('retrying an acknowledged operation is idempotent and ignores stale snapshots',()=>{
 const c=S.empty('a');const p={value:note(),baseRev:0,op:id(),parents:[]};const r=record(p.value,1,p.op);
 assert.equal(S.decide(p,r),'ack');S.receive(c,{'note--note-one':record(note('note-one','new'),3)});
 S.receive(c,{'note--note-one':r});assert.equal(S.project(c).notes[0].body,'new');
});
test('import merges additions, preserves deletions and raises overlap conflicts',()=>{
 const c=S.empty('a');S.receive(c,{'note--note-one':record(null,2)});
 const guest=C.createState();guest.notes=[note(),note('note-two','new')];S.importGuest(c,guest,id);
 assert.equal(c.conflicts['note--note-one'],true);assert.equal(c.pending['note--note-two'].baseRev,0);
 assert.equal(c.pending['reset--nte'],undefined);
});
test('editing a stale open editor uses the captured revision',()=>{
 const c=S.empty('a');S.receive(c,{'note--note-one':record(note(),3)});
 const oldRev={'note--note-one':3};S.receive(c,{'note--note-one':record(note('note-one','remote'),4)});
 const before=S.project(c),after=C.clone(before);after.notes[0].body='stale editor';
 S.queue(c,before,after,id,oldRev);assert.equal(S.decide(c.pending['note--note-one'],c.remote['note--note-one']),'conflict');
});
test('a reset on another device prevents stale-period checks becoming completed again',()=>{
 const c=S.empty('a'),task={id:'nte-test',game:'nte',cycle:'daily',target:1};
 S.receive(c,{'check--nte-test':record({value:1,period:'manual:0'}),'period--nte:daily':record(1)});
 assert.equal(C.taskValue(S.project(c),task),0);
});
