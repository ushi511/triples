export const FONT_FAMILY='"Table Sans", "Microsoft JhengHei", sans-serif';
export function wrapText(ctx,text,width){
 const lines=[];let line='';
 for(const char of Array.from(text)){
  if(line&&ctx.measureText(line+char).width>width){
   const space=line.lastIndexOf(' ');
   if(space>line.length/3){lines.push(line.slice(0,space).trim());line=line.slice(space+1)+char}
   else{lines.push(line.trim());line=char}
  }else line+=char;
 }
 if(line.trim())lines.push(line.trim());return lines;
}
export function fitSingleLine(ctx,text,maxSize,minSize,width){
 let size=maxSize;ctx.font='700 '+size+'px '+FONT_FAMILY;
 while(size>minSize&&ctx.measureText(text).width>width){size--;ctx.font='700 '+size+'px '+FONT_FAMILY}
 return size;
}
export function songLayout(ctx,w,h,title){
 let size=36,lines=[];ctx.textBaseline='alphabetic';
 do{ctx.font='700 '+size+'px '+FONT_FAMILY;lines=wrapText(ctx,title,w-28);if(lines.length<=4)break;size--}while(size>=30);
 const font='700 '+size+'px '+FONT_FAMILY;ctx.font=font;
 const metrics=lines.map(line=>ctx.measureText(line));
 const ascent=Math.max(...metrics.map(m=>m.actualBoundingBoxAscent),size*.65);
 const descent=Math.max(...metrics.map(m=>m.actualBoundingBoxDescent),0);
 const lineHeight=Math.ceil(size*1.22),captionHeight=ascent+descent+(lines.length-1)*lineHeight,gap=16;
 const cover=Math.min(w-64,h-48-gap-captionHeight),total=cover+gap+captionHeight,top=(h-total)/2;
 return {font,size,lines,lineHeight,ascent,descent,captionHeight,cover,coverX:(w-cover)/2,coverY:top,textX:w/2,firstBaseline:top+cover+gap+ascent,top,bottom:top+total};
}
