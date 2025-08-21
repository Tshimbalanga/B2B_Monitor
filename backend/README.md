# NetMon Backend (Django + DRF + JWT + Celery + pysnmp)

Setup
- python3 -m venv .venv; . .venv/bin/activate
- pip install -r requirements.txt
- python manage.py migrate
- python manage.py createsuperuser
- python manage.py runserver 0.0.0.0:8000

Celery (optional)
- celery -A netmon worker -l info
- celery -A netmon beat -l info

Auth
- POST /api/token/ with username/password

APIs
- CRUD: /api/devices/, /api/oids/
- Device OIDs: GET /api/devices/{id}/oids/
- Actions: POST /api/devices/{id}/poll/, POST /api/devices/{id}/walk/, GET /api/oids/{id}/history/, POST /api/oids/{id}/get/

SNMP versions
- v1/v2c via community string
- v3 via username (+ optional auth/priv protocol+key)