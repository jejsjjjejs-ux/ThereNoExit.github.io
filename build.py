"""Собирает все файлы в один build/index.html (для публикации одним файлом).
Запуск: python build.py"""
import re, base64, pathlib
root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf8")
def css(m): 
    t = (root / m.group(1)).read_text(encoding="utf8")
    t = t.replace("url(../bg.jpg)", "url(data:image/jpeg;base64," + base64.b64encode((root / "bg.jpg").read_bytes()).decode() + ")")
    return "<style>\n" + t + "</style>"
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
html = re.sub(r'<script src="([^"]+)"></script>', lambda m: "<script>\n" + (root / m.group(1)).read_text(encoding="utf8") + "</script>", html)
if re.search(r'push\("[0-9a-f]{32}"\)', (root / "js" / "data.js").read_text(encoding="utf8")):
    print("ВНИМАНИЕ: в js/data.js есть файлы из папки vault/. В одну страницу (claude.ai) они не войдут и открываться не будут.")
(root / "build").mkdir(exist_ok=True)
(root / "build" / "index.html").write_text(html, encoding="utf8")
print("Готово: build/index.html")
