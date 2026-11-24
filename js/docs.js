// Показ Word (.docx) и текста: без оформления, кроме зачёркивания и чёрных полос.
async function inflateRaw(u8){
const ds=new DecompressionStream("deflate-raw"),w=ds.writable.getWriter();
w.write(u8);w.close();
return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
async function unzipEntry(u8,name){
const dv=new DataView(u8.buffer,u8.byteOffset,u8.byteLength);
let e=-1;
for(let i=u8.length-22;i>=Math.max(0,u8.length-65558);i--){if(dv.getUint32(i,true)===0x06054b50){e=i;break}}
if(e<0)throw new Error("zip");
const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);
for(let k=0;k<n;k++){
if(dv.getUint32(p,true)!==0x02014b50)break;
const method=dv.getUint16(p+10,true),csz=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),off=dv.getUint32(p+42,true);
if(dec.decode(u8.subarray(p+46,p+46+nl))===name){
const s=off+30+dv.getUint16(off+26,true)+dv.getUint16(off+28,true),data=u8.subarray(s,s+csz);
return method===0?data:await inflateRaw(data);
}
p+=46+nl+el+cl;
}
throw new Error("нет "+name);
}
const WNS="http://schemas.openxmlformats.org/wordprocessingml/2006/main";
function docxSegments(xml){
const d=new DOMParser().parseFromString(xml,"application/xml"),segs=[];
const A=(el,a)=>(el.getAttributeNS(WNS,a)||"").toLowerCase();
const paras=d.getElementsByTagNameNS(WNS,"p");
for(let i=0;i<paras.length;i++){
for(const r of paras[i].getElementsByTagNameNS(WNS,"r")){
const pr=r.getElementsByTagNameNS(WNS,"rPr")[0];
let s=false,b=false;
if(pr){
const st=pr.getElementsByTagNameNS(WNS,"strike")[0]||pr.getElementsByTagNameNS(WNS,"dstrike")[0];
s=!!st&&!["0","false","off"].includes(A(st,"val"));
const hl=pr.getElementsByTagNameNS(WNS,"highlight")[0],sh=pr.getElementsByTagNameNS(WNS,"shd")[0];
b=(!!hl&&A(hl,"val")==="black")||(!!sh&&A(sh,"fill")==="000000");
}
let t="";
for(const c of r.childNodes){
const ln=c.localName;
if(ln==="t")t+=c.textContent;else if(ln==="tab")t+="\t";else if(ln==="br"||ln==="cr")t+="\n";else if(ln==="noBreakHyphen")t+="-";
}
if(t)segs.push({t,s,b});
}
segs.push({t:"\n"});
}
return segs;
}
function fillSegs(p,segs){
p.textContent="";
for(const g of segs){
if(!g.s&&!g.b){p.appendChild(document.createTextNode(g.t));continue}
const sp=document.createElement("span");
sp.className=((g.s?"st ":"")+(g.b?"bar":"")).trim();
sp.textContent=g.t;p.appendChild(sp);
}
}
function fillText(p,text){
const segs=[];
text.split(/(~~[^~\n][\s\S]*?~~)/).forEach(x=>{
if(x.length>4&&x.startsWith("~~")&&x.endsWith("~~"))segs.push({t:x.slice(2,-2),s:true});
else if(x)segs.push({t:x});
});
fillSegs(p,segs);
}
async function docxInto(p,body){
try{fillSegs(p,docxSegments(dec.decode(await unzipEntry(body,"word/document.xml"))))}
catch(e){console.error(e);p.textContent="Не удалось показать документ Word."}
}
