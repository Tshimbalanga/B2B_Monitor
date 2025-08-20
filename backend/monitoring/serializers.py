from __future__ import annotations

from rest_framework import serializers

from .models import Device, OID, OIDHistory


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = [
            "id",
            "name",
            "ip_address",
            "snmp_version",
            "community",
            "snmpv3_username",
            "snmpv3_auth_protocol",
            "snmpv3_auth_key",
            "snmpv3_priv_protocol",
            "snmpv3_priv_key",
            "description",
            "poll_interval_seconds",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "snmpv3_auth_key": {"write_only": True, "required": False, "allow_blank": True},
            "snmpv3_priv_key": {"write_only": True, "required": False, "allow_blank": True},
        }


class OIDSerializer(serializers.ModelSerializer):
    device_name = serializers.ReadOnlyField(source="device.name")

    class Meta:
        model = OID
        fields = [
            "id",
            "device",
            "device_name",
            "oid",
            "description",
            "last_value",
            "last_updated",
        ]
        read_only_fields = ("last_value", "last_updated")


class OIDHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OIDHistory
        fields = ["id", "oid_ref", "value", "captured_at"]
        read_only_fields = ("captured_at",)

