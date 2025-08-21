from __future__ import annotations

from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings

from .models import Device, OID, OIDHistory
from .serializers import (
    DeviceSerializer,
    OIDHistorySerializer,
    OIDSerializer,
    IntegrateV1Serializer,
    IntegrateV2CSerializer,
    IntegrateV3Serializer,
)
from .tasks import poll_device_oids, walk_and_update_device, continuous_collect
from .snmp_utils import snmp_get, snmp_walk
from .net_utils import ping_host


class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all().order_by("name")
    serializer_class = DeviceSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["snmp_version"]
    search_fields = ["name", "ip_address", "description"]
    ordering_fields = ["name", "ip_address", "updated_at"]

    @action(detail=False, methods=["post"], url_path="integrate")
    def integrate(self, request):
        serializer = DeviceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        device = serializer.save()
        # Initial walk to populate OIDs
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            walk_and_update_device(device.id)
        else:
            walk_and_update_device.delay(device.id)
        # Start continuous collection
        device.is_collecting = True
        device.save(update_fields=["is_collecting"])
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            # In eager mode, perform one immediate cycle only
            poll_device_oids(device.id)
            try:
                walk_and_update_device(device.id)
            except Exception:
                pass
        else:
            continuous_collect.delay(device.id)
        return Response(DeviceSerializer(device).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="integrate-v1")
    def integrate_v1(self, request):
        data = IntegrateV1Serializer(data=request.data)
        data.is_valid(raise_exception=True)
        payload = data.validated_data
        device = Device.objects.create(
            name=payload["name"],
            ip_address=payload["ip_address"],
            backend_server_ip=payload["backend_server_ip"],
            snmp_port=payload.get("snmp_port", 161),
            snmp_version="v1",
            community=payload["community"],
            is_simulated=payload.get("is_simulated", False),
            simulated_mib_seed=payload.get("simulated_mib_seed", ""),
        )
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            walk_and_update_device(device.id)
        else:
            walk_and_update_device.delay(device.id)
        device.is_collecting = True
        device.save(update_fields=["is_collecting"])
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            poll_device_oids(device.id)
            try:
                walk_and_update_device(device.id)
            except Exception:
                pass
        else:
            continuous_collect.delay(device.id)
        return Response(DeviceSerializer(device).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="integrate-v2c")
    def integrate_v2c(self, request):
        data = IntegrateV2CSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        payload = data.validated_data
        device = Device.objects.create(
            name=payload["name"],
            ip_address=payload["ip_address"],
            backend_server_ip=payload["backend_server_ip"],
            snmp_port=payload.get("snmp_port", 161),
            snmp_version="v2c",
            community=payload["community"],
            is_simulated=payload.get("is_simulated", False),
            simulated_mib_seed=payload.get("simulated_mib_seed", ""),
        )
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            walk_and_update_device(device.id)
        else:
            walk_and_update_device.delay(device.id)
        device.is_collecting = True
        device.save(update_fields=["is_collecting"])
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            poll_device_oids(device.id)
            try:
                walk_and_update_device(device.id)
            except Exception:
                pass
        else:
            continuous_collect.delay(device.id)
        return Response(DeviceSerializer(device).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="integrate-v3")
    def integrate_v3(self, request):
        data = IntegrateV3Serializer(data=request.data)
        data.is_valid(raise_exception=True)
        payload = data.validated_data
        device = Device.objects.create(
            name=payload["name"],
            ip_address=payload["ip_address"],
            backend_server_ip=payload["backend_server_ip"],
            snmp_port=payload.get("snmp_port", 161),
            snmp_version="v3",
            snmpv3_username=payload["snmpv3_username"],
            snmpv3_security_level=payload["snmpv3_security_level"],
            snmpv3_auth_protocol=payload.get("snmpv3_auth_protocol", ""),
            snmpv3_auth_key=payload.get("snmpv3_auth_key", ""),
            snmpv3_priv_protocol=payload.get("snmpv3_priv_protocol", ""),
            snmpv3_priv_key=payload.get("snmpv3_priv_key", ""),
        )
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            walk_and_update_device(device.id)
        else:
            walk_and_update_device.delay(device.id)
        device.is_collecting = True
        device.save(update_fields=["is_collecting"])
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            poll_device_oids(device.id)
            try:
                walk_and_update_device(device.id)
            except Exception:
                pass
        else:
            continuous_collect.delay(device.id)
        return Response(DeviceSerializer(device).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="poll")
    def poll(self, request, pk=None):
        device = self.get_object()
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            poll_device_oids(device.id)
        else:
            poll_device_oids.delay(device.id)
        return Response({"status": "scheduled", "device_id": device.id})

    @action(detail=True, methods=["post"], url_path="walk")
    def walk(self, request, pk=None):
        device = self.get_object()
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            walk_and_update_device(device.id)
        else:
            walk_and_update_device.delay(device.id)
        return Response({"status": "scheduled", "device_id": device.id})

    @action(detail=True, methods=["post"], url_path="start-collect")
    def start_collect(self, request, pk=None):
        device = self.get_object()
        device.is_collecting = True
        device.save(update_fields=["is_collecting"])
        if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
            poll_device_oids(device.id)
            try:
                walk_and_update_device(device.id)
            except Exception:
                pass
        else:
            continuous_collect.delay(device.id)
        return Response({"status": "collecting", "device_id": device.id})

    @action(detail=True, methods=["post"], url_path="stop-collect")
    def stop_collect(self, request, pk=None):
        device = self.get_object()
        device.is_collecting = False
        device.save(update_fields=["is_collecting"])
        return Response({"status": "stopped", "device_id": device.id})

    @action(detail=True, methods=["get"], url_path="ping")
    def ping(self, request, pk=None):
        device = self.get_object()
        ok, output = ping_host(target_ip=device.ip_address, source_ip=device.backend_server_ip or None)
        return Response({"ok": ok, "output": output})

    @action(detail=True, methods=["post"], url_path="backend-ip")
    def set_backend_ip(self, request, pk=None):
        device = self.get_object()
        new_ip = request.data.get("backend_server_ip")
        if not new_ip:
            return Response({"error": "backend_server_ip required"}, status=400)
        device.backend_server_ip = new_ip
        device.save(update_fields=["backend_server_ip"])
        return Response({"backend_server_ip": device.backend_server_ip})


class OIDViewSet(viewsets.ModelViewSet):
    queryset = OID.objects.select_related("device").all()
    serializer_class = OIDSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["device"]
    search_fields = ["oid", "description", "last_value", "device__name"]
    ordering_fields = ["last_updated", "oid"]

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        oid_obj = self.get_object()
        qs = oid_obj.history.all()
        serializer = OIDHistorySerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="get")
    def perform_get(self, request, pk=None):
        oid_obj = self.get_object()
        ok, value = snmp_get(
            oid_obj.device.ip_address,
            oid_obj.device.community,
            oid_obj.oid,
            snmp_version=oid_obj.device.snmp_version,
            snmp_port=oid_obj.device.snmp_port,
            snmpv3_username=oid_obj.device.snmpv3_username,
            snmpv3_auth_protocol=oid_obj.device.snmpv3_auth_protocol,
            snmpv3_auth_key=oid_obj.device.snmpv3_auth_key,
            snmpv3_priv_protocol=oid_obj.device.snmpv3_priv_protocol,
            snmpv3_priv_key=oid_obj.device.snmpv3_priv_key,
            simulate=oid_obj.device.is_simulated,
            simulate_seed=oid_obj.device.simulated_mib_seed,
        )
        if not ok:
            return Response({"error": value}, status=status.HTTP_502_BAD_GATEWAY)
        oid_obj.last_value = value
        oid_obj.last_updated = timezone.now()
        oid_obj.save(update_fields=["last_value", "last_updated"])
        OIDHistory.objects.create(oid_ref=oid_obj, value=value)
        return Response(OIDSerializer(oid_obj).data)


class DeviceOIDViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OIDSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        device_id = self.kwargs.get("device_pk")
        return OID.objects.filter(device_id=device_id).order_by("oid")

