import hashlib
import secrets


def hash_api_key(key: str) -> str:
    """Hash API key using SHA256"""
    return hashlib.sha256(key.encode()).hexdigest()


def generate_api_key() -> str:
    """Generate a new secure API key"""
    return "sk_live_" + secrets.token_urlsafe(24)
