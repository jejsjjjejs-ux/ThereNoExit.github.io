const saltFor=async p=>new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode("salt:"+p))).slice(0,16);
const isId=c=>/^[0-9a-f]{32}$/.test(c);
let fetchFailed=false;
async function getRaw(c){
if(!isId(c))return b64d(c);
const r=await fetch("vault/"+c+".bin",{cache:"no-store"});
if(!r.ok)throw new Error("HTTP "+r.status);
return new Uint8Array(await r.arrayBuffer());
}
async function decryptAll(phrase,material,list){
const key=await keyFor(material,await saltFor(phrase)),els=[];
fetchFailed=false;
for(const c of list){
let raw;
try{raw=await getRaw(c)}catch(e){fetchFailed=true;continue}
try{
const plain=new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv:raw.slice(0,12)},key,raw.slice(12)));
const hl=new DataView(plain.buffer).getUint32(0);
const h=JSON.parse(dec.decode(plain.slice(4,4+hl)));
els.push(card(h,plain.slice(4+hl)));
}catch(e){}
}
return els;
}
const LOADERR="Не удалось загрузить файл. Откройте сайт по адресу http(s), а не файлом с диска, и проверьте, что папка vault/ загружена.";
function showEls(els){out.innerHTML="";els.forEach(e=>out.appendChild(e))}
function askPassword(phrase,list,hint){
out.innerHTML="";
const f=document.createElement("form");f.className="s pw";f.autocomplete="off";
const i=document.createElement("input");i.type="password";i.placeholder="Введите пароль";i.setAttribute("aria-label","Пароль");
const b=document.createElement("button");b.className="go";b.type="submit";b.textContent="Открыть";
f.appendChild(i);f.appendChild(b);
const hn=document.createElement("div");hn.className="msg";hn.textContent="Подсказка: "+hint;
const er=document.createElement("div");er.className="msg";er.setAttribute("aria-live","polite");
let fails=0;
f.addEventListener("submit",async ev=>{
ev.preventDefault();
const pw=i.value.trim();if(!pw){i.focus();return}
b.disabled=true;er.textContent="Проверяю…";
if(fails>=3)await new Promise(r=>setTimeout(r,Math.min(15000,1000*2**(fails-3))));
const els=await decryptAll(phrase,phrase+"\u0000"+pw,list);
if(els.length){showEls(els)}else if(fetchFailed){er.textContent=LOADERR}else{fails++;er.textContent="Неверный пароль.";i.value="";i.focus()}
b.disabled=false;
});
out.appendChild(f);out.appendChild(hn);out.appendChild(er);
i.focus();
}
async function search(ev){
ev.preventDefault();
const phrase=norm(q.value);
if(!phrase){q.focus();return}
$("go").disabled=true;msg("Ищу…");
try{
const hash=await sha("lookup:"+phrase),list=VAULT[hash];
if(!list||!list.length){
let ok=false;try{ok=await checkPassword(q.value.trim())}catch(e){}
if(ok){unlocked=true;q.value="";msg("Режим администратора включён.");openAdmin();$("admin").scrollIntoView({behavior:"smooth"});return}
msg("Ничего не найдено.");return}
if(hash in HINTS){askPassword(phrase,list,HINTS[hash]);return}
const els=await decryptAll(phrase,phrase,list);
if(els.length)showEls(els);else msg(fetchFailed?LOADERR:"Ничего не найдено.");
}catch(e){console.error(e);msg("Не удалось выполнить поиск. Попробуйте ещё раз.")}
finally{$("go").disabled=false}
}
function card(h,body){
const c=document.createElement("div");c.className="file";
const t=document.createElement("h3");t.textContent=h.n;c.appendChild(t);
const m=document.createElement("div");m.className="meta";m.textContent=(h.t||"файл")+" · "+size(body.length);c.appendChild(m);
const ext=(h.n.split(".").pop()||"").toLowerCase();
let ty=h.t||"";
if(!ty){ty={pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",webp:"image/webp",mp4:"video/mp4",mp3:"audio/mpeg",txt:"text/plain",md:"text/markdown",json:"application/json",csv:"text/csv"}[ext]||""}
const blob=new Blob([body],{type:ty||"application/octet-stream"});
const url=URL.createObjectURL(blob);
let shown=true;
if(ty.startsWith("image/")){const e=document.createElement("img");e.alt=h.n;e.src=url;c.appendChild(e)}
else if(ty.startsWith("video/")){const e=document.createElement("video");e.controls=true;e.src=url;c.appendChild(e)}
else if(ty.startsWith("audio/")){const e=document.createElement("audio");e.controls=true;e.src=url;e.style.width="100%";c.appendChild(e)}
else if(ty==="application/pdf"){const e=document.createElement("iframe");e.src=url;e.title=h.n;c.appendChild(e)}
else if(ty.startsWith("text/")||ty==="application/json"){const p=document.createElement("pre");p.textContent=dec.decode(body);c.appendChild(p)}
else shown=false;
if(!shown){
const n=document.createElement("div");n.className="meta";n.textContent="Этот тип файла нельзя показать в окне.";c.appendChild(n);
const b=document.createElement("button");b.className="ghost";b.textContent="Скачать";
b.onclick=()=>{const a=document.createElement("a");a.href=url;a.download=h.n;document.body.appendChild(a);a.click();a.remove()};
c.appendChild(b);
}
return c;
}
$("f").addEventListener("submit",search);
