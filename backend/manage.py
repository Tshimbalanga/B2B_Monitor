#!/usr/bin/env python
import os
import sys


def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "netmon.settings")
    try:
        from django.core.management import execute_from_command_line
    except Exception as exc:  # pragma: no cover
        raise
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()

