import re
import base

__all__ = ['main']

def img_src(id):
    return f"https://images.ygoprodeck.com/images/cards/{id}.jpg"

def parse_ids(raw: str):
    counter = {} 

    for x in raw.splitlines():
        x = re.match(r"^\s*(\d+)", x)
        if x == None:
            continue
        x = x.group()
        if x in counter:
            counter[x] += 1
        else:
            counter[x] = 1

    images = 0

    for x in list(counter.keys()):
        counter[img_src(x)] = counter[x]
        images += counter[x]
        del counter[x]

    return list(counter.items()), images

base.parse_ids = parse_ids

main = base.main