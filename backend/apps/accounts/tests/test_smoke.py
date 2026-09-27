"""
Nearza — Accounts App Foundation Smoke Test
"""
from django.test import TestCase
from django.conf import settings


class FoundationSmokeTest(TestCase):
    def test_settings_loaded(self):
        """Verify essential settings are present and correctly configured."""
        self.assertTrue(hasattr(settings, 'SECRET_KEY'))
        self.assertIn('apps.accounts', settings.INSTALLED_APPS)
        self.assertIn('apps.products', settings.INSTALLED_APPS)
        self.assertIn('apps.shops', settings.INSTALLED_APPS)

    def test_cors_and_rest_framework_configured(self):
        """Verify DRF and CORS headers are in installed apps."""
        self.assertIn('rest_framework', settings.INSTALLED_APPS)
        self.assertIn('corsheaders', settings.INSTALLED_APPS)
