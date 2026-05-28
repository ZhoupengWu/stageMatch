import os
import sys
import secrets
import requests
from flask import Flask, render_template, redirect, request, session, url_for, jsonify
from dotenv import load_dotenv
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import timedelta
import auth.auth as au
from auth.auth_google.auth import initGoogleAuth, getGoogleUserInfo
from database import database_helper

load_dotenv()

######ADD
# Importa il middleware SSO localmente
from auth.middleware.sso_middleware import SSOMiddleware, WhitelistManager, RateLimiter, render_sso_error
#--------------------------------------------------------------------------------------------------------------

PRIVACY_POLICY_VERSION = os.getenv("PRIVACY_POLICY_VERSION")

app = Flask(
    __name__,
    static_folder="./resources",
    template_folder="./resources"
)
google = initGoogleAuth(app)
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
    db_conn = os.getenv("DB_CONNECTION_STRING", "database.db")
    db_dir = os.path.dirname(db_conn)

    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

    database_helper.initDB(db_conn)
except Exception as e:
    app.logger.error(f"[ERROR] database initialization failed: {e}")
    raise e

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

    app.logger.info(f"[INFO] User {email} logged in with session ID: {session_id}")

    au.sso_middleware.create_session(user_data, session, session_id)

    return redirect(url_for("completeLogin"))



######ADD
# ============================================
# ROUTE SSO
# ============================================

@app.route('/sso/login')
def sso_login():
    """
    Endpoint SSO - riceve il JWT dal portale, lo valida e crea la sessione
    """
    session["auth_type"] = "user"
    token = request.args.get('token')
    
    # In modalità dev, permettiamo di simulare il login tramite query parameter
    if au.SSO_MODE == 'dev' and not token:
        dev_email = request.args.get('username') or request.args.get('email') or au.DEV_USER_EMAIL
        app.logger.info(f"🔧 DEV MODE: Simulazione login SSO per {dev_email}")
        
        user_data = {
            'email': dev_email,
            'name': au.getUsername(dev_email).replace('.', ' ').title(),
            'googleId': 'dev-user-id',
            'picture': ''
        }
        return _completeLogin(user_data)

    if not token:
        return au.render_sso_error(
            "Token SSO mancante. Accedi tramite il portale SSO.",
            au.sso_middleware.portal_url
        )
    
    try:
        # Valida il JWT
        user_data = au.sso_middleware.validate_jwt(token)
        return _completeLogin(user_data)
        
    except Exception as e:
        app.logger.error(f"Errore validazione SSO: {e}")
        return au.render_sso_error(
            f"Token SSO invalido o scaduto: {str(e)}",
            au.sso_middleware.portal_url
        )


@app.route('/logout')
def logout():
    """Logout - reindirizza alla rotta di logout ufficiale"""
    return redirect(url_for('authLogout'))

#------------------------------------------------------------------------------------------------------



@app.route('/')
def mainPage():
    return render_template("html/landing.html")

@app.route('/login')
def login():
    return render_template("/html/login.html")

@app.route("/authentication")
def authentication():
    return render_template("/html/authentication.html")

@app.route("/privacy")
def privacy():
    return render_template("/html/privacy.html", privacy_version=PRIVACY_POLICY_VERSION)

@app.route("/auth/login")
def authLogin():
    session["auth_type"] = "user"
    token: str | None = request.args.get("token")

    if au.SSO_MODE == "dev" and not token:
        dev_email: str = request.args.get("email") or au.DEV_USER_EMAIL
        app.logger.info(f"[INFO] authorised access for {dev_email}")
        user_data: dict[str, str] = {
            "email": dev_email,
            "name": au.getUsername(dev_email),
            "googleId": "dev-user-id",
            "picture": "DEV"
        }
        print(user_data)

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

@app.route("/auth/google/login")
def googleLogin():
    redirect_uri = url_for("googleCallback", _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route("/auth/google/callback")
def googleCallback():
    try:
        user_data = getGoogleUserInfo()
        print(user_data)
        if not user_data:
            return au.render_sso_error(
                "Impossibile recuperare i dati utente da Google.",
                au.sso_middleware.portal_url
            )

        return _completeLogin(user_data)
    except Exception as e:
        app.logger.error(f"[ERROR] Google callback failed: {e}")
        return au.render_sso_error(
            "Autenticazione Google fallita.",
            au.sso_middleware.portal_url
        )

@app.route("/auth/logout")
def authLogout():
    session_id: str = session.get("session_id")

    if session_id:
        au.rate_limiter.remove_session(session_id)

    session.clear()

    return redirect(au.sso_middleware.portal_url)

@app.route("/auth/company/login", methods=["GET", "POST"])
def authCompanyLogin():
    if request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dati invalidi"}), 400

        # Memorizziamo temporaneamente i dati di registrazione per associarli all'account Google nel callback
        session["pending_company_data"] = data
        session["auth_type"] = "company"
        return jsonify({"message": "Dati ricevuti, procedi con l'autenticazione"}), 200

    # Se è GET, impostiamo il tipo di autenticazione e reindirizziamo a Google
    session["auth_type"] = "company"
    return redirect(url_for("googleLogin"))

@app.route("/logged/complete", methods=["GET", "POST"])
@au.sso_middleware.sso_login_required
def completeLogin():
    user = session["user"]
    auth_type = session.get("auth_type")

    # Gestione specifica per le aziende
    if auth_type == "company":
        if database_helper.existCompany(user["googleId"]):
            return redirect(url_for("homepageCompany"))

        pending_data = session.get("pending_company_data")
        if pending_data:
            company_data = {
                "googleId": user["googleId"],
                "name": pending_data["name"],
                "email": user["email"],
                "access_code": pending_data["access_code"],
                "address": f"{pending_data['via']} ££ {pending_data['civico']} ££ {pending_data['cap']} ££ {pending_data['citta']}",
                "picture": user["picture"]
            }
            database_helper.addCompany(company_data)
            session.pop("pending_company_data", None)
            return redirect(url_for("homepageCompany"))
        else:
            return au.render_sso_error(
                "Azienda non registrata. Torna alla pagina di registrazione.",
                url_for("authentication")
            )

    if database_helper.existUser(user["googleId"]):
        return redirect(url_for("homepage"))

    if request.method == "POST":
        data = request.form.to_dict()

        if data.get("privacy_ack") != "on":
            return jsonify({
                "error": "Devi prendere visione dell'informativa privacy prima di continuare."
            }), 400

        if data.get("privacy_version") != PRIVACY_POLICY_VERSION:
            return jsonify({
                "error": "Informativa privacy non aggiornata. Ricarica la pagina e riprova."
            }), 400

        user_data = {
            "googleId": user["googleId"],
            "name": au.getName(user["email"]),
            "surname": au.getSurname(user["email"]),
            "email": user["email"],
            "data_nascita": data["data_nascita"],
            "sesso": data["sesso"],
            "comune_nascita": data["comune_nascita"],
            "codice_fiscale": data["codice_fiscale"],
            "telefono": data["telefono"],
            "indirizzo_studio": data["indirizzo_studio"],
            "classe": data["classe"],
            "indirizzo": f"{data['via']} ££ {data['civico']} ££ {data['cap']} ££ {data['citta_residenza']}",
            "picture": user["picture"]
        }

        database_helper.addUser(
            user_data,
            privacy_consent={
                "privacy_version": PRIVACY_POLICY_VERSION
            }
        )

        return redirect(url_for("homepage"))

    user_data = {
        "name": au.getName(user["email"]),
        "surname": au.getSurname(user["email"]),
        "email": user["email"]
    }

    return render_template("/html/complete_login.html", user=user_data, privacy_version=PRIVACY_POLICY_VERSION)

@app.route("/logged/homepage")
@au.sso_middleware.sso_login_required
def homepage():
    user = session["user"]
    data = database_helper.getUserById(user["googleId"])
    user_data = database_helper.modelToDict(data)
    user_data["indirizzo"] = [dato.strip() for dato in user_data["indirizzo"].split("££")]

    return render_template("/html/home.html", user=user_data)

@app.route("/logged/company/homepage")
@au.sso_middleware.sso_login_required
def homepageCompany():
    user = session["user"]
    data = database_helper.getCompanyByGoogleId(user["googleId"])
    if not data:
        return au.render_sso_error(
            "Azienda non trovata.",
            url_for("authentication")
        )
    company_data = database_helper.modelToDict(data)
    return render_template("/html/home_company.html", company=company_data)

@app.route('/logged/map')
@au.sso_middleware.sso_login_required
def map():
    return render_template("/html/index.html")

@app.route("/dev/login")
def devLogin():
    if au.SSO_MODE != "dev":
        return "Not availble in production", 403

    return redirect(url_for("authLogin"))

@app.route("/api/users/profile")
@au.sso_middleware.sso_login_required
def getUserProfile():
    id = session["user"]["googleId"]
    data = database_helper.getUserById(id)

    return database_helper.modelToDict(data)

@app.route("/api/users/profile/save", methods=["POST"])
@au.sso_middleware.sso_login_required
def saveProfile():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        session_user = session["user"]
        data["googleId"] = session_user["googleId"]

        database_helper.updateUser(data)
        updated_user = database_helper.getUserById(session_user["googleId"])

        if not updated_user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "message": "Profile updated",
            "user": database_helper.modelToDict(updated_user)
        }), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        app.logger.exception("[ERROR] profile save endpoint failed")

        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/users/routes")
def getUserRoutes():
    user = session["user"]
    data = database_helper.getUserById(user["googleId"])
    user_data = database_helper.modelToDict(data)
    routes = user_data["routes"]
    print(routes)

    return jsonify(routes)

@app.route("/api/data", methods=["GET", "POST"])
def getAndSendData():
    pass

@app.route("/photon", methods=["POST"])
@au.sso_middleware.sso_login_required
def photon():
    params = request.get_json()
    api_url = os.getenv("API_URL", "http://127.0.0.1:5001")
    response = requests.get(f"{api_url}/photon", params=params, timeout=5)

    return response.json(), response.status_code

@app.route("/routejson", methods=["POST"])
@au.sso_middleware.sso_login_required
def routejson():
    user = session["user"]
    params = request.get_json()
    print(params)
    data = dict(params)
    print(data)
    database_helper.addUserRoute(user["googleId"], data)
    print(data)
    api_url = os.getenv("API_URL", "http://127.0.0.1:5001")
    response = requests.get(f"{api_url}/routejson", params=params, timeout=5)

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
        os.getenv("HOST", "127.0.0.1"),
        int(os.getenv("PORT", 5000)),
        debug=os.getenv("DEBUG", "False").lower() == "true"
    )