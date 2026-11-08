async function addFile(){
const phrase=norm($("ph").value),file=$("fl").files[0],st=$("st");
if(!phrase||!file){st.textContent="Введите фразу и выберите файл.";return}
if(file.size>10*1048576){st.textContent="Файл больше 10 МБ.";return}
$("add").disabled=true;st.textContent="Шифрую…";
try{
const h=await sha("lookup:"+phrase),key=await keyFor(phrase,await saltFor(phrase));
const head=enc.encode(JSON.stringify({n:file.name,t:file.type}));
const body=new Uint8Array(await file.arrayBuffer());
const plain=new Uint8Array(4+head.length+body.length);
new DataView(plain.buffer).setUint32(0,head.length);plain.set(head,4);plain.set(body,4+head.length);
const iv=crypto.getRandomValues(new Uint8Array(12));
const ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,plain));
const all=new Uint8Array(12+ct.length);all.set(iv);all.set(ct,12);
const line='(VAULT["'+h+'"]=VAULT["'+h+'"]||[]).push("'+b64e(all)+'");\n';
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([line],{type:"text/plain"}));a.download="entry.txt";document.body.appendChild(a);a.click();a.remove();
st.textContent="Готово: скачан entry.txt. Добавьте его строку в конец js/data.js.";
}catch(e){console.error(e);st.textContent="Ошибка: "+(e&&e.message||"не удалось зашифровать")}
finally{$("add").disabled=false}
}
$("add").onclick=addFile;
