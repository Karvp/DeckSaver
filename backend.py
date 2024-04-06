import time
import hashlib
import json
import random
import sys, os, re

from globs import *
from flask import Request
from werkzeug.utils import secure_filename
from urllib.parse import unquote, quote


sys.path.append("./func/")
import ydk
import yugiohdb as db


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def hash(type, data):
    if type in SUPPORTED_HASH:
        return getattr(hashlib, type)(data).hexdigest()
    else:
        raise Exception(f"Unsupported hash algorithm: {type}")

def randstr(length: int = 10):
    return "".join([chr(x) for x in os.urandom(length)])

class UploadManager:

    @staticmethod
    def get_path(username):
        path = os.path.join(UPLOAD_FOLDER, username)
        if not os.path.exists(path):
            os.mkdir(path)
        return path

class DeckConverter:

    @staticmethod
    def process_file(request: Request, condition):
        user_upload_folder = UploadManager.get_path(unquote(request.cookies.get("username")))

        saved = []

        for name in request.files:
            if not condition(name):
                continue

            file = request.files[name]

            if file.filename == '' or not allowed_file(file.filename):
                continue
            if file:
                filename = secure_filename(file.filename)
                savepath = os.path.join(user_upload_folder, filename)
                file.save(savepath)
                saved.append(savepath)

        return saved

    @staticmethod
    def generate_filename(precision: int = 4):
        return f"{int(time.time() * pow(10, precision))}_TEMP_{random.randint(1111111, 9999999)}"

    @staticmethod
    def convert(request: Request):
        saved = DeckConverter.process_file(request, lambda x: re.match(r'deck\d+', x) != None)
        instruct = json.loads(request.args["cfg"])

        response = {}

        for path in saved:
            filename = os.path.basename(path)
            output = os.path.join(USERS_TEMP, DeckConverter.generate_filename())

            with open(path) as f:
                if not ydk.main(f.read(), instruct, output):
                    response[filename] = {"error": True}
                else:
                    response[filename] = {"error": False, "result": os.path.basename(output)}
            # os.remove(path)

        return json.dumps(response)
    

class CardSearch:

    @staticmethod
    def search(request: Request):
        data = request.json

        filters = []

        filters.append(db.Attribute(data["attr"]))
        filters.append(db.Icon(data["icon"]))
        filters.append(db.MonsterType(data["montype"]))

        cardtypes, mode = data["cardtype"]
        filters.append(db.Card(list(map(int, cardtypes)), db.OR if mode == "or" else db.AND))

        linkrating = data["link-level"]
        linkarrow, mode = data["link-arrow"]

        filters.append(db.LinkMonster(list(map(int, linkrating)), [f"{x}={x}" for x in map(int, linkarrow)], db.OR if mode == "or" else db.AND))

        search = db.Search(
            data["search"], # already quoted inside the init
            db.By(db.Name),
            filters,
            [int(x) for x in data["level"]],
            [int(x) for x in data["pscale"]],
            db.ATK(*map(lambda x: x if x == "" else int(x), data["atk"])),
            db.DEF(*map(lambda x: x if x == "" else int(x), data["def"])),
            db.InitialRelease(tuple(map(int, data["startDate"])), tuple(map(lambda x: x if x == "" else int(x), data["endDate"]))),
            compact=True
        )
        searchResult = search.dispatch(int(data["sort"]), int(data["page"]))

        cards = searchResult.cards
        cards.append(searchResult.has_next)

        return json.dumps(cards)


class Authenticator:

    @staticmethod
    def local_token(username):
        tokenfile = f"{USER_ACCOUNTS}/{username}/token.auth"

        if os.path.exists(tokenfile):
            with open(tokenfile, "r") as f:
                token = f.read()
            if int(time.time()) - int(os.stat(tokenfile).st_mtime) <= TOKEN_TTL:
                return token
            
        return None
    
    @staticmethod
    def new_token(username):
        token = randstr(40)

        with open(f"{USER_ACCOUNTS}/{username}/token.auth", "w") as f:
            f.write(token)

        return token
    
    @staticmethod
    def get_token(username):
        token = Authenticator.local_token(username)
        if token == None or len(token) == 0:
            return Authenticator.new_token(username)
        return token

    @staticmethod
    def login(username, password, hash_algo):
        username = secure_filename(username)

        with open("./users/accounts.json", "r") as f:
            db = json.load(f)
        
        if not (username in db and hash(hash_algo, db[username].encode()) == password):
            return False
        return Authenticator.get_token(username)
    
    @staticmethod
    def verify_token(username, token):
        return token != None and len(token) > 0 and Authenticator.local_token(username) == token