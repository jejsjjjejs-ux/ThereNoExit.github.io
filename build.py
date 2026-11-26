"""Собирает все файлы в один build/index.html (для публикации одним файлом).
Запуск: python build.py
        python build.py --preview   (build/preview.html без зашифрованных данных, для быстрого просмотра)"""
import re, sys, json, base64, mimetypes, pathlib
PREVIEW = "--preview" in sys.argv   # предпросмотр без ваших зашифрованных файлов
root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf8")

def css(m):
    t = (root / m.group(1).split("?")[0]).read_text(encoding="utf8")
    t = t.replace("url(../bg.jpg)", "url(data:image/jpeg;base64," + base64.b64encode((root / "bg.jpg").read_bytes()).decode() + ")")
    t = t.replace("url(../assets/mira-ui-frame.png)", "url(data:image/png;base64," + base64.b64encode((root / "assets" / "mira-ui-frame.png").read_bytes()).decode() + ")")
    t = t.replace("url(../assets/gordon/gordon-frame-alpha.png)", "url(data:image/png;base64," + base64.b64encode((root / "assets" / "gordon" / "gordon-frame-alpha.png").read_bytes()).decode() + ")")
    return "<style>\n" + t + "</style>"
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)

# cards.json не загрузится из одной страницы, поэтому вшиваем его
cards = root / "cards.json"
if cards.exists():
    items = json.loads(cards.read_text(encoding="utf8"))
    for it in items:
        for key in ("image", "bg"):
            v = it.get(key) or ""
            if v.startswith("assets/") and (root / v).is_file():
                mime = mimetypes.guess_type(v)[0] or "image/png"
                it[key] = "data:" + mime + ";base64," + base64.b64encode((root / v).read_bytes()).decode()
        for qa in it.get("qa") or []:
            for o in qa.get("options") or []:
                v = o.get("emotion") or ""
                if v.startswith("assets/") and (root / v).is_file():
                    mime = mimetypes.guess_type(v)[0] or "image/png"
                    o["emotion"] = "data:" + mime + ";base64," + base64.b64encode((root / v).read_bytes()).decode()
            for i, e in enumerate(qa.get("cycleEmo") or []):
                if e.startswith("assets/") and (root / e).is_file():
                    mime = mimetypes.guess_type(e)[0] or "image/png"
                    qa["cycleEmo"][i] = "data:" + mime + ";base64," + base64.b64encode((root / e).read_bytes()).decode()
            vv = qa.get("void") or ""
            if vv.startswith("assets/") and (root / vv).is_file():
                mime = mimetypes.guess_type(vv)[0] or "image/png"
                qa["void"] = "data:" + mime + ";base64," + base64.b64encode((root / vv).read_bytes()).decode()
    data = json.dumps(items, ensure_ascii=False).replace("</", "<\\/")
    inject = "<script>window.INLINE_CARDS=" + data + ";</script>\n"
    html = re.sub(r'<script src=', lambda m: inject + m.group(0), html, count=1)

def script(m):
    name = m.group(1).split("?")[0]
    t = (root / name).read_text(encoding="utf8")
    if PREVIEW and name.endswith("data.js"):
        t = "const VAULT={};\nconst HINTS={};\n"
    return "<script>\n" + t + "</script>"
html = re.sub(r'<script src="([^"]+)"></script>', script, html)

if re.search(r'push\("[0-9a-f]{32}"\)', (root / "js" / "data.js").read_text(encoding="utf8")):
    print("ВНИМАНИЕ: в js/data.js есть файлы из папки vault/. В одну страницу (claude.ai) они не войдут и открываться не будут.")
(root / "build").mkdir(exist_ok=True)
out = root / "build" / ("preview.html" if PREVIEW else "index.html")
out.write_text(html, encoding="utf8")
mb = out.stat().st_size / 1048576
print("Готово: build/%s (%.1f МБ)" % (out.name, mb))
if mb > 16:
    print("ВНИМАНИЕ: больше 16 МБ, claude.ai такую страницу не примет. Уменьшите bg.jpg или встроенные файлы.")
