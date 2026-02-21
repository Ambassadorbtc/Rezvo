#!/usr/bin/env python3
"""
Generate secure random secrets for Rezvo .env file
Run this before deployment to get JWT_SECRET_KEY and other secrets
"""

import secrets
import string

def generate_secret(length=64):
    """Generate a secure random string"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_hex_secret(length=32):
    """Generate a secure random hex string"""
    return secrets.token_hex(length)

print("🔐 Rezvo Secret Generator")
print("=" * 60)
print("\nCopy these into your .env file:\n")

print("# JWT Secret Key (64 characters)")
print(f"JWT_SECRET_KEY={generate_secret(64)}")
print()

print("# Alternative JWT Secret (hex, 64 characters)")
print(f"JWT_SECRET_KEY={generate_hex_secret(32)}")
print()

print("# Database encryption key (if needed)")
print(f"DB_ENCRYPTION_KEY={generate_hex_secret(32)}")
print()

print("# Session secret (if needed)")
print(f"SESSION_SECRET={generate_secret(64)}")
print()

print("\n✅ Keep these secrets safe and never commit them to git!")
print("=" * 60)
