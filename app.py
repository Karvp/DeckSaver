"""Local-only deck preview. No authentication, uploads or persisted user data."""
from __future__ import annotations
import re
from pathlib import Path
from flask import Flask, Response, jsonify, request
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 64 * 1024
ROOT = Path(__file__).resolve().parent
SECTIONS = {"#main": "main", "#extra": "extra", "!side": "side"}

@app.after_request
def headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'"
    response.headers["Cache-Control"] = "no-store"
    return response

@app.get("/")
def index():
    return Response((ROOT / "html" / "demo.html").read_text(encoding="utf-8"), mimetype="text/html")

@app.get("/health")
def health():
    return jsonify(status="ok", mode="offline-demo")

@app.post("/api/parse")
def parse():
    payload = request.get_json(silent=True)
    if not isinstance(payload,dict) or not isinstance(payload.get("ydk"),str):
        return jsonify(error="Expected JSON with a ydk string"),400
    raw=payload["ydk"]
    if len(raw)>30000:return jsonify(error="Deck too large"),413
    cards={"main":[],"extra":[],"side":[]}
    current="main"
    for lineno,line in enumerate(raw.splitlines(),1):
        s=line.strip()
        if s in SECTIONS:current=SECTIONS[s];continue
        if not s or s.startswith("#"):continue
        if not re.fullmatch(r"[0-9]{1,12}",s):
            return jsonify(error="Invalid card ID on line "+str(lineno)),422
        cards[current].append(s)
        if sum(map(len,cards.values()))>180:return jsonify(error="Too many cards"),422
        if cards[current].count(s)>3:return jsonify(error="More than three copies of card "+s),422
    return jsonify(sections=cards,counts={k:len(v) for k,v in cards.items()})

@app.errorhandler(413)
def too_large(_):return jsonify(error="Request too large"),413
