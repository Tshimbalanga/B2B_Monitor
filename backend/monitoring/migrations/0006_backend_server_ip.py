from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("monitoring", "0005_snmp_port_v3_sec_level"),
    ]

    operations = [
        migrations.AddField(
            model_name="device",
            name="backend_server_ip",
            field=models.GenericIPAddressField(blank=True, protocol="IPv4"),
        ),
    ]

