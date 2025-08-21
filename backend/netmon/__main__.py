from __future__ import annotations

from .celery import app

if __name__ == "__main__":  # pragma: no cover
    app.start()

