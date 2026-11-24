"""Собирает все файлы в один build/index.html (для публикации одним файлом).
Запуск: python build.py"""
import re, json, base64, pathlib
root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf8")

def css(m):
    t = (root / m.group(1).split("?")[0]).read_text(encoding="utf8")
    t = t.replace("url(../bg.jpg)", "url(data:image/jpeg;base64," + base64.b64encode((root / "bg.jpg").read_bytes()).decode() + ")")
    return "<style>\n" + t + "</style>"
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)

# cards.json не загрузится из одной страницы, поэтому вшиваем его
cards = root / "cards.json"
if cards.exists():
    data = json.dumps(json.loads(cards.read_text(encoding="utf8")), ensure_ascii=False).replace("</", "<\\/")
    inject = "<script>window.INLINE_CARDS=" + data + ";</script>\n"
    html = re.sub(r'<script src=', lambda m: inject + m.group(0), html, count=1)

html = re.sub(r'<script src="([^"]+)"></script>', lambda m: "<script>\n" + (root / m.group(1).split("?")[0]).read_text(encoding="utf8") + "</script>", html)

if re.search(r'push\("[0-9a-f]{32}"\)', (root / "js" / "data.js").read_text(encoding="utf8")):
    print("ВНИМАНИЕ: в js/data.js есть файлы из папки vault/. В одну страницу (claude.ai) они не войдут и открываться не будут.")
(root / "build").mkdir(exist_ok=True)
out = root / "build" / "index.html"
out.write_text(html, encoding="utf8")
mb = out.stat().st_size / 1048576
print("Готово: build/index.html (%.1f МБ)" % mb)
if mb > 16:
    print("ВНИМАНИЕ: больше 16 МБ, claude.ai такую страницу не примет. Уменьшите bg.jpg или встроенные файлы.")
