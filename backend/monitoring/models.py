from __future__ import annotations

from django.conf import settings
from django.db import models


class Device(models.Model):
    SNMP_VERSIONS = (
        ("v1", "v1"),
        ("v2c", "v2c"),
        ("v3", "v3"),
    )

    name = models.CharField(max_length=128, unique=True)
    ip_address = models.GenericIPAddressField(protocol="IPv4")
    snmp_version = models.CharField(max_length=3, choices=SNMP_VERSIONS, default="v2c")
    community = models.CharField(max_length=128, blank=True, help_text="SNMP community for v1/v2c")
    # SNMPv3 credentials
    snmpv3_username = models.CharField(max_length=128, blank=True)
    snmpv3_auth_protocol = models.CharField(max_length=32, blank=True, help_text="MD5|SHA|SHA224|SHA256|SHA384|SHA512 or empty")
    snmpv3_auth_key = models.CharField(max_length=256, blank=True)
    snmpv3_priv_protocol = models.CharField(max_length=32, blank=True, help_text="DES|3DES|AES|AES192|AES256 or empty")
    snmpv3_priv_key = models.CharField(max_length=256, blank=True)
    description = models.TextField(blank=True)
    poll_interval_seconds = models.PositiveIntegerField(default=300)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.name} ({self.ip_address})"


class OID(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="oids")
    oid = models.CharField(max_length=256)
    description = models.CharField(max_length=256, blank=True)
    last_value = models.CharField(max_length=512, blank=True)
    last_updated = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("device", "oid")

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.device.name}:{self.oid}"


class OIDHistory(models.Model):
    oid_ref = models.ForeignKey(OID, on_delete=models.CASCADE, related_name="history")
    value = models.CharField(max_length=512)
    captured_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-captured_at"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.oid_ref.oid} @ {self.captured_at}"

