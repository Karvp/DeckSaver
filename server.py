"""Safe local-only entrypoint. Historical server: archive/legacy_server.py (unsafe)."""
from app import app
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
