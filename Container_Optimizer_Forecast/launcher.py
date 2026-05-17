# launcher.py
import os, socket, webbrowser
from pathlib import Path

import uvicorn
from uvicorn.config import LOGGING_CONFIG as UVICORN_LOGGING_CONFIG  # <-- NEW
from backend.server import app

def find_free_port(preferred=8000, max_tries=20):
    port = preferred
    for _ in range(max_tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                port += 1
    raise RuntimeError("Nessuna porta libera trovata")

def _open_browser_when_ready(port: int, retries: int = 20, delay: float = 0.3):
    """Aspetta che il server risponda prima di aprire il browser."""
    import threading, time, urllib.request
    def _wait_and_open():
        url = f"http://127.0.0.1:{port}/ui"
        for _ in range(retries):
            try:
                urllib.request.urlopen(f"http://127.0.0.1:{port}/healthz", timeout=1)
                webbrowser.open_new_tab(url)
                return
            except Exception:
                time.sleep(delay)
        webbrowser.open_new_tab(url)  # apre comunque come fallback
    threading.Thread(target=_wait_and_open, daemon=True).start()

if __name__ == "__main__":
    port = find_free_port(8000)

    # Disabilita i colori nei formatter di uvicorn (evita sys.stderr.isatty())
    LOGGING_CONFIG = UVICORN_LOGGING_CONFIG.copy()
    LOGGING_CONFIG["formatters"]["default"]["use_colors"] = False
    LOGGING_CONFIG["formatters"]["access"]["use_colors"] = False

    _open_browser_when_ready(port)

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="info",
        log_config=LOGGING_CONFIG,
    )
