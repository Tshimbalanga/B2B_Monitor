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
            "backend_server_ip",
            "snmp_port",
            "snmp_version",
            "community",
            "snmpv3_username",
            "snmpv3_security_level",
            "snmpv3_auth_protocol",
            "snmpv3_auth_key",
            "snmpv3_priv_protocol",
            "snmpv3_priv_key",
            "is_simulated",
            "simulated_mib_seed",
            "description",
            "poll_interval_seconds",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "snmpv3_auth_key": {"write_only": True, "required": False, "allow_blank": True},
            "snmpv3_priv_key": {"write_only": True, "required": False, "allow_blank": True},
        }


class IntegrateV1Serializer(serializers.Serializer):
    name = serializers.CharField(max_length=128)
    ip_address = serializers.IPAddressField(protocol="IPv4")
    backend_server_ip = serializers.IPAddressField(protocol="IPv4")
    snmp_port = serializers.IntegerField(min_value=1, max_value=65535, required=False, default=161)
    community = serializers.CharField(max_length=128)
    is_simulated = serializers.BooleanField(required=False, default=False)
    simulated_mib_seed = serializers.CharField(max_length=64, required=False, allow_blank=True)


class IntegrateV2CSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=128)
    ip_address = serializers.IPAddressField(protocol="IPv4")
    backend_server_ip = serializers.IPAddressField(protocol="IPv4")
    snmp_port = serializers.IntegerField(min_value=1, max_value=65535, required=False, default=161)
    community = serializers.CharField(max_length=128)
    is_simulated = serializers.BooleanField(required=False, default=False)
    simulated_mib_seed = serializers.CharField(max_length=64, required=False, allow_blank=True)


class IntegrateV3Serializer(serializers.Serializer):
    name = serializers.CharField(max_length=128)
    ip_address = serializers.IPAddressField(protocol="IPv4")
    backend_server_ip = serializers.IPAddressField(protocol="IPv4")
    snmp_port = serializers.IntegerField(min_value=1, max_value=65535, required=False, default=161)
    snmpv3_username = serializers.CharField(max_length=128)
    snmpv3_security_level = serializers.ChoiceField(choices=("noAuthNoPriv", "authNoPriv", "authPriv"))
    snmpv3_auth_protocol = serializers.ChoiceField(choices=("", "MD5", "SHA", "SHA224", "SHA256", "SHA384", "SHA512"), required=False, default="")
    snmpv3_auth_key = serializers.CharField(max_length=256, required=False, allow_blank=True)
    snmpv3_priv_protocol = serializers.ChoiceField(choices=("", "DES", "3DES", "AES", "AES192", "AES256"), required=False, default="")
    snmpv3_priv_key = serializers.CharField(max_length=256, required=False, allow_blank=True)
    is_simulated = serializers.BooleanField(required=False, default=False)
    simulated_mib_seed = serializers.CharField(max_length=64, required=False, allow_blank=True)

    def validate(self, data):
        level = data.get("snmpv3_security_level")
        auth_proto = (data.get("snmpv3_auth_protocol") or "").upper()
        auth_key = data.get("snmpv3_auth_key") or ""
        priv_proto = (data.get("snmpv3_priv_protocol") or "").upper()
        priv_key = data.get("snmpv3_priv_key") or ""
        if level == "noAuthNoPriv":
            # ignore auth/priv
            return data
        if level == "authNoPriv":
            if not auth_proto or not auth_key:
                raise serializers.ValidationError("authNoPriv requires snmpv3_auth_protocol and snmpv3_auth_key")
            return data
        if level == "authPriv":
            if not auth_proto or not auth_key or not priv_proto or not priv_key:
                raise serializers.ValidationError("authPriv requires auth protocol/key and priv protocol/key")
            return data
        return data


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

