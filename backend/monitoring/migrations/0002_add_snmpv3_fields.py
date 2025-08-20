from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("monitoring", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="device",
            name="snmpv3_username",
            field=models.CharField(blank=True, max_length=128),
        ),
        migrations.AddField(
            model_name="device",
            name="snmpv3_auth_protocol",
            field=models.CharField(blank=True, help_text="MD5|SHA|SHA224|SHA256|SHA384|SHA512 or empty", max_length=32),
        ),
        migrations.AddField(
            model_name="device",
            name="snmpv3_auth_key",
            field=models.CharField(blank=True, max_length=256),
        ),
        migrations.AddField(
            model_name="device",
            name="snmpv3_priv_protocol",
            field=models.CharField(blank=True, help_text="DES|3DES|AES|AES192|AES256 or empty", max_length=32),
        ),
        migrations.AddField(
            model_name="device",
            name="snmpv3_priv_key",
            field=models.CharField(blank=True, max_length=256),
        ),
    ]

