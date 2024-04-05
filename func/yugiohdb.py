import re
import json
import requests

from bs4 import BeautifulSoup
from urllib.parse import quote

AND = 1
OR = 2

Name = 1
Text = 2
Pendulum_Effect = 3
Number = 4

All = ""
Monster = 1
Spell = 2
Trap = 3

DARK = 12
LIGHT = 11
EARTH = 15
WATER = 13
FIRE = 14
WIND = 16
DIVINE = 17

Equip = 23
Field = 22
Quick_Play = 25
Ritual = 26
Continuous = 24
Counter = 21
Normal = 20

Spellcaster = 18
Dragon = 1
Zombie = 2
Warrior = 15
Beast_Warrior = 12
Beast = 11
Winged_Beast = 16
Fiend = 3
Fairy = 17
Insect = 10
Dinosaur = 9
Reptile = 20
Fish = 8
Sea_Serpent = 5
Aqua = 14
Pyro = 4
Thunder = 19
Rock = 6
Plant = 13
Machine = 7
Psychic = 21
Divine_Beast = 22
Wyrm = 26
Cyberse = 27
Illusion_Type = 34

Normal = 0
Effect = 1
Ritual = 3
Fusion = 2
Synchro = 9
Xyz = 10
Toon = 4
Spirit = 5
Union = 6
Gemini = 7
Tuner = 8
Flip = 14
Pendulum = 15
Link = 17

BottomLeft = "1=1"
Bottom = "2=2"
BottomRight = "3=3"
Left = "4=4"
Right = "6=6"
TopLeft = "7=7"
Top = "8=8"
TopRight = "9=9"

class By:

    def __init__(self, by):
        self.param = f"stype={by}"

    def __call__(self):
        return self.param
    
class Sort:
    Name = 1

    class Asc:
        Level = 3 
        ATK = 5 
        DEF = 7 
        Pendulum_Scale = 9 
        Link_Rating = 12 
        Release_Date = 21 

    class Desc:
        Level = 2
        ATK = 4
        DEF = 6
        Pendulum_Scale = 8
        Link_Rating = 11
        Release_Date = 20

class CardRole:
    
    def __init__(self, type: int|str):
        self.param = f"ctype={type}"
    
    def __call__(self):
        return self.param

class Attribute:
    
    def __init__(self, attrs: list[int]):
        param = ("attr={}&" * len(attrs)).format(*attrs)

        self.param = param[:-1]
    
    def __call__(self):
        return self.param

class Icon:
    
    def __init__(self, icons: list[int]):
        param = ("effe={}&" * len(icons)).format(*icons)

        self.param = param[:-1]
    
    def __call__(self):
        return self.param

class MonsterType:

    def __init__(self, types: list[int]):
        param = ("species={}&" * len(types)).format(*types)

        self.param = param[:-1]
    
    def __call__(self):
        return self.param

class Card:    

    def __init__(self, types: list[int], mode: int = OR):
        param = ("other={}&" * len(types)).format(*types)
        param += f"othercon={mode}"

        self.param = param
    
    def __call__(self):
        return self.param

class LinkMonster:
    
    def __init__(self, levels: list[int], arrows: list[str], mode: int = OR):
        param = ("linkbtn{}&" * len(arrows)).format(*arrows)
        param += ("Link{}=on&" * len(levels)).format(*levels)
        param += f"link_m={mode}"

        self.param = param

    def __call__(self):
        return self.param

class ATK:
    def __init__(self, fr: int, to: int):
        self.param = f"atkfr={fr}&atkto={to}"

    def __call__(self):
        return self.param

class DEF:
    def __init__(self, fr: int, to: int):
        self.param = f"deffr={fr}&defto={to}"

    def __call__(self):
        return self.param
    
class InitialRelease:
    # format d/m/y
    def __init__(self, fr: tuple[int, int, int] = (1, 1, 1999), to: tuple[int, int, int] = (0, 0, 0)):
        self.param = f"releaseDStart={fr[0]}&releaseMStart={fr[1]}&releaseYStart={fr[2]}"
        if to[0] != 0:
            self.param += f"&releaseDEnd={to[0]}"
        if to[1] != 1:
            self.param += f"&releaseMEnd={to[1]}"
        if to[2] != 2:
            self.param += f"&releaseYEnd={to[2]}"

    def __call__(self):
        return self.param


class Search:

        
    class Result:
        EFFECTS = ["TRAP", "SPELL"]

        def __init__(self, doc: BeautifulSoup, param: str, page: int, sort: int, compact: bool = False):
            self.param = param
            self.page = page
            self.sort = sort
            self.compact = compact

            cards = []

            card_list = doc.find("html").find("body", recursive=False).find("div", id="card_list")
            
            if card_list != None:

                if not compact:

                    images = []

                    image_list = doc.find("html").find("head").find("script", type="text/javascript", src=None).text

                    images = [
                        mat.group(1)
                        for mat in 
                        re.finditer(r"\$\('#card_image_\d+_\d+'\)\.attr\('src', *'([^']+)", image_list)
                    ]

                    for i, card in enumerate(card_list.find_all("div", recursive=False)):
                        data = {}

                        image_img = card.find("img")
                        span_name = image_img.find_next("span", class_="card_name")
                        span_attr = span_name.find_next("span", class_="box_card_attribute").find("span")

                        data["img"] = images[i]
                        data["name"] = span_name.text.strip()
                        data["attr"] = span_attr.text.strip()

                        if data["attr"] in self.EFFECTS:
                            span_effe = span_attr.parent.find("span", class_="box_card_effect", recursive=False)

                            if span_effe == None:
                                data["effe"] = "Normal"
                            else:
                                data["effe"] = span_effe.find("span").text
                        else:
                            span_infos = span_attr.find_next("span", class_="card_info_species_and_other_item").find("span")
                            span_atk = span_infos.find_next("span", class_="atk_power").find("span")
                            span_def = span_atk.find_next("span", class_="def_power").find("span")

                            data["tags"] = list(map(str.strip, span_infos.text.strip("[] \r\n\t").split("/")))
                            data["atk"] = span_atk.text.strip()[4:]
                            data["def"] = span_def.text.strip()[4:]

                            if "Link" in data["tags"]:
                                span_link_marker = span_attr.find_next("span", class_="box_card_linkmarker")
                                span_link_arrow = span_link_marker.find("img")
                                span_link_level = span_link_marker.find("span")

                                temp = span_link_arrow["src"]
                                data["arrow"] = temp[temp.rfind("/") + 5:temp.rfind(".")]
                                data["level"] = span_link_level.text.strip()[5:].strip()
                            else:
                                span_level_rank = span_attr.find_next("span", class_="box_card_level_rank").find("span")

                                data["level"] = span_level_rank.text.strip()[5:].strip()

                                if "Pendulum" in data["tags"]:
                                    span_pscale = span_level_rank.find_next("span", class_="box_card_pen_scale")
                                    span_peffe = span_pscale.find_next("span", class_="box_card_pen_effect")

                                    data["pscale"] = span_pscale.text.strip().rsplit(" ", 1)[1]
                                    data["peffe"] = span_peffe.get_text(separator="\n").strip()

                            dd_card_text = span_def.find_next("dd", class_="box_card_text")

                            data["text"] = dd_card_text.get_text(separator="\n").strip()

                        cards.append(data)

                else:

                    card_list = card_list.find("div")

                    for card in card_list.find_all("div", recursive=False):
                        data = {}

                        span_name = card.find_next("span", class_="name")
                        span_attr = span_name.find_next("div", class_="item_set").find("span")
                        span_tags = span_attr.find_next("div", class_="other").find("span")

                        data["name"] = span_name.text.strip()
                        data["attr"] = span_attr.text.strip()
                        data["tags"] = span_tags.get_text(strip=True).strip("[] \t\n\r").split("/")

                        if not data["attr"] in self.EFFECTS:

                            span_infos = span_tags.find_next("div", class_="num_set")

                            span_atk_def = span_infos.find("div").find_all("span")

                            data["atk"], data["def"] = map(lambda x: x.text.split("/")[-1].strip(), span_atk_def)

                            if "Link" in data["tags"]:
                                span_link = span_infos.find("span")
                                span_link_arrow = span_link.find_next("img")

                                temp = span_link_arrow["src"]
                                data["arrow"] = temp[temp.rfind("/") + 5:temp.rfind(".")]
                                data["level"] = len(data["arrow"])

                            else:

                                span_level_rank = span_infos.find("span")

                                data["level"] = span_level_rank.text.split("\u00a0")[1].strip()

                                if "Pendulum" in data["tags"]:
                                    span_pscale = span_level_rank.find_next("span")

                                    data["pscale"] = span_pscale.text.split("\u00a0")[1].strip()

                        cards.append(data)


            self.cards = cards

            temp = doc.find("html").find("body", recursive=False).find("div", class_="page_num")

            if temp == None:
                self.has_next = False
                self.last_page = self.page
                return

            temp = temp.find_all(recursive=False)[-1]
            self.has_next = temp.name != "p"

            if self.has_next:
                temp = temp["href"]
                self.last_page = int(temp[temp.rfind("(") + 1:-1])
            else:
                self.last_page = self.page


        def next(self):
            if not self.has_next:
                return None
            
            return Search.Result(BeautifulSoup(requests.get(
                f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?{self.param}&rp=100&page={self.page + 1}&sort={self.sort}"
            ).text, "html.parser"), self.param, self.page + 1, self.sort, self.compact)


    def __init__(
            self, 
            q: str,
            by: By = By(Name), 
            filters: list[Attribute, Icon, MonsterType, Card, LinkMonster] = [], 
            levels: list[int] = [], 
            pendulums: list[int] = [], 
            a: ATK = None, 
            d: DEF = None,
            release: InitialRelease = InitialRelease(),
            compact: bool = False
        ):
        self.compact = compact
        self.param = f"keyword={quote(q)}&ope=1&mode={2 if compact else 1}&"
        self.param += "&".join(map(lambda x: str(x()), filters))
        self.param += f"&{by}&"
        self.param += ("level{}=on&" * len(levels)).format(*levels)
        self.param += ("Pscale{}=on&" * len(pendulums)).format(*pendulums)
        self.param += release()
        if a != None:
            self.param += f"&{a()}"
        if d != None:
            self.param += f"&{d()}"

    def dispatch(self, sort: Sort = Sort.Name, page: int = 1):
        return Search.Result(BeautifulSoup(requests.get(
            f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?{self.param}&rp=100&page={page}&sort={sort}"
        ).text, "html.parser"), self.param, page, sort, self.compact)