import {createCollectionPickers} from './collection-pickers.js?v=19';
import {createMemberPhotoBrowser} from './member-photos.js?v=19';
import {FONT_FAMILY,fitSingleLine,songLayout,wrapText} from './typography.js?v=8';
import {NAMES,freshState,cloneState,clamp,placement,validDraft,defaultCrop,restoreState,getTable,TABLE_IDS,slotType,TOPIC_OPTIONS,topicFor} from './core.js?v=19';
const $=id=>document.getElementById(id),canvas=$('canvas'),modal=$('memberModal'),songModal=$('songModal');
const images=new Map(),history=[],draftCache=new Map();
const collectionPickers=createCollectionPickers({onChoose:chooseCollection,onClear:clearCollection});
const memberPhotos=createMemberPhotoBrowser({onPhoto:chooseInternetPhoto,onDefault:selectMember});
const typographyReady=Promise.all([document.fonts.load('400 14px "Table Sans"'),document.fonts.load('700 48px "Table Sans"')]).then(()=>document.fonts.ready);
let state=freshState(),selected=0,template,db=null,ready=false,epoch=0,session=0,drawVersion=0,jobs=Array(12).fill(0),editStart=null,saveTimer,writeChain=Promise.resolve(),uploadRequest,drag=null,previewImage=null,previewSource=null,cropFrame=0;
let rects=getTable(state.tableId).rects,switching=false;
const table=()=>getTable(state.tableId),labels=()=>state.slots.map((_,i)=>topicFor(state,i).text||'未命名項目');
function status(text,error=false,inModal=false){const el=$(inModal?'modalStatus':'saveStatus');el.textContent=text;el.classList.toggle('error',error);if(!inModal)el.hidden=!error}
function image(src){if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{images.delete(src);reject(new Error('image'))};img.src=src}));return images.get(src)}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function remember(before){if(!same(before,state)){history.push(before);if(history.length>30)history.shift()}updateButtons()}
function beginEdit(){if(!editStart)editStart=cloneState(state)}
function finishEdit(){if(editStart){remember(editStart);editStart=null;scheduleSave()}}
function change(fn){stopDragging();finishEdit();const before=cloneState(state);fn();remember(before);render();scheduleSave()}
function updateButtons(){$('undoBtn').disabled=!ready||!history.length;$('clearAllBtn').disabled=!ready||!state.slots.some(Boolean)&&!state.topics.some(Boolean)}
function paintSong(ctx,img,w,h,s){
 ctx.save();ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
 const layout=songLayout(ctx,w,h,s.title);
 ctx.drawImage(img,layout.coverX,layout.coverY,layout.cover,layout.cover);
 ctx.font=layout.font;ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#111';
 layout.lines.forEach((line,index)=>ctx.fillText(line,layout.textX,layout.firstBaseline+index*layout.lineHeight));ctx.restore();
}
function centeredText(ctx,text,x,y){
 const metrics=ctx.measureText(text);ctx.textBaseline='alphabetic';
 ctx.fillText(text,x,y+(metrics.actualBoundingBoxAscent-metrics.actualBoundingBoxDescent)/2);
}
function paintTableFrame(ctx){
 ctx.save();ctx.fillStyle='#000';
 for(const [x,width] of [[2,9],[360,9],[719,8],[1077,8],[1435,7]])ctx.fillRect(x,272,width,1382);
 for(const [y,height] of [[272,9],[656,4],[732,4],[1113,4],[1190,3],[1570,4],[1645,9]])ctx.fillRect(2,y,1440,height);
 ctx.restore();
}
function paintTableTypography(ctx,source=template){
 ctx.save();ctx.fillStyle='#fff';ctx.fillRect(0,0,source.width,272);
 const title='tripleS 生涯表',version='(3.5)',logoW=123,logoH=141,gap=32,versionGap=20;
 ctx.font='700 108px '+FONT_FAMILY;const titleWidth=ctx.measureText(title).width;
 ctx.font='700 32px '+FONT_FAMILY;const versionWidth=ctx.measureText(version).width;
 const total=logoW+gap+titleWidth+versionGap+versionWidth,left=(source.width-total)/2;
 ctx.drawImage(source,262,68,123,141,Math.round(left),66,logoW,logoH);
 ctx.fillStyle='#111';ctx.textAlign='left';ctx.font='700 108px '+FONT_FAMILY;centeredText(ctx,title,left+logoW+gap,136);
 ctx.font='700 32px '+FONT_FAMILY;centeredText(ctx,version,left+logoW+gap+titleWidth+versionGap,136);
 const columns=[{x:11,w:349},{x:369,w:350},{x:727,w:350},{x:1085,w:350}],rows=[{y:660,h:72},{y:1117,h:73},{y:1574,h:71}];
 getTable('3.5').labels.forEach((text,index)=>{
  const col=columns[index%4],row=rows[Math.floor(index/4)];
  ctx.fillStyle='#fff';ctx.fillRect(col.x,row.y,col.w,row.h);
  fitSingleLine(ctx,text,48,30,col.w-24);ctx.fillStyle=index===6?'#e92342':'#111';ctx.textAlign='center';
  centeredText(ctx,text,col.x+col.w/2,row.y+row.h/2);
 });ctx.restore();
}
function paintCustomTopics(ctx,snapshot,config){
 ctx.save();ctx.beginPath();ctx.rect(0,0,config.width,config.height);ctx.clip();
 snapshot.topics.forEach((topic,index)=>{if(!topic)return;const r=config.captionRects[index],text=topic.text;ctx.fillStyle='#fff';ctx.fillRect(r.x,r.y,r.w,r.h);if(!text)return;
 let size=Math.min(48,Math.floor(r.h*.62));ctx.font='700 '+size+'px '+FONT_FAMILY;
 while(size>30&&ctx.measureText(text).width>r.w-20){size--;ctx.font='700 '+size+'px '+FONT_FAMILY}
 let lines=wrapText(ctx,text,r.w-20),lineHeight;
 while(size>8&&(lines.length>2||lines.length*size*1.18>r.h-10)){size--;ctx.font='700 '+size+'px '+FONT_FAMILY;lines=wrapText(ctx,text,r.w-20)}
 lineHeight=size*1.18;ctx.textAlign='center';ctx.fillStyle='#111';ctx.save();ctx.beginPath();ctx.rect(r.x,r.y,r.w,r.h);ctx.clip();lines.forEach((line,i)=>centeredText(ctx,line,r.x+r.w/2,r.y+r.h/2+(i-(lines.length-1)/2)*lineHeight));ctx.restore();
 });ctx.restore();
}
function drawContained(ctx,img,x,y,w,h){const scale=Math.min(w/img.width,h/img.height);const dw=img.width*scale,dh=img.height*scale;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function paintCollection(ctx,img,w,h,slot){
 ctx.save();ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
 if(slot.kind==='unit'){const layout=songLayout(ctx,w,h,slot.title);drawContained(ctx,img,layout.coverX,layout.coverY,layout.cover,layout.cover);ctx.font=layout.font;ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#111';layout.lines.forEach((line,index)=>ctx.fillText(line,w/2,layout.firstBaseline+index*layout.lineHeight))}
 else{ctx.font='700 25px '+FONT_FAMILY;const lines=wrapText(ctx,slot.title,w-30),lineHeight=31,captionHeight=lines.length*lineHeight,maxH=h-captionHeight-36,maxW=w-32,scale=Math.min(maxW/img.width,maxH/img.height),dw=img.width*scale,dh=img.height*scale,top=(h-dh-captionHeight-12)/2;ctx.drawImage(img,(w-dw)/2,top,dw,dh);ctx.fillStyle='#111';ctx.textAlign='center';lines.forEach((line,index)=>centeredText(ctx,line,w/2,top+dh+18+index*lineHeight))}ctx.restore();
}
async function remoteCardImage(url,signal){const parsed=new URL(url);if(parsed.protocol!=='https:'||!['resources.cosmo.fans','imagedelivery.net','static.cosmo.fans','wsrv.nl','images.weserv.nl'].includes(parsed.hostname))throw new Error('image source');const response=await fetch(url,{signal,credentials:'omit'});if(!response.ok)throw new Error('card image');const blob=await response.blob();if(blob.size>20*1024*1024||!blob.type.startsWith('image/'))throw new Error('image');const objectURL=URL.createObjectURL(blob);try{const img=await image(objectURL),scale=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.92)}finally{images.delete(objectURL);URL.revokeObjectURL(objectURL)}}
async function chooseCollection(item,kind,signal){const target=selected,currentEpoch=epoch,currentSession=session,job=++jobs[target];const src=kind==='unit'?item.image:await remoteCardImage(item.image,signal);await image(src);if(signal.aborted||currentEpoch!==epoch||currentSession!==session||job!==jobs[target]||!$(kind==='unit'?'unitModal':'objektModal').open)return;
 const slot=kind==='unit'?{kind:'unit',src,unitId:item.id,title:item.name,label:item.name}:{kind:'objekt',src,title:item.member+' '+item.number+' · '+item.season,label:item.member+' '+item.number,member:item.member,memberId:NAMES.indexOf(item.member)+1,number:item.number,season:item.season,cardSource:item.source};change(()=>state.slots[target]=slot);collectionPickers.close();
}
function clearCollection(){jobs[selected]++;change(()=>state.slots[selected]=null);collectionPickers.close()}
function paint(ctx,img,w,h,s){if(s.kind==='none'){ctx.save();ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.font='700 86px '+FONT_FAMILY;ctx.fillStyle='#555';ctx.textAlign='center';centeredText(ctx,'無',w/2,h/2);ctx.restore();return}if(s.kind==='song'){paintSong(ctx,img,w,h,s);return}if(s.kind==='unit'||s.kind==='objekt'){paintCollection(ctx,img,w,h,s);return}const p=placement(img.width,img.height,w,h,s);ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();ctx.drawImage(img,p.dx,p.dy,p.dw,p.dh);ctx.restore()}
async function draw(target=canvas,snapshot=cloneState(state)){
 const generation=++drawVersion,config=getTable(snapshot.tableId);await typographyReady;
 const [background,photos]=await Promise.all([image(config.template),Promise.all(snapshot.slots.map(s=>s&&s.kind!=='none'?image(s.src):null))]);
 if(target===canvas&&(generation!==drawVersion||snapshot.tableId!==state.tableId))return;
 target.width=config.width;target.height=config.height;const ctx=target.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,target.width,target.height);ctx.drawImage(background,0,0);
 photos.forEach((img,i)=>{if(!snapshot.slots[i])return;const r=config.rects[i];ctx.save();ctx.translate(r.x,r.y);paint(ctx,img,r.w,r.h,snapshot.slots[i]);ctx.restore()});
 if(config.id==='3.5'){paintTableFrame(ctx);paintTableTypography(ctx,background)}paintCustomTopics(ctx,snapshot,config);
}
function render(){const drawing=draw().catch(()=>status('有張照片無法讀取，請點選該格重新選擇。',true));updateButtons();document.querySelectorAll('.grid-button').forEach((b,i)=>b.setAttribute('aria-label',`第 ${i+1} 格：${labels()[i]}，${state.slots[i]?.kind==='none'?'無':['song','unit','objekt'].includes(state.slots[i]?.kind)?state.slots[i].title:state.slots[i]?'已有照片':'尚未填入'}`));document.querySelectorAll('.label-button').forEach((b,i)=>{b.setAttribute('aria-label','更換第 '+(i+1)+' 格項目：'+labels()[i]);b.title='更換項目：'+labels()[i]});if(modal.open)renderCrop();return drawing}
function buildTargets(){$('gridButtons').replaceChildren();rects.forEach((r,i)=>{const b=document.createElement('button');b.className='grid-button';b.style.cssText=`left:${r.x/template.width*100}%;top:${r.y/template.height*100}%;width:${r.w/template.width*100}%;height:${r.h/template.height*100}%`;b.onclick=()=>openModal(i);$('gridButtons').append(b)});table().captionRects.forEach((r,i)=>{const b=document.createElement('button');b.className='label-button';b.style.cssText=`left:${r.x/template.width*100}%;top:${r.y/template.height*100}%;width:${r.w/template.width*100}%;height:${r.h/template.height*100}%`;b.onclick=()=>openTopicEditor(i);$('gridButtons').append(b)})}
function setFillKind(kind){document.querySelectorAll('.fill-kind').forEach(select=>select.value=kind)}
function openModal(i,kind){
 if(!ready)return;const saved=state.slots[i];kind=kind||(['song','unit','objekt'].includes(saved?.kind)?saved.kind:saved?'photo':topicFor(state,i).kind);
 for(const dialog of [modal,songModal,$('unitModal'),$('objektModal')])if(dialog.open)dialog.close();
 stopDragging();finishEdit();collectionPickers.cancel();selected=i;setFillKind(kind);
 if(kind==='song'){openSongModal(i);return}
 if(kind==='unit'||kind==='objekt'){session++;if(kind==='unit')collectionPickers.openUnit({title:labels()[i]});else collectionPickers.openObjekt({title:labels()[i],member:saved?.member||NAMES[0],number:saved?.number||'',season:saved?.season||''});return}
 session++;memberPhotos.reset();showUploadStatus('');resetUploadDrag();$('uploadBtn').removeAttribute('aria-busy');$('modalTitle').textContent=`第 ${i+1} 格：${labels()[i]}`;$('searchInput').value='';filterMembers();$('cropSection').open=false;status('',false,true);const rect=rects[i];$('cropPreview').width=rect.w;$('cropPreview').height=rect.h;renderCrop();modal.showModal();
}
let topicTarget=0,topicTableId='3.5';
function refreshModalTitles(){const title=labels()[selected];$('modalTitle').textContent='第 '+(selected+1)+' 格：'+title;$('songModalTitle').textContent=title;$('unitModalTitle').textContent=title;$('objektModalTitle').textContent=title}
function openTopicEditor(index){
 if(!ready)return;stopDragging();finishEdit();topicTarget=index;topicTableId=state.tableId;
 const current=topicFor(state,index);$('topicModalTitle').textContent='第 '+(index+1)+' 格的項目';$('topicText').setCustomValidity('');$('topicText').value=current.text;$('topicKind').value=current.kind;
 const preset=TOPIC_OPTIONS.findIndex(p=>p.text===current.text&&p.kind===current.kind);$('topicPreset').value=preset<0?'custom':String(preset);updateTopicCount();$('topicModal').showModal();
}
function updateTopicCount(){$('topicCount').textContent=Array.from($('topicText').value).length+'／40 字'}
function applyTopic(reset=false){
 if(topicTableId!==state.tableId||!ready){$('topicModal').close();return}
 const text=$('topicText').value.replace(/\s+/g,' ').trim(),kind=$('topicKind').value;
 if(!reset&&Array.from(text).length>40){$('topicText').setCustomValidity('項目名稱最多 40 字。');$('topicText').reportValidity();return}
 const original=getTable(state.tableId),isOriginal=text===original.labels[topicTarget]&&kind===slotType(state.tableId,topicTarget);
 change(()=>state.topics[topicTarget]=reset||isOriginal?null:{text,kind});refreshModalTitles();$('topicModal').close();
}
const presetSelect=$('topicPreset');const customOption=document.createElement('option');customOption.value='custom';customOption.textContent='自行輸入';presetSelect.append(customOption);
TOPIC_OPTIONS.forEach((topic,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=topic.text;presetSelect.append(option)});
presetSelect.onchange=()=>{const preset=TOPIC_OPTIONS[Number(presetSelect.value)];if(presetSelect.value!=='custom'&&preset){$('topicText').setCustomValidity('');$('topicText').value=preset.text;$('topicKind').value=preset.kind;updateTopicCount()}else $('topicText').focus()};
$('topicText').oninput=()=>{$('topicText').setCustomValidity('');$('topicPreset').value='custom';updateTopicCount()};
$('topicForm').onsubmit=e=>{e.preventDefault();applyTopic()};$('resetTopicBtn').onclick=()=>applyTopic(true);$('cancelTopicBtn').onclick=()=>$('topicModal').close();
for(const dialog of [modal,songModal,$('unitModal'),$('objektModal')]){const button=document.createElement('button');button.type='button';button.className='secondary edit-label-btn';button.textContent='更換項目名稱';button.onclick=()=>openTopicEditor(selected);dialog.querySelector('h3').after(button)}
function closeModal(){stopDragging();finishEdit();modal.close()}
function renderCrop(){
 const s=state.slots[selected],none=s?.kind==='none',structured=s&&['unit','objekt','song'].includes(s.kind);$('noneSelection').hidden=!none;$('cropSection').hidden=!s||none||structured;
 if(!s||none||structured){previewImage=null;previewSource=null;return}
 $('zoomRange').value=s.z??1;$('zoomValue').textContent=Math.round((s.z??1)*100)+'%';
 const target=selected;
 image(s.src).then(img=>{
  if(target!==selected||state.slots[target]?.src!==s.src)return;
  previewImage=img;previewSource=s.src;
  const c=$('cropPreview'),ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);paint(ctx,img,c.width,c.height,state.slots[target]);
 }).catch(()=>{});
}
function refreshCrop(){if(!cropFrame)cropFrame=requestAnimationFrame(()=>{cropFrame=0;render()})}
function startDragging(e){
 if(!e.isPrimary||e.button!==0||!state.slots[selected]||!previewImage)return;
 const c=$('cropPreview'),s=state.slots[selected];
 if(previewSource!==s.src)return;
 c.focus({preventScroll:true});finishEdit();beginEdit();
 const box=c.getBoundingClientRect(),p=placement(previewImage.width,previewImage.height,box.width,box.height,s);
 drag={id:e.pointerId,target:selected,src:s.src,startX:e.clientX,startY:e.clientY,x:s.x??0,y:s.y??0,rangeX:(p.dw-box.width)/2,rangeY:(p.dh-box.height)/2};
 c.setPointerCapture(e.pointerId);c.classList.add('dragging');e.preventDefault();
}
function moveDragging(e){
 if(!drag||drag.id!==e.pointerId)return;
 const s=state.slots[drag.target];
 if(selected!==drag.target||s?.src!==drag.src){stopDragging();return}
 s.x=drag.rangeX>.01?clamp(drag.x+(e.clientX-drag.startX)/drag.rangeX,-1,1):0;
 s.y=drag.rangeY>.01?clamp(drag.y+(e.clientY-drag.startY)/drag.rangeY,-1,1):0;
 refreshCrop();e.preventDefault();
}
function stopDragging(e){
 if(!drag||(e&&e.pointerId!==drag.id))return;
 const id=drag.id,c=$('cropPreview');drag=null;c.classList.remove('dragging');
 if(c.hasPointerCapture(id))c.releasePointerCapture(id);
 finishEdit();
}
function moveWithKeyboard(e){
 const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
 if(!directions[e.key]||!previewImage||!state.slots[selected])return;
 e.preventDefault();beginEdit();
 const c=$('cropPreview'),box=c.getBoundingClientRect(),s=state.slots[selected],p=placement(previewImage.width,previewImage.height,box.width,box.height,s),delta=e.shiftKey?12:4;
 const [dx,dy]=directions[e.key];
 if(dx&&p.dw-box.width>.01)s.x=clamp((s.x??0)+dx*delta*2/(p.dw-box.width),-1,1);
 if(dy&&p.dh-box.height>.01)s.y=clamp((s.y??0)+dy*delta*2/(p.dh-box.height),-1,1);
 refreshCrop();
}
function buildMembers(){const none=document.createElement('button');none.className='member-btn member-none';none.dataset.member='0';none.setAttribute('aria-label','無，不選擇成員');const icon=document.createElement('span');icon.className='none-avatar';icon.textContent='—';icon.setAttribute('aria-hidden','true');const label=document.createElement('b');label.textContent='無';const detail=document.createElement('span');detail.textContent='不選擇成員';none.append(icon,label,detail);none.onclick=()=>{jobs[selected]++;change(()=>state.slots[selected]={kind:'none',label:'無'});closeModal()};NAMES.forEach((name,i)=>{const b=document.createElement('button');b.className='member-btn';b.dataset.member=i+1;b.setAttribute('aria-label',`S${i+1} ${name}`);const img=document.createElement('img');img.src=`assets/thumbs/s${i+1}.webp?v=5`;img.alt='';img.loading='lazy';const code=document.createElement('b');code.textContent=`S${i+1}`;const label=document.createElement('span');label.textContent=name;b.append(img,code,label);b.onclick=()=>memberPhotos.open(i+1);$('memberGrid').append(b)});$('memberGrid').append(none)}
function filterMembers(){const q=$('searchInput').value.trim().toLowerCase().replace(/^s0+(\d)/,'s$1');let n=0;document.querySelectorAll('.member-btn').forEach(b=>{const id=Number(b.dataset.member),name=id?NAMES[id-1].toLowerCase():'無 none 沒有';const match=!q||name.includes(q)||(id>0&&(q==='s'+id||q===String(id)));b.hidden=!match;if(match)n++});$('noResults').hidden=n>0}
async function selectMember(id){const target=selected,currentEpoch=epoch,currentSession=session,job=++jobs[target],src=`assets/s${id}.jpg`;status('正在載入照片…',false,true);try{await image(src);if(currentEpoch!==epoch||job!==jobs[target]||currentSession!==session||!modal.open)return;change(()=>state.slots[target]={src,label:NAMES[id-1],memberId:id,...defaultCrop(id),cropPreset:1});if(modal.open&&currentSession===session)closeModal()}catch{if(currentSession===session)status('照片載入失敗，請再試一次。',true,true)}}
async function chooseInternetPhoto(photo,id,signal){
 const target=selected,currentEpoch=epoch,currentSession=session,job=++jobs[target];
 const response=await fetch(photo.url,{signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw new Error('photo');
 const blob=await response.blob();if(blob.size>20*1024*1024||!/^image\/(jpeg|png|webp)(?:;|$)/i.test(blob.type))throw new Error('photo');
 const objectURL=URL.createObjectURL(blob);let src;
 try{const img=await image(objectURL);const ratio=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*ratio));c.height=Math.max(1,Math.round(img.height*ratio));const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);src=c.toDataURL('image/jpeg',.9)}finally{images.delete(objectURL);URL.revokeObjectURL(objectURL)}
 if(signal.aborted||currentEpoch!==epoch||currentSession!==session||job!==jobs[target]||!modal.open||selected!==target)return;
 await image(src);if(signal.aborted||currentSession!==session||currentEpoch!==epoch||job!==jobs[target]||!modal.open)return;
 change(()=>state.slots[target]={src,label:NAMES[id-1],memberId:id,z:1,x:0,y:0,cropPreset:1,photoSource:photo.source,photoTitle:photo.title});closeModal();
}
function showUploadStatus(text,error=false){const el=$('uploadStatus');el.textContent=text;el.hidden=!text;el.classList.toggle('error',error)}
function newUploadRequest(){return {target:selected,currentEpoch:epoch,currentSession:session,job:++jobs[selected]}}
async function upload(file,request){
 if(!file||!request)return;const {target,currentEpoch,currentSession,job}=request;
 const active=()=>currentEpoch===epoch&&currentSession===session&&job===jobs[target]&&modal.open;
 if(!active())return;
 if(!file.type.startsWith('image/')){showUploadStatus('請拖入圖片檔案，或點擊框框選擇圖片。',true);return}
 if(file.size>20*1024*1024){showUploadStatus('照片超過 20 MB，請先縮小檔案。',true);return}
 memberPhotos.cancel();showUploadStatus('正在處理照片…');$('uploadBtn').setAttribute('aria-busy','true');
 try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)});const img=await image(data);const ratio=Math.min(1,1600/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*ratio));c.height=Math.max(1,Math.round(img.height*ratio));const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);const src=c.toDataURL('image/jpeg',.9);images.delete(data);if(!active())return;await image(src);if(!active())return;change(()=>state.slots[target]={src,label:'我的照片',memberId:null,z:1,x:0,y:0});closeModal()}
 catch{if(active())showUploadStatus('無法讀取這張圖片，請使用 JPG、PNG 或 WebP。',true)}
 finally{if(currentSession===session&&job===jobs[target])$('uploadBtn').removeAttribute('aria-busy')}
}
function readDraftKey(key){return new Promise((resolve,reject)=>{if(!db){resolve();return}const req=db.transaction('drafts','readonly').objectStore('drafts').get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function openDraft(tableId){await new Promise((resolve,reject)=>{const req=indexedDB.open('wav-studio',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('drafts'))req.result.createObjectStore('drafts')};req.onerror=()=>reject(req.error);req.onsuccess=()=>{db=req.result;db.onversionchange=()=>db.close();resolve()}});return readVersionDraft(tableId)}
async function readVersionDraft(tableId){if(draftCache.has(tableId))return draftCache.get(tableId);const saved=await readDraftKey('table:'+tableId);return saved||(tableId==='3.5'?await readDraftKey('current'):undefined)}
async function switchTable(id){
 if(switching||!TABLE_IDS.includes(id)||id===state.tableId)return;switching=true;const wasReady=ready;stopDragging();finishEdit();ready=false;updateButtons();
 for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();collectionPickers.cancel();memberPhotos.cancel();epoch++;session++;clearTimeout(saveTimer);
 document.querySelectorAll('[data-table]').forEach(b=>b.disabled=true);$('downloadBtn').disabled=true;
 try{await save();const config=getTable(id),[nextTemplate,draft]=await Promise.all([image(config.template),readVersionDraft(id)]);ready=false;state=validDraft(draft)&&restoreState(draft).tableId===id?restoreState(draft):freshState(id);template=nextTemplate;rects=config.rects;jobs=Array(state.slots.length).fill(0);history.length=0;selected=0;previewImage=null;previewSource=null;buildTargets();updateTableUI();await render();ready=true;updateButtons();try{localStorage.setItem('wav-studio-table',id)}catch{}status('')}
 catch{ready=wasReady;updateButtons();status('版本載入失敗，請再試一次。',true)}finally{switching=false;document.querySelectorAll('[data-table]').forEach(b=>b.disabled=false);$('downloadBtn').disabled=!ready}
}
function updateTableUI(){document.title='tripleS 生涯表 '+state.tableId+' 產生器';$('pageTitle').textContent=document.title;document.querySelectorAll('[data-table]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.table===state.tableId)))}
function scheduleSave(){if(!ready)return;clearTimeout(saveTimer);status('正在儲存草稿…');saveTimer=setTimeout(save,200)}
function save(){clearTimeout(saveTimer);const snapshot=cloneState(state);draftCache.set(snapshot.tableId,snapshot);if(!db){status('無法保存草稿，完成後請下載圖片備份。',true);return}writeChain=writeChain.catch(()=>{}).then(()=>new Promise((resolve,reject)=>{try{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put(snapshot,'table:'+snapshot.tableId);tx.oncomplete=()=>{if(same(snapshot,state))status('草稿已自動保存在此瀏覽器');resolve()};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)}catch(e){reject(e)}})).catch(()=>status('草稿儲存失敗，完成後請下載圖片備份。',true));return writeChain}
function undo(){finishEdit();if(!history.length)return;epoch++;jobs=jobs.map(v=>v+1);state=history.pop();render();scheduleSave()}
const snapshotVersion=()=>state.tableId.replace('.','-');
async function download(){const exportVersion=snapshotVersion();finishEdit();$('downloadBtn').disabled=true;$('downloadBtn').textContent='正在產生圖片…';try{const c=document.createElement('canvas');await draw(c,cloneState(state));const blob=await new Promise((resolve,reject)=>c.toBlob(v=>v?resolve(v):reject(new Error('blob')),'image/png'));const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='my_tripleS_table_'+exportVersion+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)}catch{status('圖片匯出失敗，請稍後再試。',true)}finally{$('downloadBtn').disabled=false;$('downloadBtn').textContent='保存我的生涯表 (PNG)'}}

let catalog=null,catalogPromise=null,albumFilter=null;
const normalizeSearch=text=>String(text).normalize('NFKC').toLocaleLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
async function loadCatalog(){
 if(catalog)return catalog;
 if(!catalogPromise)catalogPromise=fetch('catalog.json?v=7').then(response=>{if(!response.ok)throw new Error('catalog');return response.json()}).then(data=>{
  if(!Array.isArray(data.albums)||!Array.isArray(data.tracks)||!data.tracks.length)throw new Error('catalog');
  catalog={...data,albumById:new Map(data.albums.map(a=>[a.id,a]))};return catalog;
 }).catch(error=>{catalogPromise=null;throw error});
 return catalogPromise;
}
async function openSongModal(index){
 stopDragging();finishEdit();selected=index;session++;const currentSession=session;
 $('songModalTitle').textContent=labels()[index];$('songSearch').value='';albumFilter=null;
 $('songList').replaceChildren();$('albumGrid').replaceChildren();$('songCount').textContent='';$('songEmpty').hidden=true;
 $('songStatus').textContent='正在載入曲庫…';$('songStatus').classList.remove('error');renderCurrentSong();songModal.showModal();
 try{await loadCatalog();if(!songModal.open||currentSession!==session)return;$('songStatus').textContent='';renderSongLibrary()}
 catch{if(songModal.open&&currentSession===session){$('songStatus').textContent='曲庫載入失敗，請關閉後再試一次。';$('songStatus').classList.add('error')}}
}
function renderCurrentSong(){
 const slot=state.slots[selected];$('currentSong').hidden=!slot;
 $('currentSongName').textContent=slot?.kind==='song'?'目前選擇：'+slot.title:slot?'目前已有圖片，可重新選歌替換。':'';
}
function renderSongLibrary(){
 if(!catalog)return;const query=normalizeSearch($('songSearch').value);
 const albumsRoot=$('albumGrid');albumsRoot.replaceChildren();
 for(const album of catalog.albums){
  const tracks=catalog.tracks.filter(t=>t.albumId===album.id);
  const matches=!query||normalizeSearch(album.title+' '+album.artist).includes(query)||tracks.some(t=>normalizeSearch(t.title).includes(query));
  if(!matches)continue;
  const button=document.createElement('button');button.className='album-btn';button.dataset.album=album.id;button.title=album.title;button.setAttribute('aria-label',album.title+'，'+album.trackCount+' 首');button.setAttribute('aria-pressed',String(albumFilter===album.id));
  const img=document.createElement('img');img.src=album.cover;img.alt='';img.loading='lazy';
  const label=document.createElement('span');label.textContent=album.title;
  button.append(img,label);button.onclick=()=>{albumFilter=album.id;$('songSearch').value='';renderSongLibrary()};albumsRoot.append(button);
 }
 const matches=catalog.tracks.filter(track=>{
  if(albumFilter&&track.albumId!==albumFilter)return false;
  const album=catalog.albumById.get(track.albumId);return !query||normalizeSearch(track.title+' '+track.artist+' '+album.title).includes(query);
 });
 $('songList').replaceChildren();
 for(const track of matches){
  const album=catalog.albumById.get(track.albumId),button=document.createElement('button');button.className='song-track';button.dataset.song=track.id;
  button.setAttribute('aria-label','選擇 '+track.title+'，'+album.title);button.setAttribute('aria-pressed',String(state.slots[selected]?.songId===track.id));
  const img=document.createElement('img');img.src=album.cover;img.alt='';img.loading='lazy';
  const text=document.createElement('span'),name=document.createElement('strong'),detail=document.createElement('small');name.textContent=track.title;detail.textContent=album.title;text.append(name,detail);button.append(img,text);button.onclick=()=>chooseSong(track.id);$('songList').append(button);
 }
 $('allAlbumsBtn').setAttribute('aria-pressed',String(!albumFilter));$('songCount').textContent=matches.length+' 首曲目';$('songEmpty').hidden=matches.length>0;renderCurrentSong();
}
async function chooseSong(id){
 const track=catalog?.tracks.find(t=>t.id===id);if(!track)return;
 const album=catalog.albumById.get(track.albumId),target=selected,currentEpoch=epoch,currentSession=session,job=++jobs[target];
 $('songStatus').textContent='正在放入歌曲…';$('songStatus').classList.remove('error');
 try{
  await image(album.cover);if(currentEpoch!==epoch||jobs[target]!==job||currentSession!==session||!songModal.open)return;
  change(()=>state.slots[target]={kind:'song',songId:track.id,title:track.title,albumId:album.id,albumTitle:album.title,src:album.cover,label:track.title});
  if(songModal.open&&currentSession===session)songModal.close();
 }catch{if(songModal.open&&currentSession===session){$('songStatus').textContent='封面載入失敗，請再選一次。';$('songStatus').classList.add('error')}}
}
$('songSearch').oninput=()=>{albumFilter=null;renderSongLibrary()};
$('allAlbumsBtn').onclick=()=>{albumFilter=null;$('songSearch').value='';renderSongLibrary()};
$('closeSongBtn').onclick=()=>songModal.close();
$('clearSongBtn').onclick=()=>{jobs[selected]++;change(()=>state.slots[selected]=null);renderSongLibrary()};
$('searchInput').oninput=filterMembers;
const uploadZone=$('uploadBtn');let uploadDragDepth=0;
const hasFiles=e=>Array.from(e.dataTransfer?.types||[]).includes('Files');
function resetUploadDrag(){uploadDragDepth=0;uploadZone.classList.remove('drag-over')}
uploadZone.onclick=()=>{uploadRequest=newUploadRequest();$('fileInput').click()};
$('fileInput').onchange=e=>{const file=e.target.files[0],request=uploadRequest;e.target.value='';uploadRequest=null;upload(file,request)};
$('fileInput').addEventListener('cancel',()=>{uploadRequest=null});
uploadZone.addEventListener('dragenter',e=>{if(!hasFiles(e))return;e.preventDefault();uploadDragDepth++;uploadZone.classList.add('drag-over')});
uploadZone.addEventListener('dragover',e=>{if(!hasFiles(e))return;e.preventDefault();e.dataTransfer.dropEffect='copy'});
uploadZone.addEventListener('dragleave',e=>{e.preventDefault();uploadDragDepth=Math.max(0,uploadDragDepth-1);if(!uploadDragDepth)uploadZone.classList.remove('drag-over')});
uploadZone.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();resetUploadDrag();const files=Array.from(e.dataTransfer?.files||[]);if(files.length!==1){showUploadStatus(files.length>1?'每次請拖入一張圖片。':'請拖入圖片檔案，或點擊框框選擇圖片。',true);return}upload(files[0],newUploadRequest())});
for(const type of ['dragover','drop'])document.addEventListener(type,e=>{if(hasFiles(e))e.preventDefault()});
document.addEventListener('paste',e=>{
 if(!modal.open||!e.clipboardData)return;
 const items=Array.from(e.clipboardData.items||[]).filter(item=>item.kind==='file'&&item.type.startsWith('image/'));
 const fromItems=items.map(item=>item.getAsFile()).filter(Boolean);
 const files=fromItems.length?fromItems:Array.from(e.clipboardData.files||[]).filter(file=>file.type.startsWith('image/'));
 if(!files.length)return;
 e.preventDefault();
 if(files.length>1){showUploadStatus('每次請貼上一張圖片。',true);return}
 upload(files[0],newUploadRequest());
});
$('closeBtn').onclick=closeModal;modal.addEventListener('close',()=>{resetUploadDrag();memberPhotos.cancel();stopDragging();finishEdit()});modal.addEventListener('cancel',()=>{memberPhotos.cancel();stopDragging();finishEdit()});
for(const [id,key] of [['zoomRange','z']]){const el=$(id);el.onfocus=beginEdit;el.onpointerdown=beginEdit;el.oninput=()=>{beginEdit();if(!state.slots[selected])return;state.slots[selected][key]=Number(el.value);render();scheduleSave()};el.onchange=finishEdit;el.onblur=finishEdit}

const cropPreview=$('cropPreview');
cropPreview.addEventListener('pointerdown',startDragging);
cropPreview.addEventListener('pointermove',moveDragging);
for(const type of ['pointerup','pointercancel','lostpointercapture'])cropPreview.addEventListener(type,stopDragging);
cropPreview.addEventListener('keydown',moveWithKeyboard);
cropPreview.addEventListener('keyup',e=>{if(e.key.startsWith('Arrow'))finishEdit()});
cropPreview.addEventListener('blur',()=>{stopDragging();finishEdit()});
$('resetCropBtn').onclick=()=>change(()=>{if(state.slots[selected])Object.assign(state.slots[selected],defaultCrop(state.slots[selected].photoSource?null:state.slots[selected].memberId),{cropPreset:1})});
$('clearNoneBtn').onclick=$('clearSlotBtn').onclick=()=>{jobs[selected]++;change(()=>state.slots[selected]=null);closeModal()};
$('downloadBtn').onclick=download;$('undoBtn').onclick=undo;
$('clearAllBtn').onclick=()=>$('confirmModal').showModal();$('cancelClearBtn').onclick=()=>$('confirmModal').close();$('confirmClearBtn').onclick=()=>{$('confirmModal').close();epoch++;jobs=jobs.map(v=>v+1);change(()=>state=freshState(state.tableId))};
for(const d of [modal,songModal,$('unitModal'),$('objektModal'),$('confirmModal'),$('topicModal')])d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()});
document.addEventListener('keydown',e=>{if(!e.target.closest('input,textarea')&&!document.querySelector('dialog[open]')&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ready)save()});window.addEventListener('pagehide',()=>{if(ready)save()});
document.querySelectorAll('[data-table]').forEach(button=>button.onclick=()=>switchTable(button.dataset.table));
document.querySelectorAll('.fill-kind').forEach(select=>select.onchange=()=>openModal(selected,select.value));
try{let preferred='3.5';try{const stored=localStorage.getItem('wav-studio-table');if(TABLE_IDS.includes(stored))preferred=stored}catch{}
 state=freshState(preferred);let draft;try{draft=await openDraft(preferred)}catch{}
 if(validDraft(draft)&&restoreState(draft).tableId===preferred)state=restoreState(draft);template=await image(table().template);rects=table().rects;jobs=Array(state.slots.length).fill(0);buildTargets();buildMembers();updateTableUI();ready=true;render();$('downloadBtn').disabled=false;status(db?'各版本會分開保留填寫內容。':'無法保存草稿，完成後請下載圖片備份。',!db)
}catch{status('表格載入失敗，請重新整理頁面。',true)}
