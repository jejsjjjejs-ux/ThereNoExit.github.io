"""Общие функции шифрования для add_file.py.
Нужен: pip install cryptography"""
import os, re, json, hashlib, base64, mimetypes, pathlib, secrets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = pathlib.Path(__file__).parent
DATA = ROOT / "js" / "data.js"
VAULT_DIR = ROOT / "vault"   # зашифрованные файлы лежат здесь, по одному на файл
ALPHA = "abcdefghjkmnpqrstuvwxyz23456789"

def norm(s):
    return re.sub(r"\s+", " ", s.strip().lower().replace("ё", "е"))

def sha(s):
    return hashlib.sha256(s.encode()).hexdigest()

def gen_phrase():
    return "-".join("".join(secrets.choice(ALPHA) for _ in range(4)) for _ in range(5))

def existing():
    """Какие фразы (хеши) уже есть и у каких задан пароль."""
    t = DATA.read_text(encoding="utf8")
    return (set(re.findall(r'\(VAULT\["([0-9a-f]{64})"\]=VAULT', t)),
            set(re.findall(r'HINTS\["([0-9a-f]{64})"\]', t)))

def add(phrase, pw, hint, path, inline=False):
    """Шифрует файл. По умолчанию кладёт его отдельным файлом в vault/ (без лимита 16 МБ).
    inline=True встраивает файл в js/data.js (нужно для хостинга на claude.ai, до ~10 МБ)."""
    path = pathlib.Path(path)
    phrase = norm(phrase)
    pw = (pw or "").strip()
    salt = hashlib.sha256(("salt:" + phrase).encode()).digest()[:16]
    material = phrase + "\0" + pw if pw else phrase
    key = PBKDF2HMAC(hashes.SHA256(), 32, salt, 200000).derive(material.encode())
    head = json.dumps({"n": path.name, "t": mimetypes.guess_type(path.name)[0] or ""},
                      ensure_ascii=False, separators=(",", ":")).encode()
    plain = len(head).to_bytes(4, "big") + head + path.read_bytes()
    iv = os.urandom(12)
    raw = iv + AESGCM(key).encrypt(iv, plain, None)
    h = sha("lookup:" + phrase)
    if inline:
        ref = base64.b64encode(raw).decode()
    else:
        ref = secrets.token_hex(16)
        VAULT_DIR.mkdir(exist_ok=True)
        (VAULT_DIR / (ref + ".bin")).write_bytes(raw)
    with open(DATA, "a", encoding="utf8") as f:
        if pw:
            f.write('HINTS["%s"]=%s;\n' % (h, json.dumps(hint or "", ensure_ascii=False)))
        f.write('(VAULT["%s"]=VAULT["%s"]||[]).push("%s");\n' % (h, h, ref))
    return h

def migrate():
    """Выносит все встроенные в data.js файлы в отдельные файлы vault/*.bin."""
    t = DATA.read_text(encoding="utf8")
    n = 0
    def rep(m):
        nonlocal n
        h, b = m.group(1), m.group(2)
        if re.fullmatch(r"[0-9a-f]{32}", b):
            return m.group(0)
        ref = secrets.token_hex(16)
        VAULT_DIR.mkdir(exist_ok=True)
        (VAULT_DIR / (ref + ".bin")).write_bytes(base64.b64decode(b))
        n += 1
        return '(VAULT["%s"]=VAULT["%s"]||[]).push("%s");' % (h, h, ref)
    t = re.sub(r'\(VAULT\["([0-9a-f]{64})"\]=VAULT\["[0-9a-f]{64}"\]\|\|\[\]\)\.push\("([^"]+)"\);', rep, t)
    DATA.write_text(t, encoding="utf8")
    return n
