const SHOWCASE_KEY="there-no-exit-showcase-v2";
let showcaseCards=[];
let openedFromList=false,lastCard=null;

// Первые 4 карточки — архив записей, следующие 8 — персонажи (открываются в новой вкладке).
const ARCHIVE_COUNT=4,CHARACTER_COUNT=8,CARD_COUNT=ARCHIVE_COUNT+CHARACTER_COUNT;
const CHARACTER_NAMES=["Гордон","Кайл","Карл","Алиса","Мира","Луна","Лукас","Холлоу"];
// Заготовки для персонажей: применяются, если в данных (cards.json или сохранённой копии) ещё нет своих настроек.
const CHARACTER_PRESETS={"Алиса":{theme:"vn",qa:["Личное","Прошлое","Поезда","Страхи","Забавные","Глубокие"]}};
const defaultTitle=i=>i<ARCHIVE_COUNT?`Запись ${i+1}`:CHARACTER_NAMES[i-ARCHIVE_COUNT]||"Персонаж";
const QA_COUNT=4,QA_MAX=8;
const normalizeQA=src=>{
  const n=Array.isArray(src)&&src.length?Math.min(src.length,QA_MAX):QA_COUNT;
  return Array.from({length:n},(_,k)=>{
    const x=Array.isArray(src)&&src[k]||{};
    return {q:String(x.q||`Вопрос ${k+1}`).slice(0,200),a:String(x.a??"Здесь будет ответ.").slice(0,2000)};
  });
};
const starterCards=()=>Array.from({length:CARD_COUNT},(_,i)=>{
  const c={title:defaultTitle(i),text:"Здесь будет ваш текст.",image:""};
  if(i>=ARCHIVE_COUNT){c.qa=normalizeQA();c.theme="";c.bg=""}
  return c;
});
function normalizeShowcase(data){
  return Array.from({length:CARD_COUNT},(_,i)=>{
    const c=Array.isArray(data)?data[i]||{}:{};
    const fallbackText=i<ARCHIVE_COUNT?"":"Здесь будет ваш текст.";
    const card={title:String(c.title||defaultTitle(i)).slice(0,100),text:String(c.text??fallbackText).slice(0,3000),image:typeof c.image==="string"?c.image:""};
    if(i>=ARCHIVE_COUNT){
      const preset=CHARACTER_PRESETS[CHARACTER_NAMES[i-ARCHIVE_COUNT]];
      const untouched=!Array.isArray(c.qa)||c.qa.every((x,k)=>x&&x.q===`Вопрос ${k+1}`&&(x.a===undefined||x.a==="Здесь будет ответ."));
      card.qa=normalizeQA(preset&&untouched?preset.qa.map(q=>({q,a:"Здесь будет ответ."})):c.qa);
      card.theme=c.theme==="vn"||(preset&&c.theme===undefined)?"vn":"";
      card.bg=typeof c.bg==="string"?c.bg:"";
    }
    return card;
  });
}

// Опубликованная версия: cards.json, а в одностраничной сборке (build.py) — вшитые данные.
async function fetchPublishedCards(){
  try{const r=await fetch("cards.json",{cache:"no-store"});if(r.ok)return normalizeShowcase(await r.json())}catch(e){}
  return normalizeShowcase(window.INLINE_CARDS||starterCards());
}
async function loadShowcase(){
  let saved=null;
  try{saved=localStorage.getItem(SHOWCASE_KEY)}catch(e){}
  if(saved){try{showcaseCards=normalizeShowcase(JSON.parse(saved))}catch(e){saved=null}}
  if(!saved)showcaseCards=await fetchPublishedCards();
  renderShowcase();
  syncPerson();
}

function photoBox(c){
  const photo=document.createElement("div");photo.className="showcase-photo";
  if(c.image){const img=document.createElement("img");img.src=c.image;img.alt="Фото: "+c.title;photo.append(img)}
  else photo.textContent="ФОТО / ИЗОБРАЖЕНИЕ";
  return photo;
}
function archiveCard(c,i){
  const card=document.createElement("article");
  card.className="showcase-card";card.tabIndex=0;card.setAttribute("role","button");
  card.setAttribute("aria-label","Открыть досье: "+c.title);
  const open=()=>openPersonDetail(i,card);
  card.addEventListener("click",open);
  card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}});
  const copy=document.createElement("div");copy.className="showcase-copy";
  const h=document.createElement("h3");h.textContent=c.title;
  const p=document.createElement("p");p.textContent=c.text;
  const more=document.createElement("span");more.className="showcase-more";more.textContent="ОТКРЫТЬ ДОСЬЕ →";
  copy.append(h,p,more);card.append(photoBox(c),copy);
  return card;
}
// Персонаж — обычная ссылка: открывается в отдельной вкладке сразу на странице досье.
function characterCard(c,i){
  const a=document.createElement("a");
  a.className="showcase-card character-card";
  a.href=location.pathname+location.search+hashFor(i);
  a.target="_blank";a.rel="noopener noreferrer";
  a.setAttribute("aria-label",c.title+" (откроется в новой вкладке)");
  const copy=document.createElement("div");copy.className="showcase-copy";
  const h=document.createElement("h3");h.textContent=c.title;
  copy.append(h);a.append(photoBox(c),copy);
  return a;
}
function renderShowcase(){
  const archive=$("showcase-grid"),chars=$("characters-grid");
  if(!archive||!chars)return;
  archive.innerHTML="";chars.innerHTML="";
  showcaseCards.forEach((c,i)=>{
    if(i<ARCHIVE_COUNT)archive.append(archiveCard(c,i));else chars.append(characterCard(c,i));
  });
}

// Досье: адрес #person-N. Кнопка «Назад» в браузере возвращает к архиву, ссылка на досье открывается сразу.
const hashFor=i=>i<ARCHIVE_COUNT?"#person-"+(i+1):"#character-"+(i-ARCHIVE_COUNT+1);
function personIndex(){
  const m=/^#(person|character)-(\d+)$/.exec(location.hash);
  if(!m)return -1;
  const n=+m[2],isPerson=m[1]==="person";
  const i=isPerson?n-1:ARCHIVE_COUNT+n-1;
  const inRange=n>=1&&n<=(isPerson?ARCHIVE_COUNT:CHARACTER_COUNT);
  return inRange&&showcaseCards[i]?i:-1;
}
function showPerson(i){
  const c=showcaseCards[i];
  currentPerson=i;
  const isCharacter=i>=ARCHIVE_COUNT;
  document.body.classList.add("detail");
  document.body.classList.toggle("scene-open",isCharacter);
  $("person-detail").hidden=isCharacter;
  $("character-scene").hidden=!isCharacter;
  if(isCharacter){
    fillScene(i);
    window.scrollTo(0,0);
    $("scene-back").focus({preventScroll:true});
    return;
  }
  document.body.classList.remove("vn-theme");
  const photo=$("person-detail-photo");
  photo.innerHTML="";
  if(c.image){const img=document.createElement("img");img.src=c.image;img.alt="Фото: "+c.title;photo.append(img)}
  else photo.textContent="ФОТО / ИЗОБРАЖЕНИЕ";
  $("person-detail-title").textContent=c.title;
  $("person-detail-text").textContent=c.text;
  window.scrollTo(0,0);
  $("person-back").focus({preventScroll:true});
}
function hidePerson(){
  if($("person-detail").hidden&&$("character-scene").hidden)return;
  $("person-detail").hidden=true;
  $("character-scene").hidden=true;
  document.body.classList.remove("detail");
  document.body.classList.remove("scene-open");
  document.body.classList.remove("vn-theme");
  if(lastCard&&lastCard.isConnected)lastCard.focus({preventScroll:true});
}
function syncPerson(){const i=personIndex();if(i>=0)showPerson(i);else hidePerson()}
function openPersonDetail(i,card){
  lastCard=card||null;openedFromList=true;
  const h=hashFor(i);
  if(location.hash===h)syncPerson();else location.hash=h;
}
function closePersonDetail(){
  if(openedFromList){openedFromList=false;history.back();return}
  history.replaceState(null,"",location.pathname+location.search);
  hidePerson();
}
$("person-back").addEventListener("click",closePersonDetail);
addEventListener("hashchange",syncPerson);
$("scene-back").addEventListener("click",closePersonDetail);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("detail"))closePersonDetail()});

// Страница персонажа: фон, персонаж слева, ответ в «облачке» справа сверху, 4 вопроса справа снизу
let currentPerson=-1;
const PLACEHOLDER_TEXT="Здесь будет ваш текст.";
function sceneSay(question,answer){
  const b=$("scene-bubble");
  $("scene-who").textContent=question;
  $("scene-who").hidden=!question;
  $("scene-answer").textContent=answer;
  b.hidden=!answer;
  b.classList.remove("swap");void b.offsetWidth;b.classList.add("swap");
}
function fillScene(i){
  const c=showcaseCards[i],scene=$("character-scene"),photo=$("scene-photo"),list=$("scene-qlist");
  const vn=c.theme==="vn";
  scene.classList.toggle("vn",vn);
  document.body.classList.toggle("vn-theme",vn);
  const bg=$("scene-bg");
  if(bg){bg.style.backgroundImage=c.bg?"url("+JSON.stringify(c.bg)+")":"";bg.hidden=!(vn||c.bg)}
  photo.innerHTML="";
  photo.classList.toggle("empty",!c.image);
  if(c.image){const img=document.createElement("img");img.src=c.image;img.alt=c.title;photo.append(img)}
  else photo.textContent="ФОТО / ИЗОБРАЖЕНИЕ";
  $("scene-name").textContent=c.title;
  $("scene-bubble").setAttribute("data-name",c.title);
  // в стиле новеллы реплика показывается только если вы заменили заглушку
  const greeting=vn?(c.text&&c.text.trim()!==PLACEHOLDER_TEXT?c.text:""):(c.text||"…");
  sceneSay("",greeting);
  list.innerHTML="";
  (c.qa||[]).forEach((x,k)=>{
    const b=document.createElement("button");b.type="button";b.textContent=x.q;
    b.addEventListener("click",()=>{
      [...list.children].forEach(n=>n.classList.toggle("active",n===b));
      sceneSay(x.q,x.a);
    });
    if(vn && k===0)b.classList.add("active");
    list.append(b);
  });
  if(vn && c.qa && c.qa.length)sceneSay(c.qa[0].q,c.qa[0].a);
}
// Меню можно листать стрелками вверх/вниз
$("scene-qlist").addEventListener("keydown",e=>{
  if(e.key!=="ArrowDown"&&e.key!=="ArrowUp")return;
  const items=[...$("scene-qlist").children],k=items.indexOf(document.activeElement);
  if(k<0)return;
  e.preventDefault();
  const next=items[(k+(e.key==="ArrowDown"?1:-1)+items.length)%items.length];
  if(next)next.focus();
});

// Редактор карточек в админ-панели
function renderShowcaseEditors(){
  const root=$("showcase-editors");if(!root)return;root.innerHTML="";
  const status=$("showcase-status");
  showcaseCards.forEach((c,i)=>{
    const box=document.createElement("div");box.className="showcase-editor";
    const title=document.createElement("strong");title.textContent=i<ARCHIVE_COUNT?"Карточка "+(i+1):"Персонаж "+(i-ARCHIVE_COUNT+1);
    const preview=document.createElement("div");preview.className="editor-preview";
    if(c.image){const img=document.createElement("img");img.src=c.image;img.alt="Предпросмотр";preview.append(img)}
    else preview.textContent="Фото пока не выбрано";
    const name=document.createElement("input");
    name.type="text";name.maxLength=100;name.placeholder="Заголовок";name.value=c.title;
    name.setAttribute("aria-label","Заголовок карточки "+(i+1));
    name.addEventListener("input",()=>{showcaseCards[i].title=name.value;renderShowcase()});
    const text=document.createElement("textarea");
    text.maxLength=3000;text.placeholder=i<ARCHIVE_COUNT?"Текст под фотографией":"Первая реплика персонажа (до выбора вопроса)";text.value=c.text;
    text.setAttribute("aria-label","Текст карточки "+(i+1));
    text.addEventListener("input",()=>{showcaseCards[i].text=text.value;renderShowcase()});
    const file=document.createElement("input");file.type="file";file.accept="image/*";
    file.addEventListener("change",()=>{
      const f=file.files&&file.files[0];if(!f)return;
      if(!f.type.startsWith("image/")){file.value="";status.textContent="Выберите файл изображения.";return}
      if(f.size>2*1024*1024){file.value="";status.textContent="Изображение должно быть не больше 2 МБ.";return}
      const reader=new FileReader();
      reader.onload=()=>{showcaseCards[i].image=String(reader.result);renderShowcase();renderShowcaseEditors()};
      reader.readAsDataURL(f);
    });
    const clear=document.createElement("button");clear.type="button";clear.className="ghost";clear.textContent="Убрать фото";
    clear.addEventListener("click",()=>{showcaseCards[i].image="";renderShowcase();renderShowcaseEditors()});
    box.append(title,preview,name,text,file,clear);
    if(i>=ARCHIVE_COUNT){
      const lab=document.createElement("label");lab.className="chk";
      const cb=document.createElement("input");cb.type="checkbox";cb.checked=c.theme==="vn";
      cb.addEventListener("change",()=>{showcaseCards[i].theme=cb.checked?"vn":""});
      lab.append(cb,document.createTextNode(" Стиль визуальной новеллы (фон на весь экран, кнопки-меню, как у Алисы)"));
      const bgBox=document.createElement("div");bgBox.className="editor-preview";
      if(c.bg){const im=document.createElement("img");im.src=c.bg;im.alt="Фон";bgBox.append(im)}else bgBox.textContent="Фон страницы не выбран";
      const bgFile=document.createElement("input");bgFile.type="file";bgFile.accept="image/*";
      bgFile.setAttribute("aria-label","Фон страницы, персонаж "+(i-ARCHIVE_COUNT+1));
      bgFile.addEventListener("change",()=>{
        const f=bgFile.files&&bgFile.files[0];if(!f)return;
        if(!f.type.startsWith("image/")){bgFile.value="";status.textContent="Выберите файл изображения.";return}
        if(f.size>2*1024*1024){bgFile.value="";status.textContent="Фон должен быть не больше 2 МБ.";return}
        const reader=new FileReader();
        reader.onload=()=>{showcaseCards[i].bg=String(reader.result);renderShowcaseEditors()};
        reader.readAsDataURL(f);
      });
      const bgClear=document.createElement("button");bgClear.type="button";bgClear.className="ghost";bgClear.textContent="Убрать фон";
      bgClear.addEventListener("click",()=>{showcaseCards[i].bg="";renderShowcaseEditors()});
      box.append(lab,bgBox,bgFile,bgClear);
    }
    if(c.qa){
      const det=document.createElement("details");det.className="qa-editor";
      const sum=document.createElement("summary");sum.textContent="Вопросы и ответы ("+c.qa.length+")";
      const inner=document.createElement("div");inner.className="qa-editor-body";
      c.qa.forEach((x,k)=>{
        const q=document.createElement("input");q.type="text";q.maxLength=200;q.placeholder="Вопрос "+(k+1);q.value=x.q;
        q.setAttribute("aria-label","Вопрос "+(k+1)+", персонаж "+(i-ARCHIVE_COUNT+1));
        q.addEventListener("input",()=>{showcaseCards[i].qa[k].q=q.value});
        const a=document.createElement("textarea");a.maxLength=2000;a.placeholder="Ответ на вопрос "+(k+1);a.value=x.a;
        a.setAttribute("aria-label","Ответ "+(k+1)+", персонаж "+(i-ARCHIVE_COUNT+1));
        a.addEventListener("input",()=>{showcaseCards[i].qa[k].a=a.value});
        inner.append(q,a);
      });
      det.append(sum,inner);box.append(det);
    }
    root.append(box);
  });
}
function saveShowcaseLocal(){
  try{
    localStorage.setItem(SHOWCASE_KEY,JSON.stringify(showcaseCards));
    $("showcase-status").textContent="Сохранено в этом браузере. Для публикации на сайте скачайте cards.json и замените им файл в репозитории.";
  }catch(e){$("showcase-status").textContent="Не удалось сохранить: возможно, фотографии слишком большие."}
}
async function resetShowcase(){
  try{localStorage.removeItem(SHOWCASE_KEY)}catch(e){}
  showcaseCards=await fetchPublishedCards();
  renderShowcase();renderShowcaseEditors();
  $("showcase-status").textContent="Показана опубликованная версия. Локальная копия в этом браузере удалена.";
}
function exportShowcase(){
  const blob=new Blob([JSON.stringify(showcaseCards,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="cards.json";document.body.append(a);a.click();a.remove();
  URL.revokeObjectURL(url);
  $("showcase-status").textContent="Файл cards.json скачан. Замените им cards.json в репозитории сайта и опубликуйте изменения. После этого нажмите «Сбросить к опубликованным», чтобы убрать локальную копию.";
}
$("showcase-save").addEventListener("click",saveShowcaseLocal);
$("showcase-reset").addEventListener("click",resetShowcase);
$("showcase-export").addEventListener("click",exportShowcase);
loadShowcase();
