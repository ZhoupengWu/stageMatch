import os
from turtle import st
from dotenv import load_dotenv
from auth.middleware.sso_middleware import SSOMiddleware, WhitelistManager, RateLimiter, render_sso_error

load_dotenv()

SSO_MODE: str = os.getenv("SSO_MODE").lower()
DEV_USER_EMAIL: str = os.getenv("DEV_USER_EMAIL").lower()

white_list_manager = WhitelistManager(
    whitelist_path=os.path.join("test") # Change the logic of uploading
)

rate_limiter = RateLimiter(
    int(os.getenv("MAX_SESSIONS_PER_USER", 3)),
    int(os.getenv("MAX_SESSIONS_GLOBAL", 100))
)

sso_middleware = SSOMiddleware(
    jwt_secret=os.getenv("JWT_SECRET"),
    jwt_audience=os.getenv("APP_AUDIENCE"),
    portal_url=os.getenv("PORTAL_URL"),
    whitelist_manager=white_list_manager,
    rate_limiter=rate_limiter
)

def getUsername(email: str) -> str:
    return email.split("@")[0]

def getName(email: str) -> str:
    return email.split(".")[0]

def getSurname(email: str) -> str:
    return email.split(".")[1]