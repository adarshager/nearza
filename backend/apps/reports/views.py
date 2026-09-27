"""
Nearza — Reports Views
Customer reporting endpoints.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Report
from .serializers import ReportCreateSerializer, ReportDetailSerializer


class ReportCreateView(APIView):
    """Allow authenticated customers to report incorrect price, wrong stock, fake shop, or inappropriate content."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReportCreateSerializer(data=request.data)
        if serializer.is_valid():
            report = serializer.save(reporter=request.user)
            return Response(
                {
                    "status": "success",
                    "message": "Report submitted successfully. Our team will review it.",
                    "data": ReportDetailSerializer(report).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyReportsView(APIView):
    """List reports submitted by the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reports = Report.objects.filter(reporter=request.user).order_by("-created_at")
        serializer = ReportDetailSerializer(reports, many=True)
        return Response({
            "status": "success",
            "count": reports.count(),
            "results": serializer.data,
        })
