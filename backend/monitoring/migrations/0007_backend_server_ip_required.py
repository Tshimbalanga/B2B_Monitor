from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("monitoring", "0006_backend_server_ip"),
    ]

    operations = [
        migrations.AlterField(
            model_name="device",
            name="backend_server_ip",
            field=models.GenericIPAddressField(protocol="IPv4"),
        ),
    ]

