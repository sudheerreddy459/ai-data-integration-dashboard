import json
import logging

from openai import OpenAI

from app.config import settings


logger = logging.getLogger(__name__)


def rule_based_analysis(
    error_message: str | None,
    error_category: str | None,
    severity: str | None
) -> dict[str, str]:
    """
    Rule-based failure analysis.

    Used when:
    - OpenAI is not configured
    - OpenAI request fails
    - AI response cannot be parsed
    """

    category = (
        error_category.strip().lower()
        if error_category
        else "unknown"
    )

    message = (
        error_message.strip().lower()
        if error_message
        else ""
    )

    # Timeout failures
    if category == "timeout" or "timeout" in message:
        return {
            "probable_cause": (
                "The source or target system did not respond "
                "within the configured timeout period."
            ),
            "recommendation": (
                "Check system availability, network connectivity, "
                "API response time, and timeout configuration."
            ),
            "analysis_source": "RuleBased"
        }

    # Connection failures
    if category == "connection" or "connection" in message:
        return {
            "probable_cause": (
                "The integration could not establish or maintain "
                "a connection with the source or target system."
            ),
            "recommendation": (
                "Verify endpoint availability, network connectivity, "
                "DNS configuration, firewall rules, and credentials."
            ),
            "analysis_source": "RuleBased"
        }

    # Authentication failures
    if (
        category == "authentication"
        or "unauthorized" in message
        or "authentication" in message
        or "401" in message
    ):
        return {
            "probable_cause": (
                "Authentication with the external system failed."
            ),
            "recommendation": (
                "Verify credentials, access tokens, OAuth configuration, "
                "token expiry, and required permissions."
            ),
            "analysis_source": "RuleBased"
        }

    # Database failures
    if (
        category == "database"
        or "database" in message
        or "sql" in message
    ):
        return {
            "probable_cause": (
                "A database operation failed while processing "
                "the integration."
            ),
            "recommendation": (
                "Check database connectivity, SQL errors, constraints, "
                "permissions, and query performance."
            ),
            "analysis_source": "RuleBased"
        }

    # Validation failures
    if (
        category == "validation"
        or "validation" in message
        or "invalid" in message
    ):
        return {
            "probable_cause": (
                "The incoming or outgoing data did not satisfy "
                "the expected validation rules."
            ),
            "recommendation": (
                "Review the payload, required fields, data types, "
                "mapping rules, and target-system validation requirements."
            ),
            "analysis_source": "RuleBased"
        }

    # Default fallback
    return {
        "probable_cause": (
            "The exact cause could not be determined from "
            "the available failure information."
        ),
        "recommendation": (
            "Review the error message, integration logs, source and "
            "target system status, and surrounding execution details."
        ),
        "analysis_source": "RuleBased"
    }


def openai_analysis(
    error_message: str | None,
    error_category: str | None,
    severity: str | None
) -> dict[str, str]:
    """
    Analyse an integration failure using OpenAI.
    """

    client = OpenAI(
        api_key=settings.OPENAI_API_KEY
    )

    prompt = f"""
You are analysing a failed enterprise data integration execution.

Failure information:

Error message: {error_message or "Not available"}
Error category: {error_category or "Unknown"}
Severity: {severity or "Unknown"}

Determine:

1. The most probable technical cause of the failure.
2. A practical recommendation for an integration engineer.

Do not invent system-specific facts that are not present in the failure data.

Return ONLY valid JSON in this exact structure:

{{
    "probable_cause": "short technical explanation",
    "recommendation": "practical troubleshooting recommendation"
}}
"""

    response = client.responses.create(
        model=settings.OPENAI_MODEL,
        input=prompt
    )

    result = json.loads(
        response.output_text
    )

    probable_cause = result.get("probable_cause")
    recommendation = result.get("recommendation")

    if not probable_cause or not recommendation:
        raise ValueError(
            "AI response is missing required fields"
        )

    return {
        "probable_cause": str(probable_cause),
        "recommendation": str(recommendation),
        "analysis_source": "AI"
    }


def analyse_failure(
    error_message: str | None,
    error_category: str | None,
    severity: str | None
) -> dict[str, str]:
    """
    Analyse an integration failure.

    OpenAI is preferred when configured.
    Rule-based analysis is the fallback.
    """

    if not settings.OPENAI_API_KEY:
        return rule_based_analysis(
            error_message=error_message,
            error_category=error_category,
            severity=severity
        )

    try:
        return openai_analysis(
            error_message=error_message,
            error_category=error_category,
            severity=severity
        )

    except Exception as exc:
        # Do not log API keys or other credentials.
        # This logs the error type/message so we can diagnose
        # authentication, quota, model-access or parsing failures.
        logger.warning(
            "OpenAI failure analysis failed. "
            "Using rule-based fallback. %s: %s",
            type(exc).__name__,
            str(exc)
        )

        return rule_based_analysis(
            error_message=error_message,
            error_category=error_category,
            severity=severity
        )