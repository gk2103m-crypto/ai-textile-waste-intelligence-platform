from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import supabase
from auth_dependencies import get_current_user, require_admin
import enum

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
        
    try:
        # Supabase Auth Sign Up
        res = supabase.auth.sign_up({
            "email": data.email, 
            "password": data.password,
            "options": {
                "data": {
                    "username": data.username,
                    "role": data.role
                }
            }
        })
        
        # Insert into public users table for easy querying
        if res.user:
            user_data = {
                "id": res.user.id,
                "username": data.username,
                "email": data.email,
                "role": data.role
            }
            supabase.table("users").insert(user_data).execute()
        
        return {"message": "User registered successfully", "user_id": res.user.id if res.user else None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(data: LoginRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")
        
    try:
        res = supabase.auth.sign_in_with_password({
            "email": data.email, 
            "password": data.password
        })
        
        user_meta = res.user.user_metadata
        return {
            "access_token": res.session.access_token,
            "token_type": "bearer",
            "user": {"name": user_meta.get("username", data.email), "role": user_meta.get("role", "Administrator")}
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")

@router.get("/roles")
def get_roles():
    return VALID_ROLES

@router.get("/users")
def get_all_users(current_user: dict = Depends(get_current_user)):
    if not supabase:
        return []
    res = supabase.table("users").select("*").execute()
    return res.data

@router.delete("/users/{user_id}")
def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    if user_id == current_user.get("id"):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")
        
    supabase.table("users").delete().eq("id", user_id).execute()
    
    # Optional: Delete from auth.users (requires service_role key to be used in client)
    try:
        supabase.auth.admin.delete_user(user_id)
    except Exception as e:
        print(f"Failed to delete auth user: {e}")
        
    return {"message": f"User #{user_id} deleted successfully"}