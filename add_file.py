"""Добавляет один файл на сайт.
Использование: python add_file.py "фраза-запрос" путь/к/файлу [--password ПАРОЛЬ] [--hint ПОДСКАЗКА] [--inline]
  По умолчанию файл кладётся отдельным файлом в vault/ (до ~95 МБ).
  --inline  встраивает его в js/data.js (для claude.ai, до ~10 МБ).
  --migrate вынести все встроенные файлы из js/data.js в vault/ (без других аргументов).
Нужен: pip install cryptography"""
import sys, pathlib
import vaultlib as V

args = sys.argv[1:]
if "--migrate" in args:
    print("Вынесено файлов в vault/:", V.migrate())
    sys.exit(0)

inline = "--inline" in args
if inline:
    args.remove("--inline")

def opt(name):
    if name in args:
        i = args.index(name)
        if i + 1 >= len(args):
            sys.exit("После %s нужно указать значение." % name)
        v = args[i + 1]
        del args[i:i + 2]
        return v

pw = opt("--password")
hint = opt("--hint")
if len(args) != 2:
    sys.exit(__doc__)
phrase, path = args

p = pathlib.Path(path)
if not p.is_file():
    sys.exit("Файл не найден: " + path)
limit = 10 if inline else 95
if p.stat().st_size > limit * 1048576:
    sys.exit("Файл больше %d МБ для выбранного режима." % limit)

h = V.sha("lookup:" + V.norm(phrase))
have, hinted = V.existing()
if h in have and (h in hinted) != bool((pw or "").strip()):
    sys.exit("У этой фразы уже другой режим пароля: файлы с разным режимом под одной фразой не откроются. Используйте тот же режим.")

V.add(phrase, pw, hint, path, inline=inline)
print("Добавлено:", path)
