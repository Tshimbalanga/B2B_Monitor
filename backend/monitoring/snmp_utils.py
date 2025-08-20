from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Iterable, List, Tuple

from pysnmp.hlapi.v1arch.asyncio import (
    CommunityData,
    UdpTransportTarget,
)
from pysnmp.hlapi.v1arch.asyncio.cmdgen import get_cmd, next_cmd
from pysnmp.smi.rfc1902 import ObjectIdentity, ObjectType
from pysnmp.proto.rfc1905 import EndOfMibView
from pysnmp.hlapi.v1arch.asyncio.dispatch import SnmpDispatcher
import asyncio


def _community_data(snmp_version: str, community: str) -> CommunityData:
    if snmp_version == "v1":
        return CommunityData(community, mpModel=0)
    if snmp_version == "v2c":
        return CommunityData(community, mpModel=1)
    raise ValueError("SNMP v3 not implemented in this example")


def snmp_get(ip_address: str, community: str, oid: str, timeout: int = 2, retries: int = 1, snmp_version: str = "v2c") -> Tuple[bool, str]:
    async def _run():
        async with SnmpDispatcher() as dispatcher:
            error_indication, error_status, error_index, var_binds = await get_cmd(
                dispatcher,
                _community_data(snmp_version, community),
                UdpTransportTarget((ip_address, 161), timeout=timeout, retries=retries),
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


def snmp_walk(ip_address: str, community: str, base_oid: str, timeout: int = 2, retries: int = 1, snmp_version: str = "v2c") -> List[Tuple[str, str]]:
    async def _run():
        rows: List[Tuple[str, str]] = []
        async with SnmpDispatcher() as dispatcher:
            async for (error_indication, error_status, error_index, var_binds) in next_cmd(
                dispatcher,
                _community_data(snmp_version, community),
                UdpTransportTarget((ip_address, 161), timeout=timeout, retries=retries),
                ObjectType(ObjectIdentity(base_oid)),
            ):
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

