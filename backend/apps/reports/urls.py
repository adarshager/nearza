"""
Nearza — Reports URL Configuration
"""

from django.urls import path
from .views import ReportCreateView, MyReportsView

app_name = "reports"

urlpatterns = [
    path("", ReportCreateView.as_view(), name="report-create"),
    path("my/", MyReportsView.as_view(), name="my-reports"),
]
