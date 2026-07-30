def analyse_failure(
    error_message: str | None,
    error_category: str | None,
    severity: str | None
) -> dict[str, str]:
    """
    Analyse an integration failure and return
    a probable cause and recommendation.

    This is currently rule-based.
    Later, this service can call an LLM.
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
            )
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
            )
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
            )
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
            )
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
            )
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
        )
    }