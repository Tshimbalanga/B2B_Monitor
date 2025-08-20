from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("monitoring", "0002_add_snmpv3_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="device",
            name="is_simulated",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="device",
            name="simulated_mib_seed",
            field=models.CharField(blank=True, help_text="Optional seed to vary simulated values", max_length=64),
        ),
    ]

