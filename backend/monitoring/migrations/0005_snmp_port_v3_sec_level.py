from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("monitoring", "0004_is_collecting"),
    ]

    operations = [
        migrations.AddField(
            model_name="device",
            name="snmp_port",
            field=models.PositiveIntegerField(default=161),
        ),
        migrations.AddField(
            model_name="device",
            name="snmpv3_security_level",
            field=models.CharField(blank=True, help_text="noAuthNoPriv|authNoPriv|authPriv", max_length=16),
        ),
    ]

