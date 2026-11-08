"""Добавляет файл в js/data.js.
Использование: python add_file.py "фраза-запрос" путь/к/файлу
Нужен: pip install cryptography"""
import sys, os, re, json, hashlib, base64, mimetypes, pathlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

phrase = re.sub(r"\s+", " ", sys.argv[1].strip().lower().replace("ё", "е"))
path = pathlib.Path(sys.argv[2])
sha = lambda s: hashlib.sha256(s.encode()).hexdigest()
salt = hashlib.sha256(("salt:" + phrase).encode()).digest()[:16]
key = PBKDF2HMAC(hashes.SHA256(), 32, salt, 200000).derive(phrase.encode())
head = json.dumps({"n": path.name, "t": mimetypes.guess_type(path.name)[0] or ""}, ensure_ascii=False, separators=(",", ":")).encode()
plain = len(head).to_bytes(4, "big") + head + path.read_bytes()
iv = os.urandom(12)
cipher = base64.b64encode(iv + AESGCM(key).encrypt(iv, plain, None)).decode()
h = sha("lookup:" + phrase)
with open(pathlib.Path(__file__).parent / "js" / "data.js", "a", encoding="utf8") as f:
    f.write('(VAULT["%s"]=VAULT["%s"]||[]).push("%s");\n' % (h, h, cipher))
print("Добавлено:", path.name)
