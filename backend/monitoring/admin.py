from __future__ import annotations

from django.contrib import admin

from .models import Device, OID, OIDHistory


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ("name", "ip_address", "snmp_version", "poll_interval_seconds")
    search_fields = ("name", "ip_address", "description")


@admin.register(OID)
class OIDAdmin(admin.ModelAdmin):
    list_display = ("device", "oid", "last_value", "last_updated")
    search_fields = ("oid", "description", "last_value")
    list_filter = ("device",)


@admin.register(OIDHistory)
class OIDHistoryAdmin(admin.ModelAdmin):
    list_display = ("oid_ref", "value", "captured_at")
    list_filter = ("oid_ref__device",)
    search_fields = ("oid_ref__oid", "value")

