export const TABLE_IDS=['1.0','2.0','3.0','3.5'];
const labels35=['我的最愛','人間小甜豆','掌管美貌的女神','羨慕她的粉絲','偷偷關注','希望我朋友入坑','不准偷家','團寵寶寶大人','好奇怪的人（褒意）','談了不官宣很牛嗎','最愛的一首歌','最被低估的一首歌'];
const definitions={
 '1.0':{width:1249,height:1516,cols:4,template:'assets/templates/table-1.png',vertical:[[9,17],[319,320],[622,630],[932,933],[1234,1242]],rows:[[227,581],[662,1001],[1081,1420]],labels:['一開始喜歡的','現在喜歡的','第一個認識的','喜歡最久的','一見鍾情的','愛過','對你影響最大的','「當他的粉絲真好啊」','最愛的CP','最恨的造型','最喜歡的一首歌','本命小分隊'],special:{10:'song',11:'unit'}},
 '2.0':{width:1565,height:1439,cols:5,template:'assets/templates/table-2.png',vertical:[[3,9],[313,319],[625,630],[935,940],[1245,1251],[1556,1562]],rows:[[242,569],[637,965],[1033,1361]],labels:['我的最愛','最可愛的成員','被美貌所折服','想偷偷藏起來','很羨慕她的粉絲','最近出軌','反差最大的','看到她就心情好','最滿意的小卡','這卡面都是個啥','好奇怪的人（褒意）','最愛的CP','最愛的造型','最愛的一首歌','本命小分隊'],special:{8:'objekt',9:'objekt',13:'song',14:'unit'}},
 '3.0':{width:1440,height:1647,cols:4,template:'assets/templates/table-3.png',vertical:[[2,10],[358,365],[714,720],[1069,1075],[1424,1430]],rows:[[277,651],[729,1105],[1182,1558]],labels:['我的最愛','人間小甜豆','女神我好愛你','羨慕她的粉絲','最近出軌','看到她就心情好','不准偷家','團寵寶寶大人','好奇怪的人（褒意）','談了不官宣很牛嗎','最被低估的一首歌','我的初心'],special:{10:'song'}},
 '3.5':{width:1451,height:1660,cols:4,template:'assets/original-template.png',labels:labels35,special:{10:'song',11:'song'}}
};
export const TABLES=Object.fromEntries(TABLE_IDS.map(id=>{const def=definitions[id];const rects=id==='3.5'?Array.from({length:12},(_,i)=>({x:14+i%4*360,y:280+Math.floor(i/4)*456,w:340,h:376})):def.labels.map((_,index)=>{const column=index%def.cols,row=Math.floor(index/def.cols),left=def.vertical[column][1],right=def.vertical[column+1][0],[top,bottom]=def.rows[row];return {x:left+2,y:top+2,w:right-left-3,h:bottom-top-3}});return [id,{...def,id,rects}]}));
export const getTable=id=>TABLES[id]||TABLES['3.5'];
export const slotType=(id,index)=>getTable(id).special[index]||'photo';
