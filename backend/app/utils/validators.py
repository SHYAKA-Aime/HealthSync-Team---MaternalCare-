import re
import uuid
from datetime import date, datetime
from typing import Iterable, Optional, Tuple

# Email regex based on HTML5 specification (simplified, practical)
_EMAIL_RE = re.compile(
    r"^(?=.{3,254}$)(?![.])([A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*)@"
    r"([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(?:\.([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?))*$"
)

# Accept E.164 or common local numbers: digits with optional '+' and spaces/dashes
_PHONE_CLEAN_RE = re.compile(r"[^\d+]")
_PHONE_VALID_RE = re.compile(r"^\+?\d{7,15}$")

_NAME_RE = re.compile(r"^[A-Za-z][A-Za-z \-'.]{0,98}[A-Za-z]$")


def is_non_empty_string(value: object) -> bool:
    return isinstance(value, str) and value.strip() != ""


def is_valid_email(email: str) -> bool:
    if not is_non_empty_string(email):
        return False
    return _EMAIL_RE.match(email) is not None


def normalize_phone(phone: str) -> Optional[str]:
    """
    Normalize a phone number by removing spaces, parentheses, and dashes.
    Keeps a leading '+' if present. Returns None if result is not plausibly valid.
    """
    if not is_non_empty_string(phone):
        return None
    cleaned = _PHONE_CLEAN_RE.sub("", phone)
    # Ensure '+' only at start if present
    if cleaned.count("+") > 1 or (len(cleaned) > 1 and "+" in cleaned[1:]):
        return None
    if not _PHONE_VALID_RE.match(cleaned):
        return None
    return cleaned


def is_valid_phone(phone: str) -> bool:
    return normalize_phone(phone) is not None


def parse_date(
    value: str, *, formats: Optional[Iterable[str]] = None
) -> Optional[date]:
    """
    Parse a date string to a date object.
    Tries ISO8601 (YYYY-MM-DD) then additional provided formats.
    """
    if not is_non_empty_string(value):
        return None
    try:
        # Primary expected format
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        pass
    # Additional formats if provided
    if formats:
        for fmt in formats:
            try:
                return datetime.strptime(value, fmt).date()
            except ValueError:
                continue
    # Try full ISO datetime and coerce to date
    try:
        return datetime.fromisoformat(value).date()
    except ValueError:
        return None


def is_valid_date(value: str, *, formats: Optional[Iterable[str]] = None) -> bool:
    return parse_date(value, formats=formats) is not None


def parse_datetime(
    value: str, *, formats: Optional[Iterable[str]] = None
) -> Optional[datetime]:
    """
    Parse a datetime string to a datetime object.
    Tries ISO8601 first then additional provided formats.
    """
    if not is_non_empty_string(value):
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        pass
    if formats:
        for fmt in formats:
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue
    return None


def is_valid_uuid(value: str) -> bool:
    if not is_non_empty_string(value):
        return False
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def is_positive_int(value: object) -> bool:
    if isinstance(value, bool):
        return False
    if isinstance(value, int):
        return value > 0
    if isinstance(value, str) and value.isdigit():
        return int(value) > 0
    return False


def is_valid_name(value: str) -> bool:
    if not is_non_empty_string(value):
        return False
    value = value.strip()
    # Limit length 2..100 and characters
    if not (2 <= len(value) <= 100):
        return False
    return _NAME_RE.match(value) is not None


def is_strong_password(password: str) -> bool:
    """
    Basic strong password policy:
    - at least 8 characters
    - includes lowercase, uppercase, digit
    - includes a symbol
    """
    if not is_non_empty_string(password):
        return False
    if len(password) < 8:
        return False
    has_lower = any(c.islower() for c in password)
    has_upper = any(c.isupper() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_symbol = any(not c.isalnum() for c in password)
    return has_lower and has_upper and has_digit and has_symbol


def parse_pagination(
    page: Optional[object], per_page: Optional[object], *, default_per_page: int = 20, max_per_page: int = 100
) -> Tuple[int, int, int]:
    """
    Parse common pagination parameters.
    Returns: (page, per_page, offset)
    """
    def _coerce_positive_int(value: Optional[object], default: int) -> int:
        return default if not is_positive_int(value) else int(value)  # type: ignore[arg-type]

    page_int = _coerce_positive_int(page, 1)
    per_page_int = min(_coerce_positive_int(per_page, default_per_page), max_per_page)
    offset = (page_int - 1) * per_page_int
    return page_int, per_page_int, offset


def sanitize_string(value: Optional[str]) -> str:
    """
    Trim whitespace and collapse internal whitespace to single spaces.
    Returns empty string if input is falsy.
    """
    if not value:
        return ""
    trimmed = value.strip()
    # Collapse any run of whitespace to a single space
    collapsed = re.sub(r"\s+", " ", trimmed)
    return collapsed


__all__ = [
    "is_non_empty_string",
    "is_valid_email",
    "normalize_phone",
    "is_valid_phone",
    "parse_date",
    "is_valid_date",
    "parse_datetime",
    "is_valid_uuid",
    "is_positive_int",
    "is_valid_name",
    "is_strong_password",
    "parse_pagination",
    "sanitize_string",
]

