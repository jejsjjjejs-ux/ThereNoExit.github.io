const saltFor=async p=>new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode("salt:"+p))).slice(0,16);
async function search(ev){
ev.preventDefault();
const phrase=norm(q.value);
if(!phrase){q.focus();return}
$("go").disabled=true;msg("Ищу…");
try{
const list=VAULT[await sha("lookup:"+phrase)];
if(!list||!list.length){msg("Ничего не найдено.");return}
const key=await keyFor(phrase,await saltFor(phrase));
out.innerHTML="";
for(const c of list){
try{
const raw=b64d(c);
const plain=new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv:raw.slice(0,12)},key,raw.slice(12)));
const hl=new DataView(plain.buffer).getUint32(0);
const h=JSON.parse(dec.decode(plain.slice(4,4+hl)));
card(h,plain.slice(4+hl));
}catch(e){console.error(e)}
}
if(!out.children.length)msg("Ничего не найдено.");
}catch(e){console.error(e);msg("Не удалось выполнить поиск. Попробуйте ещё раз.")}
finally{$("go").disabled=false}
}
function card(h,body){
const c=document.createElement("div");c.className="file";
const t=document.createElement("h3");t.textContent=h.n;c.appendChild(t);
const m=document.createElement("div");m.className="meta";m.textContent=(h.t||"файл")+" · "+size(body.length);c.appendChild(m);
const blob=new Blob([body],{type:h.t||"application/octet-stream"});
const url=URL.createObjectURL(blob);
if((h.t||"").startsWith("image/")&&h.t!=="image/svg+xml"){const i=document.createElement("img");i.alt=h.n;i.src=url;c.appendChild(i)}
else if((h.t||"").startsWith("text/")){const p=document.createElement("pre");p.textContent=dec.decode(body.slice(0,4000));c.appendChild(p)}
const r=document.createElement("div");r.className="row";
const b=document.createElement("button");b.className="ghost";b.textContent="Скачать";
b.onclick=()=>{const a=document.createElement("a");a.href=url;a.download=h.n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>{try{window.open(url,"_blank")}catch(e){}},400)};
r.appendChild(b);
c.appendChild(r);out.appendChild(c);
}
$("f").addEventListener("submit",search);
