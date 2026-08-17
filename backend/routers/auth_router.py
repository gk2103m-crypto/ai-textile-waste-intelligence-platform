from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User, UserRole
from auth import verify_password, get_password_hash, create_access_token
from auth_dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])

# All valid roles (kept in sync with UserRole enum)
VALID_ROLES = [role.value for role in UserRole]

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # GAP-05 FIX: Validate role against the allowed Enum values
    if data.role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{data.role}'. Must be one of: {', '.join(VALID_ROLES)}"
        )
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        role=data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User registered successfully", "user_id": user.id}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user.email, "role": user.role.value})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"name": user.username, "role": user.role.value}
    }

@router.get("/roles")
def get_roles():
    return [role.value for role in UserRole]

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # GAP-03 FIX: JWT auth guard added
):
    """
    Returns all registered users. Requires a valid JWT token.
    Admin-only operations (edit/delete) are performed via require_admin dependency.
    """
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "email": u.email, "role": u.role.value} for u in users]

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)  # Admin-only
):
    """Delete a user — Administrator only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()
    return {"message": f"User #{user_id} deleted successfully"}