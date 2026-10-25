import {UNIT_IMAGES} from './unit-images.js?v=28';
import {getTable,TABLE_IDS,normalizeGrid} from './table-versions.js?v=28';
export {getTable,TABLE_IDS,slotType,TOPIC_OPTIONS,normalizeGrid} from './table-versions.js?v=28';
export const NAMES=['SeoYeon','HyeRin','JiWoo','ChaeYeon','YooYeon','SooMin','NaKyoung','YuBin','Kaede','DaHyun','Kotone','YeonJi','Nien','SoHyun','Xinyu','Mayu','Lynn','JooBin','HaYeon','ShiOn','ChaeWon','Sullin','SeoAh','JiYeon'];
export const LABELS=getTable('3.5').labels;
export const DEFAULT_TITLE='tripleS 生涯表';
export const freshState=(tableId='3.5',grid)=>{const config=getTable(tableId,grid);return {version:7,title:DEFAULT_TITLE,tableId:config.id,...(config.id==='custom'?{grid:normalizeGrid(grid)}:{}),slots:Array(config.labels.length).fill(null),topics:Array(config.labels.length).fill(null)}};
export const cloneState=s=>({version:7,title:s.title??DEFAULT_TITLE,tableId:s.tableId||'3.5',...(s.tableId==='custom'?{grid:{...s.grid}}:{}),slots:s.slots.map(v=>v?{...v}:null),topics:s.slots.map((_,i)=>s.topics?.[i]?{...s.topics[i]}:null)});
export function resizeCustomState(s,grid){const next=cloneState(s),normalized=normalizeGrid(grid);next.grid=normalized;next.slots=Array.from({length:normalized.count},(_,i)=>next.slots[i]||null);next.topics=Array.from({length:normalized.count},(_,i)=>next.topics[i]||null);return next}
export const topicFor=(s,index)=>s.topics?.[index]||{text:getTable(s.tableId,s.grid).labels[index],kind:getTable(s.tableId,s.grid).special[index]||'photo'};
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function placement(iw,ih,w,h,s){const scale=Math.max(w/iw,h/ih)*clamp(Number(s.z)||1,1,3);const dw=iw*scale,dh=ih*scale;return {dw,dh,dx:(w-dw)/2+clamp(Number(s.x)||0,-1,1)*(dw-w)/2,dy:(h-dh)/2+clamp(Number(s.y)||0,-1,1)*(dh-h)/2}}
export function validDraft(s){
 if(!s||![1,2,3,4,5,6,7].includes(s.version)||!Array.isArray(s.slots))return false;
 if(s.tableId==='custom'&&(s.version<6||!s.grid||!Number.isInteger(s.grid.count)||!Number.isInteger(s.grid.cols)||s.grid.count<1||s.grid.count>60||s.grid.cols<1||s.grid.cols>6||s.grid.cols>s.grid.count))return false;
 if(s.version>=4?(!TABLE_IDS.includes(s.tableId)||s.slots.length!==getTable(s.tableId,s.grid).labels.length):s.slots.length!==12)return false;
 if(s.version>=5&&(!Array.isArray(s.topics)||s.topics.length!==s.slots.length||!s.topics.every(v=>v===null||(v&&typeof v.text==='string'&&Array.from(v.text).length<=40&&['photo','song','unit','objekt'].includes(v.kind)))))return false;
 if(s.version===7&&(typeof s.title!=='string'||Array.from(s.title).length>40))return false;
 return s.slots.every(v=>{
  if(v===null)return true;if(!v||typeof v!=='object')return false;
  if(v.kind==='none')return v.label==='無';
  if(typeof v.src!=='string')return false;
  if(v.kind==='song')return /^assets\/albums\/(?:[0-9]+|touch-plus)\.jpg$/.test(v.src)&&typeof v.title==='string'&&v.title.length<400&&typeof v.songId==='string'&&typeof v.albumId==='string';
  if(v.kind==='unit')return /^assets\/units\/[a-z0-9_-]+\.(png|jpe?g|webp)$/.test(v.src)&&typeof v.unitId==='string'&&typeof v.title==='string';
  if(v.kind==='objekt')return /^data:image\/(jpeg|png|webp);base64,/.test(v.src)&&typeof v.title==='string';
  return /^assets\/s(?:[1-9]|1[0-9]|2[0-4])\.jpg$/.test(v.src)||/^data:image\/(jpeg|png|webp);base64,/.test(v.src);
 });
}
export function restoreState(s){const slots=s.slots.map(restoreSlot);if(s.version<3)[slots[10],slots[11]]=[slots[11],slots[10]];return {version:7,title:s.version===7?s.title:DEFAULT_TITLE,tableId:s.version>=4?s.tableId:'3.5',...(s.tableId==='custom'?{grid:{...s.grid}}:{}),slots,topics:slots.map((_,i)=>s.version>=5&&s.topics[i]?{...s.topics[i]}:null)}}
export const isSongSlot=(index,tableId='3.5')=>getTable(tableId).special[index]==='song';
export const defaultCrop=id=>({z:1,x:Number(id)===2?0.65:0,y:0});
export function restoreSlot(slot){if(!slot)return null;const restored={...slot};if(restored.kind==='unit'&&UNIT_IMAGES[restored.unitId]){const photo=UNIT_IMAGES[restored.unitId];restored.src=photo.src;if(photo.credit){restored.credit=photo.credit;restored.creditSource=photo.creditSource}else{delete restored.credit;delete restored.creditSource}}if(restored.kind==='unit'&&restored.unitId==='ot24'){restored.title='tripleS';restored.label='tripleS'}if(Number(restored.memberId)===2&&!restored.cropPreset){if((restored.z??1)===1&&(restored.x??0)===0&&(restored.y??0)===0)Object.assign(restored,defaultCrop(2));restored.cropPreset=1}return restored}
