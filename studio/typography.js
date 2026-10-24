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

export function headerLayout(ctx,config,title){
 const headerHeight=config.headerHeight||{'1.0':219,'2.0':236,'3.0':270,'3.5':272}[config.id],scale=config.width/1451,hasLogo=config.id!=='1.0';
 const version=['3.0','3.5'].includes(config.id)?'('+config.id+')':'',logoW=hasLogo?123*scale:0,logoH=141*scale,gap=hasLogo?32*scale:0,versionGap=version?20*scale:0,versionSize=32*scale;
 ctx.save();ctx.font='700 '+versionSize+'px '+FONT_FAMILY;const versionWidth=ctx.measureText(version).width,maxWidth=config.width-64*scale-logoW-gap-versionGap-versionWidth;
 let size=108*scale;ctx.font='700 '+size+'px '+FONT_FAMILY;
 while(size>72*scale&&ctx.measureText(title).width>maxWidth){size=Math.max(72*scale,size-1);ctx.font='700 '+size+'px '+FONT_FAMILY}
 let lines=wrapText(ctx,title,maxWidth);
 while(size>8&&(lines.length>2||lines.length*size*1.18>headerHeight-32*scale)){size=Math.max(8,size-1);ctx.font='700 '+size+'px '+FONT_FAMILY;lines=wrapText(ctx,title,maxWidth)}
 const font='700 '+size+'px '+FONT_FAMILY,titleWidth=Math.max(180*scale,...lines.map(line=>ctx.measureText(line).width)),lineHeight=size*1.18,total=logoW+gap+titleWidth+versionGap+versionWidth,left=(config.width-total)/2,titleX=left+logoW+gap;
 const hitHeight=Math.min(headerHeight-16*scale,Math.max(lineHeight*Math.max(1,lines.length),80*scale)+24*scale),titleRect={x:titleX-12*scale,y:(headerHeight-hitHeight)/2,w:titleWidth+24*scale,h:hitHeight};ctx.restore();
 return {headerHeight,logoW,logoH,hasLogo,left,titleX,titleWidth,titleRect,font,lines,lineHeight,version,versionSize,versionX:titleX+titleWidth+versionGap};
}
