"""
Nearza — Custom Exception Handler
Returns consistent JSON error responses across all API endpoints.
"""

from rest_framework.views import exception_handler
from rest_framework import status


def custom_exception_handler(exc, context):
    """Wrap DRF exceptions in a consistent {status, message, errors} envelope."""
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            "status": "error",
            "message": _get_error_message(response),
            "errors": response.data if isinstance(response.data, dict) else {"detail": response.data},
        }
        response.data = error_data

    return response


def _get_error_message(response):
    """Generate a human-readable error message from status code."""
    messages = {
        status.HTTP_400_BAD_REQUEST: "Validation error.",
        status.HTTP_401_UNAUTHORIZED: "Authentication required.",
        status.HTTP_403_FORBIDDEN: "Permission denied.",
        status.HTTP_404_NOT_FOUND: "Resource not found.",
        status.HTTP_405_METHOD_NOT_ALLOWED: "Method not allowed.",
        status.HTTP_409_CONFLICT: "Conflict.",
        status.HTTP_429_TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
        status.HTTP_500_INTERNAL_SERVER_ERROR: "Internal server error.",
    }
    return messages.get(response.status_code, "An error occurred.")
