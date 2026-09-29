from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import supabase

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token is None or not supabase:
        raise credentials_exception
    
    try:
        # Verify token with Supabase Auth
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            raise credentials_exception
        
        # Return user dict map
        return {
            "id": user_res.user.id,
            "email": user_res.user.email,
            "role": user_res.user.user_metadata.get("role", "Unknown")
        }
    except Exception as e:
        print(f"Auth error: {e}")
        raise credentials_exception

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator role required.",
        )
    return current_user
