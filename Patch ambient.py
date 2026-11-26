import os, sys, re, json
os.chdir(os.path.dirname(os.path.abspath(__file__)))

if "<script src=\"js/Ambient.js" in open("index.html", encoding="utf8").read():
    print("Эмбиент уже применён, повторный запуск не нужен.")
    sys.exit(0)

def patch(p, reps):
    t = open(p, encoding="utf8").read()
    for a, b in reps:
        assert t.count(a) == 1, (p, a[:70], t.count(a))
        t = t.replace(a, b)
    open(p, "w", encoding="utf8").write(t)

# ---------------- index.html ----------------
patch("index.html", [
('<button type="button" class="ghost scene-back" id="scene-back">← Назад</button>\n',
 '<button type="button" class="ghost scene-back" id="scene-back">← Назад</button>\n'
 '<button type="button" class="ghost scene-sound" id="scene-sound" aria-pressed="false" hidden>♪ Звук: выкл</button>\n'),
('<script src="js/showcase.js?v=3"></script>',
  '<script src="js/Ambient.js?v=3"></script>\n<script src="js/showcase.js?v=3"></script>'),
])
t = open("index.html", encoding="utf8").read()
t = t.replace("?v=3", "?v=4")
open("index.html", "w", encoding="utf8").write(t)

# ---------------- js/showcase.js ----------------
patch("js/showcase.js", [
# заготовка Алисы получает эмбиент
('const CHARACTER_PRESETS={"Алиса":{theme:"vn",', 'const CHARACTER_PRESETS={"Алиса":{theme:"vn",ambient:"alisa",'),
# данные: поле ambient
('      card.bg=typeof c.bg==="string"?c.bg:"";\n',
 '      card.bg=typeof c.bg==="string"?c.bg:"";\n      card.ambient=c.ambient===undefined?((preset&&preset.ambient)||""):String(c.ambient);\n'),
# сцена: включить/остановить эмбиент
('  scene.style.removeProperty("--vn-ar");\n',
 '  scene.style.removeProperty("--vn-ar");\n  setupAmbient(c.ambient);\n'),
# выход со страницы персонажа: тишина
('  $("person-detail").hidden=true;\n  $("character-scene").hidden=true;\n',
 '  $("person-detail").hidden=true;\n  $("character-scene").hidden=true;\n  stopAmbient();\n'),
# архив: звук не нужен
('  document.body.classList.remove("vn-theme");\n  const photo=$("person-detail-photo");',
 '  document.body.classList.remove("vn-theme");\n  stopAmbient();\n  const photo=$("person-detail-photo");'),
])

t = open("js/showcase.js", encoding="utf8").read()
marker = "// Меню можно листать стрелками вверх/вниз"
assert t.count(marker) == 1
t = t.replace(marker, """// Эмбиент страницы персонажа: включается после первого клика (так требуют браузеры), выключается кнопкой «♪ Звук»
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

""" + marker)

# админка: выбор эмбиента
a = "      box.append(lab,bgBox,bgFile,bgClear);\n"
assert t.count(a) == 1
t = t.replace(a, """      const ambLab=document.createElement("label");ambLab.className="chk";
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
""")
open("js/showcase.js", "w", encoding="utf8").write(t)

# ---------------- cards.json ----------------
cards = json.load(open("cards.json", encoding="utf8"))
next(c for c in cards if c["title"] == "Алиса")["ambient"] = "alisa"
json.dump(cards, open("cards.json", "w", encoding="utf8"), ensure_ascii=False, indent=2)

# ---------------- css/showcase.css ----------------
t = open("css/showcase.css", encoding="utf8").read().rstrip() + """

/* Кнопка эмбиента: правый верхний угол окна */
.scene-sound{position:fixed;top:max(16px,env(safe-area-inset-top,0px));right:16px;z-index:9}
body.vn-theme .scene.vn .scene-sound{font-family:inherit}
.showcase-editor select{background:rgba(0,0,0,.35);color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:8px;font:inherit}
"""
open("css/showcase.css", "w", encoding="utf8").write(t)

# ---------------- README ----------------
patch("README.md", [
("- js/lightbox.js", "- js/Ambient.js — генеративный эмбиент (Web Audio, без файлов); пресет alisa, на странице персонажа включается после первого клика\n- js/lightbox.js"),
("bg (фон страницы).", "bg (фон страницы), ambient (id эмбиента, например alisa; пусто — без звука)."),
])
print("patched")