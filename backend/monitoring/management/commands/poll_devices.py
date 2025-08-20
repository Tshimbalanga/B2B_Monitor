from __future__ import annotations

from django.core.management.base import BaseCommand

from monitoring.tasks import poll_all_devices


class Command(BaseCommand):
    help = "Poll all devices for their configured OIDs"

    def handle(self, *args, **options):
        updated = poll_all_devices()
        self.stdout.write(self.style.SUCCESS(f"Updated {updated} OIDs"))

