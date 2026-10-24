import {NAMES} from './core.js?v=7';
const API='https://kpop.fandom.com/api.php';
const cache=new Map();
const allowedImage=value=>{try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='static.wikia.nocookie.net'&&u.pathname.startsWith('/kpop/images/')}catch{return false}};
export function photoDownloadURL(value){if(!allowedImage(value))throw new Error('image source');const u=new URL(value);u.pathname=u.pathname.replace(/\/revision\/latest(?:\/.*)?$/,'/revision/latest/scale-to-width-down/1280');return u.href}
export async function searchMemberPhotos(memberId,keyword='',offset=0,signal){
 const name=NAMES[memberId-1];if(!name)throw new Error('member');
 const terms=['tripleS',name,...keyword.trim().slice(0,100).replace(/[\"\\]/g,' ').split(/\s+/).filter(Boolean)];const query=terms.map(term=>'\"'+term+'\"').join(' '),key=JSON.stringify([query,offset]);
 const saved=cache.get(key);if(saved&&Date.now()-saved.time<300000)return saved.value;
 const params=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:'6',gsrlimit:'24',gsroffset:String(offset),gsrsearch:query,prop:'imageinfo',iiprop:'url|size|mime',iiurlwidth:'360'});
 const response=await fetch(API+'?'+params,{signal,credentials:'omit'});if(!response.ok)throw new Error('search');const data=await response.json();if(data.error)throw new Error('search');
 const photos=Object.values(data.query?.pages||{}).sort((a,b)=>(a.index||0)-(b.index||0)).flatMap(page=>{
  const info=page.imageinfo?.[0];if(!page.title.toLowerCase().includes(name.toLowerCase())||!info||!/^image\/(jpeg|png|webp)$/.test(info.mime)||!allowedImage(info.thumburl)||!allowedImage(info.url))return [];
  let source;try{source=new URL(info.descriptionurl);if(source.protocol!=='https:'||source.hostname!=='kpop.fandom.com')return []}catch{return []}
  return [{id:page.pageid,title:page.title.replace(/^File:/,'').replace(/\.(png|jpe?g|webp)$/i,''),thumb:info.thumburl,url:photoDownloadURL(info.url),source:source.href}];
 });
 const value={photos,next:Number.isInteger(data.continue?.gsroffset)?data.continue.gsroffset:null};
 cache.set(key,{time:Date.now(),value});if(cache.size>50)cache.delete(cache.keys().next().value);return value;
}
export function createMemberPhotoBrowser({onPhoto,onDefault}){
 const $=id=>document.getElementById(id),root=$('memberPhotos'),grid=$('photoGrid'),status=$('photoStatus'),more=$('morePhotosBtn');
 let memberId=null,query='',next=null,version=0,searchAbort,choiceAbort,typingTimer,loading=false,choosing=false,photos=[];
 function cancel(){version++;clearTimeout(typingTimer);searchAbort?.abort();choiceAbort?.abort();loading=false;choosing=false;root.removeAttribute('aria-busy')}
 function message(text,error=false){status.textContent=text;status.classList.toggle('error',error)}
 function reset(){cancel();memberId=null;root.hidden=true;$('memberChooser').hidden=false;grid.replaceChildren();message('')}
 function renderOriginal(){
  const id=memberId;if(!id)return;const card=document.createElement('div');card.className='photo-card';
  const button=document.createElement('button');button.className='photo-choice photo-original';button.dataset.original=String(id);button.setAttribute('aria-label','使用 S'+id+' '+NAMES[id-1]+' 原本照片');
  const image=document.createElement('img');image.src='assets/thumbs/s'+id+'.webp?v=5';image.alt=NAMES[id-1]+' 原本的成員照片';
  const label=document.createElement('span');label.textContent='原本照片';button.append(image,label);button.onclick=()=>onDefault(id);
  const detail=document.createElement('span');detail.className='photo-source';detail.textContent='S'+id+' '+NAMES[id-1];card.append(button,detail);grid.append(card);
 }
 function renderPhoto(photo){
  const card=document.createElement('div');card.className='photo-card';const button=document.createElement('button');button.className='photo-choice';button.dataset.photo=photo.id;button.setAttribute('aria-label','使用 '+photo.title);
  const image=document.createElement('img');image.src=photo.thumb;image.alt=photo.title;image.loading='lazy';image.referrerPolicy='no-referrer';image.onerror=()=>{button.disabled=true;button.classList.add('photo-unavailable');button.setAttribute('aria-label',photo.title+'，圖片暫時無法讀取')};
  const title=document.createElement('span');title.textContent=photo.title.replace(/^TripleS\s*/i,'');button.append(image,title);
  button.onclick=async()=>{if(choosing)return;choosing=true;const current=version,id=memberId;choiceAbort=new AbortController();const controller=choiceAbort,timeout=setTimeout(()=>controller.abort(),20000);root.setAttribute('aria-busy','true');message('正在載入照片…');try{await onPhoto(photo,id,choiceAbort.signal)}catch(error){if(current===version)message('這張照片暫時無法使用，請選其他照片或稍後再試。',true)}finally{clearTimeout(timeout);if(current===version){choosing=false;root.removeAttribute('aria-busy')}}};
  const source=document.createElement('a');source.href=photo.source;source.target='_blank';source.rel='noopener noreferrer';source.className='photo-source';source.textContent='圖片來源';source.setAttribute('aria-label',photo.title+' 的來源');card.append(button,source);grid.append(card);
 }
 async function load(append=false){
  if(!memberId||loading)return;const current=version,id=memberId,offset=append?next:0;if(offset===null)return;
  loading=true;searchAbort=new AbortController();const controller=searchAbort,timeout=setTimeout(()=>controller.abort(),15000);more.disabled=true;message(append?'正在載入更多照片…':'正在搜尋 '+NAMES[id-1]+' 的照片…');
  try{const result=await searchMemberPhotos(id,query,offset,searchAbort.signal);if(current!==version)return;
   if(!append){photos=[];grid.replaceChildren();renderOriginal()}
   const seen=new Set(photos.map(p=>p.id));for(const photo of result.photos){if(seen.has(photo.id))continue;seen.add(photo.id);photos.push(photo);renderPhoto(photo)}
   next=result.next;more.hidden=next===null;more.textContent='載入更多照片';$('photoEmpty').hidden=photos.length>0;message(photos.length?'已載入 '+photos.length+' 張照片':'找不到其他符合的照片，請換個關鍵字。');
  }catch(error){if(current!==version)return;message('圖片搜尋暫時無法連線，請再試一次。',true);more.hidden=false;more.textContent='重新搜尋';more.dataset.retry=append?'more':'first'}
  finally{clearTimeout(timeout);if(current===version){loading=false;more.disabled=false}}
 }
 function search(){if(!memberId)return;cancel();query=$('photoSearchInput').value.trim();next=null;photos=[];grid.replaceChildren();renderOriginal();$('photoEmpty').hidden=true;more.hidden=true;delete more.dataset.retry;load()}
 function open(id){reset();memberId=id;query='';next=null;photos=[];$('memberChooser').hidden=true;root.hidden=false;renderOriginal();$('photoMemberName').textContent='S'+id+' '+NAMES[id-1];$('photoSearchInput').value='';$('photoSearchInput').setAttribute('aria-label','搜尋 '+NAMES[id-1]+' 的照片關鍵字');$('photoEmpty').hidden=true;more.hidden=true;$('memberModal').scrollTop=0;load()}
 $('backToMembersBtn').onclick=reset;
 $('photoSearchForm').onsubmit=e=>{e.preventDefault();search()};$('photoSearchInput').oninput=()=>{clearTimeout(typingTimer);typingTimer=setTimeout(search,400)};
 more.onclick=()=>{const retry=more.dataset.retry;delete more.dataset.retry;load(retry==='first'?false:next!==null)};
 return {open,reset,cancel};
}
