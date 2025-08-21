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
    snmp_port = models.PositiveIntegerField(default=161)
    snmp_version = models.CharField(max_length=3, choices=SNMP_VERSIONS, default="v2c")
    community = models.CharField(max_length=128, blank=True, help_text="SNMP community for v1/v2c")
    # SNMPv3 credentials
    snmpv3_username = models.CharField(max_length=128, blank=True)
    snmpv3_security_level = models.CharField(max_length=16, blank=True, help_text="noAuthNoPriv|authNoPriv|authPriv")
    snmpv3_auth_protocol = models.CharField(max_length=32, blank=True, help_text="MD5|SHA|SHA224|SHA256|SHA384|SHA512 or empty")
    snmpv3_auth_key = models.CharField(max_length=256, blank=True)
    snmpv3_priv_protocol = models.CharField(max_length=32, blank=True, help_text="DES|3DES|AES|AES192|AES256 or empty")
    snmpv3_priv_key = models.CharField(max_length=256, blank=True)
    description = models.TextField(blank=True)
    # Monitoring backend server IP used during router integration
    backend_server_ip = models.GenericIPAddressField(protocol="IPv4")
    poll_interval_seconds = models.PositiveIntegerField(default=300)
    # Simulation support
    is_simulated = models.BooleanField(default=False)
    simulated_mib_seed = models.CharField(max_length=64, blank=True, help_text="Optional seed to vary simulated values")
    is_collecting = models.BooleanField(default=False)

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

