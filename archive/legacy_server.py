import os
import json

from globs import *
from urllib.parse import unquote, urlparse
from flask import Flask, request, send_file, Response, redirect
from werkzeug.utils import secure_filename

import backend


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

def ensure_https():
    url = urlparse(request.url)
    if url.scheme != 'https':
        return True, redirect(url._replace(scheme="https").geturl(), code=301)
    return False, None

@app.route('/')
def index():
    check = ensure_https()
    if check[0]:
        return check[1]
    return send_file('html/index.html')

@app.route('/builder')
def deck_builder():
    check = ensure_https()
    if check[0]:
        return check[1]
    return send_file('html/builder.html')

@app.route('/login')
def login():
    check = ensure_https()
    if check[0]:
        return check[1]
    return send_file('html/login.html')

@app.route('/test/<name>')
def test(name):
    name = secure_filename(name)
    return send_file(os.path.join("test/", name))

@app.route('/scripts/<name>', methods=["GET"])
def scripts(name):
    name = secure_filename(name)
    return send_file(os.path.join("js/", name))

@app.route('/styles/<name>', methods=["GET"])
def styles(name):
    name = secure_filename(name)
    return send_file(os.path.join("css/", name))

@app.route('/api/<command>', methods=["OPTIONS"])
def api_opt_cors(command):
    resp = Response("")

    resp.headers["Access-Control-Allow-Origin"] = "https://decksaver.glitch.me"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    resp.headers["Access-Control-Max-Age"] = "86400"

    return resp

@app.route('/api/<command>', methods=["POST"])
def api(command):
    cmds = command.split("/")


    if cmds[0] == "login":
        if request.form.get("token") != None:
            username, token = request.form['u'], request.form["token"]
            try:
                result = backend.Authenticator.verify_token(username, token)
                if result:
                    data = {"error": False, "success": True}
                else:
                    data = {"error": False, "success": False}
            except:
                data = {"error": True, "msg": "internal_error"}
        else:
            username, password, hashalgo = request.form['u'], request.form['p'], request.form['a']
            try:
                result = backend.Authenticator.login(username, password, hashalgo)
                if result:
                    data = {"error": False, "success": True, "token": result}
                else:
                    data = {"error": False, "success": False}
            except Exception as e:
                data = {"error": True, "msg": "internal_error"}

        return json.dumps(data)

    if request.cookies.get("token") != None and request.cookies.get("username") != None:
        username, token = map(unquote, [request.cookies.get("username"), request.cookies.get("token")])
        if not backend.Authenticator.verify_token(username, token):
            resp = Response('{"error": true, "msg": "invalid_token"}')
            resp.set_cookie('token', '', expires=0)
            return resp
    else:
        resp = Response('{"error": true, "msg": "forbidden"}')
        return resp

    response = Response("Invalid Request")

    match cmds[0]:
        case "convert":
            response = Response(backend.DeckConverter.convert(request))
        case "search":
            response = Response(backend.CardSearch.search(request))

    response.headers["Access-Control-Allow-Origin"] = "https://decksaver.glitch.me"

    return response

@app.route('/download/<code>', methods=["GET"])
def download(code):

    filename = secure_filename(f"{code}.docx")
    filepath = os.path.join(USERS_TEMP, filename)

    if not os.path.exists(filepath):
        return ""

    with open(filepath, "rb") as fp:
        resp = Response(fp.read())

    resp.headers["Content-Length"] = os.stat(filepath).st_size
    resp.headers["Content-Transfer-Encoding"] = "binary"
    resp.headers["Accept-Ranges"] = "bytes"
    resp.headers["Content-Type"] = "application/octet-stream"
    resp.headers["Content-Disposition"] = f'attachment; filename="{filename}"'

    os.remove(filepath)

    return resp
