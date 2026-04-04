import os
import secrets
from flask import Flask, render_template, redirect, request, session, url_for
from dotenv import load_dotenv
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import timedelta
import auth.auth as au

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

def _completeLogin(user_data: dict):
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

    au.sso_middleware.create_session(user_data, session, session_id)

    # Upload preferences to be reviewed

    return redirect(url_for("homepage"))

@app.route('/')
def mainPage():
    return render_template("html/landing.html")

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
            "picture": ""
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
    user = session["user"]

    return render_template("/html/home.html", user=user)

@app.route('/logged/map')
@au.sso_middleware.sso_login_required
def map():
    return render_template("/html/index.html")

@app.route("/dev/login")
def devLogin():
    if au.SSO_MODE != "dev":
        return "Not availble in production", 403

    return redirect(url_for("authLogin"))

@app.route("/photon")
@au.sso_middleware.sso_login_required
def photon():
    import requests

    params = request.args.to_dict()
    response = requests.get("http://127.0.0.1:5001/photon", params=params, timeout=5)

    return response.json(), response.status_code

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