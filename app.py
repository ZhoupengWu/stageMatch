import os
import json
import secrets
from flask import Flask, render_template, redirect, request, session, url_for
from dotenv import load_dotenv
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import timedelta
import auth.auth as au
from database import database_helper

load_dotenv()

app = Flask(
    __name__,
    static_folder="./resources",
    template_folder="./resources"
)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)
app.secret_key = os.getenv("SERVER_SECRET_KEY")
app.permanent_session_lifetime = timedelta(hours=8)

if au.SSO_MODE == "production" and not au.sso_middleware.jwt_secret:
    raise ValueError("JWT key is not configured")

if au.SSO_MODE == "production":
    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax"
    )
try:
    database_helper.init_db(os.getenv("DB_CONNECTION_STRING", "database.db"))
except Exception as e:
    app.logger.error(f"[ERROR] database initialization failed: {e}")
    raise e

def _completeLogin(user_data: dict):
    global user

    email = user_data.get("email", "")

    # Check whitelist to be reviewed

    # Check ratelimit
    session_id = secrets.token_hex(32)
    allowed, reason = au.rate_limiter.register_session(session_id, email)

    if not allowed:
        app.logger.warning(f"[WARNING] rate limit reached for {email}")

        return au.render_sso_error(
            reason,
            au.sso_middleware.portal_url,
            429,
            "Too many active sessions",
            "⏱️"
        )
    
    app.logger.info(f"[INFO] User {email} logged in with session ID: {session_id}")

    try:
        database_helper.add_user(user_data) 
    except database_helper.UserAlreadyExistsError:
        # app.logger.info(f"[INFO] User {email} already exists in the database. Not adding again.")
        database_helper.update_user(user_data)

    user = database_helper.get_user_by_id(user_data["googleId"])

    from_database_user = database_helper.model_to_dict(user)

    print(json.dumps(user_data))
    print(json.dumps(from_database_user))

    app.logger.info(f"[INFO] User info from database: {from_database_user['email']}, {from_database_user['name']}")

    au.sso_middleware.create_session(from_database_user, session, session_id)
    
    return redirect(url_for("homepage"))

@app.route('/')
def mainPage():
    return "<a href=\"/login\">vai a login</a>"

@app.route('/login')
def login():
    return redirect("/auth/login")

@app.route("/auth/login")
def authLogin():
    token: str | None = request.args.get("token")

    if au.SSO_MODE == "dev" and not token:
        dev_email: str = request.args.get("email") or au.DEV_USER_EMAIL
        app.logger.info(f"[INFO] authorised access for {dev_email}")
        user_data: dict[str, str] = {
            "email": dev_email,
            "name": au.getUsername(dev_email).replace(".", " ").title(),
            "googleId": "dev-user-id",
            "picture": None
        }

        return _completeLogin(user_data)

    if not token:
        return au.render_sso_error(
            "Missing token. Log in via the portal",
            au.sso_middleware.portal_url
        )

    try:
        user_data = au.sso_middleware.validate_jwt(token)

        return _completeLogin(user_data)
    except Exception as e:
        app.logger.error(f"[ERROR] validation is failing: {e}")

        return au.render_sso_error(
            "Token not valid or expired. Log in again",
            au.sso_middleware.portal_url
        )

@app.route("/auth/logout")
def authLogout():
    session_id: str = session.get("session_id")

    if session_id:
        au.rate_limiter.remove_session(session_id)

    session.clear()

    return redirect(au.sso_middleware.portal_url)

@app.route("/logged/homepage")
@au.sso_middleware.sso_login_required
def homepage():
    session_user = session['user']
    googleId = session_user['googleId']
    print(f"GOOGLE ID: {googleId}")
    from_database_user = database_helper.get_user_by_id(googleId)
    print("\r\n\r\n")
    print("\r\n\r\n")
    return render_template("/html/home.html", user=from_database_user)

@app.route('/logged/map')
@au.sso_middleware.sso_login_required
def map():
    return render_template("/html/index.html", user=user)

@app.route("/dev/login")
def devLogin():
    if au.SSO_MODE != "dev":
        return "Not availble in production", 403

    return redirect(url_for("authLogin"))

@app.errorhandler(404)
def notFound(e):
    return au.render_sso_error(
        "Page not found",
        au.sso_middleware.portal_url,
        404,
        "Page not found",
        "🔍"
    )

@app.errorhandler(403)
def forbidden(e):
    return au.render_sso_error(
        "Forbidden access",
        au.sso_middleware.portal_url,
        403,
        "Forbidden access",
        "🚫"
    )

if __name__ == '__main__':
    app.logger.info("[INFO] stageMatch started")
    app.logger.info(f"SSO mode: {au.SSO_MODE.upper()}")
    app.logger.info(f"SSO portal: {au.sso_middleware.portal_url}")
    app.logger.info(f"Audience JWT: {au.sso_middleware.jwt_audience}")
    app.logger.info(f"Rate limit: max {au.rate_limiter.max_sessions_per_user} per user and max {au.rate_limiter.max_sessions_global} per global")

    app.run(
        "127.0.0.1",
        int(os.getenv("PORT", 5000)),
        debug=os.getenv("DEBUG", "False").lower() == "true"
    )