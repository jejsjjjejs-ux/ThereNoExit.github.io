const $=id=>document.getElementById(id);
const out=$("out"),q=$("q");
let db=null,assets=null,downloads=null,user=null,canEdit=false;
const enc=new TextEncoder(),dec=new TextDecoder();
const norm=s=>s.trim().toLowerCase().replace(/ё/g,"е").replace(/\s+/g," ");
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
const sha=async s=>hex(await crypto.subtle.digest("SHA-256",enc.encode(s)));
function b64e(u8){let s="";for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s)}
function b64d(s){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u}
async function keyFor(phrase,salt){
const base=await crypto.subtle.importKey("raw",enc.encode(phrase),"PBKDF2",false,["deriveKey"]);
return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:200000,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
const size=n=>n>1048576?(n/1048576).toFixed(1)+" МБ":Math.max(1,Math.round(n/1024))+" КБ";
function msg(t){out.innerHTML="";const d=document.createElement("div");d.className="msg";d.textContent=t;out.appendChild(d)}

