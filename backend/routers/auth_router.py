import os
import enum
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client
from database import supabase
from auth_dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])


class UserRole(str, enum.Enum):
    FACILITY_OPERATOR = "Recycling Facility Operator"
    SUSTAINABILITY_MANAGER = "Sustainability Manager"
    MANUFACTURER = "Textile Manufacturer"
    ADMIN = "Administrator"


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
def register(data: RegisterRequest):
    if data.role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{data.role}'. Must be one of: {', '.join(VALID_ROLES)}"
        )
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")

    uid = None
    try:
        # Admin create: no email confirmation, no session change on shared client
        res = supabase.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {"username": data.username, "role": data.role},
        })
        uid = res.user.id

        supabase.table("users").insert({
            "id": uid,
            "username": data.username,
            "email": data.email,
            "role": data.role,
        }).execute()

        return {"message": "User registered successfully", "user_id": uid}
    except Exception as e:
        # Rollback: insert fail aana auth user orphan-ah nikka koodaadhu
        if uid:
            try:
                supabase.auth.admin.delete_user(uid)
            except Exception as cleanup_err:
                print(f"[REGISTER CLEANUP ERROR] {cleanup_err}")
        print(f"[REGISTER ERROR] {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(data: LoginRequest):
    url = os.environ.get("SUPABASE_URL")
    key = (
        os.environ.get("SUPABASE_ANON_KEY")
        or os.environ.get("SUPABASE_KEY")
        or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    )
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase client not configured")

    try:
        # Fresh throwaway client: shared service-role client session maaradhu
        client = create_client(url, key)
        res = client.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })
        meta = res.user.user_metadata or {}
        return {
            "access_token": res.session.access_token,
            "token_type": "bearer",
            "user": {
                "name": meta.get("username", data.email),
                "role": meta.get("role", "Administrator"),
            },
        }
    except Exception as e:
        print(f"[LOGIN ERROR] {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password")


@router.get("/roles")
def get_roles():
    return VALID_ROLES


@router.get("/users")
def get_all_users(current_user: dict = Depends(get_current_user)):
    if not supabase:
        return []
    res = supabase.table("users").select("id, username, email, role").execute()
    return res.data


@router.delete("/users/{user_id}")
def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    if user_id == current_user.get("id"):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")

    supabase.table("users").delete().eq("id", user_id).execute()

    try:
        supabase.auth.admin.delete_user(user_id)
    except Exception as e:
        print(f"Failed to delete auth user: {e}")

    return {"message": f"User #{user_id} deleted successfully"}