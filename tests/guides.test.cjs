const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const G=require('../assets/guide-core.js');

const gift=(id,overrides={})=>({id,name:id,aliases:[],characterIds:['mint'],gain:100,price:300,currency:'폰즈',status:'confirmed',acquisition:[{type:'shop',name:'꽃집',area:'브릿지 구역',conditions:''}],notes:[],...overrides});
const fixture={characters:[{id:'mint',name:'민트',aliases:['Mint']},{id:'umitsuki',name:'우미츠키',aliases:['우미즈키','Aurelia']}],gifts:[
 gift('high-a',{gain:400,price:10000}),gift('high-b',{gain:400,price:12000}),
 gift('cheap-a',{aliases:['과자'],price:300}),gift('cheap-b',{gain:200,price:600}),
 gift('unknown',{price:null}),gift('pending',{gain:900,price:1,status:'unverified'}),
 gift('exchange',{gain:800,price:0,acquisition:[{type:'exchange',name:'교환소'}]}),
 gift('other-currency',{gain:100,price:1,currency:'특수 토큰'}),
 gift('other-person',{characterIds:['umitsuki']})
]};

test('guide routes preserve deep links and reject unsupported or malformed paths',()=>{
 assert.deepEqual(G.parseGuideRoute('#guides'),{game:'all',guideId:'',characterId:'',invalid:false});
 for(const hash of ['#guides/all','#guides/nte','#guides/nte/gifts','#guides/nte/gifts/mint'])assert.equal(G.parseGuideRoute(hash).invalid,false,hash);
 assert.equal(G.parseGuideRoute(G.guideHref('nte','gifts','akane-rin')).characterId,'akane-rin');
 for(const hash of ['#guides/no-game','#guides/arc/gifts','#guides/all/gifts','#guides/nte/unknown','#guides/nte/gifts/mint/extra','#guides/nte/gifts/%E0%A4%A','#guides//gifts'])assert.equal(G.parseGuideRoute(hash).invalid,true,hash);
 assert.equal(G.parseGuideRoute('#sources'),null);
 assert.equal(G.parseGuideRoute('#routines/nte'),null);
});

test('character lookup handles Korean legacy aliases, spacing, case, and no results',()=>{
 assert.deepEqual(G.searchCharacters(fixture,'우 미 즈 키').map(c=>c.id),['umitsuki']);
 assert.deepEqual(G.searchCharacters(fixture,'MINT').map(c=>c.id),['mint']);
 assert.deepEqual(G.searchCharacters(fixture,'없는 캐릭터'),[]);
});

test('gift search is scoped to a character and searches aliases and acquisition locations',()=>{
 assert.deepEqual(G.filterGifts(fixture,'mint',{query:'과 자'}).map(g=>g.id),['cheap-a']);
 assert.ok(G.filterGifts(fixture,'mint',{query:'브릿지'}).every(g=>g.characterIds.includes('mint')));
 assert.equal(G.filterGifts(fixture,'missing').length,0);
 assert.equal(G.filterGifts(fixture,'mint',{query:'없는 상점'}).length,0);
 const before=JSON.stringify(fixture);G.filterGifts(fixture,'mint',{sort:'price'});assert.equal(JSON.stringify(fixture),before);
});

test('efficiency excludes unknown prices, uncertain gifts, exchanges, invalid gains, and other currencies',()=>{
 assert.equal(G.costPer100(gift('priced',{gain:400,price:5400})),1350);
 for(const overrides of [{price:null},{price:-1},{price:NaN},{gain:0},{gain:-100},{status:'unverified'},{currency:'특수 토큰'},{acquisition:[{type:'production'}]}])assert.equal(G.costPer100(gift('invalid',overrides)),null);
 assert.equal(G.costPer100(gift('vending',{acquisition:[{type:'vending'}]})),300);
});

test('recommendations retain all ties, exclude uncertain/non-shopping options, and handle empty results',()=>{
 const result=G.recommendations(fixture,'mint');
 assert.deepEqual(result.highestGain.map(g=>g.id),['high-a','high-b']);
 assert.deepEqual(result.bestValue.map(g=>g.id).sort(),['cheap-a','cheap-b']);
 assert.deepEqual(G.recommendations(fixture,'missing'),{highestGain:[],bestValue:[]});
 const onlyUnknown={gifts:[gift('no-price',{price:null})]};
 assert.equal(G.recommendations(onlyUnknown,'mint').highestGain.length,1);
 assert.equal(G.recommendations(onlyUnknown,'mint').bestValue.length,0);
});

test('sorting gives deterministic gain/price results and puts incomparable efficiency last',()=>{
 const data={gifts:[gift('b',{gain:200,price:600}),gift('a',{gain:400,price:4000}),gift('c',{gain:400,price:2000}),gift('z',{price:null})]};
 assert.deepEqual(G.filterGifts(data,'mint').map(g=>g.id),['c','a','b','z']);
 assert.deepEqual(G.filterGifts(data,'mint',{sort:'price'}).map(g=>g.id),['b','c','a','z']);
 assert.deepEqual(G.filterGifts(data,'mint',{sort:'value'}).map(g=>g.id),['b','c','a','z']);
 assert.equal(G.filterGifts(fixture,'mint',{sort:'value'})[0].id,'cheap-b');
});

test('published gift catalog has unique IDs, valid references and explicit uncertainty',()=>{
 const data=require('../assets/nte-gifts-data.js');
 const idPattern=/^[a-z][a-z0-9-]+$/;
 const chars=new Set(data.characters.map(c=>c.id));
 assert.equal(chars.size,data.characters.length);
 assert.ok(chars.has('akane-rin'));
 assert.ok(data.characters.find(c=>c.id==='umitsuki').aliases.includes('우미즈키'));
 const ids=new Set();
 for(const c of data.characters){assert.match(c.id,idPattern);assert.ok(c.name);assert.ok(Array.isArray(c.aliases));}
 for(const g of [...data.gifts,...data.commonGifts]){
  assert.match(g.id,idPattern);assert.ok(!ids.has(g.id),g.id);ids.add(g.id);
  assert.ok(Number.isFinite(g.gain)&&g.gain>0,g.id);
  assert.ok(g.price===null||(Number.isFinite(g.price)&&g.price>=0),g.id);
  assert.ok(['confirmed','unverified'].includes(g.status));
  assert.match(g.checkedAt,/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(g.sourceIds.length,g.id);
  for(const id of g.sourceIds){assert.ok(data.sources[id],id);assert.match(data.sources[id].url,/^https:\/\//);}
  for(const id of g.characterIds)assert.ok(chars.has(id),id);
  assert.ok(g.acquisition.length,g.id);
  for(const a of g.acquisition){assert.ok(['shop','vending','exchange','production'].includes(a.type));assert.ok(a.name);}
  if(g.status==='unverified')assert.ok(g.notes.length,g.id+' needs a reason');
 }
 for(const c of data.characters){const r=G.recommendations(data,c.id);assert.ok([...r.highestGain,...r.bestValue].every(g=>g.status==='confirmed'));}
 for(const common of data.commonGifts){assert.equal(common.characterIds.length,0);assert.equal(G.costPer100(common),null);}
});

test('official portrait references match characters and contain local PNG files',()=>{
 const data=require('../assets/nte-gifts-data.js'),portraits=require('../assets/nte-gift-portraits.js');
 for(const [id,p] of Object.entries(portraits)){
  assert.ok(data.characters.some(c=>c.id===id),id);
  assert.match(p.src,/^assets\/portraits\/nte\/[a-z0-9-]+\.png$/);
  assert.match(p.sourceUrl,/^https:\/\/nte\.perfectworld\.com\//);
  const bytes=fs.readFileSync(path.join(__dirname,'..',p.src));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.ok(bytes.readUInt32BE(16)>0);assert.ok(bytes.readUInt32BE(20)>0);
 }
});

test('guide rendering covers every character, sorting mode, and recovery states',()=>{
 const UI=require('../assets/guides.js'),data=require('../assets/nte-gifts-data.js'),portraits=require('../assets/nte-gift-portraits.js');
 for(const c of data.characters)for(const sort of ['gain','price','value']){
  const page=UI.render({game:'nte',guideId:'gifts',characterId:c.id,sort},data,portraits);
  assert.equal(page.title,c.name+'의 상시선물');
  assert.ok(page.content.includes('guide-common-title'));
  assert.ok(!page.content.includes('undefined')&&!page.content.includes('NaN'));
 }
 const missing=UI.render({game:'nte',guideId:'gifts',characterId:'does-not-exist'},data,portraits);
 assert.match(missing.content,/캐릭터 목록으로/);
 const empty=UI.render({game:'nte',guideId:'gifts',query:'존재하지않는캐릭터'},data,portraits);
 assert.match(empty.content,/찾는 캐릭터가 없습니다/);
 assert.match(empty.content,/data-guide-action="clear-search"/);
 const noGuide=UI.render({game:'arc'},data,portraits);
 assert.match(noGuide.content,/등록된 공략이 없습니다/);
 assert.ok(!noGuide.toolbar.includes('aria-current="page"'));
 assert.ok(UI.render({game:'all'},data,portraits).toolbar.includes('href="#guides/all" aria-current="page"'));
});

test('guide rendering escapes data and rejects executable source or portrait URLs',()=>{
 const UI=require('../assets/guides.js');
 const data={meta:{},characters:[{id:'mint',name:'<script>bad()</script>',aliases:[],notes:[]}],gifts:[gift('test',{notes:['<img src=x onerror=alert(1)>'],checkedAt:'2026-10-25',sourceIds:['bad','good']})],commonGifts:[],sources:{bad:{title:'bad',url:'javascript:alert(1)'},good:{title:'<b>source</b>',url:'https://example.com/?a=1&b=2'}},notes:[]};
 const page=UI.render({game:'nte',guideId:'gifts',characterId:'mint',query:'',sort:'gain'},data,{mint:{src:'javascript:alert(1)',sourceUrl:'javascript:alert(1)'}});
 assert.ok(!page.content.includes('<script>'));
 assert.ok(!page.content.includes('<img src=x'));
 assert.ok(!page.content.includes('javascript:'));
 assert.ok(page.content.includes('&lt;script&gt;'));
 assert.ok(page.content.includes('&lt;b&gt;source&lt;/b&gt;'));
 assert.ok(page.content.includes('https://example.com/?a=1&amp;b=2'));
});
