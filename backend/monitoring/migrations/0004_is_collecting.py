from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("monitoring", "0003_simulation_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="device",
            name="is_collecting",
            field=models.BooleanField(default=False),
        ),
    ]

