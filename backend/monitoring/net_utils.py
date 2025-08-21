from __future__ import annotations

import platform
import subprocess
from typing import Tuple


def ping_host(target_ip: str, source_ip: str | None = None, count: int = 1, timeout_ms: int = 1000) -> Tuple[bool, str]:
    system = platform.system().lower()
    try:
        if system == "windows":
            cmd = ["ping", "-n", str(count), "-w", str(timeout_ms), target_ip]
            # Windows ping source binding is non-trivial; ignore source_ip
        else:
            # Linux/mac: timeout is seconds for -W; convert ms to sec ceil
            timeout_sec = max(1, int((timeout_ms + 999) / 1000))
            cmd = ["ping", "-c", str(count), "-W", str(timeout_sec)]
            if source_ip:
                # Prefer Linux -I; on macOS it may be -S but -I often works with interface
                cmd += ["-I", source_ip]
            cmd += [target_ip]
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=(timeout_ms/1000.0 + 1))
        success = proc.returncode == 0
        output = proc.stdout if proc.stdout else proc.stderr
        return success, output.strip()
    except Exception as exc:
        return False, str(exc)

