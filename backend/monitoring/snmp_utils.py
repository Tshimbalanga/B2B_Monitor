from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Iterable, List, Tuple
import random

from pysnmp.hlapi.v1arch.asyncio import CommunityData as V1V2CommunityData
from pysnmp.hlapi.v1arch.asyncio import UdpTransportTarget
from pysnmp.hlapi.v1arch.asyncio.cmdgen import get_cmd as v1v2_get_cmd, next_cmd as v1v2_next_cmd
from pysnmp.hlapi.v3arch.asyncio.auth import (
    CommunityData as V3CommunityData,
    UsmUserData,
    USM_AUTH_HMAC96_MD5,
    USM_AUTH_HMAC96_SHA,
    USM_AUTH_HMAC128_SHA224,
    USM_AUTH_HMAC192_SHA256,
    USM_AUTH_HMAC256_SHA384,
    USM_AUTH_HMAC384_SHA512,
    USM_PRIV_CBC56_DES,
    USM_PRIV_CBC168_3DES,
    USM_PRIV_CFB128_AES,
    USM_PRIV_CFB192_AES,
    USM_PRIV_CFB256_AES,
)
from pysnmp.hlapi.v3arch.asyncio.context import ContextData
from pysnmp.hlapi.v3arch.asyncio.cmdgen import get_cmd as v3_get_cmd, next_cmd as v3_next_cmd
from pysnmp.smi.rfc1902 import ObjectIdentity, ObjectType
from pysnmp.proto.rfc1905 import EndOfMibView
from pysnmp.hlapi.v1arch.asyncio.dispatch import SnmpDispatcher
import asyncio


def _community_data(snmp_version: str, community: str):
    if snmp_version == "v1":
        return V1V2CommunityData(community, mpModel=0)
    if snmp_version == "v2c":
        return V1V2CommunityData(community, mpModel=1)
    return None


def _usm_from_params(username: str, auth_proto: str, auth_key: str, priv_proto: str, priv_key: str) -> UsmUserData:
    auth_map = {
        "MD5": USM_AUTH_HMAC96_MD5,
        "SHA": USM_AUTH_HMAC96_SHA,
        "SHA224": USM_AUTH_HMAC128_SHA224,
        "SHA256": USM_AUTH_HMAC192_SHA256,
        "SHA384": USM_AUTH_HMAC256_SHA384,
        "SHA512": USM_AUTH_HMAC384_SHA512,
        "": None,
    }
    priv_map = {
        "DES": USM_PRIV_CBC56_DES,
        "3DES": USM_PRIV_CBC168_3DES,
        "AES": USM_PRIV_CFB128_AES,
        "AES192": USM_PRIV_CFB192_AES,
        "AES256": USM_PRIV_CFB256_AES,
        "": None,
    }
    a = auth_map.get((auth_proto or "").upper())
    p = priv_map.get((priv_proto or "").upper())
    if a and p:
        return UsmUserData(username, auth_key, a, priv_key, p)
    if a and not p:
        return UsmUserData(username, auth_key, a)
    if not a and not p:
        return UsmUserData(username)
    # priv without auth is not allowed in SNMPv3
    return UsmUserData(username)


def _simulate_value(oid: str, seed: str | None = None) -> str:
    rnd = random.Random(seed or "")
    # Simple mapping: uptime OID, hostname OID, CPU, etc. Otherwise random int
    if oid.endswith(".1.3.6.1.2.1.1.3.0"):
        return str(rnd.randint(100000, 999999))
    if oid.endswith(".1.3.6.1.2.1.1.5.0"):
        return f"sim-device-{rnd.randint(1, 999)}"
    return str(rnd.randint(1, 100))


def snmp_get(
    ip_address: str,
    community: str,
    oid: str,
    timeout: int = 2,
    retries: int = 1,
    snmp_version: str = "v2c",
    snmpv3_username: str | None = None,
    snmpv3_auth_protocol: str | None = None,
    snmpv3_auth_key: str | None = None,
    snmpv3_priv_protocol: str | None = None,
    snmpv3_priv_key: str | None = None,
    simulate: bool = False,
    simulate_seed: str | None = None,
) -> Tuple[bool, str]:
    if simulate:
        return True, _simulate_value(oid, simulate_seed)
    async def _run():
        async with SnmpDispatcher() as dispatcher:
            if snmp_version in ("v1", "v2c"):
                error_indication, error_status, error_index, var_binds = await v1v2_get_cmd(
                    dispatcher,
                    _community_data(snmp_version, community),
                    UdpTransportTarget((ip_address, 161), timeout=timeout, retries=retries),
                    ObjectType(ObjectIdentity(oid)),
                )
            else:
                user = _usm_from_params(
                    snmpv3_username or "",
                    snmpv3_auth_protocol or "",
                    snmpv3_auth_key or "",
                    snmpv3_priv_protocol or "",
                    snmpv3_priv_key or "",
                )
                error_indication, error_status, error_index, var_binds = await v3_get_cmd(
                    dispatcher,
                    user,
                    UdpTransportTarget((ip_address, 161), timeout=timeout, retries=retries),
                    ContextData(),
                    ObjectType(ObjectIdentity(oid)),
                )
            if error_indication:
                return False, str(error_indication)
            if error_status:
                return False, f"{error_status} at {error_index}"
            for name, val in var_binds:
                return True, val.prettyPrint()
            return False, "No response"

    return asyncio.run(_run())


def snmp_walk(
    ip_address: str,
    community: str,
    base_oid: str,
    timeout: int = 2,
    retries: int = 1,
    snmp_version: str = "v2c",
    snmpv3_username: str | None = None,
    snmpv3_auth_protocol: str | None = None,
    snmpv3_auth_key: str | None = None,
    snmpv3_priv_protocol: str | None = None,
    snmpv3_priv_key: str | None = None,
    simulate: bool = False,
    simulate_seed: str | None = None,
) -> List[Tuple[str, str]]:
    if simulate:
        rnd = random.Random(simulate_seed or "")
        fake = []
        # Generate a few fake OIDs under base_oid
        for i in range(1, 6):
            fake.append((f"{base_oid}.{i}", str(rnd.randint(1, 1000))))
        # Add common system OIDs
        fake.append(("1.3.6.1.2.1.1.3.0", str(rnd.randint(100000, 999999))))
        fake.append(("1.3.6.1.2.1.1.5.0", f"sim-device-{rnd.randint(1, 999)}"))
        return fake
    async def _run():
        rows: List[Tuple[str, str]] = []
        async with SnmpDispatcher() as dispatcher:
            if snmp_version in ("v1", "v2c"):
                agen = v1v2_next_cmd(
                    dispatcher,
                    _community_data(snmp_version, community),
                    UdpTransportTarget((ip_address, 161), timeout=timeout, retries=retries),
                    ObjectType(ObjectIdentity(base_oid)),
                )
            else:
                user = _usm_from_params(
                    snmpv3_username or "",
                    snmpv3_auth_protocol or "",
                    snmpv3_auth_key or "",
                    snmpv3_priv_protocol or "",
                    snmpv3_priv_key or "",
                )
                agen = v3_next_cmd(
                    dispatcher,
                    user,
                    UdpTransportTarget((ip_address, 161), timeout=timeout, retries=retries),
                    ContextData(),
                    ObjectType(ObjectIdentity(base_oid)),
                )
            async for (error_indication, error_status, error_index, var_binds) in agen:
                if error_indication:
                    raise RuntimeError(str(error_indication))
                if error_status:
                    raise RuntimeError(f"{error_status} at {error_index}")
                for name, val in var_binds:
                    if isinstance(val, EndOfMibView):
                        return rows
                    rows.append((str(name), val.prettyPrint()))
        return rows

    return asyncio.run(_run())

