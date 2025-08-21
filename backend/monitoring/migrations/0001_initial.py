from __future__ import annotations

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Device",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=128, unique=True)),
                ("ip_address", models.GenericIPAddressField(protocol="IPv4")),
                ("snmp_version", models.CharField(choices=[("v1", "v1"), ("v2c", "v2c"), ("v3", "v3")], default="v2c", max_length=3)),
                ("community", models.CharField(blank=True, help_text="SNMP community for v1/v2c", max_length=128)),
                ("description", models.TextField(blank=True)),
                ("poll_interval_seconds", models.PositiveIntegerField(default=300)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="OID",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("oid", models.CharField(max_length=256)),
                ("description", models.CharField(blank=True, max_length=256)),
                ("last_value", models.CharField(blank=True, max_length=512)),
                ("last_updated", models.DateTimeField(blank=True, null=True)),
                ("device", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="oids", to="monitoring.device")),
            ],
            options={"unique_together": {("device", "oid")}},
        ),
        migrations.CreateModel(
            name="OIDHistory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("value", models.CharField(max_length=512)),
                ("captured_at", models.DateTimeField(auto_now_add=True)),
                ("oid_ref", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="history", to="monitoring.oid")),
            ],
            options={"ordering": ["-captured_at"]},
        ),
    ]

