from __future__ import annotations

from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Device, OID, OIDHistory
from .serializers import DeviceSerializer, OIDHistorySerializer, OIDSerializer
from .tasks import poll_device_oids, walk_and_update_device, continuous_collect
from .snmp_utils import snmp_get, snmp_walk


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
        walk_and_update_device.delay(device.id) if hasattr(walk_and_update_device, "delay") else walk_and_update_device(device.id)
        # Start continuous collection
        device.is_collecting = True
        device.save(update_fields=["is_collecting"])
        continuous_collect.delay(device.id) if hasattr(continuous_collect, "delay") else continuous_collect(device.id)
        return Response(DeviceSerializer(device).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="poll")
    def poll(self, request, pk=None):
        device = self.get_object()
        result = poll_device_oids.delay(device.id) if hasattr(poll_device_oids, "delay") else poll_device_oids(device.id)
        return Response({"status": "scheduled", "device_id": device.id})

    @action(detail=True, methods=["post"], url_path="walk")
    def walk(self, request, pk=None):
        device = self.get_object()
        result = walk_and_update_device.delay(device.id) if hasattr(walk_and_update_device, "delay") else walk_and_update_device(device.id)
        return Response({"status": "scheduled", "device_id": device.id})

    @action(detail=True, methods=["post"], url_path="start-collect")
    def start_collect(self, request, pk=None):
        device = self.get_object()
        device.is_collecting = True
        device.save(update_fields=["is_collecting"])
        continuous_collect.delay(device.id) if hasattr(continuous_collect, "delay") else continuous_collect(device.id)
        return Response({"status": "collecting", "device_id": device.id})

    @action(detail=True, methods=["post"], url_path="stop-collect")
    def stop_collect(self, request, pk=None):
        device = self.get_object()
        device.is_collecting = False
        device.save(update_fields=["is_collecting"])
        return Response({"status": "stopped", "device_id": device.id})


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

