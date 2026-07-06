import os
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import Union, Optional

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "eco_secret_key_6534_9240_fefdf5_super_long_key_for_jwt_auth_32_bytes_plus")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 hours

def hash_password(password: str) -> str:
    """Hash password using PBKDF2 HMAC SHA256."""
    salt = os.urandom(16)
    kdf = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000
    )
    return salt.hex() + ":" + kdf.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password by rebuilding the PBKDF2 hash."""
    try:
        salt_hex, key_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt,
            100000
        )
        return new_key == key
    except ValueError:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Union[dict, None]:
    """Decode and verify JWT token. Returns payload dict or None if invalid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None
