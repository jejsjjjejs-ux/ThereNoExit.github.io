const ALPHA="abcdefghjkmnpqrstuvwxyz23456789";
function genPhrase(){const r=crypto.getRandomValues(new Uint32Array(20));let s="";r.forEach((v,i)=>{s+=ALPHA[v%ALPHA.length];if(i%4===3&&i<19)s+="-"});return s}
function strength(p){
if(!p)return "";
const cyr=/[а-яё]/i.test(p),lat=/[a-z]/i.test(p);
let pool=(cyr?33:0)+(lat?26:0)+(/\d/.test(p)?10:0)+(/[^a-zа-яё\d]/i.test(p)?12:0);
const bits=Math.round(p.length*Math.log2(Math.max(pool,2)));
const lvl=bits<45?"слабая: такую фразу можно подобрать перебором":bits<70?"средняя":"надёжная";
return "Надёжность: "+lvl+" (~"+bits+" бит, оценка грубая; слова из словаря слабее).";
}
function renderStats(){
const keys=Object.keys(VAULT);let n=0,len=0,ext=0;
keys.forEach(k=>VAULT[k].forEach(c=>{n++;if(isId(c))ext++;else len+=c.length}));
$("stats").textContent="Фраз: "+keys.length+" · файлов: "+n+" · под паролем: "+Object.keys(HINTS).length+" · отдельных файлов в vault/: "+ext+" · встроено: "+(len/1048576).toFixed(2)+" МБ";
}
function openAdmin(){$("gate").style.display="none";$("admin").style.display="block";renderStats()}
async function makeEntry(phrase,pw,file,inline){
const h=await sha("lookup:"+phrase),key=await keyFor(pw?phrase+"\u0000"+pw:phrase,await saltFor(phrase));
const head=enc.encode(JSON.stringify({n:file.name,t:file.type}));
const body=new Uint8Array(await file.arrayBuffer());
const plain=new Uint8Array(4+head.length+body.length);
new DataView(plain.buffer).setUint32(0,head.length);plain.set(head,4);plain.set(body,4+head.length);
const iv=crypto.getRandomValues(new Uint8Array(12));
const ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,plain));
const all=new Uint8Array(12+ct.length);all.set(iv);all.set(ct,12);
if(inline)return {line:'(VAULT["'+h+'"]=VAULT["'+h+'"]||[]).push("'+b64e(all)+'");\n',bin:null};
const id=hex(crypto.getRandomValues(new Uint8Array(16)));
return {line:'(VAULT["'+h+'"]=VAULT["'+h+'"]||[]).push("'+id+'");\n',bin:{id,blob:new Blob([all])}};
}
let pendingBins=[];
async function addFile(){
const phrase=norm($("ph").value),files=[...$("fl").files],st=$("st"),pw=$("pw2").value.trim(),hint=$("hint").value.trim();
if(!phrase||!files.length){st.textContent="Введите фразу и выберите файл.";return}
const inl=$("inl").checked,maxMb=inl?10:95;
if(files.some(f=>f.size>maxMb*1048576)){st.textContent="Один из файлов больше "+maxMb+" МБ.";return}
$("add").disabled=true;st.textContent="Шифрую…";
try{
const h=await sha("lookup:"+phrase);let res="";pendingBins=[];
if(pw)res+='HINTS["'+h+'"]='+JSON.stringify(hint)+';\n';
for(const f of files){const e=await makeEntry(phrase,pw,f,inl);res+=e.line;if(e.bin)pendingBins.push(e.bin)}
$("res").value=res;
let msg="Готово: файлов "+files.length+". "+(inl?"Добавьте результат в конец js/data.js.":"Скачайте файлы .bin и положите их в папку vault/, а строки из поля добавьте в конец js/data.js.");
if(VAULT[h]&&((h in HINTS)!==!!pw))msg+=" Внимание: у этой фразы уже другой режим пароля, используйте такой же.";
else if(VAULT[h])msg+=" Под этой фразой уже есть файлы, новые добавятся к ним.";
st.textContent=msg;
}catch(e){console.error(e);st.textContent="Ошибка: "+(e&&e.message||"не удалось зашифровать")}
finally{$("add").disabled=false}
}
async function copyText(t){
try{await navigator.clipboard.writeText(t);return true}catch(e){const r=$("res");r.removeAttribute("readonly");r.select();let ok=false;try{ok=document.execCommand("copy")}catch(x){}r.setAttribute("readonly","");return ok}
}
$("add").onclick=addFile;
$("ph").addEventListener("input",()=>{$("meter").textContent=strength($("ph").value.trim())});
$("gen").onclick=()=>{$("ph").value=genPhrase();$("meter").textContent=strength($("ph").value)};
$("copy").onclick=async()=>{const t=$("res").value;if(!t){$("st").textContent="Сначала зашифруйте файл.";return}
$("st").textContent=(await copyText(t))?"Скопировано.":"Не удалось скопировать, выделите текст вручную."};
$("dl").onclick=()=>{const t=$("res").value;if(!t){$("st").textContent="Сначала зашифруйте файл.";return}
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"text/plain"}));a.download="entry.txt";document.body.appendChild(a);a.click();a.remove()};
$("dlb").onclick=()=>{
if(!pendingBins.length){$("st").textContent="Нет файлов .bin: либо ничего не зашифровано, либо выбран режим встраивания.";return}
pendingBins.forEach((b,i)=>setTimeout(()=>{const x=document.createElement("a");x.href=URL.createObjectURL(b.blob);x.download=b.id+".bin";document.body.appendChild(x);x.click();x.remove()},i*400));
};
$("chk").onclick=async()=>{
const phrase=norm($("cph").value),pw=$("cpw").value.trim(),st=$("cst");
if(!phrase){st.textContent="Введите фразу.";return}
const h=await sha("lookup:"+phrase),l=VAULT[h];
if(!l){st.textContent="Такой фразы в хранилище нет.";return}
let t="Фраза есть: файлов "+l.length+((h in HINTS)?", нужен пароль (подсказка: "+HINTS[h]+")":", без пароля")+".";
if(pw||!(h in HINTS)){
const els=await decryptAll(phrase,pw?phrase+"\u0000"+pw:phrase,l);
t+=els.length?" Расшифровка успешна: "+els.map(e=>e.querySelector("h3").textContent).join(", ")+".":" Расшифровать не удалось: неверный пароль.";
}
st.textContent=t;
};
$("mk").onclick=async()=>{
const np=$("np").value,st=$("nst");
if(np.length<12){st.textContent="Минимум 12 символов.";return}
st.textContent="Считаю…";
const salt=crypto.getRandomValues(new Uint8Array(16));
const base=await crypto.subtle.importKey("raw",enc.encode(np),"PBKDF2",false,["deriveBits"]);
const bits=new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:600000,hash:"SHA-256"},base,256));
$("nres").value='const AUTH={salt:"'+b64e(salt)+'",hash:"'+b64e(bits)+'",iter:600000};';
$("np").value="";
st.textContent="Готово. Замените этой строкой строку const AUTH=… в js/auth.js и пересоберите сайт. Старый пароль перестанет работать.";
};
$("logout").onclick=()=>{
unlocked=false;$("admin").style.display="none";
["ph","pw2","hint","fl","cph","cpw","np","res","nres"].forEach(i=>{$(i).value=""});
["st","cst","nst","meter"].forEach(i=>{$(i).textContent=""});
};
