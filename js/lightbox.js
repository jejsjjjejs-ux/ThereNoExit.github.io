// Увеличение картинки по клику: Esc или клик закрывают, стрелки листают.
(function(){
const lb=document.createElement("div");
lb.id="lb";lb.hidden=true;
lb.innerHTML='<button class="lb-x" aria-label="Закрыть">×</button><button class="lb-p" aria-label="Назад">‹</button><img alt=""><button class="lb-n" aria-label="Вперёд">›</button>';
document.body.appendChild(lb);
const im=lb.querySelector("img"),pv=lb.querySelector(".lb-p"),nx=lb.querySelector(".lb-n");
let list=[],i=0;
function show(){im.src=list[i].src;pv.style.visibility=nx.style.visibility=list.length>1?"visible":"hidden"}
function close(){lb.hidden=true;document.body.style.overflow="";im.removeAttribute("src")}
function step(d){i=(i+d+list.length)%list.length;show()}
window.openLightbox=el=>{
list=[...document.querySelectorAll(".file.thumb img")];
i=Math.max(0,list.indexOf(el));show();lb.hidden=false;document.body.style.overflow="hidden";
};
lb.addEventListener("click",e=>{
if(e.target===pv){step(-1);return}
if(e.target===nx){step(1);return}
close();
});
document.addEventListener("keydown",e=>{
if(lb.hidden)return;
if(e.key==="Escape")close();
else if(e.key==="ArrowLeft")step(-1);
else if(e.key==="ArrowRight")step(1);
});
})();
