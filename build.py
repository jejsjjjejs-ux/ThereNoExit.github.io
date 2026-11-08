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
(root / "build").mkdir(exist_ok=True)
(root / "build" / "index.html").write_text(html, encoding="utf8")
print("Готово: build/index.html")
