import {getTable,TABLE_IDS} from './table-versions.js?v=20';
export {getTable,TABLE_IDS,slotType,TOPIC_OPTIONS} from './table-versions.js?v=20';
export const NAMES=['SeoYeon','HyeRin','JiWoo','ChaeYeon','YooYeon','SooMin','NaKyoung','YuBin','Kaede','DaHyun','Kotone','YeonJi','Nien','SoHyun','Xinyu','Mayu','Lynn','JooBin','HaYeon','ShiOn','ChaeWon','Sullin','SeoAh','JiYeon'];
export const LABELS=getTable('3.5').labels;
export const freshState=(tableId='3.5')=>({version:5,tableId:getTable(tableId).id,slots:Array(getTable(tableId).labels.length).fill(null),topics:Array(getTable(tableId).labels.length).fill(null)});
export const cloneState=s=>({version:5,tableId:s.tableId||'3.5',slots:s.slots.map(v=>v?{...v}:null),topics:s.slots.map((_,i)=>s.topics?.[i]?{...s.topics[i]}:null)});
export const topicFor=(s,index)=>s.topics?.[index]||{text:getTable(s.tableId).labels[index],kind:getTable(s.tableId).special[index]||'photo'};
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function placement(iw,ih,w,h,s){const scale=Math.max(w/iw,h/ih)*clamp(Number(s.z)||1,1,3);const dw=iw*scale,dh=ih*scale;return {dw,dh,dx:(w-dw)/2+clamp(Number(s.x)||0,-1,1)*(dw-w)/2,dy:(h-dh)/2+clamp(Number(s.y)||0,-1,1)*(dh-h)/2}}
export function validDraft(s){
 if(!s||![1,2,3,4,5].includes(s.version)||!Array.isArray(s.slots))return false;
 if(s.version>=4?(!TABLE_IDS.includes(s.tableId)||s.slots.length!==getTable(s.tableId).labels.length):s.slots.length!==12)return false;
 if(s.version===5&&(!Array.isArray(s.topics)||s.topics.length!==s.slots.length||!s.topics.every(v=>v===null||(v&&typeof v.text==='string'&&Array.from(v.text).length<=40&&['photo','song','unit','objekt'].includes(v.kind)))))return false;
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
export function restoreState(s){const slots=s.slots.map(restoreSlot);if(s.version<3)[slots[10],slots[11]]=[slots[11],slots[10]];return {version:5,tableId:s.version>=4?s.tableId:'3.5',slots,topics:slots.map((_,i)=>s.version===5&&s.topics[i]?{...s.topics[i]}:null)}}
export const isSongSlot=(index,tableId='3.5')=>getTable(tableId).special[index]==='song';
export const defaultCrop=id=>({z:1,x:Number(id)===2?0.65:0,y:0});
export function restoreSlot(slot){if(!slot)return null;const restored={...slot};if(restored.kind==='unit'&&restored.unitId==='ot24'){restored.title='tripleS';restored.label='tripleS'}if(Number(restored.memberId)===2&&!restored.cropPreset){if((restored.z??1)===1&&(restored.x??0)===0&&(restored.y??0)===0)Object.assign(restored,defaultCrop(2));restored.cropPreset=1}return restored}
