const SHOWCASE_KEY="there-no-exit-showcase-v3";
let showcaseCards=[];
let openedFromList=false,lastCard=null;

// Первые 4 карточки — архив записей, следующие 8 — персонажи (открываются в новой вкладке).
const ARCHIVE_COUNT=4,CHARACTER_COUNT=8,CARD_COUNT=ARCHIVE_COUNT+CHARACTER_COUNT;
const CHARACTER_NAMES=["Гордон","Кайл","Карл","Алиса","Мира","Луна","Лукас","Холлоу"];
// Заготовки для персонажей: применяются, если в данных (cards.json или сохранённой копии) ещё нет своих настроек.
const CHARACTER_PRESETS={"Алиса":{theme:"vn",ambient:"alisa",qa:["Личность и характер", "Загадочное прошлое", "Поезда", "Страхи", "Забавные и неловкие вопросы", "Глубокие вопросы"],fork:["Личность и характер", "Загадочное прошлое", "Поезда", "Страхи", "Забавные и неловкие вопросы", "Глубокие вопросы"],questions:{"Личность и характер": ["Что ты думаешь о ребятах, с которыми сейчас играешь?", "Есть ли что-то, что тебя раздражает?"], "Загадочное прошлое": ["Почему ты оказалась в заброшенной школе?", "Ты помнишь свою семью?"], "Поезда": ["Почему именно поезда?", "Ты понимаешь, что окружающие не всегда понимают твои звуки?"], "Страхи": ["Ты вообще знаешь, что такое страх?", "Что должно произойти, чтобы ты действительно испугалась?"], "Забавные и неловкие вопросы": ["Если тебе предложат выбрать между едой и паровозом, что выберешь?", "Если тебя назовут Томасом десять раз подряд, что произойдёт?"], "Глубокие вопросы": ["Если бы ты могла произнести только одну фразу человеку, которого давно не видела, что бы сказала?", "Ты счастлива сейчас?"]}},"Карл":{qa:["Личное", "Прошлое", "Мистика", "Страхи", "Забавные", "Глубокие"],fork:["Личное", "Прошлое", "Мистика", "Страхи", "Забавные", "Глубокие"],questions:{"Личное": ["Почему ты так часто вставляешь английские слова? Это привычка или своеобразная защита?", "Ты всегда такой общительный или просто не любишь тишину?"], "Прошлое": ["Помнишь ли ты первый раз, когда столкнулся с расизмом?", "Ты помнишь, каким было твоё первое впечатление о брате и сестре возле заброшки?"], "Мистика": ["Что самое странное ты когда-либо находил в заброшенном здании?", "Если бы в заброшке ты услышал собственный голос из соседней комнаты, пошёл бы проверять?"], "Страхи": ["Ты умеешь просить о помощи или предпочитаешь справляться самостоятельно?", "Если бы тебе пришлось провести неделю в полной изоляции, смог бы ты выдержать?"], "Забавные": ["Если бы призрак начал с тобой спорить, ты бы продолжил разговор?", "Если бы Дима Масленников позвал тебя на исследование заброшенного здания, ты бы согласился?"], "Глубокие": ["Если бы тебе дали возможность стереть одно воспоминание, воспользовался бы ты ею?", "Если бы ты мог узнать, что на самом деле думают о тебе твои друзья, захотел бы услышать ответ?"]}},"Кайл":{qa:["Личное", "Прошлое", "Отношения", "Страхи", "Забавные", "Глубокие"],fork:["Личное", "Прошлое", "Отношения", "Страхи", "Забавные", "Глубокие"],questions:{"Личное": ["Ты действительно считаешь всех своими друзьями или просто не любишь называть людей чужими?", "Ты специально избегаешь серьёзных разговоров или просто не знаешь, что на них отвечать?"], "Прошлое": ["Почему ты оказался именно возле той школы в тот день?", "Ты помнишь свою первую настоящую компанию?"], "Отношения": ["Кого из компании ты считаешь самым близким человеком?", "Что страшнее: потерять всех друзей или понять, что никто из них не был тебе по-настоящему близок?"], "Страхи": ["Чего ты боишься больше: смерти или необходимости жить дальше?", "Если бы тебе пришлось принять решение, от которого зависит жизнь друга, смог бы ты это сделать?"], "Забавные": ["Ты чаще опаздываешь или забываешь, куда вообще собирался?", "Если бы можно было навсегда отменить одну обязанность, что бы ты выбрал?"], "Глубокие": ["Что делает человека взрослым: возраст, поступки или ответственность за чужие жизни?", "Ты правда спокойно относишься к смерти или просто не позволяешь себе думать о ней?"]}},"Холлоу":{qa:["Личное", "Прошлое", "Гордон", "Страхи", "Забавные", "Глубокие"],fork:["Личное", "Прошлое", "Гордон", "Страхи", "Забавные", "Глубокие"],questions:{"Личное": ["Что раздражает тебя в людях больше всего?", "Ты считаешь себя счастливым человеком?"], "Прошлое": ["Что из прошлого ты хотел бы пережить ещё раз?", "Что ты чувствуешь, когда видишь место, где погиб Гордон?"], "Гордон": ["Есть ли что-то, что ты так и не успел ему сказать?", "Как думаешь, Гордон хотел бы, чтобы ты продолжал этот путь?"], "Страхи": ["Ты когда-нибудь представлял собственную смерть?", "Если бы ради спасения остальных пришлось пожертвовать собой, ты бы согласился?"], "Забавные": ["Как думаешь, Гордон был бы хорошим соседом по комнате?", "Что способно заставить тебя искренне улыбнуться?"], "Глубокие": ["Что тяжелее: отпустить человека или продолжать ждать его возвращения?", "Ты действительно хочешь жить или просто не хочешь умирать?"]}},"Луна":{qa:["Личное", "Прошлое", "Семья", "Страхи", "Забавные", "Глубокие"],fork:["Личное", "Прошлое", "Семья", "Страхи", "Забавные", "Глубокие"],questions:{"Личное": ["Бывает ли, что ты устаёшь от людей, несмотря на свою общительность?", "Тебе проще говорить о чужих проблемах, чем о собственных?"], "Прошлое": ["Ты когда-нибудь хотела, чтобы кто-то заметил, что тебе тоже нужна помощь?", "Какое воспоминание из детства ты хранишь до сих пор?"], "Семья": ["Чувствуешь ли ты ответственность за брата даже тогда, когда он об этом не просит?", "Считаешь ли ты, что обязана быть примером для остальных?"], "Страхи": ["Тебе страшнее потерять кого-то или не успеть ему помочь?", "Ты умеешь признавать, что сама нуждаешься в помощи?"], "Забавные": ["Что выберешь: шумную компанию или целый день абсолютной тишины?", "Как думаешь, сколько человек считают тебя своим личным психологом?"], "Глубокие": ["Можно ли спасти человека, который не хочет быть спасённым?", "Ты считаешь свою доброту силой или слабостью?"]}},"Мира":{ambient:"mira",qa:["Личное", "Прошлое", "Страхи", "Забавные", "Глубокие", "11010000 10100111 11010000 10111000 11010001 10000010 11010001 10001011"],fork:["Личное", "Прошлое", "Страхи", "Забавные", "Глубокие", "11010000 10100111 11010000 10111000 11010001 10000010 11010001 10001011"],questions:{"Личное": ["Что люди чаще всего в тебе понимают не правильно?", "Ты предпочитаешь одиночество или просто привыкла к нему?"], "Прошлое": ["Каким было твое детство до пожара?", "Как ты переживала осознание, что человек, которому ты доверяла, тебя предал?"], "Страхи": ["Что ты думаешь, когда кто-то обещает никогда тебя не бросать?", "Что должно произойти, чтобы ты наконец-то перестала ждать подвоха?"], "Забавные": ["Если бы твои друзья описывали тебя тремя словами, какими бы они были?", "Если бы тебе пришлось неделю жить с одним человеком в одной комнате, кого бы ты выбрала?"], "Глубокие": ["Ты помогаешь людям если они не просят?", "Ты так хорошо читаешь людей. А кто-нибудь когда-нибудь смог прочитать тебя?"], "11010000 10100111 11010000 10111000 11010001 10000010 11010001 10001011": ["Ξcℓи ты нαѕтøℓьκø ყмнα, ʓαчεм τεβε вøøβщε ηყжηы чιτы?"]}}};
const defaultTitle=i=>i<ARCHIVE_COUNT?`Запись ${i+1}`:CHARACTER_NAMES[i-ARCHIVE_COUNT]||"Персонаж";
const QA_COUNT=4,QA_MAX=8,PH_ANSWER="Здесь будет ответ.";
const normalizeOption=(x,j)=>{const o={q:String((x&&x.q)||`Вопрос ${j+1}`).slice(0,200),a:String((x&&x.a)??PH_ANSWER).slice(0,2000)};if(x&&x.emotion)o.emotion=String(x.emotion);return o};
const forkOptions=label=>[0,1].map(j=>({q:`${label}: вопрос ${j+1}`,a:PH_ANSWER}));
// options: [два вопроса] — кнопка открывает развилку; null — развилки нет (выключена вручную); нет поля — работает заготовка персонажа
const normalizeQA=(src,preset)=>{
  const n=Array.isArray(src)&&src.length?Math.min(src.length,QA_MAX):QA_COUNT;
  return Array.from({length:n},(_,k)=>{
    const x=Array.isArray(src)&&src[k]||{};
    const item={q:String(x.q||`Вопрос ${k+1}`).slice(0,200),a:String(x.a??PH_ANSWER).slice(0,2000)};
    if(Array.isArray(x.cycle)){item.cycle=x.cycle.slice(0,10).map(s=>String(s).slice(0,2000));item.cycleIdx=0;if(Array.isArray(x.cycleEmo))item.cycleEmo=x.cycleEmo.slice(0,10).map(String);if(x.void)item.void=String(x.void);}
    if(Array.isArray(x.options)&&x.options.length)item.options=x.options.slice(0,2).map((o,j)=>normalizeOption(o,j));
    else if(x.options===null)item.options=null;
    else if(x.options===undefined&&preset&&preset.fork&&preset.fork.includes(item.q)&&item.a===PH_ANSWER)item.options=preset.questions&&preset.questions[item.q]?preset.questions[item.q].map(q=>({q,a:PH_ANSWER})):forkOptions(item.q);
    return item;
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
      card.qa=normalizeQA(preset&&untouched?preset.qa.map(q=>({q,a:PH_ANSWER})):c.qa,preset);
      card.theme=c.theme==="vn"||(preset&&preset.theme==="vn"&&c.theme===undefined)?"vn":"";
      card.bg=typeof c.bg==="string"?c.bg:"";
      card.ambient=c.ambient===undefined?((preset&&preset.ambient)||""):String(c.ambient);
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
  stopAmbient();
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
// На странице в стиле новеллы выхода нет: кнопка меняет подпись и никуда не ведёт
function noExit(){
  const b=$("scene-back");
  b.textContent="The no exit";
  b.classList.remove("noexit");void b.offsetWidth;b.classList.add("noexit");
}
$("scene-back").addEventListener("click",()=>{
  if(document.body.classList.contains("vn-theme")){noExit();return}
  closePersonDetail();
});
document.addEventListener("keydown",e=>{
  if(e.key!=="Escape"||!document.body.classList.contains("detail"))return;
  if(document.body.classList.contains("vn-theme")){noExit();return}
  closePersonDetail();
});

// Страница персонажа: фон, персонаж слева, ответ в «облачке» справа сверху, 4 вопроса справа снизу
let currentPerson=-1;
const PLACEHOLDER_TEXT="Здесь будет ваш текст.";
function sceneSay(question,answer,emotion){
  const b=$("scene-bubble");
  $("scene-who").textContent=question;
  $("scene-who").hidden=!question;
  // эмоция персонажа: смена фона сцены (полноценная сцена с персонажем)
  setEmotion(emotion||"");
  // посимвольное появление текста ответа
  const an=$("scene-answer");
  clearInterval(an._typer);
  answerCache=answer||"";
  if(answer){
    b.hidden=false;
    // 1) изначально подбираем размер шрифта по ПОЛНОМУ тексту (до печати)
    fitAnswerText(an,answer);
    // 2) печатаем символ за символом
    const start=performance.now();
    const total=answer.length;
    const per=Math.max(6,Math.min(40,Math.round(1500/total)));
    an._typer=setInterval(()=>{
      const el=Math.min(total,Math.round((performance.now()-start)/per));
      an.textContent=answer.slice(0,el);
      if(el>=total)clearInterval(an._typer);
    },per);
  }else{
    b.hidden=true;
    an.style.fontSize="";
    an.style.lineHeight="";
    an.textContent="";
  }
  b.classList.remove("swap");void b.offsetWidth;b.classList.add("swap");
}
// Смена эмоции персонажа: показывает выбранную сцену-эмоцию как фон. Пустая строка — обычный фон персонажа из cards.json.
function setEmotion(src){
  if(!src){restoreDefaultBg();return}
  const bg=$("scene-bg");
  if(bg)bg.style.backgroundImage="url("+JSON.stringify(src)+")";
}
function restoreDefaultBg(){
  const bg=$("scene-bg");
  if(!bg)return;
  const c=showcaseCards[currentPerson];
  const def=c&&c.bg?c.bg:"";
  bg.style.backgroundImage=def?"url("+JSON.stringify(def)+")":"";
}
// Пустота: на 4-е нажатие вопроса-цикла экран гаснет, затем включается показ финальной картинки без интерфейса.
function triggerVoid(src){
  const sc=$("void-screen");if(!sc)return;
  const img=sc.querySelector(".void-img"),shade=sc.querySelector(".void-shade");
  img.src=src;
  sc.hidden=false;
  document.body.classList.add("void-open");
  // сначала полное затемнение
  requestAnimationFrame(()=>{shade.style.opacity="1"});
  // затем плавно включаем картинку
  setTimeout(()=>{shade.style.opacity="0"},900);
  setTimeout(()=>{img.classList.add("on")},950);
}
function closeVoid(){const sc=$("void-screen");if(!sc)return;sc.hidden=true;document.body.classList.remove("void-open");const img=sc.querySelector(".void-img");if(img){img.classList.remove("on")}}
$("void-screen")&&$("void-screen").addEventListener("click",()=>{closeVoid();hideScenes()});
function hideScenes(){
  const c=showcaseCards[currentPerson]||{};
  document.body.classList.remove("scene-open","vn-theme","detail");
  const d=$("person-detail"),s=$("character-scene");
  if(d)d.hidden=true; if(s)s.hidden=true;
  stopAmbient();
}
// Подбор размера текста ДО печати: вставляем полный текст, уменьшаем font-size, пока он не влезет в безопасную зону.
// Затем возвращаем пусто и оставляем подобранный размер — печать идёт уже с ним (размер не меняется в процессе).
function fitAnswerText(an,full){
  an.textContent=full||answerCache||"";
  let fs=parseFloat(getComputedStyle(an).fontSize);
  const minFs=Math.max(9,fs*.5);
  // высота зоны: большая часть рамки (заголовок категории + отступы снизу)
  const bubble=an.closest(".scene-bubble");
  const zoneW=an.getBoundingClientRect().width*1.0;
  let zoneH=bubble?bubble.getBoundingClientRect().height*.82:.5*an.getBoundingClientRect().height;
  let iter=0;
  an.style.fontSize="";an.style.lineHeight="1.6";
  fs=parseFloat(getComputedStyle(an).fontSize);
  while(iter++<35){
    if(an.scrollWidth<=zoneW+.5 && an.scrollHeight<=zoneH+.5)break;
    fs*=0.9;
    if(fs<minFs)break;
    an.style.fontSize=fs+"px";
    an.style.lineHeight="1.6";
  }
  // готово: оставляем размер, чистим текст для старта печати
  an.textContent="";
  void an.offsetWidth;
}
let answerCache="";
function fillScene(i){
  const c=showcaseCards[i],scene=$("character-scene"),photo=$("scene-photo"),list=$("scene-qlist");
  const vn=c.theme==="vn";
  scene.classList.toggle("vn",vn);
  scene.classList.toggle("vn-mira",vn&&c.title==="Мира");
  scene.classList.toggle("vn-gordon",vn&&c.title==="Гордон");
  document.body.classList.toggle("vn-theme",vn);
  const bg=$("scene-bg");
  if(bg){bg.style.backgroundImage=c.bg?"url("+JSON.stringify(c.bg)+")":"";bg.hidden=!(vn||c.bg)}
  // Сцена новеллы повторяет пропорции картинки, поэтому она не растягивается на любом экране
  // Картинка сцены — обычный <img>: путь из cards.json (в том числе assets/…) читается от страницы, а не от файла стилей
  const stage=$("scene-stage");
  if(stage){
    if(vn&&c.bg){stage.src=c.bg;stage.hidden=false}
    else{stage.removeAttribute("src");stage.hidden=true}
  }
  scene.style.removeProperty("--vn-ar");
  setupAmbient(c.ambient);
  if(vn&&c.bg&&typeof Image!=="undefined"){
    const im=new Image();
    im.onload=()=>{if(im.naturalWidth&&im.naturalHeight)scene.style.setProperty("--vn-ar",String(im.naturalWidth/im.naturalHeight))};
    im.src=c.bg;
  }
  photo.innerHTML="";
  photo.classList.toggle("empty",!c.image);
  if(c.image){const img=document.createElement("img");img.src=c.image;img.alt=c.title;photo.append(img)}
  else photo.textContent="ФОТО / ИЗОБРАЖЕНИЕ";
  $("scene-name").textContent=c.title;
  $("scene-back").textContent=vn?"Выход":"← Назад";
  $("scene-back").classList.remove("noexit");
  $("scene-bubble").setAttribute("data-name",c.title);
  // В стиле новеллы плашка с ответом появляется только после выбора вопроса
  sceneReset(i);
  renderMenu(i);
}
function sceneReset(i){
  const c=showcaseCards[i];
  sceneSay("",c.theme==="vn"?"":(c.text||"…"));
}
// Эмбиент страницы персонажа: включается после первого клика (так требуют браузеры), выключается кнопкой «♪ Звук»
const SOUND_KEY="there-no-exit-sound";
let soundPref=true,pendingAmbient="";
try{soundPref=localStorage.getItem(SOUND_KEY)!=="off"}catch(e){}
const ambientReady=()=>typeof Ambient!=="undefined";
function saveSoundPref(){try{localStorage.setItem(SOUND_KEY,soundPref?"on":"off")}catch(e){}}
function updateSound(){
  const b=$("scene-sound"),on=ambientReady()&&Ambient.isPlaying();
  b.textContent="♪ Звук: "+(on?"вкл":"выкл");
  b.setAttribute("aria-pressed",String(on));
}
function setupAmbient(name){
  const b=$("scene-sound");
  if(!ambientReady()||!name||!Ambient.has(name)){stopAmbient();return}
  if(pendingAmbient!==name)Ambient.stop();
  pendingAmbient=name;
  b.hidden=false;
  updateSound();
}
function stopAmbient(){
  pendingAmbient="";
  if(ambientReady())Ambient.stop();
  $("scene-sound").hidden=true;
}
function autoStartAmbient(e){
  if(!pendingAmbient||!soundPref||!ambientReady()||Ambient.isPlaying())return;
  if(e.type==="keydown"&&e.key==="Escape")return;
  if(e.target&&e.target.closest&&e.target.closest("#scene-sound"))return;
  Ambient.start(pendingAmbient);
  updateSound();
}
document.addEventListener("pointerdown",autoStartAmbient,true);
document.addEventListener("keydown",autoStartAmbient,true);
$("scene-sound").addEventListener("click",()=>{
  if(!ambientReady())return;
  if(Ambient.isPlaying()){Ambient.stop();soundPref=false}
  else if(pendingAmbient){Ambient.start(pendingAmbient);soundPref=true}
  saveSoundPref();
  updateSound();
});

// Меню сцены: у кнопки с «развилкой» открываются два вопроса, у остальных ответ показывается сразу
function menuButton(text,onClick,extraClass){
  const b=document.createElement("button");b.type="button";b.textContent=text;
  if(extraClass)b.className=extraClass;
  b.addEventListener("click",()=>onClick(b));
  return b;
}
function markActive(list,btn){[...list.children].forEach(n=>n.classList.toggle("active",n===btn))}
function renderMenu(i){
  const c=showcaseCards[i],list=$("scene-qlist");
  list.innerHTML="";
  (c.qa||[]).forEach(x=>{
    list.append(menuButton(x.q,b=>{
      if(x.options&&x.options.length){renderFork(i,x);sceneReset(i)}
      else if(x.cycle&&x.cycle.length){
        // повтор вопроса: каждый клик — следующий ответ, после последнего цикл обнуляется.
        // 4-е нажатие (после трёх ответов) — пустота: экран гаснет и показывает финальную картинку без текста.
        const idx=x.cycleIdx||0;
        if(idx>=x.cycle.length&&x.void){triggerVoid(x.void);}
        else{
          markActive(list,b);
          const emo=(x.cycleEmo&&x.cycleEmo[idx])||"";
          sceneSay(x.q,x.cycle[idx],emo);
        }
        x.cycleIdx=(idx+1)%(x.cycle.length+(x.void?1:0));
      }
      else{markActive(list,b);sceneSay(x.q,x.a)}
    }));
  });
}
function renderFork(i,x){
  const list=$("scene-qlist");
  list.innerHTML="";
  const title=document.createElement("div");title.className="fork-title";title.textContent=x.q;
  list.append(title);
  x.options.forEach(o=>list.append(menuButton(o.q,b=>{markActive(list,b);sceneSay(o.q,o.a,o.emotion||"")})));
  list.append(menuButton("← Назад",()=>{renderMenu(i);sceneReset(i)},"scene-q-back"));
  const first=list.querySelector("button");if(first)first.focus();
}
// Меню можно листать стрелками вверх/вниз
$("scene-qlist").addEventListener("keydown",e=>{
  if(e.key!=="ArrowDown"&&e.key!=="ArrowUp")return;
  const items=[...$("scene-qlist").children].filter(n=>n.type==="button"),k=items.indexOf(document.activeElement);
  if(k<0)return;
  e.preventDefault();
  const next=items[(k+(e.key==="ArrowDown"?1:-1)+items.length)%items.length];
  if(next)next.focus();
});

// Редактор карточек в админ-панели
const qaOpen=new Set();
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
      const ambLab=document.createElement("label");ambLab.className="chk";
      const sel=document.createElement("select");
      sel.setAttribute("aria-label","Эмбиент, персонаж "+(i-ARCHIVE_COUNT+1));
      const none=document.createElement("option");none.value="";none.textContent="без звука";sel.append(none);
      (typeof Ambient!=="undefined"?Ambient.list():[]).forEach(a=>{
        const o=document.createElement("option");o.value=a.id;o.textContent=a.title;sel.append(o);
      });
      sel.value=c.ambient||"";
      sel.addEventListener("change",()=>{showcaseCards[i].ambient=sel.value});
      ambLab.append(document.createTextNode("Эмбиент страницы: "),sel);
      box.append(lab,ambLab,bgBox,bgFile,bgClear);
    }
    if(c.qa){
      const det=document.createElement("details");det.className="qa-editor";
      det.open=qaOpen.has(i);
      det.addEventListener("toggle",()=>{if(det.open)qaOpen.add(i);else qaOpen.delete(i)});
      const sum=document.createElement("summary");sum.textContent="Кнопки, вопросы и ответы ("+c.qa.length+")";
      const inner=document.createElement("div");inner.className="qa-editor-body";
      const who=", персонаж "+(i-ARCHIVE_COUNT+1);
      c.qa.forEach((x,k)=>{
        const label=document.createElement("input");label.type="text";label.maxLength=200;label.placeholder="Подпись кнопки "+(k+1);label.value=x.q;
        label.setAttribute("aria-label","Подпись кнопки "+(k+1)+who);
        label.addEventListener("input",()=>{showcaseCards[i].qa[k].q=label.value});
        const forkLab=document.createElement("label");forkLab.className="chk";
        const fork=document.createElement("input");fork.type="checkbox";fork.checked=!!x.options;
        fork.addEventListener("change",()=>{
          showcaseCards[i].qa[k].options=fork.checked?forkOptions(showcaseCards[i].qa[k].q):null;
          renderShowcaseEditors();
        });
        forkLab.append(fork,document.createTextNode(" Развилка: по кнопке выбирают один из двух вопросов"));
        inner.append(label,forkLab);
        if(x.options){
          x.options.forEach((o,j)=>{
            const q=document.createElement("input");q.type="text";q.maxLength=200;q.placeholder="Вопрос "+(j+1)+" (кнопка "+(k+1)+")";q.value=o.q;
            q.setAttribute("aria-label","Вопрос "+(j+1)+", кнопка "+(k+1)+who);
            q.addEventListener("input",()=>{showcaseCards[i].qa[k].options[j].q=q.value});
            const a=document.createElement("textarea");a.maxLength=2000;a.placeholder="Ответ на вопрос "+(j+1);a.value=o.a;
            a.setAttribute("aria-label","Ответ "+(j+1)+", кнопка "+(k+1)+who);
            a.addEventListener("input",()=>{showcaseCards[i].qa[k].options[j].a=a.value});
            inner.append(q,a);
          });
        }else{
          const a=document.createElement("textarea");a.maxLength=2000;a.placeholder="Ответ (показывается сразу по кнопке)";a.value=x.a;
          a.setAttribute("aria-label","Ответ, кнопка "+(k+1)+who);
          a.addEventListener("input",()=>{showcaseCards[i].qa[k].a=a.value});
          inner.append(a);
        }
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
