export const NAMES = ['SeoYeon','HyeRin','JiWoo','ChaeYeon','YooYeon','SooMin','NaKyoung','YuBin','Kaede','DaHyun','Kotone','YeonJi','Nien','SoHyun','Xinyu','Mayu','Lynn','JooBin','HaYeon','ShiOn','ChaeWon','Sullin','SeoAh','JiYeon'];
export const LABELS = ['我的最愛','人間小甜豆','女神我好愛你','羨慕她的粉絲','最近出軌','看到她就心情好','不准偷家','團寵寶寶大人','好奇怪的人（褒意）','談了不官宣很牛嗎','最愛的一首歌','最被低估的一首歌'];
export const freshState=()=>({version:3,slots:Array(12).fill(null)});
export const cloneState=s=>({version:3,slots:s.slots.map(v=>v?{...v}:null)});
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function placement(iw,ih,w,h,s){const scale=Math.max(w/iw,h/ih)*clamp(Number(s.z)||1,1,3);const dw=iw*scale,dh=ih*scale;return {dw,dh,dx:(w-dw)/2+clamp(Number(s.x)||0,-1,1)*(dw-w)/2,dy:(h-dh)/2+clamp(Number(s.y)||0,-1,1)*(dh-h)/2}}
export function validDraft(s){
 if(!s||![1,2,3].includes(s.version)||!Array.isArray(s.slots)||s.slots.length!==12)return false;
 return s.slots.every(v=>{
  if(v===null)return true;
  if(typeof v.src!=='string')return false;
  if(v.kind==='song')return /^assets\/albums\/(?:[0-9]+|touch-plus)\.jpg$/.test(v.src)&&typeof v.title==='string'&&v.title.length<400&&typeof v.songId==='string'&&typeof v.albumId==='string';
  return /^assets\/s(?:[1-9]|1[0-9]|2[0-4])\.jpg$/.test(v.src)||/^data:image\/(jpeg|png|webp);base64,/.test(v.src);
 });
}
export function restoreState(s){const slots=s.slots.map(restoreSlot);if(s.version<3)[slots[10],slots[11]]=[slots[11],slots[10]];return {version:3,slots}}
export const isSongSlot=index=>index===10||index===11;

// S2's face sits left of the image center; align the face, not the file bounds.
export const defaultCrop=id=>({z:1,x:Number(id)===2?0.65:0,y:0});
export function restoreSlot(slot){if(!slot)return null;const restored={...slot};if(Number(restored.memberId)===2&&!restored.cropPreset){if((restored.z??1)===1&&(restored.x??0)===0&&(restored.y??0)===0)Object.assign(restored,defaultCrop(2));restored.cropPreset=1}return restored}
