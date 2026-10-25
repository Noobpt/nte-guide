(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.GameGuideCore=api;
})(globalThis,function(){
  'use strict';
  const clean=value=>String(value??'').normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g,'');
  const byName=(a,b)=>a.name.localeCompare(b.name,'ko')||a.id.localeCompare(b.id);
  const hasPrice=gift=>Number.isFinite(gift.price)&&gift.price>=0;
  const directPurchase=gift=>(gift.acquisition||[]).some(a=>a.type==='shop'||a.type==='vending');
  const validGain=gift=>Number.isFinite(gift.gain)&&gift.gain>0;

  function guideHref(game='all',guideId='',characterId=''){
    return '#guides/'+[game,...(guideId?[guideId]:[]),...(guideId&&characterId?[characterId]:[])].map(encodeURIComponent).join('/');
  }

  function parseGuideRoute(hash){
    const raw=String(hash||'').replace(/^#/,'').split('/');
    if(raw[0]!=='guides')return null;
    let parts;
    try{parts=raw.map(decodeURIComponent);}catch{return {game:'all',guideId:'',characterId:'',invalid:true};}
    const [,game='all',guideId='',characterId='']=parts;
    const knownGame=['all','nte','arc','wuwa','zzz'].includes(game);
    const invalid=!knownGame||parts.length>4||parts.some((p,i)=>i>1&&!p)||
      Boolean(guideId&&(game!=='nte'||guideId!=='gifts'));
    return {game:knownGame?game:'all',guideId,characterId,invalid};
  }

  function searchCharacters(data,query=''){
    const q=clean(query);
    return data.characters.filter(c=>!q||clean([c.name,...(c.aliases||[])].join(' ')).includes(q)).sort(byName);
  }

  function costPer100(gift){
    if(gift.status!=='confirmed'||!directPurchase(gift)||!hasPrice(gift)||!validGain(gift)||gift.currency!=='폰즈')return null;
    return gift.price/gift.gain*100;
  }

  function priceOrder(a,b){
    // Different currencies must not be compared as if they had the same value.
    if(hasPrice(a)!==hasPrice(b))return hasPrice(a)?-1:1;
    if(!hasPrice(a))return 0;
    return String(a.currency).localeCompare(String(b.currency),'ko')||a.price-b.price;
  }

  function filterGifts(data,characterId,{query='',sort='gain'}={}){
    const q=clean(query);
    const found=data.gifts.filter(g=>g.characterIds.includes(characterId)&&(!q||clean([
      g.name,...(g.aliases||[]),...(g.notes||[]),
      ...(g.acquisition||[]).flatMap(a=>[a.name,a.area,a.conditions])
    ].join(' ')).includes(q)));
    return found.sort((a,b)=>{
      if(sort==='price')return priceOrder(a,b)||b.gain-a.gain||byName(a,b);
      if(sort==='value'){
        const ac=costPer100(a),bc=costPer100(b);
        if((ac===null)!==(bc===null))return ac===null?1:-1;
        if(ac!==null&&ac!==bc)return ac-bc;
      }
      return b.gain-a.gain||priceOrder(a,b)||byName(a,b);
    });
  }

  function recommendations(data,characterId){
    const eligible=filterGifts(data,characterId).filter(g=>g.status==='confirmed'&&directPurchase(g)&&validGain(g));
    const maxGain=eligible.length?Math.max(...eligible.map(g=>g.gain)):null;
    const priced=eligible.filter(g=>costPer100(g)!==null);
    const minCost=priced.length?Math.min(...priced.map(costPer100)):null;
    return {
      highestGain:eligible.filter(g=>g.gain===maxGain),
      bestValue:priced.filter(g=>costPer100(g)===minCost)
    };
  }
  return {guideHref,parseGuideRoute,searchCharacters,costPer100,filterGifts,recommendations};
});
