"""Добавляет один файл на сайт.
Использование: python add_file.py "фраза-запрос" путь/к/файлу [--password ПАРОЛЬ] [--hint ПОДСКАЗКА] [--inline]
По умолчанию файл кладётся отдельным файлом в vault/ (до ~95 МБ).
--inline встраивает его в js/data.js (для claude.ai, до ~10 МБ).
Нужен: pip install cryptography"""
import sys
import vaultlib as V

args = sys.argv[1:]
inline = "--inline" in args
if inline:
    args.remove("--inline")
def opt(n):
    if n in args:
        i = args.index(n); v = args[i + 1]; del args[i:i + 2]; return v
pw = opt("--password"); hint = opt("--hint")
V.add(args[0], pw, hint, args[1], inline=inline)
print("Добавлено:", args[1])
