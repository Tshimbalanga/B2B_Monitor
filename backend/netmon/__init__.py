from __future__ import annotations

# Ensure Celery app is loaded when Django starts
try:
    from .celery import app as celery_app  # noqa: F401
except Exception:
    celery_app = None  # type: ignore

