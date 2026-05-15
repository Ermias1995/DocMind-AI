from fastapi import Header, HTTPException
from jose import jwt
import requests
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization header",
        )

    token = authorization.split(" ")[1]

    try:
        response = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": os.getenv("SUPABASE_ANON_KEY"),
            },
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

        user = response.json()

        return user

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Authentication failed",
        )