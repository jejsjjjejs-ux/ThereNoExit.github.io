"""Добавляет файл в js/data.js.
Использование: python add_file.py "фраза-запрос" путь/к/файлу [--password ПАРОЛЬ] [--hint ПОДСКАЗКА]
Нужен: pip install cryptography"""
import sys, os, re, json, hashlib, base64, mimetypes, pathlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

args = sys.argv[1:]
def opt(n):
    if n in args:
        i = args.index(n); v = args[i + 1]; del args[i:i + 2]; return v
pw = opt("--password"); hint = opt("--hint")
phrase = re.sub(r"\s+", " ", args[0].strip().lower().replace("ё", "е"))
path = pathlib.Path(args[1])
sha = lambda s: hashlib.sha256(s.encode()).hexdigest()
salt = hashlib.sha256(("salt:" + phrase).encode()).digest()[:16]
key = PBKDF2HMAC(hashes.SHA256(), 32, salt, 200000).derive((phrase + "\0" + pw.strip() if pw else phrase).encode())
head = json.dumps({"n": path.name, "t": mimetypes.guess_type(path.name)[0] or ""}, ensure_ascii=False, separators=(",", ":")).encode()
plain = len(head).to_bytes(4, "big") + head + path.read_bytes()
iv = os.urandom(12)
cipher = base64.b64encode(iv + AESGCM(key).encrypt(iv, plain, None)).decode()
h = sha("lookup:" + phrase)
with open(pathlib.Path(__file__).parent / "js" / "data.js", "a", encoding="utf8") as f:
    if pw:
        f.write('HINTS["%s"]=%s;\n' % (h, json.dumps(hint or "", ensure_ascii=False)))
    f.write('(VAULT["%s"]=VAULT["%s"]||[]).push("%s");\n' % (h, h, cipher))
print("Добавлено:", path.name)
