from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Tuple

from celery import shared_task
from django.db import transaction
from django.utils import timezone as dj_timezone

from .models import Device, OID, OIDHistory
from .snmp_utils import snmp_get, snmp_walk


@shared_task
def poll_device_oids(device_id: int) -> int:
    try:
        device = Device.objects.get(id=device_id)
    except Device.DoesNotExist:
        return 0

    updated_count = 0
    for oid in OID.objects.filter(device=device).all():
        ok, value = snmp_get(
            device.ip_address,
            device.community,
            oid.oid,
            snmp_version=device.snmp_version,
            snmpv3_username=device.snmpv3_username,
            snmpv3_auth_protocol=device.snmpv3_auth_protocol,
            snmpv3_auth_key=device.snmpv3_auth_key,
            snmpv3_priv_protocol=device.snmpv3_priv_protocol,
            snmpv3_priv_key=device.snmpv3_priv_key,
            simulate=device.is_simulated,
            simulate_seed=device.simulated_mib_seed,
        )
        if not ok:
            continue
        with transaction.atomic():
            oid.last_value = value
            oid.last_updated = dj_timezone.now()
            oid.save(update_fields=["last_value", "last_updated"])
            OIDHistory.objects.create(oid_ref=oid, value=value)
            updated_count += 1
    return updated_count


@shared_task
def walk_and_update_device(device_id: int) -> int:
    try:
        device = Device.objects.get(id=device_id)
    except Device.DoesNotExist:
        return 0

    # Perform a walk from 1.3 base to get many OIDs
    pairs: List[Tuple[str, str]] = snmp_walk(
        device.ip_address,
        device.community,
        "1.3",
        snmp_version=device.snmp_version,
        snmpv3_username=device.snmpv3_username,
        snmpv3_auth_protocol=device.snmpv3_auth_protocol,
        snmpv3_auth_key=device.snmpv3_auth_key,
        snmpv3_priv_protocol=device.snmpv3_priv_protocol,
        snmpv3_priv_key=device.snmpv3_priv_key,
        simulate=device.is_simulated,
        simulate_seed=device.simulated_mib_seed,
    )
    now = dj_timezone.now()
    upserted = 0
    with transaction.atomic():
        for oid_str, value in pairs:
            oid_obj, _created = OID.objects.get_or_create(
                device=device, oid=oid_str, defaults={"description": ""}
            )
            oid_obj.last_value = value
            oid_obj.last_updated = now
            oid_obj.save(update_fields=["last_value", "last_updated"])
            OIDHistory.objects.create(oid_ref=oid_obj, value=value)
            upserted += 1
    return upserted


@shared_task
def poll_all_devices() -> int:
    total = 0
    for device in Device.objects.all():
        total += poll_device_oids(device.id)
    return total

