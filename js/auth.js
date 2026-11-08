// Хранится только соль и хеш (PBKDF2-SHA256, 600 000 итераций). Сам пароль в файлах не лежит.
const AUTH={salt:"4ApvnCcEav83mu3dkKL05Q==",hash:"H1LQnxzuD5BqtaG9U80G5cYnTDc+1K8zqAXzWkkvdPc=",iter:600000};
let unlocked=false,fails=0;
async function checkPassword(pw){
const base=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]);
const bits=new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:b64d(AUTH.salt),iterations:AUTH.iter,hash:"SHA-256"},base,256));
const want=b64d(AUTH.hash);let diff=0;
for(let i=0;i<want.length;i++)diff|=bits[i]^want[i];
return diff===0&&bits.length===want.length;
}
$("gopen").onclick=()=>{$("gform").style.display="flex";$("gopen").style.display="none";$("gpw").focus()};
$("gform").addEventListener("submit",async ev=>{
ev.preventDefault();
const pw=$("gpw").value,m=$("gmsg");
if(!pw)return;
$("gbtn").disabled=true;m.textContent="Проверяю…";
if(fails>=3)await new Promise(r=>setTimeout(r,Math.min(30000,1000*2**(fails-3))));
let ok=false;
try{ok=await checkPassword(pw)}catch(e){}
$("gpw").value="";
if(ok){unlocked=true;fails=0;$("gate").style.display="none";$("admin").style.display="block";m.textContent=""}
else{fails++;m.textContent=ok?"Неверный пароль.":"Неверный пароль."}
$("gbtn").disabled=false;
});
