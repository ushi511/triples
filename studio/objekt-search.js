// Public card-design index snapshot. No COSMO account or API key is required.
// Each `number` is a collection/card-design number, never an owner's serial.
let catalogPromise;
const normalized=value=>String(value??'').normalize('NFKC').replace(/[\s_-]/g,'').toLowerCase();
const memberNames=['SeoYeon','HyeRin','JiWoo','ChaeYeon','YooYeon','SooMin','NaKyoung','YuBin','Kaede','DaHyun','Kotone','YeonJi','Nien','SoHyun','Xinyu','Mayu','Lynn','JooBin','HaYeon','ShiOn','ChaeWon','Sullin','SeoAh','JiYeon'];
function checkAbort(signal){if(signal?.aborted)throw signal.reason??new DOMException('Aborted','AbortError');}
export function loadObjektCatalog(){
 if(!catalogPromise)catalogPromise=fetch(new URL('./objekt-catalog.json',import.meta.url)).then(response=>{if(!response.ok)throw new Error('Objekt 圖鑑暫時無法載入，請稍後再試。');return response.json()}).then(catalog=>{if(!Array.isArray(catalog.items))throw new Error('Objekt 圖鑑格式錯誤。');return catalog}).catch(error=>{catalogPromise=null;throw error});
 return catalogPromise;
}

// COSMO's newer image host does not consistently send browser CORS headers.
// Resize only these public card images through the documented wsrv.nl cache.
const publicCosmoImageHosts=new Set(['resources.cosmo.fans','a6056a84169c4302bbb29edd133b91f1.cosmo.fans']);
export function getObjektImageUrl(original,{thumbnail=false}={}){
 const url=new URL(original);
 if(url.protocol!=='https:')throw new Error('Objekt 圖片網址必須使用 HTTPS。');
 if(publicCosmoImageHosts.has(url.hostname)){
  const cache=new URL('https://wsrv.nl/');cache.searchParams.set('url',url.href);cache.searchParams.set('w',thumbnail?'300':'1200');cache.searchParams.set('output','webp');return cache.href;
 }
 if(url.hostname==='imagedelivery.net')return thumbnail?url.href.replace(/\/(?:[234]x|original)$/i,'/thumbnail'):url.href;
 throw new Error('Objekt 圖片來源不受支援。');
}
function displayCard(card){return {...card,originalImage:card.image,image:getObjektImageUrl(card.image),thumbnail:getObjektImageUrl(card.thumbnail||card.image,{thumbnail:true})};}

export async function searchObjekts({member='',number='',season='',page=1,pageSize=48,signal}={}){
 checkAbort(signal);
 const catalog=await loadObjektCatalog();
 checkAbort(signal);
 const selectedMember=/^s?([1-9]|1[0-9]|2[0-4])$/i.test(String(member))?memberNames[Number(String(member).replace(/^s/i,''))-1]:member;
 const m=normalized(selectedMember),n=normalized(number),s=normalized(season);
 const filtered=catalog.items.filter(card=>(!m||normalized(card.member)===m)&&(!n||normalized(card.number).includes(n))&&(!s||normalized(card.season)===s));
 const safePage=Math.max(1,Math.floor(Number(page)||1)),safePageSize=Math.min(120,Math.max(1,Math.floor(Number(pageSize)||48)));
 return {items:filtered.slice((safePage-1)*safePageSize,safePage*safePageSize).map(displayCard),total:filtered.length,page:safePage,pageSize:safePageSize,hasNext:safePage*safePageSize<filtered.length,seasons:catalog.seasons,members:catalog.members,updatedAt:catalog.updatedAt,source:catalog.source};
}
