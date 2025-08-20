from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DeviceOIDViewSet, DeviceViewSet, OIDViewSet


router = DefaultRouter()
router.register(r"devices", DeviceViewSet, basename="device")
router.register(r"oids", OIDViewSet, basename="oid")


urlpatterns = [
    path("", include(router.urls)),
    path("devices/<int:device_pk>/oids/", DeviceOIDViewSet.as_view({"get": "list"}), name="device-oids"),
]

