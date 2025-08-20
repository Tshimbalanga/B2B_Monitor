from __future__ import annotations

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Device, OID


class APISmokeTest(APITestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(username="tester", password="pass1234")

    def auth(self):
        resp = self.client.post(reverse("token_obtain_pair"), {"username": "tester", "password": "pass1234"})
        self.assertEqual(resp.status_code, 200)
        token = resp.json()["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_device_crud(self):
        self.auth()
        create_resp = self.client.post(
            "/api/devices/",
            {
                "name": "r1",
                "ip_address": "192.0.2.10",
                "snmp_version": "v2c",
                "community": "public",
                "description": "test",
            },
            format="json",
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        device_id = create_resp.json()["id"]

        list_resp = self.client.get("/api/devices/")
        self.assertEqual(list_resp.status_code, 200)
        self.assertTrue(len(list_resp.json()) >= 1)

        # create OID
        oid_resp = self.client.post(
            "/api/oids/",
            {"device": device_id, "oid": "1.3.6.1.2.1.1.3.0", "description": "sysUpTime"},
            format="json",
        )
        self.assertEqual(oid_resp.status_code, status.HTTP_201_CREATED)

