from planning.feed_parsers.onclusive import OnclusiveFeedParser
from planning.tests import TestCase
from .onclusive_api_service import OnclusiveApiService
from unittest.mock import MagicMock
from datetime import datetime

import os
import flask
import unittest
import requests_mock


parser = MagicMock(OnclusiveFeedParser)


class OnclusiveApiServiceTestCase(unittest.TestCase):
    def setUp(self) -> None:
        super().setUp()
        self.app = flask.Flask(__name__)

    def test_update(self):
        event = {"versioncreated": datetime.fromisoformat("2023-03-01T08:00:00")}
        with self.app.app_context():
            service = OnclusiveApiService()
            service.get_feed_parser = MagicMock(return_value=parser)
            parser.parse.return_value = [event]

            provider = {
                "_id": "onclusive_api",
                "name": "onclusive",
                "feed_parser": "onclusive_api",
                "config": {"url": "https://api.abc.com", "username": "user", "password": "pass", "days": "30"},
            }

            updates = {}
            with requests_mock.Mocker() as m:
                m.post(
                    "https://api.abc.com/api/v2/auth",
                    json={
                        "token": "tok",
                        "refreshToken": "refresh",
                    },
                )
                m.get("https://api.abc.com/api/v2/events/between?offset=0", json=[{}])  # first returns an item
                m.get("https://api.abc.com/api/v2/events/between?offset=100", json=[])  # second will make it stop
                list(service._update(provider, updates))
            self.assertIn("tokens", updates)
            self.assertEqual("refresh", updates["tokens"]["refreshToken"])
            self.assertEqual(event["versioncreated"], updates["tokens"]["import_finished"])

            provider.update(updates)
            updates = {}
            with requests_mock.Mocker() as m:
                m.post(
                    "https://api.abc.com/api/v2/auth/renew",
                    json={
                        "token": "tok2",
                        "refreshToken": "refresh2",
                    },
                )
                m.get("https://api.abc.com/api/v2/events/latest", json=[])
                list(service._update(provider, updates))
            self.assertEqual("refresh2", updates["tokens"]["refreshToken"])
