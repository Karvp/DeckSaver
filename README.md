# Yu-Gi-Oh! DeckSaver

DeckSaver is a Flask and JavaScript project for working with Yu-Gi-Oh! decks in the YDK format.

## Run

Install Python dependencies:

~~~powershell
python -m pip install -r requirements.txt
python server.py
~~~

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) to preview a deck, check card IDs, count Main/Extra/Side Deck entries and save a YDK file.

The demo runs locally without accounts, file uploads or a database.

## Source

- `app.py`, `server.py` — Flask demo and entry point
- `html/demo.html` — deck preview UI
- `func/ydk.py`, `func/base.py`, `func/yugiohdb.py` — additional YDK, document and card-data modules
- `archive/legacy_server.py` — original Flask server code, retained for reference

## Tests

~~~powershell
python -m unittest discover -s tests -v
~~~

## License

GPL-3.0-only. See [LICENSE](LICENSE). Yu-Gi-Oh! artwork and trademarks belong to their respective owners.
