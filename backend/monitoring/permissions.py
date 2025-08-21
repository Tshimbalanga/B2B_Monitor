from __future__ import annotations

from rest_framework.permissions import IsAuthenticated


class IsAuthenticatedOrReadOnly(IsAuthenticated):
    def has_permission(self, request, view):  # pragma: no cover
        if request.method in ("GET",):
            return True
        return super().has_permission(request, view)

